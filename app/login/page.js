'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Cookies from 'js-cookie'
import Link from 'next/link'

const COLORS = ['#E8175D','#FF6B00','#F5C518','#22C55E','#00C9B1','#1A56DB','#6B2FFA']

export default function Login() {
  const router = useRouter()
  const [showSplash, setShowSplash] = useState(true)
  const [form, setForm] = useState({ email: '', password: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [countdown, setCountdown] = useState({ d:'--', h:'--', m:'--', s:'--' })

  useEffect(() => {
    if (Cookies.get('token')) { router.push('/dashboard'); return }
    const timer = setInterval(() => {
      const diff = new Date('2026-06-11T18:00:00-05:00') - new Date()
      if (diff <= 0) return
      setCountdown({
        d: Math.floor(diff/864e5),
        h: Math.floor(diff%864e5/36e5),
        m: Math.floor(diff%36e5/6e4),
        s: Math.floor(diff%6e4/1e3)
      })
    }, 1000)
    return () => clearInterval(timer)
  }, [])

  async function handleLogin(e) {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      const res = await fetch(process.env.NEXT_PUBLIC_API_URL + '/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form)
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Erro ao fazer login')
      Cookies.set('token', data.accessToken, { expires: 7 })
      Cookies.set('refreshToken', data.refreshToken, { expires: 30 })
      router.push('/dashboard')
    } catch (err) { setError(err.message) }
    finally { setLoading(false) }
  }

  if (showSplash) return (
    <div style={{minHeight:'100vh',background:'#0a0a0a',display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',padding:'24px 20px',textAlign:'center',position:'relative',overflow:'hidden'}}>
      {/* BG BLOBS */}
      <div style={{position:'absolute',top:'-80px',right:'-80px',width:'300px',height:'300px',borderRadius:'50%',background:'#E8175D',opacity:.12,pointerEvents:'none'}}/>
      <div style={{position:'absolute',bottom:'-60px',left:'-60px',width:'240px',height:'240px',borderRadius:'50%',background:'#6B2FFA',opacity:.1,pointerEvents:'none'}}/>
      <div style={{position:'absolute',top:'40%',left:'50%',transform:'translate(-50%,-50%)',width:'400px',height:'400px',borderRadius:'50%',background:'#00C9B1',opacity:.04,pointerEvents:'none'}}/>

      {/* LOGO */}
      <div style={{marginBottom:'8px',position:'relative',zIndex:1}}>
        <div style={{fontFamily:'Barlow Condensed',fontSize:'10px',fontWeight:'700',letterSpacing:'4px',color:'rgba(255,255,255,0.4)',marginBottom:'8px'}}>FIFA WORLD CUP</div>
        <div style={{fontFamily:'Barlow Condensed',fontSize:'100px',fontWeight:'900',lineHeight:'.9',color:'white',letterSpacing:'-4px'}}>
          2<span style={{color:'#E8175D'}}>6</span>
        </div>
        <div style={{fontFamily:'Barlow Condensed',fontSize:'13px',fontWeight:'700',letterSpacing:'5px',color:'rgba(255,255,255,0.4)',marginTop:'6px'}}>WORLD CUP 2026</div>
      </div>

      <div style={{fontFamily:'Barlow Condensed',fontSize:'28px',fontWeight:'900',color:'#F5C518',letterSpacing:'2px',marginBottom:'6px'}}>TROCAS ⇄</div>
      <div style={{fontSize:'12px',color:'rgba(255,255,255,0.4)',marginBottom:'24px'}}>Plataforma oficial de trocas de figurinhas</div>

      {/* COUNTDOWN */}
      <div style={{display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:'8px',width:'100%',maxWidth:'320px',marginBottom:'28px'}}>
        {[['DIAS',countdown.d],['HORAS',countdown.h],['MIN',countdown.m],['SEG',countdown.s]].map(([l,v])=>(
          <div key={l} style={{background:'rgba(255,255,255,0.07)',border:'1px solid rgba(255,255,255,0.1)',borderRadius:'10px',padding:'10px 4px',textAlign:'center'}}>
            <div style={{fontFamily:'Barlow Condensed',fontSize:'28px',fontWeight:'900',color:'white',lineHeight:'1'}}>{v}</div>
            <div style={{fontSize:'8px',color:'rgba(255,255,255,0.4)',letterSpacing:'1px',fontWeight:'700',marginTop:'2px'}}>{l}</div>
          </div>
        ))}
      </div>

      {/* STATS */}
      <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:'8px',width:'100%',maxWidth:'320px',marginBottom:'28px'}}>
        {[['48','PAÍSES'],['980','CROMOS'],['1.2k','USUÁRIOS']].map(([v,l])=>(
          <div key={l} style={{background:'rgba(255,255,255,0.06)',border:'1px solid rgba(255,255,255,0.08)',borderRadius:'10px',padding:'10px 6px',textAlign:'center'}}>
            <div style={{fontFamily:'Barlow Condensed',fontSize:'22px',fontWeight:'900',color:'#F5C518'}}>{v}</div>
            <div style={{fontSize:'9px',color:'rgba(255,255,255,0.4)',letterSpacing:'.5px',fontWeight:'700'}}>{l}</div>
          </div>
        ))}
      </div>

      <button onClick={() => setShowSplash(false)}
        style={{width:'100%',maxWidth:'320px',padding:'15px',background:'#E8175D',border:'none',borderRadius:'99px',color:'white',fontFamily:'Barlow Condensed',fontSize:'20px',fontWeight:'900',letterSpacing:'2px',cursor:'pointer',marginBottom:'10px',position:'relative',overflow:'hidden'}}>
        ENTRAR NO ÁLBUM →
      </button>
      <Link href="/cadastro" style={{color:'rgba(255,255,255,0.4)',fontSize:'13px'}}>
        Não tem conta? <span style={{color:'#E8175D',fontWeight:'700'}}>Criar grátis</span>
      </Link>
      <div style={{marginTop:'20px',fontSize:'10px',color:'rgba(255,255,255,0.2)'}}>mundodasfigurinhas.com.br · Panini Oficial</div>
    </div>
  )

  return (
    <div style={{minHeight:'100vh',background:'#0a0a0a',display:'flex',alignItems:'center',justifyContent:'center',padding:'20px'}}>
      <div style={{width:'100%',maxWidth:'400px'}}>
        <button onClick={() => setShowSplash(true)} style={{background:'transparent',border:'none',color:'rgba(255,255,255,0.4)',fontSize:'13px',cursor:'pointer',marginBottom:'20px',padding:0}}>
          ← Voltar
        </button>
        <div style={{background:'#141414',border:'1px solid rgba(255,255,255,0.1)',borderRadius:'20px',overflow:'hidden'}}>
          <div style={{height:'5px',display:'flex'}}>
            {COLORS.map((c,i) => <span key={i} style={{flex:1,background:c}}/>)}
          </div>
          <div style={{padding:'28px'}}>
            <div style={{textAlign:'center',marginBottom:'24px'}}>
              <div style={{fontFamily:'Barlow Condensed',fontSize:'48px',fontWeight:'900',lineHeight:'1',color:'white',letterSpacing:'-2px'}}>
                2<span style={{color:'#E8175D'}}>6</span>
              </div>
              <div style={{fontFamily:'Barlow Condensed',fontSize:'11px',fontWeight:'700',letterSpacing:'3px',color:'rgba(255,255,255,0.4)'}}>FWC TROCAS</div>
            </div>

            <h1 style={{fontFamily:'Barlow Condensed',fontSize:'22px',fontWeight:'900',letterSpacing:'1px',marginBottom:'20px',color:'white'}}>ENTRAR NA CONTA</h1>

            {error && <div style={{background:'rgba(232,23,93,0.1)',border:'1px solid rgba(232,23,93,0.3)',borderRadius:'8px',padding:'10px 12px',color:'#E8175D',fontSize:'13px',marginBottom:'16px'}}>{error}</div>}

            <form onSubmit={handleLogin}>
              <div style={{marginBottom:'12px'}}>
                <label style={{display:'block',fontSize:'10px',fontWeight:'700',letterSpacing:'1px',color:'rgba(255,255,255,0.5)',marginBottom:'6px'}}>E-MAIL</label>
                <input type="email" required value={form.email} onChange={e=>setForm({...form,email:e.target.value})} placeholder="seu@email.com"/>
              </div>
              <div style={{marginBottom:'20px'}}>
                <label style={{display:'block',fontSize:'10px',fontWeight:'700',letterSpacing:'1px',color:'rgba(255,255,255,0.5)',marginBottom:'6px'}}>SENHA</label>
                <input type="password" required value={form.password} onChange={e=>setForm({...form,password:e.target.value})} placeholder="••••••••"/>
              </div>
              <button type="submit" disabled={loading}
                style={{width:'100%',padding:'14px',background:'#E8175D',border:'none',borderRadius:'99px',color:'white',fontFamily:'Barlow Condensed',fontSize:'18px',fontWeight:'900',letterSpacing:'1px',cursor:'pointer',opacity:loading?.7:1}}>
                {loading ? 'ENTRANDO...' : 'ENTRAR'}
              </button>
            </form>

            <div style={{textAlign:'center',marginTop:'18px',fontSize:'13px',color:'rgba(255,255,255,0.5)'}}>
              Não tem conta?{' '}
              <Link href="/cadastro" style={{color:'#E8175D',fontWeight:'700'}}>Criar conta grátis</Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
