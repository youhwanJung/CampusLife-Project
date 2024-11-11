import React, { useCallback, useEffect, useState } from 'react';
import {
  Text,
  View,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from 'react-native';
import Icon from 'react-native-vector-icons/AntDesign';
import config from '../../config'; // 서버 URL이 포함된 config 파일
import { useFocusEffect } from '@react-navigation/native';

type userInfo = {
  Post_fk: number;
  Name: string;
  Birth: string;
  University: string;
  Department: string;
  Grade: number;
  Phone: string;
  Sex: string;
  Residence: string;
  Application: string;
  Introduce: string;
};

const SchoolClubSignStateScreen = ({ route, navigation }: any) => {
  const { item, userData } = route.params;
  const [userInfo, setUserInfo] = useState<userInfo[]>([]);
  const [loading, setLoading] = useState(true);

const fetchClubData = async () => {
  try {
    const response = await fetch(`${config.serverUrl}/fetchClubData`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ post_id: item.post_id }),
    });
    const result = await response.json();
    console.log(result);
    if (response.ok) {
      setUserInfo(result);
    } else {
      Alert.alert(
        '오류', // 제목
        '데이터가 존재하지 않습니다.', // 메시지
        [
          {
            text: '확인',
            onPress: () => navigation.goBack(), // 확인 버튼을 누르면 goBack 호출
          },
        ],
        { cancelable: false } // 취소 불가능
      );
    }
  } catch (error) {
    Alert.alert(
      '오류', // 제목
      '데이터가 존재하지 않습니다.', // 메시지
      [
        {
          text: '확인',
          onPress: () => navigation.goBack(), // 확인 버튼을 누르면 goBack 호출
        },
      ],
      { cancelable: false } // 취소 불가능
      );
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(
    React.useCallback(() => {
      const fetchData = async () => {
        await fetchClubData(); // 비동기 함수 호출
      };

      fetchData(); // 비동기 함수를 호출하여 실행

    }, [item])
  );


  // 중간 렌더링 값 확인
  const renderApplicant = ({ item }: { item: userInfo }) => {
    console.log('Rendering item:', item); // 렌더링 값 확인
    return (
      <TouchableOpacity
        style={styles.applicantItem}
        onPress={() =>
          navigation.navigate('SchoolClubSignDetailScreen', { applicant: item })
        }
      >
        <View style={styles.applicantInfo}>
          <Text style={styles.name}>{item.Name || 'Unknown'}</Text>
          <Text style={styles.detail}>{item.Department || 'Unknown'}</Text>
        </View>
        <Icon name="right" size={20} color="#555" />
      </TouchableOpacity>
    );
  };

  if (loading) {
    return <ActivityIndicator size="large" color="#6C5CE7" style={{ marginTop: 50 }} />;
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>동아리 신청자 목록</Text>
      <FlatList
        data={userInfo}
        renderItem={renderApplicant}
        keyExtractor={(item, index) => (item.Post_fk ? `${item.Post_fk}_${index}` : Math.random().toString())} 
        contentContainerStyle={styles.listContent}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f0f4f7',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2c3e50',
    alignSelf: 'center',
    marginVertical: 20,
  },
  listContent: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  applicantItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 15,
    paddingHorizontal: 15,
    backgroundColor: '#fff',
    borderRadius: 10,
    elevation: 2,
  },
  applicantInfo: {
    flexDirection: 'column',
  },
  name: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#34495e',
  },
  detail: {
    fontSize: 14,
    color: '#7f8c8d',
    marginTop: 5,
  },
  separator: {
    height: 10,
  },
});

export default SchoolClubSignStateScreen;
