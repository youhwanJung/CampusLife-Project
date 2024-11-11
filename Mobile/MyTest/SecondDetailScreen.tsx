import React from 'react';
import {Text, View, Button,} from 'react-native';
import { useNavigation } from '@react-navigation/native';

const SecondDetailScreen : React.FC = () => {
    const navigation: any = useNavigation();
    return (
        <View style = {{justifyContent :'center', alignItems : 'center', flex : 1}}>
            <Text style = {{fontSize : 50, fontWeight :'bold', backgroundColor : 'blue'}}> 감쟈 감쟈 왕감쟈 </Text>
            <Button title = "DetailScreen으로 이동" onPress={ () => navigation.navigate("CommunityScreen")}/>
        </View>
    );
};

export default SecondDetailScreen;