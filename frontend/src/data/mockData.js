// SIMULATION DATA — replace with real API responses later.
export const robot={id:'DG-R01',battery:78,signal:94,temp:41,pos:{x:4.2,y:5.7},speed:0.8,mode:'Autonomous',firmware:'Prototype 0.1'}
export const mission={id:'DG-001',title:'Locate and identify survivors in hazardous terrain.',priority:'HIGH',started:'14:25',eta:'14:47',progress:64}
export const detections=[
{label:'Person',conf:92,x:4.2,y:7.8,type:'Human',priority:'High',box:[40,26,18,40]},
{label:'Debris',conf:87,x:2.1,y:6.4,type:'Structure',priority:'Low',box:[6,54,24,28]},
{label:'Obstacle',conf:81,x:6.8,y:5.9,type:'Hazard',priority:'Medium',box:[68,56,24,26]}]
export const activity=[
{t:'14:31',m:'Person detected at (4.2, 7.8) with 92% confidence',k:'danger'},
{t:'14:30',m:'Robot started autonomous navigation',k:'ok'},
{t:'14:28',m:'Mission updated',k:'info'},
{t:'14:27',m:'Vision system initialized',k:'info'},
{t:'14:25',m:'System online',k:'ok'}]
export const objectives=[['Area initialized',true],['Autonomous exploration started',true],['Vision scan active',true],['Target verification',false],['Reach target',false],['Mission report',false]]
export const map={target:{x:4.2,y:7.8},hazards:[[2,3],[7.2,4],[6.2,8.4]],explored:[[0.5,1],[6,1],[7.5,6],[5,7],[1,6]],distance:'12.4 m',direction:'North-East'}
export const flow=['Mission','Robot','Vision','Detection','Location','Navigation','Operator']
export const demoTime='14:32'
