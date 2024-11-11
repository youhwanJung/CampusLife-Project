import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  Dimensions,
  Text,
  Image,
  ScrollView,
  TouchableOpacity,
  Modal,
  Alert,
} from 'react-native';
import Swiper from 'react-native-swiper';
import { Picker } from '@react-native-picker/picker';
import { useFocusEffect } from '@react-navigation/native';
import {
  UserData,
  AdminEventList,
  UserSendEventWithPhoto,
  UserSendEventPhotoData,
} from '../../types/type';
import config from '../../config';
import IconA from 'react-native-vector-icons/MaterialIcons';

// 화면의 너비를 가져옵니다.
const width = Dimensions.get('window').width;

/**
 * 이벤트 참가자를 확인하고 관리하는 컴포넌트입니다.
 */
const ParticipantEvent = ({ route }: any) => {
  const { userdata } = route.params;

  // 상태 관리
  const [userData, setUserData] = useState<UserData>(userdata); // 유저 데이터
  const [modalVisible, setModalVisible] = useState(false); // 이미지 모달 표시 여부
  const [selectedImageIndex, setSelectedImageIndex] = useState(0); // 선택된 이미지 인덱스
  const [selectedEventImages, setSelectedEventImages] = useState<UserSendEventPhotoData[]>([]); // 선택된 이벤트 이미지들
  const [selectedEventId, setSelectedEventId] = useState(); // 선택된 이벤트 ID
  const [userSendEventData, setUserSendEventData] = useState<UserSendEventWithPhoto[]>([]); // 유저가 제출한 이벤트 데이터
  const [eventList, setEventList] = useState<AdminEventList[]>([]); // 이벤트 리스트
  const [successModalVisible, setSuccessModalVisible] = useState(false); // 성공 모달 표시 여부

  // 화면에 포커스될 때마다 데이터 가져오기
  useFocusEffect(
    React.useCallback(() => {
      const fetchData = async () => {
        try {
          setUserData(userdata);
          await GetEventList(); // 이벤트 리스트 가져오기
          await GetUserSendEvent(); // 유저가 제출한 이벤트 데이터 가져오기
        } catch (error) {
          console.error('Error fetching data:', error);
        }
      };
      fetchData();
    }, [])
  );

  /**
   * 이벤트 리스트를 서버로부터 가져옵니다.
   */
  const GetEventList = async () => {
    try {
      const response = await fetch(`${config.serverUrl}/GetEventList`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ campus_id: userData.campus_pk }),
      });
      const data = await response.json();
      setEventList(data);
      setSelectedEventId(data[0].event_id); // 첫 번째 이벤트를 기본 선택
    } catch (error) {
      console.error(error);
    }
  };

  /**
   * 유저가 제출한 이벤트 데이터를 서버로부터 가져옵니다.
   */
  const GetUserSendEvent = async () => {
    try {
      const response = await fetch(`${config.serverUrl}/GetUserSendEvent`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ campus_id: userData.campus_pk }),
      });
      const data = await response.json();

      // 각 이벤트 데이터에 해당하는 사진 데이터를 추가로 가져옵니다.
      const UserSendEventWithPhoto = await Promise.all(
        data.map(async (eventData: any) => {
          const photoData = await GetUserEventPhoto(eventData.event_id, eventData.user_id);
          return { ...eventData, photodata: photoData };
        })
      );
      setUserSendEventData(UserSendEventWithPhoto);
    } catch (error) {
      console.error(error);
    }
  };

  /**
   * 유저가 제출한 이벤트 사진 데이터를 서버로부터 가져옵니다.
   * @param event_id 이벤트 ID
   * @param user_id 유저 ID
   */
  const GetUserEventPhoto = async (event_id: any, user_id: any) => {
    try {
      const response = await fetch(`${config.serverUrl}/GetUserEventPhoto`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ event_id: event_id, user_id: user_id }),
      });
      const data = await response.json();
      return data;
    } catch (error) {
      console.error(error);
    }
  };

  /**
   * 관리자 권한으로 유저에게 포인트를 부여합니다.
   * @param user_id 유저 ID
   * @param event_point 이벤트 포인트
   */
  const AdminSendPoint = async (user_id: any, event_point: any) => {
    try {
      const response = await fetch(`${config.serverUrl}/AdminSendPoint`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_id: user_id, event_point: event_point }),
      });
      const data = await response.json();
      return data;
    } catch (error) {
      console.error(error);
    }
  };

  // 알람 카운트 업데이트
  const UpdateAramCount = async (user_id : number) => {
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


  /**
   * 유저에게 당첨 알림을 보냅니다.
   * @param user_id 유저 ID
   * @param event_id 이벤트 ID
   */
  const addGoodEventAram = async (user_id: number, event_id: number) => {
    try {
      const response = await fetch(`${config.serverUrl}/addGoodEventAram`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_id: user_id, target_id: event_id }),
      });
      await UpdateAramCount(user_id);
    } catch (error) {
      console.error('알람 전송 실패', error);
    }
  };

  /**
   * 유저의 이벤트 참여 상태를 업데이트합니다.
   * @param user_send_event 유저가 제출한 이벤트 ID
   */
  const setUserSendtype = async (user_send_event: number) => {
    try {
      const response = await fetch(`${config.serverUrl}/setUserSendtype`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_send_event: user_send_event }),
      });
    } catch (error) {
      console.error(error);
    }
  };

  /**
   * 이벤트 포인트 히스토리를 추가합니다.
   * @param user_id 유저 ID
   * @param content 내용
   * @param point_num 포인트 수
   */
  const AddEventPointHistory = async (user_id: any, content: any, point_num: any) => {
    try {
      const response = await fetch(`${config.serverUrl}/AddEventPointHistory`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ point_num: point_num, content: content, user_id: user_id }),
      });
    } catch (error) {
      console.error('알람 전송 실패', error);
    }
  };

  /**
   * 이벤트 이름을 가져옵니다.
   * @param event 이벤트 객체
   * @returns 이벤트 이름
   */
  const get_event_name = (event: any) => {
    return eventList.find(item => item.event_id === event.event_id)?.name;
  };

  /**
   * 성공 모달을 표시합니다.
   */
  const showSuccessModal = () => {
    setSuccessModalVisible(true);
  };

  /**
   * 성공 모달을 닫습니다.
   */
  const closeSuccessModal = () => {
    setSuccessModalVisible(false);
  };

  /**
   * 유저에게 포인트를 부여하고 알림을 보냅니다.
   * @param user_id 유저 ID
   * @param event_point 이벤트 포인트
   * @param event_id 이벤트 ID
   * @param user_send_event 유저가 제출한 이벤트 ID
   * @param event 이벤트 객체
   */
  const handlePrizeUser = (
    user_id: number,
    event_point: number,
    event_id: number,
    user_send_event: number,
    event: any
  ) => {
    const event_name = get_event_name(event);
    Alert.alert('이벤트 당첨!', '해당 유저에게 포인트를 부여하시겠습니까?', [
      { text: '취소', style: 'cancel' },
      {
        text: '확인',
        onPress: async () => {
          try {
            await addGoodEventAram(user_id, event_id); // 알림 전송
            await AdminSendPoint(user_id, event_point); // 포인트 부여
            await AddEventPointHistory(user_id, event_name, event_point); // 포인트 히스토리 추가
            await setUserSendtype(user_send_event); // 유저 이벤트 상태 업데이트
            await GetUserSendEvent(); // 유저 이벤트 데이터 다시 가져오기
            showSuccessModal(); // 성공 모달 표시
          } catch (error) {
            console.error('요청 중 오류가 발생했습니다:', error);
          }
        },
      },
    ]);
  };

  /**
   * 이미지 클릭 시 모달을 열어줍니다.
   * @param index 선택된 이미지 인덱스
   * @param images 이미지 배열
   */
  const handleImagePress = (index: any, images: any) => {
    setSelectedImageIndex(index);
    setSelectedEventImages(images);
    setModalVisible(true);
  };

  /**
   * 모달을 닫습니다.
   */
  const handleCloseModal = () => {
    setModalVisible(false);
    setSelectedImageIndex(0);
    setSelectedEventImages([]);
  };

  /**
   * 이벤트 이름이 길 경우 자릅니다.
   * @param name 이벤트 이름
   * @returns 자른 이벤트 이름
   */
  const truncateEventName = (name: string) => {
    return name.length > 20 ? name.substring(0, 20) + '...' : name;
  };

  // 선택된 이벤트의 참여자들만 필터링합니다.
  const filteredEvents = userSendEventData.filter(event => event.event_id === selectedEventId);

  return (
    <View style={styles.container}>
      {/* 이벤트 선택 영역 */}
      <View style={styles.pickerArea}>
        <Text style={styles.pickerLabel}>선택한 이벤트 :</Text>
        <View style={styles.pickerBox}>
          <Picker
            selectedValue={selectedEventId}
            onValueChange={(itemValue) => setSelectedEventId(itemValue)}
            style={styles.picker}
            dropdownIconColor={'#6a11cb'}
          >
            {eventList.map(event => (
              <Picker.Item
                key={event.event_id}
                label={truncateEventName(event.name)}
                value={event.event_id}
                style={{ color: '#333' }}
              />
            ))}
          </Picker>
        </View>
      </View>

      {/* 참여자 리스트 */}
      {filteredEvents.length > 0 ? (
        <ScrollView contentContainerStyle={styles.participantList}>
          {filteredEvents.map((event, index) =>
            event.good_event === 1 ? (
              // 이미 포인트를 받은 유저
              <TouchableOpacity
                key={index}
                style={styles.goodEventBox}
                onPress={() => {
                  console.log(event.user_name);
                  console.log(event.event_point);
                }}
              >
                <View style={styles.topInfoArea}>
                  <Text style={styles.eventName}>
                    {eventList.find(item => item.event_id === event.event_id)?.name}
                  </Text>
                  <View style={styles.userInfoArea}>
                    <Text style={styles.userInfoText}>이름: {event.user_name}</Text>
                    <Text style={styles.userInfoText}>아이디: {event.user_login_id}</Text>
                  </View>
                </View>
                <Text style={styles.sendText}>{event.content}</Text>
                <View style={styles.congratsArea}>
                  <Text style={styles.congratsText}>해당 유저가 이벤트에 당첨되었습니다!</Text>
                  <IconA name={'celebration'} size={50} style={{ color: '#FF7F27' }} />
                </View>
              </TouchableOpacity>
            ) : (
              // 아직 포인트를 받지 않은 유저
              <TouchableOpacity
                key={index}
                style={styles.eventBox}
                onLongPress={() => {
                  handlePrizeUser(
                    event.user_id,
                    event.event_point,
                    event.event_id,
                    event.user_send_event,
                    event
                  );
                }}
              >
                <View style={styles.topInfoArea}>
                  <Text style={styles.eventName}>
                    {eventList.find(item => item.event_id === event.event_id)?.name}
                  </Text>
                  <View style={styles.userInfoArea}>
                    <Text style={styles.userInfoText}>이름: {event.user_name}</Text>
                    <Text style={styles.userInfoText}>아이디: {event.user_login_id}</Text>
                  </View>
                </View>

                <Text style={styles.sendText}>{event.content}</Text>
                {/* 이미지 리스트 */}
                {event.photodata && event.photodata.length > 0 && (
                  <ScrollView horizontal style={styles.imageContainer}>
                    {event.photodata.map((file, idx) => (
                      <TouchableOpacity
                        key={idx}
                        onPress={() => {
                          handleImagePress(idx, event.photodata);
                        }}
                      >
                        <Image
                          source={{ uri: `${config.photoUrl}/${file.event_photo}.png` }}
                          style={styles.image}
                        />
                      </TouchableOpacity>
                    ))}
                  </ScrollView>
                )}
              </TouchableOpacity>
            )
          )}
        <View style={{height: 80}}></View>
        </ScrollView>
      ) : (
        <Text style={styles.noEventText}>해당 이벤트 참여자가 없습니다.</Text>
      )}

      {/* 이미지 모달 */}
      <Modal
        visible={modalVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={handleCloseModal}
      >
        <View style={styles.modalBackground}>
          <TouchableOpacity style={styles.modalCloseButton} onPress={handleCloseModal}>
            <IconA name="close" size={30} color="#fff" />
          </TouchableOpacity>
          <View style={styles.modalContent}>
            <Swiper index={selectedImageIndex} loop={false}>
              {selectedEventImages.map((image, idx) => (
                <View key={idx} style={styles.slide}>
                  <Image
                    source={{ uri: `${config.photoUrl}/${image.event_photo}.png` }}
                    style={styles.modalImage}
                  />
                </View>
              ))}
            </Swiper>
          </View>
        </View>
      </Modal>

      {/* 성공 모달 */}
      <Modal
        visible={successModalVisible}
        transparent={true}
        animationType="slide"
        onRequestClose={closeSuccessModal}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.successModal}>
            <IconA name={'check-circle'} size={80} color="#6a11cb" />
            <Text style={styles.successTitle}>포인트 전송 성공!</Text>
            <Text style={styles.successMessage}>
              해당 유저에게 포인트가 전송되었습니다.{'\n'}
              해당 유저에게 자동으로 알람이 가게 됩니다!
            </Text>
            <TouchableOpacity style={styles.closeButton} onPress={closeSuccessModal}>
              <Text style={styles.closeButtonText}>확인</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
};

