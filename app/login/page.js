'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Cookies from 'js-cookie'
import { auth } from '@/lib/api'
import Link from 'next/link'

export default function Login() {
  const router = useRouter()
  const [form, setForm] = useState({ email: '', password: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      const { data } = await auth.login(form)
      Cookies.set('token', data.accessToken, { expires: 7 })
      Cookies.set('refreshToken', data.refreshToken, { expires: 30 })
      router.push('/dashboard')
    } catch (err) {
      setError(err.response?.data?.error || 'Erro ao fazer login')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{minHeight:'100vh',background:'#0a0a0a',display:'flex',alignItems:'center',justifyContent:'center',padding:'20px'}}>
      <div style={{width:'100%',maxWidth:'400px'}}>
        <div style={{textAlign:'center',marginBottom:'32px'}}>
          <div style={{fontFamily:'var(--font-barlow-cond)',fontSize:'64px',fontWeight:'900',color:'white',lineHeight:'1',letterSpacing:'-2px'}}>
            2<span style={{color:'#E8175D'}}>6</span>
          </div>
          <div style={{fontFamily:'var(--font-barlow-cond)',fontSize:'14px',fontWeight:'700',letterSpacing:'3px',color:'rgba(255,255,255,0.5)',marginTop:'4px'}}>
            FWC TROCAS
          </div>
        </div>

        <div style={{background:'#141414',border:'1px solid rgba(255,255,255,0.1)',borderRadius:'16px',overflow:'hidden'}}>
          <div style={{height:'4px',display:'flex'}}>
            {['#E8175D','#FF6B00','#F5C518','#22C55E','#00C9B1','#1A56DB','#6B2FFA'].map((c,i) => (
              <div key={i} style={{flex:1,background:c}}/>
            ))}
          </div>
          <div style={{padding:'32px'}}>
            <h1 style={{fontFamily:'var(--font-barlow-cond)',fontSize:'24px',fontWeight:'900',color:'white',letterSpacing:'1px',marginBottom:'24px'}}>
              ENTRAR NA CONTA
            </h1>

            {error && (
              <div style={{background:'rgba(232,23,93,0.1)',border:'1px solid rgba(232,23,93,0.3)',borderRadius:'8px',padding:'10px 12px',color:'#E8175D',fontSize:'13px',marginBottom:'16px'}}>
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit}>
              <div style={{marginBottom:'14px'}}>
                <label style={{display:'block',fontSize:'10px',fontWeight:'700',letterSpacing:'1px',color:'rgba(255,255,255,0.5)',marginBottom:'6px'}}>E-MAIL</label>
                <input
                  type="email" required
                  value={form.email}
                  onChange={e => setForm({...form, email: e.target.value})}
                  placeholder="seu@email.com"
                  style={{width:'100%',padding:'10px 12px',background:'#1e1e1e',border:'1px solid rgba(255,255,255,0.1)',borderRadius:'8px',color:'white',fontSize:'13px',outline:'none',boxSizing:'border-box'}}
                />
              </div>
              <div style={{marginBottom:'20px'}}>
                <label style={{display:'block',fontSize:'10px',fontWeight:'700',letterSpacing:'1px',color:'rgba(255,255,255,0.5)',marginBottom:'6px'}}>SENHA</label>
                <input
                  type="password" required
                  value={form.password}
                  onChange={e => setForm({...form, password: e.target.value})}
                  placeholder="••••••••"
                  style={{width:'100%',padding:'10px 12px',background:'#1e1e1e',border:'1px solid rgba(255,255,255,0.1)',borderRadius:'8px',color:'white',fontSize:'13px',outline:'none',boxSizing:'border-box'}}
                />
              </div>
              <button
                type="submit" disabled={loading}
                style={{width:'100%',padding:'13px',background:'#E8175D',border:'none',borderRadius:'99px',color:'white',fontFamily:'var(--font-barlow-cond)',fontSize:'18px',fontWeight:'900',letterSpacing:'1px',cursor:'pointer',opacity:loading?0.7:1}}
              >
                {loading ? 'ENTRANDO...' : 'ENTRAR'}
              </button>
            </form>

            <div style={{textAlign:'center',marginTop:'20px',fontSize:'13px',color:'rgba(255,255,255,0.5)'}}>
              Não tem conta?{' '}
              <Link href="/cadastro" style={{color:'#E8175D',fontWeight:'700',textDecoration:'none'}}>
                Criar conta grátis
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
