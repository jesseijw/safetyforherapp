import React,{useEffect,useRef} from 'react';
import {StyleSheet,View} from 'react-native';
import MapView,{Marker,Circle,Polyline,Polygon} from 'react-native-maps';
import {ORLANDO,ORIGIN} from '../data/orlando';
import type {Coordinate,Incident,PersonalReport} from '../types';
import {concentrationCells} from '../lib/logic';
import {useApp} from '../state/AppProvider';
type Props={height?:number;reports?:PersonalReport[];incidents?:Incident[];concentration?:boolean;route?:Coordinate[];position?:Coordinate;selection?:Coordinate;radius?:number;selectedCell?:string|null;onPick?:(c:Coordinate)=>void;onLongPress?:(c:Coordinate)=>void;onReport?:(r:PersonalReport)=>void;onIncident?:(i:Incident)=>void;showOrigin?:boolean};
export function NativeMap({height=320,reports=[],incidents=[],concentration=false,route,position,selection,radius=80,selectedCell,onPick,onLongPress,onReport,onIncident,showOrigin=false}:Props){const {data,colors}=useApp();const ref=useRef<MapView>(null);const ready=useRef(false);
 const fit=()=>{if(route?.length)ref.current?.fitToCoordinates(route,{edgePadding:{top:45,right:35,bottom:45,left:35},animated:true})};
 useEffect(()=>{if(ready.current&&route?.length)ref.current?.fitToCoordinates(route,{edgePadding:{top:45,right:35,bottom:45,left:35},animated:true})},[route]);
 return <View style={{height,borderRadius:20,overflow:'hidden',backgroundColor:colors.blush}}><MapView ref={ref} style={StyleSheet.absoluteFill} initialRegion={ORLANDO} userInterfaceStyle={data.settings.dark?'dark':'light'} showsUserLocation={false} showsCompass showsScale showsPointsOfInterests accessibilityLabel="Apple map of downtown Orlando" onMapReady={()=>{ready.current=true;fit()}} onPress={e=>onPick?.(e.nativeEvent.coordinate)} onLongPress={e=>onLongPress?.(e.nativeEvent.coordinate)}>
 {concentration?concentrationCells(incidents).map(cell=><Polygon key={cell.id} coordinates={cell.polygon} fillColor={cell.count>=20?'rgba(178,52,70,.6)':cell.count>=10?'rgba(220,113,75,.5)':cell.count>=5?'rgba(233,173,86,.45)':'rgba(236,209,138,.4)'} strokeColor={selectedCell===cell.id?colors.ink:'transparent'} strokeWidth={selectedCell===cell.id?3:0}/>):incidents.map(i=><Marker key={i.id} coordinate={i.coordinate} pinColor="#975573" title={`Sample ${i.type}`} description={`${new Date(i.occurredAt).toLocaleDateString()} · Invented incident`} onCalloutPress={()=>onIncident?.(i)}/>)}
 {reports.map(r=><React.Fragment key={r.id}><Circle center={r.coordinate} radius={r.radius} fillColor="rgba(191,119,72,.18)" strokeColor="#b67841" strokeWidth={2}/><Marker coordinate={r.coordinate} pinColor="#b67841" title={`Your report: ${r.type}`} description="Tap to view or edit" onPress={()=>onReport?.(r)}/></React.Fragment>)}
 {route&&<Polyline coordinates={route} strokeColor={colors.coral} strokeWidth={5}/>}
 {(position||showOrigin)&&<Marker coordinate={position||ORIGIN} pinColor={colors.coral} title={position?'Simulated trip position':'Demo start: Orlando City Hall'}/>}
 {route?.length&&<Marker coordinate={route[route.length-1]} pinColor={colors.green} title="Destination"/>}
 {selection&&<><Circle center={selection} radius={radius} fillColor="rgba(191,119,72,.2)" strokeColor="#b67841" strokeWidth={2}/><Marker coordinate={selection} draggable onDragEnd={e=>onPick?.(e.nativeEvent.coordinate)} pinColor="#b67841" title="Your selected area"/></>}
 </MapView></View>
}
