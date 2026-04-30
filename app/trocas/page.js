'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Cookies from 'js-cookie'
import Link from 'next/link'

const COLORS = ['#E8175D','#FF6B00','#F5C518','#22C55E','#00C9B1','#1A56DB','#6B2FFA']
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
      showToast('Anuncio publicado!')
      setShowForm(false)
      setForm({ offer:'', want:'', contact:'', method:'correio' })
      loadListings()
    } catch { showToast('Erro ao publicar') }
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
          <Link href="/dashboard" style={{color:'rgba(255,255,255,0.4)',fontSize:'13px'}}>Voltar</Link>
          <div style={{fontFamily:'Barlow Condensed',fontSize:'18px',fontWeight:'900',letterSpacing:'1px',flex:1}}>
            TROCAS
          </div>
          <button onClick={() => setShowForm(true)}
            style={{padding:'7px 14px',background:'#E8175D',border:'none',borderRadius:'99px',color:'white',fontFamily:'Barlow Condensed',fontSize:'13px',fontWeight:'700',cursor:'pointer'}}>
            PUBLICAR
          </button>
        </div>
      </div>
      <div style={{maxWidth:'700px',margin:'0 auto',padding:'16px'}}>
        <div style={{background:'linear-gradient(135deg,#E8175D,#6B2FFA)',borderRadius:'16px',padding:'18px',marginBottom:'16px'}}>
          <div style={{fontFamily:'Barlow Condensed',fontSize:'22px',fontWeight:'900',color:'white',marginBottom:'4px'}}>Central de Trocas</div>
          <div style={{fontSize:'12px',color:'rgba(255,255,255,0.7)',marginBottom:'14px'}}>Anuncios reais de colecionadores</div>
          <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:'8px'}}>
            {[[listings.length,'ANUNCIOS'],[listings.filter(l=>l.method==='correio').length,'CORREIO'],[listings.filter(l=>l.method==='presencial').length,'PRESENCIAL']].map(([v,l])=>(
              <div key={l} style={{background:'rgba(255,255,255,0.12)',borderRadius:'8px',padding:'8px',textAlign:'center'}}>
                <div style={{fontFamily:'Barlow Condensed',fontSize:'22px',fontWeight:'900',color:'white'}}>{v}</div>
                <div style={{fontSize:'8px',color:'rgba(255,255,255,0.6)',fontWeight:'700'}}>{l}</div>
              </div>
            ))}
          </div>
        </div>

        <div onClick={() => setShowForm(true)}
          style={{background:'#141414',border:'2px dashed rgba(232,23,93,0.3)',borderRadius:'16px',padding:'14px',marginBottom:'16px',display:'flex',alignItems:'center',gap:'12px',cursor:'pointer'}}>
          <div style={{width:'42px',height:'42px',borderRadius:'11px',background:'#E8175D',display:'flex',alignItems:'center',justifyContent:'center',fontSize:'22px',flexShrink:0}}>+</div>
          <div>
            <div style={{fontFamily:'Barlow Condensed',fontSize:'15px',fontWeight:'700',color:'#E8175D'}}>PUBLICAR MINHA LISTA</div>
            <div style={{fontSize:'11px',color:'rgba(255,255,255,0.4)'}}>Diga o que voce tem e precisa</div>
          </div>
        </div>

        {loading ? (
          <div style={{textAlign:'center',padding:'40px',color:'rgba(255,255,255,0.4)',fontFamily:'Barlow Condensed',fontSize:'16px',fontWeight:'700'}}>CARREGANDO...</div>
        ) : listings.length === 0 ? (
          <div style={{textAlign:'center',padding:'40px',color:'rgba(255,255,255,0.3)'}}>
            <div style={{fontSize:'36px',marginBottom:'10px'}}>📋</div>
            <div style={{fontFamily:'Barlow Condensed',fontSize:'16px',fontWeight:'700',marginBottom:'6px'}}>Nenhum anuncio ainda</div>
            <div style={{fontSize:'13px'}}>Seja o primeiro a publicar!</div>
          </div>
        ) : listings.map(t => (
          <div key={t.id} style={{background:'#141414',border:'1px solid rgba(255,255,255,0.08)',borderRadius:'14px',padding:'14px',marginBottom:'10px'}}>
            <div style={{display:'flex',alignItems:'center',gap:'8px',marginBottom:'10px'}}>
              <div style={{width:'38px',height:'38px',borderRadius:'50%',background:'#E8175D',display:'flex',alignItems:'center',justifyContent:'center',fontSize:'17px',flexShrink:0}}>{emo(t.userName)}</div>
              <div style={{flex:1}}>
                <div style={{fontFamily:'Barlow Condensed',fontSize:'15px',fontWeight:'700'}}>{t.userName}</div>
                <div style={{fontSize:'10px',color:'rgba(255,255,255,0.4)'}}>{t.userState} · {t.method==='correio'?'Correio':'Presencial'}</div>
              </div>
              <div style={{color:'#F5C518',fontSize:'12px'}}>★★★★★</div>
            </div>
            <div style={{display:'grid',gridTemplateColumns:'1fr auto 1fr',gap:'8px',marginBottom:'10px'}}>
              <div style={{background:'#1e1e1e',borderRadius:'8px',padding:'9px'}}>
                <div style={{fontSize:'8px',fontWeight:'700',color:'#22C55E',marginBottom:'4px'}}>OFERECE</div>
                <div style={{fontSize:'12px',color:'rgba(255,255,255,0.8)'}}>{t.offer}</div>
              </div>
              <div style={{display:'flex',alignItems:'center',fontSize:'22px',color:'rgba(255,255,255,0.2)'}}>⇄</div>
              <div style={{background:'#1e1e1e',borderRadius:'8px',padding:'9px'}}>
                <div style={{fontSize:'8px',fontWeight:'700',color:'#1A56DB',marginBottom:'4px'}}>PRECISA</div>
                <div style={{fontSize:'12px',color:'rgba(255,255,255,0.8)'}}>{t.want}</div>
              </div>
            </div>
            <div style={{display:'flex',alignItems:'center',justifyContent:'space-between'}}>
              <div style={{fontSize:'10px',color:'rgba(255,255,255,0.3)'}}>
                {new Date(t.createdAt).toLocaleDateString('pt-BR')}
              </div>
              <button onClick={() => { navigator.clipboard?.writeText(t.contact); showToast('Contato copiado!') }}
                style={{padding:'7px 16px',background:'#E8175D',border:'none',borderRadius:'99px',color:'white',fontFamily:'Barlow Condensed',fontSize:'12px',fontWeight:'700',cursor:'pointer'}}>
                CONTATAR
              </button>
            </div>
          </div>
        ))}
      </div>

      {showForm && (
        <div style={{position:'fixed',inset:0,background:'rgba(0,0,0,0.75)',display:'flex',alignItems:'flex-start',justifyContent:'center',padding:'16px',zIndex:200,overflowY:'auto'}}>
          <div style={{background:'#141414',border:'1px solid rgba(255,255,255,0.1)',borderRadius:'20px',width:'100%',maxWidth:'400px',overflow:'hidden',marginTop:'20px'}}>
            <div style={{height:'4px',display:'flex'}}>{COLORS.map((c,i)=><span key={i} style={{flex:1,background:c}}/>)}</div>
            <div style={{padding:'14px 16px',borderBottom:'1px solid rgba(255,255,255,0.06)',display:'flex',justifyContent:'space-between',alignItems:'center'}}>
              <div style={{fontFamily:'Barlow Condensed',fontSize:'18px',fontWeight:'700'}}>PUBLICAR TROCA</div>
              <button onClick={() => setShowForm(false)} style={{background:'rgba(255,255,255,0.1)',border:'none',borderRadius:'50%',width:'28px',height:'28px',color:'white',cursor:'pointer',fontSize:'14px'}}>X</button>
            </div>
            <form onSubmit={postListing} style={{padding:'16px'}}>
              <div style={{marginBottom:'12px'}}>
                <div style={{fontSize:'9px',fontWeight:'700',color:'rgba(255,255,255,0.5)',marginBottom:'6px'}}>METODO</div>
                <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'6px'}}>
                  {['correio','presencial'].map(m => (
                    <div key={m} onClick={() => setForm({...form,method:m})}
                      style={{padding:'10px',borderRadius:'8px',border:`2px solid ${form.method===m?'#1A56DB':'rgba(255,255,255,0.1)'}`,background:form.method===m?'rgba(26,86,219,0.1)':'transparent',cursor:'pointer',textAlign:'center',fontSize:'12px',fontWeight:'700',color:form.method===m?'#1A56DB':'rgba(255,255,255,0.5)'}}>
                      {m==='correio'?'Correio':'Presencial'}
                    </div>
                  ))}
                </div>
              </div>
              {[['O QUE OFERECE','offer','Ex: BRA 7 12 18'],['O QUE PRECISA','want','Ex: FRA 1 2'],['CONTATO','contact','WhatsApp ou instagram']].map(([l,k,p]) => (
                <div key={k} style={{marginBottom:'10px'}}>
                  <div style={{fontSize:'9px',fontWeight:'700',color:'rgba(255,255,255,0.5)',marginBottom:'5px'}}>{l}</div>
                  <input required value={form[k]} onChange={e=>setForm({...form,[k]:e.target.value})} placeholder={p}
                    style={{width:'100%',padding:'9px 12px',background:'#1e1e1e',border:'1px solid rgba(255,255,255,0.1)',borderRadius:'8px',color:'white',fontSize:'13px',outline:'none',boxSizing:'border-box'}}/>
                </div>
              ))}
              <div style={{display:'grid',gridTemplateColumns:'1fr 2fr',gap:'8px',marginTop:'4px'}}>
                <button type="button" onClick={() => setShowForm(false)}
                  style={{padding:'11px',background:'transparent',border:'1px solid rgba(255,255,255,0.1)',borderRadius:'10px',color:'rgba(255,255,255,0.5)',fontSize:'13px',cursor:'pointer'}}>
                  Cancelar
                </button>
                <button type="submit" disabled={posting}
                  style={{padding:'11px',background:'#E8175D',border:'none',borderRadius:'10px',color:'white',fontFamily:'Barlow Condensed',fontSize:'16px',fontWeight:'700',cursor:'pointer',opacity:posting?0.7:1}}>
                  {posting?'PUBLICANDO...':'PUBLICAR'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
