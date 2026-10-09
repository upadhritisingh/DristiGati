import {robot,map} from '../data/mockData.js'
import {Card} from './StatusBadge.jsx'
const P=(x,y)=>[x*40,300-y*30]
export default function MapPanel({s,zoom=1,path=true,targets=true,big,title='Navigation Map',tools}){
  const [rx,ry]=P(robot.pos.x,robot.pos.y),[tx,ty]=P(map.target.x,map.target.y)
  const nav=s.status==='NAVIGATING'
  const ex=map.explored.map(p=>P(...p).join(',')).join(' ')
  return <Card title={title} right={<span className="badge info">Simulation Data</span>}>
    {tools}
    <div className={`map ${big?'big':''}`}>
      <svg viewBox="0 0 400 300" role="img" aria-label="Simulated navigation map">
        <g style={{transform:`scale(${zoom})`,transformOrigin:`${rx}px ${ry}px`,transition:'transform .3s'}}>
          <rect width="400" height="300" fill="#08111e"/>
          {s.settings.grid&&Array.from({length:11},(_,i)=><g key={i}><path d={`M${i*40} 0V300`} stroke="#38BDF8" strokeOpacity=".1"/><path d={`M0 ${i*30}H400`} stroke="#38BDF8" strokeOpacity=".1"/></g>)}
          <polygon points={ex} fill="#2F6BFF" fillOpacity=".12" stroke="#2F6BFF" strokeOpacity=".4" strokeDasharray="4 3"/>
          {map.hazards.map(([x,y],i)=>{const [hx,hy]=P(x,y);return <g key={i}><circle cx={hx} cy={hy} r="14" fill="#F59E0B" fillOpacity=".15" stroke="#F59E0B" strokeDasharray="3 2"/><path d={`M${hx} ${hy-6}l6 11h-12z`} fill="#F59E0B"/></g>})}
          {path&&<path d={`M${rx} ${ry} C ${rx-30} ${ry-25}, ${tx+30} ${ty+25}, ${tx} ${ty}`} fill="none" stroke="#38BDF8" strokeWidth="2" strokeDasharray="6 4" className={nav?'flow':''}/>}
          {targets&&<g><circle cx={tx} cy={ty} r="12" fill="#EF4444" fillOpacity=".2"/><circle cx={tx} cy={ty} r="5" fill="#EF4444"/></g>}
          <circle cx={rx} cy={ry} r="10" fill="#2F6BFF" fillOpacity=".3" className="ping"/><circle cx={rx} cy={ry} r="6" fill="#2F6BFF" stroke="#fff" strokeWidth="1.5"/>
        </g>
        <g transform="translate(372 30)" fill="#94A3B8" fontSize="11" textAnchor="middle"><circle r="16" fill="none" stroke="#94A3B8" strokeOpacity=".4"/><path d="M0-12l4 8h-8z" fill="#38BDF8"/><text y="14">N</text></g>
      </svg>
    </div>
    <div className="legend"><span><i className="dot blue"/>Robot</span><span><i className="dot danger"/>Target</span><span><i className="line"/>Planned Path</span></div>
  </Card>
}
