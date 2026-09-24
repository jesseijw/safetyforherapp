import React from 'react';
import {Alert} from 'react-native';
import {Page,Title,Eyebrow,Txt,Card,Toggle,Button,Notice} from '../components/UI';
import {useApp} from '../state/AppProvider';

export default function Settings(){
 const {data,setData,reset}=useApp();
 const set=(key:keyof typeof data.settings,value:boolean)=>setData(s=>({...s,settings:{...s.settings,[key]:value}}));
 return <Page title="Settings" back><Eyebrow>DEMO SETTINGS</Eyebrow><Title>Make it feel right.</Title><Toggle title="Dark mode" value={data.settings.dark} onChange={v=>set('dark',v)}/><Toggle title="Mid-trip check-ins" detail="Show a simulated halfway reminder" value={data.settings.checkins} onChange={v=>set('checkins',v)}/><Toggle title="Arrival notices" detail="Show a simulated arrival confirmation" value={data.settings.arrival} onChange={v=>set('arrival',v)}/><Toggle title="Trip sharing" detail="Allow contacts to be selected for trips" value={data.settings.sharing} onChange={v=>set('sharing',v)}/><Toggle title="Safety notices" value={data.settings.notices} onChange={v=>set('notices',v)}/><Notice>All data is stored locally on this device for the prototype.</Notice><Card><Txt bold>Reset local demo data</Txt><Txt muted size={13}>Clears trips, reports, contacts, profile, and passcode from this app install.</Txt><Button title="Reset everything" secondary danger onPress={()=>Alert.alert('Reset demo data?','This clears local prototype data on this device.',[{text:'Cancel',style:'cancel'},{text:'Reset',style:'destructive',onPress:reset}])}/></Card></Page>
}
