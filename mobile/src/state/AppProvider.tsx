import React,{createContext,useContext,useEffect,useRef,useState,Dispatch,SetStateAction} from 'react';
import {AppState,View,Text,Pressable,StyleSheet} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as SecureStore from 'expo-secure-store';
import {randomUUID} from 'expo-crypto';
import type {AppData,Profile,Destination,Route} from '../types';
import {defaults,restoreData,advanceTrip,finishTrip} from '../lib/logic';
const KEY='safetrip.mobile.v1',PROFILE='safetrip.profile.v1',PIN='safetrip.pin.v1';
export const blankProfile:Profile={name:'Morgan',allergies:'',notes:'',emergency:''};
const light={ink:'#382b2e',muted:'#776763',bg:'#fff8f4',panel:'#fffdfb',line:'#eaded8',blush:'#f5e4dc',coral:'#b95e53',green:'#416c55',greenBg:'#e5eee6',red:'#ba3f46'};
const dark:typeof light={ink:'#f4e8e0',muted:'#c3afa3',bg:'#24211f',panel:'#302b27',line:'#54443a',blush:'#4a352e',coral:'#de9583',green:'#a5c7ae',greenBg:'#304539',red:'#e0787e'};
type Context={data:AppData;setData:Dispatch<SetStateAction<AppData>>;ready:boolean;error:string;profile:Profile;saveProfile:(p:Profile)=>Promise<void>;pin:string;savePin:(value:string)=>Promise<void>;reset:()=>Promise<void>;colors:typeof light;notify:(message:string)=>void;startTrip:(d:Destination,r:Route,ids:string[])=>void;endTrip:(status:'arrived'|'canceled')=>void};
const AppContext=createContext<Context|null>(null);
export function AppProvider({children}:{children:React.ReactNode}){
 const [data,setData]=useState(defaults),[ready,setReady]=useState(false),[error,setError]=useState(''),[profile,setProfile]=useState(blankProfile),[pin,setPin]=useState(''),[toast,setToast]=useState('');
 const writable=useRef(true),queue=useRef(Promise.resolve()),toastTimer=useRef<ReturnType<typeof setTimeout>|null>(null);
 const colors=data.settings.dark?dark:light;
 const notify=(message:string)=>{if(toastTimer.current)clearTimeout(toastTimer.current);setToast(message);toastTimer.current=setTimeout(()=>setToast(''),4500)};
 useEffect(()=>{let live=true;Promise.all([AsyncStorage.getItem(KEY),SecureStore.getItemAsync(PROFILE),SecureStore.getItemAsync(PIN)]).then(([saved,p,code])=>{if(!live)return;setData(restoreData(saved));if(p){const parsed=JSON.parse(p);if(typeof parsed.name!=='string')throw Error('Invalid profile');setProfile({...blankProfile,...parsed})}setPin(code||'')}).catch(()=>{writable.current=false;if(live)setError('Saved data could not be opened. Changes are session-only until you reset the demo.');}).finally(()=>{if(live)setReady(true)});return ()=>{live=false}},[]);
 useEffect(()=>{if(!ready||!writable.current)return;const snapshot=JSON.stringify(data);queue.current=queue.current.then(()=>AsyncStorage.setItem(KEY,snapshot)).catch(()=>{setError('Your latest changes could not be saved on this device.');});},[data,ready]);
 useEffect(()=>{const interval=setInterval(()=>setData(s=>s.active&&!s.active.paused?{...s,active:advanceTrip(s.active)}:s),1000);const sub=AppState.addEventListener('change',state=>{if(state!=='active')setData(s=>s.active?{...s,active:{...s.active,paused:true}}:s)});return ()=>{clearInterval(interval);sub.remove();if(toastTimer.current)clearTimeout(toastTimer.current)}},[]);
 useEffect(()=>{const timer=setTimeout(()=>{if(data.active?.progress===1){setData(s=>finishTrip(s,'arrived'));notify(data.settings.arrival?'You arrived. Demo trip saved; no messages sent.':'Demo trip complete.')}else if(data.active&&data.active.progress>=.5&&!data.active.reminded&&data.settings.checkins){setData(s=>({...s,active:s.active?{...s.active,reminded:true}:null}));notify('Halfway there. Take a moment to check in.');}},0);return ()=>clearTimeout(timer)},[data.active,data.settings.arrival,data.settings.checkins]);
 async function saveProfile(p:Profile){await SecureStore.setItemAsync(PROFILE,JSON.stringify(p));setProfile(p)}
 async function savePin(value:string){if(value)await SecureStore.setItemAsync(PIN,value);else await SecureStore.deleteItemAsync(PIN);setPin(value)}
 async function reset(){await queue.current;await SecureStore.deleteItemAsync(PROFILE);await SecureStore.deleteItemAsync(PIN);await AsyncStorage.setItem(KEY,JSON.stringify(defaults()));writable.current=true;setProfile(blankProfile);setPin('');setData(defaults());setError('');notify('Your demo has a fresh start.')}
 const startTrip=(destination:Destination,route:Route,ids:string[])=>setData(s=>s.active?s:{...s,active:{id:randomUUID(),destination,route,progress:0,paused:false,recipients:s.settings.sharing?ids.filter(id=>s.contacts.some(c=>c.id===id&&c.trip)):[],checkins:[],startedAt:new Date().toISOString(),reminded:false}});
 const endTrip=(status:'arrived'|'canceled')=>{setData(s=>finishTrip(s,status));notify(status==='arrived'?'You arrived. Demo trip saved.':'Trip canceled and saved.')};
 return <AppContext.Provider value={{data,setData,ready,error,profile,saveProfile,pin,savePin,reset,colors,notify,startTrip,endTrip}}><View style={{flex:1,backgroundColor:colors.bg}}>{children}{!!toast&&<View accessibilityLiveRegion="polite" style={[styles.toast,{backgroundColor:colors.ink}]}><Text style={{color:colors.bg,flex:1,fontSize:14,lineHeight:20}}>{toast}</Text><Pressable accessibilityRole="button" accessibilityLabel="Dismiss message" onPress={()=>setToast('')} style={{padding:10}}><Text style={{color:colors.bg,fontSize:22}}>×</Text></Pressable></View>}</View></AppContext.Provider>
}
export function useApp(){const context=useContext(AppContext);if(!context)throw Error('AppProvider missing');return context;}
const styles=StyleSheet.create({toast:{position:'absolute',left:16,right:16,bottom:110,borderRadius:18,padding:15,flexDirection:'row',alignItems:'center',shadowOpacity:.15,shadowRadius:12}});
