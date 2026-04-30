'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Cookies from 'js-cookie'
import Link from 'next/link'

const GRUPOS = [
  {n:'A',p:[{n:'México',c:'MEX',f:'mx'},{n:'África do Sul',c:'RSA',f:'za'},{n:'Coreia do Sul',c:'KOR',f:'kr'},{n:'Rep. Tcheca',c:'CZE',f:'cz'}]},
  {n:'B',p:[{n:'Canadá',c:'CAN',f:'ca'},{n:'Bósnia',c:'BIH',f:'ba'},{n:'Catar',c:'QAT',f:'qa'},{n:'Suíça',c:'SUI',f:'ch'}]},
  {n:'C',p:[{n:'Brasil',c:'BRA',f:'br'},{n:'Marrocos',c:'MAR',f:'ma'},{n:'Haiti',c:'HAI',f:'ht'},{n:'Escócia',c:'SCO',f:'gb-sct'}]},
  {n:'D',p:[{n:'EUA',c:'USA',f:'us'},{n:'Paraguai',c:'PAR',f:'py'},{n:'Austrália',c:'AUS',f:'au'},{n:'Turquia',c:'TUR',f:'tr'}]},
  {n:'E',p:[{n:'Alemanha',c:'GER',f:'de'},{n:'Curaçao',c:'CUW',f:'cw'},{n:'Costa do Marfim',c:'CIV',f:'ci'},{n:'Equador',c:'ECU',f:'ec'}]},
  {n:'F',p:[{n:'Holanda',c:'NED',f:'nl'},{n:'Japão',c:'JPN',f:'jp'},{n:'Suécia',c:'SWE',f:'se'},{n:'Tunísia',c:'TUN',f:'tn'}]},
  {n:'G',p:[{n:'Bélgica',c:'BEL',f:'be'},{n:'Egito',c:'EGY',f:'eg'},{n:'Irã',c:'IRN',f:'ir'},{n:'Nova Zelândia',c:'NZL',f:'nz'}]},
  {n:'H',p:[{n:'Espanha',c:'ESP',f:'es'},{n:'Cabo Verde',c:'CPV',f:'cv'},{n:'Arábia Saudita',c:'KSA',f:'sa'},{n:'Uruguai',c:'URU',f:'uy'}]},
  {n:'I',p:[{n:'França',c:'FRA',f:'fr'},{n:'Senegal',c:'SEN',f:'sn'},{n:'Iraque',c:'IRQ',f:'iq'},{n:'Noruega',c:'NOR',f:'no'}]},
  {n:'J',p:[{n:'Argentina',c:'ARG',f:'ar'},{n:'Argélia',c:'ALG',f:'dz'},{n:'Áustria',c:'AUT',f:'at'},{n:'Jordânia',c:'JOR',f:'jo'}]},
  {n:'K',p:[{n:'Portugal',c:'POR',f:'pt'},{n:'RD Congo',c:'COD',f:'cd'},{n:'Uzbequistão',c:'UZB',f:'uz'},{n:'Colômbia',c:'COL',f:'co'}]},
  {n:'L',p:[{n:'Inglaterra',c:'ENG',f:'gb-eng'},{n:'Croácia',c:'CRO',f:'hr'},{n:'Gana',c:'GHA',f:'gh'},{n:'Panamá',c:'PAN',f:'pa'}]},
]

const GC=['#E8175D','#6B2FFA','#00C9B1','#FF6B00','#1A56DB','#22C55E','#F5C518','#E8175D','#6B2FFA','#00C9B1','#FF6B00','#1A56DB']
const COLORS=['#E8175D','#FF6B00','#F5C518','#22C55E','#00C9B1','#1A56DB','#6B2FFA']
const API = process.env.NEXT_PUBLIC_API_URL

