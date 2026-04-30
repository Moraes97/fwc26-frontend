'use client'
import { useEffect, useState } from 'react'
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

export default function Album() {
  const router = useRouter()
  const [stickers, setStickers] = useState({})
  const [openGrp, setOpenGrp] = useState(null)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (!Cookies.get('token')) { router.push('/login'); return }
    const saved = localStorage.getItem('fwc26_album')
    if (saved) setStickers(JSON.parse(saved))
  }, [])

  const total = GRUPOS.reduce((a,g) => a + g.p.length * 20, 0)
  const have = Object.values(stickers).filter(s => s === 'HAVE' || s === 'REPEATED').length
  const pct = Math.round((have/total)*100)

  function togStk(cod, num) {
    const key = `${cod}_${num}`
    const cur = stickers[key] || 'MISSING'
    const next = cur === 'MISSING' ? 'HAVE' : cur === 'HAVE' ? 'REPEATED' : 'MISSING'
    const updated = {...stickers, [key]: next}
    setStickers(updated)
    localStorage.setItem('fwc26_album', JSON.stringify(updated))
  }

  function stkColor(cod, num) {
    const s = stickers[`${cod}_${num}`] || 'MISSING'
    if (s === 'HAVE') return {bg:'#dcfce7',border:'#22C55E',color:'#22C55E'}
    if (s === 'REPEATED') return {bg:'#fff9e0',border:'#F5C518',color:'#F5C518'}
    return {bg:'#1e1e1e',border:'rgba(255,255,255,0.1)',color:'rgba(255,255,255,0.3)'}
  }

  return (
    <div style={{minHeight:'100vh',background:'#0a0a0a',color:'white'}}>
      {/* TOP */}
      <div style={{background:'#141414',borderBottom:'1px solid rgba(255,255,255,0.08)',padding:'10px 16px',display:'flex',alignItems:'center',justifyContent:'space-between'}}>
        <Link href="/dashboard" style={{color:'rgba(255,255,255,0.5)',textDecoration:'none',fontSize:'13px'}}>← Voltar</Link>
        <div style={{fontSize:'18px',fontWeight:'900',letterSpacing:'1px'}}>FWC<span style={{color:'#F5C518'}}>26</span> ÁLBUM</div>
        <div style={{fontSize:'13px',color:'#E8175D',fontWeight:'700'}}>{pct}%</div>
      </div>

      {/* PROGRESS */}
      <div style={{padding:'12px 16px',background:'#141414',borderBottom:'1px solid rgba(255,255,255,0.06)'}}>
        <div style={{display:'flex',justifyContent:'space-between',fontSize:'11px',color:'rgba(255,255,255,0.5)',marginBottom:'6px'}}>
          <span>{have} figurinhas</span><span>de {total} total</span>
        </div>
        <div style={{height:'6px',background:'#1e1e1e',borderRadius:'99px',overflow:'hidden'}}>
          <div style={{height:'100%',width:`${pct}%`,background:'#E8175D',borderRadius:'99px',transition:'width .3s'}}/>
        </div>
        <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:'8px',marginTop:'10px',fontSize:'11px',textAlign:'center'}}>
          {[['TENHO',Object.values(stickers).filter(s=>s==='HAVE').length,'#22C55E'],
            ['REPETIDAS',Object.values(stickers).filter(s=>s==='REPEATED').length,'#F5C518'],
            ['FALTAM',total-have,'#E8175D']].map(([l,v,c])=>(
            <div key={l} style={{background:'#1e1e1e',borderRadius:'8px',padding:'8px'}}>
              <div style={{fontSize:'20px',fontWeight:'900',color:c}}>{v}</div>
              <div style={{color:'rgba(255,255,255,0.4)',fontSize:'9px',letterSpacing:'1px'}}>{l}</div>
            </div>
          ))}
        </div>
        <div style={{fontSize:'10px',color:'rgba(255,255,255,0.3)',marginTop:'8px',textAlign:'center'}}>
          Toque: 1x = Tenho · 2x = Repetida · 3x = Falta
        </div>
      </div>

      {/* GRUPOS */}
      <div style={{padding:'12px 16px'}}>
        {GRUPOS.map((g,gi) => {
          const col = GC[gi]
          const grpHave = g.p.reduce((a,p) => {
            for(let i=1;i<=20;i++) { const s=stickers[`${p.c}_${i}`]; if(s==='HAVE'||s==='REPEATED') a++ } return a
          }, 0)
          const grpTotal = g.p.length * 20
          const grpPct = Math.round((grpHave/grpTotal)*100)
          const isOpen = openGrp === gi

          return (
            <div key={gi} style={{marginBottom:'8px'}}>
              {/* GRUPO HEADER */}
              <div onClick={() => setOpenGrp(isOpen ? null : gi)}
                style={{background:'#141414',border:`1px solid ${isOpen ? col : 'rgba(255,255,255,0.08)'}`,borderRadius:'12px',padding:'12px 14px',cursor:'pointer',display:'flex',alignItems:'center',gap:'10px'}}>
                <div style={{width:'10px',height:'10px',borderRadius:'50%',background:col,flexShrink:0}}/>
                <div style={{flex:1,fontWeight:'700',fontSize:'14px'}}>{g.n}</div>
                <div style={{fontSize:'11px',color:'rgba(255,255,255,0.4)'}}>{grpHave}/{grpTotal}</div>
                <div style={{fontSize:'13px',fontWeight:'900',color:col}}>{grpPct}%</div>
                <div style={{color:'rgba(255,255,255,0.3)',fontSize:'12px'}}>{isOpen?'▲':'▼'}</div>
              </div>

              {/* PAÍSES */}
              {isOpen && (
                <div style={{background:'#0d0d0d',border:`1px solid ${col}`,borderTop:'none',borderRadius:'0 0 12px 12px',padding:'12px'}}>
                  {g.p.map(p => (
                    <div key={p.c} style={{marginBottom:'14px'}}>
                      <div style={{display:'flex',alignItems:'center',gap:'8px',marginBottom:'8px'}}>
                        <img src={`https://flagcdn.com/w40/${FL[p.c]||'un'}.png`} style={{width:'28px',height:'19px',borderRadius:'3px',objectFit:'cover',border:'1px solid rgba(255,255,255,0.1)'}}/>
                        <span style={{fontWeight:'700',fontSize:'13px'}}>{p.n}</span>
                        <span style={{fontSize:'10px',color:'rgba(255,255,255,0.4)',marginLeft:'auto'}}>
                          {Array.from({length:20}).filter((_,i)=>{const s=stickers[`${p.c}_${i+1}`];return s==='HAVE'||s==='REPEATED'}).length}/20
                        </span>
                      </div>
                      <div style={{display:'grid',gridTemplateColumns:'repeat(5,1fr)',gap:'4px'}}>
                        {Array.from({length:20},(_,i) => {
                          const {bg,border,color} = stkColor(p.c, i+1)
                          return (
                            <div key={i} onClick={() => togStk(p.c, i+1)}
                              style={{aspectRatio:'1',borderRadius:'6px',border:`1.5px solid ${border}`,background:bg,display:'flex',alignItems:'center',justifyContent:'center',cursor:'pointer',fontSize:'12px',fontWeight:'900',color,transition:'all .1s',userSelect:'none'}}>
                              {i+1}
                            </div>
                          )
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
