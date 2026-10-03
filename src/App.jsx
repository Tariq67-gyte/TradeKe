import { useState, useEffect } from 'react'

export default function App(){
  const [asset,setAsset]=useState('BTC/USDC')
  const [price,setPrice]=useState(119107.10)
  const [balance,setBalance]=useState(()=>Number(localStorage.getItem('bal')||3000))
  const [amount,setAmount]=useState(100)
  const [trade,setTrade]=useState(null)
  const [open,setOpen]=useState(false)
  const [theme,setTheme]=useState('dark')
  const [time,setTime]=useState(1)
  const [optionType,setOptionType]=useState('Rise/Fall')

  const assets=[
    {s:'BTC/USDC',p:119107},{s:'ETH/USDC',p:2665},{s:'SOL/USDC',p:145},
    {s:'BNB/USDC',p:615},{s:'Volatility 10',p:5123},{s:'Volatility 100',p:10234},
    {s:'Boom 1000',p:1000},{s:'Crash 1000',p:1000},{s:'EUR/USD',p:1.0845},
  ]

  const binaryOptions=[
    {name:'Rise/Fall', payout:90, desc:'Price will rise or fall'},
    {name:'Higher/Lower', payout:90, desc:'Higher or lower than barrier'},
    {name:'Touch/No Touch', payout:85, desc:'Touch barrier or not'},
    {name:'Ends Between/Outside', payout:80, desc:'Ends inside/outside range'},
    {name:'Stays Between/Goes Outside', payout:75, desc:'Stays inside during trade'},
    {name:'Turbo', payout:95, desc:'30 sec - 5 min fast'},
    {name:'Vanilla', payout:90, desc:'Classic Buy/Sell'},
  ]

  useEffect(()=>{
    const id=setInterval(()=>setPrice(v=>v+(Math.random()-0.5)*1.5),1000)
    return()=>clearInterval(id)
  },[])

  const place=(type)=>{
    if(amount<20) return alert('Min 20')
    if(amount>balance) return alert('Low balance')
    setBalance(b=>{const n=b-amount; localStorage.setItem('bal',n); return n})
    const currentOpt=binaryOptions.find(o=>o.name===optionType)
    setTrade({type,entry:price,left:time*60,amt:amount,payout:currentOpt.payout,opt:optionType,barrier:price+5s 
