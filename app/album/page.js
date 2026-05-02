'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Cookies from 'js-cookie'
import Link from 'next/link'

const GRUPOS = [
  {n:'A',cor:'#E8175D',p:[{n:'México',c:'MEX',f:'mx'},{n:'África do Sul',c:'RSA',f:'za'},{n:'Coreia do Sul',c:'KOR',f:'kr'},{n:'Rep. Tcheca',c:'CZE',f:'cz'}]},
  {n:'B',cor:'#6B2FFA',p:[{n:'Canadá',c:'CAN',f:'ca'},{n:'Bósnia',c:'BIH',f:'ba'},{n:'Catar',c:'QAT',f:'qa'},{n:'Suíça',c:'SUI',f:'ch'}]},
  {n:'C',cor:'#00C9B1',p:[{n:'Brasil',c:'BRA',f:'br'},{n:'Marrocos',c:'MAR',f:'ma'},{n:'Haiti',c:'HAI',f:'ht'},{n:'Escócia',c:'SCO',f:'gb-sct'}]},
  {n:'D',cor:'#FF6B00',p:[{n:'EUA',c:'USA',f:'us'},{n:'Paraguai',c:'PAR',f:'py'},{n:'Austrália',c:'AUS',f:'au'},{n:'Turquia',c:'TUR',f:'tr'}]},
  {n:'E',cor:'#1A56DB',p:[{n:'Alemanha',c:'GER',f:'de'},{n:'Curaçao',c:'CUW',f:'cw'},{n:'Costa do Marfim',c:'CIV',f:'ci'},{n:'Equador',c:'ECU',f:'ec'}]},
  {n:'F',cor:'#22C55E',p:[{n:'Holanda',c:'NED',f:'nl'},{n:'Japão',c:'JPN',f:'jp'},{n:'Suécia',c:'SWE',f:'se'},{n:'Tunísia',c:'TUN',f:'tn'}]},
  {n:'G',cor:'#F5C518',p:[{n:'Bélgica',c:'BEL',f:'be'},{n:'Egito',c:'EGY',f:'eg'},{n:'Irã',c:'IRN',f:'ir'},{n:'Nova Zelândia',c:'NZL',f:'nz'}]},
  {n:'H',cor:'#E8175D',p:[{n:'Espanha',c:'ESP',f:'es'},{n:'Cabo Verde',c:'CPV',f:'cv'},{n:'Arábia Saudita',c:'KSA',f:'sa'},{n:'Uruguai',c:'URU',f:'uy'}]},
  {n:'I',cor:'#6B2FFA',p:[{n:'França',c:'FRA',f:'fr'},{n:'Senegal',c:'SEN',f:'sn'},{n:'Iraque',c:'IRQ',f:'iq'},{n:'Noruega',c:'NOR',f:'no'}]},
  {n:'J',cor:'#00C9B1',p:[{n:'Argentina',c:'ARG',f:'ar'},{n:'Argélia',c:'ALG',f:'dz'},{n:'Áustria',c:'AUT',f:'at'},{n:'Jordânia',c:'JOR',f:'jo'}]},
  {n:'K',cor:'#FF6B00',p:[{n:'Portugal',c:'POR',f:'pt'},{n:'RD Congo',c:'COD',f:'cd'},{n:'Uzbequistão',c:'UZB',f:'uz'},{n:'Colômbia',c:'COL',f:'co'}]},
  {n:'L',cor:'#1A56DB',p:[{n:'Inglaterra',c:'ENG',f:'gb-eng'},{n:'Croácia',c:'CRO',f:'hr'},{n:'Gana',c:'GHA',f:'gh'},{n:'Panamá',c:'PAN',f:'pa'}]},
]

