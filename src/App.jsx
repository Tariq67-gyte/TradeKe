import { useState, useEffect, useRef } from 'react'

export default function App(){
  const [asset,setAsset]=useState('BTC')
  const [amount,setAmount]=useState(20)
  const [balance,setBalance]=useState(3000)
  const [price,setPrice]=useState(84509.99)
  const [prices,setPrices]=useState([84509.96,84509.97,84509.99,84510.0,84509.99])
  const [trade,setTrade]=useState(null)
  const [result,setResult]=useState('')
  const [tab,setTab]=useState('Trade')
  const canvasRef=useRef(null)

  // WIN RATE = 30% = user loses 70%
  const WIN_RATE = 0.30

  const assets={
    BTC:{label:'BTC/USD',payout:90,price:84509.99,dec:2},
    ETH:{label:'ETH/USD',payout:88,price:2665.94,dec:2},
    EUR:{label:'EUR/USD',payout:85,price:1.1247,dec:4},
  }

  // Live price simulation + Binance fetch
  useEffect(()=>{
    const id=setInterval(async()=>{
      try{
        if(asset==='BTC'){
          const r=await fetch('https://api.binance.com/api/v3/ticker/price?symbol=BTCUSDT').then(r=>r.json())
          if(r.price) setPrice(parseFloat(r.price))
        }
      }catch{}
      // small random walk for chart
      setPrice(p=>p + (Math.random()-0.5)*0.5)
    },1500)
    return()=>clearInterval(id)
  },[asset])

  useEffect(()=>{
    setPrices(prev=>[...prev.slice(-30), price])
  },[price])

  // Draw chart like screenshot
  useEffect(()=>{
    const c=canvasRef.current
    if(!c) return
    const ctx=c.getContext('2d')
    const w=c.width= c.offsetWidth*2
    const h=c.height= 260*2
    ctx.clearRect(0,0,w,h)
    ctx.fillStyle='#121212'
    ctx.fillRect(0,0,w,h)

    const min=Math.min(...prices)
    const max=Math.max(...prices)
    const range=(max-min)||1

    // grid dashed lines
    ctx.strokeStyle='#2a2a2a'
    ctx.setLineDash([8,8])
    ctx.beginPath()
    ctx.moveTo(0,h*0.35); ctx.lineTo(w,h*0.35); ctx.stroke()
    ctx.beginPath()
    ctx.moveTo(0,h*0.65); ctx.lineTo(w,h*0.65); ctx.stroke()
    ctx.setLineDash([])

    // price line
    ctx.strokeStyle='#00C853'
    ctx.lineWidth=4
    ctx.beginPath()
    prices.forEach((p,i)=>{
      const x=(i/(prices.length-1))*w
      const y=h - ((p-min)/range)*h*0.8 - h*0.1
      if(i===0) ctx.moveTo(x,y)
      else ctx.lineTo(x,y)
    })
    ctx.stroke()

    // current price label
    const lastY=h - ((prices[prices.length-1]-min)/range)*h*0.8 - h*0.1
    ctx.fillStyle='#00C853'
    ctx.fillRect(w-140,lastY-20,140,28)
    ctx.fillStyle='#fff'
    ctx.font='bold 24px sans-serif'
    ctx.fillText(price.toFixed(2), w-130, lastY)
  },[prices, price])

  const place=(type)=>{
    if(amount<20) return
    setTrade({type, sec:60, left:60, entry:price})
    setResult('')
  }

  useEffect(()=>{
    if(!trade) return
    if(trade.left<=0){
      const win=Math.random() < WIN_RATE // 30% win
      const profit=amount*0.9
      if(win){
        setBalance(b=>b+profit)
        setResult(`WON +KES ${profit.toFixed(0)}`)
      }else{
        setBalance(b=>b-amount)
        setResult(`LOST -KES ${amount}`)
      }
      setTrade(null)
      setTimeout(()=>setResult(''),2500)
      return
    }
    const t=setTimeout(()=>setTrade({...trade,left:trade.left-1}),1000)
    return()=>clearTimeout(t)
  },[trade])

  const payout = (amount * (assets[asset].payout/100)).toFixed(0)

  return(
    <div style={{background:'#0a0a0a',color:'#fff',minHeight:'100vh',fontFamily:'Inter,sans-serif',maxWidth:480,margin:'0 auto'}}>
      {/* Header */}
      <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',padding:'12px 16px',borderBottom:'1px solid #222'}}>
        <div style={{fontWeight:900,fontSize:22}}>Trade<span style={{color:'#00C853'}}>KE</span></div>
        <div style={{display:'flex',gap:8,alignItems:'center'}}>
          <div style={{textAlign:'right'}}><div style={{fontSize:10,opacity:0.6}}>BALANCE</div><div style={{fontWeight:800}}>KES {balance.toFixed(0)}</div></div>
          <button style={{background:'#1a3a1a',color:'#00C853',padding:'8px 14px',borderRadius:8,fontWeight:700}}>+ Deposit</button>
          <div style={{fontSize:12,opacity:0.6}}>Logout</div>
        </div>
      </div>

      {/* Invite */}
      <div style={{background:'#121212',margin:12,padding:10,borderRadius:10,textAlign:'center',color:'#00C853',fontSize:13}}>
        🎁 Invite friends — Earn 20% forever →
      </div>

      {/* Tabs */}
      <div style={{display:'flex',borderBottom:'1px solid #222'}}>
        {['Trade','Refer & Earn'].map(t=><button key={t} onClick={()=>setTab(t)} style={{flex:1,padding:12,fontWeight:tab===t?800:400,color:tab===t?'#00C853':'#888',borderBottom:tab===t?'2px solid #00C853':'none'}}>{t}</button>)}
      </div>

      {/* Asset selector */}
      <div style={{display:'flex',gap:8,padding:12,overflow:'auto'}}>
        {Object.keys(assets).map(k=>{
          const a=assets[k]
          return(
          <button key={k} onClick={()=>setAsset(k)} style={{minWidth:120,padding:10,borderRadius:12,background:asset===k?'#222':'#121212',border:asset===k?'1px solid #444':'1px solid #222',textAlign:'left'}}>
            <div style={{display:'flex',justifyContent:'space-between',fontWeight:700,fontSize:13}}>{a.label} <span style={{color:'#00C853'}}>{a.payout}%</span></div>
            <div style={{opacity:0.7,fontSize:12,marginTop:4}}>{k==='EUR'?a.price:price.toFixed(2)}</div>
          </button>
        )})}
      </div>

      {/* Chart Card */}
      <div style={{margin:'0 12px',background:'#121212',borderRadius:14,padding:12,border:'1px solid #222',position:'relative'}}>
        <div style={{display:'flex',justifyContent:'space-between',alignItems:'center'}}>
          <div style={{fontWeight:700,opacity:0.7}}>{assets[asset].label}</div>
          <div style={{color:'#00C853',fontWeight:900,fontSize:22}}>{price.toFixed(asset==='EUR'?4:2)}</div>
        </div>
        <canvas ref={canvasRef} style={{width:'100%',height:130,marginTop:10}}/>
        <div style={{display:'flex',justifyContent:'space-between',fontSize:11,opacity:0.5,marginTop:4}}>
          <span></span><span>{trade?`${trade.left}s`:''}</span>
        </div>

        {trade&&<div style={{position:'absolute',top:'50%',left:'50%',transform:'translate(-50%,-50%)',background:'#000',border:'1px solid #333',padding:'12px 18px',borderRadius:12,textAlign:'center'}}>
          <div style={{fontWeight:900}}>{trade.type} {trade.left}s</div>
          <div style={{width:80,height:4,background:'#333',marginTop:6}}><div style={{height:4,background:'#00C853',width:`${(trade.left/trade.sec)*100}%`}}/></div>
        </div>}
        {result&&<div style={{position:'absolute',top:60,left:'50%',transform:'translateX(-50%)',padding:'8px 16px',borderRadius:20,fontWeight:900,background:result.includes('WON')?'#00C853':'#FF1744'}}>{result}</div>}
      </div>

      {/* Amount */}
      <div style={{margin:12,background:'#121212',borderRadius:14,padding:12,border:'1px solid #222'}}>
        <div style={{fontSize:12,opacity:0.6,marginBottom:6}}>Amount (KES, min 20)</div>
        <input type="number" value={amount} onChange={e=>setAmount(parseInt(e.target.value)||0)} style={{width:'100%',background:'#0a0a0a',border:'1px solid #333',padding:12,borderRadius:10,color:'#fff',fontSize:18}}/>
        <div style={{display:'grid',gridTemplateColumns:'1fr 1fr 1fr 1fr',gap:8,marginTop:10}}>
          {[20,100,500,1000].map(v=><button key={v} onClick={()=>setAmount(v)} style={{padding:10,borderRadius:8,background:amount===v?'#fff':'#1a1a1a',color:amount===v?'#000':'#fff',fontWeight:700}}>{v}</button>)}
        </div>
        <div style={{fontSize:12,opacity:0.6,marginTop:10}}>Time: 1 min · Payout: <span style={{color:'#00C853'}}>KES {payout}</span></div>

        <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:12,marginTop:14}}>
          <button onClick={()=>place('CALL')} style={{background:'#0f2e1a',border:'1px solid #00C853',color:'#fff',padding:16,borderRadius:12,fontWeight:900,fontSize:18}}>▲ CALL</button>
          <button onClick={()=>place('PUT')} style={{background:'#3a1116',border:'1px solid #FF1744',color:'#fff',padding:16,borderRadius:12,fontWeight:900,fontSize:18}}>▼ PUT</button>
        </div>
      </div>

      <div style={{textAlign:'center',opacity:0.3,fontSize:10,paddingBottom:20}}>Win rate set to 30% · Admin: trade-ke.vercel.app/admin</div>
    </div>
  )
}
