import {requireOptionalNativeModule} from 'expo';
import {randomUUID} from 'expo-crypto';
import type {Coordinate,Route} from '../types';
type NativeDirections={calculate:(id:string,lat:number,lng:number,dLat:number,dLng:number)=>Promise<Route[]>;cancel:(id:string)=>Promise<void>};
const native=requireOptionalNativeModule<NativeDirections>('SafeTripDirections');
export const hasAppleDirections=!!native;
export function calculateRoutes(origin:Coordinate,destination:Coordinate){
 const id=randomUUID();let timer:ReturnType<typeof setTimeout>|undefined;
 const promise = !native?Promise.reject<Route[]>(new Error('Apple route calculation needs the SafeTrip development build. You can explicitly use sample routes in Expo Go.')):Promise.race([native.calculate(id,origin.latitude,origin.longitude,destination.latitude,destination.longitude),new Promise<Route[]>((_,reject)=>{timer=setTimeout(()=>{void native.cancel(id);reject(new Error('Apple Maps took too long. Please retry.'));},20000)})]).then(routes=>{const valid=routes.filter(r=>r.coordinates.length>=2&&Number.isFinite(r.duration)&&r.duration>0&&Number.isFinite(r.distance));if(!valid.length)throw Error('No walking routes returned. Try another destination.');return valid}).finally(()=>clearTimeout(timer));
 return {promise,cancel:()=>{clearTimeout(timer);void native?.cancel(id)}};
}
