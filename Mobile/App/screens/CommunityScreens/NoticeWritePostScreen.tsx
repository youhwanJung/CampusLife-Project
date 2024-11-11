import React, { useState, useEffect, useRef } from 'react';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { Text, View, Button, StyleSheet, Dimensions, TouchableOpacity, TextInput, ScrollView, Alert, Image, FlatList } from 'react-native';
import IconB from 'react-native-vector-icons/AntDesign';
import IconC from 'react-native-vector-icons/FontAwesome';
import IconFontAwesome from 'react-native-vector-icons/FontAwesome'; // FontAwesome 아이콘 컴포넌트
import Clipboard from '@react-native-clipboard/clipboard';
import IconCancel from 'react-native-vector-icons/AntDesign';
import Modal from 'react-native-modal';
import ModalBox from 'react-native-modalbox';
import { UserData } from '../../types/type'
import config from '../../config';
import { launchImageLibrary } from 'react-native-image-picker';
import LottieView from 'lottie-react-native';
import Icon from 'react-native-vector-icons/Octicons';

const { width, height } = Dimensions.get('window');

const EmptyMainText = () => {
  const content =
    "\n\n\n" +
    "캠퍼스라이프는 누구나 기분 좋게 참여할 수 있는 커뮤니티를 만들기 위해 커뮤니티 이용규칙을 제정하여 운영하고 있습니다. 위반 시 게시물이 삭제되고 서비스 이용이 일정 기간 제한될 수 있습니다." +
    "\n\n정치·사회 관련 행위 금지\n\n국가기관, 정치 관련 단체, 언론, 시민단체에 대한 언급 혹은 이와 관련한 행위" +
    "\n정책·외교 또는 정치·정파에 대한 의견, 주장 및 이념, 가치관을 드러내는 행위\n성별, 종교, 인종, 출신, 지역, 직업, 이념 등 사회적 이슈에 대한 언급 혹은 이와 관련한 행위" +
    "\n위와 같은 내용으로 유추될 수 있는 비유, 은어 사용 행위\n영리 여부와 관계 없이 사업체·기관·단체·개인에게 직간접적으로 영향을 줄 수 있는 게시물 작성 행위\n불법촬영물 유통 금지\n불법촬영물등을 게재할 경우 전기통신사업법에 따라 삭제 조치 및 서비스 이용이 영구적으로 제한될 수 있으며 관련 법률에 따라 처벌받을 수 있습니다." +
    "\n\n그 밖의 규칙 위반\n타인의 권리를 침해하거나 불쾌감을 주는 행위\n범죄, 불법 행위 등 법령을 위반하는 행위\n욕설, 비하, 차별, 혐오, 자살, 폭력 관련 내용을 포함한 게시물 작성 행위\n음란물, 성적 수치심을 유발하는 행위\n스포일러, 공포, 속임, 놀라게 하는 행위"

  return (
    <View style={{ padding: 6 }}>
      <Text>
        {content}
      </Text>
    </View>
  );
};


