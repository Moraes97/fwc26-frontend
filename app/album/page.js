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

const GRP_COLORS = ['#E8175D','#6B2FFA','#00C9B1','#FF6B00','#1A56DB','#22C55E','#F5C518','#E8175D','#6B2FFA','#00C9B1','#FF6B00','#1A56DB']
const API = process.env.NEXT_PUBLIC_API_URL

const ESPECIAIS = [
  {label:'FWC 1–8',desc:'Emblema · Bola · Mascotes · Slogan · Sedes',codes:['FWC_01','FWC_02','FWC_03','FWC_04','FWC_05','FWC_06','FWC_07','FWC_08'],cor:'#1A56DB',icone:'🏆',nums:Array.from({length:8},(_,i)=>`FWC${i+1}`)},
  {label:'FWC History 9–19',desc:'História das Copas do Mundo',codes:['FWC_09','FWC_10','FWC_11','FWC_12','FWC_13','FWC_14','FWC_15','FWC_16','FWC_17','FWC_18','FWC_19'],cor:'#6B2FFA',icone:'📜',nums:Array.from({length:11},(_,i)=>`FWC${i+9}`)},
  {label:'Coca-Cola CC1–12',desc:'Jogadores especiais Coca-Cola',codes:['CC_01','CC_02','CC_03','CC_04','CC_05','CC_06','CC_07','CC_08','CC_09','CC_10','CC_11','CC_12'],cor:'#E8175D',icone:'🥤',nums:Array.from({length:12},(_,i)=>`CC${i+1}`)},
]

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

  function togStk(code) {
    const cur = stickers[code] || 'MISSING'
    const next = cur === 'MISSING' ? 'HAVE' : cur === 'HAVE' ? 'REPEATED' : 'MISSING'
    const updated = {...stickers, [code]: next}
    setStickers(updated)
    localStorage.setItem('fwc26_album', JSON.stringify(updated))
    setPendingUpdates(prev => [...prev.filter(u => u.stickerCode !== code), {stickerCode: code, status: next, quantity: next === 'REPEATED' ? 2 : 1}])
    setToast(next === 'HAVE' ? '✓ Tenho!' : next === 'REPEATED' ? '2x Repetida!' : 'Removida')
    setTimeout(() => setToast(null), 1500)
  }

  const allCodes = [
    ...ESPECIAIS.flatMap(e => e.codes),
    ...GRUPOS.flatMap(g => g.p.flatMap(p => Array.from({length:20}, (_,i) => `${p.c}_${String(i+1).padStart(2,'0')}`)))
  ]
  const total = allCodes.length
  const have = allCodes.filter(c => stickers[c] === 'HAVE' || stickers[c] === 'REPEATED').length
  const repeated = allCodes.filter(c => stickers[c] === 'REPEATED').length
  const pct = Math.round((have / total) * 100)

  if (loading) return (
    <div style={{minHeight:'100vh',background:'linear-gradient(135deg,#0a1628,#0d1f3c)',display:'flex',alignItems:'center',justifyContent:'center'}}>
      <div style={{textAlign:'center'}}>
        <div style={{fontFamily:'Barlow Condensed',fontSize:'60px',fontWeight:'900',color:'#C9A84C',lineHeight:'1',marginBottom:'8px'}}>2<span style={{color:'white'}}>6</span></div>
        <div style={{fontFamily:'Barlow Condensed',fontSize:'14px',fontWeight:'700',letterSpacing:'3px',color:'rgba(255,255,255,0.5)'}}>CARREGANDO ÁLBUM...</div>
      </div>
    </div>
  )

  return (
    <div style={{minHeight:'100vh',background:'linear-gradient(180deg,#0a1628 0%,#0d1f3c 40%,#0a1628 100%)',color:'white',fontFamily:'Barlow'}}>

      {/* TOAST */}
      {toast && (
        <div style={{position:'fixed',bottom:'24px',left:'50%',transform:'translateX(-50%)',background:'rgba(201,168,76,0.95)',color:'#0a1628',padding:'8px 20px',borderRadius:'99px',fontSize:'13px',fontWeight:'700',zIndex:999,whiteSpace:'nowrap',boxShadow:'0 4px 20px rgba(0,0,0,0.5)'}}>
          {toast}
        </div>
      )}

      {/* HEADER */}
      <div style={{background:'rgba(0,0,0,0.4)',backdropFilter:'blur(10px)',borderBottom:'1px solid rgba(201,168,76,0.2)',position:'sticky',top:0,zIndex:100}}>
        <div style={{height:'3px',background:'linear-gradient(90deg,#E8175D,#FF6B00,#F5C518,#22C55E,#00C9B1,#1A56DB,#6B2FFA)'}}/>
        <div style={{padding:'10px 16px',display:'flex',alignItems:'center',gap:'12px'}}>
          <Link href="/dashboard" style={{color:'rgba(255,255,255,0.5)',fontSize:'13px'}}>← Voltar</Link>
          <div style={{flex:1,textAlign:'center'}}>
            <div style={{fontFamily:'Barlow Condensed',fontSize:'18px',fontWeight:'900',letterSpacing:'2px',color:'#C9A84C'}}>
              FIFA WORLD CUP 2026™
            </div>
            <div style={{fontFamily:'Barlow Condensed',fontSize:'11px',fontWeight:'700',letterSpacing:'1px',color:'rgba(255,255,255,0.4)'}}>
              ÁLBUM OFICIAL PANINI
            </div>
          </div>
          <div style={{fontSize:'11px',color:saving?'#F5C518':'rgba(255,255,255,0.3)',fontWeight:'700',minWidth:'50px',textAlign:'right'}}>
            {saving ? '💾 ...' : '✓ Salvo'}
          </div>
        </div>
      </div>

      {/* CAPA DO ÁLBUM */}
      <div style={{background:'linear-gradient(135deg,#0d2d1a,#1a4d2e,#0d2d1a)',borderBottom:'1px solid rgba(201,168,76,0.3)',padding:'20px 16px',textAlign:'center',position:'relative',overflow:'hidden'}}>
        <div style={{position:'absolute',inset:0,background:'radial-gradient(circle at 50% 50%,rgba(201,168,76,0.1),transparent 70%)',pointerEvents:'none'}}/>
        <div style={{position:'relative',zIndex:1}}>
          <div style={{fontFamily:'Barlow Condensed',fontSize:'11px',fontWeight:'700',letterSpacing:'4px',color:'rgba(201,168,76,0.7)',marginBottom:'4px'}}>PANINI OFFICIAL</div>
          <div style={{fontFamily:'Barlow Condensed',fontSize:'72px',fontWeight:'900',lineHeight:'.85',color:'white',letterSpacing:'-3px',marginBottom:'4px'}}>
            2<span style={{color:'#C9A84C'}}>6</span>
          </div>
          <div style={{fontFamily:'Barlow Condensed',fontSize:'12px',fontWeight:'700',letterSpacing:'3px',color:'rgba(255,255,255,0.5)',marginBottom:'16px'}}>WORLD CUP 2026</div>

          {/* PROGRESS */}
          <div style={{maxWidth:'320px',margin:'0 auto'}}>
            <div style={{display:'flex',justifyContent:'space-between',fontSize:'11px',color:'rgba(255,255,255,0.5)',marginBottom:'5px'}}>
              <span>{have}/{total} figurinhas</span>
              <span style={{color:'#C9A84C',fontWeight:'700'}}>{pct}% completo</span>
            </div>
            <div style={{height:'8px',background:'rgba(0,0,0,0.4)',borderRadius:'99px',overflow:'hidden',border:'1px solid rgba(201,168,76,0.2)',marginBottom:'12px'}}>
              <div style={{height:'100%',width:`${pct}%`,background:'linear-gradient(90deg,#C9A84C,#F5C518)',borderRadius:'99px',transition:'width .4s'}}/>
            </div>
            <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:'8px'}}>
              {[['TENHO',have - repeated,'#22C55E'],['REPETIDAS',repeated,'#F5C518'],['FALTAM',total-have,'#E8175D']].map(([l,v,c])=>(
                <div key={l} style={{background:'rgba(0,0,0,0.3)',borderRadius:'10px',padding:'10px',border:'1px solid rgba(255,255,255,0.08)'}}>
                  <div style={{fontFamily:'Barlow Condensed',fontSize:'24px',fontWeight:'900',color:c}}>{v}</div>
                  <div style={{fontSize:'9px',color:'rgba(255,255,255,0.4)',letterSpacing:'1px',fontWeight:'700',marginTop:'2px'}}>{l}</div>
                </div>
              ))}
            </div>
          </div>
          <div style={{fontSize:'10px',color:'rgba(255,255,255,0.25)',marginTop:'10px'}}>1 toque = Tenho · 2 toques = Repetida · 3 = Remove</div>
        </div>
      </div>

      <div style={{padding:'14px 16px',maxWidth:'700px',margin:'0 auto'}}>

        {/* FIGURINHAS ESPECIAIS */}
        <div style={{marginBottom:'16px'}}>
          <div style={{display:'flex',alignItems:'center',gap:'8px',marginBottom:'10px'}}>
            <div style={{height:'1px',flex:1,background:'linear-gradient(90deg,transparent,rgba(201,168,76,0.4))'}}/>
            <div style={{fontFamily:'Barlow Condensed',fontSize:'12px',fontWeight:'700',letterSpacing:'2px',color:'#C9A84C'}}>⭐ FIGURINHAS ESPECIAIS</div>
            <div style={{height:'1px',flex:1,background:'linear-gradient(90deg,rgba(201,168,76,0.4),transparent)'}}/>
          </div>

          {ESPECIAIS.map((s, si) => {
            const shave = s.codes.filter(c => stickers[c]==='HAVE'||stickers[c]==='REPEATED').length
            return (
              <div key={si} style={{background:'rgba(255,255,255,0.04)',border:`1px solid ${s.cor}44`,borderRadius:'14px',padding:'12px',marginBottom:'8px',backdropFilter:'blur(4px)'}}>
                <div style={{display:'flex',alignItems:'center',gap:'10px',marginBottom:'10px'}}>
                  <div style={{width:'38px',height:'38px',borderRadius:'10px',background:`linear-gradient(135deg,${s.cor},${s.cor}99)`,display:'flex',alignItems:'center',justifyContent:'center',fontSize:'18px',flexShrink:0,boxShadow:`0 4px 12px ${s.cor}44`}}>{s.icone}</div>
                  <div style={{flex:1}}>
                    <div style={{fontFamily:'Barlow Condensed',fontSize:'14px',fontWeight:'700',color:'white',letterSpacing:'.3px'}}>{s.label}</div>
                    <div style={{fontSize:'10px',color:'rgba(255,255,255,0.4)',marginTop:'1px'}}>{s.desc}</div>
                  </div>
                  <div style={{textAlign:'right'}}>
                    <div style={{fontFamily:'Barlow Condensed',fontSize:'16px',fontWeight:'900',color:s.cor}}>{shave}/{s.codes.length}</div>
                  </div>
                </div>
                <div style={{display:'grid',gridTemplateColumns:`repeat(${Math.min(s.codes.length,6)},1fr)`,gap:'5px'}}>
                  {s.codes.map((code, ci) => {
                    const st = stickers[code] || 'MISSING'
                    const isHave = st === 'HAVE'
                    const isRep = st === 'REPEATED'
                    return (
                      <div key={code} onClick={() => togStk(code)}
                        style={{aspectRatio:'0.7',borderRadius:'8px',display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',cursor:'pointer',userSelect:'none',transition:'all .15s',position:'relative',overflow:'hidden',
                          background: isHave ? `linear-gradient(135deg,${s.cor},${s.cor}bb)` : isRep ? 'linear-gradient(135deg,#C9A84C,#F5C518)' : 'rgba(255,255,255,0.06)',
                          border: `1.5px solid ${isHave ? s.cor : isRep ? '#C9A84C' : 'rgba(255,255,255,0.1)'}`,
                          boxShadow: isHave ? `0 2px 8px ${s.cor}44` : isRep ? '0 2px 8px rgba(201,168,76,0.4)' : 'none'
                        }}>
                        <div style={{fontFamily:'Barlow Condensed',fontSize:'9px',fontWeight:'700',color: isHave||isRep ? 'rgba(0,0,0,0.5)' : 'rgba(255,255,255,0.3)',letterSpacing:'.5px'}}>{s.nums[ci]}</div>
                        <div style={{fontSize:'16px',margin:'2px 0'}}>{isHave ? '⭐' : isRep ? '2️⃣' : '□'}</div>
                        {isRep && <div style={{position:'absolute',top:'-1px',right:'-1px',background:'#E8175D',color:'white',fontSize:'7px',fontWeight:'900',width:'14px',height:'14px',borderRadius:'50%',display:'flex',alignItems:'center',justifyContent:'center'}}>2</div>}
                      </div>
                    )
                  })}
                </div>
              </div>
            )
          })}
        </div>

        {/* GRUPOS */}
        <div style={{display:'flex',alignItems:'center',gap:'8px',marginBottom:'12px'}}>
          <div style={{height:'1px',flex:1,background:'linear-gradient(90deg,transparent,rgba(201,168,76,0.4))'}}/>
          <div style={{fontFamily:'Barlow Condensed',fontSize:'12px',fontWeight:'700',letterSpacing:'2px',color:'#C9A84C'}}>⚽ SELEÇÕES</div>
          <div style={{height:'1px',flex:1,background:'linear-gradient(90deg,rgba(201,168,76,0.4),transparent)'}}/>
        </div>

        {GRUPOS.map((g, gi) => {
          const col = GRP_COLORS[gi]
          const grpCodes = g.p.flatMap(p => Array.from({length:20}, (_,i) => `${p.c}_${String(i+1).padStart(2,'0')}`))
          const grpHave = grpCodes.filter(c => stickers[c]==='HAVE'||stickers[c]==='REPEATED').length
          const grpTotal = grpCodes.length
          const grpPct = Math.round((grpHave/grpTotal)*100)
          const isOpen = openGrp === gi

          return (
            <div key={gi} style={{marginBottom:'8px'}}>
              <div onClick={() => setOpenGrp(isOpen ? null : gi)}
                style={{background: isOpen ? `linear-gradient(135deg,${col}22,${col}11)` : 'rgba(255,255,255,0.04)',
                  border:`1.5px solid ${isOpen?col:'rgba(255,255,255,0.08)'}`,
                  borderRadius: isOpen ? '14px 14px 0 0' : '14px',
                  padding:'12px 14px',cursor:'pointer',display:'flex',alignItems:'center',gap:'10px',transition:'all .15s'}}>
                <div style={{width:'38px',height:'38px',borderRadius:'10px',background:`linear-gradient(135deg,${col},${col}88)`,display:'flex',alignItems:'center',justifyContent:'center',fontFamily:'Barlow Condensed',fontSize:'20px',fontWeight:'900',color:'white',flexShrink:0,boxShadow:`0 4px 10px ${col}44`}}>
                  {g.n}
                </div>
                <div style={{flex:1}}>
                  <div style={{fontFamily:'Barlow Condensed',fontSize:'15px',fontWeight:'700',letterSpacing:'.5px',marginBottom:'5px'}}>GRUPO {g.n}</div>
                  <div style={{display:'flex',gap:'8px',flexWrap:'wrap'}}>
                    {g.p.map(p => (
                      <div key={p.c} style={{display:'flex',alignItems:'center',gap:'3px'}}>
                        <img src={`https://flagcdn.com/w20/${p.f}.png`} style={{width:'18px',height:'12px',borderRadius:'2px',objectFit:'cover',border:'1px solid rgba(255,255,255,0.2)'}}/>
                        <span style={{fontSize:'10px',color:'rgba(255,255,255,0.6)',fontWeight:'500'}}>{p.n}</span>
                      </div>
                    ))}
                  </div>
                </div>
                <div style={{textAlign:'right',flexShrink:0}}>
                  <div style={{fontFamily:'Barlow Condensed',fontSize:'20px',fontWeight:'900',color:col}}>{grpPct}%</div>
                  <div style={{fontSize:'10px',color:'rgba(255,255,255,0.4)'}}>{grpHave}/{grpTotal}</div>
                </div>
                <div style={{color:'rgba(255,255,255,0.3)',fontSize:'11px',transition:'transform .2s',transform:isOpen?'rotate(180deg)':'none'}}>▼</div>
              </div>

              {isOpen && (
                <div style={{background:'rgba(0,0,0,0.3)',border:`1.5px solid ${col}`,borderTop:'none',borderRadius:'0 0 14px 14px',padding:'14px',backdropFilter:'blur(4px)'}}>
                  {g.p.map(p => {
                    const pCodes = Array.from({length:20}, (_,i) => `${p.c}_${String(i+1).padStart(2,'0')}`)
                    const pHave = pCodes.filter(c => stickers[c]==='HAVE'||stickers[c]==='REPEATED').length
                    return (
                      <div key={p.c} style={{marginBottom:'16px'}}>
                        <div style={{display:'flex',alignItems:'center',gap:'10px',marginBottom:'8px',background:'rgba(255,255,255,0.05)',borderRadius:'10px',padding:'8px 12px',border:'1px solid rgba(255,255,255,0.06)'}}>
                          <img src={`https://flagcdn.com/w40/${p.f}.png`}
                            style={{width:'36px',height:'24px',borderRadius:'5px',objectFit:'cover',border:`1px solid ${col}44`,flexShrink:0,boxShadow:`0 2px 6px rgba(0,0,0,0.3)`}}/>
                          <div style={{flex:1}}>
                            <div style={{fontFamily:'Barlow Condensed',fontSize:'15px',fontWeight:'700',letterSpacing:'.3px'}}>{p.n}</div>
                            <div style={{height:'3px',background:'rgba(255,255,255,0.1)',borderRadius:'99px',overflow:'hidden',marginTop:'4px',width:'80px'}}>
                              <div style={{height:'100%',width:`${Math.round((pHave/20)*100)}%`,background:col,borderRadius:'99px',transition:'width .3s'}}/>
                            </div>
                          </div>
                          <div style={{fontFamily:'Barlow Condensed',fontSize:'14px',fontWeight:'900',color:col}}>{pHave}/20</div>
                        </div>

                        <div style={{display:'grid',gridTemplateColumns:'repeat(10,1fr)',gap:'4px'}}>
                          {Array.from({length:20}, (_, i) => {
                            const code = `${p.c}_${String(i+1).padStart(2,'0')}`
                            const st = stickers[code] || 'MISSING'
                            const isHave = st === 'HAVE'
                            const isRep = st === 'REPEATED'
                            const isSpec = i >= 18
                            return (
                              <div key={i} onClick={() => togStk(code)}
                                style={{aspectRatio:'0.7',borderRadius:'6px',display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',cursor:'pointer',userSelect:'none',transition:'all .12s',position:'relative',overflow:'hidden',
                                  background: isHave ? `linear-gradient(135deg,${col},${col}aa)` : isRep ? 'linear-gradient(135deg,#C9A84C,#F5C518)' : isSpec ? 'rgba(201,168,76,0.1)' : 'rgba(255,255,255,0.06)',
                                  border: `1.5px solid ${isHave ? col : isRep ? '#C9A84C' : isSpec ? 'rgba(201,168,76,0.4)' : 'rgba(255,255,255,0.08)'}`,
                                  boxShadow: isHave ? `0 2px 6px ${col}44` : 'none'
                                }}>
                                <div style={{fontSize:'10px',fontWeight:'900',fontFamily:'Barlow Condensed',color: isHave ? 'white' : isRep ? '#0a1628' : isSpec ? '#C9A84C' : 'rgba(255,255,255,0.4)',lineHeight:'1'}}>{i+1}</div>
                                {isSpec && !isHave && !isRep && <div style={{fontSize:'8px',color:'rgba(201,168,76,0.6)'}}>⭐</div>}
                                {isRep && <div style={{position:'absolute',top:'-1px',right:'-1px',background:'#E8175D',color:'white',fontSize:'6px',fontWeight:'900',width:'12px',height:'12px',borderRadius:'50%',display:'flex',alignItems:'center',justifyContent:'center'}}>2</div>}
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
