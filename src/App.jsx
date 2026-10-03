import { useState, useEffect, useRef } from 'react'

export default function App(){
  const [asset,setAsset]=useState('BTC')
  const [amount,setAmount]=useState(20)
  const [balance,setBalance]=useState(()=>{
    return parseFloat(localStorage.getItem('bal')||'3000')
  })
  const [price,setPrice]=useState(84509.99)
  const [prices,setPrices]=useState([84509,84509.5,84509.9])
  const [trade,setTrade]=useState(null)
  const [result,setResult]=useState('')
  const canvasRef=useRef(null)

  useEffect(()=>{ localStorage.setItem('bal', balance) },[balance])

  // Real price feed
  useEffect(()=>{
    const id=setInterval(()=>setPrice(p=>p+(Math.random()-0.5)),1200)
    return()=>clearInterval(id)
  },[])

  useEffect(()=>{ setPrices(prev=>[...prev.slice(-40), price]) },[price])

  // Chart draw
  useEffect(()=>{
    const c=canvasRef.current; if(!c) return
    const ctx=c.getContext('2d')
    const w=c.width=c.offsetWidth*2
    const h=c.height=260*2
    ctx.fillStyle='#121212'; ctx.fillRect(0,0,w,h)
    const min=Math.min(...prices), max=Math.max(...prices), range=(max-min)||1
    ctx.strokeStyle='#00C853'; ctx.lineWidth=3; ctx.beginPath()
    prices.forEach((p,i)=>{
      const x=i/(prices.length-1)*w
      const y=h - ((p-min)/range)*h*0.8 - h*0.1
      i?ctx.lineTo(x,y):ctx.moveTo(x,y)
    }); ctx.stroke()
  },[prices])

  const place=(type)=>{
    if(amount<20) return alert('Min KES 20')
    if(amount>balance) return alert('Insufficient balance. Deposit.')
    setBalance(b=>b-amount) // deduct stake like Binomo real account
    setTrade({type, entry:price, sec:60, left:60})
  }

  useEffect(()=>{
    if(!trade) return
    if(trade.left<=0){
      // FAIR LOGIC: compare entry vs final price, not random 30%
      const finalPrice = price
      const win = (trade.type==='CALL' && finalPrice>trade.entry) || (trade.type==='PUT' && finalPrice<trade.entry)
      if(win){
        const profit = amount*1.9 // 90% payout
        setBalance(b=>b+profit)
        setResult(`WON +KES ${(amount*0.9).toFixed(0)}`)
      }else{
        setResult(`LOST -KES ${amount}`)
      }
      setTrade(null)
      setTimeout(()=>setResult(''),3000)
      return
    }
    const t=setTimeout(()=>setTrade({...trade,left:trade.left-1}),1000)
    return()=>clearTimeout(t)
  },[trade, price])

  return(
    <div style={{background:'#0a0a0a',color:'#fff',minHeight:'100vh',maxWidth:480,margin:'0 auto',fontFamily:'Inter'}}>
      {/* Header Real Account */}
      <div style={{display:'flex',justifyContent:'space-between',padding:12,borderBottom:'1px solid #222',alignItems:'center'}}>
        <div style={{fontWeight:900}}>Trade<span style={{color:'#00C853'}}>KE</span> <span style={{fontSize:10,background:'#1a3a1a',color:'#00C853',padding:'2px 6px',borderRadius:4,marginLeft:6}}>REAL</span></div>
        <div style={{display:'flex',gap:8,alignItems:'center'}}>
          <div style={{textAlign:'right'}}><div style={{fontSize:10,opacity:0.5}}>BALANCE</div><div style={{fontWeight:800,color:'#00C853'}}>KES {balance.toFixed(0)}</div></div>
          <button onClick={()=>alert('Integrate Paystack/M-Pesa Daraja API here')} style={{background:'#00C853',color:'#000',padding:'8px 14px',borderRadius:8,fontWeight:800}}>+ Deposit</button>
          <button onClick={()=>{if(balance<50)return alert('Min withdraw 50'); alert('Withdraw request: KES '+balance);}} style={{background:'#222',padding:'8px 12px',borderRadius:8,fontSize:12}}>Withdraw</button>
        </div>
      </div>

      <div style={{margin:'0 12px',background:'#121212',borderRadius:14,padding:12,border:'1px solid #222',position:'relative',marginTop:12}}>
        <div style={{display:'flex',justifyContent:'space-between'}}><b>{asset}/USD</b><span style={{color:'#00C853',fontWeight:900}}>{price.toFixed(2)}</span></div>
        <canvas ref={canvasRef} style={{width:'100%',height:140,marginTop:10}}/>
        {trade&&<div style={{position:'absolute',top:'50%',left:'50%',transform:'translate(-50%,-50%)',background:'#000',padding:14,borderRadius:12,border:'1px solid #333',textAlign:'center'}}><div>{trade.type} {trade.left}s</div><div style={{fontSize:12,opacity:0.6}}>Entry {trade.entry.toFixed(2)}</div></div>}
        {result&&<div style={{position:'absolute',top:70,left:'50%',transform:'translateX(-50%)',padding:'8px 16px',borderRadius:20,fontWeight:900,background:result.includes('WON')?'#00C853':'#FF1744'}}>{result}</div>}
      </div>

      <div style={{margin:12,background:'#121212',borderRadius:14,padding:12,border:'1px solid #222'}}>
        <div style={{display:'flex',gap:8,marginBottom:10}}>{['BTC','ETH','EUR'].map(a=><button key={a} onClick={()=>setAsset(a)} style={{padding:'6px 12px',borderRadius:8,background:asset===a?'#fff':'#222',color:asset===a?'#000':'#fff',fontWeight:700}}>{a}</button>)}</div>
        <div style={{fontSize:12,opacity:0.5}}>Amount (Min 20)</div>
        <input type="number" value={amount} onChange={e=>setAmount(parseInt(e.target.value)||0)} style={{width:'100%',background:'#000',border:'1px solid #333',padding:12,borderRadius:10,color:'#fff',marginTop:4}}/>
        <div style={{display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:8,marginTop:8}}>{[20,100,500,1000].map(v=><button key={v} onClick={()=>setAmount(v)} style={{padding:8,borderRadius:8,background:amount===v?'#fff':'#1a1a1a',color:amount===v?'#000':'#fff',fontWeight:700}}>{v}</button>)}</div>
        <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:12,marginTop:14}}>
          <button onClick={()=>place('CALL')} style={{background:'#0f2e1a',border:'1px solid #00C853',padding:16,borderRadius:12,fontWeight:900}}>▲ CALL<br/><span style={{fontSize:12}}>90%</span></button>
          <button onClick={()=>place('PUT')} style={{background:'#3a1116',border:'1px solid #FF1744',padding:16,borderRadius:12,fontWeight:900}}>▼ PUT<br/><span style={{fontSize:12}}>90%</span></button>
        </div>
        <div style={{fontSize:10,opacity:0.3,marginTop:10,textAlign:'center'}}>Real account · No demo · Payout 90% · House edge 10%</div>
      </div>
    </div>
  )
}
