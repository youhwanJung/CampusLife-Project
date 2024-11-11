import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  Dimensions,
  Image,
  Text,
  TouchableOpacity,
  Modal,
  Pressable,
  ScrollView
} from 'react-native';
import { Calendar } from 'react-native-calendars';
import { useFocusEffect } from '@react-navigation/native';
import { UserData } from '../../types/type';
import config from '../../config';

// 디바이스의 화면 너비를 가져옴
const width = Dimensions.get("window").width;

const AttendanceCheckEventScreen = ({ route }: any) => {
  // 라우트 파라미터에서 사용자 데이터를 가져옴
  const { userdata } = route.params;
  const [userData, setUserData] = useState<UserData>(userdata);
  const [attendanceChecked, setAttendanceChecked] = useState(false);
  const [selectedDates, setSelectedDates]: any = useState([]);

  // Custom Alert State
  const [isAlertVisible, setIsAlertVisible] = useState(false);
  const [alertMessage, setAlertMessage] = useState('');

  // 화면이 포커스될 때마다 데이터를 가져옴
  useFocusEffect(
    React.useCallback(() => {
      const fetchData = async () => {
        try {
          setUserData(userdata);
          await getAppAttendanceDate();
        } catch (error) {
          console.error('데이터 가져오기 오류:', error);
        }
      };
      fetchData();
    }, [])
  );

  /**
   * 출석 날짜 데이터를 서버에서 가져오는 함수
   */
  const getAppAttendanceDate = async () => {
    try {
      const response = await fetch(`${config.serverUrl}/getAppAttendanceDate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          user_id: userData.user_pk
        }),
      });
      const AppAttendanceDate = await response.json();
      const checkdate = AppAttendanceDate.map((item: any) => item.date);
      setSelectedDates(checkdate);
    } catch (error) {
      console.error('출석 날짜 가져오기 오류:', error);
    }
  };

  /**
   * 새로운 출석 날짜를 서버에 추가하는 함수
   * @param today - 오늘 날짜
   */
  const addAppAttendanceDate = async (today: any) => {
    try {
      await fetch(`${config.serverUrl}/addAppAttendanceDate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          user_id: userData.user_pk,
          date: today
        }),
      });
    } catch (error) {
      console.error('출석 날짜 추가 오류:', error);
    }
  };

  /**
   * 사용자의 포인트를 업데이트하는 함수
   */
  const user_update_point = async () => {
    try {
      await fetch(`${config.serverUrl}/user_update_point2`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          user_id: userData.user_pk,
          point: 10
        })
      });
      // 포인트를 로컬 데이터에 반영
      setUserData(prevData => ({ ...prevData, point: prevData.point + 10 }));
    } catch (error) {
      console.error('포인트 업데이트 실패:', error);
    }
  };

  /**
   * 출석 포인트 히스토리를 서버에 추가하는 함수
   * @param date - 출석 날짜
   */
  const AddAppAttendancePointHistory = async (date: string) => {
    try {
      await fetch(`${config.serverUrl}/AddAppAttendancePointHistory`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          user_id: userData.user_pk,
          today: date
        })
      });
    } catch (error) {
      console.error('출석 포인트 히스토리 추가 오류:', error);
    }
  };

  // 달력에 표시할 날짜들을 설정
  const markedDates: { [date: string]: { marked: boolean; selected?: boolean } } = selectedDates.reduce((acc: { [date: string]: { marked: boolean; selected?: boolean } }, date: string) => {
    acc[date] = { marked: true, selected: true };
    return acc;
  }, {});

  /**
   * Function to display custom alert
   * @param message - The message to display in the alert
   */
  const showCustomAlert = (message: string) => {
    setAlertMessage(message);
    setIsAlertVisible(true);
  };

  /**
   * 출석 체크 버튼을 눌렀을 때 실행되는 함수
   */
  const handleAttendanceCheck = async () => {
    const today = new Date().toISOString().split('T')[0];

    if (selectedDates.includes(today)) {
      showCustomAlert('이미 출석체크를 하셨습니다.');
    } else {
      setAttendanceChecked(true);
      await addAppAttendanceDate(today);
      await AddAppAttendancePointHistory(today);
      await user_update_point();
      showCustomAlert("앱 출석체크 성공!! 10포인트가 적립되었습니다.");
    }
  };

  /**
   * 선택된 날짜에 표시할 이미지를 렌더링하는 함수
   */
  const renderImage = () => (
    <Image
      source={require('../../assets/selected.png')}
      style={styles.selectedImage}
    />
  );

  // 배경 이미지 불러오기
  const AttendanceCheckEvent = require('../../assets/AttendanceCheckEvent.jpg');

  return (
    <ScrollView>

      <View style={styles.container}>
        {/* 배경 이미지 */}
        <Image
          source={AttendanceCheckEvent}
          style={styles.backgroundImage}
        />

        {/* 상단 정보 영역 */}
        <View style={styles.topInfo}>
          <View style={styles.pointContainer}>
            <Text style={styles.pointText}>현재 포인트 : {userData.point}P</Text>
          </View>
        </View>

        {/* 달력 컴포넌트 */}
        <Calendar
          style={styles.calendar}
          theme={{
            todayTextColor: 'black',
            textDayFontSize: 20,
            textDayFontWeight: 'bold',
            textMonthFontSize: 20,
            textMonthFontWeight: 'bold',
            textSectionTitleColor: 'black',
          }}
          monthFormat={'M월'}
          showSixWeeks={true}
          markedDates={markedDates}
          markingType={'custom'}
          dayComponent={({ date, state }: any) => {
            const marked = markedDates[date.dateString];
            return (
              <View style={styles.dayContainer}>
                <Text
                  style={[
                    styles.dayText,
                    state === 'disabled' ? styles.disabledText : null,
                    marked && styles.selectedText, // 선택된 날짜의 텍스트 스타일 적용
                  ]}
                >
                  {date.day}
                </Text>
                {marked && renderImage()}
              </View>
            );
          }}
        />

        {/* 출석 체크 버튼 */}
        <TouchableOpacity
          onPress={async () => {
            await handleAttendanceCheck();
            await getAppAttendanceDate();
          }}
        >
          <View style={styles.buttonArea}>
            <Text style={styles.buttonText}>출석체크</Text>
          </View>
        </TouchableOpacity>

        {/* Custom Alert Modal */}
        <Modal
          animationType="fade"
          transparent={true}
          visible={isAlertVisible}
          onRequestClose={() => {
            setIsAlertVisible(false);
          }}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <Text style={styles.modalMessage}>{alertMessage}</Text>
              <Pressable
                style={styles.modalButton}
                onPress={() => setIsAlertVisible(false)}
              >
                <Text style={styles.modalButtonText}>확인</Text>
              </Pressable>
            </View>
          </View>
        </Modal>
      </View>
    </ScrollView>
  );
};

