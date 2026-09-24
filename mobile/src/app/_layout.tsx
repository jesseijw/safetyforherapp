import React from 'react';
import {Stack} from 'expo-router';
import {ActivityIndicator,View} from 'react-native';
import {StatusBar} from 'expo-status-bar';
import {SafeAreaProvider} from 'react-native-safe-area-context';
import {AppProvider,useApp} from '../state/AppProvider';
function Navigation(){const {colors,ready,data}=useApp();if(!ready)return <View style={{flex:1,alignItems:'center',justifyContent:'center',backgroundColor:colors.bg}}><ActivityIndicator color={colors.coral} accessibilityLabel="Opening SafeTrip"/></View>;return <><StatusBar style={data.settings.dark?'light':'dark'}/><Stack screenOptions={{headerShown:false,contentStyle:{backgroundColor:colors.bg}}}><Stack.Screen name="(tabs)"/><Stack.Screen name="activity"/><Stack.Screen name="contacts"/><Stack.Screen name="emergency-card"/><Stack.Screen name="settings"/><Stack.Screen name="report" options={{presentation:'modal'}}/></Stack></>}
export default function Layout(){return <SafeAreaProvider><AppProvider><Navigation/></AppProvider></SafeAreaProvider>}
