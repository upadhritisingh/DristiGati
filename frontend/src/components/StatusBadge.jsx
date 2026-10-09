const tone={SEARCHING:'info',NAVIGATING:'ok',PAUSED:'warn',ABORTED:'danger',COMPLETE:'ok',HIGH:'danger',HOLDING:'warn'}
export default function StatusBadge({children,kind}){return <span className={`badge ${kind||tone[children]||'info'}`}>{children}</span>}
export const Card=({title,right,children,className=''})=><section className={`card ${className}`}><div className="card-h"><h2>{title}</h2>{right}</div>{children}</section>
export const Bar=({v,kind=''})=><div className="bar"><i className={kind} style={{width:`${v}%`}}/></div>
