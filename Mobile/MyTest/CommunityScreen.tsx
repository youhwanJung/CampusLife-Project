import React from 'react';
import {Text, View, Button,} from 'react-native';
import { useNavigation } from '@react-navigation/native';

const CommunityScreen : React.FC = ({route} : any) => {
    const navigation: any = useNavigation();
    const { userpk } = route.params;
    return (
        <View style = {{justifyContent :'center', alignItems : 'center', flex : 1}}>
            <Text style = {{fontSize : 50, fontWeight :'bold', backgroundColor : 'blue'}}> 커뮤니티스크린 </Text>
            <Text>{userpk}</Text>
            <Button title = "DetailScreen으로 이동" onPress={ () => navigation.navigate("DetailScreen", {userpk : userpk})}/>
        </View>
    );
};

export default CommunityScreen;