const WritePostPage: React.FC = ({ navigation, route }: any) => {
  console.log("you are in NoticeWritePostScreen")
  const { userdata } = route.params;
  const [isModalOpen, setIsModalOpen] = useState(false); // 모달의 열기/닫기 상태를 useState로 관리
  const [selectallposter, setselectapllposterOption] = useState(0); // 선택된 옵션의 인덱스를 useState로 관리
  const [selectdepartmentposter, setselectdepartmentposter] = useState(0); // 선택된 옵션의 인덱스를 useState로 관리
  const [selectcontestposter, setSelectContestPoster] = useState(0);
  const [postfontoption, setpostfontoption] = useState("게시판을 정해주세요");
  const [titletext, settitleText] = useState('');
  const [urltext, seturlText] = useState('');
  const [sourcestext, setSourcesText] = useState('');
  const [maintext, setmainText] = useState('');
  const [userData, setUserData] = useState<UserData>(userdata);
  const [selectedImages, setSelectedImages] = useState<any[]>([]); // 선택된 이미지
  const [selectedFormImages, setSelectedFormImages] = useState<FormData[]>([]); // 선택된 이미지를 폼데이터에 저장
  const [isModalVisible, setIsModalVisible] = useState(false);

  const forceUpdate = React.useReducer(() => ({}), {})[1];

  useFocusEffect(
    React.useCallback(() => {
      changeHeaderRightContent();
    }, [selectdepartmentposter, titletext, maintext, urltext, sourcestext, selectedFormImages])
  );

  const goback = () => {
    navigation.goBack();
  };

  useEffect(() => {
    if (userData.title !== "일반학생" && userData.title !== "학교") {
      setselectdepartmentposter(1); // Default to department notice
      setselectapllposterOption(0);
      setpostfontoption("학과 공지사항");
    } else {
      // Compare selectallposter and selectdepartmentposter to set postfontoption
      if (selectallposter === 1) {
        setpostfontoption("학교 공지사항");
      } else if (selectdepartmentposter === 1) {
        setpostfontoption("학과 공지사항");
      } else if (selectcontestposter === 1) {
        setpostfontoption("공모전 게시판");
      } else {
        setpostfontoption("게시판을 정해주세요");
      }
    }
  }, [selectallposter, selectdepartmentposter, selectcontestposter, userData.title]);

  const openModal = () => {
    setIsModalOpen(true); // 모달을 열기 위해 상태를 true로 설정
  };

  const closeModal = () => {
    setIsModalOpen(false); // 모달을 닫기 위해 상태를 false로 설정
  };

  const handleAllPosterPress = () => {
    setselectapllposterOption(1);
    setselectdepartmentposter(0);
    setSelectContestPoster(0);
    setSourcesText('');
    seturlText('');
  };

  const handleDepartmentPosterPress = () => {
    setselectapllposterOption(0);
    setselectdepartmentposter(1);
    setSelectContestPoster(0);
    setSourcesText('');
    seturlText('');
  };

  const handleContestPosterPress = () => {
    setselectapllposterOption(0);
    setselectdepartmentposter(0);
    setSelectContestPoster(1);
  };

  const handletitleTextChange = (inputText: string) => {
    settitleText(inputText);
  };

  const handleurlTextChange = (inputText: string) => {
    seturlText(inputText);
  };

  const handlesorceTextChange = (inputText: string) => {
    setSourcesText(inputText);
  };

  const handlemainTextChange = (inputText: string) => {
    setmainText(inputText);
  };

  const pasteFromClipboard = async () => {
    const clipboardContent = await Clipboard.getString();
    seturlText(clipboardContent);
  };

  const changeHeaderRightContent = () => {
    navigation.setOptions({
      headerRight: () => (
        <TouchableOpacity onPress={async () => {
          if (selectcontestposter === 1 && selectedImages.length > 1) {
            contest_photo_no();
          } else {
            const post_id = await write_post();
            const post_id_int = parseInt(post_id.postId);
            const imageGroup = await uploadImages();
            await RegistorPostPhoto(post_id_int, imageGroup); //포스트 사진 등록
            ok_go();
          }

        }}>
          <View style={{ flexDirection: 'row', backgroundColor: '#B20000', justifyContent: 'center', alignItems: 'center', width: 65, height: 35, borderRadius: 20, marginRight: 10 }}>
            <Text style={{ color: 'white', fontSize: 17, fontWeight: "bold" }}>완료</Text>
          </View>
        </TouchableOpacity>
      )
    });
  };

  const ok_go = () => {
    Alert.alert(
      "게시물 작성",
      "게시물 작성을 완료했습니다!",
      [
        { text: "확인", onPress: () => goback() }
      ]
    );
  };

  const contest_photo_no = () => {
    Alert.alert(
      "공모전 작성 실패",
      "공모전 작성 사진은 하나만 들어갈 수 있습니다.",
      [
        { text: "확인" }
      ]
    );
  };

  //사진 등록 함수 프로시저 사용할거임
  const RegistorPostPhoto = async (post_id: number, post_photo: any) => {
    try {
      const response = await fetch(`${config.serverUrl}/RegistorPostPhoto`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          post_id: post_id,
          post_photo: post_photo
        }),
      })
      await response.json();
    } catch (error) {
      console.error(error);
    } finally {
    }
  }

  const adminCheck = () => {
    if (userData.title === "일반학생") {
      return 0;
    } else {
      return 1;
    }
  }

  const updateAllAramCounts = async () => {
    try {
      // 모든 학생의 user_id를 가져오기
      const response = await fetch(`${config.serverUrl}/getAllUserIds`);
      const data = await response.json();
  
      if (data && data.userIds && data.userIds.length > 0) {
        // 각 user_id에 대해 UpdateAramCount 호출
        for (const userId of data.userIds) {
          await UpdateAramCount(userId); // userId를 파라미터로 전달
        }
      } else {
        console.log('유저가 없습니다.');
      }
    } catch (error) {
      console.error('유저 ID 가져오기 실패:', error);
    }
  };

  const UpdateAramCount = async (userId: any) => {
    try {
      await fetch(`${config.serverUrl}/update_aram_count`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: userId // 각 userId로 전송
        })
      });
    } catch (error) {
      console.error('알람 카운트 업데이트 실패', error);
    }
  };

  const addSchoolNoticeAram = async (value: number) => {
    try {
      const response = await fetch(`${config.serverUrl}/addSchoolNoticeAram`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          target_id: value
        })
      });
      //await UpdateAramCount();
    } catch (error) {
      console.error('알람 전송 실패', error);
    }
  }


  const addDepartmentNoticeAram = async (value: number) => {
    try {
      const response = await fetch(`${config.serverUrl}/addDepartmentNoticeAram`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          target_id: value
        })
      });
      //await UpdateAramCount();
    } catch (error) {
      console.error('알람 전송 실패', error);
    }
  }


  const write_post = async () => {
    try {
      const response = await fetch(`${config.serverUrl}/write_post`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          user_id: userData.user_pk,
          department_check: selectdepartmentposter,
          inform_check: adminCheck(),
          contest_check: selectcontestposter,
          Club_check: 0,
          title: titletext,
          contents: maintext,
          url: urltext,
          sources: sourcestext
        })
      });
      const value = await response.json();
      if (selectdepartmentposter === 0) {
        await addSchoolNoticeAram(value.postId);
        return value;
      } else if (selectdepartmentposter === 1) {
        await addDepartmentNoticeAram(value.postId);
        return value;
      }

    } catch (error) {
      console.error('게시글 쓰기 실패!', error);
    }
  }

  // 이미지 선택 함수
  const handleImagePick = () => {
    launchImageLibrary({ mediaType: 'photo', selectionLimit: 10 - selectedImages.length }, (response) => {
      if (response.assets) {
        const newSelectedImage = [...selectedImages, ...response.assets];
        setSelectedImages(newSelectedImage);
        const formDataArray = newSelectedImage.map((image, index) => {
          const formData = new FormData();
          const fileNameWithoutExtension = image.fileName.split('.').slice(0, -1).join('.');
          const newFileName = `${Date.now()}_${fileNameWithoutExtension}.png`;
          formData.append('images', {
            uri: image.uri,
            type: image.type,
            name: newFileName,
            index: index,
          });
          return formData;
        });
        setSelectedFormImages(formDataArray);
        forceUpdate();
      } else if (response.errorCode) {
        //console.log('Image picker error: ', response.errorMessage);
      }
    });
  };

  // 이미지 업로드 함수
  const uploadImages = async () => {
    try {
      const uploadedImageDatas = [];
      for (const formData of selectedFormImages) {
        const response = await fetch(`${config.serverUrl}/uploadImages`, {
          method: 'POST',
          body: formData,
        });
        const imageData = await response.json();
        uploadedImageDatas.push(imageData.fileNames[0]);
        if (response.ok) {
          //console.log('Image uploaded successfully');
        } else {
          //console.error('Image upload failed');
        }
      }
      //console.log(uploadedImageDatas);
      return uploadedImageDatas;
    } catch (error) {
      console.error('Error uploading images: ', error);
    }
  };


  // 이미지 삭제 함수
  const handleImageRemove = (index: number) => {
    const updatedImages = selectedImages.filter((_, i) => i !== index);
    setSelectedImages(updatedImages);

    const updatedFormImages = selectedFormImages.filter((_, i) => i !== index);
    setSelectedFormImages(updatedFormImages);
  };

  return (
    <View style={styles.container}>
      <ScrollView>
        <TouchableOpacity onPress={openModal} style={styles.postSelectionArea}>
          <Text style={styles.postSelectionText}>{postfontoption}</Text>
          {userData.title === "학교" && (
            <IconB name="down" size={30} color={'black'} />
          )}
        </TouchableOpacity>
        <View style={styles.titleInputArea}>
          <TextInput
            style={styles.titleInput}
            onChangeText={handletitleTextChange}
            value={titletext}
            placeholder="제목"
            placeholderTextColor={'gray'}
          />
        </View>

        {selectcontestposter === 1 ? (
          // selectcontestposter가 1일 때 렌더링할 내용
          <>
            <View style={[styles.titleInputArea, {justifyContent: 'space-between'}]}>
              <TextInput
                style={styles.titleInput}
                onChangeText={handleurlTextChange}
                value={urltext}
                placeholder="URL 입력"
                placeholderTextColor={'gray'}
              />
              <TouchableOpacity style={{ marginRight: 15 }} onPress={pasteFromClipboard}>
                <Icon name="paste" size={36} color={'black'} />
              </TouchableOpacity>
            </View>
            <View style={styles.titleInputArea}>
              <TextInput
                style={styles.titleInput}
                onChangeText={handlesorceTextChange}
                value={sourcestext}
                placeholder="출처"
                placeholderTextColor={'gray'}
              />
            </View>
          </>
        ) : (
          // selectcontestposter가 1이 아닐 때 렌더링할 내용
          <View style={styles.contentInputArea}>
            <TextInput
              style={styles.contentInput}
              onChangeText={handlemainTextChange}
              value={maintext}
              multiline={true}
              placeholder={"이곳에 글을 입력해 주세요!"}
              placeholderTextColor={'gray'}
            />
            {/* 현재 글자 수 표시 */}
          <Text style={styles.charCountText}>{maintext.length}/500</Text>
          {/* 내용과 이미지가 비어있을 때 안내 텍스트 표시 */}
          {maintext === '' && selectedImages.length === 0 && <EmptyMainText />}
        </View>
        )}
        {/* 이미지 미리보기 영역 */}
        {selectedImages.length > 0 && (
          <View style={styles.imagePreviewArea}>
            <FlatList
              data={selectedImages}
              horizontal
              showsHorizontalScrollIndicator={false}
              snapToAlignment="center" // 이미지 중앙 정렬
              snapToInterval={width - 105} // 스냅 간격을 이미지 너비에 맞춤
              decelerationRate="fast" // 스크롤 속도를 빠르게 하여 자연스럽게 멈춤
              renderItem={({ item, index }) => (
                <View key={index} style={styles.imageCard}>
                  <Image source={{ uri: item.uri }} style={styles.imagePreview} />
                  {/* 이미지 삭제 버튼 */}
                  <TouchableOpacity onPress={() => handleImageRemove(index)} style={styles.cancelButton}>
                    <IconB name="closecircleo" size={22} color={'white'} />
                  </TouchableOpacity>
                  {/* 필요 시 LottieView 애니메이션 추가 가능 */}
                </View>
              )}
              keyExtractor={(item, index) => index.toString()}
            />
          </View>
        )}
      </ScrollView>
      <View style={styles.imageSelectionArea}>
      <TouchableOpacity onPress={handleImagePick} style={styles.imageSelectButton}>
          <IconFontAwesome name="image" size={35} color={'black'} />
        </TouchableOpacity>
      </View>
      <ModalBox
        isOpen={isModalOpen} // 모달의 열기/닫기 상태를 prop으로 전달
        style={[modalStyles.modal, { justifyContent: 'flex-end' }]}
        position="bottom"
        swipeToClose={false}
        onClosed={closeModal} // 모달이 닫힐 때 호출되는 콜백 함수
        backdrop
        backdropOpacity={0.5}
        backdropPressToClose
      >
        <View style={modalStyles.modalContent}>
          {userData.title === "학교" && (
            <TouchableOpacity style={[
              modalStyles.optionButton, 
              selectallposter === 1 && modalStyles.selectedOption
            ]} 
            onPress={handleAllPosterPress}>
              <Text style={[modalStyles.optionText, selectallposter == 1 && modalStyles.selectedText]}> 학교 공지사항 </Text>
            </TouchableOpacity>
          )}
          <TouchableOpacity style={modalStyles.optionButton} onPress={handleDepartmentPosterPress}>
            <Text style={[modalStyles.optionText, selectdepartmentposter === 1 && modalStyles.selectedText]}> 학과 공지사항 </Text>
          </TouchableOpacity>
          <TouchableOpacity style={modalStyles.optionButton} onPress={handleContestPosterPress}>
            <Text style={[modalStyles.optionText, selectcontestposter === 1 && modalStyles.selectedText]}>공모전 게시판</Text>
          </TouchableOpacity>
        </View>
      </ModalBox>
      <Modal isVisible={isModalVisible}>
        <View style={modalStyles.modalContainer}>
          <Text style={modalStyles.title}>등록 확인</Text>
          <Text style={modalStyles.message}>글이 등록되었습니다.</Text>
          <TouchableOpacity style={modalStyles.confirmButton} onPress={goback}>
            <Text style={modalStyles.confirmButtonText}>확인</Text>
          </TouchableOpacity>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff', // 배경색 흰색
  },
  postSelectionArea: {
    flexDirection: 'row', // 가로 방향 정렬
    marginHorizontal: 20, // 좌우 여백 20
    marginVertical: 20, // 상하 여백 20
    paddingVertical: 10, // 상하 패딩 10
    justifyContent: 'space-between', // 양 끝 정렬
    borderBottomWidth: 1, // 아래 테두리 두께 1
    borderBottomColor: '#ccc', // 아래 테두리 색상 회색
  },
  postSelectionText: {
    fontSize: 22, // 글자 크기 22
    color: 'black', // 글자 색상 검정
  },
  titleInputArea: {
    marginHorizontal: 20, // 좌우 여백 20
    marginVertical: 10, // 상하 여백 10
    borderBottomWidth: 1, // 아래 테두리 두께 1
    borderBottomColor: '#ccc', // 아래 테두리 색상 회색
    flexDirection: 'row',
    alignItems: 'center',
  },
  titleInput: {
    fontSize: 22, // 글자 크기 22
    color: 'black', // 글자 색상 검정
    width: '80%'
  },
  contentInputArea: {
    marginHorizontal: 20, // 좌우 여백 20
    marginBottom: 20, // 아래 여백 20
  },
  contentInput: {
    fontSize: 20, // 글자 크기 20
    color: 'black', // 글자 색상 검정
    textAlignVertical: 'top', // 텍스트 상단 정렬
    minHeight: 150, // 최소 높이 150
  },
  charCountText: {
    textAlign: 'right', // 오른쪽 정렬
    marginTop: 5, // 위 여백 5
    color: 'gray', // 글자 색상 회색
    fontSize: 14, // 글자 크기 14
  },
  imageSelectionArea: {
    width: '100%', // 너비 100%
    alignItems: 'flex-start', // 좌측 정렬
    paddingVertical: 10, // 상하 패딩 10
  },
  imageSelectButton: {
    margin: 10, // 여백 10
    width: 50, // 너비 50
    alignItems: 'center', // 중앙 정렬
  },
  imagePreviewArea: {
    marginTop: 150, // 위 여백 20
    width: '100%', // 너비 100%
    height: 300, // 높이 200
    alignItems: 'center', // 중앙 정렬
  },
  imageCard: {
    width: width * 0.6, // 화면 너비의 60%
    height: width * 0.6, // 화면 너비의 60%
    marginRight: 15, // 오른쪽 여백 15
    borderRadius: 10, // 모서리 반경 10
    backgroundColor: '#f0f0f0', // 배경색 연회색
    overflow: 'hidden', // 자식 요소 넘침 숨김
    marginHorizontal: 10, // 좌우 여백 10
    elevation: 5, // 그림자 효과 (안드로이드)
  },
  imagePreview: {
    width: '100%', // 너비 100%
    height: '100%', // 높이 100%
  },
  cancelButton: {
    position: 'absolute', // 절대 위치
    top: 10, // 위에서 10
    right: 10, // 오른쪽에서 10
    backgroundColor: 'rgba(0,0,0,0.5)', // 반투명 검정 배경
    borderRadius: 15, // 모서리 반경 15
    padding: 5, // 패딩 5
  },
  headerButton: {
    backgroundColor: '#B20000', // 배경색 빨강
    justifyContent: 'center', // 중앙 정렬
    alignItems: 'center', // 중앙 정렬
    width: 65, // 너비 65
    height: 35, // 높이 35
    borderRadius: 20, // 모서리 반경 20
    marginRight: 10, // 오른쪽 여백 10
  },
  headerButtonText: {
    color: 'white', // 글자 색상 흰색
    fontSize: 17, // 글자 크기 17
    fontWeight: 'bold', // 글자 두께 굵게
  },
  emptyTextContainer: {
    padding: 6, // 패딩 6
  },
  emptyText: {
    color: 'gray', // 글자 색상 회색
    fontSize: 16, // 글자 크기 16
  },
});

