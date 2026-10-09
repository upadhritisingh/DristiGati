import {Play,Pause,RotateCw,OctagonX,Check,Circle} from 'lucide-react'
import {PageHead,Flow} from '../components/Header.jsx'
import {Card,Bar} from '../components/StatusBadge.jsx'
import StatusBadge from '../components/StatusBadge.jsx'
import {ActivityLog} from '../components/Cards.jsx'
import {mission,objectives,robot,detections} from '../data/mockData.js'
export default function Mission({s}){
  const objs=objectives.map(([l],i)=>[l,i<s.objectives])
  return <><PageHead title={`Mission ${mission.id}`} sub={mission.title}/>
  <Flow status={s.status}/>
  <div className="grid two">
    <Card title="Mission Overview" right={<StatusBadge>{s.status}</StatusBadge>}>
      <dl className="kv"><dt>Mission ID</dt><dd>{mission.id}</dd><dt>Priority</dt><dd><StatusBadge>{mission.priority}</StatusBadge></dd><dt>Target</dt><dd>Person · X {detections[0].x} / Y {detections[0].y}</dd><dt>Robot position</dt><dd>X {robot.pos.x} / Y {robot.pos.y}</dd></dl>
      <div className="prog"><span>Progress</span><b>{s.progress}%</b></div><Bar v={s.progress}/>
      <div className="controls">
        <button className="btn primary" onClick={s.start}><Play size={16}/>Start Mission</button>
        <button className="btn" onClick={s.pause}><Pause size={16}/>Pause</button>
        <button className="btn" onClick={s.resume}><RotateCw size={16}/>Resume</button>
        <button className="btn danger" onClick={s.abort}><OctagonX size={16}/>Abort Mission</button></div></Card>
    <Card title="Objectives"><ul className="objs">{objs.map(([l,d])=><li key={l} className={d?'done':''}>{d?<Check size={16}/>:<Circle size={16}/>}{l}</li>)}</ul></Card>
  </div><ActivityLog logs={s.logs}/></>}
