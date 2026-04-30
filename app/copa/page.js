'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'

const COLORS = ['#E8175D','#FF6B00','#F5C518','#22C55E','#00C9B1','#1A56DB','#6B2FFA']
const CARDS = [
  {title:'Dados da Copa',sub:'Formato e informações',icon:'🏆',bg:'#fff0f4',items:[['Edição','23ª Copa FIFA'],['Abertura','11 jun 2026'],['Final','19 jul 2026'],['Seleções','48 países'],['Grupos','12 grupos'],['Jogos','104 partidas'],['Campeão atual','🇦🇷 Argentina']]},
  {title:'Estádios sede',sub:'16 arenas em 3 países',icon:'🏟️',bg:'#e6f0ff',items:[['MetLife Stadium','🇺🇸 Nova York 82.500'],['Azteca','🇲🇽 Cidade do México 87.523'],['SoFi Stadium','🇺🇸 Los Angeles 70.240'],['AT&T Stadium','🇺🇸 Dallas 80.000'],['BC Place','🇨🇦 Vancouver 54.500']]},
  {title:'Álbum Panini 2026',sub:'980 cromos · 68 especiais',icon:'📒',bg:'#e8f8ed',items:[['Total','980 cromos'],['Especiais','68 brilhantes'],['Por seleção','~20 figurinhas'],['Por pacote','7 figurinhas'],['Recorde','Maior da história']]},
  {title:'Favoritos ao título',sub:'Odds das apostas',icon:'⚽',bg:'#fff9e0',items:[['🇫🇷 França','+350'],['🇧🇷 Brasil','+400'],['🇦🇷 Argentina','+450'],['🏴󠁧󠁢󠁥󠁮󠁧󠁿 Inglaterra','+500'],['🇩🇪 Alemanha','+600'],['🇵🇹 Portugal','+700']]},
]

export default function Copa() {
  const [countdown, setCountdown] = useState({d:'--',h:'--',m:'--',s:'--'})
  const [openCard, setOpenCard] = useState(null)

  useEffect(() => {
    const t = setInterval(() => {
      const diff = new Date('2026-06-11T18:00:00-05:00') - new Date()
      if (diff <= 0) return
      setCountdown({d:Math.floor(diff/864e5),h:Math.floor(diff%864e5/36e5),m:Math.floor(diff%36e5/6e4),s:Math.floor(diff%6e4/1e3)})
    }, 1000)
    return () => clearInterval(t)
  }, [])

  return (
    <div style={{minHeight:'100vh',background:'#0a0a0a',color:'white',fontFamily:'Barlow'}}>
      <div style={{background:'#141414',borderBottom:'1px solid rgba(255,255,255,0.06)'}}>
        <div style={{height:'4px',display:'flex'}}>{COLORS.map((c,i)=><span key={i} style={{flex:1,background:c}}/>)}</div>
        <div style={{padding:'10px 16px',display:'flex',alignItems:'center',gap:'12px'}}>
          <Link href="/dashboard" style={{color:'rgba(255,255,255,0.4)',fontSize:'13px'}}>← Voltar</Link>
          <div style={{fontFamily:'Barlow Condensed',fontSize:'18px',fontWeight:'900',letterSpacing:'1px'}}>COPA <span style={{color:'#E8175D'}}>2026</span></div>
        </div>
      </div>
      <div style={{maxWidth:'700px',margin:'0 auto',padding:'16px'}}>
        <div style={{background:'#0a0a0a',border:'1px solid rgba(255,255,255,0.08)',borderRadius:'20px',padding:'24px',marginBottom:'16px',textAlign:'center',position:'relative',overflow:'hidden'}}>
          <div style={{position:'absolute',inset:0,background:'linear-gradient(135deg,rgba(232,23,93,.2),rgba(107,47,250,.2))',pointerEvents:'none'}}/>
          <div style={{position:'relative',zIndex:1}}>
            <div style={{fontFamily:'Barlow Condensed',fontSize:'10px',fontWeight:'700',letterSpacing:'4px',color:'rgba(255,255,255,0.4)',marginBottom:'6px'}}>FIFA WORLD CUP</div>
            <div style={{fontFamily:'Barlow Condensed',fontSize:'80px',fontWeight:'900',lineHeight:'.9',color:'white'}}>2<span style={{color:'#E8175D'}}>6</span></div>
            <div style={{fontSize:'12px',color:'rgba(255,255,255,0.5)',margin:'10px 0 20px'}}>EUA · Canadá · México</div>
            <div style={{display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:'8px'}}>
              {[['DIAS',countdown.d],['HORAS',countdown.h],['MIN',countdown.m],['SEG',countdown.s]].map(([l,v])=>(
                <div key={l} style={{background:'rgba(255,255,255,0.07)',border:'1px solid rgba(255,255,255,0.1)',borderRadius:'12px',padding:'12px 4px'}}>
                  <div style={{fontFamily:'Barlow Condensed',fontSize:'32px',fontWeight:'900',color:'white',lineHeight:'1'}}>{v}</div>
                  <div style={{fontSize:'9px',color:'rgba(255,255,255,0.4)',letterSpacing:'1px',fontWeight:'700',marginTop:'3px'}}>{l}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
        {CARDS.map((card,i) => (
          <div key={i} style={{background:'#141414',border:`1px solid ${openCard===i?'rgba(232,23,93,0.3)':'rgba(255,255,255,0.08)'}`,borderRadius:'16px',overflow:'hidden',marginBottom:'10px'}}>
            <div onClick={() => setOpenCard(openCard===i?null:i)} style={{padding:'14px 16px',display:'flex',alignItems:'center',gap:'12px',cursor:'pointer'}}>
              <div style={{width:'42px',height:'42px',borderRadius:'11px',background:card.bg,display:'flex',alignItems:'center',justifyContent:'center',fontSize:'22px',flexShrink:0}}>{card.icon}</div>
              <div style={{flex:1}}>
                <div style={{fontFamily:'Barlow Condensed',fontSize:'16px',fontWeight:'700'}}>{card.title}</div>
                <div style={{fontSize:'11px',color:'rgba(255,255,255,0.5)'}}>{card.sub}</div>
              </div>
              <div style={{color:'rgba(255,255,255,0.3)',transition:'transform .2s',transform:openCard===i?'rotate(180deg)':'none'}}>▼</div>
            </div>
            {openCard === i && (
              <div style={{borderTop:'1px solid rgba(255,255,255,0.06)',padding:'12px 16px'}}>
                {card.items.map(([k,v]) => (
                  <div key={k} style={{display:'flex',justifyContent:'space-between',padding:'7px 0',borderBottom:'1px solid rgba(255,255,255,0.04)',fontSize:'13px'}}>
                    <span style={{color:'rgba(255,255,255,0.5)'}}>{k}</span>
                    <span style={{fontWeight:'700'}}>{v}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
