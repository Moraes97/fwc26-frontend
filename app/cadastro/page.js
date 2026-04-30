'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Cookies from 'js-cookie'
import Link from 'next/link'

const STATES = ['AC','AL','AM','AP','BA','CE','DF','ES','GO','MA','MG','MS','MT','PA','PB','PE','PI','PR','RJ','RN','RO','RR','RS','SC','SE','SP','TO']

export default function Cadastro() {
  const router = useRouter()
  const [form, setForm] = useState({ name:'', email:'', password:'', state:'SP', whatsapp:'' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      const res = await fetch(process.env.NEXT_PUBLIC_API_URL + '/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form)
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || data.fields?.[0]?.message || 'Erro ao criar conta')
      Cookies.set('token', data.accessToken, { expires: 7 })
      Cookies.set('refreshToken', data.refreshToken, { expires: 30 })
      router.push('/dashboard')
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const inp = {width:'100%',padding:'10px 12px',background:'#1e1e1e',border:'1px solid rgba(255,255,255,0.1)',borderRadius:'8px',color:'white',fontSize:'13px',outline:'none',boxSizing:'border-box'}
  const lbl = {display:'block',fontSize:'10px',fontWeight:'700',letterSpacing:'1px',color:'rgba(255,255,255,0.5)',marginBottom:'6px'}

  return (
    <div style={{minHeight:'100vh',background:'#0a0a0a',display:'flex',alignItems:'center',justifyContent:'center',padding:'20px'}}>
      <div style={{width:'100%',maxWidth:'400px'}}>
        <div style={{textAlign:'center',marginBottom:'24px'}}>
          <div style={{fontSize:'56px',fontWeight:'900',color:'white',lineHeight:'1',fontFamily:'serif'}}>
            2<span style={{color:'#E8175D'}}>6</span>
          </div>
          <div style={{fontSize:'12px',fontWeight:'700',letterSpacing:'3px',color:'rgba(255,255,255,0.5)'}}>FWC TROCAS</div>
        </div>
        <div style={{background:'#141414',border:'1px solid rgba(255,255,255,0.1)',borderRadius:'16px',overflow:'hidden'}}>
          <div style={{height:'4px',display:'flex'}}>
            {['#E8175D','#FF6B00','#F5C518','#22C55E','#00C9B1','#1A56DB','#6B2FFA'].map((c,i)=><div key={i} style={{flex:1,background:c}}/>)}
          </div>
          <div style={{padding:'28px'}}>
            <h1 style={{fontSize:'22px',fontWeight:'900',color:'white',marginBottom:'20px'}}>CRIAR CONTA GRÁTIS</h1>
            {error && <div style={{background:'rgba(232,23,93,0.1)',border:'1px solid rgba(232,23,93,0.3)',borderRadius:'8px',padding:'10px 12px',color:'#E8175D',fontSize:'13px',marginBottom:'14px'}}>{error}</div>}
            <form onSubmit={handleSubmit}>
              <div style={{marginBottom:'12px'}}><label style={lbl}>SEU NOME</label><input style={inp} required value={form.name} onChange={e=>setForm({...form,name:e.target.value})} placeholder="Como te chamam?"/></div>
              <div style={{marginBottom:'12px'}}><label style={lbl}>E-MAIL</label><input style={inp} type="email" required value={form.email} onChange={e=>setForm({...form,email:e.target.value})} placeholder="seu@email.com"/></div>
              <div style={{marginBottom:'12px'}}><label style={lbl}>SENHA</label><input style={inp} type="password" required value={form.password} onChange={e=>setForm({...form,password:e.target.value})} placeholder="Mínimo 8 caracteres com letras e números"/></div>
              <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'10px',marginBottom:'16px'}}>
                <div><label style={lbl}>ESTADO</label><select style={{...inp}} value={form.state} onChange={e=>setForm({...form,state:e.target.value})}>{STATES.map(s=><option key={s} value={s}>{s}</option>)}</select></div>
                <div><label style={lbl}>WHATSAPP</label><input style={inp} value={form.whatsapp} onChange={e=>setForm({...form,whatsapp:e.target.value})} placeholder="(11) 99999-9999"/></div>
              </div>
              <button type="submit" disabled={loading} style={{width:'100%',padding:'13px',background:'#E8175D',border:'none',borderRadius:'99px',color:'white',fontSize:'17px',fontWeight:'900',cursor:'pointer',opacity:loading?0.7:1}}>
                {loading?'CRIANDO...':'CRIAR CONTA →'}
              </button>
            </form>
            <div style={{textAlign:'center',marginTop:'16px',fontSize:'13px',color:'rgba(255,255,255,0.5)'}}>
              Já tem conta?{' '}<Link href="/login" style={{color:'#E8175D',fontWeight:'700',textDecoration:'none'}}>Fazer login</Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