// 스타일 정의
const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    backgroundColor: '#F5F5F5', // 전체 배경색 추가
  },
  backgroundImage: {
    height: 300,
    resizeMode: 'contain'
  },
  topInfo: {
    width: '90%',
    marginTop: 10, // 배경 이미지 아래에 위치하도록 마진 조정
    padding: 15,
    backgroundColor: 'rgba(255, 255, 255, 0.9)', // 반투명 흰색 배경
    borderRadius: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 5,
  },
  pointContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  pointIcon: {
    width: 30,
    height: 30,
    marginRight: 10,
  },
  pointText: {
    color: '#333333',
    fontSize: 24,
    fontWeight: 'bold',
  },
  calendar: {
    width: width - 20,
    marginTop: 20,
    paddingBottom: 10,
    borderWidth: 1,
    borderColor: '#E9E9E9',
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
    elevation: 10,
  },
  selectedImage: {
    width: 35,
    height: 35,
    position: 'absolute',
  },
  dayContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    width: 40,
    height: 40,
    position: 'relative',
  },
  dayText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: 'black',
  },
  selectedText: {
    color: 'white', // 선택된 날짜의 텍스트 색상
  },
  disabledText: {
    color: 'gray',
  },
  buttonArea: {
    marginVertical: 15,
    backgroundColor: '#FF8C00', // 진한 오렌지 색상
    paddingVertical: 15, // 세로 패딩 증가
    paddingHorizontal: 30, // 가로 패딩 증가
    borderRadius: 30, // 더 둥근 모서리
    elevation: 5, // 그림자 효과
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3.84,
  },
  buttonText: {
    color: '#FFFFFF', // 텍스트 색상 흰색으로 변경
    fontSize: 22, // 폰트 크기 약간 축소
    fontWeight: '600', // 반굵게 설정
    textAlign: 'center',
  },
  // Custom Alert Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)', // Semi-transparent background
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: width * 0.8,
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 20,
    alignItems: 'center',
    elevation: 10,
  },
  modalMessage: {
    fontSize: 18,
    color: '#333333',
    marginBottom: 20,
    textAlign: 'center',
  },
  modalButton: {
    backgroundColor: '#FF8C00', // Same as your button color
    paddingVertical: 10,
    paddingHorizontal: 30,
    borderRadius: 20,
  },
  modalButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '600',
  },
});

export default AttendanceCheckEventScreen;
