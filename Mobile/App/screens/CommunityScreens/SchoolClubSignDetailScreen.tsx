import React, { useState, useEffect } from 'react';
import {
  Modal,
  Text,
  View,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  TouchableOpacity,
  Alert,
  TextInput,
} from 'react-native';
import IconA from 'react-native-vector-icons/Entypo';
import config from '../../config';

const SchoolClubSignDetailScreen = ({ route, navigation }: any) => {
  const { applicant } = route.params; // 전달받은 applicant
  const [loading, setLoading] = useState(true); // 데이터 로딩 상태
  const [showOptions, setShowOptions] = useState(false);
  const [isModalVisible, setIsModalVisible] = useState(false); // 모달 가시성 상태
  const [message, setMessage] = useState(''); // 쪽지 내용 상태
  const [user_id, setuser_id] = useState();

  const toggleOptions = () => {
    setShowOptions(!showOptions);
  };

  const handleDelete = async () => {
    try {
      const response = await fetch(`${config.serverUrl}/deleteclub`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          post_id: applicant.Post_fk,
          name: applicant.Name,
          phone: applicant.Phone,
        }),
      });

      const data = await response.json();
      if (response.ok) {
        Alert.alert('삭제 완료', data.message, [
          { text: '확인', onPress: () => navigation.goBack() }, // 삭제 후 이전 화면으로 이동
        ]);
      } else {
        Alert.alert('삭제 실패', data.error);
      }
    } catch (error) {
      Alert.alert('오류 발생', '삭제 작업 중 문제가 발생했습니다.');
      console.error('Delete request failed:', error);
    }
  };



  const updateComment = async () => {
    try {
        const response = await fetch(`${config.serverUrl}/updateComment`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                comment : message,
                Phone : applicant.Phone
            }),
        });
        await response.json();
    } catch (error) {
        console.error('일반 게시물 가져오기 실패:', error);
    }
};

  const UpdateAramCount = async (user_id: any) => {
    try {
      await fetch(`${config.serverUrl}/update_aram_count`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: user_id
        })
      });
    } catch (error) {
      console.error('알람 카운트 업데이트 실패', error);
    }
  };


      // 쪽지 보내기
      const SendAramData = async () => {
        try {
            const response = await fetch(`${config.serverUrl}/SendAramData`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    user_id : user_id,
                    target_id : applicant.Post_fk,
                    title : message
                }),
            });
            await response.json();
            await UpdateAramCount(user_id)
        } catch (error) {
            console.error('일반 게시물 가져오기 실패:', error);
        }
    };

    // 신청자 PK가져오기
    const GetClubPersonPK = async () => {
      try {
          const response = await fetch(`${config.serverUrl}/GetClubPersonPK`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                  user_name : applicant.Name
              }),
          });
          const user_PK = await response.json();
          console.log(user_PK);
          setuser_id(user_PK.user_id);
      
      } catch (error) {
          console.error('일반 게시물 가져오기 실패:', error);
      }
  };

    const showAlert = () => {
      Alert.alert(
        "알림",
        "쪽지를 성공적으로 전송했습니다!",
        [
          { text: "확인", onPress: () => navigation.goBack() }
        ]
      );
    };


  // 데이터를 불러오거나 준비가 완료되면 로딩 상태를 false로 변경
  useEffect(() => {
    const fetchData = async () => {
      if (applicant) {
        setLoading(false);
        await GetClubPersonPK();
      }
    }
    fetchData();
  }, [applicant]);

  const applicationData = [
    { label: '자기소개', value: applicant?.Introduce },
    { label: '지원 동기', value: applicant?.Application },
  ];

  if (loading) {
    return <ActivityIndicator size="large" color="#6C5CE7" style={{ marginTop: 50 }} />;
  }

  return (
    <ScrollView style={styles.container}>
      {/* 헤더 부분 */}
      <View style={styles.header}>
        <Text style={styles.title}>{applicant?.Name}님의 신청서</Text>
      </View>

      {/* 사용자 정보 섹션 */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>사용자 정보</Text>
          <TouchableOpacity onPress={toggleOptions} style={{ zIndex: 1000 }}>
            <IconA size={20} color="black" name={'dots-three-vertical'} />
          </TouchableOpacity>

          {showOptions && (
            // 상단 옵션
            <View style={styles.optionBox}>
              <TouchableOpacity onPress={() => {
                setIsModalVisible(true); 
                setShowOptions(false);
                }}>
                <Text style={styles.optionText}>쪽지 보내기</Text>
              </TouchableOpacity>
              <View style={styles.optionLine}></View>
              <TouchableOpacity onPress={handleDelete}>
                <Text style={styles.optionText}>삭제</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
        <View style={styles.infoContainer}>
          {[
            { label: '이름', value: applicant?.Name },
            { label: '생년월일', value: applicant?.Birth },
            { label: '학교', value: applicant?.University },
            { label: '학과', value: applicant?.Department },
            { label: '학년', value: applicant?.Grade },
            { label: '전화번호', value: applicant?.Phone },
            { label: '성별', value: applicant?.Sex },
            { label: '거주지', value: applicant?.Residence },
          ].map((info, index) => (
            <View key={index} style={styles.infoItem}>
              <Text style={styles.label}>{info.label}</Text>
              <Text style={styles.value}>{info.value}</Text>
            </View>
          ))}
        </View>
      </View>

      {/* 신청서 데이터 섹션 */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>신청서 내용</Text>
        {applicationData.map((detail, index) => (
          <View key={index} style={styles.detailContainer}>
            <Text style={styles.label}>{detail.label}</Text>
            <Text style={styles.value}>{detail.value}</Text>
          </View>
        ))}
      </View>

      {/* 모달 컴포넌트 */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={isModalVisible}
        onRequestClose={() => {
          setIsModalVisible(false);
        }}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>쪽지 보내기</Text>
            <TextInput
              style={styles.messageInput}
              placeholder="쪽지 내용을 입력하세요"
              multiline
              numberOfLines={4}
              onChangeText={(text) => setMessage(text)}
              value={message}
            />
            <View style={styles.modalButtons}>
              <TouchableOpacity style={styles.sendButton} 
              onPress={async () => {
                await updateComment();
                await SendAramData();
                showAlert();
              }}>
                <Text style={styles.sendButtonText}>전송</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.closeButton} onPress={() => setIsModalVisible(false)}>
                <Text style={styles.closeButtonText}>취소</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
};

// 스타일 정의
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FAFAFA',
  },
  header: {
    backgroundColor: '#6C5CE7',
    paddingVertical: 20,
    alignItems: 'center',
    marginBottom: 30,
    borderBottomLeftRadius: 50,
    borderBottomRightRadius: 50,
    elevation: 10,
    shadowColor: '#6C5CE7',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginTop: 10,
  },
  section: {
    marginBottom: 30,
    paddingHorizontal: 30,
  },
  sectionHeader: {
    flexDirection: 'row', // 같은 행에 배치
    justifyContent: 'space-between', // 텍스트와 아이콘 사이 공간 확보
    alignItems: 'center', // 수직 정렬
    marginBottom: 20, // 아래쪽 여백
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2D3436',
  },
  infoContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 25,
    paddingBottom: 5,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
  },
  infoItem: {
    marginBottom: 15,
  },
  detailContainer: {
    marginBottom: 20,
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 25,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
  },
  label: {
    fontSize: 18,
    color: '#34495E',
    fontWeight: '700',
    marginBottom: 5,
  },
  value: {
    fontSize: 16,
    color: 'black',
    lineHeight: 24,
  },
  optionBox: {
    position: 'absolute',
    top: 25,
    right: 15,
    width: 120,
    backgroundColor: 'white',
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
    paddingVertical: 10,
    paddingHorizontal: 5,
    zIndex: 999,
  },
  optionLine: {
    width: 100,
    height: 0.5,
    backgroundColor: 'black',
    marginRight: 20,
    marginTop: 10,
    marginBottom: 10,
  },
  optionText: {
    fontSize: 15,
    fontWeight: 'bold',
    color: 'black',
    paddingLeft: 10,
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    width: '85%',
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 25,
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 15,
    color: '#2D3436',
  },
  messageInput: {
    width: '100%',
    height: 120,
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 10,
    padding: 15,
    marginBottom: 20,
    textAlignVertical: 'top',
    fontSize: 16,
    color: '#34495E',
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
  },
  sendButton: {
    backgroundColor: '#6C5CE7',
    paddingVertical: 12,
    paddingHorizontal: 25,
    borderRadius: 10,
  },
  sendButtonText: {
    fontSize: 16,
    color: 'white',
    fontWeight: 'bold',
  },
  closeButton: {
    backgroundColor: '#b2bec3',
    paddingVertical: 12,
    paddingHorizontal: 25,
    borderRadius: 10,
  },
  closeButtonText: {
    fontSize: 16,
    color: 'white',
    fontWeight: 'bold',
  },
});

export default SchoolClubSignDetailScreen;
