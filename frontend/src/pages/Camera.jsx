import {PageHead} from '../components/Header.jsx'
import CameraFeed from '../components/CameraFeed.jsx'
import {Card,Bar} from '../components/StatusBadge.jsx'
export default function Camera({s}){
  const on=s.settings.vision
  return <><PageHead title="Camera / Vision" sub="Simulated vision analysis" badge="Simulation Data"/>
  <div className="grid cam">
    <CameraFeed s={s} tall/>
    <div className="stack">
      <Card title="Detected Objects"><ul className="objs">{on?s.detections.map(d=><li key={d.label}><span className="grow">{d.label}</span><b>{d.conf}%</b><Bar v={d.conf}/></li>):<li>Vision detection is off. Enable it in Settings.</li>}</ul></Card>
      <Card title="Vision Analysis" right={<span className="badge warn">Simulation Data</span>}>
        <dl className="kv"><dt>Detection status</dt><dd>{on?'Active':'Off'}</dd><dt>Objects detected</dt><dd>{on?3:0}</dd><dt>Highest confidence</dt><dd>{on?'92%':'—'}</dd><dt>Last scan</dt><dd>14:31</dd></dl></Card>
    </div></div></>}
