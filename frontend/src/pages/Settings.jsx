import {PageHead} from '../components/Header.jsx'
import {Card} from '../components/StatusBadge.jsx'
import {robot} from '../data/mockData.js'
const T=({s,k,l})=><div className="tog"><span id={k}>{l}</span><button role="switch" aria-checked={s.settings[k]} aria-labelledby={k} className={`switch ${s.settings[k]?'on':''}`} onClick={()=>s.toggleSetting(k)}><i/></button></div>
export default function Settings({s}){return <><PageHead title="Settings" sub="Prototype configuration (local only)"/>
  <div className="grid three">
    <Card title="System"><T s={s} k="sim" l="Simulation Mode"/><T s={s} k="auto" l="Autonomous Mode"/><T s={s} k="vision" l="Vision Detection"/><T s={s} k="alerts" l="Alerts"/></Card>
    <Card title="Display"><T s={s} k="dark" l="Dark Theme"/><T s={s} k="compact" l="Compact Dashboard"/><T s={s} k="grid" l="Map Grid"/></Card>
    <Card title="Robot"><dl className="kv"><dt>Robot ID</dt><dd>{robot.id}</dd><dt>Communication</dt><dd>Connected (simulated)</dd><dt>Firmware</dt><dd>{robot.firmware}</dd></dl></Card>
  </div></>}
