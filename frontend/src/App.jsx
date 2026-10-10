import {useState,useEffect,useCallback} from 'react'
import Layout from './components/Layout.jsx'
import Dashboard from './pages/Dashboard.jsx'
import Mission from './pages/Mission.jsx'
import Camera from './pages/Camera.jsx'
import MapPage from './pages/Map.jsx'
import Settings from './pages/Settings.jsx'
import {mission,activity,detections} from './data/mockData.js'
import DetectionAlert from './components/DetectionAlert.jsx'

const pages={dashboard:Dashboard,mission:Mission,camera:Camera,map:MapPage,settings:Settings}
const fmt=n=>`14:${String(32+n).padStart(2,'0')}`

export default function App(){
  const [page,setPage]=useState('dashboard')
  const [status,setStatus]=useState('SEARCHING')
  const [progress,setProgress]=useState(mission.progress)
  const [logs,setLogs]=useState(activity)
  const [toasts,setToasts]=useState([])
  const [tick,setTick]=useState(0)
  const [settings,setSettings]=useState({sim:true,auto:true,vision:true,alerts:true,dark:true,compact:false,grid:true})
  const [cam,setCam]=useState({playing:true,scanning:true})
  const [objectives,setObjectives]=useState(3)
  const [alert,setAlert]=useState(null)
  const [seen,setSeen]=useState(false)

  
  const [backendStatus, setBackendStatus] = useState(null);

  useEffect(() => {
    const checkStatus = async () => {
      try {
        const response = await fetch('http://127.0.0.1:3001/api/status');
        if (!response.ok) return;

        const data = await response.json();
        setBackendStatus(data);

        if (
          data.person_detected === true &&
          data.mode === 'WAITING_FOR_HUMAN'
        ) {
          setAlert((current) => current ?? {
            conf: 92,
            x: data.detection_zone ?? 'Unknown',
            y: '—',
          });
        } else {
          setAlert(null);
        }
      } catch (error) {
        console.error('Backend status check failed:', error);
      }
    };

    checkStatus();
    const id = setInterval(checkStatus, 2000);
    return () => clearInterval(id);
  }, []);


  const toast=useCallback(m=>{const id=Math.random();setToasts(t=>[...t,{id,m}]);setTimeout(()=>setToasts(t=>t.filter(x=>x.id!==id)),3200)},[])
  const log=useCallback((m,k='info')=>{setTick(n=>{setLogs(l=>[{t:fmt(n),m,k},...l]);return n+1})},[])
  const act=(s,m,k,tm)=>{setStatus(s);log(m,k);toast(tm||m)}

  useEffect(()=>{
    if(!['SEARCHING','NAVIGATING'].includes(status))return
    const id=setInterval(()=>setProgress(p=>{
      if(p>=100){setStatus('COMPLETE');return 100}
      return Math.min(100,p+(status==='NAVIGATING'?2:1))}),2000)
    return()=>clearInterval(id)
  },[status])
const raise=()=>{
  log('Person detected at (4.2, 7.8) with 92% confidence','danger')
  if(settings.alerts)setAlert(detections[0]); else toast('Person detected (alerts are off).')
}
  const sim={raise,status,progress,logs,settings,cam,objectives,detections,
    toggleSetting:k=>setSettings(s=>({...s,[k]:!s[k]})),
    setCam:p=>setCam(c=>({...c,...p})),toast,go:setPage,
    navigate:()=>{if(['ABORTED','PAUSED'].includes(status))return toast('Mission is not active.');setProgress(p=>Math.max(p,70));setObjectives(4);act('NAVIGATING','Navigation initiated toward detected target.','ok','Navigating to target (4.2, 7.8)')},
    start:()=>{setProgress(p=>p>=100?0:p);act('SEARCHING','Mission started.','ok')},
    pause:()=>status==='ABORTED'?toast('Mission aborted. Start a new mission.'):act('PAUSED','Mission paused by operator.','warn'),
    resume:()=>['PAUSED','HOLDING'].includes(status)?act('SEARCHING','Mission resumed.','ok'):toast('Mission is not paused.'),
    
    holdCamera: async () => {
      try {
        const response = await fetch('http://127.0.0.1:3001/api/decision', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ decision: 'HOLD' }),
        });

        const data = await response.json();
        if (!response.ok) throw new Error(data.error || 'Hold failed');

        setAlert(null);
        setStatus('HOLDING');
        log('Backend confirmed HOLD. Camera held on target.', 'warn');
        toast('Camera held on target');
      } catch (error) {
        toast('Hold failed: ' + error.message);
      }
    },

    continueMission: async () => {
      try {
        const response = await fetch('http://127.0.0.1:3001/api/decision', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ decision: 'GREEN' }),
        });

        const data = await response.json();
        if (!response.ok) throw new Error(data.error || 'Continue failed');

        setAlert(null);
        setStatus('SEARCHING');
        setCam({ playing: true, scanning: true });
        log('Backend confirmed GREEN. Mission resumed.', 'ok');
        toast('Mission resumed');
      } catch (error) {
        toast('Continue failed: ' + error.message);
      }
    },
  abort:()=>act('ABORTED','Mission aborted by operator.','danger')}

  const Page=pages[page]
  return <Layout page={page} setPage={setPage} toasts={toasts} status={status} settings={settings}><Page s={sim}/>{alert&&<DetectionAlert d={alert} s={sim}/>}</Layout>
}