const ESPECIAIS = [
  {n:'FWC 1-8',cor:'#1A56DB',icone:'🏆',desc:'Emblema, Bola, Mascotes, Slogan',
   codes:['FWC_01','FWC_02','FWC_03','FWC_04','FWC_05','FWC_06','FWC_07','FWC_08'],
   nums:['FWC1','FWC2','FWC3','FWC4','FWC5','FWC6','FWC7','FWC8']},
  {n:'FWC History 9-19',cor:'#6B2FFA',icone:'📜',desc:'Historia das Copas',
   codes:['FWC_09','FWC_10','FWC_11','FWC_12','FWC_13','FWC_14','FWC_15','FWC_16','FWC_17','FWC_18','FWC_19'],
   nums:['FWC9','FWC10','FWC11','FWC12','FWC13','FWC14','FWC15','FWC16','FWC17','FWC18','FWC19']},
  {n:'Coca-Cola CC1-12',cor:'#E8175D',icone:'🥤',desc:'Jogadores especiais',
   codes:['CC_01','CC_02','CC_03','CC_04','CC_05','CC_06','CC_07','CC_08','CC_09','CC_10','CC_11','CC_12'],
   nums:['CC1','CC2','CC3','CC4','CC5','CC6','CC7','CC8','CC9','CC10','CC11','CC12']},
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
  const [activeTab, setActiveTab] = useState('album')

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
      const res = await fetch(API + '/api/album', { headers: { Authorization: 'Bearer ' + token } })
      if (res.ok) {
        const data = await res.json()
        const map = {}
        data.stickers?.forEach(s => {
          map[s.sticker.code] = s.status
          if (s.quantity > 1) map[s.sticker.code + '_qty'] = s.quantity
        })
        // Se banco tem dados, usa banco. Se banco vazio, tenta localStorage
        if (Object.keys(map).length > 0) {
          setStickers(map)
          localStorage.setItem('fwc26_album', JSON.stringify(map))
        } else {
          const saved = localStorage.getItem('fwc26_album')
          if (saved) {
            const parsed = JSON.parse(saved)
            setStickers(parsed)
            // Re-envia dados do localStorage para o banco
            const updates = Object.entries(parsed)
              .filter(([k,v]) => !k.endsWith('_qty') && v !== 'MISSING')
              .map(([k,v]) => ({ stickerCode: k, status: v, quantity: parsed[k+'_qty'] || 1 }))
            if (updates.length > 0) {
              fetch(API + '/api/album/stickers', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json', Authorization: 'Bearer ' + token },
                body: JSON.stringify({ updates })
              }).then(() => console.log('Sync: ' + updates.length + ' figurinhas sincronizadas com o banco'))
              .catch(e => console.error('Sync error:', e))
            }
          }
        }
      } else {
        const saved = localStorage.getItem('fwc26_album')
        if (saved) setStickers(JSON.parse(saved))
      }
    } catch(e) {
      console.error('loadAlbum error:', e)
      const saved = localStorage.getItem('fwc26_album')
      if (saved) setStickers(JSON.parse(saved))
    } finally { setLoading(false) }
  }

  async function saveToBank() {
    const token = Cookies.get('token')
    if (!token || pendingUpdates.length === 0) return
    setSaving(true)
    try {
      await fetch(API + '/api/album/stickers', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', Authorization: 'Bearer ' + token },
        body: JSON.stringify({ updates: pendingUpdates })
      })
      setPendingUpdates([])
    } catch {
    } finally { setSaving(false) }
  }

  function getStatus(code) { return stickers[code] || 'MISSING' }
  function getQty(code) { return stickers[code + '_qty'] || 1 }

  function updateSticker(code, status, qty) {
    const updated = Object.assign({}, stickers)
    if (status === 'MISSING') {
      delete updated[code]
      delete updated[code + '_qty']
    } else {
      updated[code] = status
      if (qty > 1) updated[code + '_qty'] = qty
      else delete updated[code + '_qty']
    }
    setStickers(updated)
    localStorage.setItem('fwc26_album', JSON.stringify(updated))
    setPendingUpdates(prev => [...prev.filter(u => u.stickerCode !== code), { stickerCode: code, status, quantity: qty }])
  }

  function togStk(code) {
    const cur = getStatus(code)
    const curQty = getQty(code)
    let next, qty
    if (cur === 'MISSING') { next = 'HAVE'; qty = 1 }
    else if (cur === 'HAVE') { next = 'REPEATED'; qty = 1 }
    else if (cur === 'REPEATED' && curQty < 9) { next = 'REPEATED'; qty = curQty + 1 }
    else { next = 'MISSING'; qty = 0 }
    updateSticker(code, next, qty)
    const msg = next === 'HAVE' ? 'Tenho!' : next === 'REPEATED' ? (qty + 'x Repetidas!') : 'Removida'
    setToast(msg)
    setTimeout(() => setToast(null), 1200)
  }

  function addRep(code) {
    const qty = Math.min(getQty(code) + 1, 8)
    updateSticker(code, 'REPEATED', qty)
    setToast(qty + 'x repetidas!')
    setTimeout(() => setToast(null), 1000)
  }

  function removeRep(code) {
    const curQty = getQty(code)
    if (curQty <= 1) {
      updateSticker(code, 'HAVE', 1)
      setToast('Voltou para TENHO')
    } else {
      updateSticker(code, 'REPEATED', curQty - 1)
      setToast((curQty - 1) + 'x repetidas')
    }
    setTimeout(() => setToast(null), 1000)
  }

  function pHave(pais) {
    return Array.from({ length: 20 }).filter((_, i) =>
      getStatus(pais.c + '_' + String(i + 1).padStart(2, '0')) !== 'MISSING'
    ).length
  }

  useEffect(() => {
    if (!search.trim()) { setSearchResults([]); return }
    const q = search.trim().toUpperCase()
    const results = []
    GRUPOS.forEach(g => g.p.forEach(p => {
      for (let i = 1; i <= 20; i++) {
        const code = p.c + '_' + String(i).padStart(2, '0')
        if (p.n.toUpperCase().includes(q) || p.c.includes(q) || String(i) === q)
          results.push({ code, label: p.n + ' #' + i, grupo: g, pais: p })
      }
    }))
    setSearchResults(results.slice(0, 20))
  }, [search])

  const allPaises = GRUPOS.flatMap(g => g.p.map(p => ({ ...p, grupo: g })))

  function navModal(dir) {
    if (!modal || modal.especial) return
    const idx = allPaises.findIndex(p => p.c === modal.pais.c)
    const next = allPaises[(idx + dir + allPaises.length) % allPaises.length]
    setModal({ pais: next, grupo: next.grupo })
  }

  const allCodes = GRUPOS.flatMap(g => g.p.flatMap(p =>
    Array.from({ length: 20 }, (_, i) => p.c + '_' + String(i + 1).padStart(2, '0'))
  ))
  const total = allCodes.length
  const have = allCodes.filter(c => getStatus(c) !== 'MISSING').length
  const repeated = allCodes.filter(c => getStatus(c) === 'REPEATED').length
  const pct = Math.round((have / total) * 100)

  const missingList = GRUPOS.flatMap(g => g.p.flatMap(p =>
    Array.from({ length: 20 }, (_, i) => {
      const code = p.c + '_' + String(i + 1).padStart(2, '0')
      return getStatus(code) === 'MISSING' ? { code, num: i + 1, pais: p, grupo: g } : null
    }).filter(Boolean)
  ))

  const missingByPais = GRUPOS.flatMap(g => g.p.map(p => {
    const items = Array.from({ length: 20 }, (_, i) => {
      const code = p.c + '_' + String(i + 1).padStart(2, '0')
      return getStatus(code) === 'MISSING' ? { code, num: i + 1 } : null
    }).filter(Boolean)
    return items.length > 0 ? { pais: p, grupo: g, items } : null
  })).filter(Boolean)

  const shinyList = GRUPOS.flatMap(g => g.p.flatMap(p => {
    const code = p.c + '_01'
    return [{ code, num: 1, pais: p, grupo: g, status: getStatus(code), qty: getQty(code) }]
  }))
  const shinyHave = shinyList.filter(s => s.status !== 'MISSING').length

  const repeatedByPais = GRUPOS.flatMap(g => g.p.map(p => {
    const items = Array.from({ length: 20 }, (_, i) => {
      const code = p.c + '_' + String(i + 1).padStart(2, '0')
      return getStatus(code) === 'REPEATED' ? { code, num: i + 1, qty: getQty(code) } : null
    }).filter(Boolean)
    return items.length > 0 ? { pais: p, grupo: g, items } : null
  })).filter(Boolean)

  function StickerBtn({ code, label, cor }) {
    const st = getStatus(code)
    const qty = getQty(code)
    const isHave = st === 'HAVE'
    const isRep = st === 'REPEATED'
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
        <div onClick={() => togStk(code)}
          style={{
            borderRadius: '8px', padding: '8px 4px',
            display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
            cursor: 'pointer', userSelect: 'none', transition: 'all .12s',
            background: isHave ? cor : isRep ? '#b8860b' : 'rgba(255,255,255,0.04)',
            border: '2px solid ' + (isHave ? cor : isRep ? '#F5C518' : 'rgba(255,255,255,0.07)'),
          }}>
          <div style={{ fontFamily: 'Barlow Condensed', fontSize: '14px', fontWeight: '900', color: isHave ? 'white' : isRep ? '#F5C518' : 'rgba(255,255,255,0.3)', lineHeight: '1', marginBottom: '1px' }}>
            {label}
          </div>
          <div style={{ fontSize: '10px', color: isHave ? 'rgba(255,255,255,0.8)' : isRep ? '#F5C518' : 'transparent', lineHeight: '1' }}>
            {isHave ? 'TENHO' : isRep ? (qty + 'x') : '-'}
          </div>
        </div>
        {isRep && (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '3px' }}>
            <button onClick={e => { e.stopPropagation(); removeRep(code) }}
              style={{ width: '20px', height: '20px', borderRadius: '50%', background: 'rgba(232,23,93,0.2)', border: '1px solid rgba(232,23,93,0.5)', color: '#E8175D', fontSize: '14px', fontWeight: '900', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', lineHeight: '1', padding: 0 }}>
              -
            </button>
            <span style={{ fontFamily: 'Barlow Condensed', fontSize: '12px', fontWeight: '900', color: '#F5C518', minWidth: '16px', textAlign: 'center' }}>{qty}</span>
            <button onClick={e => { e.stopPropagation(); addRep(code) }}
              style={{ width: '20px', height: '20px', borderRadius: '50%', background: 'rgba(34,197,94,0.2)', border: '1px solid rgba(34,197,94,0.5)', color: '#22C55E', fontSize: '14px', fontWeight: '900', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', lineHeight: '1', padding: 0 }}>
              +
            </button>
          </div>
        )}
      </div>
    )
  }

  if (loading) return (
    <div style={{ minHeight: '100vh', background: '#050a0f', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ textAlign: 'center' }}>
        <div style={{ fontSize: '72px', fontWeight: '900', color: 'white', fontFamily: 'Barlow Condensed', lineHeight: '1' }}>2<span style={{ color: '#F5C518' }}>6</span></div>
        <div style={{ fontSize: '13px', letterSpacing: '3px', color: 'rgba(255,255,255,0.4)', marginTop: '8px', fontFamily: 'Barlow Condensed', fontWeight: '700' }}>CARREGANDO...</div>
      </div>
    </div>
  )

  return (
    <div style={{ minHeight: '100vh', background: '#050a0f', color: 'white', fontFamily: 'Barlow', overflowX: 'hidden' }}>

      {toast && (
        <div style={{ position: 'fixed', bottom: '24px', left: '50%', transform: 'translateX(-50%)', background: 'rgba(20,20,20,0.95)', border: '1px solid rgba(255,255,255,0.15)', color: 'white', padding: '8px 20px', borderRadius: '99px', fontSize: '13px', fontWeight: '700', zIndex: 1000, whiteSpace: 'nowrap' }}>
          {toast}
        </div>
      )}

      <div style={{ position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100, background: 'rgba(5,10,15,0.92)', backdropFilter: 'blur(16px)', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
        <div style={{ height: '3px', background: 'linear-gradient(90deg,#E8175D,#FF6B00,#F5C518,#22C55E,#00C9B1,#1A56DB,#6B2FFA)' }} />
        <div style={{ padding: '8px 20px', display: 'flex', alignItems: 'center', gap: '10px', maxWidth: '1200px', margin: '0 auto', flexWrap: 'wrap' }}>
          <Link href="/dashboard" style={{ color: 'rgba(255,255,255,0.4)', fontSize: '13px', textDecoration: 'none', flexShrink: 0 }}>Voltar</Link>
          <div style={{ fontFamily: 'Barlow Condensed', fontSize: '16px', fontWeight: '900', letterSpacing: '2px', flexShrink: 0 }}>MEU <span style={{ color: '#F5C518' }}>ALBUM</span></div>
          <div style={{ display: 'flex', gap: '4px', flexShrink: 0 }}>
            <button onClick={() => setActiveTab('album')}
              style={{ padding: '5px 12px', borderRadius: '99px', border: 'none', cursor: 'pointer', fontFamily: 'Barlow Condensed', fontSize: '12px', fontWeight: '700', letterSpacing: '.5px', background: activeTab === 'album' ? '#F5C518' : 'rgba(255,255,255,0.08)', color: activeTab === 'album' ? '#0a0a0a' : 'rgba(255,255,255,0.5)' }}>
              ALBUM
            </button>
            <button onClick={() => setActiveTab('repetidas')}
              style={{ padding: '5px 12px', borderRadius: '99px', border: 'none', cursor: 'pointer', fontFamily: 'Barlow Condensed', fontSize: '12px', fontWeight: '700', letterSpacing: '.5px', background: activeTab === 'repetidas' ? '#F5C518' : 'rgba(255,255,255,0.08)', color: activeTab === 'repetidas' ? '#0a0a0a' : 'rgba(255,255,255,0.5)' }}>
              {'REP (' + repeated + ')'}
            </button>
            <button onClick={() => setActiveTab('faltam')}
              style={{ padding: '5px 12px', borderRadius: '99px', border: 'none', cursor: 'pointer', fontFamily: 'Barlow Condensed', fontSize: '12px', fontWeight: '700', letterSpacing: '.5px', background: activeTab === 'faltam' ? '#E8175D' : 'rgba(255,255,255,0.08)', color: activeTab === 'faltam' ? 'white' : 'rgba(255,255,255,0.5)' }}>
              {'FALTAM (' + (total - have) + ')'}
            </button>
            <button onClick={() => setActiveTab('brilhantes')}
              style={{ padding: '5px 12px', borderRadius: '99px', border: 'none', cursor: 'pointer', fontFamily: 'Barlow Condensed', fontSize: '12px', fontWeight: '700', letterSpacing: '.5px', background: activeTab === 'brilhantes' ? '#F5C518' : 'rgba(255,255,255,0.08)', color: activeTab === 'brilhantes' ? '#0a0a0a' : 'rgba(255,255,255,0.5)' }}>
              {'ESCUDOS (' + shinyHave + '/48)'}
            </button>
          </div>
          <div style={{ flex: 1, position: 'relative', maxWidth: '340px', margin: '0 auto', minWidth: '120px' }}>
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Buscar... BRA, 7, Brasil"
              style={{ width: '100%', padding: '6px 12px 6px 28px', background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.12)', borderRadius: '99px', color: 'white', fontSize: '12px', outline: 'none', boxSizing: 'border-box' }} />
            <span style={{ position: 'absolute', left: '9px', top: '50%', transform: 'translateY(-50%)', fontSize: '12px', color: 'rgba(255,255,255,0.4)' }}>🔍</span>
            {searchResults.length > 0 && (
              <div style={{ position: 'absolute', top: 'calc(100% + 6px)', left: 0, right: 0, background: '#141414', border: '1px solid rgba(255,255,255,0.12)', borderRadius: '12px', overflow: 'hidden', zIndex: 200, maxHeight: '260px', overflowY: 'auto' }}>
                {searchResults.map(r => {
                  const st = getStatus(r.code)
                  const qty = getQty(r.code)
                  return (
                    <div key={r.code} onClick={() => togStk(r.code)}
                      style={{ padding: '9px 14px', borderBottom: '1px solid rgba(255,255,255,0.06)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <img src={'https://flagcdn.com/w20/' + r.pais.f + '.png'} style={{ width: '20px', height: '13px', borderRadius: '2px', objectFit: 'cover' }} />
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: '13px', fontWeight: '700' }}>{r.label}</div>
                        <div style={{ fontSize: '10px', color: 'rgba(255,255,255,0.4)' }}>Grupo {r.grupo.n}</div>
                      </div>
                      <div style={{ fontFamily: 'Barlow Condensed', fontSize: '12px', fontWeight: '700', color: st === 'HAVE' ? r.grupo.cor : st === 'REPEATED' ? '#F5C518' : 'rgba(255,255,255,0.3)' }}>
                        {st === 'MISSING' ? 'FALTA' : st === 'HAVE' ? 'TENHO' : (qty + 'x REP')}
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
          <div style={{ fontSize: '11px', color: saving ? '#F5C518' : 'rgba(255,255,255,0.3)', fontWeight: '700', flexShrink: 0 }}>
            {saving ? 'Salvando...' : ('✓ ' + pct + '%')}
          </div>
        </div>
      </div>

      {activeTab === 'repetidas' ? (
        <div style={{ paddingTop: '60px', maxWidth: '1200px', margin: '0 auto', padding: '70px 20px 60px' }}>
          <div style={{ marginBottom: '20px' }}>
            <div style={{ fontFamily: 'Barlow Condensed', fontSize: '28px', fontWeight: '900', marginBottom: '4px' }}>
              MINHAS <span style={{ color: '#F5C518' }}>REPETIDAS</span>
            </div>
            <div style={{ fontSize: '13px', color: 'rgba(255,255,255,0.4)' }}>{repeated} figurinhas para trocar</div>
          </div>
          {repeated === 0 ? (
            <div style={{ textAlign: 'center', padding: '60px 20px', color: 'rgba(255,255,255,0.3)' }}>
              <div style={{ fontSize: '48px', marginBottom: '12px' }}>🔁</div>
              <div style={{ fontFamily: 'Barlow Condensed', fontSize: '18px', fontWeight: '700', marginBottom: '6px' }}>Nenhuma repetida ainda</div>
              <div style={{ fontSize: '13px' }}>Marque figurinhas como repetidas no album</div>
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(300px,1fr))', gap: '12px' }}>
              {repeatedByPais.map(group => (
                <div key={group.pais.c} style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '14px', overflow: 'hidden' }}>
                  <div style={{ padding: '10px 14px', borderBottom: '1px solid rgba(255,255,255,0.06)', display: 'flex', alignItems: 'center', gap: '10px', background: 'rgba(0,0,0,0.2)' }}>
                    <img src={'https://flagcdn.com/w40/' + group.pais.f + '.png'} style={{ width: '36px', height: '24px', borderRadius: '5px', objectFit: 'cover', border: '1px solid ' + group.grupo.cor, flexShrink: 0 }} />
                    <div style={{ flex: 1 }}>
                      <div style={{ fontFamily: 'Barlow Condensed', fontSize: '14px', fontWeight: '700' }}>{group.pais.n}</div>
                      <div style={{ fontSize: '10px', color: 'rgba(255,255,255,0.4)' }}>Grupo {group.grupo.n}</div>
                    </div>
                    <div style={{ fontFamily: 'Barlow Condensed', fontSize: '14px', fontWeight: '900', color: '#F5C518' }}>{group.items.length} fig.</div>
                  </div>
                  <div style={{ padding: '10px', display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                    {group.items.map(item => (
                      <div key={item.code} style={{ background: 'rgba(245,197,24,0.08)', border: '1px solid rgba(245,197,24,0.25)', borderRadius: '8px', padding: '4px 8px', display: 'flex', alignItems: 'center', gap: '5px' }}>
                        <span style={{ fontFamily: 'Barlow Condensed', fontSize: '14px', fontWeight: '900', color: '#F5C518' }}>{'#' + item.num}</span>
                        <button onClick={() => removeRep(item.code)}
                          style={{ width: '18px', height: '18px', borderRadius: '50%', background: 'rgba(232,23,93,0.2)', border: '1px solid rgba(232,23,93,0.4)', color: '#E8175D', fontSize: '12px', fontWeight: '900', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 0 }}>
                          -
                        </button>
                        <span style={{ fontFamily: 'Barlow Condensed', fontSize: '12px', fontWeight: '900', color: 'white', minWidth: '14px', textAlign: 'center' }}>{item.qty + 'x'}</span>
                        <button onClick={() => addRep(item.code)}
                          style={{ width: '18px', height: '18px', borderRadius: '50%', background: 'rgba(34,197,94,0.2)', border: '1px solid rgba(34,197,94,0.4)', color: '#22C55E', fontSize: '12px', fontWeight: '900', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 0 }}>
                          +
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      ) : activeTab === 'faltam' ? (
        <div style={{ paddingTop: '60px', maxWidth: '1200px', margin: '0 auto', padding: '70px 20px 60px' }}>
          <div style={{ marginBottom: '20px' }}>
            <div style={{ fontFamily: 'Barlow Condensed', fontSize: '28px', fontWeight: '900', marginBottom: '4px' }}>
              FIGURINHAS <span style={{ color: '#E8175D' }}>FALTAM</span>
            </div>
            <div style={{ fontSize: '13px', color: 'rgba(255,255,255,0.4)' }}>{(total - have) + ' figurinhas para completar o album'}</div>
          </div>
          {total - have === 0 ? (
            <div style={{ textAlign: 'center', padding: '60px 20px', color: 'rgba(255,255,255,0.3)' }}>
              <div style={{ fontSize: '48px', marginBottom: '12px' }}>🏆</div>
              <div style={{ fontFamily: 'Barlow Condensed', fontSize: '22px', fontWeight: '700', color: '#F5C518' }}>ALBUM COMPLETO!</div>
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(300px,1fr))', gap: '12px' }}>
              {missingByPais.map(group => (
                <div key={group.pais.c} style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '14px', overflow: 'hidden' }}>
                  <div style={{ padding: '10px 14px', borderBottom: '1px solid rgba(255,255,255,0.06)', display: 'flex', alignItems: 'center', gap: '10px', background: 'rgba(0,0,0,0.2)' }}>
                    <img src={'https://flagcdn.com/w40/' + group.pais.f + '.png'} style={{ width: '36px', height: '24px', borderRadius: '5px', objectFit: 'cover', border: '1px solid ' + group.grupo.cor, flexShrink: 0 }} />
                    <div style={{ flex: 1 }}>
                      <div style={{ fontFamily: 'Barlow Condensed', fontSize: '14px', fontWeight: '700' }}>{group.pais.n}</div>
                      <div style={{ fontSize: '10px', color: 'rgba(255,255,255,0.4)' }}>Grupo {group.grupo.n}</div>
                    </div>
                    <div style={{ fontFamily: 'Barlow Condensed', fontSize: '14px', fontWeight: '900', color: '#E8175D' }}>{group.items.length + ' fig.'}</div>
                  </div>
                  <div style={{ padding: '10px', display: 'flex', flexWrap: 'wrap', gap: '5px' }}>
                    {group.items.map(item => (
                      <div key={item.code} onClick={() => togStk(item.code)}
                        style={{ background: 'rgba(232,23,93,0.08)', border: '1px solid rgba(232,23,93,0.25)', borderRadius: '7px', padding: '4px 10px', cursor: 'pointer' }}>
                        <span style={{ fontFamily: 'Barlow Condensed', fontSize: '14px', fontWeight: '900', color: '#E8175D' }}>{'#' + item.num}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      ) : activeTab === 'brilhantes' ? (
        <div style={{ paddingTop: '60px', maxWidth: '1200px', margin: '0 auto', padding: '70px 20px 60px' }}>
          <div style={{ marginBottom: '20px' }}>
            <div style={{ fontFamily: 'Barlow Condensed', fontSize: '28px', fontWeight: '900', marginBottom: '4px' }}>
              FIGURINHAS <span style={{ color: '#F5C518' }}>BRILHANTES</span>
            </div>
            <div style={{ fontSize: '13px', color: 'rgba(255,255,255,0.4)' }}>{shinyHave + '/48 escudos coletados (figurinha 1 de cada selecao)'}</div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(300px,1fr))', gap: '10px' }}>
            {GRUPOS.map((g, gi) => (
              <div key={gi} style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(245,197,24,0.15)', borderRadius: '14px', overflow: 'hidden' }}>
                <div style={{ padding: '10px 14px', borderBottom: '1px solid rgba(245,197,24,0.1)', display: 'flex', alignItems: 'center', gap: '8px', background: 'rgba(245,197,24,0.04)' }}>
                  <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: g.cor, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'Barlow Condensed', fontSize: '16px', fontWeight: '900', color: 'white', flexShrink: 0 }}>{g.n}</div>
                  <div style={{ fontFamily: 'Barlow Condensed', fontSize: '14px', fontWeight: '900' }}>GRUPO {g.n}</div>
                  <div style={{ marginLeft: 'auto', fontSize: '11px', color: 'rgba(255,255,255,0.4)' }}>
                    {g.p.filter(p => getStatus(p.c+'_01') !== 'MISSING').length + '/' + g.p.length}
                  </div>
                </div>
                <div style={{ padding: '10px', display: 'grid', gridTemplateColumns: 'repeat(2,1fr)', gap: '6px' }}>
                  {g.p.map(p => (
                    <div key={p.c} style={{ background: 'rgba(255,255,255,0.03)', borderRadius: '10px', padding: '8px', border: '1px solid rgba(255,255,255,0.06)' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '6px' }}>
                        <img src={'https://flagcdn.com/w20/' + p.f + '.png'} style={{ width: '22px', height: '15px', borderRadius: '3px', objectFit: 'cover', flexShrink: 0 }} />
                        <span style={{ fontFamily: 'Barlow Condensed', fontSize: '12px', fontWeight: '700', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{p.n}</span>
                      </div>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '4px' }}>
                        {[1].map(num => {
                          const code = p.c + '_' + String(num).padStart(2, '0')
                          const st = getStatus(code)
                          const qty = getQty(code)
                          const isHave = st === 'HAVE'
                          const isRep = st === 'REPEATED'
                          return (
                            <div key={num} style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                              <div onClick={() => togStk(code)}
                                style={{ borderRadius: '7px', padding: '6px 4px', display: 'flex', flexDirection: 'column', alignItems: 'center', cursor: 'pointer', transition: 'all .12s',
                                  background: isHave ? 'linear-gradient(135deg,#b8860b,#F5C518)' : isRep ? 'linear-gradient(135deg,#b8860b,#F5C518)' : 'rgba(245,197,24,0.06)',
                                  border: '1.5px solid ' + (isHave || isRep ? '#F5C518' : 'rgba(245,197,24,0.2)') }}>
                                <div style={{ fontSize: '8px', color: 'rgba(245,197,24,0.6)', marginBottom: '1px' }}>⭐</div>
                                <div style={{ fontFamily: 'Barlow Condensed', fontSize: '13px', fontWeight: '900', color: isHave || isRep ? '#0a0a0a' : 'rgba(245,197,24,0.5)', lineHeight: '1' }}>{num}</div>
                                <div style={{ fontSize: '8px', color: isHave || isRep ? '#0a0a0a' : 'transparent', lineHeight: '1', marginTop: '1px' }}>{isHave ? 'TENHO' : isRep ? (qty+'x') : '-'}</div>
                              </div>
                              {isRep && (
                                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '2px' }}>
                                  <button onClick={e => { e.stopPropagation(); removeRep(code) }} style={{ width: '16px', height: '16px', borderRadius: '50%', background: 'rgba(232,23,93,0.2)', border: '1px solid rgba(232,23,93,0.4)', color: '#E8175D', fontSize: '12px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 0 }}>-</button>
                                  <span style={{ fontFamily: 'Barlow Condensed', fontSize: '10px', fontWeight: '900', color: '#F5C518' }}>{qty}</span>
                                  <button onClick={e => { e.stopPropagation(); addRep(code) }} style={{ width: '16px', height: '16px', borderRadius: '50%', background: 'rgba(34,197,94,0.2)', border: '1px solid rgba(34,197,94,0.4)', color: '#22C55E', fontSize: '12px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 0 }}>+</button>
                                </div>
                              )}
                            </div>
                          )
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div>
          <div style={{ paddingTop: '53px', background: 'linear-gradient(180deg,#0a1628 0%,#050a0f 100%)', padding: '70px 20px 28px', textAlign: 'center', position: 'relative', overflow: 'hidden' }}>
            <div style={{ position: 'absolute', top: '-20px', left: '50%', transform: 'translateX(-50%)', fontFamily: 'Barlow Condensed', fontSize: '200px', fontWeight: '900', color: 'rgba(255,255,255,0.02)', lineHeight: '1', pointerEvents: 'none', userSelect: 'none', whiteSpace: 'nowrap' }}>FWC26</div>
            <div style={{ position: 'relative', zIndex: 1, maxWidth: '500px', margin: '0 auto' }}>
              <div style={{ fontFamily: 'Barlow Condensed', fontSize: '10px', fontWeight: '700', letterSpacing: '4px', color: 'rgba(255,255,255,0.3)', marginBottom: '4px' }}>PANINI OFICIAL</div>
              <div style={{ fontFamily: 'Barlow Condensed', fontSize: '64px', fontWeight: '900', lineHeight: '.85', color: 'white', letterSpacing: '-3px', marginBottom: '14px' }}>2<span style={{ color: '#F5C518' }}>6</span></div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: 'rgba(255,255,255,0.4)', marginBottom: '5px', maxWidth: '320px', margin: '0 auto 5px' }}>
                <span>{have + '/' + total}</span>
                <span style={{ color: '#F5C518', fontWeight: '700', fontFamily: 'Barlow Condensed', fontSize: '13px' }}>{pct + '% completo'}</span>
              </div>
              <div style={{ height: '7px', background: 'rgba(255,255,255,0.06)', borderRadius: '99px', overflow: 'hidden', marginBottom: '12px', maxWidth: '320px', margin: '0 auto 12px' }}>
                <div style={{ height: '100%', width: (pct + '%'), background: 'linear-gradient(90deg,#E8175D,#FF6B00,#F5C518)', borderRadius: '99px', transition: 'width .5s' }} />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: '8px', maxWidth: '320px', margin: '0 auto' }}>
                {[['TENHO', have - repeated, '#22C55E'], ['REPETIDAS', repeated, '#F5C518'], ['FALTAM', total - have, '#E8175D']].map(item => (
                  <div key={item[0]} style={{ background: 'rgba(255,255,255,0.04)', borderRadius: '10px', padding: '10px 6px', border: '1px solid rgba(255,255,255,0.06)' }}>
                    <div style={{ fontFamily: 'Barlow Condensed', fontSize: '24px', fontWeight: '900', color: item[2], lineHeight: '1' }}>{item[1]}</div>
                    <div style={{ fontSize: '9px', color: 'rgba(255,255,255,0.35)', letterSpacing: '1px', fontWeight: '700', marginTop: '2px' }}>{item[0]}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '16px 20px 60px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' }}>
              <div style={{ height: '1px', flex: 1, background: 'rgba(255,255,255,0.08)' }} />
              <div style={{ fontFamily: 'Barlow Condensed', fontSize: '11px', fontWeight: '700', letterSpacing: '2px', color: 'rgba(255,255,255,0.4)' }}>ESPECIAIS</div>
              <div style={{ height: '1px', flex: 1, background: 'rgba(255,255,255,0.08)' }} />
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(260px,1fr))', gap: '8px', marginBottom: '20px' }}>
              {ESPECIAIS.map((e, ei) => {
                const eHave = e.codes.filter(c => getStatus(c) !== 'MISSING').length
                return (
                  <div key={ei} onClick={() => setModal({ especial: e })}
                    style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '14px', padding: '12px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: e.cor, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px', flexShrink: 0 }}>{e.icone}</div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontFamily: 'Barlow Condensed', fontSize: '14px', fontWeight: '700', marginBottom: '3px' }}>{e.n}</div>
                      <div style={{ fontSize: '10px', color: 'rgba(255,255,255,0.4)', marginBottom: '5px' }}>{e.desc}</div>
                      <div style={{ height: '3px', background: 'rgba(255,255,255,0.08)', borderRadius: '99px', overflow: 'hidden' }}>
                        <div style={{ height: '100%', width: (Math.round((eHave / e.codes.length) * 100) + '%'), background: e.cor, borderRadius: '99px' }} />
                      </div>
                    </div>
                    <div style={{ fontFamily: 'Barlow Condensed', fontSize: '16px', fontWeight: '900', color: e.cor, flexShrink: 0 }}>{eHave + '/' + e.codes.length}</div>
                  </div>
                )
              })}
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
              <div style={{ height: '1px', flex: 1, background: 'rgba(255,255,255,0.08)' }} />
              <div style={{ fontFamily: 'Barlow Condensed', fontSize: '11px', fontWeight: '700', letterSpacing: '2px', color: 'rgba(255,255,255,0.4)' }}>48 SELECOES</div>
              <div style={{ height: '1px', flex: 1, background: 'rgba(255,255,255,0.08)' }} />
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(320px,1fr))', gap: '10px' }}>
              {GRUPOS.map((g, gi) => {
                const grpCodes = g.p.flatMap(p => Array.from({ length: 20 }, (_, i) => p.c + '_' + String(i + 1).padStart(2, '0')))
                const grpHave = grpCodes.filter(c => getStatus(c) !== 'MISSING').length
                const grpPct = Math.round((grpHave / grpCodes.length) * 100)
                return (
                  <div key={gi} style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '14px', overflow: 'hidden' }}>
                    <div style={{ padding: '10px 14px', borderBottom: '1px solid rgba(255,255,255,0.06)', display: 'flex', alignItems: 'center', gap: '10px', background: 'rgba(0,0,0,0.2)' }}>
                      <div style={{ width: '36px', height: '36px', borderRadius: '9px', background: g.cor, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'Barlow Condensed', fontSize: '18px', fontWeight: '900', color: 'white', flexShrink: 0 }}>{g.n}</div>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontFamily: 'Barlow Condensed', fontSize: '14px', fontWeight: '900' }}>GRUPO {g.n}</div>
                        <div style={{ height: '3px', background: 'rgba(255,255,255,0.08)', borderRadius: '99px', overflow: 'hidden', marginTop: '4px' }}>
                          <div style={{ height: '100%', width: (grpPct + '%'), background: g.cor, borderRadius: '99px' }} />
                        </div>
                      </div>
                      <div style={{ fontFamily: 'Barlow Condensed', fontSize: '16px', fontWeight: '900', color: g.cor }}>{grpPct + '%'}</div>
                    </div>
                    <div style={{ padding: '8px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '5px' }}>
                      {g.p.map(p => {
                        const ph = pHave(p)
                        return (
                          <div key={p.c} onClick={() => setModal({ pais: p, grupo: g })}
                            style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '9px', padding: '9px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '7px' }}>
                            <img src={'https://flagcdn.com/w40/' + p.f + '.png'} style={{ width: '34px', height: '22px', borderRadius: '4px', objectFit: 'cover', border: '1px solid rgba(255,255,255,0.1)', flexShrink: 0 }} />
                            <div style={{ flex: 1, overflow: 'hidden', minWidth: 0 }}>
                              <div style={{ fontFamily: 'Barlow Condensed', fontSize: '12px', fontWeight: '700', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{p.n}</div>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '3px', marginTop: '2px' }}>
                                <div style={{ flex: 1, height: '3px', background: 'rgba(255,255,255,0.08)', borderRadius: '99px', overflow: 'hidden' }}>
                                  <div style={{ height: '100%', width: (Math.round((ph / 20) * 100) + '%'), background: g.cor, borderRadius: '99px' }} />
                                </div>
                                <span style={{ fontSize: '9px', color: 'rgba(255,255,255,0.4)', fontWeight: '700', flexShrink: 0 }}>{ph + '/20'}</span>
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
        </div>
      )}

      {modal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.85)', zIndex: 200, display: 'flex', alignItems: 'flex-end', justifyContent: 'center', backdropFilter: 'blur(8px)' }}
          onClick={e => { if (e.target === e.currentTarget) setModal(null) }}>
          <div
            onTouchStart={e => { if(!modal.especial) window._ts = e.touches[0].clientX }}
            onTouchEnd={e => {
              if (!modal.especial || !window._ts) return
              const diff = window._ts - e.changedTouches[0].clientX
              if (Math.abs(diff) > 50) navModal(diff > 0 ? 1 : -1)
              window._ts = null
            }}
            style={{ width: '100%', maxWidth: '620px', background: '#0d0d0d', borderRadius: '20px 20px 0 0', border: '2px solid rgba(255,255,255,0.1)', borderBottom: 'none', maxHeight: '85vh', display: 'flex', flexDirection: 'column' }}>
            <div style={{ padding: '14px 20px', borderBottom: '1px solid rgba(255,255,255,0.08)', display: 'flex', alignItems: 'center', gap: '12px', flexShrink: 0 }}>
              {modal.especial ? (
                <div style={{ width: '48px', height: '32px', borderRadius: '8px', background: modal.especial.cor, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '22px', flexShrink: 0 }}>{modal.especial.icone}</div>
              ) : (
                <img src={'https://flagcdn.com/w80/' + modal.pais.f + '.png'} style={{ width: '48px', height: '32px', borderRadius: '7px', objectFit: 'cover', border: '2px solid ' + modal.grupo.cor, flexShrink: 0 }} />
              )}
              <div style={{ flex: 1 }}>
                <div style={{ fontFamily: 'Barlow Condensed', fontSize: '20px', fontWeight: '900' }}>
                  {modal.especial ? modal.especial.n : modal.pais.n}
                </div>
                <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.4)' }}>
                  {modal.especial ? modal.especial.desc : ('Grupo ' + modal.grupo.n + ' · ' + pHave(modal.pais) + '/20')}
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexShrink: 0 }}>
                {!modal.especial && (
                  <button onClick={() => navModal(-1)}
                    style={{ width: '30px', height: '30px', borderRadius: '50%', background: 'rgba(255,255,255,0.08)', border: 'none', color: 'white', fontSize: '16px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    ←
                  </button>
                )}
                {!modal.especial && (
                  <button onClick={() => navModal(1)}
                    style={{ width: '30px', height: '30px', borderRadius: '50%', background: 'rgba(255,255,255,0.08)', border: 'none', color: 'white', fontSize: '16px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    →
                  </button>
                )}
                <button onClick={() => setModal(null)}
                  style={{ width: '30px', height: '30px', borderRadius: '50%', background: 'rgba(255,255,255,0.08)', border: 'none', color: 'white', fontSize: '14px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  X
                </button>
              </div>
            </div>
            <div style={{ padding: '6px 20px', fontSize: '10px', color: 'rgba(255,255,255,0.3)', flexShrink: 0 }}>
              Toque = marcar / - e + = ajustar repetidas
            </div>
            <div style={{ overflowY: 'auto', flex: 1, padding: '10px 20px 20px' }}>
              {modal.especial ? (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: '8px' }}>
                  {modal.especial.codes.map((code, ci) => (
                    <StickerBtn key={code} code={code} label={modal.especial.nums[ci]} cor={modal.especial.cor} />
                  ))}
                </div>
              ) : (
                <div>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5,1fr)', gap: '8px', marginBottom: '14px' }}>
                    {Array.from({ length: 20 }, (_, i) => {
                      const code = modal.pais.c + '_' + String(i + 1).padStart(2, '0')
                      return <StickerBtn key={code} code={code} label={String(i + 1)} cor={modal.grupo.cor} />
                    })}
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                    <button onClick={() => {
                      const codes = Array.from({ length: 20 }, (_, i) => modal.pais.c + '_' + String(i + 1).padStart(2, '0'))
                      const updated = Object.assign({}, stickers)
                      codes.forEach(code => { updated[code] = 'HAVE'; delete updated[code + '_qty'] })
                      setStickers(updated)
                      localStorage.setItem('fwc26_album', JSON.stringify(updated))
                      codes.forEach(code => setPendingUpdates(prev => [...prev.filter(u => u.stickerCode !== code), { stickerCode: code, status: 'HAVE', quantity: 1 }]))
                      setToast('Todas marcadas!')
                      setTimeout(() => setToast(null), 2000)
                    }}
                      style={{ padding: '10px', background: 'rgba(34,197,94,0.15)', border: '1px solid rgba(34,197,94,0.3)', borderRadius: '10px', color: '#22C55E', fontFamily: 'Barlow Condensed', fontSize: '13px', fontWeight: '700', cursor: 'pointer' }}>
                      MARCAR TODAS
                    </button>
                    <button onClick={() => {
                      const codes = Array.from({ length: 20 }, (_, i) => modal.pais.c + '_' + String(i + 1).padStart(2, '0'))
                      const updated = Object.assign({}, stickers)
                      codes.forEach(code => { delete updated[code]; delete updated[code + '_qty'] })
                      setStickers(updated)
                      localStorage.setItem('fwc26_album', JSON.stringify(updated))
                      codes.forEach(code => setPendingUpdates(prev => [...prev.filter(u => u.stickerCode !== code), { stickerCode: code, status: 'MISSING', quantity: 0 }]))
                      setToast('Todas removidas')
                      setTimeout(() => setToast(null), 2000)
                    }}
                      style={{ padding: '10px', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '10px', color: 'rgba(255,255,255,0.4)', fontFamily: 'Barlow Condensed', fontSize: '13px', fontWeight: '700', cursor: 'pointer' }}>
                      LIMPAR TUDO
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
