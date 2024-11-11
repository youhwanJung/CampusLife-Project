import React, { useState, useEffect } from 'react';
import { 
  Dimensions, 
  ScrollView, 
  View, 
  Text, 
  StyleSheet, 
  Image, 
  TouchableOpacity, 
  ActivityIndicator, 
  Modal, 
  TouchableWithoutFeedback 
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { format, endOfMonth } from 'date-fns';
import config from '../../config';
import ImageCropPicker from 'react-native-image-crop-picker';
import Icon from 'react-native-vector-icons/FontAwesome5';

const DEVICE_WIDTH = Dimensions.get("window").width;

// 예약 가능한 시간대 목록
const TIME_SLOTS = ['09', '10', '11', '12', '13', '14', '15', '16', '17', '18', '19', '20'];

// 건물 데이터의 타입 정의
export type BuildingData = {
  [x: string]: any;
  study_room_id: number;
  campus_place: string;
  study_room_name: string;
  image: any;
};

// 스터디룸 화면 컴포넌트
const StudyRoomScreen = ({ route, navigation }: any) => {
  const { userdata } = route.params; // 라우트 파라미터에서 사용자 데이터 가져오기

  // 상태 변수 선언
  const [campus, setCampus] = useState<string[]>(['전체']); // 캠퍼스 목록
  const [selectedDate, setSelectedDate]: any = useState(new Date()); // 선택된 날짜
  const [selectedCampus, setSelectedCampus]: any = useState(campus[0]); // 선택된 캠퍼스
  const [selectedTimes, setSelectedTimes]: any = useState({}); // 선택된 시간대
  const [showDatePicker, setShowDatePicker]: any = useState(false); // 날짜 선택기 표시 여부
  const [schoolBuildingData, setSchoolBuildingData] = useState<BuildingData[]>(); // 학교 건물 데이터
  const [studyroomInfo, setStudyroomInfo] = useState<{ 
    place: string, 
    name: string, 
    maxHeadCount: number, 
    minHeadCount: number, 
    image: any 
  }[]>([]); // 스터디룸 정보
  const [reservedTimes, setReservedTimes] = useState<{ 
    [key: string]: { [key: string]: string[] } 
  }>({}); // 예약된 시간 정보
  const [isLoading, setIsLoading] = useState<boolean>(true); // 로딩 상태

  // 커스텀 모달을 위한 상태 변수
  const [isModalVisible, setIsModalVisible] = useState<boolean>(false);
  const [modalTitle, setModalTitle] = useState<string>('');
  const [modalMessage, setModalMessage] = useState<string>('');
  const [modalType, setModalType] = useState<'success' | 'error'>('success');

  /**
   * 서버에서 캠퍼스 장소 정보를 가져옵니다.
   */
  const getCampusPlace = async () => {
    try {
      const response = await fetch(`${config.serverUrl}/get_campus_place`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          campus_id: userdata.campus_pk,
        })
      });
      const campusPlace = await response.json();
      setSchoolBuildingData(campusPlace);

      // 캠퍼스 목록을 '전체'와 함께 설정
      const campusPlaces = ['전체', ...new Set(campusPlace.map((data: BuildingData) => data.campus_place))] as string[];
      setCampus(campusPlaces);
    } catch (error) {
      console.error('학교 캠퍼스 스터디룸 정보 가져오기 실패:', error);
      showModal('오류', '학교 캠퍼스 정보를 가져오는 데 실패했습니다.', 'error');
    }
  };

  /**
   * 서버에서 스터디룸 예약 데이터를 가져옵니다.
   */
  const fetchData = async () => {
    try {
      const response = await fetch(`${config.serverUrl}/get_study_date_time`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      const data = await response.json();

      // 예약된 시간을 날짜별, 스터디룸별로 정리
      const reservedTimesData: { [key: string]: { [key: string]: string[] } } = {};
      data.forEach((item: any) => {
        const formattedDate = format(new Date(item.study_room_date), 'yyyy-MM-dd');
        if (!reservedTimesData[formattedDate]) {
          reservedTimesData[formattedDate] = {};
        }
        if (!reservedTimesData[formattedDate][item.study_room_name]) {
          reservedTimesData[formattedDate][item.study_room_name] = [];
        }
        reservedTimesData[formattedDate][item.study_room_name].push(...item.study_room_time.split(',')); // 문자열을 배열로 변환
      });

      setReservedTimes(reservedTimesData); // 예약된 시간 상태 업데이트
    } catch (error) {
      console.error('데이터를 불러오는 중 오류 발생:', error);
      showModal('오류', '예약 데이터를 불러오는 데 실패했습니다.', 'error');
    }
  };

  /**
   * 예약된 시간을 업데이트합니다.
   * @param studyRoomDate 예약 날짜
   * @param studyRoomName 스터디룸 이름
   * @param studyRoomTimes 예약 시간대
   */
  const updateReservedTimes = (studyRoomDate: string, studyRoomName: string, studyRoomTimes: string[]) => {
    setReservedTimes(prevState => {
      const updatedReservedTimes = { ...prevState };
      if (!updatedReservedTimes[studyRoomDate]) {
        updatedReservedTimes[studyRoomDate] = {};
      }
      // 시간을 배열 형태로 업데이트
      updatedReservedTimes[studyRoomDate][studyRoomName] = [...(updatedReservedTimes[studyRoomDate][studyRoomName] || []), ...studyRoomTimes];
      return updatedReservedTimes;
    });
  };

  /**
   * 사용자 스터디룸 예약을 서버에 전송합니다.
   * @param studyRoomId 스터디룸 ID
   * @param studyRoomDate 예약 날짜
   * @param studyRoomTime 예약 시간대
   */
  const insertUserStudyRoom = async (studyRoomId: number, studyRoomDate: string, studyRoomTime: string) => {
    try {
      const response = await fetch(`${config.serverUrl}/studyroomReservation`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          student: userdata.student_pk,
          study_room: studyRoomId,
          study_room_date: studyRoomDate,
          study_room_time: studyRoomTime,
        })
      });
      const value = await response.json();
      // 예약 성공 시 추가 로직을 여기에 작성할 수 있습니다.
    } catch (error) {
      console.error('스터디룸 예약 실패!', error);
      showModal('예약 실패', '스터디룸 예약을 완료하는 데 실패했습니다.', 'error');
    }
  };

  /**
   * 학교 건물 데이터가 변경될 때 스터디룸 정보를 설정합니다.
   */
  useEffect(() => {
    if (schoolBuildingData) {
      const buildingData = schoolBuildingData.map((room: BuildingData) => ({
        place: room.campus_place,
        name: room.study_room_name,
        maxHeadCount: 12, // 최대 인원수 (고정값, 필요시 서버에서 가져올 수 있음)
        minHeadCount: 4,  // 최소 인원수 (고정값, 필요시 서버에서 가져올 수 있음)
        image: room.image
      }));
      setStudyroomInfo(buildingData);
    }
  }, [schoolBuildingData]);

  /**
   * 날짜 선택기가 변경될 때 호출됩니다.
   * @param event 이벤트 객체
   * @param date 선택된 날짜
   */
  const onDateChange = (event: any, date?: Date) => {
    const currentDate = date || new Date();
    setShowDatePicker(false);
    setSelectedDate(currentDate);
    setSelectedTimes({});
  };

  /**
   * 캠퍼스 선택 시 호출됩니다.
   * @param campusName 선택된 캠퍼스 이름
   */
  const handleCampusSelect = (campusName: React.SetStateAction<string>) => {
    setSelectedCampus(campusName);
  };

  /**
   * 선택된 시간이 연속된 시간대인지 확인합니다.
   * @param times 선택된 시간대 배열
   * @returns 연속 여부 (boolean)
   */
  const isConsecutive = (times: any[]) => {
    if (times.length <= 1) return true;
    const sortedTimes = times.map(Number).sort((a: number, b: number) => a - b);
    for (let i = 1; i < sortedTimes.length; i++) {
      if (sortedTimes[i] - sortedTimes[i - 1] !== 1) return false;
    }
    return true;
  };

  /**
   * 시간대를 선택하거나 해제할 때 호출됩니다.
   * @param selectedRoom 선택된 스터디룸 이름
   * @param selectedHour 선택된 시간대
   */
  const handleTimeSelect = (selectedRoom: string, selectedHour: string) => {
    const currentDate = new Date();
    const currentHour = currentDate.getTime(); // 현재 시간 (UTC+9 적용)
    const koreaTime = new Date(currentDate.getTime() + 9 * 60 * 60 * 1000); // UTC+9로 변환
    const koreaHour = koreaTime.getHours(); // 한국 시간의 시 

    // 오늘 날짜인지 확인
    const isToday = selectedDate.toDateString() === currentDate.toDateString();
    
    // 시간(selectedHour)이 현재 시간보다 이전인지 확인
    if (isToday && Number(selectedHour) <= koreaHour) {
      showModal("예약 실패", "현재 시간 이전의 시간대는 예약할 수 없습니다.", "error");
      return;
    }
  
    for (const roomName in selectedTimes) {
      const roomTimes = selectedTimes[roomName];
      if (roomName !== selectedRoom && roomTimes.includes(selectedHour)) {
        showModal("예약 실패", "이미 해당 시간에 다른 스터디룸이 예약되어 있습니다.", "error");
        return;
      }
    }
  
    const roomTimes = selectedTimes[selectedRoom] || [];
    const newTimes = roomTimes.includes(selectedHour)
      ? roomTimes.filter((time: any) => time !== selectedHour)
      : [...roomTimes, selectedHour].slice(-3);
  
    // 최대 예약 가능한 시간을 초과하는지 확인합니다.
    if (newTimes.length > 3) {
      showModal("예약 실패", "최대 3시간까지 연속된 시간대만 선택할 수 있습니다.", "error");
      return;
    }
  
    // 연속된 시간을 선택했는지 확인합니다.
    if (!isConsecutive(newTimes)) {
      showModal("예약 실패", "연속된 시간대만 선택할 수 있습니다.", "error");
      return;
    }
  
    // 선택한 시간을 상태에 업데이트합니다.
    setSelectedTimes({
      ...selectedTimes,
      [selectedRoom]: newTimes,
    });
  };

  /**
   * 예약 버튼을 눌렀을 때 호출됩니다.
   * 선택된 시간대로 예약을 진행합니다.
   */
  const handleReservation = async () => {
    // 선택한 날짜에 이미 스터디룸 예약이 있는지 확인
    const reservedTimesForSelectedDate = reservedTimes[format(selectedDate, "yyyy-MM-dd")] || {};

    if (Object.keys(reservedTimesForSelectedDate).length > 0) {
      showModal("예약 실패", "이미 해당 날짜에 스터디룸을 예약하셨습니다.", "error");
      return;
    }

    // 예약 가능한 시간대가 있는지 확인
    const reservationDetails = Object.entries(selectedTimes).map(([room, times]: any) => ({
      room,
      times: times.sort(),
    })).filter(detail => detail.times.length > 0);

    if (reservationDetails.length === 0) {
      showModal("예약 실패", "시간대를 선택해주세요.", "error");
      return;
    }

    let message = `예약된 날짜: ${format(selectedDate, "yyyy년 M월 d일")}\n`;

    if (schoolBuildingData) {
      for (const detail of reservationDetails) {
        const selectedRoomInfo = studyroomInfo.find(room => room.name === detail.room);
        if (selectedRoomInfo) {
          const selectedBuilding = schoolBuildingData.find((building: BuildingData) => building.study_room_name === detail.room);
          if (selectedBuilding) {
            const studyRoomId = selectedBuilding.study_room_id;
            const studyRoomDate = format(selectedDate, "yyyy-MM-dd");
            const studyRoomTime = detail.times.join(',');

            message += `스터디룸: ${selectedRoomInfo.place} ${selectedRoomInfo.name}\n시간대: ${detail.times.join(', ')}시\n`;
            await insertUserStudyRoom(studyRoomId, studyRoomDate, studyRoomTime);
            updateReservedTimes(studyRoomDate, detail.room, detail.times); // 배열로 전달
          }
        }
      }
    } else {
      console.error('학교 건물 데이터가 없습니다.');
      showModal("예약 실패", "학교 건물 정보를 불러오는 데 실패했습니다.", "error");
      return;
    }

    showModal("예약 성공", message, "success");
    setSelectedTimes({}); // 선택된 시간 초기화
  };

  /**
   * 커스텀 모달을 표시합니다.
   * @param title 모달 제목
   * @param message 모달 메시지
   * @param type 모달 유형 ('success' | 'error')
   */
  const showModal = (title: string, message: string, type: 'success' | 'error') => {
    setModalTitle(title);
    setModalMessage(message);
    setModalType(type);
    setIsModalVisible(true);
  };

  /**
   * 커스텀 모달을 숨깁니다.
   */
  const hideModal = () => {
    setIsModalVisible(false);
  };

  /**
   * 캠퍼스 선택 버튼을 렌더링합니다.
   */
  const renderCampusSelect = () => (
    <View style={styles.campusSelectArea}>
      {campus.map((campusName, index) => (
        <TouchableOpacity key={index} onPress={() => handleCampusSelect(campusName)}>
          <View style={[styles.campusBox, selectedCampus === campusName && styles.selectedCampus]}>
            <Text style={[styles.campusText, selectedCampus === campusName && styles.selectedCampusText]}>
              {campusName}
            </Text>
          </View>
        </TouchableOpacity>
      ))}
    </View>
  );

  /**
   * 선택된 날짜에 따른 예약된 시간을 가져옵니다.
   */
  const reservedTimesForSelectedDate = reservedTimes[format(selectedDate, "yyyy-MM-dd")] || {};

  /**
   * 스터디룸 목록을 렌더링합니다.
   */
  const renderStudyRooms = () => (
    studyroomInfo.map((room, index) => (
      (room.place === selectedCampus || selectedCampus === '전체') && (
        <View key={index} style={styles.studyroomArea}>
          {/* 스터디룸 정보 */}
          <View style={styles.infoText}>
            <Text style={styles.studyroomName}>{room.name}</Text>
            <View style={styles.studyroomHeadcount}>
              <Text style={styles.labelText}>정원 </Text>
              <Text style={[styles.numText, { color: 'blue' }]}>{room.maxHeadCount}</Text>
              <Text style={styles.labelText}> 최소인원 </Text>
              <Text style={[styles.numText, { color: 'red' }]}>{room.minHeadCount}</Text>
            </View>
          </View>

          {/* 스터디룸 이미지와 시간대 선택 */}
          <View style={styles.selectArea}>
            <View style={styles.imageArea}>
              <Image 
                style={styles.image} 
                source={{ uri: `${config.photoUrl}/${room.image}.png` }} 
                resizeMode="cover"
              />
            </View>
            <View style={styles.timeArea}>
              {TIME_SLOTS.map((hour, index) => (
                <TouchableOpacity
                  key={index}
                  onPress={() => handleTimeSelect(room.name, hour)}
                  disabled={reservedTimesForSelectedDate[room.name]?.includes(hour)}
                >
                  <View style={[
                    styles.timeBox,
                    reservedTimesForSelectedDate[room.name]?.includes(hour) && styles.reservedTimeBox,
                    selectedTimes[room.name]?.includes(hour) && styles.selectedTimeBox
                  ]}>
                    <Text style={[
                      styles.timeText,
                      reservedTimesForSelectedDate[room.name]?.includes(hour) && styles.reservedTimeText,
                      selectedTimes[room.name]?.includes(hour) && styles.selectedTimeText
                    ]}>
                      {hour}
                    </Text>
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </View>
      )
    ))
  );

  /**
   * 컴포넌트가 마운트될 때 캠퍼스 장소와 예약 데이터를 가져옵니다.
   */
  useEffect(() => {
    const fetchDataAsync = async () => {
      try {
        await getCampusPlace();
        await fetchData();
        setIsLoading(false); // 데이터 로딩 완료
      } catch (error) {
        console.error('데이터를 가져오는 중 오류 발생:', error);
        setIsLoading(false); // 오류 발생 시에도 로딩 종료
      }
    };
    fetchDataAsync();
  }, []);

  return (
    <View style={styles.container}>
      {/* 로딩 인디케이터 */}
      {isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#4CAF50" />
          <Text style={styles.loadingText}>데이터를 로딩 중입니다...</Text>
        </View>
      ) : (
        <>
          {/* 스크롤 가능한 콘텐츠 */}
          <ScrollView contentContainerStyle={styles.scrollContainer}>
            {/* 날짜 선택 영역 */}
            <View style={styles.header}>
              <TouchableOpacity onPress={() => setShowDatePicker(true)}>
                <Text style={styles.selectedDateText}>{format(selectedDate, "yyyy년 M월 d일")}</Text>
              </TouchableOpacity>
              {showDatePicker && (
                <DateTimePicker
                  value={selectedDate}
                  mode="date"
                  display="default"
                  minimumDate={new Date()}
                  maximumDate={endOfMonth(new Date())}
                  onChange={onDateChange}
                />
              )}
            </View>

            {/* 본문 영역 */}
            <View style={styles.body}>
              {/* 캠퍼스 선택 버튼 */}
              {renderCampusSelect()}

              {/* 스터디룸 목록 */}
              {renderStudyRooms()}
            </View>
          </ScrollView>

          {/* 예약하기 버튼: 선택된 시간대가 있을 때만 표시 */}
          {Object.keys(selectedTimes).length > 0 && (
            <View style={styles.footer}>
              <TouchableOpacity style={styles.reserveButton} onPress={handleReservation}>
                <Text style={styles.reserveButtonText}>예약하기</Text>
              </TouchableOpacity>
            </View>
          )}

          {/* 커스텀 모달 */}
          <Modal
            transparent={true}
            animationType="fade"
            visible={isModalVisible}
            onRequestClose={hideModal}
          >
            <TouchableWithoutFeedback onPress={hideModal}>
              <View style={styles.modalOverlay}>
                <TouchableWithoutFeedback>
                  <View style={[styles.modalContainer, modalType === 'success' ? styles.successModal : styles.errorModal]}>
                    {/* 아이콘 */}
                    <Icon 
                      name={modalType === 'success' ? "check-circle" : "times-circle"} 
                      size={50} 
                      color={modalType === 'success' ? "#4CAF50" : "#f44336"} 
                      style={styles.modalIcon}
                    />
                    {/* 제목 */}
                    <Text style={styles.modalTitle}>{modalTitle}</Text>
                    {/* 메시지 */}
                    <Text style={styles.modalMessage}>{modalMessage}</Text>
                    {/* 확인 버튼 */}
                    <TouchableOpacity style={styles.modalButton} onPress={hideModal}>
                      <Text style={styles.modalButtonText}>확인</Text>
                    </TouchableOpacity>
                  </View>
                </TouchableWithoutFeedback>
              </View>
            </TouchableWithoutFeedback>
          </Modal>
        </>
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
    paddingHorizontal: 20,
    paddingBottom: 100, // 하단 여백 추가 (고정된 예약 버튼과 겹치지 않도록)
  },
  header: {
    padding: 20,
    width: DEVICE_WIDTH,
    alignSelf: 'center',
    backgroundColor: '#F5B959', // 헤더 배경색
    alignItems: 'center',
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    marginBottom: 20,
  },
  selectedDateText: {
    fontSize: 20,
    color: '#fff',
    fontWeight: 'bold',
  },
  body: {
    // 추가적인 스타일이 필요하면 여기에 작성
  },
  campusSelectArea: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    marginBottom: 20,
  },
  campusBox: {
    paddingVertical: 10,
    paddingHorizontal: 15,
    margin: 5,
    backgroundColor: '#e0e0e0',
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  selectedCampus: {
    backgroundColor: '#007BFF', // 선택된 캠퍼스 배경색 (파란색)
  },
  campusText: {
    color: '#333',
    fontWeight: 'bold',
    fontSize: 16,
  },
  selectedCampusText: {
    color: '#fff', // 선택된 캠퍼스 텍스트 색상 (흰색)
  },
  studyroomArea: {
    marginBottom: 20,
    padding: 15,
    backgroundColor: '#fff',
    borderRadius: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 4.65,
    elevation: 7,
  },
  infoText: {
    marginBottom: 10,
  },
  studyroomName: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 5,
  },
  studyroomHeadcount: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  labelText: {
    fontSize: 16,
    color: '#333',
  },
  numText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  selectArea: {
    flexDirection: 'row',
  },
  imageArea: {
    marginRight: 20,
  },
  image: {
    width: 120,
    height: 120,
    borderRadius: 10,
  },
  timeArea: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    flex: 1,
  },
  timeBox: {
    width: 60,
    paddingVertical: 10,
    margin: 3,
    alignItems: 'center',
    backgroundColor: '#e0e0e0',
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 1.41,
    elevation: 2,
  },
  reservedTimeBox: {
    backgroundColor: '#d9534f', // 예약된 시간대 배경색 (빨간색)
  },
  selectedTimeBox: {
    backgroundColor: '#5cb85c', // 선택된 시간대 배경색 (녹색)
  },
  timeText: {
    color: '#333',
    fontSize: 16,
    fontWeight: 'bold',
  },
  reservedTimeText: {
    color: '#fff', // 예약된 시간대 텍스트 색상 (흰색)
  },
  selectedTimeText: {
    color: '#fff', // 선택된 시간대 텍스트 색상 (흰색)
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 20,
    backgroundColor: 'transparent', // 배경을 투명하게 설정
    alignItems: 'center',
  },
  reserveButton: {
    paddingVertical: 15,
    paddingHorizontal: 50,
    backgroundColor: '#007BFF', // 예약 버튼 배경색 (파란색)
    borderRadius: 30,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  reserveButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  // 커스텀 모달 스타일
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)', // 반투명 검은색 배경
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    width: '85%',
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 25,
    alignItems: 'center',
    elevation: 10,
  },
  successModal: {
    borderColor: 'white',
    borderWidth: 2,
  },
  errorModal: {
    borderColor: 'white',
    borderWidth: 2,
  },
  modalIcon: {
    marginBottom: 15,
  },
  modalTitle: {
    fontSize: 30,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#333',
    textAlign: 'center',
  },
  modalMessage: {
    fontSize: 18,
    color: '#555',
    textAlign: 'center',
    marginBottom: 5
  },
  modalButton: {
    backgroundColor: '#4CAF50',
    paddingVertical: 10,
    paddingHorizontal: 30,
    borderRadius: 10,
    marginTop: 10,
    elevation: 5,
  },
  modalButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default StudyRoomScreen;
