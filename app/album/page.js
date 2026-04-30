'use client'
import { useEffect, useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import Cookies from 'js-cookie'
import Link from 'next/link'

const GRUPOS = [
  {n:'Grupo A',p:[{n:'México',c:'MEX'},{n:'África do Sul',c:'RSA'},{n:'Coreia do Sul',c:'KOR'},{n:'Rep. Tcheca',c:'CZE'},{n:'Canadá',c:'CAN'}]},
  {n:'Grupo B',p:[{n:'Bósnia',c:'BIH'},{n:'Catar',c:'QAT'},{n:'Suíça',c:'SUI'},{n:'Brasil',c:'BRA'}]},
  {n:'Grupo C',p:[{n:'Marrocos',c:'MAR'},{n:'Haiti',c:'HAI'},{n:'Escócia',c:'SCO'},{n:'Estados Unidos',c:'USA'}]},
  {n:'Grupo D',p:[{n:'Paraguai',c:'PAR'},{n:'Austrália',c:'AUS'},{n:'Turquia',c:'TUR'},{n:'Alemanha',c:'GER'}]},
  {n:'Grupo E',p:[{n:'Curaçao',c:'CUW'},{n:'Costa do Marfim',c:'CIV'},{n:'Equador',c:'ECU'},{n:'Holanda',c:'NED'}]},
  {n:'Grupo F',p:[{n:'Japão',c:'JPN'},{n:'Suécia',c:'SWE'},{n:'Tunísia',c:'TUN'},{n:'Bélgica',c:'BEL'}]},
  {n:'Grupo G',p:[{n:'Egito',c:'EGY'},{n:'Irã',c:'IRN'},{n:'Nova Zelândia',c:'NZL'},{n:'Espanha',c:'ESP'}]},
  {n:'Grupo H',p:[{n:'Cabo Verde',c:'CPV'},{n:'Arábia Saudita',c:'KSA'},{n:'Uruguai',c:'URU'},{n:'França',c:'FRA'}]},
  {n:'Grupo I',p:[{n:'Senegal',c:'SEN'},{n:'Iraque',c:'IRQ'},{n:'Noruega',c:'NOR'},{n:'Argentina',c:'ARG'}]},
  {n:'Grupo J',p:[{n:'Argélia',c:'ALG'},{n:'Áustria',c:'AUT'},{n:'Jordânia',c:'JOR'},{n:'Portugal',c:'POR'}]},
  {n:'Grupo K',p:[{n:'Congo',c:'COD'},{n:'Uzbequistão',c:'UZB'},{n:'Colômbia',c:'COL'},{n:'Inglaterra',c:'ENG'}]},
  {n:'Grupo L',p:[{n:'Croácia',c:'CRO'},{n:'Gana',c:'GHA'},{n:'Panamá',c:'PAN'}]},
]
const FL={MEX:'mx',RSA:'za',KOR:'kr',CZE:'cz',CAN:'ca',BIH:'ba',QAT:'qa',SUI:'ch',BRA:'br',MAR:'ma',HAI:'ht',SCO:'gb-sct',USA:'us',PAR:'py',AUS:'au',TUR:'tr',GER:'de',CUW:'cw',CIV:'ci',ECU:'ec',NED:'nl',JPN:'jp',SWE:'se',TUN:'tn',BEL:'be',EGY:'eg',IRN:'ir',NZL:'nz',ESP:'es',CPV:'cv',KSA:'sa',URU:'uy',FRA:'fr',SEN:'sn',IRQ:'iq',NOR:'no',ARG:'ar',ALG:'dz',AUT:'at',JOR:'jo',POR:'pt',COD:'cd',UZB:'uz',COL:'co',ENG:'gb-eng',CRO:'hr',GHA:'gh',PAN:'pa'}
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

  // Salva updates pendentes no banco a cada 2 segundos
  useEffect(() => {
    if (pendingUpdates.length === 0) return
    const timer = setTimeout(() => saveToBank(), 2000)
    return () => clearTimeout(timer)
  }, [pendingUpdates])

  async function loadAlbum(token) {
    try {
      const res = await fetch(`${API}/api/album`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      if (!res.ok) throw new Error()
      const data = await res.json()
      const map = {}
      data.stickers?.forEach(s => {
        map[s.sticker.code] = s.status
      })
      setStickers(map)
    } catch {
      // fallback para localStorage
      const saved = localStorage.getItem('fwc26_album')
      if (saved) setStickers(JSON.parse(saved))
    } finally {
      setLoading(false)
    }
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
    } catch (e) {
      console.error('Erro ao salvar:', e)
    } finally {
      setSaving(false)
    }
  }

  function togStk(cod, num) {
    const key = `${cod}_${String(num).padStart(2,'0')}`
    const cur = stickers[key] || 'MISSING'
    const next = cur === 'MISSING' ? 'HAVE' : cur === 'HAVE' ? 'REPEATED' : 'MISSING'
    const updated = {...stickers, [key]: next}
    setStickers(updated)
    localStorage.setItem('fwc26_album', JSON.stringify(updated))
    setPendingUpdates(prev => {
      const filtered = prev.filter(u => u.stickerCode !== key)
      return [...filtered, { stickerCode: key, status: next, quantity: next === 'REPEATED' ? 2 : 1 }]
    })
    const msgs = {HAVE:'✓ Adicionada!', REPEATED:'↑ Repetida!', MISSING:'Removida'}
    showToast(msgs[next])
  }

  function showToast(msg) {
    setToast(msg)
    setTimeout(() => setToast(null), 2000)
  }

  const total = GRUPOS.reduce((a,g) => a + g.p.length * 20, 0)
  const have = Object.values(stickers).filter(s => s === 'HAVE' || s === 'REPEATED').length
  const repeated = Object.values(stickers).filter(s => s === 'REPEATED').length
  const pct = Math.round((have/total)*100)

  function stkStyle(cod, num) {
    const s = stickers[`${cod}_${String(num).padStart(2,'0')}`] || 'MISSING'
    if (s === 'HAVE') return {bg:'rgba(34,197,94,0.15)',border:'#22C55E',color:'#22C55E'}
    if (s === 'REPEATED') return {bg:'rgba(245,197,24,0.15)',border:'#F5C518',color:'#F5C518'}
    return {bg:'#1e1e1e',border:'rgba(255,255,255,0.1)',color:'rgba(255,255,255,0.3)'}
  }

  if (loading) return (
    <div style={{minHeight:'100vh',background:'#0a0a0a',display:'flex',alignItems:'center',justifyContent:'center'}}>
      <div style={{textAlign:'center'}}>
        <div style={{fontFamily:'Barlow Condensed',fontSize:'22px',fontWeight:'900',color:'white',letterSpacing:'2px',marginBottom:'8px'}}>CARREGANDO ÁLBUM...</div>
        <div style={{fontSize:'12px',color:'rgba(255,255,255,0.4)'}}>Buscando suas figurinhas</div>
      </div>
    </div>
  )

  return (
    <div style={{minHeight:'100vh',background:'#0a0a0a',color:'white',fontFamily:'Barlow'}}>
      {/* TOAST */}
      {toast && (
        <div style={{position:'fixed',bottom:'20px',left:'50%',transform:'translateX(-50%)',background:'#141414',border:'1px solid rgba(255,255,255,0.15)',color:'white',padding:'8px 18px',borderRadius:'99px',fontSize:'13px',fontWeight:'700',zIndex:999,whiteSpace:'nowrap'}}>
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
          <div style={{fontSize:'11px',color:saving?'#F5C518':'rgba(255,255,255,0.3)',fontWeight:'700'}}>
            {saving ? '💾 Salvando...' : '✓ Salvo'}
          </div>
        </div>
      </div>

      {/* PROGRESS */}
      <div style={{background:'#141414',borderBottom:'1px solid rgba(255,255,255,0.06)',padding:'14px 16px'}}>
        <div style={{display:'flex',justifyContent:'space-between',fontSize:'11px',color:'rgba(255,255,255,0.5)',marginBottom:'7px'}}>
          <span>{have} figurinhas coletadas</span>
          <span style={{color:'#E8175D',fontWeight:'700'}}>{pct}% completo</span>
        </div>
        <div style={{height:'8px',background:'#1e1e1e',borderRadius:'99px',overflow:'hidden',marginBottom:'12px'}}>
          <div style={{height:'100%',width:`${pct}%`,background:'linear-gradient(90deg,#E8175D,#F5C518)',borderRadius:'99px',transition:'width .4s ease'}}/>
        </div>
        <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:'8px'}}>
          {[
            ['TENHO', Object.values(stickers).filter(s=>s==='HAVE').length, '#22C55E'],
            ['REPETIDAS', repeated, '#F5C518'],
            ['FALTAM', total-have, '#E8175D']
          ].map(([l,v,c]) => (
            <div key={l} style={{background:'#1e1e1e',borderRadius:'10px',padding:'10px',textAlign:'center'}}>
              <div style={{fontFamily:'Barlow Condensed',fontSize:'22px',fontWeight:'900',color:c,lineHeight:'1'}}>{v}</div>
              <div style={{fontSize:'9px',color:'rgba(255,255,255,0.4)',letterSpacing:'1px',fontWeight:'700',marginTop:'3px'}}>{l}</div>
            </div>
          ))}
        </div>
        <div style={{marginTop:'10px',fontSize:'10px',color:'rgba(255,255,255,0.25)',textAlign:'center'}}>
          Toque 1x = Tenho · 2x = Repetida · 3x = Remove
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
              <div onClick={() => setOpenGrp(isOpen ? null : gi)}
                style={{background:'#141414',border:`1.5px solid ${isOpen?col:'rgba(255,255,255,0.08)'}`,borderRadius:'14px',padding:'12px 14px',cursor:'pointer',display:'flex',alignItems:'center',gap:'10px',transition:'border-color .15s'}}>
                <div style={{width:'10px',height:'10px',borderRadius:'50%',background:col,flexShrink:0}}/>
                <div style={{fontFamily:'Barlow Condensed',fontSize:'15px',fontWeight:'700',flex:1,letterSpacing:'.3px'}}>{g.n}</div>
                <div style={{fontSize:'10px',color:'rgba(255,255,255,0.4)'}}>{grpHave}/{grpTotal}</div>
                <div style={{fontFamily:'Barlow Condensed',fontSize:'14px',fontWeight:'900',color:col}}>{grpPct}%</div>
                <div style={{color:'rgba(255,255,255,0.3)',fontSize:'11px',transition:'transform .2s',transform:isOpen?'rotate(180deg)':'none'}}>▼</div>
              </div>

              {isOpen && (
                <div style={{background:'#0d0d0d',border:`1.5px solid ${col}`,borderTop:'none',borderRadius:'0 0 14px 14px',padding:'14px'}}>
                  {g.p.map(p => {
                    const pHave = Array.from({length:20}).filter((_,i)=>{const s=stickers[`${p.c}_${String(i+1).padStart(2,'0')}`];return s==='HAVE'||s==='REPEATED'}).length
                    return (
                      <div key={p.c} style={{marginBottom:'16px'}}>
                        <div style={{display:'flex',alignItems:'center',gap:'8px',marginBottom:'9px'}}>
                          <img src={`https://flagcdn.com/w40/${FL[p.c]||'un'}.png`}
                            style={{width:'30px',height:'21px',borderRadius:'4px',objectFit:'cover',border:'1px solid rgba(255,255,255,0.1)',flexShrink:0}}/>
                          <span style={{fontFamily:'Barlow Condensed',fontSize:'14px',fontWeight:'700',flex:1}}>{p.n}</span>
                          <span style={{fontSize:'10px',color:'rgba(255,255,255,0.4)',fontWeight:'700'}}>{pHave}/20</span>
                        </div>
                        <div style={{display:'grid',gridTemplateColumns:'repeat(5,1fr)',gap:'4px'}}>
                          {Array.from({length:20},(_,i) => {
                            const {bg,border,color} = stkStyle(p.c, i+1)
                            const s = stickers[`${p.c}_${String(i+1).padStart(2,'0')}`] || 'MISSING'
                            return (
                              <div key={i} onClick={() => togStk(p.c, i+1)}
                                style={{aspectRatio:'1',borderRadius:'7px',border:`1.5px solid ${border}`,background:bg,display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',cursor:'pointer',fontSize:'12px',fontWeight:'900',color,transition:'all .1s',userSelect:'none',position:'relative'}}>
                                {i+1}
                                {s === 'REPEATED' && (
                                  <div style={{position:'absolute',top:'-4px',right:'-4px',background:'#F5C518',color:'#000',width:'13px',height:'13px',borderRadius:'50%',fontSize:'7px',fontWeight:'900',display:'flex',alignItems:'center',justifyContent:'center'}}>2</div>
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
      <div style={{height:'20px'}}/>
    </div>
  )
}
