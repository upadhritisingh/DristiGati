import {PageHead,Flow} from '../components/Header.jsx'
import CameraFeed from '../components/CameraFeed.jsx'
import MapPanel from '../components/MapPanel.jsx'
import {MissionCard,RobotStatus,DetectionCard,ActivityLog} from '../components/Cards.jsx'
export default function Dashboard({s}){return <>
  <PageHead title="Mission Control" sub="Autonomous search and reconnaissance overview"/>
  <p className="tag"><b>See Beyond. Navigate the Unknown.</b> Vision-based autonomous reconnaissance for hazardous and unmapped environments.</p>
  <Flow status={s.status}/>

<div style={{ margin: '16px 0' }}>
  <button
    onClick={async () => {
      try {
        const response = await fetch(
          'http://127.0.0.1:3001/api/decision',
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              decision: 'GREEN',
            }),
          }
        );

        const data = await response.json();

        if (!response.ok) {
          throw new Error(
            data.error || 'Request failed'
          );
        }

        alert(
          'DristiGati: ' +
          (data.mode || 'Green decision accepted')
        );
      } catch (error) {
        alert(
          'Backend connection failed: ' +
          error.message
        );
      }
    }}
    style={{
      background: '#16a34a',
      color: 'white',
      padding: '12px 20px',
      border: 'none',
      borderRadius: '8px',
      cursor: 'pointer',
      fontWeight: 'bold',
    }}
  >
    🟢 Green Flag — Resume
  </button>
</div>
```

  <div className="grid dash">
    <div className="a-cam"><CameraFeed s={s}/></div><div className="a-mis"><MissionCard s={s}/></div>
    <div className="a-rob"><RobotStatus s={s}/></div><div className="a-det"><DetectionCard s={s}/></div>
    <div className="a-map"><MapPanel s={s}/></div><div className="a-log"><ActivityLog logs={s.logs}/></div>
  </div></>}