export default function Album() {
  const router = useRouter()
  const [stickers, setStickers] = useState({})
  const [openGrp, setOpenGrp] = useState(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [toast, setToast] = useState(null)
  const [pendingUpdates, setPendingUpdates] = useState([])

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

  function togStk(cod, num) {
    const key = `${cod}_${String(num).padStart(2,'0')}`
    const cur = stickers[key] || 'MISSING'
    const next = cur === 'MISSING' ? 'HAVE' : cur === 'HAVE' ? 'REPEATED' : 'MISSING'
    const updated = {...stickers, [key]: next}
    setStickers(updated)
    localStorage.setItem('fwc26_album', JSON.stringify(updated))
    setPendingUpdates(prev => [...prev.filter(u=>u.stickerCode!==key), {stickerCode:key, status:next, quantity:next==='REPEATED'?2:1}])
    const msgs = {HAVE:'✓ Tenho!', REPEATED:'2x Repetida!', MISSING:'Removida'}
    setToast(msgs[next]); setTimeout(()=>setToast(null), 1500)
  }

  const total = GRUPOS.reduce((a,g) => a + g.p.length * 20, 0)
  const have = Object.values(stickers).filter(s => s==='HAVE'||s==='REPEATED').length
  const repeated = Object.values(stickers).filter(s => s==='REPEATED').length
  const pct = Math.round((have/total)*100)

  function stkColor(cod, num) {
    const s = stickers[`${cod}_${String(num).padStart(2,'0')}`] || 'MISSING'
    if (s==='HAVE') return {bg:'#22C55E',color:'white',border:'#22C55E'}
    if (s==='REPEATED') return {bg:'#F5C518',color:'#000',border:'#F5C518'}
    return {bg:'#1e1e1e',color:'rgba(255,255,255,0.3)',border:'rgba(255,255,255,0.1)'}
  }

  if (loading) return (
    <div style={{minHeight:'100vh',background:'#0a0a0a',display:'flex',alignItems:'center',justifyContent:'center'}}>
      <div style={{textAlign:'center',color:'white'}}>
        <div style={{fontSize:'36px',marginBottom:'10px'}}>📒</div>
        <div style={{fontFamily:'Barlow Condensed',fontSize:'20px',fontWeight:'900',letterSpacing:'2px'}}>CARREGANDO ÁLBUM...</div>
      </div>
    </div>
  )

  return (
    <div style={{minHeight:'100vh',background:'#0a0a0a',color:'white',fontFamily:'Barlow'}}>
      {toast && (
        <div style={{position:'fixed',bottom:'24px',left:'50%',transform:'translateX(-50%)',background:'#141414',border:'1px solid rgba(255,255,255,0.15)',color:'white',padding:'8px 20px',borderRadius:'99px',fontSize:'13px',fontWeight:'700',zIndex:999,whiteSpace:'nowrap',boxShadow:'0 4px 20px rgba(0,0,0,0.5)'}}>
          {toast}
        </div>
      )}

      {/* HEADER */}
      <div style={{background:'#141414',borderBottom:'1px solid rgba(255,255,255,0.06)',position:'sticky',top:0,zIndex:100}}>
        <div style={{height:'4px',display:'flex'}}>{COLORS.map((c,i)=><span key={i} style={{flex:1,background:c}}/>)}</div>
        <div style={{padding:'10px 16px',display:'flex',alignItems:'center',gap:'12px'}}>
          <Link href="/dashboard" style={{color:'rgba(255,255,255,0.4)',fontSize:'13px'}}>← Voltar</Link>
          <div style={{fontFamily:'Barlow Condensed',fontSize:'18px',fontWeight:'900',letterSpacing:'1px',flex:1}}>
            MEU <span style={{color:'#E8175D'}}>ÁLBUM</span>
          </div>
          <div style={{fontSize:'11px',color:saving?'#F5C518':'rgba(255,255,255,0.3)',fontWeight:'700',transition:'color .3s'}}>
            {saving ? '💾 Salvando...' : '✓ Salvo'}
          </div>
        </div>
      </div>

      {/* PROGRESS BAR */}
      <div style={{background:'#141414',borderBottom:'1px solid rgba(255,255,255,0.06)',padding:'14px 16px'}}>
        <div style={{display:'flex',justifyContent:'space-between',fontSize:'11px',color:'rgba(255,255,255,0.5)',marginBottom:'6px'}}>
          <span>{have} coletadas</span>
          <span style={{color:'#E8175D',fontWeight:'700',fontFamily:'Barlow Condensed',fontSize:'14px'}}>{pct}% completo</span>
        </div>
        <div style={{height:'8px',background:'#1e1e1e',borderRadius:'99px',overflow:'hidden',marginBottom:'12px'}}>
          <div style={{height:'100%',width:`${pct}%`,background:'linear-gradient(90deg,#E8175D,#F5C518)',borderRadius:'99px',transition:'width .4s'}}/>
        </div>
        <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:'8px',marginBottom:'10px'}}>
          {[['TENHO',Object.values(stickers).filter(s=>s==='HAVE').length,'#22C55E'],
            ['REPETIDAS',repeated,'#F5C518'],
            ['FALTAM',total-have,'#E8175D']].map(([l,v,c])=>(
            <div key={l} style={{background:'#1e1e1e',borderRadius:'10px',padding:'10px',textAlign:'center'}}>
              <div style={{fontFamily:'Barlow Condensed',fontSize:'24px',fontWeight:'900',color:c}}>{v}</div>
              <div style={{fontSize:'9px',color:'rgba(255,255,255,0.4)',letterSpacing:'1px',fontWeight:'700',marginTop:'2px'}}>{l}</div>
            </div>
          ))}
        </div>
        <div style={{fontSize:'10px',color:'rgba(255,255,255,0.25)',textAlign:'center'}}>
          1 toque = Tenho ✓ · 2 toques = Repetida · 3 toques = Remove
        </div>
      </div>

      {/* GRUPOS */}
      <div style={{padding:'12px 16px'}}>
        {GRUPOS.map((g, gi) => {
          const col = GC[gi]
          const grpHave = g.p.reduce((a,p) => {
            for(let i=1;i<=20;i++){const s=stickers[`${p.c}_${String(i).padStart(2,'0')}`];if(s==='HAVE'||s==='REPEATED')a++}
            return a
          }, 0)
          const grpTotal = g.p.length * 20
          const grpPct = Math.round((grpHave/grpTotal)*100)
          const isOpen = openGrp === gi

          return (
            <div key={gi} style={{marginBottom:'8px'}}>
              {/* GRUPO HEADER */}
              <div onClick={() => setOpenGrp(isOpen?null:gi)}
                style={{background:'#141414',border:`2px solid ${isOpen?col:'rgba(255,255,255,0.08)'}`,borderRadius:'14px',padding:'12px 14px',cursor:'pointer',display:'flex',alignItems:'center',gap:'10px',transition:'all .15s'}}>
                <div style={{width:'36px',height:'36px',borderRadius:'10px',background:col,display:'flex',alignItems:'center',justifyContent:'center',fontFamily:'Barlow Condensed',fontSize:'18px',fontWeight:'900',color:'white',flexShrink:0}}>
                  {g.n}
                </div>
                <div style={{flex:1}}>
                  <div style={{fontFamily:'Barlow Condensed',fontSize:'15px',fontWeight:'700',letterSpacing:'.5px'}}>GRUPO {g.n}</div>
                  <div style={{display:'flex',gap:'6px',marginTop:'4px',flexWrap:'wrap'}}>
                    {g.p.map(p => (
                      <div key={p.c} style={{display:'flex',alignItems:'center',gap:'3px'}}>
                        <img src={`https://flagcdn.com/w20/${p.f}.png`} style={{width:'16px',height:'11px',borderRadius:'2px',objectFit:'cover'}}/>
                        <span style={{fontSize:'10px',color:'rgba(255,255,255,0.5)'}}>{p.n}</span>
                      </div>
                    ))}
                  </div>
                </div>
                <div style={{textAlign:'right',flexShrink:0}}>
                  <div style={{fontFamily:'Barlow Condensed',fontSize:'18px',fontWeight:'900',color:col}}>{grpPct}%</div>
                  <div style={{fontSize:'10px',color:'rgba(255,255,255,0.4)'}}>{grpHave}/{grpTotal}</div>
                </div>
                <div style={{color:'rgba(255,255,255,0.3)',transition:'transform .2s',transform:isOpen?'rotate(180deg)':'none',fontSize:'12px'}}>▼</div>
              </div>

              {/* PAÍSES DENTRO DO GRUPO */}
              {isOpen && (
                <div style={{background:'#0d0d0d',border:`2px solid ${col}`,borderTop:'none',borderRadius:'0 0 14px 14px',padding:'14px',display:'flex',flexDirection:'column',gap:'16px'}}>
                  {g.p.map(p => {
                    const pHave = Array.from({length:20}).filter((_,i)=>{
                      const s=stickers[`${p.c}_${String(i+1).padStart(2,'0')}`]
                      return s==='HAVE'||s==='REPEATED'
                    }).length

                    return (
                      <div key={p.c}>
                        {/* PAÍS HEADER */}
                        <div style={{display:'flex',alignItems:'center',gap:'10px',marginBottom:'10px',background:'#141414',borderRadius:'10px',padding:'8px 12px'}}>
                          <img src={`https://flagcdn.com/w40/${p.f}.png`}
                            style={{width:'36px',height:'25px',borderRadius:'5px',objectFit:'cover',border:'1px solid rgba(255,255,255,0.1)',flexShrink:0}}/>
                          <div style={{flex:1}}>
                            <div style={{fontFamily:'Barlow Condensed',fontSize:'16px',fontWeight:'700',letterSpacing:'.3px'}}>{p.n}</div>
                            <div style={{height:'4px',background:'#1e1e1e',borderRadius:'99px',overflow:'hidden',marginTop:'4px',width:'80px'}}>
                              <div style={{height:'100%',width:`${Math.round((pHave/20)*100)}%`,background:col,borderRadius:'99px'}}/>
                            </div>
                          </div>
                          <div style={{fontFamily:'Barlow Condensed',fontSize:'15px',fontWeight:'900',color:col,flexShrink:0}}>
                            {pHave}/20
                          </div>
                        </div>

                        {/* GRID DE FIGURINHAS */}
                        <div style={{display:'grid',gridTemplateColumns:'repeat(10,1fr)',gap:'4px'}}>
                          {Array.from({length:20},(_,i) => {
                            const {bg,color,border} = stkColor(p.c, i+1)
                            const s = stickers[`${p.c}_${String(i+1).padStart(2,'0')}`] || 'MISSING'
                            return (
                              <div key={i} onClick={() => togStk(p.c, i+1)}
                                style={{aspectRatio:'1',borderRadius:'6px',border:`1.5px solid ${border}`,background:bg,display:'flex',alignItems:'center',justifyContent:'center',cursor:'pointer',fontSize:'11px',fontWeight:'900',color,transition:'all .1s',userSelect:'none',position:'relative'}}>
                                {i+1}
                                {s==='REPEATED' && (
                                  <div style={{position:'absolute',top:'-3px',right:'-3px',background:'#000',color:'#F5C518',width:'12px',height:'12px',borderRadius:'50%',fontSize:'7px',fontWeight:'900',display:'flex',alignItems:'center',justifyContent:'center',border:'1px solid #F5C518'}}>2</div>
                                )}
                              </div>
                            )
                          })}
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          )
        })}
      </div>
      <div style={{height:'24px'}}/>
    </div>
  )
}
