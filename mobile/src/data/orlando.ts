import type {Destination,Coordinate,Incident,IncidentType,Route} from '../types/index';
export const ORLANDO = { latitude:28.5426,longitude:-81.3787,latitudeDelta:.019,longitudeDelta:.018 };
export const ORIGIN:Coordinate = {latitude:28.5383,longitude:-81.3792};
export const DESTINATIONS:Destination[]=[
 {id:'eola',name:'Lake Eola Park',detail:'Park · Downtown Orlando',coordinate:{latitude:28.5435,longitude:-81.3743}},
 {id:'library',name:'Orlando Public Library',detail:'Library · Central Boulevard',coordinate:{latitude:28.5419,longitude:-81.3769}},
 {id:'station',name:'Church Street Station',detail:'Station · Church Street',coordinate:{latitude:28.5401,longitude:-81.3822}},
 {id:'arts',name:'Dr. Phillips Center',detail:'Performing arts · Magnolia Avenue',coordinate:{latitude:28.5380,longitude:-81.3770}},
];
export const INCIDENT_TYPES:IncidentType[]=['Theft','Burglary','Assault','Vandalism'];
export const REPORT_TYPES=['Poor lighting','Isolated area','Uncomfortable encounter','Harassment','Blocked walkway','Other concern'];
export function makeIncidents(now = new Date()):Incident[]{
 const centers=[{latitude:28.541,longitude:-81.3795},{latitude:28.544,longitude:-81.377},{latitude:28.546,longitude:-81.381},{latitude:28.539,longitude:-81.376}];
 return Array.from({length:156},(_,i)=>{const p=centers[i%9<4?0:i%9<7?1:i%9===7?2:3],date=new Date(now);date.setDate(date.getDate()-(i*37)%400);date.setHours(12,0,0,0);return {id:`sample-${i}`,type:INCIDENT_TYPES[(i*7)%4],occurredAt:date.toISOString(),coordinate:{latitude:p.latitude+(((i*19)%21)-10)*.00008,longitude:p.longitude+(((i*23)%21)-10)*.00008}}});
}
export function sampleRoutes(destination:Destination):Route[]{
 const d=destination.coordinate;
 return [
 {id:'safe',name:'Safest route',mode:'safe',score:92,note:'Well-lit streets · 2 help points',detail:'A little more peace of mind. Pass open businesses and two nearby help points.',coordinates:[ORIGIN,{latitude:ORIGIN.latitude+.004,longitude:ORIGIN.longitude},{latitude:ORIGIN.latitude+.004,longitude:-81.3768},{latitude:d.latitude,longitude:-81.3768},d],distance:2250,duration:1080,source:'sample',steps:[{instruction:'Start near Orlando City Hall and use the busier northbound blocks.',distance:520},{instruction:'Stay on well-lit streets near open businesses.',distance:760},{instruction:`Continue toward ${destination.name} past nearby help points.`,distance:970}]},
 {id:'fast',name:'Fastest route',mode:'fast',score:74,note:'Direct route · 1 sample report',detail:'A shorter walk through a quieter stretch of the neighborhood.',coordinates:[ORIGIN,{latitude:d.latitude,longitude:ORIGIN.longitude},d],distance:1770,duration:840,source:'sample',steps:[{instruction:'Take the direct northbound route from City Hall.',distance:620},{instruction:`Turn toward ${destination.name}.`,distance:720},{instruction:'Arrive using the shortest sample path.',distance:430}]},
 {id:'transit',name:'Public transit',mode:'transit',score:88,note:'Bus + 6-minute walk',detail:'Walk to Church Street, then take the demo Route 12 bus.',coordinates:[ORIGIN,{latitude:ORIGIN.latitude,longitude:-81.3822},{latitude:28.5401,longitude:-81.3822},{latitude:28.5401,longitude:d.longitude},d],distance:2900,duration:1380,source:'sample',steps:[{instruction:'Walk to Church Street Station.',distance:540},{instruction:'Take the demo Route 12 bus through downtown Orlando.',distance:1880},{instruction:`Walk the last few minutes to ${destination.name}.`,distance:480}]},
 ];
}
