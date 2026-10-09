import {useState} from 'react'
import {ZoomIn,ZoomOut,LocateFixed,Route,Crosshair} from 'lucide-react'
import {PageHead} from '../components/Header.jsx'
import MapPanel from '../components/MapPanel.jsx'
import {Card} from '../components/StatusBadge.jsx'
import {robot,map} from '../data/mockData.js'
export default function MapPage({s}){
  const [zoom,setZoom]=useState(1),[path,setPath]=useState(true),[tg,setTg]=useState(true)
  const tools=<div className="controls">
    <button className="btn" onClick={()=>setZoom(z=>Math.min(2.5,+(z+.25).toFixed(2)))}><ZoomIn size={16}/>Zoom In</button>
    <button className="btn" onClick={()=>setZoom(z=>Math.max(.75,+(z-.25).toFixed(2)))}><ZoomOut size={16}/>Zoom Out</button>
    <button className="btn" onClick={()=>{setZoom(1);s.toast('Centered on robot.')}}><LocateFixed size={16}/>Center Robot</button>
    <button className={`btn ${path?'primary':''}`} aria-pressed={path} onClick={()=>setPath(!path)}><Route size={16}/>Toggle Path</button>
    <button className={`btn ${tg?'primary':''}`} aria-pressed={tg} onClick={()=>setTg(!tg)}><Crosshair size={16}/>Toggle Targets</button></div>
  return <><PageHead title="Map" sub="Simulated navigation interface" badge="Simulation Data"/>
  <div className="grid cam"><MapPanel s={s} zoom={zoom} path={path} targets={tg} big title="Navigation Map" tools={tools}/>
    <Card title="Navigation Info"><dl className="kv"><dt>Robot coordinates</dt><dd>X {robot.pos.x} / Y {robot.pos.y}</dd><dt>Target coordinates</dt><dd>X {map.target.x} / Y {map.target.y}</dd><dt>Distance to target</dt><dd>{map.distance}</dd><dt>Direction</dt><dd>{map.direction}</dd><dt>Navigation mode</dt><dd>Autonomous</dd></dl></Card></div></>}
