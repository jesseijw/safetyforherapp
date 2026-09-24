import React,{useState} from 'react';
import {View,Image,Pressable,Alert} from 'react-native';
import {router} from 'expo-router';
import {Page,Title,Eyebrow,Txt,Card,Button,Sheet,Field,Row,Icon,Notice} from '../../components/UI';
import {NativeMap} from '../../components/NativeMap';
import {useApp} from '../../state/AppProvider';
import {DESTINATIONS,ORIGIN} from '../../data/orlando';
import type {Coordinate,PersonalReport} from '../../types';
export default function Home(){const {data,profile,colors}=useApp();const [search,setSearch]=useState(false),[query,setQuery]=useState('');const a=data.active;
 const report=(coordinate:Coordinate)=>router.push({pathname:'/report',params:{latitude:String(coordinate.latitude),longitude:String(coordinate.longitude)}});
 const inspect=(r:PersonalReport)=>Alert.alert(r.type,r.note||'Your personal report, stored on this device.',[{text:'Close'},{text:'Edit report',onPress:()=>router.push({pathname:'/report',params:{id:r.id}})}]);
 return <Page title="SafeTrip"><View style={{flexDirection:'row',alignItems:'center',gap:12,marginBottom:18}}><Image source={require('../../../assets/she-logo.png')} style={{height:43,width:43,borderRadius:22}}/><Pressable accessibilityRole="button" onPress={()=>{setQuery('');setSearch(true)}} style={{flex:1,padding:12,borderWidth:1,borderColor:colors.line,borderRadius:14,backgroundColor:colors.panel}}><Txt size={14} muted>Where are you going?</Txt></Pressable><Pressable accessibilityLabel="Open profile" onPress={()=>router.navigate('/profile')} style={{padding:12,backgroundColor:colors.blush,borderRadius:30}}><Txt bold>{profile.name.charAt(0)||'M'}</Txt></Pressable></View>
 <NativeMap height={330} reports={data.reports} route={a?.route.coordinates} showOrigin onLongPress={report} onReport={inspect}/><Txt muted size={12} style={{marginTop:8}}>Downtown Orlando · Hold the map to report an area.</Txt>
 <Button title="Explore neighborhood activity" icon="layers" secondary onPress={()=>router.push('/activity')}/>
 <Card><Eyebrow>{a?'YOUR JOURNEY IS UNDERWAY':'LET’S GET YOU THERE'}</Eyebrow><Title>{a?a.destination.name:'Start a safe trip.'}</Title><Txt muted>A thoughtful route. Your people close by.</Txt><Button title={a?'Return to your trip':'Choose a destination'} icon="arrow-up-right" onPress={()=>a?router.navigate('/trips'):setSearch(true)}/></Card>
 <Button title="Report an area" icon="flag" secondary onPress={()=>report(ORIGIN)}/><Notice>Real map. Sample incidents and simulated trip progress. Your current location is not accessed.</Notice>
 <Sheet title="Where are you heading?" visible={search} onClose={()=>setSearch(false)}><Field label="Search downtown destinations" value={query} onChangeText={setQuery} placeholder="Try Lake Eola or the library" autoFocus/><Txt muted size={13}>Choose a downtown destination for this first demo.</Txt>{DESTINATIONS.filter(d=>d.name.toLowerCase().includes(query.toLowerCase())).map(d=><Row key={d.id} icon="map-pin" title={d.name} detail={d.detail} onPress={()=>{setSearch(false);router.navigate({pathname:'/trips',params:{destination:d.id}})}}/>)}{!DESTINATIONS.some(d=>d.name.toLowerCase().includes(query.toLowerCase()))&&<Card><Icon name="search"/><Txt>No matching destinations.</Txt></Card>}</Sheet>
 </Page>;
}
