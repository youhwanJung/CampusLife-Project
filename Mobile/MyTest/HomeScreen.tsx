import React from 'react';
import {Text, View, Button, StyleSheet,} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { create } from 'react-test-renderer';

const HomeScreen : React.FC = ({navigation, route} : any) => {
    const object1 = {
        buttondata : 1,
        title : "첫번째 글"
    }

    const object2 = {
        buttondata : 1,
        title : "두번째 글"
    }
    const firstbuttondata : number = 1;
    const secondbuttondata : number = 1;

    return (
        <View style = {{justifyContent :'center', alignItems : 'center', flex : 1}}>
            <Text style = {{fontSize : 50, fontWeight :'bold'}}> 홈 스크린 </Text>
            <Button title = "첫번째 버튼" onPress={ () => navigation.navigate("DetailScreen", {object1 : object1})}/>
            <View style = {styles.buttonmargin}></View>
            <Button title = "두번째 버튼" onPress={ () => navigation.navigate("DetailScreen", {object2 : object2})}/>
        </View>
    );
};

const styles = StyleSheet.create({
    buttonmargin : {
        margin : 10,
    }
})

export default HomeScreen;