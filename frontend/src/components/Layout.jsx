import {useState} from 'react'
import {LayoutDashboard,Target,Video,Map as MapIcon,Settings,Menu,X,Bell,User,Crosshair} from 'lucide-react'
import {demoTime} from '../data/mockData.js'
import Toast from './Toast.jsx'

const nav=[['dashboard','Dashboard',LayoutDashboard],['mission','Mission',Target],['camera','Camera / Vision',Video],['map','Map',MapIcon],['settings','Settings',Settings]]
export const Logo=()=><div className="logo"><span className="logo-mark"><Crosshair size={20}/></span><span><b>Dṛṣṭigati</b><small>Autonomous Reconnaissance System</small></span></div>

export default function Layout({page,setPage,toasts,children,settings}){
  const [open,setOpen]=useState(false)
  const [bell,setBell]=useState(false)
  const go=p=>{setPage(p);setOpen(false)}
  return <div className={`app ${settings.compact?'compact':''}`}>
    <aside className={`sidebar ${open?'open':''}`} aria-label="Primary">
      <div className="side-top"><Logo/><button className="icon-btn mobile-only" aria-label="Close menu" onClick={()=>setOpen(false)}><X size={20}/></button></div>
      <nav>{nav.map(([id,l,I])=><button key={id} className={`nav-item ${page===id?'active':''}`} aria-current={page===id?'page':undefined} onClick={()=>go(id)}><I size={18}/>{l}</button>)}</nav>
      <div className="side-foot"><span className="badge warn">Prototype Mode</span><small>v0.1 Demo</small></div>
    </aside>
    {open&&<div className="scrim" onClick={()=>setOpen(false)}/>}
    <div className="main">
      <header className="topbar">
        <button className="icon-btn mobile-only" aria-label="Open menu" onClick={()=>setOpen(true)}><Menu size={22}/></button>
        <div className="top-logo mobile-only"><Logo/></div>
        <div className="grow"/>
        <span className="online"><i className="dot ok pulse"/> <span className="hide-sm">System Online</span></span>
        <span className="clock" title="Demo time">{demoTime}</span>
        <button className="icon-btn" aria-label="Notifications" onClick={()=>setBell(b=>!b)}><Bell size={19}/><i className="notif"/></button>
        {bell&&<div className="popover" role="status">Simulated alert: possible survivor detected at (4.2, 7.8).</div>}
        <button className="icon-btn" aria-label="Operator profile"><User size={19}/></button>
      </header>
      <main className="content">{children}</main>
    </div>
    <Toast toasts={toasts}/>
  </div>
}