// 스타일 정의
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f7f7f7',
  },
  pickerArea: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    paddingHorizontal: 15,
    paddingVertical: 10,
    elevation: 2,
    marginBottom: 10,
  },
  pickerLabel: {
    fontSize: 16,
    color: '#333',
    marginRight: 10,
    fontWeight: 'bold',
  },
  pickerBox: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
  },
  picker: {
    width: '100%',
  },
  participantList: {
    paddingHorizontal: 10,
  },
  eventBox: {
    backgroundColor: '#fff',
    borderRadius: 12,
    marginBottom: 15,
    padding: 15,
    elevation: 3,
  },
  goodEventBox: {
    backgroundColor: '#FFFBEA',
    borderRadius: 12,
    marginBottom: 15,
    padding: 15,
    elevation: 3,
  },
  topInfoArea: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  eventName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'black',
    maxWidth: '80%',
  },
  userInfoArea: {
    alignItems: 'flex-end',
  },
  userInfoText: {
    fontSize: 14,
    color: '#333',
  },
  sendText: {
    marginTop: 10,
    fontSize: 15,
    color: '#555',
  },
  imageContainer: {
    marginTop: 10,
  },
  image: {
    width: 80,
    height: 80,
    marginRight: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  congratsArea: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 10,
  },
  congratsText: {
    fontSize: 16,
    color: '#FF7F27',
    fontWeight: 'bold',
    marginRight: 10,
  },
  noEventText: {
    textAlign: 'center',
    marginTop: 50,
    fontSize: 16,
    color: '#999',
  },
  modalBackground: {
    flex: 1,
    backgroundColor: '#000',
  },
  modalCloseButton: {
    position: 'absolute',
    top: 40,
    right: 20,
    zIndex: 1,
  },
  modalContent: {
    flex: 1,
  },
  slide: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalImage: {
    width: width,
    height: width,
    resizeMode: 'contain',
  },
  // 성공 모달 스타일
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  successModal: {
    width: '80%',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    alignItems: 'center',
  },
  successTitle: {
    fontSize: 24,
    color: '#6a11cb',
    fontWeight: 'bold',
    marginTop: 20,
  },
  successMessage: {
    fontSize: 16,
    color: '#333',
    textAlign: 'center',
    marginVertical: 20,
    lineHeight: 24,
  },
  closeButton: {
    backgroundColor: '#6a11cb',
    paddingVertical: 10,
    paddingHorizontal: 30,
    borderRadius: 8,
  },
  closeButtonText: {
    color: '#fff',
    fontSize: 16,
  },
});

export default ParticipantEvent;
