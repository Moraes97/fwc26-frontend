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
  const [status, setStatus] = useState('idle')
  const [result, setResult] = useState(null)
  const [lastScanned, setLastScanned] = useState([])
  const [scanning, setScanning] = useState(false)
  const [stream, setStream] = useState(null)
  const [worker, setWorker] = useState(null)
  const [toast, setToast] = useState(null)
  const intervalRef = useRef(null)

  useEffect(() => {
    if (!Cookies.get('token')) { router.push('/login'); return }
    initWorker()
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current)
      if (stream) stream.getTracks().forEach(t => t.stop())
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
        tessedit_pageseg_mode: '8',
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
        video: { facingMode: 'environment', width: { ideal: 1280 }, height: { ideal: 720 } }
      })
      setStream(s)
      if (videoRef.current) {
        videoRef.current.srcObject = s
        await videoRef.current.play()
      }
      setScanning(true)
      startScanLoop()
    } catch(e) {
      showToast('Erro ao acessar camera: ' + e.message)
    }
  }

  function stopCamera() {
    if (stream) stream.getTracks().forEach(t => t.stop())
    setStream(null)
    setScanning(false)
    if (intervalRef.current) clearInterval(intervalRef.current)
  }

  function startScanLoop() {
    intervalRef.current = setInterval(() => captureAndScan(), 1500)
  }

  async function captureAndScan() {
    if (!videoRef.current || !canvasRef.current || !worker) return
    const video = videoRef.current
    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')
    canvas.width = video.videoWidth
    canvas.height = video.videoHeight
    ctx.drawImage(video, 0, 0)

    // Recorta região central (onde fica o código)
    const cropW = canvas.width * 0.6
    const cropH = canvas.height * 0.15
    const cropX = (canvas.width - cropW) / 2
    const cropY = canvas.height * 0.7

    const cropCanvas = document.createElement('canvas')
    cropCanvas.width = cropW * 2
    cropCanvas.height = cropH * 2
    const cropCtx = cropCanvas.getContext('2d')

    // Aumenta contraste
    cropCtx.filter = 'contrast(200%) brightness(150%) grayscale(100%)'
    cropCtx.scale(2, 2)
    cropCtx.drawImage(canvas, cropX, cropY, cropW, cropH, 0, 0, cropW, cropH)

    try {
      const { data } = await worker.recognize(cropCanvas)
      const text = data.text.trim().toUpperCase()
      parseResult(text)
    } catch(e) {
      console.error('OCR error:', e)
    }
  }

  function parseResult(text) {
    // Tenta encontrar padrão: 3 letras + espaço + 1-2 números
    const matches = text.match(/([A-Z]{2,3})\s*([0-9]{1,2})/g)
    if (!matches) return

    for (const match of matches) {
      const parts = match.trim().split(/\s+/)
      if (parts.length < 2) continue
      const cod = parts[0]
      const num = parseInt(parts[1])
      if (!PAISES[cod] || num < 1 || num > 20) continue

      const code = cod + '_' + String(num).padStart(2, '0')
      setResult({ code, cod, num, pais: PAISES[cod] })
      break
    }
  }

  async function markSticker(code, status) {
    const token = Cookies.get('token')
    const saved = JSON.parse(localStorage.getItem('fwc26_album') || '{}')
    saved[code] = status
    if (status === 'REPEATED') saved[code + '_qty'] = (saved[code + '_qty'] || 1) + 1
    localStorage.setItem('fwc26_album', JSON.stringify(saved))

    try {
      await fetch(API + '/api/album/stickers', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', Authorization: 'Bearer ' + token },
        body: JSON.stringify({ updates: [{ stickerCode: code, status, quantity: saved[code + '_qty'] || 1 }] })
      })
    } catch {}

    const entry = { code, pais: result.pais, num: result.num, status, time: new Date().toLocaleTimeString() }
    setLastScanned(prev => [entry, ...prev.slice(0, 9)])
    showToast(status === 'HAVE' ? 'Marcada: ' + result.pais + ' #' + result.num : 'Repetida: ' + result.pais + ' #' + result.num)
    setResult(null)
  }

  function showToast(msg) { setToast(msg); setTimeout(() => setToast(null), 3000) }

  return (
    <div style={{ minHeight: '100vh', background: '#050a0f', color: 'white', fontFamily: 'Barlow' }}>

      {toast && (
        <div style={{ position: 'fixed', bottom: '24px', left: '50%', transform: 'translateX(-50%)', background: 'rgba(20,20,20,0.95)', border: '1px solid rgba(255,255,255,0.15)', color: 'white', padding: '8px 20px', borderRadius: '99px', fontSize: '13px', fontWeight: '700', zIndex: 1000, whiteSpace: 'nowrap' }}>
          {toast}
        </div>
      )}

      <div style={{ background: 'rgba(5,10,15,0.95)', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
        <div style={{ height: '3px', background: 'linear-gradient(90deg,#E8175D,#FF6B00,#F5C518,#22C55E,#00C9B1,#1A56DB,#6B2FFA)' }} />
        <div style={{ padding: '10px 20px', display: 'flex', alignItems: 'center', gap: '12px' }}>
          <Link href="/album" style={{ color: 'rgba(255,255,255,0.4)', fontSize: '13px', textDecoration: 'none' }}>Voltar</Link>
          <div style={{ fontFamily: 'Barlow Condensed', fontSize: '18px', fontWeight: '900', letterSpacing: '2px' }}>
            SCANNER <span style={{ color: '#E8175D' }}>BETA</span>
          </div>
          <div style={{ marginLeft: 'auto', fontSize: '11px', color: status === 'ready' ? '#22C55E' : status === 'loading' ? '#F5C518' : '#E8175D', fontWeight: '700' }}>
            {status === 'loading' ? 'CARREGANDO OCR...' : status === 'ready' ? 'PRONTO' : status === 'error' ? 'ERRO' : ''}
          </div>
        </div>
      </div>

      <div style={{ maxWidth: '600px', margin: '0 auto', padding: '20px' }}>

        {/* INSTRUCOES */}
        <div style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '14px', padding: '14px', marginBottom: '16px' }}>
          <div style={{ fontFamily: 'Barlow Condensed', fontSize: '15px', fontWeight: '700', marginBottom: '8px', color: '#F5C518' }}>
            Como usar
          </div>
          <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.6)', lineHeight: '1.6' }}>
            1. Clique em INICIAR SCANNER<br/>
            2. Aponte a camera para o codigo da figurinha (ex: BRA 7)<br/>
            3. O sistema detecta automaticamente<br/>
            4. Confirme se e TENHO ou REPETIDA<br/>
            <span style={{ color: 'rgba(255,255,255,0.3)', fontSize: '11px' }}>
              Dica: boa iluminacao melhora muito o resultado
            </span>
          </div>
        </div>

        {/* CAMERA */}
        <div style={{ position: 'relative', borderRadius: '16px', overflow: 'hidden', background: '#0a0a0a', border: '2px solid rgba(255,255,255,0.1)', marginBottom: '16px', aspectRatio: '16/9' }}>
          <video ref={videoRef} style={{ width: '100%', height: '100%', objectFit: 'cover', display: scanning ? 'block' : 'none' }} playsInline muted />
          <canvas ref={canvasRef} style={{ display: 'none' }} />

          {!scanning && (
            <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '12px' }}>
              <div style={{ fontSize: '48px' }}>📷</div>
              <div style={{ fontFamily: 'Barlow Condensed', fontSize: '16px', fontWeight: '700', color: 'rgba(255,255,255,0.5)' }}>Camera desligada</div>
            </div>
          )}

          {scanning && (
            <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}>
              {/* Guia visual */}
              <div style={{ position: 'absolute', left: '20%', right: '20%', top: '65%', bottom: '20%', border: '2px solid rgba(232,23,93,0.7)', borderRadius: '8px', boxShadow: '0 0 0 9999px rgba(0,0,0,0.4)' }} />
              <div style={{ position: 'absolute', bottom: '22%', left: '50%', transform: 'translateX(-50%)', fontSize: '11px', color: 'rgba(255,255,255,0.7)', fontWeight: '700', whiteSpace: 'nowrap', background: 'rgba(0,0,0,0.5)', padding: '3px 10px', borderRadius: '99px' }}>
                Aponte o codigo aqui
              </div>
            </div>
          )}
        </div>

        {/* RESULTADO DETECTADO */}
        {result && (
          <div style={{ background: 'rgba(34,197,94,0.1)', border: '2px solid #22C55E', borderRadius: '16px', padding: '16px', marginBottom: '16px', textAlign: 'center' }}>
            <div style={{ fontFamily: 'Barlow Condensed', fontSize: '13px', fontWeight: '700', color: '#22C55E', letterSpacing: '1px', marginBottom: '6px' }}>
              FIGURINHA DETECTADA!
            </div>
            <div style={{ fontFamily: 'Barlow Condensed', fontSize: '28px', fontWeight: '900', color: 'white', marginBottom: '4px' }}>
              {result.pais} #{result.num}
            </div>
            <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.5)', marginBottom: '14px' }}>
              {result.code}
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
              <button onClick={() => markSticker(result.code, 'HAVE')}
                style={{ padding: '12px', background: '#22C55E', border: 'none', borderRadius: '10px', color: 'white', fontFamily: 'Barlow Condensed', fontSize: '16px', fontWeight: '700', cursor: 'pointer' }}>
                TENHO
              </button>
              <button onClick={() => markSticker(result.code, 'REPEATED')}
                style={{ padding: '12px', background: '#F5C518', border: 'none', borderRadius: '10px', color: '#0a0a0a', fontFamily: 'Barlow Condensed', fontSize: '16px', fontWeight: '700', cursor: 'pointer' }}>
                REPETIDA
              </button>
            </div>
            <button onClick={() => setResult(null)}
              style={{ marginTop: '8px', padding: '8px 20px', background: 'transparent', border: '1px solid rgba(255,255,255,0.15)', borderRadius: '99px', color: 'rgba(255,255,255,0.4)', fontSize: '12px', cursor: 'pointer' }}>
              Ignorar
            </button>
          </div>
        )}

        {/* BOTAO */}
        <button onClick={scanning ? stopCamera : startCamera} disabled={status !== 'ready'}
          style={{ width: '100%', padding: '14px', background: scanning ? '#E8175D' : '#22C55E', border: 'none', borderRadius: '99px', color: 'white', fontFamily: 'Barlow Condensed', fontSize: '18px', fontWeight: '900', cursor: status !== 'ready' ? 'not-allowed' : 'pointer', letterSpacing: '1px', opacity: status !== 'ready' ? 0.5 : 1, marginBottom: '16px' }}>
          {status === 'loading' ? 'CARREGANDO OCR...' : scanning ? 'PARAR SCANNER' : 'INICIAR SCANNER'}
        </button>

        {/* HISTORICO */}
        {lastScanned.length > 0 && (
          <div>
            <div style={{ fontFamily: 'Barlow Condensed', fontSize: '14px', fontWeight: '700', letterSpacing: '1px', color: 'rgba(255,255,255,0.5)', marginBottom: '10px' }}>
              HISTORICO DA SESSAO
            </div>
            {lastScanned.map((item, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '8px 12px', background: 'rgba(255,255,255,0.03)', borderRadius: '10px', marginBottom: '6px', border: '1px solid rgba(255,255,255,0.06)' }}>
                <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: item.status === 'HAVE' ? '#22C55E' : '#F5C518', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'Barlow Condensed', fontSize: '14px', fontWeight: '900', color: item.status === 'HAVE' ? 'white' : '#0a0a0a', flexShrink: 0 }}>
                  {item.num}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontFamily: 'Barlow Condensed', fontSize: '14px', fontWeight: '700' }}>{item.pais}</div>
                  <div style={{ fontSize: '10px', color: 'rgba(255,255,255,0.4)' }}>{item.status === 'HAVE' ? 'Marcada como TENHO' : 'Marcada como REPETIDA'} · {item.time}</div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
