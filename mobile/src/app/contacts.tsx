import React,{useState} from 'react';
import {Alert} from 'react-native';
import {randomUUID} from 'expo-crypto';
import {Page,Title,Eyebrow,Txt,Card,Button,Field,Toggle,Sheet} from '../components/UI';
import {useApp} from '../state/AppProvider';
import {validPhone} from '../lib/logic';
import type {Contact} from '../types';

const blank:Contact={id:'',name:'',phone:'',trip:true,sos:true};

export default function Contacts(){
 const {data,setData,notify}=useApp();
 const [editing,setEditing]=useState<Contact|null>(null);
 const save=()=>{if(!editing)return;const contact={...editing,name:editing.name.trim(),phone:editing.phone.trim(),id:editing.id||randomUUID()};if(!contact.name||!validPhone(contact.phone)){notify('Add a name and valid phone number.');return}setData(s=>({...s,contacts:[...s.contacts.filter(c=>c.id!==contact.id),contact]}));setEditing(null);notify('Trusted contact saved.')};
 const remove=(id:string)=>Alert.alert('Delete contact?','Remove this trusted contact from SafeTrip.',[{text:'Cancel',style:'cancel'},{text:'Delete',style:'destructive',onPress:()=>setData(s=>({...s,contacts:s.contacts.filter(c=>c.id!==id)}))}]);
 return <Page title="Contacts" back><Eyebrow>TRUSTED PEOPLE</Eyebrow><Title>Who should know?</Title>{data.contacts.map(c=><Card key={c.id}><Txt bold>{c.name}</Txt><Txt muted size={13}>{c.phone}</Txt><Toggle title="Trip sharing" value={c.trip} onChange={trip=>setData(s=>({...s,contacts:s.contacts.map(x=>x.id===c.id?{...x,trip}:x)}))}/><Toggle title="SOS alerts" value={c.sos} onChange={sos=>setData(s=>({...s,contacts:s.contacts.map(x=>x.id===c.id?{...x,sos}:x)}))}/><Button title="Edit contact" secondary icon="edit-2" onPress={()=>setEditing(c)}/><Button title="Delete contact" secondary danger onPress={()=>remove(c.id)}/></Card>)}<Button title="Add contact" icon="user-plus" onPress={()=>setEditing(blank)}/><Sheet title={editing?.id?'Edit contact':'Add contact'} visible={!!editing} onClose={()=>setEditing(null)}>{editing&&<><Field label="Name" value={editing.name} onChangeText={name=>setEditing(c=>c&&{...c,name})}/><Field label="Phone" value={editing.phone} onChangeText={phone=>setEditing(c=>c&&{...c,phone})} keyboardType="phone-pad"/><Toggle title="Use for trips" value={editing.trip} onChange={trip=>setEditing(c=>c&&{...c,trip})}/><Toggle title="Use for SOS" value={editing.sos} onChange={sos=>setEditing(c=>c&&{...c,sos})}/><Button title="Save contact" icon="check" onPress={save}/></>}</Sheet></Page>
}
