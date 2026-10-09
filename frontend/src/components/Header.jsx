import StatusBadge from './StatusBadge.jsx'
import {flow} from '../data/mockData.js'
export const PageHead=({title,sub,badge='Simulation Mode'})=><div className="page-head"><div><h1>{title}</h1><p>{sub}</p></div><StatusBadge kind="warn">{badge}</StatusBadge></div>
export const Flow=({status})=><ol className="flow-strip" aria-label="Mission flow">{flow.map((f,i)=><li key={f} className={i<=(status==='NAVIGATING'?5:3)?'done':''}>{f}</li>)}</ol>
