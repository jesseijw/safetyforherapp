import React,{useState} from 'react';
import {Alert} from 'react-native';
import {useLocalSearchParams,router} from 'expo-router';
import {randomUUID} from 'expo-crypto';
import {Page,Txt,Title,Notice,Chips,Field,Button} from '../components/UI';
import {NativeMap} from '../components/NativeMap';
import {useApp} from '../state/AppProvider';
import {ORIGIN,REPORT_TYPES} from '../data/orlando';
import type {Coordinate} from '../types';
export default function Report(){const params=useLocalSearchParams<{id?:string;latitude?:string;longitude?:string}>();const {data,setData,notify}=useApp();const existing=data.reports.find(r=>r.id===params.id);const latitude=Number(params.latitude),longitude=Number(params.longitude),valid=Number.isFinite(latitude)&&Number.isFinite(longitude)&&Math.abs(latitude)<=90&&Math.abs(longitude)<=180;
 const [coordinate,setCoordinate]=useState<Coordinate>(existing?.coordinate||(valid?{latitude,longitude}:ORIGIN)),[type,setType]=useState(existing?.type||REPORT_TYPES[0]),[radius,setRadius]=useState(existing?.radius||80),[note,setNote]=useState(existing?.note||'');
 const save=()=>{setData(s=>({...s,reports:[...s.reports.filter(r=>r.id!==existing?.id),{id:existing?.id||randomUUID(),coordinate,radius,type,note:note.trim(),createdAt:existing?.createdAt||new Date().toISOString()}]}));notify('Your reported area was saved on this device.');router.back()};
 return <Page title={existing?'Edit your report':'Report an area'} back><Title>What did you notice?</Title><Txt muted>Mark a specific place and describe what felt uncomfortable.</Txt><Notice>This personal report stays on your device. It is not submitted to police or shared publicly.</Notice><Chips items={REPORT_TYPES.map(t=>({id:t,label:t}))} value={type} onChange={setType}/><NativeMap height={300} selection={coordinate} radius={radius} onPick={setCoordinate}/><Txt size={12} muted style={{marginTop:8}}>Tap the map or drag the marker to move your area.</Txt><Txt size={12} muted>{coordinate.latitude.toFixed(5)}, {coordinate.longitude.toFixed(5)}</Txt><Chips items={[{id:40,label:'40 m'},{id:80,label:'80 m'},{id:150,label:'150 m'}]} value={radius} onChange={setRadius}/><Field label="What happened? (optional)" placeholder="For example: very dark around this corner." multiline maxLength={400} value={note} onChangeText={setNote} style={{minHeight:100,textAlignVertical:'top'}}/><Button title="Save my report" icon="check" onPress={save}/>{existing&&<Button title="Delete this report" secondary danger onPress={()=>Alert.alert('Delete your report?','Remove this area from your map.',[{text:'Cancel',style:'cancel'},{text:'Delete',style:'destructive',onPress:()=>{setData(s=>({...s,reports:s.reports.filter(r=>r.id!==existing.id)}));router.back()}}])}/>}</Page>;
}
