import React from 'react';
import {Page,Title,Eyebrow,Txt,Card,Button,Icon} from '../../components/UI';
import {router} from 'expo-router';

const tips=[['Stay visible','Choose lit blocks and open storefronts when you can.','sun'],['Share context','Send your destination and arrival window to someone you trust.','send'],['Trust the pause','If a block feels off, stop somewhere public and reroute.','pause-circle'],['Use reports','Mark areas that felt uncomfortable so your future routes remember them.','flag']] as const;

export default function Tips(){
 return <Page title="Tips"><Eyebrow>SAFER HABITS</Eyebrow><Title>Small choices that help.</Title>{tips.map(([title,body,icon])=><Card key={title}><Icon name={icon}/><Txt bold style={{marginTop:8}}>{title}</Txt><Txt muted size={14}>{body}</Txt></Card>)}<Button title="View downtown activity" icon="layers" onPress={()=>router.push('/activity')}/><Button title="Report an area" icon="flag" secondary onPress={()=>router.push('/report')}/></Page>
}
