'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Cookies from 'js-cookie'
import Link from 'next/link'

const COLORS = ['#E8175D','#FF6B00','#F5C518','#22C55E','#00C9B1','#1A56DB','#6B2FFA']
const STATES = ['SP','RJ','MG','RS','PR','SC','BA','PE','CE','GO','DF','Outro']
const API = process.env.NEXT_PUBLIC_API_URL

export default function Trocas() {
  const router = useRouter()
  const [listings, setListings] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [posting, setPosting] = useState(false)
  const [toast, setToast] = useState(null)
  const [form, setForm] = useState({ offer:'', want:'', contact:'', method:'correio' })

  useEffect(() => {
    if (!Cookies.get('token')) { router.push('/login'); return }
    loadListings()
  }, [])

  async function loadListings() {
    try {
      const res = await fetch(`${API}/api/listings`, {
        headers: { Authorization: `Bearer ${Cookies.get('token')}` }
      })
      const data = await res.json()
      setListings(Array.isArray(data) ? data : [])
    } catch { setListings([]) }
    finally { setLoading(false) }
  }

  async function postListing(e) {
    e.preventDefault()
    setPosting(true)
    try {
      const res = await fetch(`${API}/api/listings`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${Cookies.get('token')}` },
        body: JSON.stringify(form)
      })
      if (!res.ok) throw new Error()
      showToast('✅ Anúncio publicado!')
      setShowForm(false)
      setForm({ offer:'', want:'', contact:'', method:'correio' })
      loadListings()
    } catch { showToast('❌ Erro ao publicar') }
    finally { setPosting(false) }
  }

  function showToast(msg) { setToast(msg); setTimeout(()=>setToast(null),3000) }

  const EMOJIS = ['🦁','⭐','🐅','🦅','🔥','💎','🎯','🌟']
  function emo(name) { return EMOJIS[(name||'').charCodeAt(0)%EMOJIS.length] }

  return (
    <div style={{minHeight:'100vh',background:'#0a0a0a',color:'white',fontFamily:'Barlow'}}>
      {toast && (
        <div style={{position:'fixed',bottom:'20px',left:'50%',transform:'translateX(-50%)',background:'#141414',border:'1px solid rgba(255,255,255,0.15)',color:'white',padding:'8px 18px',borderRadius:'99px',fontSize:'13px',fontWeight:'700',zIndex:999,whiteSpace:'nowrap'}}>
          {toast}
        </div>
      )}

      <div style={{background:'#141414',borderBottom:'1px solid rgba(255,255,255,0.06)',position:'sticky',top:0,zIndex:100}}>
        <div style={{height:'4px',display:'flex'}}>{COLORS.map((c,i)=><span key={i} style={{flex:1,background:c}}/>)}</div>
        <div style={{padding:'10px 16px',display:'flex',alignItems:'center',gap:'12px'}}>
          <Link href="/dashboard" style={{color:'rgba(255,255,255,0.4)',fontSize:'13px'}}>← Voltar</Link>
          <div style={{fontFamily:'Barlow Condensed',fontSize:'18px',fontWeight:'900',letterSpacing:'1px',flex:1}}>
            ANÚNCIOS DE <span style={{color:'#E8175D'}}>TROCA</span>
          </div>
          <button onClick={() => setShowForm(true)}
            style={{padding:'7px 14px',background:'#E8175D',border:'none',borderRadius:'99px',color:'white',fontFamily:'Barlow Condensed',fontSize:'13px',fontWeight:'700',cursor:'pointer',letterSpacing:'.5px'}}>
            + PUBLICAR
          </button>
        </div>
      </div>

      <div style={{maxWidth:'700px',margin:'0 auto',padding:'16px'}}>
        {/* HERO */}
        <div style={{background:'linear-gradient(135deg,#E8175D,#6B2FFA)',borderRadius:'16px',padding:'18px',marginBottom:'16px',position:'relative',overflow:'hidden'}}>
          <div style={{position:'absolute',right:'-10px',top:'-20px',fontFamily:'Barlow Condensed',fontSize:'100px',fontWeight:'900',color:'rgba(255,255,255,0.08)',lineHeight:'1'}}>⇄</div>
          <div style={{fontFamily:'Barlow Condensed',fontSize:'22px',fontWeig
cd /workspaces/fwc26-frontend
cat > app/trocas/page.js << 'EOF'
'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Cookies from 'js-cookie'
import Link from 'next/link'

const COLORS = ['#E8175D','#FF6B00','#F5C518','#22C55E','#00C9B1','#1A56DB','#6B2FFA']
const STATES = ['SP','RJ','MG','RS','PR','SC','BA','PE','CE','GO','DF','Outro']
const API = process.env.NEXT_PUBLIC_API_URL

export default function Trocas() {
  const router = useRouter()
  const [listings, setListings] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [posting, setPosting] = useState(false)
  const [toast, setToast] = useState(null)
  const [form, setForm] = useState({ offer:'', want:'', contact:'', method:'correio' })

  useEffect(() => {
    if (!Cookies.get('token')) { router.push('/login'); return }
    loadListings()
  }, [])

  async function loadListings() {
    try {
      const res = await fetch(`${API}/api/listings`, {
        headers: { Authorization: `Bearer ${Cookies.get('token')}` }
      })
      const data = await res.json()
      setListings(Array.isArray(data) ? data : [])
    } catch { setListings([]) }
    finally { setLoading(false) }
  }

  async function postListing(e) {
    e.preventDefault()
    setPosting(true)
    try {
      const res = await fetch(`${API}/api/listings`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${Cookies.get('token')}` },
        body: JSON.stringify(form)
      })
      if (!res.ok) throw new Error()
      showToast('✅ Anúncio publicado!')
      setShowForm(false)
      setForm({ offer:'', want:'', contact:'', method:'correio' })
      loadListings()
    } catch { showToast('❌ Erro ao publicar') }
    finally { setPosting(false) }
  }

  function showToast(msg) { setToast(msg); setTimeout(()=>setToast(null),3000) }

  const EMOJIS = ['🦁','⭐','🐅','🦅','🔥','💎','🎯','🌟']
  function emo(name) { return EMOJIS[(name||'').charCodeAt(0)%EMOJIS.length] }

  return (
    <div style={{minHeight:'100vh',background:'#0a0a0a',color:'white',fontFamily:'Barlow'}}>
      {toast && (
        <div style={{position:'fixed',bottom:'20px',left:'50%',transform:'translateX(-50%)',background:'#141414',border:'1px solid rgba(255,255,255,0.15)',color:'white',padding:'8px 18px',borderRadius:'99px',fontSize:'13px',fontWeight:'700',zIndex:999,whiteSpace:'nowrap'}}>
          {toast}
        </div>
      )}

      <div style={{background:'#141414',borderBottom:'1px solid rgba(255,255,255,0.06)',position:'sticky',top:0,zIndex:100}}>
        <div style={{height:'4px',display:'flex'}}>{COLORS.map((c,i)=><span key={i} style={{flex:1,background:c}}/>)}</div>
        <div style={{padding:'10px 16px',display:'flex',alignItems:'center',gap:'12px'}}>
          <Link href="/dashboard" style={{color:'rgba(255,255,255,0.4)',fontSize:'13px'}}>← Voltar</Link>
          <div style={{fontFamily:'Barlow Condensed',fontSize:'18px',fontWeight:'900',letterSpacing:'1px',flex:1}}>
            ANÚNCIOS DE <span style={{color:'#E8175D'}}>TROCA</span>
          </div>
          <button onClick={() => setShowForm(true)}
            style={{padding:'7px 14px',background:'#E8175D',border:'none',borderRadius:'99px',color:'white',fontFamily:'Barlow Condensed',fontSize:'13px',fontWeight:'700',cursor:'pointer',letterSpacing:'.5px'}}>
            + PUBLICAR
          </button>
        </div>
      </div>

      <div style={{maxWidth:'700px',margin:'0 auto',padding:'16px'}}>
        {/* HERO */}
        <div style={{background:'linear-gradient(135deg,#E8175D,#6B2FFA)',borderRadius:'16px',padding:'18px',marginBottom:'16px',position:'relative',overflow:'hidden'}}>
          <div style={{position:'absolute',right:'-10px',top:'-20px',fontFamily:'Barlow Condensed',fontSize:'100px',fontWeight:'900',color:'rgba(255,255,255,0.08)',lineHeight:'1'}}>⇄</div>
          <div style={{fontFamily:'Barlow Condensed',fontSize:'22px',fontWeight:'900',color:'white',marginBottom:'4px'}}>Central de Trocas</div>
          <div style={{fontSize:'12px',color:'rgba(255,255,255,0.7)',marginBottom:'14px'}}>Anúncios reais de colecionadores do Brasil</div>
          <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:'8px'}}>
            {[
              [listings.length,'ANÚNCIOS ATIVOS'],
              [listings.filter(l=>l.method==='correio').length,'VIA CORREIO'],
              [listings.filter(l=>l.method==='presencial').length,'PRESENCIAL']
            ].map(([v,l])=>(
              <div key={l} style={{background:'rgba(255,255,255,0.12)',borderRadius:'8px',padding:'8px',textAlign:'center'}}>
                <div style={{fontFamily:'Barlow Condensed',fontSize:'22px',fontWeight:'900',color:'white'}}>{v}</div>
                <div style={{fontSize:'8px',color:'rgba(255,255,255,0.6)',letterSpacing:'.5px',fontWeight:'700'}}>{l}</div>
              </div>
            ))}
          </div>
        </div>

        {/* PUBLICAR BOX */}
        <div onClick={() => setShowForm(true)}
          style={{background:'#141414',border:'2px dashed rgba(232,23,93,0.3)',borderRadius:'16px',padding:'14px',marginBottom:'16px',display:'flex',alignItems:'center',gap:'12px',cursor:'pointer'}}>
          <div style={{width:'42px',height:'42px',borderRadius:'11px',background:'#E8175D',display:'flex',alignItems:'center',justifyContent:'center',fontSize:'22px',flexShrink:0}}>+</div>
          <div>
            <div style={{fontFamily:'Barlow Condensed',fontSize:'15px',fontWeight:'700',color:'#E8175D',letterSpacing:'.3px'}}>PUBLICAR MINHA LISTA DE TROCAS</div>
            <div style={{fontSize:'11px',color:'rgba(255,255,255,0.4)',marginTop:'2px'}}>Diga o que você tem e o que precisa</div>
          </div>
          <div style={{marginLeft:'auto',color:'rgba(232,23,93,0.4)',fontSize:'20px',fontWeight:'900'}}>→</div>
        </div>

        {/* LISTA */}
        {loading ? (
          <div style={{textAlign:'center',padding:'40px',color:'rgba(255,255,255,0.4)',fontFamily:'Barlow Condensed',fontSize:'16px',fontWeight:'700',letterSpacing:'1px'}}>
            CARREGANDO...
          </div>
        ) : listings.length === 0 ? (
          <div style={{textAlign:'center',padding:'40px',color:'rgba(255,255,255,0.3)'}}>
            <div style={{fontSize:'36px',marginBottom:'10px'}}>📋</div>
            <div style={{fontFamily:'Barlow Condensed',fontSize:'16px',fontWeight:'700',marginBottom:'6px'}}>Nenhum anúncio ainda</div>
            <div style={{fontSize:'13px'}}>Seja o primeiro a publicar!</div>
          </div>
        ) : listings.map(t => (
          <div key={t.id} style={{background:'#141414',border:'1px solid rgba(255,255,255,0.08)',borderRadius:'14px',padding:'14px',marginBottom:'10px',transition:'border-color .15s'}}>
            <div style={{display:'flex',alignItems:'center',gap:'8px',marginBottom:'10px'}}>
              <div style={{width:'38px',height:'38px',borderRadius:'50%',background:'#E8175D',display:'flex',alignItems:'center',justifyContent:'center',fontSize:'17px',flexShrink:0}}>
                {emo(t.userName)}
              </div>
              <div style={{flex:1}}>
                <div style={{fontFamily:'Barlow Condensed',fontSize:'15px',fontWeight:'700'}}>{t.userName}</div>
                <div style={{display:'flex',gap:'6px',alignItems:'center',marginTop:'2px'}}>
                  <span style={{fontSize:'10px',color:'rgba(255,255,255,0.4)'}}>{t.userState}</span>
                  <span style={{fontSize:'9px',fontWeight:'700',padding:'2px 7px',borderRadius:'99px',border:'1px solid',color:t.method==='correio'?'#1A56DB':'#22C55E',background:t.method==='correio'?'rgba(26,86,219,0.1)':'rgba(34,197,94,0.1)',borderColor:t.method==='correio'?'#1A56DB':'#22C55E'}}>
                    {t.method === 'correio' ? '📬 Correio' : '🤝 Presencial'}
                  </span>
                </div>
              </div>
              <div style={{textAlign:'right'}}>
                <div style={{color:'#F5C518',fontSize:'12px'}}>★★★★★</div>
                <div style={{fontFamily:'Barlow Condensed',fontSize:'14px',fontWeight:'900'}}>{Number(t.reputation||5).toFixed(1)}</div>
              </div>
            </div>
            <div style={{display:'grid',gridTemplateColumns:'1fr auto 1fr',gap:'8px',marginBottom:'10px'}}>
              <div style={{background:'#1e1e1e',borderRadius:'8px',padding:'9px'}}>
                <div style={{fontSize:'8px',fontWeight:'700',letterSpacing:'1px',color:'#22C55E',marginBottom:'4px'}}>OFERECE</div>
                <div style={{fontSize:'12px',color:'rgba(255,255,255,0.8)',lineHeight:'1.4'}}>{t.offer}</div>
              </div>
              <div style={{display:'flex',alignItems:'center',fontFamily:'Barlow Condensed',fontSize:'22px',fontWeight:'900',color:'rgba(255,255,255,0.2)'}}>⇄</div>
              <div style={{background:'#1e1e1e',borderRadius:'8px',padding:'9px'}}>
                <div style={{fontSize:'8px',fontWeight:'700',letterSpacing:'1px',color:'#1A56DB',marginBottom:'4px'}}>PRECISA</div>
                <div style={{fontSize:'12px',color:'rgba(255,255,255,0.8)',lineHeight:'1.4'}}>{t.want}</div>
              </div>
            </div>
            <div style={{display:'flex',alignItems:'center',justifyContent:'space-between'}}>
              <div style={{fontSize:'10px',color:'rgba(255,255,255,0.3)'}}>
                ⏱ {new Date(t.createdAt).toLocaleDateString('pt-BR')}
              </div>
              <button onClick={() => {
                navigator.clipboard?.writeText(t.contact)
                showToast(`📋 Contato copiado: ${t.contact}`)
              }} style={{padding:'7px 16px',background:'#E8175D',border:'none',borderRadius:'99px',color:'white',fontFamily:'Barlow Condensed',fontSize:'12px',fontWeight:'700',cursor:'pointer',letterSpacing:'.5px'}}>
                CONTATAR
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* FORM MODAL */}
      {showForm && (
        <div style={{position:'fixed',inset:0,background:'rgba(0,0,0,0.75)',display:'flex',alignItems:'flex-start',justifyContent:'center',padding:'16px',zIndex:200,overflowY:'auto'}}>
          <div style={{background:'#141414',border:'1px solid rgba(255,255,255,0.1)',borderRadius:'20px',width:'100%',maxWidth:'400px',overflow:'hidden',marginTop:'20px'}}>
            <div style={{height:'4px',display:'flex'}}>{COLORS.map((c,i)=><span key={i} style={{flex:1,background:c}}/>)}</div>
            <div style={{padding:'14px 16px',borderBottom:'1px solid rgba(255,255,255,0.06)',display:'flex',justifyContent:'space-between',alignItems:'center'}}>
              <div style={{fontFamily:'Barlow Condensed',fontSize:'18px',fontWeight:'700',letterSpacing:'.5px'}}>PUBLICAR TROCA</div>
              <button onClick={() => setShowForm(false)} style={{background:'rgba(255,255,255,0.1)',border:'none',borderRadius:'50%',width:'28px',height:'28px',color:'white',cursor:'pointer',fontSize:'14px',fontWeight:'900'}}>✕</button>
            </div>
            <form onSubmit={postListing} style={{padding:'16px'}}>
              <div style={{marginBottom:'12px'}}>
                <label style={{display:'block',fontSize:'9px',fontWeight:'700',letterSpacing:'.8px',color:'rgba(255,255,255,0.5)',marginBottom:'6px'}}>MÉTODO</label>
                <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'6px'}}>
                  {['correio','presencial'].map(m => (
                    <div key={m} onClick={() => setForm({...form,method:m})}
                      style={{padding:'10px',borderRadius:'8px',border:`2px solid ${form.method===m?'#1A56DB':'rgba(255,255,255,0.1)'}`,background:form.method===m?'rgba(26,86,219,0.1)':'transparent',cursor:'pointer',textAlign:'center',fontSize:'12px',fontWeight:'700',color:form.method===m?'#1A56DB':'rgba(255,255,255,0.5)'}}>
                      {m === 'correio' ? '📬 Correio' : '🤝 Presencial'}
                    </div>
                  ))}
                </div>
              </div>
              {[
                ['O QUE VOCÊ OFERECE *','offer','Ex: BRA 7 12 18, ARG 3...'],
                ['O QUE VOCÊ PRECISA *','want','Ex: FRA 1 2, ESP 8...'],
                ['CONTATO *','contact','WhatsApp, @instagram...'],
              ].map(([l,k,p]) => (
                <div key={k} style={{marginBottom:'10px'}}>
                  <label style={{display:'block',fontSize:'9px',fontWeight:'700',letterSpacing:'.8px',color:'rgba(255,255,255,0.5)',marginBottom:'5px'}}>{l}</label>
                  <input required value={form[k]} onChange={e=>setForm({...form,[k]:e.target.value})} placeholder={p}
                    style={{width:'100%',padding:'9px 12px',background:'#1e1e1e',border:'1px solid rgba(255,255,255,0.1)',borderRadius:'8px',color:'white',fontSize:'13px',outline:'none',fontFamily:'Barlow'}}/>
                </div>
              ))}
              <div style={{display:'grid',gridTemplateColumns:'1fr 2fr',gap:'8px',marginTop:'4px'}}>
                <button type="button" onClick={() => setShowForm(false)}
                  style={{padding:'11px',background:'transparent',border:'1px solid rgba(255,255,255,0.1)',borderRadius:'10px',color:'rgba(255,255,255,0.5)',fontSize:'13px',cursor:'pointer',fontFamily:'Barlow'}}>
                  Cancelar
                </button>
                <button type="submit" disabled={posting}
                  style={{padding:'11px',background:'#E8175D',border:'none',borderRadius:'10px',color:'white',fontFamily:'Barlow Condensed',fontSize:'16px',fontWeight:'700',cursor:'pointer',letterSpacing:'.5px',opacity:posting?.7:1}}>
                  {posting ? 'PUBLICANDO...' : 'PUBLICAR →'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
