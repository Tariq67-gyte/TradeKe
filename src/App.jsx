import { useState, useEffect } from 'react'

export default function App(){
  const [theme,setTheme]=useState('dark')
  const [candleType,setCandleType]=useState('Candles')
  const [asset,setAsset]=useState('BTC/USDC')
  const [price,setPrice]=useState(119107.10)
  const [showSettings,setShowSettings]=useState(false)
  const [balance,setBalance]=useState(()=>parseFloat(localStorage.getItem('bal')||'3000'))
  const [amount,setAmount]=useState(100)
  const [trade,setTrade]=useState(null)

  const coins=[
    {s:'BTC/USDC',p:119107.10, ch:'+1.28%'},
    {s:'ETH/USDC',p:2665.94, ch:'+0.84%'},
    {s:'SOL/USDC',p:145.22, ch:'-0.52%'},
    {s:'BNB/USDC',p:615.30, ch:'+2.10%'},
    {s:'XRP/USDC',p:0.5234, ch:'+1.05%'},
    {s:'DOGE/USDC',p:0.1432, ch:'-1.20%'},
    {s:'ADA/USDC',p:0.4421, ch:'+0.33%'},
  ]

  // Live price tick
  useEffect(()=>{
    const id=setInterval(()=>setPrice(p=>p+(Math.random()-0.5)*2),2000)
    return()=>clearInterval(id)
  },[asset])

  const place=(type)=>{
    if(amount>balance) return alert('Low KES balance')
    setBalance(b=>{ const nb=b-amount; localStorage.setItem('bal',nb); return nb })
    setTrade({type, entry:price, left:60})
  }

  useEffect(()=>{
    if(!trade) return
    if(trade.left<=0){
      const win=(trade.type==='Buy' && price>trade.entry)||(trade.type==='Sell' && price<trade.entry)
      if(win){ setBalance(b=>{ const nb=b+amount*1.9; localStorage.setItem('bal',nb); return nb }) }
      setTrade(null); return
    }
    const t=setTimeout(()=>setTrade({...trade,left:trade.left-1}),1000)
    return()=>clearTimeout(t)
  },[trade, price])

  const bg=theme==='dark'?'#1e2329':'#ffffff'
  const text=theme==='dark'?'#fff':'#1e2329'
  const sub='#848e9c'

  return(
    <div style={{width:390,margin:'0 auto',background:bg,color:text,minHeight:'100vh',fontFamily:'Inter',fontSize:12,position:'relative'}}>
      {/* Header */}
      <div style={{display:'flex',justifyContent:'space-between',padding:'8px 10px',alignItems:'center'}}>
        <div style={{display:'flex',alignItems:'center',gap:6}}><span>←</span><b onClick={()=>setShowSettings(!showSettings)} style={{fontSize:13,cursor:'pointer'}}>{asset} ▼</b></div>
        <div style={{display:'flex',gap:12,fontSize:14}}>☆ ⤴ ⊞</div>
      </div>

      {/* Tabs */}
      <div style={{display:'flex',gap:12,padding:'0 10px',fontSize:11,borderBottom:`1px solid ${theme==='dark'?'#2b2f36':'#eee'}`}}>
        <span style={{borderBottom:'2px solid #f0b90b',paddingBottom:4}}>Price</span><span style={{color:sub}}>Info</span><span style={{color:sub}}>Trading Data</span><span style={{color:sub}}>Square</span>
      </div>

      {/* Price row - small fonts */}
      <div style={{display:'flex',justifyContent:'space-between',padding:'6px 10px'}}>
        <div>
          <div style={{fontSize:20,fontWeight:700}}>{price.toLocaleString('de-DE',{minimumFractionDigits:2})}</div>
          <div style={{fontSize:10}}>$ {price.toLocaleString('de-DE')} <span style={{color:'#0ecb81'}}>+1,28%</span></div>
          <div style={{fontSize:9,marginTop:2}}><span style={{color:'#f0b90b'}}>POW</span> <span style={{marginLeft:4}}>Vol</span> <span style={{marginLeft:4,color:'#f0b90b'}}>Taker Fee Promo</span></div>
        </div>
        <div style={{fontSize:8,color:sub,textAlign:'right',lineHeight:1.4}}>24h High<br/><span style={{color:text}}>119.412,05</span><br/>24h Low<br/><span style={{color:text}}>116.951,55</span></div>
        <div style={{fontSize:8,color:sub,textAlign:'right',lineHeight:1.4}}>24h Vol(BTC)<br/><span style={{color:text}}>2.130,27</span><br/>24h Vol(USDC)<br/><span style={{color:text}}>251,27M</span></div>
      </div>

      {/* Time */}
      <div style={{display:'flex',gap:10,padding:'4px 10px',fontSize:10,color:sub}}><span>Time</span><span>15m</span><span>4h</span><span>1d</span><span style={{color:text}}>1w</span><span>More ▼</span><span>Depth</span></div>

      {/* Chart - using canvas imitation exact size */}
      <div style={{width:390,height:260,background:bg,position:'relative',borderTop:`1px solid ${theme==='dark'?'#2b2f36':'#eee'}`}}>
        <div style={{fontSize:9,color:'#c27cce',padding:'2px 10px'}}>MA(25): 96.998,45</div>
        <svg width="390" height="240" viewBox="0 0 390 240">
          {/* grid */}
          {[0,1,2,3].map(i=><line key={i} x1="0" y1={i*60} x2="390" y2={i*60} stroke={theme==='dark'?'#2b2f36':'#eee'} strokeWidth="0.5"/>)}
          {/* candles - same pattern as screenshot */}
          <g>
            {[
              {x:10,h:80,y:140,c:'#0ecb81'},{x:20,h:40,y:100,c:'#0ecb81'},{x:30,h:15,y:105,c:'#f6465d'},{x:40,h:25,y:90,c:'#0ecb81'},{x:50,h:50,y
