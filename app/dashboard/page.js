'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Cookies from 'js-cookie'
import { auth, trades, users } from '@/lib/api'
import Link from 'next/link'

const TABS = ['TROCAS','RANKING','PERFIL']
const FLAGS = {MEX:'mx',RSA:'za',KOR:'kr',CZE:'cz',CAN:'ca',BIH:'ba',QAT:'qa',SUI:'ch',BRA:'br',MAR:'ma',HAI:'ht',SCO:'gb-sct',USA:'us',PAR:'py',AUS:'au',TUR:'tr',GER:'de',CUW:'cw',CIV:'ci',ECU:'ec',NED:'nl',JPN:'jp',SWE:'se',TUN:'tn',BEL:'be',EGY:'eg',IRN:'ir',NZL:'nz',ESP:'es',CPV:'cv',KSA:'sa',URU:'uy',FRA:'fr',SEN:'sn',IRQ:'iq',NOR:'no',ARG:'ar',ALG:'dz',AUT:'at',JOR:'jo',POR:'pt',COD:'cd',UZB:'uz',COL:'co',ENG:'gb-eng',CRO:'hr',GHA:'gh',PAN:'pa'}

export default function Dashboard() {
  const router = useRouter()
  const [user, setUser] = useState(null)
  const [tab, setTab] = useState('TROCAS')
  const [matches, setMatches] = useState([])
  const [ranking, setRanking] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const token = Cookies.get('token')
    if (!token) { router.push('/login'); return }
    loadData()
  }, [])

  async function loadData() {
    try {
      const [meRes, matchRes, rankRes] = await Promise.all([
        auth.me(), trades.matches(), users.ranking()
      ])
      setUser(meRes.data)
      setMatches(matchRes.data || [])
      setRanking(rankRes.data || [])
    } catch { router.push('/login') }
    finally { setLoading(false) }
  }

  function logout() {
    Cookies.remove('token'); Cookies.remove('refreshToken')
    router.push('/login')
  }

  if (loading) return (
    <div style={{minHeight:'100vh',background:'#0a0a0a',display:'flex',alignItems:'center',justifyContent:'center'}}>
      <div style={{fontFamily:'var(--font-barlow-cond)',fontSize:'24px',fontWeight:'900',color:'white',letterSpacing:'2px'}}>CARREGANDO...</div>
    </div>
  )

  return (
    <div style={{minHeight:'100vh',background:'#0a0a0a',color:'white',fontFamily:'var(--font-barlow)'}}>
      {/* TOPBAR */}
      <div style={{background:'#141414',borderBottom:'1px solid rgba(255,255,255,0.08)'}}>
        <div style={{height:'4px',display:'flex'}}>
          {['#E8175D','#FF6B00','#F5C518','#22C55E','#00C9B1','#1A56DB','#6B2FFA'].map((c,i)=><div key={i} style={{flex:1,background:c}}/>)}
        </div>
        <div style={{padding:'10px 16px',display:'flex',alignItems:'center',justifyContent:'space-between'}}>
          <div style={{fontFamily:'var(--font-barlow-cond)',fontSize:'20px',fontWeight:'900',letterSpacing:'1px'}}>
            FWC<span style={{color:'#F5C518'}}>26</span> TROCAS
          </div>
          <div style={{display:'flex',alignItems:'center',gap:'12px'}}>
            <span style={{fontSize:'13px',color:'rgba(255,255,255,0.6)'}}>Olá, {user?.name?.split(' ')[0]}</span>
            <button onClick={logout} style={{padding:'5px 12px',background:'transparent',border:'1px solid rgba(255,255,255,0.15)',borderRadius:'99px',color:'rgba(255,255,255,0.5)',fontSize:'11px',cursor:'pointer'}}>
              SAIR
            </button>
          </div>
        </div>
        {/* TABS */}
        <div style={{display:'flex',borderTop:'1px solid rgba(255,255,255,0.06)'}}>
          {TABS.map(t => (
            <button key={t} onClick={()=>setTab(t)} style={{flex:1,padding:'10px',fontFamily:'var(--font-barlow-cond)',fontSize:'12px',fontWeight:'700',letterSpacing:'1px',border:'none',background:'transparent',cursor:'pointer',color:tab===t?'#F5C518':'rgba(255,255,255,0.4)',borderBottom:`2px solid ${tab===t?'#F5C518':'transparent'}`,transition:'all .15s'}}>
              {t}
            </button>
          ))}
        </div>
      </div>

      <div style={{padding:'16px',maxWidth:'600px',margin:'0 auto'}}>

        {/* TROCAS TAB */}
        {tab==='TROCAS' && (
          <div>
            <div style={{background:'#141414',border:'1px solid rgba(255,255,255,0.08)',borderRadius:'16px',padding:'16px',marginBottom:'14px'}}>
              <div style={{fontFamily:'var(--font-barlow-cond)',fontSize:'14px',fontWeight:'700',letterSpacing:'1px',color:'rgba(255,255,255,0.5)',marginBottom:'12px'}}>
                SEUS MATCHES AUTOMÁTICOS
              </div>
              {matches.length === 0 ? (
                <div style={{textAlign:'center',padding:'24px',color:'rgba(255,255,255,0.4)',fontSize:'13px'}}>
                  Nenhum match ainda. Complete seu álbum para encontrar trocas!
                </div>
              ) : matches.map(m => {
                const other = m.userAId === user?.id ? m.userB : m.userA
                return (
                  <div key={m.id} style={{background:'#1e1e1e',borderRadius:'10px',padding:'12px',marginBottom:'8px',border:'1px solid rgba(34,197,94,0.3)'}}>
                    <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:'8px'}}>
                      <span style={{fontFamily:'var(--font-barlow-cond)',fontSize:'15px',fontWeight:'700'}}>{other?.name}</span>
                      <span style={{background:'rgba(34,197,94,0.15)',color:'#22C55E',fontSize:'10px',fontWeight:'700',padding:'2px 8px',borderRadius:'99px',border:'1px solid rgba(34,197,94,0.3)'}}>
                        SCORE: {m.matchScore}
                      </span>
                    </div>
                    <div style={{display:'flex',gap:'8px'}}>
                      <button onClick={()=>alert('Sistema de aceite em breve!')} style={{flex:1,padding:'8px',background:'#22C55E',border:'none',borderRadius:'8px',color:'white',fontFamily:'var(--font-barlow-cond)',fontSize:'13px',fontWeight:'700',cursor:'pointer'}}>
                        ✓ ACEITAR
                      </button>
                      <button style={{flex:1,padding:'8px',background:'transparent',border:'1px solid rgba(255,255,255,0.1)',borderRadius:'8px',color:'rgba(255,255,255,0.5)',fontSize:'13px',cursor:'pointer'}}>
                        PULAR
                      </button>
                    </div>
                  </div>
                )
              })}
            </div>
            <Link href="/album" style={{display:'block',padding:'13px',background:'#E8175D',border:'none',borderRadius:'99px',color:'white',fontFamily:'var(--font-barlow-cond)',fontSize:'16px',fontWeight:'900',letterSpacing:'1px',cursor:'pointer',textAlign:'center',textDecoration:'none'}}>
              GERENCIAR MEU ÁLBUM →
            </Link>
          </div>
        )}

        {/* RANKING TAB */}
        {tab==='RANKING' && (
          <div>
            <div style={{fontFamily:'var(--font-barlow-cond)',fontSize:'20px',fontWeight:'900',letterSpacing:'1px',marginBottom:'14px'}}>
              TOP COLECIONADORES
            </div>
            {ranking.slice(0,20).map((r,i) => (
              <div key={r.id} style={{background:'#141414',border:'1px solid rgba(255,255,255,0.08)',borderRadius:'12px',padding:'12px',marginBottom:'8px',display:'flex',alignItems:'center',gap:'10px'}}>
                <div style={{width:'36px',height:'36px',borderRadius:'50%',display:'flex',alignItems:'center',justifyContent:'center',fontFamily:'var(--font-barlow-cond)',fontSize:'18px',fontWeight:'900',color:'white',background:i===0?'#F5C518':i===1?'#B4B2A9':i===2?'#CD7F32':'#333',flexShrink:0}}>
                  {i+1}
                </div>
                <div style={{flex:1}}>
                  <div style={{fontFamily:'var(--font-barlow-cond)',fontSize:'15px',fontWeight:'700'}}>{r.name} {r.id===user?.id?'👈':''}</div>
                  <div style={{fontSize:'11px',color:'rgba(255,255,255,0.4)'}}>{r.state} · {r.totalTrades} trocas</div>
                  <div style={{marginTop:'4px',height:'4px',background:'#1e1e1e',borderRadius:'99px',overflow:'hidden'}}>
                    <div style={{height:'100%',width:`${r.albumPct||0}%`,background:'#E8175D',borderRadius:'99px'}}/>
                  </div>
                </div>
                <div style={{fontFamily:'var(--font-barlow-cond)',fontSize:'18px',fontWeight:'900',color:'#E8175D'}}>{r.albumPct||0}%</div>
              </div>
            ))}
          </div>
        )}

        {/* PERFIL TAB */}
        {tab==='PERFIL' && (
          <div>
            <div style={{background:'#141414',border:'1px solid rgba(255,255,255,0.08)',borderRadius:'16px',overflow:'hidden',marginBottom:'12px'}}>
              <div style={{background:'#1e1e1e',padding:'24px 16px',position:'relative'}}>
                <div style={{display:'flex',alignItems:'center',gap:'14px'}}>
                  <div style={{width:'64px',height:'64px',borderRadius:'16px',background:'#E8175D',display:'flex',alignItems:'center',justifyContent:'center',fontSize:'28px',border:'3px solid rgba(232,23,93,0.4)'}}>
                    🦁
                  </div>
                  <div>
                    <div style={{fontFamily:'var(--font-barlow-cond)',fontSize:'24px',fontWeight:'900',letterSpacing:'1px'}}>{user?.name}</div>
                    <div style={{fontSize:'12px',color:'rgba(255,255,255,0.5)'}}>{user?.state} · {user?.email}</div>
                    <div style={{color:'#F5C518',fontSize:'14px',marginTop:'4px'}}>★★★★★ {user?.reputation?.toFixed(1)}</div>
                  </div>
                </div>
              </div>
              <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:'1px',background:'rgba(255,255,255,0.06)'}}>
                {[['TROCAS',user?.totalTrades||0],['AVALIAÇÕES',user?.reviewsCount||0],['BADGES',user?.badges?.length||0]].map(([l,v])=>(
                  <div key={l} style={{background:'#141414',padding:'12px',textAlign:'center'}}>
                    <div style={{fontFamily:'var(--font-barlow-cond)',fontSize:'24px',fontWeight:'900',color:'#F5C518'}}>{v}</div>
                    <div style={{fontSize:'9px',color:'rgba(255,255,255,0.4)',letterSpacing:'1px',fontWeight:'700'}}>{l}</div>
                  </div>
                ))}
              </div>
            </div>
            <div style={{background:'#141414',border:'1px solid rgba(255,255,255,0.08)',borderRadius:'12px',padding:'14px',marginBottom:'10px'}}>
              <div style={{fontSize:'10px',fontWeight:'700',letterSpacing:'1px',color:'rgba(255,255,255,0.4)',marginBottom:'10px'}}>CONQUISTAS</div>
              <div style={{display:'flex',gap:'6px',flexWrap:'wrap'}}>
                {(user?.badges||[]).map(ub=>(
                  <div key={ub.id} style={{background:'#1e1e1e',border:'1px solid rgba(255,255,255,0.1)',borderRadius:'99px',padding:'5px 10px',fontSize:'11px',fontWeight:'700'}}>
                    {ub.badge?.icon} {ub.badge?.name}
                  </div>
                ))}
                {(!user?.badges||user.badges.length===0) && (
                  <span style={{fontSize:'12px',color:'rgba(255,255,255,0.3)'}}>Complete trocas para ganhar badges!</span>
                )}
              </div>
            </div>
            <button onClick={logout} style={{width:'100%',padding:'12px',background:'transparent',border:'1px solid rgba(232,23,93,0.3)',borderRadius:'99px',color:'#E8175D',fontFamily:'var(--font-barlow-cond)',fontSize:'15px',fontWeight:'700',cursor:'pointer',letterSpacing:'1px'}}>
              SAIR DA CONTA
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
