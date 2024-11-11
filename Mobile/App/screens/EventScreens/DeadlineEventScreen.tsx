import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  Image,
  TouchableOpacity,
  Alert,
  ScrollView,
  TextInput,
  Modal,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import DocumentPicker, { DocumentPickerResponse } from 'react-native-document-picker';
import { UserData, EventData, VoteEvnetData } from '../../types/type';
import config from '../../config';
import Ionicons from 'react-native-vector-icons/Ionicons'; // 아이콘 사용을 위해 추가

const width = Dimensions.get('window').width;

type userEvent = {
  user_id: number;
  event_id: number;
};

const DeadlineEventScreen = ({ route, navigation }: any) => { // Added navigation prop
  const { userdata, eventdata } = route.params;

  const [maintext, setMainText] = useState('');
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedImage, setSelectedImage] = useState<null | string>(null);
  const [selectedFiles, setSelectedFiles] = useState<DocumentPickerResponse[]>([]);
  const [userData, setUserData] = useState<UserData>(userdata);
  const [eventData, setEventData] = useState<EventData>(eventdata);
  const [usereventData, setUserEventData] = useState<userEvent[]>([]);
  const [checked, setChecked] = useState('');
  const [voteOptions, setVoteOptions] = useState<string[]>();

  useFocusEffect(
    React.useCallback(() => {
      const fetchData = async () => {
        try {
          settingDate();
          await GetoneEventVote();
        } catch (error) {
          console.error('Error fetching data:', error);
        }
      };
      fetchData();
    }, [])
  );

  const GetoneEventVote = async () => {
    try {
      const response = await fetch(`${config.serverUrl}/GetoneEventVote`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ event_id: eventData.event_id }),
      });
      const data: VoteEvnetData[] = await response.json();
      const voteInfo: VoteEvnetData[] = data.filter((info) => info.vote_name !== 'null');
      setVoteOptions(voteInfo.map((info) => info.vote_name));
    } catch (error) {
      console.error(error);
    }
  };

  const SendUserEventVote = async () => {
    try {
      const response = await fetch(`${config.serverUrl}/SendUserEventVote`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ event_id: eventData.event_id, vote_name: checked }),
      });
      await response.json();
    } catch (error) {
      console.error(error);
    }
  };

  const settingDate = () => {
    setUserData(userData);
    setEventData(eventdata);
  };

  const handleMainTextChange = (inputText: string) => {
    setMainText(inputText);
  };

  const handleImagePress = (image: string) => {
    setSelectedImage(image);
    setModalVisible(true);
  };

  const handleFilePick = async () => {
    try {
      const res = await DocumentPicker.pick({ type: [DocumentPicker.types.allFiles] });
      if (selectedFiles.length < 5) {
        setSelectedFiles([...selectedFiles, res[0]]);
      } else {
        Alert.alert('파일은 최대 5개까지 첨부할 수 있습니다.');
      }
    } catch (err) {
      if (!DocumentPicker.isCancel(err)) {
        throw err;
      }
    }
  };

  const uploadAllFiles = async () => {
    const formData = new FormData();
    selectedFiles.forEach((file) => {
      formData.append('images', {
        uri: file.uri,
        type: file.type,
        name: `${Date.now()}_${userData.user_pk}_${eventData.event_id}.png`,
      });
    });


    // 파일 업로드 함수 호출
    await uploadImages(formData);


    // 업로드 완료 후 파일 목록 초기화
    setSelectedFiles([]);
  };

  const uploadImages = async (formData: FormData) => {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000);
      const response = await fetch(`${config.serverUrl}/send_user_event_photo`, {
        method: 'POST',
        body: formData,
      });
      clearTimeout(timeoutId);
      await response.text();
    } catch (error) {
      console.error('이미지 업로드 중 오류:', error);
    }
  };

  const send_user_event_info = async () => {
    try {
      await fetch(`${config.serverUrl}/send_user_event_info`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_id: userData.user_pk, event_id: eventData.event_id, content: maintext }),
      });
    } catch (error) {
      console.error(error);
    }
  };

  const send_event_alert = async () => {
    let hasRegistered = false;
    usereventData.forEach((data) => {
      if (data.user_id === userData.user_pk && data.event_id === eventData.event_id) {
        hasRegistered = true;
      }
    });

    if (hasRegistered) {
      Alert.alert('이미 이벤트를 등록하셨습니다.');
    } else {
      Alert.alert('이벤트 작성완료', `이벤트를 성공적으로 작성하셨습니다.\n종료 일자: ${eventData.close_date}`, [
        {
          text: '확인',
          onPress: async () => {
            await send_user_event_info();
            await SendUserEventVote();
            if (selectedFiles.length > 0) {
              await uploadAllFiles();
            }
            setUserEventData([...usereventData, { user_id: userData.user_pk, event_id: eventData.event_id }]);
            navigation.navigate("MainScreen"); // Navigate to MainScreen after submission
          },
        },
      ]);
    }
  };

  const handleFileRemove = (index: number) => {
    const updatedFiles = selectedFiles.filter((_, i) => i !== index);
    setSelectedFiles(updatedFiles);
  };

  return (
    <View style={styles.container}>
      <ScrollView>
        {/* 이벤트 헤더 */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>{eventData?.name}</Text>
          <Text style={styles.cardSubtitle}>{`종료 날짜: ${eventData?.close_date}`}</Text>
        </View>

        {/* 이벤트 이미지 */}
        <View style={styles.eventImageArea}>
          <ScrollView horizontal pagingEnabled>
            {eventData.event_photo.map((image, index) => (
              <TouchableOpacity
                key={index}
                style={styles.eventImageBox}
                onPress={() => handleImagePress(image.event_photo)}
              >
                <Image
                  style={styles.eventImage}
                  source={{ uri: `${config.photoUrl}/${image.event_photo}.png` }}
                  resizeMode="cover"
                />
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* 이벤트 정보 */}
        <View style={styles.card}>
          <Text style={styles.infoTitle}>{eventData?.simple_info}</Text>
          <Text style={styles.infoText}>{eventData?.info}</Text>
        </View>

        {/* 투표 옵션 */}
        {voteOptions && voteOptions.length > 0 && (
          <View style={styles.voteGroup}>
            {voteOptions.map((option, index) => (
              <TouchableOpacity
                key={index}
                style={styles.voteOption}
                onPress={() => setChecked(option)}
              >
                <View style={styles.radioCircle}>
                  {checked === option && <View style={styles.selectedRb} />}
                </View>
                <Text style={styles.voteOptionText}>{`${index + 1}. ${option}`}</Text>
              </TouchableOpacity>
            ))}
          </View>
        )}

        {/* 파일 첨부 및 텍스트 입력 */}
        {(!voteOptions || voteOptions.length === 0) && (
          <>
            <View style={styles.fileInputArea}>
              <TouchableOpacity style={styles.button} onPress={handleFilePick}>
                <Ionicons name="attach" size={20} color="#fff" />
                <Text style={styles.buttonText}>파일 첨부</Text>
              </TouchableOpacity>
              {selectedFiles.map((file, index) => (
                <View key={index} style={styles.fileInfo}>
                  <Ionicons name="document" size={24} />
                  <Text style={styles.fileName}>{file.name}</Text>
                  <TouchableOpacity onPress={() => handleFileRemove(index)}>
                    <Ionicons name="close" size={20} />
                  </TouchableOpacity>
                </View>
              ))}
            </View>

            <TextInput
              placeholder="내용 입력"
              multiline
              numberOfLines={6}
              value={maintext}
              onChangeText={handleMainTextChange}
              style={styles.textInput}
            />
          </>
        )}

        {/* 전송 버튼 */}
        <TouchableOpacity style={styles.sendButton} onPress={send_event_alert}>
          <Text style={styles.sendButtonText}>전송</Text>
        </TouchableOpacity>
      </ScrollView>

      {/* 이미지 모달 */}
      <Modal visible={modalVisible} transparent onRequestClose={() => setModalVisible(false)}>
        <View style={styles.modalContainer}>
          <Image
            style={styles.modalImage}
            source={{ uri: `${config.photoUrl}/${selectedImage}.png` }}
            resizeMode="contain"
          />
          <TouchableOpacity style={styles.modalCloseButton} onPress={() => setModalVisible(false)}>
            <Ionicons name="close" size={30} color="#fff" />
          </TouchableOpacity>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fafafa',
  },
  card: {
    alignSelf: 'center',
    backgroundColor: '#fff',
    padding: 15,
    marginVertical: 10,
    borderRadius: 10,
    elevation: 5,
    width: '95%'
  },
  cardTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'black'
  },
  cardSubtitle: {
    fontSize: 16,
    color: '#777',
    marginTop: 5,
  },
  infoTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
    color: 'black'
  },
  infoText: {
    fontSize: 16,
    color: '#333',
    alignSelf: 'center'
  },
  eventImageArea: {
    width: width * 0.95,
    height: width * 0.95,
    backgroundColor: 'white',
    alignSelf: 'center',
    elevation: 10,
  },
  eventImageBox: {
    width: width * 0.95,
    height: '100%',
  },
  eventImage: {
    width: '100%',
    height: '100%',
    borderRadius: 10,
  },
  modalContainer: {
    backgroundColor: 'rgba(0, 0, 0, 0.85)',
    alignItems: 'center',
    justifyContent: 'center',
    height: '100%',
  },
  modalImage: {
    width: width * 0.9,
    height: width * 0.9,
  },
  modalCloseButton: {
    position: 'absolute',
    top: 30,
    right: 10,
  },
  voteGroup: {
    marginVertical: 10,
  },
  voteOption: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
  },
  radioCircle: {
    height: 20,
    width: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#2e64e5',
    alignItems: 'center',
    justifyContent: 'center',
  },
  selectedRb: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#2e64e5',
  },
  voteOptionText: {
    marginLeft: 10,
    fontSize: 16,
  },
  fileInputArea: {
    paddingHorizontal: 15,
    marginTop: 20,
  },
  button: {
    flexDirection: 'row',
    backgroundColor: '#2e64e5',
    padding: 10,
    borderRadius: 5,
    alignItems: 'center',
    width: 120,
  },
  buttonText: {
    color: '#fff',
    marginLeft: 5,
  },
  fileInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 10,
  },
  fileName: {
    flex: 1,
    marginLeft: 10,
    fontSize: 16,
  },
  textInput: {
    marginHorizontal: 15,
    marginTop: 20,
    backgroundColor: 'white',
    padding: 10,
    textAlignVertical: 'top',
    borderRadius: 5,
    borderWidth: 1,
    borderColor: '#ccc',
  },
  sendButton: {
    backgroundColor: '#2e64e5',
    padding: 15,
    margin: 20,
    borderRadius: 5,
    alignItems: 'center',
  },
  sendButtonText: {
    color: '#fff',
    fontSize: 18,
  },
});

export default DeadlineEventScreen;
