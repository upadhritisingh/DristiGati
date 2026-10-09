import {Bot,Pause,Play} from 'lucide-react'

export default function DetectionAlert({d,s}){
  return <div className="modal-bg"><div className="modal" role="alertdialog" aria-modal="true" aria-labelledby="da-t">
    <span className="badge danger">Simulation Data</span>
    <h2 id="da-t"><Bot size={20}/> Human Detected</h2>
    <p>The robot has detected a possible survivor. Do you want to hold the camera here or continue the mission?</p>
    <dl className="kv"><dt>Confidence</dt><dd>{d.conf}%</dd><dt>Coordinates</dt><dd>X {d.x} / Y {d.y}</dd></dl>
    <div className="controls">
      <button autoFocus className="btn primary" onClick={s.holdCamera}><Pause size={16}/>Hold Camera Here</button>
      <button className="btn" onClick={s.continueMission}><Play size={16}/>Continue Mission</button>
    </div>
  </div></div>
}