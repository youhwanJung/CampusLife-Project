import React, { useState } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import {
  StyleSheet,
  Image,
  Text,
  View,
  TextInput,
  TouchableOpacity,
  StatusBar,
  Alert
} from 'react-native';
import 'react-native-gesture-handler';
import BouncyCheckbox from "react-native-bouncy-checkbox";
import { UserData, Lecture } from "../../types/type"
import config from '../../config';

function LoginScreen({ navigation }: any) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [userData, setUserData] = useState<UserData>();
  const [lectureList, setLectureList] = useState<Lecture>();
 
  const get_user_data = async () => {
    try {
      const response = await fetch(`${config.serverUrl}/get_user_data`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          user_id: username,
          user_pass: password,
        })
      })
      const userdata = await response.json();
      //console.log(userdata);
      return(userdata)
    } catch (error) {
      Alert.alert('아이디 또는 비밀번호가 일치하지 않습니다');
    }
  }


  const handleLogin = async (userdata : UserData, LectureData : Lecture ) => {
    try {
      const response = await fetch(`${config.serverUrl}/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username,
          password,
        }),
      });
      const data = await response.text();
      if (data === 'success') {
        if(userdata.admin_check === true ) {
          navigation.navigate('AdminTabNavigator', { userdata : userdata, LectureData : LectureData });
        }else if(userdata.admin_check === false) {
          navigation.navigate('MainTabNavigator', {userdata : userdata, LectureData : LectureData});
        }

      } else {
        Alert.alert('아이디 또는 비밀번호가 일치하지 않습니다');
      }
    } catch (error) {
      Alert.alert('아이디 또는 비밀번호가 일치하지 않습니다');
    }
  };

  const fetchLectureData = async (userData : UserData) => {
    try {
      const response = await fetch(`${config.serverUrl}/getlecture`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          student_pk : userData.student_pk
        })
      })
      const data = await response.json();
      const Data = data.data; //키값을 치면 값을 json에서 추출할 수 있다.
      return Data;
    } catch (error) {
      console.error('과목 가져오기 실패:', error);
    }
  }

  return (
    <View style={styles.container}>
      <Image style={styles.logo} source={require('../../assets/logo.png')} />

      <Text style={styles.appintroduce}>
        학교를 더 즐겁게! {"\n"}
        다양한 활동과 소식을 손쉽게 확인하는 어플!
      </Text>

      <TextInput
        style={styles.input}
        placeholder="아이디"
        placeholderTextColor={'gray'}
        value={username}
        onChangeText={(text) => setUsername(text)}
      />

      <TextInput
        style={styles.input}
        placeholder="비밀번호"
        placeholderTextColor={'gray'}
        secureTextEntry={true}
        value={password}
        onChangeText={(text) => setPassword(text)}
      />

      <View style={styles.ContainerBox}>
        <BouncyCheckbox
          style={styles.Checkbox}
          size={25}
          fillColor="black"
          unfillColor="#FFFFFF" 
          text="아이디 저장"
          iconStyle={{ borderColor: "black" }}
          textStyle={{ fontFamily: "JosefinSans-Regular", textDecorationLine: "none", }}
          onPress={(isChecked: boolean) => { }}
        />

        <BouncyCheckbox
          style={styles.Checkbox}
          size={25}
          fillColor="black"
          unfillColor="#FFFFFF"
          text="자동 로그인"
          iconStyle={{ borderColor: "black" }}
          textStyle={{ fontFamily: "JosefinSans-Regular", textDecorationLine: "none", }}
          onPress={(isCheckedAutoLogin: boolean) => { }}
        />
      </View>

      <TouchableOpacity style={styles.loginButton} onPress={async () => {
          const userdata = await get_user_data();
          const LectureData = await fetchLectureData(userdata);
          await handleLogin(userdata, LectureData);
          }}>
        <Text style={styles.loginButtonText}>로그인</Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={() => navigation.navigate("SearchScreen")}>
        <Text style={styles.loginlinkText}>아이디, 비밀번호 찾기</Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={() => navigation.navigate("TosScreen")}>
        <Text style={styles.loginlinkText}>앱을 처음 이용하시나요? 클릭하세요!</Text>
      </TouchableOpacity>

      <StatusBar />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFDECF',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'flex-start',
  },

  logo: {
    width: 310,
    height: 135,
    margin: 110,
  },

  appintroduce: {
    justifyContent: 'center',
    textAlign: 'center',
    marginTop: -80,
    marginBottom: 15,
    fontSize: 14,
    color: 'black'
  },

  input: {
    height: 45,
    width: 300,
    backgroundColor: 'white',
    borderColor: 'gray',
    borderWidth: 1,
    borderRadius: 5,
    margin: 8,
    paddingLeft: 10,
    color: 'black'
  },

  ContainerBox: {
    flexDirection: 'row',
    width: 317,
    marginTop: 15,
  },

  Checkbox: {
    paddingLeft: 25,
  },

  loginButton: {
    height: 45,
    width: 300,
    backgroundColor: '#3498db',
    paddingVertical: 9,
    paddingHorizontal: 20,
    borderRadius: 5,
    borderColor: 'gray',
    borderWidth: 1,
    marginTop: 25,
    marginBottom: 40,
  },


  loginButtonText: {
    color: '#000',
    textAlign: 'center',
    fontSize: 16,

  },

  loginlinkText: {
    color: 'gray',
    marginTop: 20,
    fontSize: 16,
    textDecorationLine: 'underline',
  },
});

export default LoginScreen;