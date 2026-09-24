import React from 'react';
import {Page,Title,Eyebrow,Txt,Card,Button} from '../components/UI';
import {router} from 'expo-router';
import {useApp} from '../state/AppProvider';

export default function EmergencyCard(){
 const {profile,data}=useApp();
 return <Page title="Emergency Card" back><Eyebrow>LOCK SCREEN STYLE PREVIEW</Eyebrow><Title>{profile.name}</Title><Card><Txt muted size={12}>Emergency contact</Txt><Txt bold>{profile.emergency||'Not saved yet'}</Txt></Card><Card><Txt muted size={12}>Allergies</Txt><Txt bold>{profile.allergies||'None listed'}</Txt></Card><Card><Txt muted size={12}>Medical notes</Txt><Txt>{profile.notes||'No notes saved.'}</Txt></Card><Card><Txt muted size={12}>SOS contacts</Txt><Txt>{data.contacts.filter(c=>c.sos).map(c=>c.name).join(', ')||'No SOS contacts selected.'}</Txt></Card><Button title="Edit profile" icon="edit-2" onPress={()=>router.push('/profile')}/></Page>
}
