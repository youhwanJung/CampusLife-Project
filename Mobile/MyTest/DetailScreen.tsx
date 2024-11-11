import React, { useCallback, useEffect, useState } from 'react';
import {Text, View, Button,} from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';


const DetailScreen : React.FC = ({navigation, route} : any) => {
    const { object1 = 0} = route.params;
    const { object2 = 0 } = route.params;
    const [data, setdata] : any = useState(object1);

    useFocusEffect(
        React.useCallback( () => {
            if(object1.buttondata == 1) {
                setdata(object1);
            }else if(object2.buttondata == 1) {
                setdata(object2);
            }else {
                console.log("아무런 값이 넘어오지 않았다.");
            }
        }, [])
    )
    return (
        <View style = {{justifyContent :'center', alignItems : 'center', flex : 1}}>
            <Text style = {{fontSize : 50, fontWeight :'bold'}}> {data.buttondata} </Text>
            <Text style = {{fontSize : 50, fontWeight :'bold'}}> {data.title} </Text>
            <Button title = "DetailScreen으로 이동" onPress={ () => navigation.navigate("CommunityScreen", {userpk : 2})}/>
        </View>
    );
};

export default DetailScreen;