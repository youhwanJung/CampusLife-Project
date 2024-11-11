import React, { useEffect, useState, useRef } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  Image, 
  Alert, 
  ScrollView, 
  LayoutAnimation, 
  UIManager, 
  Platform, 
  TouchableOpacity as RNTouchableOpacity,
  Animated,
  ActivityIndicator
} from 'react-native';
import { TouchableOpacity } from 'react-native-gesture-handler';
import IconA from 'react-native-vector-icons/FontAwesome5';
import config from '../../config';

// Android에서 LayoutAnimation을 사용하기 위한 설정
if (
  Platform.OS === 'android' &&
  UIManager.setLayoutAnimationEnabledExperimental
) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

// 스터디룸 예약 정보 타입 정의
type StudyRoomInfo = {
  student: number;
  study_room_date: string;
  study_room_name: string;
  study_room_time: string;
  image: string;
};

// 날짜별로 그룹화된 스터디룸 예약 정보 타입 정의
type GroupedStudyRoomInfo = {
  [key: string]: StudyRoomInfo[];
};

// 스터디룸 상세 화면 컴포넌트
const StudyRoomDetailScreen = ({ route }: any) => {
  const { userdata } = route.params; // 라우트 파라미터에서 사용자 데이터 가져오기

  // 상태 변수 선언
  const [expanded, setExpanded] = useState<{ [key: string]: boolean }>({}); // 날짜별 확장 상태
  const [groupedStudyRoomInfo, setGroupedStudyRoomInfo] = useState<GroupedStudyRoomInfo>({}); // 그룹화된 스터디룸 정보
  const [isLoading, setIsLoading] = useState<boolean>(true); // 로딩 상태

  // 페이드 인 애니메이션을 위한 Animated.Value
  const fadeAnim = useRef(new Animated.Value(0)).current;

  /**
   * 특정 날짜의 확장 상태를 토글합니다.
   * @param date 날짜 문자열
   */
  const toggleExpand = (date: string) => {
    // 레이아웃 애니메이션 적용
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setExpanded(prevState => ({
      ...prevState,
      [date]: !prevState[date]
    }));
  };

  /**
   * 서버에서 스터디룸 예약 데이터를 가져옵니다.
   * @returns 스터디룸 예약 데이터 배열
   */
  const fetchStudyRoomData = async (): Promise<StudyRoomInfo[] | undefined> => {
    try {
      const response = await fetch(`${config.serverUrl}/get_study_room`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          student: userdata.student_pk
        })
      });
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('스터디룸 정보 가져오기 실패:', error);
    }
  };

  /**
   * 서버에 스터디룸 예약 삭제 요청을 보냅니다.
   * @param student 학생 ID
   * @param study_room_name 스터디룸 이름
   * @param study_room_date 스터디룸 예약 날짜
   * @param study_room_time 스터디룸 예약 시간대
   */
  const deleteStudyRoom = async (student: number, study_room_name: string, study_room_date: string, study_room_time: string) => {
    try {
      // 레이아웃 애니메이션 적용
      LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
      const response = await fetch(`${config.serverUrl}/deletestudyroom`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          student,
          study_room_name,
          study_room_date,
          study_room_time,
        }),
      });

      if (!response.ok) {
        throw new Error('네트워크 응답 실패');
      }

      const result = await response.json();
      // 스터디룸 삭제 성공 시 데이터 재조회
      await fetchAndGroupData();
      Alert.alert("삭제 완료", "스터디룸 예약이 성공적으로 삭제되었습니다.");
    } catch (error) {
      console.error('스터디룸 삭제 실패:', error);
      Alert.alert("삭제 실패", "스터디룸 예약을 삭제하는데 실패했습니다.");
    }
  };

  /**
   * 사용자에게 삭제 확인을 요청하는 알림을 표시합니다.
   * @param student 학생 ID
   * @param study_room_name 스터디룸 이름
   * @param study_room_date 스터디룸 예약 날짜
   * @param study_room_time 스터디룸 예약 시간대
   */
  const confirmDelete = (student: number, study_room_name: string, study_room_date: string, study_room_time: string) => {
    const handleDelete = async () => {
      await deleteStudyRoom(student, study_room_name, study_room_date, study_room_time); // 비동기 함수 호출
    };
  
    Alert.alert(
      "삭제 확인",
      "스터디룸 예약을 삭제하시겠습니까?",
      [
        {
          text: "취소",
          style: "cancel"
        },
        {
          text: "확인",
          onPress: handleDelete // 비동기 함수를 호출
        }
      ],
      { cancelable: false }
    );
  };

  /**
   * 데이터를 가져와 날짜별로 그룹화합니다.
   */
  const fetchAndGroupData = async () => {
    const data = await fetchStudyRoomData();
    if (data) {
      const groupedData = groupByDate(data);
      setGroupedStudyRoomInfo(groupedData);
    }
    setIsLoading(false); // 데이터 로딩 완료

    // 페이드 인 애니메이션 시작
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 500,
      useNativeDriver: true,
    }).start();
  };

  /**
   * 데이터를 날짜별로 그룹화하고 내림차순으로 정렬합니다.
   * @param data 스터디룸 예약 데이터 배열
   * @returns 그룹화된 스터디룸 예약 정보
   */
  const groupByDate = (data: StudyRoomInfo[]): GroupedStudyRoomInfo => {
    const groupedData = data.reduce((acc: GroupedStudyRoomInfo, item: StudyRoomInfo) => {
      (acc[item.study_room_date] = acc[item.study_room_date] || []).push(item);
      return acc;
    }, {});

    // 날짜를 내림차순으로 정렬
    const sortedGroupedData = Object.keys(groupedData)
      .sort((a, b) => new Date(b).getTime() - new Date(a).getTime())
      .reduce((acc: GroupedStudyRoomInfo, key: string) => {
        acc[key] = groupedData[key];
        return acc;
      }, {});

    return sortedGroupedData;
  };

  // 컴포넌트가 마운트될 때 데이터 불러오기
  useEffect(() => {
    const fetchDataAsync = async () => {
      try {
        await fetchAndGroupData();
      } catch (error) {
        console.error('데이터 가져오기 중 오류 발생:', error);
        setIsLoading(false); // 오류 발생 시에도 로딩 종료
      }
    };
    fetchDataAsync();
  }, []);

  /**
   * 날짜별로 그룹화된 스터디룸 예약 정보를 렌더링합니다.
   */
  const renderGroupedStudyRooms = () => {
    return Object.keys(groupedStudyRoomInfo).map((date, index) => (
      <View key={index} style={styles.infoContainer}>
        {/* 날짜와 확장/축소 아이콘 */}
        <View style={styles.titleContainer}>
          <Text style={styles.title}>{date}</Text>
          <TouchableOpacity style={styles.iconContainer} onPress={() => toggleExpand(date)}>
            <IconA 
              name={expanded[date] ? "chevron-up" : "chevron-down"} 
              size={24} 
              color="#333" 
            />
          </TouchableOpacity>
        </View>

        {/* 확장된 경우 스터디룸 정보 표시 */}
        {expanded[date] && groupedStudyRoomInfo[date].map((room, idx) => (
          <Animated.View 
            key={idx} 
            style={styles.roomContainer}
            // 예약 삭제 시 항목이 서서히 사라지도록 추가 애니메이션을 적용할 수 있습니다.
          >
            {/* 스터디룸 이미지 및 기본 정보 */}
            <View style={styles.additionalInfo}>
              <Image 
                style={styles.image} 
                source={{ uri: `${config.photoUrl}/${room.image}.png` }} 
                resizeMode="cover"
              />
              <View style={styles.info}>
                <Text style={styles.label}>📅 날짜: {room.study_room_date}</Text>
                <Text style={styles.label}>⏰ 시간: {room.study_room_time.split(',').map(time => `${time.trim()}시`).join(', ')}</Text>
                <Text style={styles.label}>📍 장소: {room.study_room_name}</Text>
                <Text style={styles.label}>👤 예약자: {userdata.name}</Text>
              </View>
            </View>

            {/* 미래의 예약인 경우 취소 버튼 표시 */}
            {new Date(room.study_room_date) > new Date() && (
              <>
                <View style={styles.divider}></View>
                <TouchableOpacity
                  style={styles.cancelButton}
                  onPress={() => confirmDelete(userdata.student_pk, room.study_room_name, room.study_room_date, room.study_room_time)}
                >
                  <Text style={styles.cancelButtonText}>❌ 취소하기</Text>
                </TouchableOpacity>
              </>
            )}
          </Animated.View>
        ))}
      </View>
    ));
  };

  return (
    <View style={styles.container}>
      {/* 로딩 인디케이터 */}
      {isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#4CAF50" />
          <Text style={styles.loadingText}>데이터를 로딩 중입니다...</Text>
        </View>
      ) : (
        <Animated.ScrollView 
          contentContainerStyle={styles.scrollContainer}
          style={{ opacity: fadeAnim }} // 페이드 인 애니메이션 적용
        >
          {renderGroupedStudyRooms()}
        </Animated.ScrollView>
      )}
    </View>
  );
};

// 스타일 정의
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f0f4f7', // 연한 회색 배경
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#555555',
  },
  scrollContainer: {
    padding: 20,
  },
  infoContainer: {
    marginBottom: 20,
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 15,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 3,
    },
    shadowOpacity: 0.3,
    shadowRadius: 4.65,
    elevation: 6,
  },
  titleContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#333',
  },
  iconContainer: {
    padding: 5,
  },
  roomContainer: {
    marginTop: 10,
    paddingTop: 10,
  },
  additionalInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  image: {
    width: 80,
    height: 80,
    borderRadius: 10,
    marginRight: 15,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  info: {
    flex: 1,
  },
  label: {
    fontSize: 16,
    color: '#555',
    marginBottom: 3,
  },
  divider: {
    borderWidth: 0.5,
    borderColor: '#ccc',
    marginVertical: 10,
  },
  cancelButton: {
    alignItems: 'center',
    paddingVertical: 10,
    backgroundColor: '#f44336', // 빨간색 배경
    borderRadius: 8,
  },
  cancelButtonText: {
    fontSize: 16,
    color: '#fff',
    fontWeight: 'bold',
  },
});

export default StudyRoomDetailScreen;
