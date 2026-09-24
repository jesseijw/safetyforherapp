import React,{useState} from 'react';
import {Page,Title,Eyebrow,Card,Button,Field,Row,Toggle} from '../../components/UI';
import {useApp} from '../../state/AppProvider';
import {router} from 'expo-router';

export default function Profile(){
 const {profile,saveProfile,pin,savePin,notify,data,setData,reset}=useApp();
 const [name,setName]=useState(profile.name),[emergency,setEmergency]=useState(profile.emergency),[allergies,setAllergies]=useState(profile.allergies),[notes,setNotes]=useState(profile.notes),[code,setCode]=useState(pin);
 const save=async()=>{await saveProfile({name:name.trim()||'Morgan',emergency:emergency.trim(),allergies:allergies.trim(),notes:notes.trim()});await savePin(code.trim());notify('Profile saved on this device.')};
 return <Page title="Profile"><Eyebrow>YOUR INFO</Eyebrow><Title>{profile.name || 'Your profile'}</Title><Card><Field label="Name" value={name} onChangeText={setName}/><Field label="Emergency contact" value={emergency} onChangeText={setEmergency} placeholder="Name and phone"/><Field label="Allergies" value={allergies} onChangeText={setAllergies}/><Field label="Medical notes" value={notes} onChangeText={setNotes} multiline style={{minHeight:82,textAlignVertical:'top'}}/><Field label="Demo passcode" value={code} onChangeText={setCode} keyboardType="number-pad" placeholder="Optional"/></Card><Button title="Save profile" icon="check" onPress={save}/><Row icon="users" title="Trusted contacts" detail={`${data.contacts.length} saved contacts`} onPress={()=>router.push('/contacts')}/><Row icon="credit-card" title="Emergency card" detail="Preview what helpers can see" onPress={()=>router.push('/emergency-card')}/><Row icon="settings" title="Settings" detail="Theme, check-ins, sharing, reset" onPress={()=>router.push('/settings')}/><Eyebrow>PREFERENCES</Eyebrow><Toggle title="Dark mode" value={data.settings.dark} onChange={dark=>setData(s=>({...s,settings:{...s.settings,dark}}))}/><Button title="Reset demo data" secondary danger onPress={reset}/></Page>
}
