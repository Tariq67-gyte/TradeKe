import { useState, useEffect } from 'react'

export default function App(){
  const [theme,setTheme]=useState('dark')
  const [asset,setAsset]=useState('BTC/USDC')
  const [price,setPrice]=useState(119107.10)
  const [open,setOpen]=useState(false)
  const [balance,setBalance]=useState(()=>Number(localStorage.getItem('bal')||3000))
  const [amount,setAmount]=useState(100)
  const [time,setTime]=useState(1)
  const [trade,setTrade]=useState(null)
  const [history,setHistory]=useState([])

  const coins=[
    {s:'BTC/USDC',p:119107.10,high:'119.412,05',low:'116.951,55',vol:'2.130,27'},
    {s:'ETH/USDC',p:2665.94,high:'2.700,12',low:'2.590,44',vol:'12.430,11'},
    {s:'SOL/USDC',p:145.22,high:'148,90',low:'142,10',vol:'45.221,09'},
    {s:'BNB/USDC',p:615.30,high:'620,11',low:'600,33',vol:'8.221,00'},
    {s:'XRP/USDC',p:0.5234,high:'0.55',low:'0.51',vol:'2.1M'},
    {s:'OTC BTC',p:119000.00,high:'119.412,05',low:'116.951,55',vol:'1.980,27'},
  ]

  useEffect(()=>{
    const id=setInterval(()=>setPrice(p=>p+(Math.random()-0.5)*1.2),1500)
    return()=>clearInterval(id)
  },[])

  const place=(type)=>{
    if(amount<20) return alert('Min KES 20')
    if(amount>balance) return alert('Low balance - Deposit')
    const nb=balance-amount
    setBalance(nb); localStorage.setItem('bal',nb)
    setTrade({type,entry:price,left:time*60,amount})
  }

  useEffect(()=>{
    if(!trade) return
    if(trade.left<=0){
      const win=(trade.type==='Buy'&&price>trade.entry)||(trade.type==='Sell'&&price<trade.entry)
      if(win){
        const payout=trade.amount*1.9
        setBalance(b=>{const n=b+payout; localStorage.setItem('bal',n); return n})
        setHistory(h=>[{...trade,result:'WIN',payout:trade.amount*0.9,final:price},...h].slice(0,10))
      }else{
        setHistory(h=>[{...trade,result:'LOSS',payout:-trade.amount,final:price},...h].slice(0,10))
      }
      setTrade(null); return
    }
    const t=setTimeout(()=>setTrade({...trade,left:trade.left-1}),1000)
    return()=>clearTimeout(t)
  },[trade,price])

  const bg=theme==='dark'?'#1e2329':'#fff'
  const card=theme==='dark'?'#2b2f36':'#f2f2f2'
  const txt=theme==='dark'?'#fff':'#111'
  const sub='#848e9c'

  return(
    <div style={{width:390,margin:'0 auto',background:bg,color:txt,minHeight:'100vh',fontSize:11,fontFamily:'Inter, sans-serif',position:'relative'}}>
      <div style={{display:'flex',justifyContent:'space-between',padding:'8px 10px',borderBottom:`1px solid ${card}`}}>
        <b onClick={()=>setOpen(true)} style={{cursor:'pointer'}}>← {asset} ▼</b>
        <div style={{display:'flex',gap:8,alignItems:'center'}}>
          <span style={{fontSize:8,background:'#f0b90b',color:'#000',padding:'2px 6px',borderRadius:4,fontWeight:800}}>REAL</span>
          <div style={{textAlign:'right'}}><div style={{fontSize:8,color:sub}}>BALANCE</div><div style={{fontSize:12,fontWeight:800,color:'#0ecb81'}}>KES {balance.toFixed(0)}</div></div>
          <button onClick={()=>{const p=prompt('M-Pesa amount?','100'); if(p){const n=balance+Number(p); setBalance(n); localStorage.setItem('bal',n)}} } style={{background:'#f0b90b',border:'none',padding:'4px 8px',borderRadius:6,fontSize:9,fontWeight:700}}>+</button>
        </div>
      </div>

      <div style={{display:'flex',gap:10,padding:'6px 10px',fontSize:10,color:sub,borderBottom:`1px solid ${card}`}}><span style={{borderBottom:'2px solid #f0b90b',color:txt,paddingBottom:3}}>Price</span><span>Info</span><span>Trading Data</span><span>Square</span></div>

      <div style={{display:'flex',justifyContent:'space-between',padding:'6px 10px'}}>
        <div><div style={{fontSize:20,fontWeight:800}}>{price.toLocaleString('de-DE',{minimumFractionDigits:2})}</div><div style={{fontSize:10}}>$ {price.toLocaleString('de-DE')} <span style={{color:'#0ecb81'}}>+1,28%</span></div></div>
        <div style={{fontSize:8,color:sub,textAlign:'right',lineHeight:1.4}}>24h High<br/><span style={{color:txt}}>{coins.find(c=>c.s===asset)?.high}</span><br/>24h Low<br/><span style={{color:txt}}>{coins.find(c=>c.s===asset)?.low}</span></div>
        <div style={{fontSize:8,color:sub,textAlign:'right',lineHeight:1.4}}>24h Vol<br/><span style={{color:txt}}>{coins.find(c=>c.s===asset)?.vol}</span><br/>Payout<br/><span style={{color:'#0ecb81'}}>90%</span></div>
      </div>

      <div style={{display:'flex',gap:10,padding:'4px 10px',fontSize:10,color:sub}}><span>Time</span><span>15m</span><span>4h</span><span>1d</span><span style={{color:txt,borderBottom:'1px solid #f0b90b'}}>1w</span><span>More</span><span style={{marginLeft:'auto'}}>MA(25): 96.998,45</span></div>

      <div style={{height:320,background:bg,position:'relative'}}>
        <svg width="390" height="280" viewBox="0 0 390 280">
          {[0,1,2,3,4,5].map(i=><line key={i} x1="0" y1={i*46} x2="390" y2={i*46} stroke={card} strokeWidth="0.5"/>)}
          {Array.from({length:30}).map((_,i)=>{
            const x=6+i*12, base=60+Math.sin(i*0.7)*25+50, h=8+Math.random()*40
            const up=Math.random()>0.4
            return <g key={i}><line x1={x+3} y1={base-10} x2={x+3} y2={base+h+10} stroke={up?'#0ecb81':'#f6465d'} strokeWidth="1"/><rect x={x} y={base} width="6" height={h} fill={up?'#0ecb81':'#f6465d'}/></g>
          })}
          <path d="M0 215 Q70 185 120 160 T200 130 T300 95 T390 70" stroke="#c27cce" fill="none" strokeWidth="1"/>
        </svg>
        <div style={{position:'absolute',right:4,top:10,fontSize:8,color:sub,lineHeight:'46px'}}>122.123,27<br/>110.193,92<br/>98.264,58<br/>86.335,23<br/>74.405,89<br/>62.476,54</div>
        {trade&&<div style={{position:'absolute',top:20,left:10,background:'#0b0e11',border:'1px solid #f0b90b',padding:'6px 10px',borderRadius:8}}><div style={{fontSize:10,fontWeight:700}}>{trade.type} {trade.left}s</div><div style={{fontSize:8,opacity:0.6}}>Entry {trade.entry.toFixed(2)} → {price.toFixed(2)}</div></div>}
      </div>

      <div style={{height:60,display:'flex',gap:1,alignItems:'end'}}>{Array.from({length:45}).map((_,i)=><div key={i} style={{flex:1,height:4+Math.random()*35,background:i%6===0?'#f6465d':'#0ecb81'}}/>)}</div>
      <div style={{display:'flex',justifyContent:'space-between',fontSize:8,padding:'2px 10px',color:sub}}><span>Vol: 26.522,88133 MA(5):26.518,02284</span><span>K:85,83 D:80,69 J:96,12</span></div>

      <div style={{padding:8,background:card,borderTop:`1px solid ${card}`}}>
        <div style={{display:'flex',gap:6,marginBottom:8}}>
          <input type="number" value={amount} onChange={e=>setAmount(Number(e.target.value)||0)} style={{flex:1,background:bg,border:`1px solid ${bg}`,padding:8,borderRadius:8,color:txt}}/>
          {[1,2,5,10,15].map(t=><button key={t} onClick={()=>setTime(t)} style={{padding:'6px 8px',borderRadius:6,background:time===t?'#fff':'#1e2329',color:time===t?'#000':'#fff',border:'none',fontSize:10}}>{t}m</button>)}
        </div>
        <div style={{display:'grid',gridTemplateColumns:'1fr 1fr 1fr 1fr 2fr 2fr',gap:6,alignItems:'center'}}>
          <div onClick={()=>setOpen(true)} style={{textAlign:'center',cursor:'pointer'}}><div>⋯</div><div style={{fontSize:8}}>More</div></div>
          <div style={{textAlign:'center'}}><div>🔔</div><div style={{fontSize:8}}>Alert</div></div>
          <div style={{textAlign:'center'}}><div>◈</div><div style={{fontSize:8}}>Margin</div></div>
          <div style={{textAlign:'center'}}><div>≋</div><div style={{fontSize:8}}>Grid</div></div>
          <button onClick={()=>place('Buy')} style={{background:'#0ecb81',border:'none',padding:12,borderRadius:10,color:'#fff',fontWeight:800}}>Buy</button>
          <button onClick={()=>place('Sell')} style={{background:'#f6465d',border:'none',padding:12,borderRadius:10,color:'#fff',fontWeight:800}}>Sell</button>
        </div>
        {history.length>0&&<div style={{marginTop:8,fontSize:9}}>{history.map((h,i)=><div key={i} style={{display:'flex',justifyContent:'space-between',padding:'2px 0',borderBottom:'0.5px solid #333'}}><span>{h.type} {h.amount} KES</span><span style={{color:h.result==='WIN'?'#0ecb81':'#f6465d'}}>{h.result} {h.payout>0?'+'+h.payout:h.payout}</span></div>)}</div>}
      </div>

      {open&&(
        <div style={{position:'absolute',inset:0,background:bg,zIndex:20,padding:12,overflow:'auto'}}>
          <div style={{display:'flex',justifyContent:'space-between'}}><b>Binomo Settings</b><span onClick={()=>setOpen(false)} style={{cursor:'pointer'}}>✕</span></div>
          <div style={{marginTop:12,fontSize:9,color:sub}}>THEME</div>
          <div style={{display:'flex',gap:6,marginTop:4}}>{['dark','light'].map(t=><button key={t} onClick={()=>setTheme(t)} style={{padding:'6px 12px',borderRadius:6,background:theme===t?'#f0b90b':'#2b2f36',color:theme===t?'#000':'#fff'}}>{t}</button>)}</div>
          <div style={{marginTop:12,fontSize:9,color:sub}}>CANDLE PATTERN</div>
          <div style={{display:'flex',gap:6,marginTop:4,flexWrap:'wrap'}}>{['Candles','Line','Heikin Ashi','Hollow','Area','Bars'].map(c=><button key={c} style={{padding:'6px 10px',borderRadius:6,background:'#2b2f36',color:'#fff',fontSize:9}}>{c}</button>)}</div>
          <div style={{marginTop:12,fontSize:9,color:sub}}>ALL ASSETS - Binomo Style</div>
          {coins.map(c=><div key={c.s} onClick={()=>{setAsset(c.s); setPrice(c.p); setOpen(false)}} style={{display:'flex',justifyContent:'space-between',padding:'10px 0',borderBottom:`1px solid ${card}`,cursor:'pointer'}}><span>● {c.s}</span><span>{c.p}</span></div>)}
          <button onClick={()=>setOpen(false)} style={{width:'100%',marginTop:14,padding:12,background:'#f0b90b',border:'none',borderRadius:10,fontWeight:800}}>Done</button>
        </div>
      )}
    </div>
  )
}
