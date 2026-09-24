import React,{useMemo,useState} from 'react';
import {Pressable,View} from 'react-native';
import {router,useLocalSearchParams} from 'expo-router';
import {Page,Title,Eyebrow,Txt,Card,Button,Toggle,Notice,Icon,IconName} from '../../components/UI';
import {NativeMap} from '../../components/NativeMap';
import {useApp} from '../../state/AppProvider';
import {DESTINATIONS,INCIDENT_TYPES,makeIncidents,sampleRoutes} from '../../data/orlando';
import {filterIncidents,incidentBreakdown,nearbyIncidents,nearbyReports,positionAt} from '../../lib/logic';
import type {Route} from '../../types';

function first(value:string|string[]|undefined){return Array.isArray(value)?value[0]:value}
function mins(seconds:number){return `${Math.round(seconds/60)} min`}
function feet(meters:number){return `${Math.round(meters*3.28084)} ft`}
function miles(meters:number){return `${(meters/1609.344).toFixed(1)} mi`}
function routeIcon(route:Route):IconName{return route.mode==='safe'?'shield':route.mode==='transit'?'truck':'arrow-up-right'}

export default function Trips(){
 const params=useLocalSearchParams<{destination?:string}>();
 const {data,setData,colors,startTrip,endTrip,notify}=useApp();
 const selectedDestination=DESTINATIONS.find(d=>d.id===first(params.destination))||DESTINATIONS[0];
 const [destination,setDestination]=useState(selectedDestination);
 const routes=useMemo(()=>sampleRoutes(destination),[destination]);
 const incidents=useMemo(()=>filterIncidents(makeIncidents(),6,INCIDENT_TYPES),[]);
 const [routeId,setRouteId]=useState(routes[0].id);
 const selectedRoute=routes.find(r=>r.id===routeId)||routes[0];
 const routeIncidents=incidents.filter(i=>nearbyIncidents(selectedRoute,[i])>0);
 const routeReports=nearbyReports(selectedRoute,data.reports);
 const breakdown=incidentBreakdown(routeIncidents);
 const [recipients,setRecipients]=useState(()=>data.contacts.filter(c=>c.trip).map(c=>c.id));
 const active=data.active;
 const progress=Math.round((active?.progress||0)*100);
 const start=()=>{startTrip(destination,selectedRoute,recipients);notify('Demo trip started. No live location or messages were sent.')};

 if(active){
  const position=positionAt(active.route.coordinates,active.progress);
  return <Page title="Trip">
   <Eyebrow>ACTIVE TRIP</Eyebrow>
   <Title>{active.destination.name}</Title>
   <NativeMap height={360} route={active.route.coordinates} position={position} reports={data.reports}/>
   <Card>
    <View style={{flexDirection:'row',alignItems:'center',justifyContent:'space-between',gap:16}}>
     <View style={{flex:1}}><Txt bold>{progress}% complete</Txt><Txt muted size={13}>{mins(active.route.duration)} route · {active.paused?'Paused':'Moving in demo mode'}</Txt></View>
     <Txt bold size={22}>{mins(active.route.duration*(1-active.progress))}</Txt>
    </View>
    <View style={{height:9,borderRadius:20,backgroundColor:colors.blush,marginTop:14,overflow:'hidden'}}><View style={{height:9,width:`${progress}%`,backgroundColor:colors.coral}}/></View>
   </Card>
   <Card>
    <Eyebrow>NEXT STEPS</Eyebrow>
    {active.route.steps.map((step,index)=><View key={`${step.instruction}-${index}`} style={{flexDirection:'row',gap:10,marginTop:index?10:0}}><Txt bold>{index+1}</Txt><View style={{flex:1}}><Txt>{step.instruction}</Txt><Txt muted size={12}>{feet(step.distance)}</Txt></View></View>)}
   </Card>
   <Card><Eyebrow>SHARING</Eyebrow><Txt>{active.recipients.length?`Following along: ${active.recipients.map(id=>data.contacts.find(c=>c.id===id)?.name).filter(Boolean).join(', ')}`:'No contacts selected for this demo trip.'}</Txt><Txt muted size={13}>{active.checkins.length} simulated check-ins sent.</Txt></Card>
   <Button title="Send check-in" icon="send" onPress={()=>{setData(s=>s.active?{...s,active:{...s.active,checkins:[...s.active.checkins,new Date().toISOString()]}}:s);notify('Check-in simulated. No message was sent.')}}/>
   <Button title="Report here" icon="flag" secondary onPress={()=>router.push({pathname:'/report',params:{latitude:String(position.latitude),longitude:String(position.longitude)}})}/>
   <Button title={active.paused?'Resume trip':'Pause trip'} icon={active.paused?'play':'pause'} onPress={()=>setData(s=>s.active?{...s,active:{...s.active,paused:!s.active.paused}}:s)}/>
   <Button title="I arrived" icon="check" secondary onPress={()=>endTrip('arrived')}/>
   <Button title="Cancel trip" secondary danger onPress={()=>endTrip('canceled')}/>
  </Page>
 }

 return <Page title="Trips">
  <Eyebrow>PLAN A ROUTE</Eyebrow>
  <Title>Choose where you are going.</Title>
  <Notice>Routes are sample downtown Orlando options until Apple route calculation is enabled in a development build.</Notice>
  {DESTINATIONS.map(d=><Pressable key={d.id} accessibilityRole="button" onPress={()=>{setDestination(d);setRouteId(sampleRoutes(d)[0].id)}}><Card style={{borderColor:destination.id===d.id?colors.coral:colors.line}}><View style={{flexDirection:'row',alignItems:'center',gap:12}}><Icon name="map-pin"/><View style={{flex:1}}><Txt bold>{d.name}</Txt><Txt muted size={13}>{d.detail}</Txt></View>{destination.id===d.id&&<Icon name="check"/>}</View></Card></Pressable>)}
  <View style={{flexDirection:'row',alignItems:'center',justifyContent:'space-between',marginTop:8}}><Eyebrow>ROUTE OPTIONS</Eyebrow><Txt muted size={12}>Sample routes</Txt></View>
  {routes.map(route=>{
   const count=nearbyIncidents(route,incidents),reports=nearbyReports(route,data.reports).length,selected=route.id===routeId;
   return <Pressable key={route.id} accessibilityRole="radio" accessibilityState={{checked:selected}} onPress={()=>setRouteId(route.id)}>
    <Card style={{borderColor:selected?colors.coral:colors.line,backgroundColor:selected?colors.blush:colors.panel,borderWidth:selected?1.5:1,borderRadius:15,padding:13}}>
     <View style={{flexDirection:'row',gap:11,alignItems:'flex-start'}}>
      <View style={{marginTop:3}}><Icon name={routeIcon(route)}/></View>
      <View style={{flex:1}}><Txt bold size={14}>{route.name}</Txt><Txt muted size={11} style={{marginTop:5}}>{route.note}</Txt><Txt size={11} bold style={{color:colors.green,marginTop:6}}>Sample safety score {route.score}</Txt><Txt muted size={11} style={{marginTop:5}}>{count} sample incidents · {reports} personal reports nearby</Txt></View>
      <View style={{alignItems:'flex-end',minWidth:62}}><Txt bold size={22}>{Math.round(route.duration/60)}<Txt size={10}> min</Txt></Txt><Txt muted size={11}>{miles(route.distance)}</Txt>{selected&&<View style={{marginTop:7}}><Icon name="check" size={16}/></View>}</View>
     </View>
    </Card>
   </Pressable>
  })}
  <Txt muted size={12}>Scores illustrate the design. They do not measure actual safety.</Txt>
  <NativeMap height={280} route={selectedRoute.coordinates} reports={data.reports}/>
  <Card>
   <Eyebrow>ROUTE BRIEF</Eyebrow>
   <Txt bold>{selectedRoute.detail}</Txt>
   <Txt muted size={13}>{routeIncidents.length} sample incidents near this route in the last 6 months.</Txt>
   <Txt muted size={13}>Theft {breakdown.Theft} · Burglary {breakdown.Burglary} · Assault {breakdown.Assault} · Vandalism {breakdown.Vandalism}</Txt>
   <Txt muted size={13}>{routeReports.length?`${routeReports.length} of your reported areas are near this route.`:'None of your reported areas are near this route.'}</Txt>
   {selectedRoute.steps.map((step,index)=><View key={`${selectedRoute.id}-${index}`} style={{flexDirection:'row',gap:10,marginTop:12}}><Txt bold>{index+1}</Txt><View style={{flex:1}}><Txt>{step.instruction}</Txt><Txt muted size={12}>{feet(step.distance)}</Txt></View></View>)}
  </Card>
  <Eyebrow>SHARE WITH</Eyebrow>
  {data.contacts.filter(c=>c.trip).length?data.contacts.filter(c=>c.trip).map(contact=><Toggle key={contact.id} title={contact.name} detail={contact.phone} value={recipients.includes(contact.id)} onChange={on=>setRecipients(ids=>on?[...ids,contact.id]:ids.filter(id=>id!==contact.id))}/>):<Card><Txt>No trip contacts yet.</Txt><Button title="Add trusted contacts" secondary icon="user-plus" onPress={()=>router.push('/contacts')}/></Card>}
  <Button title={`Start ${selectedRoute.name.toLowerCase()}`} icon="navigation" onPress={start}/>
  <Button title="Manage contacts" secondary icon="users" onPress={()=>router.push('/contacts')}/>
  {data.history.length>0&&<><Eyebrow>RECENT TRIPS</Eyebrow>{data.history.slice(0,4).map(item=><Card key={item.id}><Txt bold>{item.destination.name}</Txt><Txt muted size={13}>{item.status==='arrived'?'Arrived':'Canceled'} · {new Date(item.finishedAt).toLocaleDateString()}</Txt></Card>)}</>}
 </Page>
}
