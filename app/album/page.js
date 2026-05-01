'use client'
import { useEffect, useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import Cookies from 'js-cookie'
import Link from 'next/link'

const GRUPOS = [
  {n:'A',cor:'#E8175D',bg:'linear-gradient(135deg,#2d0a12,#1a0508)',p:[{n:'México',c:'MEX',f:'mx'},{n:'África do Sul',c:'RSA',f:'za'},{n:'Coreia do Sul',c:'KOR',f:'kr'},{n:'Rep. Tcheca',c:'CZE',f:'cz'}]},
  {n:'B',cor:'#6B2FFA',bg:'linear-gradient(135deg,#1a0d2d,#0d0618)',p:[{n:'Canadá',c:'CAN',f:'ca'},{n:'Bósnia',c:'BIH',f:'ba'},{n:'Catar',c:'QAT',f:'qa'},{n:'Suíça',c:'SUI',f:'ch'}]},
  {n:'C',cor:'#00C9B1',bg:'linear-gradient(135deg,#002d28,#001a18)',p:[{n:'Brasil',c:'BRA',f:'br'},{n:'Marrocos',c:'MAR',f:'ma'},{n:'Haiti',c:'HAI',f:'ht'},{n:'Escócia',c:'SCO',f:'gb-sct'}]},
  {n:'D',cor:'#FF6B00',bg:'linear-gradient(135deg,#2d1500,#1a0c00)',p:[{n:'EUA',c:'USA',f:'us'},{n:'Paraguai',c:'PAR',f:'py'},{n:'Austrália',c:'AUS',f:'au'},{n:'Turquia',c:'TUR',f:'tr'}]},
  {n:'E',cor:'#1A56DB',bg:'linear-gradient(135deg,#0a1628,#060e1a)',p:[{n:'Alemanha',c:'GER',f:'de'},{n:'Curaçao',c:'CUW',f:'cw'},{n:'Costa do Marfim',c:'CIV',f:'ci'},{n:'Equador',c:'ECU',f:'ec'}]},
  {n:'F',cor:'#22C55E',bg:'linear-gradient(135deg,#002d14,#001a0c)',p:[{n:'Holanda',c:'NED',f:'nl'},{n:'Japão',c:'JPN',f:'jp'},{n:'Suécia',c:'SWE',f:'se'},{n:'Tunísia',c:'TUN',f:'tn'}]},
  {n:'G',cor:'#F5C518',bg:'linear-gradient(135deg,#2d2500,#1a1600)',p:[{n:'Bélgica',c:'BEL',f:'be'},{n:'Egito',c:'EGY',f:'eg'},{n:'Irã',c:'IRN',f:'ir'},{n:'Nova Zelândia',c:'NZL',f:'nz'}]},
  {n:'H',cor:'#E8175D',bg:'linear-gradient(135deg,#2d0a12,#1a0508)',p:[{n:'Espanha',c:'ESP',f:'es'},{n:'Cabo Verde',c:'CPV',f:'cv'},{n:'Arábia Saudita',c:'KSA',f:'sa'},{n:'Uruguai',c:'URU',f:'uy'}]},
  {n:'I',cor:'#6B2FFA',bg:'linear-gradient(135deg,#1a0d2d,#0d0618)',p:[{n:'França',c:'FRA',f:'fr'},{n:'Senegal',c:'SEN',f:'sn'},{n:'Iraque',c:'IRQ',f:'iq'},{n:'Noruega',c:'NOR',f:'no'}]},
  {n:'J',cor:'#00C9B1',bg:'linear-gradient(135deg,#002d28,#001a18)',p:[{n:'Argentina',c:'ARG',f:'ar'},{n:'Argélia',c:'ALG',f:'dz'},{n:'Áustria',c:'AUT',f:'at'},{n:'Jordânia',c:'JOR',f:'jo'}]},
  {n:'K',cor:'#FF6B00',bg:'linear-gradient(135deg,#2d1500,#1a0c00)',p:[{n:'Portugal',c:'POR',f:'pt'},{n:'RD Congo',c:'COD',f:'cd'},{n:'Uzbequistão',c:'UZB',f:'uz'},{n:'Colômbia',c:'COL',f:'co'}]},
  {n:'L',cor:'#1A56DB',bg:'linear-gradient(135deg,#0a1628,#060e1a)',p:[{n:'Inglaterra',c:'ENG',f:'gb-eng'},{n:'Croácia',c:'CRO',f:'hr'},{n:'Gana',c:'GHA',f:'gh'},{n:'Panamá',c:'PAN',f:'pa'}]},
]

const ESPECIAIS = [
  {label:'FWC 1–8',desc:'Emblema · Bola · Mascotes · Slogan · Sedes',cor:'#1A56DB',icone:'🏆',bg:'linear-gradient(135deg,#0a1628,#060e1a)',
   p:[{n:'FWC 1–8',c:'FWC_A',f:'un',codes:['FWC_01','FWC_02','FWC_03','FWC_04','FWC_05','FWC_06','FWC_07','FWC_08'],nums:['FWC1','FWC2','FWC3','FWC4','FWC5','FWC6','FWC7','FWC8']}]},
  {label:'FWC History 9–19',desc:'História das Copas do Mundo',cor:'#6B2FFA',icone:'📜',bg:'linear-gradient(135deg,#1a0d2d,#0d0618)',
   p:[{n:'FWC 9–19',c:'FWC_B',f:'un',codes:['FWC_09','FWC_10','FWC_11','FWC_12','FWC_13','FWC_14','FWC_15','FWC_16','FWC_17','FWC_18','FWC_19'],nums:['FWC9','FWC10','FWC11','FWC12','FWC13','FWC14','FWC15','FWC16','FWC17','FWC18','FWC19']}]},
  {label:'Coca-Cola CC1–12',desc:'Jogadores especiais',cor:'#E8175D',icone:'🥤',bg:'linear-gradient(135deg,#2d0a12,#1a0508)',
   p:[{n:'Coca-Cola',c:'CC',f:'un',codes:['CC_01','CC_02','CC_03','CC_04','CC_05','CC_06','CC_07','CC_08','CC_09','CC_10','CC_11','CC_12'],nums:['CC1','CC2','CC3','CC4','CC5','CC6','CC7','CC8','CC9','CC10','CC11','CC12']}]},
]

const API = process.env.NEXT_PUBLIC_API_URL

export default function Album() {
  const router = useRouter()
  const [stickers, setStickers] = useState({})
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [toast, setToast] = useState(null)
  const [pendingUpdates, setPendingUpdates] = useState([])
  const [modal, setModal] = useState(null)
  const [search, setSearch] = useState('')
  const [searchResults, setSearchResults] = useState([])

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
      data.stickers?.forEach(s => { map[s.sticker.code] = { status: s.status, qty: s.quantity || 1 } })
      setStickers(map)
    } catch {
      const saved = localStorage.getItem('fwc26_album')
      if (saved) {
        const parsed = JSON.parse(saved)
        // compatibilidade com formato antigo
        const converted = {}
        Object.entries(parsed).forEach(([k,v]) => {
          converted[k] = typeof v === 'string' ? { status: v, qty: 1 } : v
        })
        setStickers(converted)
      }
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

  function getStatus(code) { return stickers[code]?.status || 'MISSING' }
  function getQty(code) { return stickers[code]?.qty || 1 }

  function togStk(code) {
    const cur = getStatus(code)
    const curQty = getQty(code)
    let next, qty
    if (cur === 'MISSING') { next = 'HAVE'; qty = 1 }
    else if (cur === 'HAVE') { next = 'REPEATED'; qty = 2 }
    else if (cur === 'REPEATED' && curQty < 9) { next = 'REPEATED'; qty = curQty + 1 }
    else { next = 'MISSING'; qty = 0 }

    const updated = { ...stickers, [code]: { status: next, qty } }
    if (next === 'MISSING') delete updated[code]
    setStickers(updated)
    localStorage.setItem('fwc26_album', JSON.stringify(updated))
    setPendingUpdates(prev => [...prev.filter(u => u.stickerCode !== code), { stickerCode: code, status: next, quantity: qty }])
    const msgs = { HAVE: '✓ Tenho!', REPEATED: `${qty}× Repetidas!`, MISSING: 'Removida' }
    setToast(msgs[next])
    setTimeout(() => setToast(null), 1200)
  }

  // Busca
  useEffect(() => {
    if (!search.trim()) { setSearchResults([]); return }
    const q = search.trim().toUpperCase()
    const results = []
    GRUPOS.forEach(g => {
      g.p.forEach(p => {
        for (let i = 1; i <= 20; i++) {
          const code = `${p.c}_${String(i).padStart(2,'0')}`
          const label = `${p.c} ${i}`
          if (label.includes(q) || p.n.toUpperCase().includes(q) || String(i) === q || p.c.includes(q)) {
            results.push({ code, label: `${p.n} #${i}`, grupo: g, pais: p, num: i })
          }
        }
      })
    })
    setSearchResults(results.slice(0, 20))
  }, [search])

  const allCodes = GRUPOS.flatMap(g => g.p.flatMap(p => Array.from({length:20}, (_,i) => `${p.c}_${String(i+1).padStart(2,'0')}`)))
  const total = allCodes.length
  const have = allCodes.filter(c => getStatus(c) !== 'MISSING').length
  const repeated = allCodes.filter(c => getStatus(c) === 'REPEATED').length
  const pct = Math.round((have/total)*100)

  function pHave(pais) {
    return Array.from({length:20}).filter((_,i) => getStatus(`${pais.c}_${String(i+1).padStart(2,'0')}`) !== 'MISSING').length
  }

  if (loading) return (
    <div style={{minHeight:'100vh',background:'#050a0f',display:'flex',alignItems:'center',justifyContent:'center'}}>
      <div style={{textAlign:'center'}}>
        <div style={{fontSize:'72px',fontWeight:'900',color:'white',fontFamily:'Barlow Condensed',lineHeight:'1'}}>2<span style={{color:'#F5C518'}}>6</span></div>
        <div style={{fontSize:'13px',letterSpacing:'3px',color:'rgba(255,255,255,0.4)',marginTop:'8px',fontFamily:'Barlow Condensed',fontWeight:'700'}}>CARREGANDO...</div>
      </div>
    </div>
  )

  const allSections = [
    ...ESPECIAIS.map(e => ({ ...e, isEspecial: true })),
    ...GRUPOS.map(g => ({ ...g, isEspecial: false }))
  ]

  return (
    <div style={{minHeight:'100vh',background:'#050a0f',color:'white',fontFamily:'Barlow',overflowX:'hidden'}}>

      {/* TOAST */}
      {toast && (
        <div style={{position:'fixed',bottom:'24px',left:'50%',transform:'translateX(-50%)',background:'rgba(20,20,20,0.95)',border:'1px solid rgba(255,255,255,0.15)',color:'white',padding:'8px 20px',borderRadius:'99px',fontSize:'13px',fontWeight:'700',zIndex:1000,whiteSpace:'nowrap',backdropFilter:'blur(10px)'}}>
          {toast}
        </div>
      )}

      {/* HEADER */}
      <div style={{position:'fixed',top:0,left:0,right:0,zIndex:100,background:'rgba(5,10,15,0.9)',backdropFilter:'blur(16px)',borderBottom:'1px solid rgba(255,255,255,0.06)'}}>
        <div style={{height:'3px',background:'linear-gradient(90deg,#E8175D,#FF6B00,#F5C518,#22C55E,#00C9B1,#1A56DB,#6B2FFA)'}}/>
        <div style={{padding:'10px 20px',display:'flex',alignItems:'center',gap:'12px',maxWidth:'1200px',margin:'0 auto'}}>
          <Link href="/dashboard" style={{color:'rgba(255,255,255,0.4)',fontSize:'13px',textDecoration:'none',flexShrink:0}}>← Voltar</Link>
          <div style={{fontFamily:'Barlow Condensed',fontSize:'18px',fontWeight:'900',letterSpacing:'2px',flexShrink:0}}>
            MEU <span style={{color:'#F5C518'}}>ÁLBUM</span>
          </div>
          {/* BUSCA */}
          <div style={{flex:1,position:'relative',maxWidth:'400px',margin:'0 auto'}}>
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Buscar figurinha... ex: BRA 7 ou Brasil"
              style={{width:'100%',padding:'7px 14px 7px 34px',background:'rgba(255,255,255,0.08)',border:'1px solid rgba(255,255,255,0.12)',borderRadius:'99px',color:'white',fontSize:'12px',outline:'none',boxSizing:'border-box',fontFamily:'Barlow'}}
            />
            <span style={{position:'absolute',left:'12px',top:'50%',transform:'translateY(-50%)',fontSize:'14px',color:'rgba(255,255,255,0.4)'}}>🔍</span>
            {/* RESULTADOS */}
            {searchResults.length > 0 && (
              <div style={{position:'absolute',top:'calc(100% + 6px)',left:0,right:0,background:'#141414',border:'1px solid rgba(255,255,255,0.12)',borderRadius:'12px',overflow:'hidden',zIndex:200,maxHeight:'300px',overflowY:'auto'}}>
                {searchResults.map(r => {
                  const st = getStatus(r.code)
                  const qty = getQty(r.code)
                  return (
                    <div key={r.code} onClick={() => { togStk(r.code); }}
                      style={{padding:'10px 14px',borderBottom:'1px solid rgba(255,255,255,0.06)',cursor:'pointer',display:'flex',alignItems:'center',gap:'10px'}}>
                      <img src={`https://flagcdn.com/w20/${r.pais.f}.png`} style={{width:'20px',height:'13px',borderRadius:'2px',objectFit:'cover'}}/>
                      <div style={{flex:1}}>
                        <div style={{fontSize:'13px',fontWeight:'700'}}>{r.label}</div>
                        <div style={{fontSize:'10px',color:'rgba(255,255,255,0.4)'}}>Grupo {r.grupo.n}</div>
                      </div>
                      <div style={{fontFamily:'Barlow Condensed',fontSize:'12px',fontWeight:'700',
                        color: st==='HAVE' ? r.grupo.cor : st==='REPEATED' ? '#F5C518' : 'rgba(255,255,255,0.3)'}}>
                        {st==='MISSING' ? 'FALTA' : st==='HAVE' ? 'TENHO' : `${qty}× REP`}
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
          <div style={{fontSize:'11px',color:saving?'#F5C518':'rgba(255,255,255,0.3)',fontWeight:'700',flexShrink:0}}>
            {saving ? '💾 Salvando...' : `✓ ${pct}%`}
          </div>
        </div>
      </div>

      {/* HERO + STATS */}
      <div style={{paddingTop:'60px',background:'linear-gradient(180deg,#0a1628 0%,#050a0f 100%)',padding:'80px 20px 36px',textAlign:'center',position:'relative',overflow:'hidden'}}>
        <div style={{position:'absolute',top:'-30px',left:'50%',transform:'translateX(-50%)',fontFamily:'Barlow Condensed',fontSize:'280px',fontWeight:'900',color:'rgba(255,255,255,0.02)',lineHeight:'1',pointerEvents:'none',userSelect:'none',whiteSpace:'nowrap'}}>FWC26</div>
        <div style={{position:'relative',zIndex:1,maxWidth:'600px',margin:'0 auto'}}>
          <div style={{fontFamily:'Barlow Condensed',fontSize:'11px',fontWeight:'700',letterSpacing:'4px',color:'rgba(255,255,255,0.35)',marginBottom:'6px'}}>PANINI OFICIAL · FIFA WORLD CUP</div>
          <div style={{fontFamily:'Barlow Condensed',fontSize:'80px',fontWeight:'900',lineHeight:'.85',color:'white',letterSpacing:'-4px',marginBottom:'20px'}}>
            2<span style={{color:'#F5C518'}}>6</span>
          </div>
          <div style={{display:'flex',justifyContent:'space-between',fontSize:'11px',color:'rgba(255,255,255,0.4)',marginBottom:'6px',maxWidth:'360px',margin:'0 auto 6px'}}>
            <span>{have}/{total} figurinhas</span>
            <span style={{color:'#F5C518',fontWeight:'700',fontFamily:'Barlow Condensed',fontSize:'14px'}}>{pct}% completo</span>
          </div>
          <div style={{height:'10px',background:'rgba(255,255,255,0.06)',borderRadius:'99px',overflow:'hidden',marginBottom:'16px',maxWidth:'360px',margin:'0 auto 16px',border:'1px solid rgba(255,255,255,0.05)'}}>
            <div style={{height:'100%',width:pct+'%',background:'linear-gradient(90deg,#E8175D,#FF6B00,#F5C518)',borderRadius:'99px',transition:'width .5s'}}/>
          </div>
          <div style={{display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:'8px',maxWidth:'480px',margin:'0 auto'}}>
            {[
              ['TENHO', have - repeated, '#22C55E'],
              ['REPETIDAS', repeated, '#F5C518'],
              ['FALTAM', total - have, '#E8175D'],
              ['TOTAL', total, 'rgba(255,255,255,0.4)'],
            ].map(([l,v,c]) => (
              <div key={l} style={{background:'rgba(255,255,255,0.04)',borderRadius:'12px',padding:'12px 8px',border:'1px solid rgba(255,255,255,0.06)'}}>
                <div style={{fontFamily:'Barlow Condensed',fontSize:'26px',fontWeight:'900',color:c,lineHeight:'1'}}>{v}</div>
                <div style={{fontSize:'9px',color:'rgba(255,255,255,0.35)',letterSpacing:'1px',fontWeight:'700',marginTop:'3px'}}>{l}</div>
              </div>
            ))}
          </div>
          <div style={{fontSize:'10px',color:'rgba(255,255,255,0.2)',marginTop:'12px'}}>
            Toque 1× = Tenho · 2× = Repetida · Mais toques = +Repetidas · Último toque = Remove
          </div>
        </div>
      </div>

      {/* GRID DE GRUPOS — 2 colunas no PC */}
      <div style={{maxWidth:'1200px',margin:'0 auto',padding:'0 20px 60px'}}>

        {/* ESPECIAIS */}
        <div style={{marginBottom:'8px'}}>
          <div style={{display:'flex',alignItems:'center',gap:'10px',padding:'16px 0 10px'}}>
            <div style={{height:'1px',flex:1,background:'linear-gradient(90deg,transparent,rgba(255,255,255,0.15))'}}/>
            <div style={{fontFamily:'Barlow Condensed',fontSize:'12px',fontWeight:'700',letterSpacing:'2px',color:'rgba(255,255,255,0.5)'}}>⭐ ESPECIAIS</div>
            <div style={{height:'1px',flex:1,background:'linear-gradient(90deg,rgba(255,255,255,0.15),transparent)'}}/>
          </div>
          <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(280px,1fr))',gap:'8px'}}>
            {ESPECIAIS.map((e, ei) => {
              const allCodes = e.p[0].codes
              const eHave = allCodes.filter(c => getStatus(c) !== 'MISSING').length
              return (
                <div key={ei} onClick={() => setModal({ pais: e.p[0], grupo: { n: e.label, cor: e.cor, bg: e.bg }, isEspecial: true })}
                  style={{background: e.bg, border: `1.5px solid ${e.cor}'33'`, borderRadius:'14px', padding:'14px', cursor:'pointer', display:'flex', alignItems:'center', gap:'12px', transition:'all .15s'}}>
                  <div style={{width:'44px',height:'44px',borderRadius:'12px',background:`${e.cor}'22'`,border:`2px solid ${e.cor}'44'`,display:'flex',alignItems:'center',justifyContent:'center',fontSize:'22px',flexShrink:0}}>{e.icone}</div>
                  <div style={{flex:1}}>
                    <div style={{fontFamily:'Barlow Condensed',fontSize:'15px',fontWeight:'700',color:'white'}}>{e.label}</div>
                    <div style={{fontSize:'11px',color:'rgba(255,255,255,0.4)',marginBottom:'6px'}}>{e.desc}</div>
                    <div style={{height:'4px',background:'rgba(255,255,255,0.08)',borderRadius:'99px',overflow:'hidden'}}>
                      <div style={{height:'100%',width:Math.round((eHave/allCodes.length)*100)+'%',background:e.cor,borderRadius:'99px'}}/>
                    </div>
                  </div>
                  <div style={{textAlign:'right',flexShrink:0}}>
                    <div style={{fontFamily:'Barlow Condensed',fontSize:'18px',fontWeight:'900',color:e.cor}}>{eHave}/{allCodes.length}</div>
                    <div style={{fontSize:'12px',color:'rgba(255,255,255,0.3)'}}>›</div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* GRUPOS */}
        <div style={{display:'flex',alignItems:'center',gap:'10px',padding:'16px 0 12px'}}>
          <div style={{height:'1px',flex:1,background:'linear-gradient(90deg,transparent,rgba(255,255,255,0.15))'}}/>
          <div style={{fontFamily:'Barlow Condensed',fontSize:'12px',fontWeight:'700',letterSpacing:'2px',color:'rgba(255,255,255,0.5)'}}>⚽ 48 SELEÇÕES · 12 GRUPOS</div>
          <div style={{height:'1px',flex:1,background:'linear-gradient(90deg,rgba(255,255,255,0.15),transparent)'}}/>
        </div>

        <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(340px,1fr))',gap:'12px'}}>
          {GRUPOS.map((g, gi) => {
            const grpCodes = g.p.flatMap(p => Array.from({length:20}, (_,i) => `${p.c}_${String(i+1).padStart(2,'0')}`))
            const grpHave = grpCodes.filter(c => getStatus(c) !== 'MISSING').length
            const grpTotal = grpCodes.length
            const grpPct = Math.round((grpHave/grpTotal)*100)

            return (
              <div key={gi} style={{background:g.bg, border:`1.5px solid ${g.cor}'33'`, borderRadius:'16px', overflow:'hidden', transition:'all .15s'}}>
                {/* GRUPO HEADER */}
                <div style={{padding:'14px 16px',borderBottom:`1px solid ${g.cor}'22'`,display:'flex',alignItems:'center',gap:'10px'}}>
                  <div style={{width:'40px',height:'40px',borderRadius:'10px',background:`linear-gradient(135deg,${g.cor},${g.cor}88)`,display:'flex',alignItems:'center',justifyContent:'center',fontFamily:'Barlow Condensed',fontSize:'20px',fontWeight:'900',color:'white',flexShrink:0,boxShadow:`0 4px 12px ${g.cor}44'}}>
                    {g.n}
                  </div>
                  <div style={{flex:1}}>
                    <div style={{fontFamily:'Barlow Condensed',fontSize:'16px',fontWeight:'900',letterSpacing:'.5px'}}>GRUPO {g.n}</div>
                    <div style={{height:'4px',background:'rgba(255,255,255,0.08)',borderRadius:'99px',overflow:'hidden',marginTop:'5px'}}>
                      <div style={{height:'100%',width:grpPct+'%',background:g.cor,borderRadius:'99px',transition:'width .4s'}}/>
                    </div>
                  </div>
                  <div style={{fontFamily:'Barlow Condensed',fontSize:'20px',fontWeight:'900',color:g.cor,flexShrink:0}}>
                    {grpPct}%
                  </div>
                </div>

                {/* PAÍSES */}
                <div style={{padding:'10px',display:'grid',gridTemplateColumns:'1fr 1fr',gap:'6px'}}>
                  {g.p.map(p => {
                    const ph = pHave(p)
                    return (
                      <div key={p.c} onClick={() => setModal({pais:p, grupo:g})}
                        style={{background:'rgba(255,255,255,0.05)',border:`1px solid ${g.cor}'22'`,borderRadius:'10px',padding:'10px',cursor:'pointer',transition:'all .15s',display:'flex',alignItems:'center',gap:'8px'}}>
                        <img src={`https://flagcdn.com/w40/${p.f}.png`}
                          style={{width:'36px',height:'24px',borderRadius:'5px',objectFit:'cover',border:`1.5px solid ${g.cor}'44'`,boxShadow:'0 2px 6px rgba(0,0,0,0.4)',flexShrink:0}}/>
                        <div style={{flex:1,overflow:'hidden',minWidth:0}}>
                          <div style={{fontFamily:'Barlow Condensed',fontSize:'13px',fontWeight:'700',whiteSpace:'nowrap',overflow:'hidden',textOverflow:'ellipsis'}}>{p.n}</div>
                          <div style={{display:'flex',alignItems:'center',gap:'4px',marginTop:'3px'}}>
                            <div style={{flex:1,height:'3px',background:'rgba(255,255,255,0.08)',borderRadius:'99px',overflow:'hidden'}}>
                              <div style={{height:'100%',width:Math.round((ph/20)*100)+'%',background:g.cor,borderRadius:'99px'}}/>
                            </div>
                            <span style={{fontSize:'9px',color:'rgba(255,255,255,0.5)',fontWeight:'700',flexShrink:0}}>{ph}/20</span>
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* MODAL */}
      {modal && (
        <div style={{position:'fixed',inset:0,background:'rgba(0,0,0,0.85)',zIndex:200,display:'flex',alignItems:'flex-end',justifyContent:'center',backdropFilter:'blur(8px)'}}
          onClick={e => { if(e.target===e.currentTarget) setModal(null) }}>
          <div style={{width:'100%',maxWidth:'600px',background:`${modal.grupo.bg || '#0a0a0a'}`,borderRadius:'20px 20px 0 0',border:`2px solid ${modal.grupo.cor}'55'`,borderBottom:'none',maxHeight:'85vh',display:'flex',flexDirection:'column',boxShadow:`0 -8px 40px ${modal.grupo.cor}'22'`}}>

            {/* MODAL HEADER */}
            <div style={{padding:'16px 20px',borderBottom:`1px solid ${modal.grupo.cor}'22'`,display:'flex',alignItems:'center',gap:'12px',flexShrink:0}}>
              {modal.pais.f !== 'un' ? (
                <img src={`https://flagcdn.com/w80/${modal.pais.f}.png`}
                  style={{width:'54px',height:'36px',borderRadius:'8px',objectFit:'cover',border:`2px solid ${modal.grupo.cor}`,boxShadow:`0 4px 16px ${modal.grupo.cor}'44'`,flexShrink:0}}/>
              ) : (
                <div style={{width:'54px',height:'36px',borderRadius:'8px',background:`${modal.grupo.cor}'22'`,border:`2px solid ${modal.grupo.cor}`,display:'flex',alignItems:'center',justifyContent:'center',fontSize:'24px',flexShrink:0}}>
                  {modal.grupo.n === 'Coca-Cola CC1–12' ? '🥤' : modal.grupo.n.includes('History') ? '📜' : '🏆'}
                </div>
              )}
              <div style={{flex:1}}>
                <div style={{fontFamily:'Barlow Condensed',fontSize:'22px',fontWeight:'900',letterSpacing:'.5px'}}>{modal.pais.n}</div>
                <div style={{fontSize:'11px',color:'rgba(255,255,255,0.4)'}}>
                  {modal.isEspecial ? modal.grupo.n : `Grupo ${modal.grupo.n}`} · {
                    modal.pais.codes
                      ? modal.pais.codes.filter(c => getStatus(c) !== 'MISSING').length + '/' + modal.pais.codes.length
                      : pHave(modal.pais) + '/20'
                  } figurinhas
                </div>
              </div>
              <button onClick={() => setModal(null)}
                style={{width:'32px',height:'32px',borderRadius:'50%',background:'rgba(255,255,255,0.08)',border:'none',color:'white',fontSize:'16px',cursor:'pointer',display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0}}>✕</button>
            </div>

            {/* LEGENDA */}
            <div style={{padding:'8px 20px',display:'flex',gap:'14px',fontSize:'10px',color:'rgba(255,255,255,0.4)',flexShrink:0,flexWrap:'wrap'}}>
              <span>⬜ Falta</span>
              <span style={{color:modal.grupo.cor}}>■ Tenho (1×)</span>
              <span style={{color:'#F5C518'}}>■ Repetida (2×, 3×, ...)</span>
              <span style={{marginLeft:'auto',color:'rgba(255,255,255,0.3)'}}>Toque para avançar o status</span>
            </div>

            {/* FIGURINHAS */}
            <div style={{overflowY:'auto',padding:'8px 20px 16px',flex:1}}>
              {(() => {
                const codes = modal.pais.codes || Array.from({length:20}, (_,i) => `${modal.pais.c}_${String(i+1).padStart(2,'0')}`)
                const nums = modal.pais.nums || Array.from({length:20}, (_,i) => String(i+1))
                return (
                  <div style={{display:'grid',gridTemplateColumns:'repeat(5,1fr)',gap:'8px'}}>
                    {codes.map((code, ci) => {
                      const st = getStatus(code)
                      const qty = getQty(code)
                      const isHave = st === 'HAVE'
                      const isRep = st === 'REPEATED'
                      const isSpec = !modal.pais.codes && ci >= 18
                      return (
                        <div key={code} onClick={() => togStk(code)}
                          style={{borderRadius:'12px',padding:'12px 6px',display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',cursor:'pointer',userSelect:'none',transition:'all .15s',position:'relative',overflow:'hidden',
                            background: isHave ? `linear-gradient(135deg,${modal.grupo.cor},${modal.grupo.cor}88)` : isRep ? 'linear-gradient(135deg,#b8860b,#F5C518)' : isSpec ? 'rgba(201,168,76,0.08)' : 'rgba(255,255,255,0.05)',
                            border: `2px solid ${isHave ? modal.grupo.cor : isRep ? '#F5C518' : isSpec ? 'rgba(201,168,76,0.25)' : 'rgba(255,255,255,0.07)'}`,
                            boxShadow: isHave ? `0 4px 14px ${modal.grupo.cor}'44'` : isRep ? '0 4px 14px rgba(245,197,24,0.3)' : 'none',
                            transform: isHave || isRep ? 'scale(1.03)' : 'scale(1)'}}>
                          {isSpec && !isHave && !isRep && <div style={{position:'absolute',top:'3px',right:'4px',fontSize:'9px'}}>⭐</div>}
                          <div style={{fontFamily:'Barlow Condensed',fontSize:'22px',fontWeight:'900',lineHeight:'1',color: isHave ? 'white' : isRep ? '#0a0a0a' : 'rgba(255,255,255,0.25)',marginBottom:'3px'}}>
                            {nums[ci]}
                          </div>
                          <div style={{fontSize:'16px',lineHeight:'1'}}>
                            {isHave ? '✓' : isRep ? `${qty}×` : ''}
                          </div>
                          {isRep && qty > 1 && (
                            <div style={{position:'absolute',top:'-2px',right:'-2px',background:'#E8175D',color:'white',fontSize:'8px',fontWeight:'900',minWidth:'16px',height:'16px',borderRadius:'99px',display:'flex',alignItems:'center',justifyContent:'center',padding:'0 3px'}}>
                              {qty}×
                            </div>
                          )}
                        </div>
                      )
                    })}
                  </div>
                )
              })()}

              {/* AÇÕES */}
              {!modal.pais.codes && (
                <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'8px',marginTop:'14px'}}>
                  <button onClick={() => {
                    const codes = Array.from({length:20}, (_,i) => `${modal.pais.c}_${String(i+1).padStart(2,'0')}`)
                    const updates = {}
                    codes.forEach(code => { updates[code] = { status: 'HAVE', qty: 1 } })
                    setStickers(prev => ({...prev,...updates}))
                    codes.forEach(code => setPendingUpdates(prev => [...prev.filter(u=>u.stickerCode!==code),{stickerCode:code,status:'HAVE',quantity:1}]))
                    localStorage.setItem('fwc26_album', JSON.stringify({...stickers,...updates}))
                    setToast('✓ Todas marcadas!')
                    setTimeout(()=>setToast(null),2000)
                  }}
                    style={{padding:'10px',background:`${modal.grupo.cor}'22'`,border:`1px solid ${modal.grupo.cor}'44'`,borderRadius:'10px',color:modal.grupo.cor,fontFamily:'Barlow Condensed',fontSize:'13px',fontWeight:'700',cursor:'pointer',letterSpacing:'.5px'}}>
                    ✓ MARCAR TODAS
                  </button>
                  <button onClick={() => {
                    const codes = Array.from({length:20}, (_,i) => `${modal.pais.c}_${String(i+1).padStart(2,'0')}`)
                    const updated = {...stickers}
                    codes.forEach(code => { delete updated[code] })
                    setStickers(updated)
                    codes.forEach(code => setPendingUpdates(prev => [...prev.filter(u=>u.stickerCode!==code),{stickerCode:code,status:'MISSING',quantity:0}]))
                    localStorage.setItem('fwc26_album', JSON.stringify(updated))
                    setToast('Todas removidas')
                    setTimeout(()=>setToast(null),2000)
                  }}
                    style={{padding:'10px',background:'rgba(255,255,255,0.04)',border:'1px solid rgba(255,255,255,0.08)',borderRadius:'10px',color:'rgba(255,255,255,0.4)',fontFamily:'Barlow Condensed',fontSize:'13px',fontWeight:'700',cursor:'pointer'}}>
                    ✕ LIMPAR TUDO
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
