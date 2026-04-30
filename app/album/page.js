'use client'
import { useEffect, useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import Cookies from 'js-cookie'
import Link from 'next/link'

const GRUPOS = [
  {n:'A',cor:'#E8175D',bg:'#2d0a12',p:[{n:'México',c:'MEX',f:'mx'},{n:'África do Sul',c:'RSA',f:'za'},{n:'Coreia do Sul',c:'KOR',f:'kr'},{n:'Rep. Tcheca',c:'CZE',f:'cz'}]},
  {n:'B',cor:'#6B2FFA',bg:'#1a0d2d',p:[{n:'Canadá',c:'CAN',f:'ca'},{n:'Bósnia',c:'BIH',f:'ba'},{n:'Catar',c:'QAT',f:'qa'},{n:'Suíça',c:'SUI',f:'ch'}]},
  {n:'C',cor:'#00C9B1',bg:'#002d28',p:[{n:'Brasil',c:'BRA',f:'br'},{n:'Marrocos',c:'MAR',f:'ma'},{n:'Haiti',c:'HAI',f:'ht'},{n:'Escócia',c:'SCO',f:'gb-sct'}]},
  {n:'D',cor:'#FF6B00',bg:'#2d1500',p:[{n:'EUA',c:'USA',f:'us'},{n:'Paraguai',c:'PAR',f:'py'},{n:'Austrália',c:'AUS',f:'au'},{n:'Turquia',c:'TUR',f:'tr'}]},
  {n:'E',cor:'#1A56DB',bg:'#0a1628',p:[{n:'Alemanha',c:'GER',f:'de'},{n:'Curaçao',c:'CUW',f:'cw'},{n:'Costa do Marfim',c:'CIV',f:'ci'},{n:'Equador',c:'ECU',f:'ec'}]},
  {n:'F',cor:'#22C55E',bg:'#002d14',p:[{n:'Holanda',c:'NED',f:'nl'},{n:'Japão',c:'JPN',f:'jp'},{n:'Suécia',c:'SWE',f:'se'},{n:'Tunísia',c:'TUN',f:'tn'}]},
  {n:'G',cor:'#F5C518',bg:'#2d2500',p:[{n:'Bélgica',c:'BEL',f:'be'},{n:'Egito',c:'EGY',f:'eg'},{n:'Irã',c:'IRN',f:'ir'},{n:'Nova Zelândia',c:'NZL',f:'nz'}]},
  {n:'H',cor:'#E8175D',bg:'#2d0a12',p:[{n:'Espanha',c:'ESP',f:'es'},{n:'Cabo Verde',c:'CPV',f:'cv'},{n:'Arábia Saudita',c:'KSA',f:'sa'},{n:'Uruguai',c:'URU',f:'uy'}]},
  {n:'I',cor:'#6B2FFA',bg:'#1a0d2d',p:[{n:'França',c:'FRA',f:'fr'},{n:'Senegal',c:'SEN',f:'sn'},{n:'Iraque',c:'IRQ',f:'iq'},{n:'Noruega',c:'NOR',f:'no'}]},
  {n:'J',cor:'#00C9B1',bg:'#002d28',p:[{n:'Argentina',c:'ARG',f:'ar'},{n:'Argélia',c:'ALG',f:'dz'},{n:'Áustria',c:'AUT',f:'at'},{n:'Jordânia',c:'JOR',f:'jo'}]},
  {n:'K',cor:'#FF6B00',bg:'#2d1500',p:[{n:'Portugal',c:'POR',f:'pt'},{n:'RD Congo',c:'COD',f:'cd'},{n:'Uzbequistão',c:'UZB',f:'uz'},{n:'Colômbia',c:'COL',f:'co'}]},
  {n:'L',cor:'#1A56DB',bg:'#0a1628',p:[{n:'Inglaterra',c:'ENG',f:'gb-eng'},{n:'Croácia',c:'CRO',f:'hr'},{n:'Gana',c:'GHA',f:'gh'},{n:'Panamá',c:'PAN',f:'pa'}]},
]

const API = process.env.NEXT_PUBLIC_API_URL

export default function Album() {
  const router = useRouter()
  const [stickers, setStickers] = useState({})
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [toast, setToast] = useState(null)
  const [pendingUpdates, setPendingUpdates] = useState([])
  const [modal, setModal] = useState(null) // {pais, grupo}
  const scrollRef = useRef(null)

  useEffect(() => {
    const token = Cookies.get('token')
    if (!token) { router.push('/login'); return }
    loadAlbum(token)
  }, [])

  useEffect(() => {
    if (pendingUpdates.length === 0) return
    const timer = setTimeout(() => saveToBank(), 2000)
    return () => clearTimeout(timer)
  }, [pendingUpdates])

  async function loadAlbum(token) {
    try {
      const res = await fetch(`${API}/api/album`, { headers: { Authorization: `Bearer ${token}` } })
      if (!res.ok) throw new Error()
      const data = await res.json()
      const map = {}
      data.stickers?.forEach(s => { map[s.sticker.code] = s.status })
      setStickers(map)
    } catch {
      const saved = localStorage.getItem('fwc26_album')
      if (saved) setStickers(JSON.parse(saved))
    } finally { setLoading(false) }
  }

  async function saveToBank() {
    const token = Cookies.get('token')
    if (!token || pendingUpdates.length === 0) return
    setSaving(true)
    try {
      await fetch(`${API}/api/album/stickers`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ updates: pendingUpdates })
      })
      setPendingUpdates([])
    } catch {} finally { setSaving(false) }
  }

  function togStk(code) {
    const cur = stickers[code] || 'MISSING'
    const next = cur === 'MISSING' ? 'HAVE' : cur === 'HAVE' ? 'REPEATED' : 'MISSING'
    const updated = {...stickers, [code]: next}
    setStickers(updated)
    localStorage.setItem('fwc26_album', JSON.stringify(updated))
    setPendingUpdates(prev => [...prev.filter(u => u.stickerCode !== code), {stickerCode: code, status: next, quantity: next === 'REPEATED' ? 2 : 1}])
    setToast(next === 'HAVE' ? '✓ Tenho!' : next === 'REPEATED' ? '2× Repetida!' : 'Removida')
    setTimeout(() => setToast(null), 1200)
  }

  const total = GRUPOS.reduce((a,g) => a + g.p.length * 20, 0)
  const have = Object.values(stickers).filter(s => s==='HAVE'||s==='REPEATED').length
  const pct = Math.round((have/total)*100)

  if (loading) return (
    <div style={{minHeight:'100vh',background:'#050a0f',display:'flex',alignItems:'center',justifyContent:'center'}}>
      <div style={{textAlign:'center'}}>
        <div style={{fontSize:'72px',fontWeight:'900',color:'white',fontFamily:'Barlow Condensed',lineHeight:'1'}}>2<span style={{color:'#F5C518'}}>6</span></div>
        <div style={{fontSize:'13px',letterSpacing:'3px',color:'rgba(255,255,255,0.4)',marginTop:'8px',fontFamily:'Barlow Condensed',fontWeight:'700'}}>CARREGANDO...</div>
      </div>
    </div>
  )

  return (
    <div style={{minHeight:'100vh',background:'#050a0f',color:'white',fontFamily:'Barlow',overflowX:'hidden'}}>

      {/* TOAST */}
      {toast && (
        <div style={{position:'fixed',bottom:'80px',left:'50%',transform:'translateX(-50%)',background:'rgba(20,20,20,0.95)',border:'1px solid rgba(255,255,255,0.15)',color:'white',padding:'8px 20px',borderRadius:'99px',fontSize:'13px',fontWeight:'700',zIndex:1000,whiteSpace:'nowrap',backdropFilter:'blur(10px)'}}>
          {toast}
        </div>
      )}

      {/* HEADER FIXO */}
      <div style={{position:'fixed',top:0,left:0,right:0,zIndex:100,background:'rgba(5,10,15,0.85)',backdropFilter:'blur(16px)',borderBottom:'1px solid rgba(255,255,255,0.06)'}}>
        <div style={{height:'3px',background:'linear-gradient(90deg,#E8175D,#FF6B00,#F5C518,#22C55E,#00C9B1,#1A56DB,#6B2FFA)'}}/>
        <div style={{padding:'10px 16px',display:'flex',alignItems:'center',gap:'12px',maxWidth:'700px',margin:'0 auto'}}>
          <Link href="/dashboard" style={{color:'rgba(255,255,255,0.4)',fontSize:'13px',textDecoration:'none'}}>← Voltar</Link>
          <div style={{flex:1,textAlign:'center'}}>
            <span style={{fontFamily:'Barlow Condensed',fontSize:'16px',fontWeight:'900',letterSpacing:'2px',color:'white'}}>MEU <span style={{color:'#F5C518'}}>ÁLBUM</span></span>
          </div>
          <div style={{fontSize:'11px',color:saving?'#F5C518':'rgba(255,255,255,0.3)',fontWeight:'700'}}>
            {saving ? '💾' : '✓'}
          </div>
        </div>
      </div>

      {/* HERO */}
      <div style={{paddingTop:'52px',background:'linear-gradient(180deg,#0a1628,#050a0f)',padding:'80px 16px 32px',textAlign:'center',position:'relative',overflow:'hidden'}}>
        <div style={{position:'absolute',top:'-40px',left:'50%',transform:'translateX(-50%)',fontFamily:'Barlow Condensed',fontSize:'240px',fontWeight:'900',color:'rgba(255,255,255,0.025)',lineHeight:'1',pointerEvents:'none',userSelect:'none'}}>26</div>
        <div style={{position:'relative',zIndex:1}}>
          <div style={{fontFamily:'Barlow Condensed',fontSize:'11px',fontWeight:'700',letterSpacing:'4px',color:'rgba(255,255,255,0.4)',marginBottom:'6px'}}>PANINI OFICIAL · FIFA WORLD CUP</div>
          <div style={{fontFamily:'Barlow Condensed',fontSize:'80px',fontWeight:'900',lineHeight:'.85',color:'white',letterSpacing:'-4px',marginBottom:'16px'}}>
            2<span style={{color:'#F5C518'}}>6</span>
          </div>
          {/* PROGRESS */}
          <div style={{maxWidth:'300px',margin:'0 auto'}}>
            <div style={{display:'flex',justifyContent:'space-between',fontSize:'11px',color:'rgba(255,255,255,0.4)',marginBottom:'5px'}}>
              <span>{have}/{total}</span>
              <span style={{color:'#F5C518',fontWeight:'700'}}>{pct}%</span>
            </div>
            <div style={{height:'6px',background:'rgba(255,255,255,0.08)',borderRadius:'99px',overflow:'hidden',marginBottom:'14px'}}>
              <div style={{height:'100%',width:`${pct}%`,background:'linear-gradient(90deg,#E8175D,#F5C518)',borderRadius:'99px',transition:'width .5s'}}/>
            </div>
            <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:'8px'}}>
              {[['TENHO',have,'#22C55E'],['REPETIDAS',Object.values(stickers).filter(s=>s==='REPEATED').length,'#F5C518'],['FALTAM',total-have,'#E8175D']].map(([l,v,c])=>(
                <div key={l} style={{background:'rgba(255,255,255,0.05)',borderRadius:'10px',padding:'10px 6px',border:'1px solid rgba(255,255,255,0.06)'}}>
                  <div style={{fontFamily:'Barlow Condensed',fontSize:'24px',fontWeight:'900',color:c}}>{v}</div>
                  <div style={{fontSize:'9px',color:'rgba(255,255,255,0.4)',letterSpacing:'1px',fontWeight:'700',marginTop:'2px'}}>{l}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* GRUPOS COM PARALLAX */}
      <div style={{maxWidth:'700px',margin:'0 auto',padding:'0 0 40px'}}>
        {GRUPOS.map((g, gi) => {
          const grpHave = g.p.reduce((a,p) => {
            for(let i=1;i<=20;i++){const s=stickers[`${p.c}_${String(i).padStart(2,'0')}`];if(s==='HAVE'||s==='REPEATED')a++}
            return a
          }, 0)
          const grpTotal = g.p.length * 20

          return (
            <div key={gi} style={{position:'relative',marginBottom:'0'}}>
              {/* PARALLAX SECTION HEADER */}
              <div style={{
                background:`linear-gradient(135deg,${g.bg},${g.cor}33,${g.bg})`,
                borderTop:`1px solid ${g.cor}33`,
                borderBottom:`1px solid ${g.cor}22`,
                padding:'24px 20px',
                position:'relative',
                overflow:'hidden'
              }}>
                {/* BG number */}
                <div style={{position:'absolute',right:'-10px',top:'-20px',fontFamily:'Barlow Condensed',fontSize:'160px',fontWeight:'900',color:`${g.cor}15`,lineHeight:'1',pointerEvents:'none',userSelect:'none'}}>{g.n}</div>

                <div style={{position:'relative',zIndex:1}}>
                  <div style={{display:'flex',alignItems:'center',gap:'12px',marginBottom:'16px'}}>
                    <div style={{width:'44px',height:'44px',borderRadius:'12px',background:`linear-gradient(135deg,${g.cor},${g.cor}88)`,display:'flex',alignItems:'center',justifyContent:'center',fontFamily:'Barlow Condensed',fontSize:'22px',fontWeight:'900',color:'white',boxShadow:`0 4px 16px ${g.cor}44`,flexShrink:0}}>
                      {g.n}
                    </div>
                    <div style={{flex:1}}>
                      <div style={{fontFamily:'Barlow Condensed',fontSize:'20px',fontWeight:'900',letterSpacing:'1px',color:'white'}}>GRUPO {g.n}</div>
                      <div style={{fontSize:'11px',color:'rgba(255,255,255,0.4)'}}>{grpHave}/{grpTotal} figurinhas · {Math.round((grpHave/grpTotal)*100)}%</div>
                    </div>
                    {/* MINI PROGRESS */}
                    <div style={{width:'48px',height:'48px',position:'relative',flexShrink:0}}>
                      <svg viewBox="0 0 36 36" style={{width:'48px',height:'48px',transform:'rotate(-90deg)'}}>
                        <circle cx="18" cy="18" r="15.9" fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="3"/>
                        <circle cx="18" cy="18" r="15.9" fill="none" stroke={g.cor} strokeWidth="3"
                          strokeDasharray={`${Math.round((grpHave/grpTotal)*100)} 100`}
                          strokeLinecap="round"/>
                      </svg>
                      <div style={{position:'absolute',inset:0,display:'flex',alignItems:'center',justifyContent:'center',fontFamily:'Barlow Condensed',fontSize:'11px',fontWeight:'900',color:g.cor}}>
                        {Math.round((grpHave/grpTotal)*100)}%
                      </div>
                    </div>
                  </div>

                  {/* PAÍSES — clicáveis */}
                  <div style={{display:'grid',gridTemplateColumns:'repeat(2,1fr)',gap:'8px'}}>
                    {g.p.map(p => {
                      const pHave = Array.from({length:20}).filter((_,i)=>{
                        const s=stickers[`${p.c}_${String(i+1).padStart(2,'0')}`]
                        return s==='HAVE'||s==='REPEATED'
                      }).length

                      return (
                        <div key={p.c} onClick={() => setModal({pais:p, grupo:g})}
                          style={{background:'rgba(255,255,255,0.06)',border:`1px solid ${g.cor}33`,borderRadius:'12px',padding:'12px',cursor:'pointer',display:'flex',alignItems:'center',gap:'10px',transition:'all .15s',backdropFilter:'blur(4px)'}}>
                          <img src={`https://flagcdn.com/w80/${p.f}.png`}
                            style={{width:'44px',height:'30px',borderRadius:'6px',objectFit:'cover',border:`2px solid ${g.cor}44`,boxShadow:`0 2px 8px rgba(0,0,0,0.4)`,flexShrink:0}}/>
                          <div style={{flex:1,overflow:'hidden'}}>
                            <div style={{fontFamily:'Barlow Condensed',fontSize:'14px',fontWeight:'700',letterSpacing:'.3px',whiteSpace:'nowrap',overflow:'hidden',textOverflow:'ellipsis'}}>{p.n}</div>
                            <div style={{display:'flex',alignItems:'center',gap:'4px',marginTop:'3px'}}>
                              <div style={{flex:1,height:'3px',background:'rgba(255,255,255,0.1)',borderRadius:'99px',overflow:'hidden'}}>
                                <div style={{height:'100%',width:`${Math.round((pHave/20)*100)}%`,background:g.cor,borderRadius:'99px'}}/>
                              </div>
                              <span style={{fontSize:'9px',color:'rgba(255,255,255,0.5)',fontWeight:'700',flexShrink:0}}>{pHave}/20</span>
                            </div>
                          </div>
                          <div style={{color:`${g.cor}`,fontSize:'16px',flexShrink:0}}>›</div>
                        </div>
                      )
                    })}
                  </div>
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {/* MODAL DE FIGURINHAS */}
      {modal && (
        <div style={{position:'fixed',inset:0,background:'rgba(0,0,0,0.85)',zIndex:200,display:'flex',alignItems:'flex-end',backdropFilter:'blur(8px)'}}
          onClick={(e) => { if(e.target===e.currentTarget) setModal(null) }}>
          <div style={{width:'100%',maxWidth:'700px',margin:'0 auto',background:`linear-gradient(180deg,${modal.grupo.bg},#0a0a0a)`,borderRadius:'20px 20px 0 0',border:`1px solid ${modal.grupo.cor}44`,borderBottom:'none',maxHeight:'80vh',display:'flex',flexDirection:'column'}}>
            {/* MODAL HEADER */}
            <div style={{padding:'16px 20px',borderBottom:`1px solid ${modal.grupo.cor}22`,display:'flex',alignItems:'center',gap:'12px',flexShrink:0}}>
              <img src={`https://flagcdn.com/w80/${modal.pais.f}.png`}
                style={{width:'52px',height:'35px',borderRadius:'8px',objectFit:'cover',border:`2px solid ${modal.grupo.cor}`,boxShadow:`0 4px 12px ${modal.grupo.cor}44`,flexShrink:0}}/>
              <div style={{flex:1}}>
                <div style={{fontFamily:'Barlow Condensed',fontSize:'22px',fontWeight:'900',letterSpacing:'.5px'}}>{modal.pais.n}</div>
                <div style={{fontSize:'11px',color:'rgba(255,255,255,0.4)'}}>
                  Grupo {modal.grupo.n} · {Array.from({length:20}).filter((_,i)=>{const s=stickers[`${modal.pais.c}_${String(i+1).padStart(2,'0')}`];return s==='HAVE'||s==='REPEATED'}).length}/20 figurinhas
                </div>
              </div>
              <button onClick={() => setModal(null)}
                style={{width:'32px',height:'32px',borderRadius:'50%',background:'rgba(255,255,255,0.1)',border:'none',color:'white',fontSize:'16px',cursor:'pointer',display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0}}>✕</button>
            </div>

            {/* LEGENDA */}
            <div style={{padding:'10px 20px 6px',display:'flex',gap:'12px',fontSize:'10px',color:'rgba(255,255,255,0.4)',flexShrink:0}}>
              <span>⬜ Falta</span>
              <span style={{color:modal.grupo.cor}}>■ Tenho</span>
              <span style={{color:'#F5C518'}}>■ Repetida</span>
              <span style={{marginLeft:'auto'}}>Toque para marcar</span>
            </div>

            {/* GRID DE FIGURINHAS */}
            <div style={{overflowY:'auto',padding:'8px 20px 24px'}}>
              <div style={{display:'grid',gridTemplateColumns:'repeat(5,1fr)',gap:'8px'}}>
                {Array.from({length:20}, (_, i) => {
                  const code = `${modal.pais.c}_${String(i+1).padStart(2,'0')}`
                  const st = stickers[code] || 'MISSING'
                  const isHave = st === 'HAVE'
                  const isRep = st === 'REPEATED'
                  const isSpec = i >= 18

                  return (
                    <div key={i} onClick={() => togStk(code)}
                      style={{
                        borderRadius:'12px',
                        padding:'12px 8px',
                        display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',
                        cursor:'pointer',userSelect:'none',transition:'all .15s',
                        position:'relative',overflow:'hidden',
                        background: isHave ? `linear-gradient(135deg,${modal.grupo.cor},${modal.grupo.cor}88)` : isRep ? 'linear-gradient(135deg,#C9A84C,#F5C518)' : isSpec ? 'rgba(201,168,76,0.08)' : 'rgba(255,255,255,0.05)',
                        border: `2px solid ${isHave ? modal.grupo.cor : isRep ? '#C9A84C' : isSpec ? 'rgba(201,168,76,0.3)' : 'rgba(255,255,255,0.08)'}`,
                        boxShadow: isHave ? `0 4px 12px ${modal.grupo.cor}44` : isRep ? '0 4px 12px rgba(201,168,76,0.3)' : 'none',
                        transform: isHave || isRep ? 'scale(1.02)' : 'scale(1)'
                      }}>
                      {/* Brilhante badge */}
                      {isSpec && !isHave && !isRep && (
                        <div style={{position:'absolute',top:'4px',right:'4px',fontSize:'8px'}}>⭐</div>
                      )}
                      {/* Número */}
                      <div style={{fontFamily:'Barlow Condensed',fontSize:'22px',fontWeight:'900',color: isHave ? 'white' : isRep ? '#0a0a0a' : 'rgba(255,255,255,0.3)',lineHeight:'1',marginBottom:'4px'}}>
                        {i+1}
                      </div>
                      {/* Código */}
                      <div style={{fontSize:'9px',fontWeight:'700',letterSpacing:'.5px',color: isHave ? 'rgba(255,255,255,0.7)' : isRep ? 'rgba(0,0,0,0.5)' : 'rgba(255,255,255,0.2)'}}>
                        {modal.pais.c}
                      </div>
                      {/* Status */}
                      <div style={{fontSize:'14px',marginTop:'4px'}}>
                        {isHave ? '✓' : isRep ? '2×' : ''}
                      </div>
                      {/* Badge repetida */}
                      {isRep && (
                        <div style={{position:'absolute',top:'-1px',right:'-1px',background:'#E8175D',color:'white',fontSize:'7px',fontWeight:'900',width:'16px',height:'16px',borderRadius:'50%',display:'flex',alignItems:'center',justifyContent:'center'}}>2</div>
                      )}
                    </div>
                  )
                })}
              </div>

              {/* AÇÕES RÁPIDAS */}
              <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'8px',marginTop:'16px'}}>
                <button onClick={() => {
                  const updates = {}
                  for(let i=1;i<=20;i++) { updates[`${modal.pais.c}_${String(i).padStart(2,'0')}`] = 'HAVE' }
                  setStickers(prev => ({...prev,...updates}))
                  Object.entries(updates).forEach(([code,status]) => {
                    setPendingUpdates(prev => [...prev.filter(u=>u.stickerCode!==code), {stickerCode:code,status,quantity:1}])
                  })
                  localStorage.setItem('fwc26_album', JSON.stringify({...stickers,...updates}))
                  setToast('Todas marcadas como TENHO!')
                  setTimeout(()=>setToast(null),2000)
                }}
                  style={{padding:'10px',background:`${modal.grupo.cor}22`,border:`1px solid ${modal.grupo.cor}44`,borderRadius:'10px',color:modal.grupo.cor,fontFamily:'Barlow Condensed',fontSize:'13px',fontWeight:'700',cursor:'pointer',letterSpacing:'.5px'}}>
                  ✓ MARCAR TODAS
                </button>
                <button onClick={() => {
                  const updates = {}
                  for(let i=1;i<=20;i++) { updates[`${modal.pais.c}_${String(i).padStart(2,'0')}`] = 'MISSING' }
                  setStickers(prev => ({...prev,...updates}))
                  Object.entries(updates).forEach(([code]) => {
                    setPendingUpdates(prev => [...prev.filter(u=>u.stickerCode!==code), {stickerCode:code,status:'MISSING',quantity:0}])
                  })
                  localStorage.setItem('fwc26_album', JSON.stringify({...stickers,...updates}))
                  setToast('Todas removidas!')
                  setTimeout(()=>setToast(null),2000)
                }}
                  style={{padding:'10px',background:'rgba(255,255,255,0.05)',border:'1px solid rgba(255,255,255,0.1)',borderRadius:'10px',color:'rgba(255,255,255,0.5)',fontFamily:'Barlow Condensed',fontSize:'13px',fontWeight:'700',cursor:'pointer'}}>
                  ✕ LIMPAR TUDO
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