/**
 * 모달 스타일 정의
 */
const modalStyles = StyleSheet.create({
  modal: {
    backgroundColor: 'transparent', // 배경색 투명
    height: 300, // 높이 300
  },
  modalContent: {
    backgroundColor: 'white', // 배경색 흰색
    borderTopLeftRadius: 20, // 왼쪽 상단 모서리 반경 20
    borderTopRightRadius: 20, // 오른쪽 상단 모서리 반경 20
    padding: 20, // 패딩 20
    paddingTop: 25, // 위 패딩 25
    flex: 1, // 플렉스 1
    elevation: 5, // 그림자 효과 (안드로이드)
  },
  optionButton: {
    paddingVertical: 15, // 상하 패딩 15
    marginVertical: 10, // 상하 여백 10
    borderBottomWidth: 1, // 아래 테두리 두께 1
    borderBottomColor: '#e0e0e0', // 아래 테두리 색상 연회색
  },
  optionText: {
    fontSize: 22, // 글자 크기 22
    color: '#555', // 글자 색상 진회색
  },
  selectedOption: {
    backgroundColor: '#f0f0f0', // 배경색 연회색
  },
  selectedText: {
    color: 'black', // 글자 색상 검정
    fontWeight: 'bold', // 글자 두께 굵게
  },
  confirmButtonContainer: {
    alignItems: 'center', // 중앙 정렬
    justifyContent: 'flex-end', // 아래 정렬
    height: 100, // 높이 100
  },
  confirmButton: {
    backgroundColor: '#9A9EFF', // 배경색 연보라
    borderRadius: 10, // 모서리 반경 10
    paddingVertical: 15, // 상하 패딩 15
    paddingHorizontal: 30, // 좌우 패딩 30
  },
  confirmButtonText: {
    fontSize: 18, // 글자 크기 18
    color: 'white', // 글자 색상 흰색
  },
  modalContainer: {
    backgroundColor: 'white', // 배경색 흰색
    borderRadius: 20, // 모서리 반경 20
    padding: 20, // 패딩 20
    alignItems: 'center', // 중앙 정렬
  },
  title: {
    fontSize: 20, // 글자 크기 20
    fontWeight: 'bold', // 글자 두께 굵게
    marginBottom: 10, // 아래 여백 10
  },
  message: {
    fontSize: 16, // 글자 크기 16
    marginBottom: 20, // 아래 여백 20
    textAlign: 'center', // 중앙 정렬
  },
});

export default WritePostPage;