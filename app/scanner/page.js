'use client'
import { useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import Cookies from 'js-cookie'
import Link from 'next/link'

const PAISES = {
  MEX:'México',RSA:'África do Sul',KOR:'Coreia do Sul',CZE:'Rep. Tcheca',CAN:'Canadá',
  BIH:'Bósnia',QAT:'Catar',SUI:'Suíça',BRA:'Brasil',MAR:'Marrocos',HAI:'Haiti',
  SCO:'Escócia',USA:'EUA',PAR:'Paraguai',AUS:'Austrália',TUR:'Turquia',GER:'Alemanha',
  CUW:'Curaçao',CIV:'Costa do Marfim',ECU:'Equador',NED:'Holanda',JPN:'Japão',
  SWE:'Suécia',TUN:'Tunísia',BEL:'Bélgica',EGY:'Egito',IRN:'Irã',NZL:'Nova Zelândia',
  ESP:'Espanha',CPV:'Cabo Verde',KSA:'Arábia Saudita',URU:'Uruguai',FRA:'França',
  SEN:'Senegal',IRQ:'Iraque',NOR:'Noruega',ARG:'Argentina',ALG:'Argélia',AUT:'Áustria',
  JOR:'Jordânia',POR:'Portugal',COD:'RD Congo',UZB:'Uzbequistão',COL:'Colômbia',
  ENG:'Inglaterra',CRO:'Croácia',GHA:'Gana',PAN:'Panamá'
}

const API = process.env.NEXT_PUBLIC_API_URL

export default function Scanner() {
  const router = useRouter()
  const videoRef = useRef(null)
  const canvasRef = useRef(null)
  const previewRef = useRef(null)
  const [status, setStatus] = useState('idle')
  const [result, setResult] = useState(null)
  const [lastScanned, setLastScanned] = useState([])
  const [scanning, setScanning] = useState(false)
  const [stream, setStream] = useState(null)
  const [worker, setWorker] = useState(null)
  const [toast, setToast] = useState(null)
  const [rawText, setRawText] = useState('')
  const [zoom, setZoom] = useState(2)
  const [manualCode, setManualCode] = useState('')
  const intervalRef = useRef(null)
  const streamRef = useRef(null)

  useEffect(() => {
    if (!Cookies.get('token')) { router.push('/login'); return }
    initWorker()
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current)
      if (streamRef.current) streamRef.current.getTracks().forEach(t => t.stop())
    }
  }, [])

  async function initWorker() {
    setStatus('loading')
    try {
      const { createWorker } = await import('tesseract.js')
      const w = await createWorker('eng', 1, {
        workerPath: 'https://cdn.jsdelivr.net/npm/tesseract.js@5/dist/worker.min.js',
        langPath: 'https://tessdata.projectnaptha.com/4.0.0',
        corePath: 'https://cdn.jsdelivr.net/npm/tesseract.js-core@5/tesseract-core-simd-lstm.wasm.js',
      })
      await w.setParameters({
        tessedit_char_whitelist: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789 ',
        tessedit_pageseg_mode: '7',
        preserve_interword_spaces: '1',
      })
      setWorker(w)
      setStatus('ready')
    } catch(e) {
      console.error(e)
      setStatus('error')
    }
  }

  async function startCamera() {
    try {
      const s = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: 'environment',
          width: { ideal: 1920 },
          height: { ideal: 1080 },
          focusMode: 'continuous',
          advanced: [{ zoom: 2 }]
        }
      })
      streamRef.current = s
      setStream(s)
      if (videoRef.current) {
        videoRef.current.srcObject = s
        await videoRef.current.play()
        // Tenta ativar zoom nativo da camera
        const track = s.getVideoTracks()[0]
        const caps = track.getCapabilities()
        if (caps.zoom) {
          await track.applyConstraints({ advanced: [{ zoom: Math.min(2, caps.zoom.max) }] })
        }
      }
      setScanning(true)
      intervalRef.current = setInterval(() => captureAndScan(), 1200)
    } catch(e) {
      showToast('Erro camera: ' + e.message)
    }
  }

  function stopCamera() {
    if (streamRef.current) streamRef.current.getTracks().forEach(t => t.stop())
    streamRef.current = null
    setStream(null)
    setScanning(false)
    if (intervalRef.current) clearInterval(intervalRef.current)
  }

  function processCanvas(srcCanvas, sx, sy, sw, sh) {
    const out = document.createElement('canvas')
    const scale = 6
    out.width = sw * scale
    out.height = sh * scale
    const ctx = out.getContext('2d')

    // Fundo branco
    ctx.fillStyle = 'white'
    ctx.fillRect(0, 0, out.width, out.height)

    // Escala
    ctx.scale(scale, scale)
    ctx.drawImage(srcCanvas, sx, sy, sw, sh, 0, 0, sw, sh)

    // Pós-processamento
    const imgData = ctx.getImageData(0, 0, out.width, out.height)
    const data = imgData.data
    for (let i = 0; i < data.length; i += 4) {
      const r = data[i], g = data[i+1], b = data[i+2]
      const gray = 0.299*r + 0.587*g + 0.114*b
      // Threshold agressivo — preto ou branco
      const val = gray > 128 ? 255 : 0
      data[i] = data[i+1] = data[i+2] = val
    }
    ctx.putImageData(imgData, 0, 0)

    // Mostra preview
    if (previewRef.current) {
      previewRef.current.width = out.width
      previewRef.current.height = out.height
      previewRef.current.getContext('2d').drawImage(out, 0, 0)
    }

    return out
  }

  async function captureAndScan() {
    if (!videoRef.current || !canvasRef.current || !worker) return
    const video = videoRef.current
    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')
    canvas.width = video.videoWidth
    canvas.height = video.videoHeight
    ctx.drawImage(video, 0, 0)

    if (canvas.width === 0) return

    // Região alvo: canto superior da figurinha
    // Testa múltiplas regiões para achar o código
    const regions = [
      // Centro-topo (onde fica o código na Panini)
      { x: canvas.width*0.15, y: canvas.height*0.05, w: canvas.width*0.7, h: canvas.height*0.12 },
      // Centro maior
      { x: canvas.width*0.1, y: canvas.height*0.02, w: canvas.width*0.8, h: canvas.height*0.18 },
      // Só centro da imagem
      { x: canvas.width*0.3, y: canvas.height*0.3, w: canvas.width*0.4, h: canvas.height*0.15 },
    ]

    for (const reg of regions) {
      const processed = processCanvas(canvas, reg.x, reg.y, reg.w, reg.h)
      try {
        const { data } = await worker.recognize(processed)
        const text = data.text.trim().toUpperCase().replace(/[^A-Z0-9 ]/g, ' ').replace(/\s+/g, ' ')
        setRawText(text)
        const found = parseCode(text)
        if (found) { setResult(found); return }
      } catch {}
    }
  }

  function parseCode(text) {
    // Padrões: "ARG 9", "ARG9", "AR69" (OCR confunde G com 6)
    const patterns = [
      /([A-Z]{3})\s+([0-9]{1,2})/,
      /([A-Z]{3})([0-9]{1,2})/,
      /([A-Z]{2})\s+([0-9]{1,2})/,
    ]
    for (const pattern of patterns) {
      const m = text.match(pattern)
      if (!m) continue
      const cod = m[1]
      const num = parseInt(m[2])
      if (PAISES[cod] && num >= 1 && num <= 20) {
        return { code: cod+'_'+String(num).padStart(2,'0'), cod, num, pais: PAISES[cod] }
      }
    }
    // Tenta corrigir erros comuns de OCR
    const fixed = text
      .replace(/0/g, 'O').replace(/1/g, 'I').replace(/8/g, 'B')
    for (const pattern of patterns) {
      const m = fixed.match(pattern)
      if (!m) continue
      const cod = m[1]
      const num = parseInt(m[2].replace(/[OIB]/g, s => s==='O'?'0':s==='I'?'1':'8'))
      if (PAISES[cod] && num >= 1 && num <= 20) {
        return { code: cod+'_'+String(num).padStart(2,'0'), cod, num, pais: PAISES[cod] }
      }
    }
    return null
  }

  function handleManual(e) {
    e.preventDefault()
    const found = parseCode(manualCode.toUpperCase())
    if (found) {
      setResult(found)
      setManualCode('')
    } else {
      showToast('Codigo nao reconhecido. Ex: ARG 9')
    }
  }

  async function markSticker(code, status) {
    const token = Cookies.get('token')
    const saved = JSON.parse(localStorage.getItem('fwc26_album') || '{}')
    saved[code] = status
    if (status === 'REPEATED') saved[code+'_qty'] = (saved[code+'_qty'] || 1) + 1
    localStorage.setItem('fwc26_album', JSON.stringify(saved))
    try {
      await fetch(API+'/api/album/stickers', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', Authorization: 'Bearer '+Cookies.get('token') },
        body: JSON.stringify({ updates: [{ stickerCode: code, status, quantity: saved[code+'_qty']||1 }] })
      })
    } catch {}
    const entry = { code, pais: result.pais, num: result.num, status, time: new Date().toLocaleTimeString() }
    setLastScanned(prev => [entry, ...prev.slice(0, 19)])
    showToast(status==='HAVE' ? result.pais+' #'+result.num+' marcada!' : 'Repetida!')
    setResult(null)
  }

  function showToast(msg) { setToast(msg); setTimeout(()=>setToast(null), 2500) }

  return (
    <div style={{ minHeight:'100vh', background:'#050a0f', color:'white', fontFamily:'Barlow' }}>
      {toast && (
        <div style={{ position:'fixed', bottom:'24px', left:'50%', transform:'translateX(-50%)', background:'rgba(20,20,20,0.95)', border:'1px solid rgba(255,255,255,0.15)', color:'white', padding:'8px 20px', borderRadius:'99px', fontSize:'13px', fontWeight:'700', zIndex:1000, whiteSpace:'nowrap' }}>
          {toast}
        </div>
      )}

      <div style={{ background:'rgba(5,10,15,0.95)', borderBottom:'1px solid rgba(255,255,255,0.06)' }}>
        <div style={{ height:'3px', background:'linear-gradient(90deg,#E8175D,#FF6B00,#F5C518,#22C55E,#00C9B1,#1A56DB,#6B2FFA)' }} />
        <div style={{ padding:'10px 20px', display:'flex', alignItems:'center', gap:'12px' }}>
          <Link href="/album" style={{ color:'rgba(255,255,255,0.4)', fontSize:'13px', textDecoration:'none' }}>Voltar</Link>
          <div style={{ fontFamily:'Barlow Condensed', fontSize:'18px', fontWeight:'900', letterSpacing:'2px', flex:1 }}>
            SCANNER <span style={{ color:'#E8175D' }}>BETA</span>
          </div>
          <div style={{ fontSize:'11px', color: status==='ready'?'#22C55E':status==='loading'?'#F5C518':'#E8175D', fontWeight:'700' }}>
            {status==='loading'?'CARREGANDO OCR...':status==='ready'?'PRONTO':'ERRO'}
          </div>
        </div>
      </div>

      <div style={{ maxWidth:'600px', margin:'0 auto', padding:'16px' }}>

        {/* CAMERA */}
        <div style={{ position:'relative', borderRadius:'16px', overflow:'hidden', background:'#0a0a0a', border:'2px solid rgba(255,255,255,0.1)', marginBottom:'12px', aspectRatio:'4/3' }}>
          <video ref={videoRef} style={{ width:'100%', height:'100%', objectFit:'cover', display:scanning?'block':'none' }} playsInline muted />
          <canvas ref={canvasRef} style={{ display:'none' }} />

          {!scanning && (
            <div style={{ position:'absolute', inset:0, display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', gap:'12px' }}>
              <div style={{ fontSize:'56px' }}>📷</div>
              <div style={{ fontFamily:'Barlow Condensed', fontSize:'16px', fontWeight:'700', color:'rgba(255,255,255,0.5)' }}>Clique em INICIAR</div>
            </div>
          )}

          {scanning && (
            <div style={{ position:'absolute', inset:0, pointerEvents:'none' }}>
              {/* Área de foco — canto superior da figurinha */}
              <div style={{ position:'absolute', left:'10%', right:'10%', top:'5%', height:'22%', border:'3px solid #E8175D', borderRadius:'10px', boxShadow:'0 0 0 9999px rgba(0,0,0,0.55)' }}>
                <div style={{ position:'absolute', bottom:'-22px', left:'50%', transform:'translateX(-50%)', fontSize:'10px', fontWeight:'700', color:'white', background:'rgba(232,23,93,0.85)', padding:'2px 10px', borderRadius:'99px', whiteSpace:'nowrap' }}>
                  Aponte o codigo aqui (topo da figurinha)
                </div>
              </div>
            </div>
          )}
        </div>

        {/* PREVIEW OCR */}
        {scanning && (
          <div style={{ background:'rgba(255,255,255,0.04)', borderRadius:'12px', padding:'10px', marginBottom:'12px', border:'1px solid rgba(255,255,255,0.08)' }}>
            <div style={{ fontSize:'10px', color:'rgba(255,255,255,0.4)', marginBottom:'6px', fontWeight:'700', letterSpacing:'1px' }}>PREVIEW DO OCR</div>
            <canvas ref={previewRef} style={{ width:'100%', borderRadius:'6px', imageRendering:'pixelated', background:'white' }} />
            {rawText && (
              <div style={{ fontSize:'11px', color:'rgba(255,255,255,0.5)', marginTop:'6px' }}>
                Lendo: <span style={{ color:'#F5C518', fontWeight:'700' }}>{rawText.slice(0,40)}</span>
              </div>
            )}
          </div>
        )}

        {/* RESULTADO */}
        {result && (
          <div style={{ background:'rgba(34,197,94,0.1)', border:'2px solid #22C55E', borderRadius:'16px', padding:'16px', marginBottom:'12px', textAlign:'center' }}>
            <div style={{ fontFamily:'Barlow Condensed', fontSize:'13px', fontWeight:'700', color:'#22C55E', letterSpacing:'1px', marginBottom:'6px' }}>DETECTADO!</div>
            <div style={{ fontFamily:'Barlow Condensed', fontSize:'32px', fontWeight:'900', color:'white', marginBottom:'2px' }}>{result.pais}</div>
            <div style={{ fontFamily:'Barlow Condensed', fontSize:'20px', fontWeight:'700', color:'rgba(255,255,255,0.6)', marginBottom:'14px' }}>Figurinha #{result.num}</div>
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'8px', marginBottom:'8px' }}>
              <button onClick={()=>markSticker(result.code,'HAVE')}
                style={{ padding:'13px', background:'#22C55E', border:'none', borderRadius:'10px', color:'white', fontFamily:'Barlow Condensed', fontSize:'17px', fontWeight:'700', cursor:'pointer' }}>
                TENHO
              </button>
              <button onClick={()=>markSticker(result.code,'REPEATED')}
                style={{ padding:'13px', background:'#F5C518', border:'none', borderRadius:'10px', color:'#0a0a0a', fontFamily:'Barlow Condensed', fontSize:'17px', fontWeight:'700', cursor:'pointer' }}>
                REPETIDA
              </button>
            </div>
            <button onClick={()=>setResult(null)}
              style={{ padding:'7px 20px', background:'transparent', border:'1px solid rgba(255,255,255,0.15)', borderRadius:'99px', color:'rgba(255,255,255,0.4)', fontSize:'12px', cursor:'pointer' }}>
              Ignorar
            </button>
          </div>
        )}

        {/* BOTAO CAMERA */}
        <button onClick={scanning?stopCamera:startCamera} disabled={status!=='ready'}
          style={{ width:'100%', padding:'14px', background:scanning?'#E8175D':'#22C55E', border:'none', borderRadius:'99px', color:'white', fontFamily:'Barlow Condensed', fontSize:'18px', fontWeight:'900', cursor:status!=='ready'?'not-allowed':'pointer', letterSpacing:'1px', opacity:status!=='ready'?0.5:1, marginBottom:'12px' }}>
          {status==='loading'?'CARREGANDO OCR...':scanning?'PARAR SCANNER':'INICIAR SCANNER'}
        </button>

        {/* ENTRADA MANUAL */}
        <div style={{ background:'rgba(255,255,255,0.04)', border:'1px solid rgba(255,255,255,0.08)', borderRadius:'14px', padding:'14px', marginBottom:'16px' }}>
          <div style={{ fontFamily:'Barlow Condensed', fontSize:'13px', fontWeight:'700', color:'rgba(255,255,255,0.5)', marginBottom:'8px', letterSpacing:'1px' }}>
            ENTRADA MANUAL (backup)
          </div>
          <form onSubmit={handleManual} style={{ display:'flex', gap:'8px' }}>
            <input value={manualCode} onChange={e=>setManualCode(e.target.value)}
              placeholder="Ex: ARG 9 ou BRA 15"
              style={{ flex:1, padding:'9px 12px', background:'rgba(255,255,255,0.08)', border:'1px solid rgba(255,255,255,0.12)', borderRadius:'8px', color:'white', fontSize:'13px', outline:'none' }} />
            <button type="submit"
              style={{ padding:'9px 16px', background:'#E8175D', border:'none', borderRadius:'8px', color:'white', fontFamily:'Barlow Condensed', fontSize:'14px', fontWeight:'700', cursor:'pointer' }}>
              OK
            </button>
          </form>
        </div>

        {/* HISTORICO */}
        {lastScanned.length > 0 && (
          <div>
            <div style={{ fontFamily:'Barlow Condensed', fontSize:'13px', fontWeight:'700', letterSpacing:'1px', color:'rgba(255,255,255,0.4)', marginBottom:'8px' }}>
              HISTORICO ({lastScanned.length})
            </div>
            <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(140px,1fr))', gap:'6px' }}>
              {lastScanned.map((item,i) => (
                <div key={i} style={{ display:'flex', alignItems:'center', gap:'8px', padding:'7px 10px', background:'rgba(255,255,255,0.03)', borderRadius:'9px', border:'1px solid rgba(255,255,255,0.06)' }}>
                  <div style={{ width:'28px', height:'28px', borderRadius:'7px', background:item.status==='HAVE'?'#22C55E':'#F5C518', display:'flex', alignItems:'center', justifyContent:'center', fontFamily:'Barlow Condensed', fontSize:'12px', fontWeight:'900', color:item.status==='HAVE'?'white':'#0a0a0a', flexShrink:0 }}>
                    {item.num}
                  </div>
                  <div style={{ overflow:'hidden' }}>
                    <div style={{ fontFamily:'Barlow Condensed', fontSize:'12px', fontWeight:'700', whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis' }}>{item.pais}</div>
                    <div style={{ fontSize:'9px', color:'rgba(255,255,255,0.3)' }}>{item.status==='HAVE'?'TENHO':'REP'}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
