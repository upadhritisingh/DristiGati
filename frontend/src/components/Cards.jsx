import {
  BatteryMedium,
  Signal,
  Thermometer,
  Gauge,
  MapPin,
  Bot,
  Navigation,
  Cpu,
} from 'lucide-react';

import { Card, Bar } from './StatusBadge.jsx';
import StatusBadge from './StatusBadge.jsx';
import { robot, mission } from '../data/mockData.js';

const Row = ({ I, l, v, bar, kind }) => (
  <div className="row">
    <I size={16} />
    <span>{l}</span>
    <b>{v}</b>
    {bar != null && <Bar v={bar} kind={kind} />}
  </div>
);

export const RobotStatus = ({ s }) => (
  <Card
    title="Robot Status"
    right={<StatusBadge>{s.status}</StatusBadge>}
  >
    <Row
      I={BatteryMedium}
      l="Battery"
      v={robot.battery + '%'}
      bar={robot.battery}
      kind="ok"
    />
    <Row
      I={Signal}
      l="Signal"
      v={robot.signal + '%'}
      bar={robot.signal}
    />
    <Row I={Thermometer} l="Temperature" v={robot.temp + '°C'} />
    <Row
      I={MapPin}
      l="Position"
      v={`X ${robot.pos.x} / Y ${robot.pos.y}`}
    />
    <Row I={Gauge} l="Speed" v={robot.speed + ' m/s'} />
    <Row I={Cpu} l="Mode" v={robot.mode} />
  </Card>
);

export const MissionCard = ({ s }) => (
  <Card
    title="Current Mission"
    right={<StatusBadge>{s.status}</StatusBadge>}
  >
    <p className="lead">{mission.title}</p>

    <dl className="kv">
      <dt>Mission ID</dt>
      <dd>{mission.id}</dd>

      <dt>Priority</dt>
      <dd>
        <StatusBadge>{mission.priority}</StatusBadge>
      </dd>

      <dt>Started</dt>
      <dd>{mission.started}</dd>

      <dt>Est. completion</dt>
      <dd>{mission.eta}</dd>
    </dl>

    <div className="prog">
      <span>Progress</span>
      <b>{s.progress}%</b>
    </div>

    <Bar v={s.progress} />

    <button
      className="btn primary full"
      onClick={() => s.go('mission')}
    >
      View Mission
    </button>
  </Card>
);

export const DetectionCard = ({ s }) => {
  const d = s.detections[0];

  if (!d) {
    return (
      <Card
        title="Latest Detection"
        right={<span className="badge danger">Simulation Data</span>}
      >
        <p className="lead">No detections available</p>

        <button
          className="btn full"
          onClick={s.raise}
        >
          Simulate New Detection
        </button>
      </Card>
    );
  }

  return (
    <Card
      title="Latest Detection"
      right={<span className="badge danger">Simulation Data</span>}
    >
      <p className="lead">
        <Bot size={18} /> {d.label} Detected
      </p>

      <dl className="kv">
        <dt>Confidence</dt>
        <dd>{d.conf}%</dd>

        <dt>Coordinates</dt>
        <dd>
          X {d.x} / Y {d.y}
        </dd>

        <dt>Type</dt>
        <dd>{d.type}</dd>

        <dt>Priority</dt>
        <dd>{d.priority}</dd>
      </dl>

      <button
        className="btn primary full"
        onClick={s.navigate}
      >
        <Navigation size={16} /> Navigate to Target
      </button>

      <button
        className="btn full"
        onClick={s.raise}
      >
        Simulate New Detection
      </button>
    </Card>
  );
};

export const ActivityLog = ({ logs }) => (
  <Card title="Recent Activity">
    <ol className="timeline">
      {logs.map((l, i) => (
        <li key={i}>
          <i className={`dot ${l.k}`} />
          <time>{l.t}</time>
          <span>{l.m}</span>
        </li>
      ))}
    </ol>
  </Card>
);