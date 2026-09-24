import React,{useState} from 'react';
import {View,Pressable,Alert} from 'react-native';
import {router} from 'expo-router';
import {Page,Title,Eyebrow,Txt,Card,Button,Chips,Toggle,Notice,Sheet} from '../components/UI';
import {NativeMap} from '../components/NativeMap';
import {makeIncidents,INCIDENT_TYPES,ORIGIN} from '../data/orlando';
import {concentrationCells,filterIncidents,cutoffDate} from '../lib/logic';
import {useApp} from '../state/AppProvider';
import type {IncidentType,Coordinate} from '../types';
export default function Activity(){
 const {data,colors}=useApp();
 const [now]=useState(()=>new Date()),[all]=useState(()=>makeIncidents(now));
 const [months,setMonths]=useState(6),[types,setTypes]=useState<IncidentType[]>(INCIDENT_TYPES);
 const [mode,setMode]=useState('heat'),[personal,setPersonal]=useState(true),[filters,setFilters]=useState(false);
 const [selectedCell,setSelectedCell]=useState<string|null>(null);
 const incidents=filterIncidents(all,months,types,now),cells=concentrationCells(incidents),selected=cells.find(cell=>cell.id===selectedCell);
 const report=(c:Coordinate)=>router.push({pathname:'/report',params:{latitude:String(c.latitude),longitude:String(c.longitude)}});
 return <Page title="Downtown Orlando" back>
  <Eyebrow>NEIGHBORHOOD ACTIVITY</Eyebrow>
  <Title>See the bigger picture.</Title>
  <Notice>All incidents are invented for this demo. They are not police records or a measure of actual safety.</Notice>
  <Chips items={[{id:1,label:'Last month'},{id:6,label:'Last 6 months'},{id:12,label:'Last year'}]} value={months} onChange={v=>{setMonths(v);setSelectedCell(null)}}/>
  <Button secondary title={`Incident types · ${types.length}/4`} icon="sliders" onPress={()=>setFilters(true)}/>
  <Chips items={[{id:'heat',label:'Concentration'},{id:'dots',label:'Incident dots'}]} value={mode} onChange={setMode}/>
  <NativeMap height={360} incidents={incidents} concentration={mode==='heat'} reports={personal?data.reports:[]} selectedCell={selectedCell} onLongPress={report} onReport={r=>router.push({pathname:'/report',params:{id:r.id}})} onIncident={i=>Alert.alert(`Sample ${i.type}`,`${new Date(i.occurredAt).toLocaleDateString()}\nInvented incident. No real police report.`)}/>
  <Txt bold style={{marginTop:12}}>{incidents.length} sample incidents</Txt>
  <View style={{flexDirection:'row',height:7,borderRadius:8,overflow:'hidden',marginVertical:10}}>{['#ecd18a','#e9ad56','#dc714b','#b23446'].map(color=><View key={color} style={{flex:1,backgroundColor:color}}/>)}</View>
  <Txt size={12} muted>Fewer → More · 1–4, 5–9, 10–19, 20+ per map cell.</Txt>
  <Txt size={12} muted>{cutoffDate(now,months).toLocaleDateString()} – {now.toLocaleDateString()}</Txt>
  <Toggle title="My reported areas" detail="Orange circles · excluded from incident counts" value={personal} onChange={setPersonal}/>
  {selected&&<Card style={{borderColor:colors.coral}}><Eyebrow>SELECTED AREA</Eyebrow><Txt bold>{selected.count} sample incidents in this cell</Txt><Txt muted size={13}>{selected.center.latitude.toFixed(4)}, {selected.center.longitude.toFixed(4)}</Txt><Button title="Report this area" icon="flag" onPress={()=>report(selected.center)}/></Card>}
  <Button title="Report an area" icon="flag" onPress={()=>report(ORIGIN)}/>
  <Eyebrow>HIGHEST SAMPLE CONCENTRATIONS</Eyebrow>
  {cells.length?cells.slice(0,3).map((cell,i)=><Pressable key={cell.id} accessibilityRole="button" onPress={()=>{setMode('heat');setSelectedCell(cell.id)}}><Card style={{borderColor:selectedCell===cell.id?colors.coral:colors.line}}><Txt bold>Area {i+1} · {cell.count} sample incidents</Txt><Txt size={12} muted>{cell.center.latitude.toFixed(4)}, {cell.center.longitude.toFixed(4)} · {Math.round(cell.count/incidents.length*100)}% of filtered incidents</Txt><Txt size={12}>Tap to outline this cell on the map.</Txt></Card></Pressable>):<Card><Txt>No matching incidents. Change the time or incident filters.</Txt></Card>}
  <Txt size={12} muted>Counts in approximately equal 200 m cells, not population-adjusted crime rates. Personal reports remain separate.</Txt>
  <Eyebrow>MY REPORTED AREAS</Eyebrow>
  {data.reports.length?data.reports.map(r=><Pressable key={r.id} accessibilityRole="button" onPress={()=>router.push({pathname:'/report',params:{id:r.id}})}><Card><Txt bold>{r.type}</Txt><Txt muted size={13}>{r.note||'No note'} · {r.radius} m · {new Date(r.createdAt).toLocaleDateString()}</Txt></Card></Pressable>):<Card><Txt>No personal areas yet. Hold the map or tap Report an area.</Txt></Card>}
  <Sheet title="Incident types" visible={filters} onClose={()=>setFilters(false)}>
   {INCIDENT_TYPES.map(type=><Toggle key={type} title={type} value={types.includes(type)} onChange={v=>{setTypes(t=>v?[...t,type]:t.filter(x=>x!==type));setSelectedCell(null)}}/>)}
   <Button title="Select all types" secondary onPress={()=>setTypes(INCIDENT_TYPES)}/>
   <Button title="Show results" onPress={()=>setFilters(false)}/>
  </Sheet>
 </Page>;
}
