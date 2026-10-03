import { useState, useEffect, useRef } from 'react'

export default function App(){
  const [balance,setBalance]=useState(3000)
  const [price,setPrice]=useState(0)
  const [symbol,setSymbol]=useState('R_100') // Deriv Volatility 100
  const [trade,setTrade]=useState(null)
  const [amount,setAmount]=useState(100)
  const ws=useRef(null)

  const symbols=[
    {id:'R_10', name:'Volatility 10 Index'},
    {id:'R_25', name:'Volatility 25 Index'},
    {id:'R_50', name:'Volatility 50 Index'},
    {id:'R_75', name:'Volatility 75 Index'},
    {id:'R_100', name:'Volatility 100 Index'},
    {id:'1HZ10V', name:'Volatility 10 (1s)'},
    {id:'BOOM1000', name:'Boom 1000 Index'},
    {id:'CRASH1000', name:'Crash 1000 Index'},
    {id:'frxEURUSD', name:'EUR/USD'},
    {id:'cryBTCUSD', name:'BTC/USD'},
  ]

  // Connect to REAL Deriv WebSocket - same as Deriv.com uses
  useEffect(()=>{
    ws.current=new WebSocket('wss://ws.derivws.com/websockets/v3?app_id=1089')
    ws.current.onopen=()=>{
      ws.current.send(JSON.stringify({ticks:symbol}))
    }
    ws.current.onmessage=(e)=>{
      const data=JSON.parse(e.data)
      if(data.tick){
        setPrice(data.tick.quote)
      }
    }
    return()=>ws.current?.close()
  },[symbol])

  const subscribe=(newSymbol)=>{
    setSymbol(newSymbol)
    if(ws.current?.readyState===1){
      ws.current.send(JSON.stringify({forget_all:'ticks'}))
      ws.current.send(JSON.stringify({ticks:newSymbol}))
    }
  }

  const placeTrade=(type)=>{
    if(amount>balance) return alert('Insufficient balance')
    setBalance(b=>b-amount)
    setTrade({type,entry:price,left:60,amount})
  }

  useEffect(()=>{
    if(!trade) return
    if(trade.left<=0){
      const win=(trade.type==='CALL'&&price>trade.entry)||(trade.type==='PUT'&&price<trade.entry)
      if(win) setBalance(b=>b+trade.amount*1.9) // Deriv 90% payout
      setTrade(null); return
    }
    const t=setTimeout(()=>setTrade({...trade,left:trade.left-1}),1000)
    return()=>clearTimeout(t)
  },[trade,price])

  return(
    <div style={{width:390,margin:'0 auto',background:'#0e0e0e',color:'#fff',minHeight:'100vh',fontFamily:'Ubuntu, sans-serif'}}>
      {/* Deriv Header like real Deriv Webs */}
      <div style={{background:'#1a1a1a',padding:'10px',display:'flex',justifyContent:'space-between',alignItems:'center'}}>
        <div style={{display:'flex',gap:10,alignItems:'center'}}>
          <div style={{background:'#ff444f',padding:'4px 8px',borderRadius:4,fontWeight:800}}>deriv</div>
          <select value={symbol} onChange={e=>subscribe(e.target.value)} style={{background:'#2a2a2a',color:'#fff',border:'none',padding:6,borderRadius:4}}>
            {symbols.map(s=><option key={s.id} value={s.id}>{s.name}</option>)}
          </select>
        </div>
        <div style={{background:'#2a2a2a',padding:'6px 12px',borderRadius:20,fontSize:12}}>USD {balance.toFixed(2)}</div>
      </div>

      {/* Price */}
      <div style={{padding:'15px 10px',textAlign:'center'}}>
        <div style={{fontSize:10,opacity:0.6}}>{symbols.find(s=>s.id===symbol)?.name}</div>
        <div style={{fontSize:28,fontWeight:700,color:price>0?'#4bb4b3':'#fff'}}>{price.toFixed(2)}</div>
        <div style={{fontSize:10,opacity:0.6}}>Real Deriv WebSocket Feed</div>
      </div>

      {/* Chart Area - Deriv style */}
      <div style={{height:320,background:'#121212',position:'relative',borderTop:'1px solid #2a2a2a',borderBottom:'1px solid #2a2a2a'}}>
        <svg width="390" height="320" viewBox="0 0 390 320">
          {Array.from({length:28}).map((_,i)=>{
            const x=8+i*13, y=100+Math.sin(i*0.8+price*0.01)*40, h=10+Math.random()*25
            const g=Math.random()>0.45
            return <rect key={i} x={x} y={y} width="6" height={h} fill={g?'#00a79e':'#ff444f'} rx="1"/>
          })}
          <line x1="0" y1={160} x2="390" y2={160} stroke="#2a2a2a" strokeDasharray="3 3"/>
        </svg>
        {trade&&<div style={{position:'absolute',top:10,left:10,background:'#1a1a1a',border:'1px solid #4bb4b3',padding:'6px 10px',borderRadius:6,fontSize:11}}>{trade.type} {trade.left}s | Entry: {trade.entry.toFixed(2)}</div>}
      </div>

      {/* Deriv DTrader Controls */}
      <div style={{padding:12,background:'#1a1a1a'}}>
        <div style={{display:'flex',gap:8,marginBottom:12}}>
          <div style={{flex:1}}>
            <div style={{fontSize:10,opacity:0.6,marginBottom:4}}>Stake</div>
            <input type="number" value={amount} onChange={e=>setAmount(Number(e.target.value))} style={{width:'100%',background:'#0e0e0e',border:'1px solid #2a2a2a',color:'#fff',padding:10,borderRadius:4}}/>
          </div>
          <div style={{flex:1}}>
            <div style={{fontSize:10,opacity:0.6,marginBottom:4}}>Duration</div>
            <div style={{background:'#0e0e0e',border:'1px solid #2a2a2a',padding:10,borderRadius:4,textAlign:'center'}}>1 min</div>
          </div>
        </div>

        <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:10}}>
          <button onClick={()=>placeTrade('CALL')} style={{background:'#00a79e',border:'none',padding:16,borderRadius:4,color:'#fff',fontWeight:800,fontSize:14}}>Rise ▲<br/><span style={{fontSize:10}}>+90%</span></button>
          <button onClick={()=>placeTrade('PUT')} style={{background:'#ff444f',border:'none',padding:16,borderRadius:4,color:'#fff',fontWeight:800,fontSize:14}}>Fall ▼<br/><span style={{fontSize:10}}>+90%</span></button>
        </div>

        <div style={{marginTop:12,fontSize:9,opacity:0.5,textAlign:'center'}}>This is real Deriv API: wss://ws.derivws.com • App ID 1089<br/>Replace random chart with Deriv Chart API for 100% real</div>
      </div>
    </div>
  )
}
