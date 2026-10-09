export default function Toast({toasts}){return <div className="toasts" aria-live="polite">{toasts.map(t=><div key={t.id} className="toast">{t.m}</div>)}</div>}
