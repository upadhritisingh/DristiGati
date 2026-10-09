import {useRef} from 'react'
import {Play,Pause,ScanLine,Camera,Maximize} from 'lucide-react'
import {Card} from './StatusBadge.jsx'

export default function CameraFeed({s,tall}){
  const ref=useRef(null)
  const {playing,scanning}=s.cam
  const on=s.settings.vision
  const full=()=>ref.current?.requestFullscreen?.().catch(()=>s.toast('Fullscreen unavailable.'))
  return <Card title="Vision Feed" right={<span className="badge warn">Simulation Mode</span>}>
    <div ref={ref} className={`viewport ${tall?'tall':''} ${playing?'':'paused'}`}>
      {playing ? (
        <img
          src="http://127.0.0.1:3001/api/video"
          alt="Live DristiGati robot camera feed"
          className="terrain"
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            position: 'absolute',
            inset: 0,
          }}
        />
      ) : (
        <div
          className="terrain"
          style={{
            position: 'absolute',
            inset: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: '#050c16',
            color: '#94a3b8',
          }}
        >
          Camera Paused
        </div>
      )}

      {on&&scanning&&playing&&<div className="scanline"/>}
      <div className="reticle"><i/></div>
      <div className="v-top"><span><i className="dot danger pulse"/> VISION FEED</span><span>VISION SIMULATION</span></div>
      <div className="v-bot"><span>{!on?'DETECTION OFF':s.status==='HOLDING'?'CAMERA HELD ON TARGET':!playing?'PAUSED':scanning?'SCANNING…':'IDLE'}</span><span>X 4.2 Y 7.8 · 14:32:07</span></div>
    </div>
    <div className="controls">
      <button className="btn" onClick={()=>s.setCam({playing:true})}><Play size={16}/>Play</button>
      <button className="btn" onClick={()=>s.setCam({playing:false})}><Pause size={16}/>Pause</button>
      <button className={`btn ${scanning?'primary':''}`} onClick={()=>{s.setCam({scanning:!scanning});s.toast(scanning?'Scan stopped.':'Scan started.')}}><ScanLine size={16}/>Scan</button>
      <button className="btn" onClick={()=>s.toast('Snapshot saved (simulated).')}><Camera size={16}/>Snapshot</button>
      <button className="btn" onClick={full}><Maximize size={16}/>Fullscreen</button>
    </div>
  </Card>
}
