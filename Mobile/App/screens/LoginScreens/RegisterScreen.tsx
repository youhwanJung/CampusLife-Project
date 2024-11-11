import React, { useState } from 'react';
import { StyleSheet, View, Image, Text, TextInput, TouchableOpacity, Alert} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import config from '../../config';

const Register = ({navigation}: any) => {
  const [username, setUsername] = useState('');
  const [userpass, setUserpass] = useState('');
  const [userconfirmpass, setUserconfirmpass] = useState('');
  const [studentId, setstudentId] = useState('');
  const [friendCode, setfriendCode] = useState('');
  

  const handleRegister = async ({navigation} :any) => {
    try {
      const response = await fetch(`${config.serverUrl}/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username,
          userpass,
          studentId,
          friendCode,
        }),
      });

      if (response.ok) {
        Alert.alert('회원가입 성공');
        navigation.navigate("LoginScreenStackNavigator");
      } else {
        Alert.alert('회원가입 실패');
      }
    } catch (error) {
      console.error('Error registering user:', error);
      Alert.alert('회원가입 실패');
    }
  };

  
  return (
    <View style={styles.container}>
      <Image style={styles.Img} source={require('../../assets/logoImg.png')}/>

      <TextInput
        style={styles.input}
        placeholder="아이디"
        value={username}
        onChangeText={(text) => setUsername(text)}
      />
      <TextInput
        style={styles.input}
        placeholder="비밀번호"
        secureTextEntry={true}
        value={userpass}
        onChangeText={(text) => setUserpass(text)}
      />
      <TextInput
        style={styles.input}
        placeholder="비밀번호 확인"
        secureTextEntry={true}
        value={userconfirmpass}
        onChangeText={(text) => setUserconfirmpass(text)}
      />
      <TextInput
        style={styles.input}
        placeholder="학번"
        value={studentId}
        onChangeText={(text) => setstudentId(text)}
      />
      <TextInput
        style={styles.input}
        placeholder="친구 코드"
        value={friendCode}
        onChangeText={(text) => setfriendCode(text)}
      />

      <TouchableOpacity style={styles.signBtn} onPress={handleRegister}>
        <Text>회원가입</Text>
      </TouchableOpacity>
    
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFDECF',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'flex-start',
    padding : 30,
  },

  Img :{
    width : 80,
    height : 56,
    margin: 100,
    marginBottom : 30,
  },

  ContainerBox:{
    flexDirection: 'row',
    width : 31,
    paddingBottom : 20,
  },    

  Checkbox:{
    paddingLeft : 25,
  },
  input :{
    width : 300,
    height : 45,
    margin : 15,
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    borderWidth: 1,
    borderColor: 'gray',
    borderRadius : 5,
    paddingLeft : 10,
  },
  signBtn:{
    width: 300,
    height : 40,
    backgroundColor : '#3498db',
    borderWidth:1,
    borderRadius:5,
    borderColor:'gray',
    alignItems : 'center',
    paddingTop: 8,
    fontWeight : 'bold',
    margin: 20, 
  }
});

export default Register;
