import React from 'react';
import {Alert,Pressable,View} from 'react-native';
import {Page,Title,Eyebrow,Txt,Card,Button,Notice,Icon} from '../../components/UI';
import {useApp} from '../../state/AppProvider';

export default function Sos(){
 const {data,profile,colors,notify}=useApp();
 const sosContacts=data.contacts.filter(c=>c.sos);
 const sendAlert=()=>notify(`SOS alert simulated${sosContacts.length?` for ${sosContacts.map(c=>c.name).join(', ')}`:''}. No messages were sent.`);
 const call=()=>Alert.alert('Simulate emergency call?','This demo will not place a phone call.',[{text:'Cancel',style:'cancel'},{text:'Simulate',onPress:()=>notify('Emergency call simulated. No call was placed.')}]);
 return <Page title="SOS"><Eyebrow>QUICK HELP</Eyebrow><Title>Get help fast.</Title><Notice>This prototype simulates calls and messages so you can test the flow safely.</Notice><Pressable accessibilityRole="button" accessibilityLabel="Hold for emergency call simulation" delayLongPress={1100} onPress={sendAlert} onLongPress={call} style={({pressed})=>({height:190,borderRadius:95,backgroundColor:colors.red,alignItems:'center',justifyContent:'center',marginVertical:18,opacity:pressed?.82:1,shadowOpacity:.18,shadowRadius:16})}><Icon name="shield" size={38} color="#fff"/><Txt bold size={28} style={{color:'#fff',marginTop:8}}>SOS</Txt><Txt size={13} style={{color:'#fff'}}>Tap to alert · hold to call</Txt></Pressable><Button title="Simulate alert to contacts" icon="send" onPress={sendAlert}/><Button title="Simulate 911 call" icon="phone-call" secondary danger onPress={call}/><Card><Eyebrow>EMERGENCY CARD</Eyebrow><Txt bold>{profile.name}</Txt><Txt muted size={13}>{profile.emergency||'No emergency contact saved yet.'}</Txt>{!!profile.allergies&&<Txt size={13}>Allergies: {profile.allergies}</Txt>}{!!profile.notes&&<Txt size={13}>Notes: {profile.notes}</Txt>}</Card><Eyebrow>SOS CONTACTS</Eyebrow>{sosContacts.length?sosContacts.map(c=><Card key={c.id}><Txt bold>{c.name}</Txt><Txt muted size={13}>{c.phone}</Txt></Card>):<Card><Txt>No SOS contacts yet. Add trusted contacts from Profile.</Txt></Card>}<View style={{height:12}}/></Page>
}
