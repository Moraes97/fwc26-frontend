'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Cookies from 'js-cookie'
import { auth, trades, users } from '@/lib/api'
import Link from 'next/link'

const COLORS = ['#E8175D','#FF6B00','#F5C518','#22C55E','#00C9B1','#1A56DB','#6B2FFA']
const TABS = [{id:'trocas',label:'TROCAS',icon:'⇄'},{id:'copa',label:'COPA 2026',icon:'🏆'},{id:'ranking',label:'RANKING',icon:'📊'},{id:'perfil',label:'PERFIL',icon:'👤'}]

export default function Dashboard() {
  const router = useRouter()
  const [user, setUser] = useState(null)
  const [tab, setTab] = useState('trocas')
  const [matches, setMatches] = useState([])
  const [ranking, setRanking] = useState([])
  const [loading, setLoading] = useState(true)
  const [countdown, setCountdown] = useState({d:'--',h:'--',m:'--',s:'--'})

  useEffect(() => {
    if (!Cookies.get('token')) { router.push('/login'); return }
    loadData()
    const timer = setInterval(() => {
      const diff = new Date('2026-06-11T18:00:00-05:00') - new Date()
      if (diff <= 0) return
      setCountdown({d:Math.floor(diff/864e5),h:Math.floor(diff%864e5/36e5),m:Math.floor(diff%36e5/6e4),s:Math.floor(diff%6e4/1e3)})
    }, 1000)
    return () => clearInterval(timer)
  }, [])

  async function loadData() {
    try {
      const [meRes, matchRes, rankRes] = await Promise.all([auth.me(), trades.matches(), users.ranking()])
      setUser(meRes.data)
      setMatches(matchRes.data || [])
      setRanking(rankRes.data || [])
    } catch { router.push('/login') }
    finally { setLoading(false) }
  }

  function logout() { Cookies.remove('token'); Cookies.remove('refreshToken'); router.push('/login') }

  if (loading) return (
    <div style={{minHeight:'100vh',background:'#0a0a0a',display:'flex',alignItems:'center',justifyContent:'center'}}>
      <div style={{fontFamily:'Barlow Condensed',fontSize:'24px',fontWeight:'900',color:'white',letterSpacing:'2px',animation:'pulse 1s infinite'}}>
        CARREGANDO...
      </div>
    </div>
  )

  return (
    <div style={{minHeight:'100vh',background:'#0a0a0a',color:'white',fontFamily:'Barlow'}}>

      {/* HEADER */}
      <div style={{background:'#141414',position:'sticky',top:0,zIndex:100,borderBottom:'1px solid rgba(255,255,255,0.06)'}}>
        <div style={{height:'4px',display:'flex'}}>
          {COLORS.map((c,i) => <span key={i} style={{flex:1,background:c}}/>)}
        </div>
        <div style={{padding:'10px 16px',display:'flex',alignItems:'center',justifyContent:'space-between'}}>
          <div style={{fontFamily:'Barlow Condensed',fontSize:'20px',fontWeight:'900',letterSpacing:'1px'}}>
            FWC<span style={{color:'#F5C518'}}>26</span> TROCAS
          </div>
          <div style={{display:'flex',alignItems:'center',gap:'10px'}}>
            <div style={{width:'32px',height:'32px',borderRadius:'50%',background:'#E8175D',display:'flex',alignItems:'center',justifyContent:'center',fontSize:'14px',cursor:'pointer'}} onClick={() => setTab('perfil')}>
              🦁
            </div>
            <button onClick={logout} style={{padding:'5px 12px',background:'transparent',border:'1px solid rgba(255,255,255,0.15)',borderRadius:'99px',color:'rgba(255,255,255,0.5)',fontSize:'11px',cursor:'pointer',fontFamily:'Barlow Condensed',fontWeight:'700',letterSpacing:'.5px'}}>
              SAIR
            </button>
          </div>
        </div>

        {/* TABS */}
        <div style={{display:'flex',overflowX:'auto',borderTop:'1px solid rgba(255,255,255,0.06)'}}>
          {TABS.map(t => (
            <button key={t.id} onClick={() => setTab(t.id)}
              style={{flex:'0 0 auto',padding:'10px 16px',fontFamily:'Barlow Condensed',fontSize:'12px',fontWeight:'700',letterSpacing:'.8px',border:'none',background:'transparent',cursor:'pointer',color:tab===t.id?'#F5C518':'rgba(255,255,255,0.38)',borderBottom:`2px solid ${tab===t.id?'#F5C518':'transparent'}`,whiteSpace:'nowrap',transition:'all .15s'}}>
              {t.icon} {t.label}
            </button>
          ))}
        </div>
      </div>

      <div style={{maxWidth:'700px',margin:'0 auto',padding:'16px'}}>

        {/* ── TROCAS ── */}
        {tab === 'trocas' && (
          <div>
            {/* HERO */}
            <div style={{background:'#E8175D',borderRadius:'16px',padding:'20px',marginBottom:'16px',position:'relative',overflow:'hidden'}}>
              <div style={{position:'absolute',right:'-10px',top:'-20px',fontFamily:'Barlow Condensed',fontSize:'120px',fontWeight:'900',color:'rgba(255,255,255,0.08)',lineHeight:'1',pointerEvents:'none'}}>26</div>
              <div style={{fontFamily:'Barlow Condensed',fontSize:'10px',fontWeight:'700',letterSpacing:'2px',color:'rgba(255,255,255,0.7)',marginBottom:'4px'}}>CENTRAL DE TROCAS</div>
              <div style={{fontFamily:'Barlow Condensed',fontSize:'24px',fontWeight:'900',color:'white',marginBottom:'4px'}}>Olá, {user?.name?.split(' ')[0]}! 👋</div>
              <div style={{fontSize:'12px',color:'rgba(255,255,255,0.7)'}}>Complete seu álbum e encontre matches perfeitos</div>
              <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:'8px',marginTop:'14px'}}>
                {[['0','MATCHES'],['0','TROCAS'],['0%','ÁLBUM']].map(([v,l]) => (
                  <div key={l} style={{background:'rgba(255,255,255,0.12)',borderRadius:'8px',padding:'8px',textAlign:'center'}}>
                    <div style={{fontFamily:'Barlow Condensed',fontSize:'20px',fontWeight:'900',color:'white'}}>{v}</div>
                    <div style={{fontSize:'8px',color:'rgba(255,255,255,0.6)',letterSpacing:'.5px',fontWeight:'700'}}>{l}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* MATCH */}
            {matches.length > 0 && (
              <div style={{background:'#141414',border:'2px solid #22C55E',borderRadius:'16px',overflow:'hidden',marginBottom:'14px'}}>
                <div style={{background:'#22C55E',padding:'10px 14px',display:'flex',alignItems:'center',gap:'8px'}}>
                  <div style={{fontFamily:'Barlow Condensed',fontSize:'14px',fontWeight:'700',color:'white',letterSpacing:'.5px',flex:1}}>✓ MATCH ENCONTRADO</div>
                  <span style={{background:'rgba(255,255,255,0.2)',color:'white',fontSize:'10px',fontWeight:'700',padding:'2px 8px',borderRadius:'99px'}}>NOVO</span>
                </div>
                <div style={{padding:'14px'}}>
                  {matches.slice(0,1).map(m => {
                    const other = m.userAId === user?.id ? m.userB : m.userA
                    return (
                      <div key={m.id}>
                        <div style={{textAlign:'center',marginBottom:'12px',fontSize:'13px',color:'rgba(255,255,255,0.7)'}}>
                          <strong style={{color:'white'}}>{other?.name}</strong> tem figurinhas que você precisa!
                        </div>
                        <div style={{display:'grid',gridTemplateColumns:'1fr auto 1fr',gap:'8px',alignItems:'center',marginBottom:'12px'}}>
                          <div style={{background:'#1e1e1e',borderRadius:'10px',padding:'10px',textAlign:'center'}}>
                            <div style={{fontSize:'9px',fontWeight:'700',letterSpacing:'.8px',color:'rgba(255,255,255,0.5)',marginBottom:'4px'}}>VOCÊ OFERECE</div>
                            <div style={{fontSize:'11px',color:'rgba(255,255,255,0.7)'}}>{m.matchScore} figurinhas</div>
                          </div>
                          <div style={{fontFamily:'Barlow Condensed',fontSize:'24px',fontWeight:'900',color:'#22C55E',textAlign:'center'}}>⇄</div>
                          <div style={{background:'#1e1e1e',borderRadius:'10px',padding:'10px',textAlign:'center'}}>
                            <div style={{fontSize:'9px',fontWeight:'700',letterSpacing:'.8px',color:'rgba(255,255,255,0.5)',marginBottom:'4px'}}>VOCÊ RECEBE</div>
                            <div style={{fontSize:'11px',color:'rgba(255,255,255,0.7)'}}>{m.matchScore} figurinhas</div>
                          </div>
                        </div>
                        <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'8px'}}>
                          <button style={{padding:'10px',background:'#22C55E',border:'none',borderRadius:'10px',color:'white',fontFamily:'Barlow Condensed',fontSize:'14px',fontWeight:'700',cursor:'pointer',letterSpacing:'.5px'}}>
                            ✓ ACEITAR
                          </button>
                          <button style={{padding:'10px',background:'transparent',border:'1px solid rgba(255,255,255,0.1)',borderRadius:'10px',color:'rgba(255,255,255,0.5)',fontSize:'13px',cursor:'pointer'}}>
                            PULAR
                          </button>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            )}

            {/* ALBUM BTN */}
            <Link href="/album" style={{display:'block',padding:'14px',background:'#E8175D',borderRadius:'99px',color:'white',fontFamily:'Barlow Condensed',fontSize:'17px',fontWeight:'900',letterSpacing:'1px',textAlign:'center',marginBottom:'10px'}}>
              GERENCIAR MEU ÁLBUM →
            </Link>
            <Link href="/trocas" style={{display:'block',padding:'12px',background:'transparent',border:'1px solid rgba(255,255,255,0.1)',borderRadius:'99px',color:'rgba(255,255,255,0.6)',fontFamily:'Barlow Condensed',fontSize:'15px',fontWeight:'700',letterSpacing:'.5px',textAlign:'center'}}>
              VER ANÚNCIOS DE TROCA
            </Link>
          </div>
        )}

        {/* ── COPA 2026 ── */}
        {tab === 'copa' && (
          <div>
            <div style={{background:'#0a0a0a',border:'1px solid rgba(255,255,255,0.08)',borderRadius:'16px',padding:'20px',marginBottom:'14px',textAlign:'center',position:'relative',overflow:'hidden'}}>
              <div style={{position:'absolute',inset:0,background:'linear-gradient(135deg,rgba(232,23,93,.15),rgba(107,47,250,.15))',pointerEvents:'none'}}/>
              <div style={{fontFamily:'Barlow Condensed',fontSize:'11px',fontWeight:'700',letterSpacing:'3px',color:'rgba(255,255,255,0.5)',marginBottom:'6px',position:'relative',zIndex:1}}>FIFA WORLD CUP</div>
              <div style={{fontFamily:'Barlow Condensed',fontSize:'60px',fontWeight:'900',lineHeight:'.9',color:'white',position:'relative',zIndex:1}}>
                2<span style={{color:'#E8175D'}}>6</span>
              </div>
              <div style={{fontSize:'12px',color:'rgba(255,255,255,0.5)',margin:'8px 0 16px',position:'relative',zIndex:1}}>EUA · Canadá · México — 11 jun a 19 jul 2026</div>
              <div style={{display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:'6px',position:'relative',zIndex:1}}>
                {[['DIAS',countdown.d],['HORAS',countdown.h],['MIN',countdown.m],['SEG',countdown.s]].map(([l,v]) => (
                  <div key={l} style={{background:'rgba(255,255,255,0.07)',border:'1px solid rgba(255,255,255,0.1)',borderRadius:'10px',padding:'10px 4px'}}>
                    <div style={{fontFamily:'Barlow Condensed',fontSize:'26px',fontWeight:'900',color:'white',lineHeight:'1'}}>{v}</div>
                    <div style={{fontSize:'8px',color:'rgba(255,255,255,0.4)',letterSpacing:'1px',fontWeight:'700',marginTop:'2px'}}>{l}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* INFO CARDS */}
            {[
              {title:'Dados da Copa',sub:'Formato e informações',icon:'🏆',bg:'#fff0f4',items:[['Edição','23ª Copa FIFA'],['Abertura','11 de junho de 2026'],['Final','19 de julho de 2026'],['Seleções','48 países'],['Grupos','12 grupos de 4 times'],['Total de jogos','104 partidas'],['Campeão atual','🇦🇷 Argentina']]},
              {title:'Álbum Panini 2026',sub:'980 cromos · 68 especiais',icon:'📒',bg:'#e8f8ed',items:[['Total de cromos','980'],['Figurinhas especiais','68 brilhantes/douradas'],['Por seleção','~20 figurinhas'],['Por pacote','7 figurinhas'],['Recorde','Maior álbum da Copa']]},
              {title:'Favoritos ao título',sub:'Odds das apostas',icon:'⚽',bg:'#fff9e0',items:[['🇫🇷 França','+350'],['🇧🇷 Brasil','+400'],['🇦🇷 Argentina','+450'],['🏴󠁧󠁢󠁥󠁮󠁧󠁿 Inglaterra','+500'],['🇩🇪 Alemanha','+600'],['🇪🇸 Espanha','+650']]},
            ].map((card,ci) => {
              
              return (
                <div key={ci} style={{background:'#141414',border:'1px solid rgba(255,255,255,0.08)',borderRadius:'16px',overflow:'hidden',marginBottom:'10px'}}>
                  <div onClick={() => setOpen(!open)} style={{padding:'14px 16px',display:'flex',alignItems:'center',gap:'10px',cursor:'pointer'}}>
                    <div style={{width:'40px',height:'40px',borderRadius:'10px',background:card.bg,display:'flex',alignItems:'center',justifyContent:'center',fontSize:'20px',flexShrink:0}}>{card.icon}</div>
                    <div style={{flex:1}}>
                      <div style={{fontFamily:'Barlow Condensed',fontSize:'15px',fontWeight:'700',letterSpacing:'.3px'}}>{card.title}</div>
                      <div style={{fontSize:'11px',color:'rgba(255,255,255,0.5)',marginTop:'1px'}}>{card.sub}</div>
                    </div>
                    <div style={{color:'rgba(255,255,255,0.3)',fontSize:'12px'}}>{open?'▲':'▼'}</div>
                  </div>
                  {open && (
                    <div style={{borderTop:'1px solid rgba(255,255,255,0.06)',padding:'12px 16px'}}>
                      {card.items.map(([k,v]) => (
                        <div key={k} style={{display:'flex',justifyContent:'space-between',padding:'6px 0',borderBottom:'1px solid rgba(255,255,255,0.04)',fontSize:'12px'}}>
                          <span style={{color:'rgba(255,255,255,0.5)'}}>{k}</span>
                          <span style={{fontWeight:'700'}}>{v}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        )}

        {/* ── RANKING ── */}
        {tab === 'ranking' && (
          <div>
            <div style={{background:'#F5C518',borderRadius:'16px',padding:'16px',marginBottom:'16px',position:'relative',overflow:'hidden'}}>
              <div style={{position:'absolute',right:'-10px',top:'-20px',fontSize:'80px',lineHeight:'1',opacity:'.2',pointerEvents:'none'}}>🏆</div>
              <div style={{fontFamily:'Barlow Condensed',fontSize:'10px',fontWeight:'700',letterSpacing:'2px',color:'rgba(0,0,0,0.5)',marginBottom:'3px'}}>COLECIONADORES</div>
              <div style={{fontFamily:'Barlow Condensed',fontSize:'26px',fontWeight:'900',color:'#0a0a0a'}}>Top Ranking 2026</div>
              <div style={{fontSize:'12px',color:'rgba(0,0,0,0.5)'}}>Quem mais completou o álbum</div>
            </div>
            {ranking.length === 0 ? (
              <div style={{textAlign:'center',padding:'40px',color:'rgba(255,255,255,0.4)',fontSize:'13px'}}>
                Nenhum colecionador ainda. Seja o primeiro!
              </div>
            ) : ranking.slice(0,20).map((r,i) => {
              const posColor = i===0?'#F5C518':i===1?'#B4B2A9':i===2?'#CD7F32':'#333'
              return (
                <div key={r.id} style={{background:'#141414',border:'1px solid rgba(255,255,255,0.08)',borderRadius:'14px',marginBottom:'8px',display:'flex',overflow:'hidden'}}>
                  <div style={{width:'50px',background:posColor,display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0}}>
                    <span style={{fontFamily:'Barlow Condensed',fontSize:'22px',fontWeight:'900',color:'white'}}>{i+1}</span>
                  </div>
                  <div style={{flex:1,padding:'12px 14px'}}>
                    <div style={{display:'flex',alignItems:'center',gap:'8px',marginBottom:'7px'}}>
                      <div style={{width:'34px',height:'34px',borderRadius:'50%',background:'#1e1e1e',display:'flex',alignItems:'center',justifyContent:'center',fontSize:'16px',border:'2px solid rgba(255,255,255,0.1)'}}>
                        {r.id === user?.id ? '🦁' : '⭐'}
                      </div>
                      <div>
                        <div style={{fontFamily:'Barlow Condensed',fontSize:'15px',fontWeight:'700'}}>{r.name} {r.id===user?.id?'👈':''}</div>
                        <div style={{fontSize:'10px',color:'rgba(255,255,255,0.4)'}}>{r.state} · {r.totalTrades||0} trocas</div>
                      </div>
                      <div style={{marginLeft:'auto',textAlign:'right'}}>
                        <div style={{fontFamily:'Barlow Condensed',fontSize:'18px',fontWeight:'900',color:posColor}}>{r.albumPct||0}%</div>
                        <div style={{fontSize:'9px',color:'rgba(255,255,255,0.4)'}}>do álbum</div>
                      </div>
                    </div>
                    <div style={{height:'5px',background:'#1e1e1e',borderRadius:'99px',overflow:'hidden'}}>
                      <div style={{height:'100%',width:`${r.albumPct||0}%`,background:posColor,borderRadius:'99px'}}/>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}

        {/* ── PERFIL ── */}
        {tab === 'perfil' && (
          <div>
            <div style={{background:'#141414',borderRadius:'16px',overflow:'hidden',marginBottom:'12px'}}>
              <div style={{background:'#1e1e1e',padding:'24px 16px',position:'relative',overflow:'hidden'}}>
                <div style={{position:'absolute',right:'-15px',top:'-25px',fontFamily:'Barlow Condensed',fontSize:'130px',fontWeight:'900',color:'rgba(255,255,255,0.03)',lineHeight:'1'}}>26</div>
                <div style={{display:'flex',alignItems:'center',gap:'14px',marginBottom:'16px',position:'relative',zIndex:1}}>
                  <div style={{width:'66px',height:'66px',borderRadius:'18px',background:'#E8175D',display:'flex',alignItems:'center',justifyContent:'center',fontSize:'28px',border:'3px solid rgba(232,23,93,0.4)',flexShrink:0}}>🦁</div>
                  <div>
                    <div style={{fontFamily:'Barlow Condensed',fontSize:'24px',fontWeight:'900',lineHeight:'1',marginBottom:'4px'}}>{user?.name}</div>
                    <div style={{fontSize:'12px',color:'rgba(255,255,255,0.5)'}}>{user?.state} · {user?.email}</div>
                    <div style={{color:'#F5C518',fontSize:'14px',marginTop:'5px'}}>★★★★★ {user?.reputation?.toFixed(1)}</div>
                  </div>
                </div>
                <div style={{display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:'1px',background:'rgba(255,255,255,0.06)',borderRadius:'10px',overflow:'hidden',position:'relative',zIndex:1}}>
                  {[['TROCAS',user?.totalTrades||0,'#F5C518'],['AVALIAÇÕES',user?.reviewsCount||0,'#00C9B1'],['BADGES',user?.badges?.length||0,'#6B2FFA'],['%',0,'#E8175D']].map(([l,v,c]) => (
                    <div key={l} style={{background:'#141414',padding:'10px 4px',textAlign:'center'}}>
                      <div style={{fontFamily:'Barlow Condensed',fontSize:'22px',fontWeight:'900',color:c,lineHeight:'1'}}>{v}</div>
                      <div style={{fontSize:'8px',color:'rgba(255,255,255,0.4)',letterSpacing:'.5px',fontWeight:'700',marginTop:'2px'}}>{l}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div style={{background:'#141414',borderRadius:'14px',padding:'14px',marginBottom:'10px'}}>
              <div style={{fontSize:'10px',fontWeight:'700',letterSpacing:'1px',color:'rgba(255,255,255,0.4)',marginBottom:'10px'}}>CONQUISTAS</div>
              <div style={{display:'flex',gap:'6px',flexWrap:'wrap'}}>
                {(user?.badges||[]).map(ub => (
                  <div key={ub.id} style={{background:'#1e1e1e',border:'1px solid rgba(255,255,255,0.1)',borderRadius:'99px',padding:'5px 10px',fontSize:'11px',fontWeight:'700'}}>
                    {ub.badge?.icon} {ub.badge?.name}
                  </div>
                ))}
                {(!user?.badges||user.badges.length===0) && (
                  <div style={{fontSize:'12px',color:'rgba(255,255,255,0.3)'}}>Complete trocas para ganhar badges!</div>
                )}
              </div>
            </div>

            <button onClick={logout} style={{width:'100%',padding:'12px',background:'transparent',border:'1px solid rgba(232,23,93,0.3)',borderRadius:'99px',color:'#E8175D',fontFamily:'Barlow Condensed',fontSize:'15px',fontWeight:'700',cursor:'pointer',letterSpacing:'1px'}}>
              SAIR DA CONTA
            </button>
          </div>
        )}

      </div>
    </div>
  )
}
