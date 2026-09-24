import React from 'react';
import {Alert,Pressable,Text} from 'react-native';
import {Tabs,router} from 'expo-router';
import {Feather} from '@expo/vector-icons';
import {useApp} from '../../state/AppProvider';

export default function TabLayout(){
 const {colors,notify}=useApp();
 return <Tabs screenOptions={{headerShown:false,tabBarActiveTintColor:colors.coral,tabBarInactiveTintColor:colors.muted,tabBarStyle:{backgroundColor:colors.panel,borderTopColor:colors.line},tabBarLabelStyle:{fontSize:12,fontWeight:'600'}}}>
  <Tabs.Screen name="index" options={{title:'Map',tabBarIcon:({color})=><Feather name="map-pin" size={21} color={color}/>}}/>
  <Tabs.Screen name="trips" options={{title:'Trips',tabBarIcon:({color})=><Feather name="navigation" size={21} color={color}/>}}/>
  <Tabs.Screen name="sos" options={{title:'SOS',tabBarButton:()=> <Pressable accessibilityRole="button" accessibilityLabel="SOS. Tap for help, hold to preview an emergency call." onPress={()=>router.navigate('/sos')} delayLongPress={1100} onLongPress={()=>Alert.alert('Simulate a 911 call?','This demo does not place calls.',[{text:'Cancel',style:'cancel'},{text:'Simulate call',onPress:()=>notify('911 call simulated. No call was placed.')}])} style={({pressed})=>({width:58,height:58,marginTop:-10,borderRadius:29,alignSelf:'center',backgroundColor:colors.red,borderWidth:4,borderColor:colors.panel,alignItems:'center',justifyContent:'center',opacity:pressed?0.8:1})}><Feather name="shield" color="white" size={20}/><Text style={{color:'white',fontSize:11,fontWeight:'800'}}>SOS</Text></Pressable>}}/>
  <Tabs.Screen name="tips" options={{title:'Tips',tabBarIcon:({color})=><Feather name="sun" size={21} color={color}/>}}/>
  <Tabs.Screen name="profile" options={{title:'Profile',tabBarIcon:({color})=><Feather name="user" size={21} color={color}/>}}/>
 </Tabs>
}
