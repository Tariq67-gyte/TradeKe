import { useState, useEffect, useRef } from 'react'

export default function App(){
  const [symbol,setSymbol]=useState('R_100')
  const [price,setPrice]=useState(0)
  const [bal,setBal]=useState(()=>Number(localStorage.getItem('bal')||5000))
  const [amt,setAmt]=useState(100)
  const [trade,setTrade]=useState(null)
  const [open,setOpen]=useState(false)
  const ws=useRef(null)

  const markets=[
    {id:'R_10',name:'Volatility 10',p:0},{id:'R_25',name:'Volatility 25',p:0},
    {id:'R_50',name:'Volatility 50',p:0},{id:'R_75',name:'Volatility 75',p:0},
    {id:'R_100',name:'Volatility 100',p:0},{id:'BOOM1000',name:'Boom 1000',p:0},
    {id:'CRASH1000',name:'Crash 1000',p:0},{id:'frxEURUSD',name:'EUR/USD OTC',p:0},
    {id:'cryBTCUSD',name:'BTC/USDC',p:0},{id:'cryETHUSD',name:'ETH/USDC',p:0},
  ]

  useEffect(()=>{
    ws.current=new WebSocket('wss://ws.derivws.com/websockets/v3?app_id=1089')
    ws.current.onopen=()=>ws.current.send(JSON.stringify({ticks:symbol}))
    ws.current.onmessage=(e)=>{
      const d=JSON.parse(e.data)
      if(d.tick) setPrice(d.tick.quote)
    }
    return()=>ws.current?.close()
  },[symbol])

  const changeSymbol=(id)=>{
    setSymbol(id)
    if(ws.current?.readyState===1){
      ws.current.send(JSON.stringify({forget_all:'ticks'}))
      ws.current.send(JSON.stringify({ticks:id}))
    }
    setOpen(false)
  }

  const place=(type)=>{
    if(amt>bal) return alert('Low balance')
    const nb=bal-amt; setBal(nb); localStorage.setItem('bal',nb)
    setTrade({type,entry:price,left:60,amt})
  }

  useEffect(()=>{
    if(!trade) return
    if(trade.left<=0){
      const win=(trade.type==='Buy'&&price>trade.entry)||(trade.type==='Sell'&&price<trade.entry)
      if(win){const n=bal+trade.amt*1.9; setBal(n); localStorage.setItem('bal',n)}
      setTrade(null); return
    }
    const t=setTimeout(()=>setTrade({...trade,left:trade.left-1}),1000)
    return()=>clearTimeout(t)
  },[trade,price])

  return(
    <div style={{width:390,margin:'0 auto',background:'#0e0e0e',color:'#fff',minHeight:'100vh',fontSize:11}}>
      <div style={{background:'#1a1a1a',padding:'8px 10px',display:'flex',justifyContent:'space-between'}}>
        <b onClick={()=>setOpen(true)} style={{cursor:'pointer'}}>← {symbol} ▼</b>
        <span style={{background:'#00a79e',padding:'3px 8px',borderRadius:12,fontWeight:800}}>KES {bal.toFixed(0)}</span>
      </div>

      <div style={{padding:'10px',textAlign:'center',borderBottom:'1px solid #2a2a2a'}}>
        <div style={{fontSize:10,opacity:0.6}}>{markets.find(m=>m.id===symbol)?.name} • REAL DERIV FEED</div>
        <div style={{fontSize:26,fontWeight:800}}>{price?price.toFixed(2):'...'}</div>
      </div>

      <div style={{height:320,background:'#121212',position:'relative'}}>
        <svg width="390" height="320" viewBox="0 0 390 320">
          {Array.from({length:30}).map((_,i)=>{
            const x=6+i*12, y=120+Math.sin(i*0.6+price*0.02)*50, h=8+Math.random()*30
            return <rect key={i} x={x} y={y} width="6" height={h} fill={Math.random()>0.45?'#00a79e':'#ff444f'} rx="1"/>
          })}
        </svg>
        {trade&&<div style={{position:'absolute',top:10,left:10,background:'#000',border:'1px solid #f0b90b',padding:'5px 10px',borderRadius:8}}>{trade.type} {trade.left}s @ {trade.entry?.toFixed(2)}</div>}
      </div>

      <div style={{height:45,display:'flex',gap:1,alignItems:'end',background:'#121212'}}>{Array.from({length:40}).map((_,i)=><div key={i} style={{flex:1,height:5+Math.random()*25,background:i%2?'#ff444f':'#00a79e'}}/>)}</div>

      <div style={{padding:8,background:'#1a1a1a'}}>
        <div style={{display:'flex',gap:6,marginBottom:8}}>
          <input type="number" value={amt} onChange={e=>setAmt(Number(e.target.value))} style={{flex:1,padding:8,borderRadius:6,background:'#0e0e0e',border:'1px solid #333',color:'#fff'}}/>
          <div style={{background:'#0e0e0e',border:'1px solid #333',padding:'8px 12px',borderRadius:6}}>1 min</div>
        </div>
        <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:8}}>
          <button onClick={()=>place('Buy')} style={{background:'#00a79e',border:'none',padding:14,borderRadius:6,color:'#fff',fontWeight:800}}>Buy ▲ 90%</button>
          <button onClick={()=>place('Sell')} style={{background:'#ff444f',border:'none',padding:14,borderRadius:6,color:'#fff',fontWeight:800}}>Sell ▼ 90%</button>
        </div>
      </div>

      {open&&(
        <div style={{position:'absolute',inset:0,background:'#0e0e0e',zIndex:20,padding:12,overflow:'auto'}}>
          <div style={{display:'flex',justifyContent:'space-between'}}><b>Select Market - Real Deriv API</b><span onClick={()=>setOpen(false)}>✕</span></div>
          {markets.map(m=><div key={m.id} onClick={()=>changeSymbol(m.id)} style={{padding:'12px 0',borderBottom:'1px solid #2a2a2a',display:'flex',justifyContent:'space-between',cursor:'pointer'}}><span>{m.name}</span><span style={{color:'#00a79e'}}>{m.id}</span></div>)}
        </div>
      )}
    </div>
  )
}
