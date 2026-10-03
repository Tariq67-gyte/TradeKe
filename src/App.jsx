import { useState, useEffect } from 'react'
export default function App(){
  const [symbol,setSymbol]=useState("BINANCE:BTCUSD")
  const [duration,setDuration]=useState(1)
  const [amount,setAmount]=useState(20)
  const [winRate,setWinRate]=useState(40)
  const [showWithdraw,setShowWithdraw]=useState(false)
  const isAdmin = window.location.pathname==='/admin'
  useEffect(()=>{
    const load=()=>{
      const el=document.getElementById('tv_chart'); if(!el) return;
      if(window.TradingView){ new window.TradingView.widget({autosize:true,symbol:symbol,interval:"1",timezone:"Africa/Nairobi",theme:"dark",style:"1",locale:"en",container_id:"tv_chart"}) }
      else setTimeout(load,500)
    }; load();
  },[symbol])
  const trade=(t)=>{ const r=Math.random()*100; alert(t+" "+amount+" KES "+duration+"m => "+(r<winRate?'WIN +'+amount*0.9:'LOSS -'+amount)) }
  if(isAdmin){ return (<div className="bg-black min-h-screen text-white p-6"><h1 className="text-xl font-black">Admin Panel</h1><p className="text-zinc-400 text-sm">Murithitimothy778@gmail.com only</p><div className="bg-zinc-900 p-6 rounded-xl mt-6 max-w-md"><p className="font-bold">Global Win Rate Slider</p><input type="range" min="20" max="80" value={winRate} onChange={e=>setWinRate(e.target.value)} className="w-full accent-green-500 mt-4"/><p className="text-3xl font-black text-green-500 mt-3">{winRate}% WIN / {100-winRate}% LOSS for users</p><button onClick={()=>alert('Saved '+winRate+'%')} className="bg-white text-black w-full py-3 rounded-xl font-bold mt-4">Save Setting</button></div><a href="/" className="text-zinc-400 mt-4 block">← Back to Trade</a></div>) }
  return (
    <div className="bg-black min-h-screen text-white pb-[90px]">
      <div className="flex justify-between items-center p-3 border-b border-zinc-800">
        <div className="flex gap-2">{[["BTC","BINANCE:BTCUSD"],["ETH","BINANCE:ETHUSD"],["EUR","FX:EURUSD"]].map(([l,s])=><button key={l} onClick={()=>setSymbol(s)} className={`px-3 py-1.5 rounded-lg text-sm font-bold ${symbol===s?'bg-white text-black':'bg-zinc-800'}`}>{l}</button>)}</div>
        <div className="flex gap-2"><button className="bg-[#00C853] px-4 py-2 rounded-lg font-black text-sm">Deposit</button><button onClick={()=>setShowWithdraw(true)} className="border border-white px-4 py-2 rounded-lg text-sm">Withdraw</button></div>
      </div>
      <div className="flex gap-2 p-3">{[1,2,5,10,15].map(m=><button key={m} onClick={()=>setDuration(m)} className={`px-3 py-1 rounded-full text-sm font-bold ${duration===m?'bg-white text-black':'bg-zinc-800'}`}>{m}m</button>)}</div>
      <div id="tv_chart" style={{height:'50vh', background:'#000'}}></div>
      <div className="flex gap-2 p-3">{[20,50,100,500,1000].map(v=><button key={v} onClick={()=>setAmount(v)} className={`px-4 py-2 rounded-lg text-sm font-bold ${amount===v?'bg-white text-black':'bg-zinc-800'}`}>{v}</button>)}</div>
      <div className="fixed bottom-0 left-0 right-0 p-3 bg-black border-t border-zinc-800 flex gap-3 z-50">
        <button onClick={()=>trade('BUY')} className="flex-1 bg-[#00C853] h-[64px] rounded-xl font-black text-lg">BUY ▲<span className="block text-xs">90%</span></button>
        <button onClick={()=>trade('SELL')} className="flex-1 bg-[#FF1744] h-[64px] rounded-xl font-black text-lg">SELL ▼<span className="block text-xs">90%</span></button>
      </div>
      {showWithdraw && (<div className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-[60]"><div className="bg-zinc-900 p-6 rounded-2xl w-full max-w-sm border border-zinc-800"><h3 className="font-black text-lg mb-4">Withdraw M-Pesa</h3><input placeholder="Amount Min 300" className="w-full p-3 bg-black border border-zinc-700 rounded-xl mb-3 text-white"/><input placeholder="Phone 2547..." className="w-full p-3 bg-black border border-zinc-700 rounded-xl mb-3 text-white"/><p className="text-xs text-zinc-400 mb-4">Fee 20. Admin approves.</p><button className="w-full bg-white text-black py-3 rounded-xl font-black">Request</button><button onClick={()=>setShowWithdraw(false)} className="w-full mt-3 text-zinc-500">Close</button></div></div>)}
    </div>
  )
      }
