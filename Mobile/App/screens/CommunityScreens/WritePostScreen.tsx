import React, { useState, useEffect, useCallback, useReducer } from 'react';
import { 
  Text, 
  View, 
  TouchableOpacity, 
  TextInput, 
  FlatList, 
  Image, 
  Dimensions, 
  StyleSheet, 
  ScrollView,
  Modal
} from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import IconAntDesign from 'react-native-vector-icons/AntDesign'; // AntDesign 아이콘 컴포넌트
import IconFontAwesome from 'react-native-vector-icons/FontAwesome'; // FontAwesome 아이콘 컴포넌트
import ModalBox from 'react-native-modalbox'; // 모달 박스 컴포넌트
import { launchImageLibrary } from 'react-native-image-picker'; // 이미지 라이브러리 접근 함수
import LottieView from 'lottie-react-native'; // Lottie 애니메이션 컴포넌트
import config from '../../config'; // 서버 URL 설정 파일
import { UserData } from '../../types/type'; // 사용자 데이터 타입 정의

const { width } = Dimensions.get('window'); // 화면의 너비 가져오기

/**
 * 비어있는 상태에서 보여줄 안내 텍스트 컴포넌트
 */
const EmptyMainText = () => {
  const content = "\n\n\n" +
  "캠퍼스라이프는 누구나 기분 좋게 참여할 수 있는 커뮤니티를 만들기 위해 커뮤니티 이용규칙을 제정하여 운영하고 있습니다. 위반 시 게시물이 삭제되고 서비스 이용이 일정 기간 제한될 수 있습니다." +
  "\n\n정치·사회 관련 행위 금지\n\n국가기관, 정치 관련 단체, 언론, 시민단체에 대한 언급 혹은 이와 관련한 행위" +
  "\n정책·외교 또는 정치·정파에 대한 의견, 주장 및 이념, 가치관을 드러내는 행위\n성별, 종교, 인종, 출신, 지역, 직업, 이념 등 사회적 이슈에 대한 언급 혹은 이와 관련한 행위" +
  "\n위와 같은 내용으로 유추될 수 있는 비유, 은어 사용 행위\n영리 여부와 관계 없이 사업체·기관·단체·개인에게 직간접적으로 영향을 줄 수 있는 게시물 작성 행위\n불법촬영물 유통 금지\n불법촬영물등을 게재할 경우 전기통신사업법에 따라 삭제 조치 및 서비스 이용이 영구적으로 제한될 수 있으며 관련 법률에 따라 처벌받을 수 있습니다." +
  "\n\n그 밖의 규칙 위반\n타인의 권리를 침해하거나 불쾌감을 주는 행위\n범죄, 불법 행위 등 법령을 위반하는 행위\n욕설, 비하, 차별, 혐오, 자살, 폭력 관련 내용을 포함한 게시물 작성 행위\n음란물, 성적 수치심을 유발하는 행위\n스포일러, 공포, 속임, 놀라게 하는 행위"

  return (
    <View style={styles.emptyTextContainer}>
      <Text style={styles.emptyText}>{content}</Text>
    </View>
  );
};

/**
 * 게시글 작성 페이지 컴포넌트
 */
const WritePostPage: React.FC = ({ navigation, route }: any) => {
  const { userdata } = route.params; // 전달받은 사용자 데이터
  const [isModalOpen, setIsModalOpen] = useState(false); // 게시판 선택 모달 열기/닫기 상태
  const [selectallposter, setSelectAllPosterOption] = useState(0); // 전체 게시판 선택 여부 (0: 선택 안 함, 1: 선택)
  const [selectdepartmentposter, setSelectDepartmentPoster] = useState(0); // 학과 게시판 선택 여부 (0: 선택 안 함, 1: 선택)
  const [selectclubposter, setSelectClubPoster] = useState(0); // 동아리 게시판 선택 여부 (0: 선택 안 함, 1: 선택)
  const [postfontoption, setPostFontOption] = useState("게시판을 정해주세요"); // 게시판 선택 옵션 텍스트
  const [titletext, setTitleText] = useState(''); // 게시물 제목 상태
  const [maintext, setMainText] = useState(''); // 게시물 내용 상태
  const [userData, setUserData] = useState<UserData>(userdata); // 사용자 데이터 상태
  const [selectedImages, setSelectedImages] = useState<any[]>([]); // 선택된 이미지 목록
  const [selectedFormImages, setSelectedFormImages] = useState<FormData[]>([]); // 이미지의 FormData 목록

  const [isModalVisible, setIsModalVisible] = useState(false); // 글 등록 확인 모달 표시 여부

  // 리렌더링을 강제하기 위한 함수
  const forceUpdate = useReducer(() => ({}), {})[1];

  /**
   * 화면이 포커스될 때마다 헤더의 오른쪽 버튼을 업데이트
   */
  useFocusEffect(
    React.useCallback(() => {
      changeHeaderRightContent();
    }, [selectdepartmentposter, titletext, maintext, selectedFormImages])
  );

  /**
   * 이전 화면으로 이동하는 함수
   */
  const goBack = () => {
    navigation.goBack();
  };

  /**
   * 게시판 선택 상태에 따라 게시판 텍스트를 업데이트
   */
  useEffect(() => {
    // 게시판 선택에 따른 텍스트 업데이트
    if (selectallposter === 1) {
      setPostFontOption("전체 게시판");
    } else if (selectdepartmentposter === 1) {
      setPostFontOption("학과 게시판");
    } else if (selectclubposter === 1) {
      setPostFontOption("동아리 게시판");
    } else {
      setPostFontOption("게시판을 정해주세요");
    }
  }, [selectallposter, selectdepartmentposter, selectclubposter]);

  /**
   * 모달 열기 함수
   */
  const openModal = () => {
    setIsModalOpen(true);
  };

  /**
   * 모달 닫기 함수
   */
  const closeModal = () => {
    setIsModalOpen(false);
  };

  /**
   * 전체 게시판 선택 핸들러
   */
  const handleAllPosterPress = () => {
    setSelectAllPosterOption(1);
    setSelectDepartmentPoster(0);
    setSelectClubPoster(0); // 동아리 게시판 선택 해제
  };

  /**
   * 학과 게시판 선택 핸들러
   */
  const handleDepartmentPosterPress = () => {
    setSelectAllPosterOption(0);
    setSelectDepartmentPoster(1);
    setSelectClubPoster(0); // 동아리 게시판 선택 해제
  };

  /**
   * 동아리 게시판 선택 핸들러
   */
  const handleClubPosterPress = () => {
    setSelectAllPosterOption(0);
    setSelectDepartmentPoster(0);
    setSelectClubPoster(1); // 동아리 게시판 선택
  };

  /**
   * 제목 텍스트 변경 핸들러
   */
  const handleTitleTextChange = (inputText: string) => {
    setTitleText(inputText);
  };

  /**
   * 본문 텍스트 변경 핸들러
   */
  const handleMainTextChange = (inputText: string) => {
    setMainText(inputText);
  };

  /**
   * 헤더의 오른쪽 버튼을 '완료' 버튼으로 설정하고, 클릭 시 게시물 작성 및 이미지 업로드 실행
   */
  const changeHeaderRightContent = () => {
    navigation.setOptions({
      headerRight: () => (
        <TouchableOpacity onPress={async () => {
          const post_id = await writePost(); // 게시물 작성 API 호출
          const post_id_int = parseInt(post_id.postId);
          const imageGroup = await uploadImages(); // 이미지 업로드
          await RegistorPostPhoto(post_id_int, imageGroup); // 게시물 사진 등록 API 호출
          completePost(); // 완료 알림 후 이동
        }}>
          <View style={styles.headerButton}>
            <Text style={styles.headerButtonText}>완료</Text>
          </View>
        </TouchableOpacity>
      )
    });
  };

  /**
   * 게시물 작성 완료 알림 및 이전 화면으로 이동
   */
  const completePost = () => {
    setIsModalVisible(true); // 모달 표시
  };

  /**
   * 게시물 사진 등록 API 호출
   * @param post_id 게시물 ID
   * @param post_photo 업로드된 이미지 파일명 목록
   */
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
      });
      await response.json();
    } catch (error) {
      console.error(error);
    }
  };

  /**
   * 게시물 작성 API 호출
   */
  const writePost = async () => {
    try {
      const response = await fetch(`${config.serverUrl}/write_post`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: userData.user_pk,
          department_check: selectdepartmentposter,
          contest_check: 0,
          inform_check: 0,
          Club_check : selectclubposter,
          title: titletext,
          contents: maintext,
          url : '',
          sources : ''

        }),
      });
      return await response.json();
    } catch (error) {
      console.error('게시글 쓰기 실패!', error);
    }
  };

  /**
   * 이미지 선택 핸들러
   */
  const handleImagePick = () => {
    launchImageLibrary({ mediaType: 'photo', selectionLimit: 10 - selectedImages.length }, (response) => {
      if (response.assets) {
        const newSelectedImage = [...selectedImages, ...response.assets];
        setSelectedImages(newSelectedImage);
        const formDataArray = newSelectedImage.map((image, index) => {
          const formData = new FormData();
          const fileNameWithoutExtension = image.fileName.split('.').slice(0, -1).join('.');
          const newFileName = `${Date.now()}_${fileNameWithoutExtension}.png`;
          formData.append('images', { uri: image.uri, type: image.type, name: newFileName, index: index });
          return formData;
        });
        setSelectedFormImages(formDataArray);
        forceUpdate();
      }
    });
  };

  /**
   * 이미지 업로드 API 호출
   */
  const uploadImages = async () => {
    try {
      const uploadedImageDatas = [];
      for (const formData of selectedFormImages) {
        const response = await fetch(`${config.serverUrl}/uploadImages`, { method: 'POST', body: formData });
        const imageData = await response.json();
        uploadedImageDatas.push(imageData.fileNames[0]);
      }
      return uploadedImageDatas;
    } catch (error) {
      console.error('Error uploading images: ', error);
    }
  };

  /**
   * 선택된 이미지 삭제 핸들러
   * @param index 삭제할 이미지의 인덱스
   */
  const handleImageRemove = (index: number) => {
    setSelectedImages(selectedImages.filter((_, i) => i !== index));
    setSelectedFormImages(selectedFormImages.filter((_, i) => i !== index));
  };

  return (
    <View style={styles.container}>
      <ScrollView>
        {/* 게시판 선택 영역 */}
        <TouchableOpacity onPress={openModal} style={styles.postSelectionArea}>
          <Text style={styles.postSelectionText}>{postfontoption}</Text>
          <IconAntDesign name="down" size={30} color={'black'} />
        </TouchableOpacity>

        {/* 제목 입력 영역 */}
        <View style={styles.titleInputArea}>
          <TextInput
            style={styles.titleInput}
            onChangeText={handleTitleTextChange}
            value={titletext}
            placeholder="제목"
            placeholderTextColor={'gray'}
          />
        </View>

        {/* 본문 입력 영역 */}
        <View style={styles.contentInputArea}>
          <TextInput
            style={styles.contentInput}
            onChangeText={handleMainTextChange}
            value={maintext}
            multiline={true}
            placeholder="이곳에 글을 입력해 주세요!"
            placeholderTextColor={'gray'}
            maxLength={500}
          />
          {/* 현재 글자 수 표시 */}
          <Text style={styles.charCountText}>{maintext.length}/500</Text>
          {/* 내용과 이미지가 비어있을 때 안내 텍스트 표시 */}
          {maintext === '' && selectedImages.length === 0 && <EmptyMainText />}
        </View>

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
                    <IconAntDesign name="closecircleo" size={22} color={'white'} />
                  </TouchableOpacity>
                  {/* 필요 시 LottieView 애니메이션 추가 가능 */}
                </View>
              )}
              keyExtractor={(item, index) => index.toString()}
            />
          </View>
        )}
      </ScrollView>

      {/* 이미지 선택 버튼 */}
      <View style={styles.imageSelectionArea}>
        <TouchableOpacity onPress={handleImagePick} style={styles.imageSelectButton}>
          <IconFontAwesome name="image" size={35} color={'black'} />
        </TouchableOpacity>
      </View>

      {/* 게시판 선택 모달 */}
      <ModalBox
        isOpen={isModalOpen}
        style={[modalStyles.modal, { justifyContent: 'flex-end' }]}
        position="bottom"
        swipeToClose={false}
        onClosed={closeModal}
        backdrop
        backdropOpacity={0.5}
        backdropPressToClose
      >
        <View style={modalStyles.modalContent}>
          {/* 전체 게시판 선택 버튼 */}
          <TouchableOpacity
            style={[
              modalStyles.optionButton, 
              selectallposter === 1 && modalStyles.selectedOption
            ]}
            onPress={handleAllPosterPress}
          >
            <Text style={[
              modalStyles.optionText, 
              selectallposter === 1 && modalStyles.selectedText
            ]}>
              전체 게시판
            </Text>
          </TouchableOpacity>

          {/* 학과 게시판 선택 버튼 */}
          <TouchableOpacity
            style={[
              modalStyles.optionButton, 
              selectdepartmentposter === 1 && modalStyles.selectedOption
            ]}
            onPress={handleDepartmentPosterPress}
          >
            <Text style={[
              modalStyles.optionText, 
              selectdepartmentposter === 1 && modalStyles.selectedText
            ]}>
              학과 게시판
            </Text>
          </TouchableOpacity>

          {/* 동아리 게시판 선택 버튼 */}
          <TouchableOpacity
            style={[
              modalStyles.optionButton, 
              selectclubposter === 1 && modalStyles.selectedOption
            ]}
            onPress={handleClubPosterPress}
          >
            <Text style={[
              modalStyles.optionText, 
              selectclubposter === 1 && modalStyles.selectedText
            ]}>
              동아리 게시판
            </Text>
          </TouchableOpacity>

          {/* 선택 완료 버튼 */}
          <View style={modalStyles.confirmButtonContainer}>
            <TouchableOpacity onPress={closeModal} style={modalStyles.confirmButton}>
              <Text style={modalStyles.confirmButtonText}>선택 완료</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ModalBox>

      {/* 글 등록 확인 모달 */}
      <Modal 
        visible={isModalVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setIsModalVisible(false)}
      >
        <View style={modalStyles.modalOverlay}>
          <View style={modalStyles.modalContainer}>
            <Text style={modalStyles.title}>게시물 작성</Text>
            <Text style={modalStyles.message}>게시물 작성을 완료했습니다!</Text>
            <TouchableOpacity
              style={modalStyles.confirmButton}
              onPress={() => {
                setIsModalVisible(false); // 모달 닫기
                goBack(); // 이전 화면으로 이동
              }}
            >
              <Text style={modalStyles.confirmButtonText}>확인</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
};

/**
 * 스타일 정의
 */
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
  },
  titleInput: {
    fontSize: 22, // 글자 크기 22
    color: 'black', // 글자 색상 검정
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
    marginTop: 20, // 위 여백 20
    width: '100%', // 너비 100%
    height: 300, // 높이 300
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
    paddingVertical: 10, // 상하 패딩 10
    paddingHorizontal: 30, // 좌우 패딩 30
  },
  confirmButtonText: {
    fontSize: 18, // 글자 크기 18
    color: 'white', // 글자 색상 흰색
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)', // 반투명 배경
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    backgroundColor: 'white', // 배경색 흰색
    borderRadius: 20, // 모서리 반경 20
    padding: 20, // 패딩 20
    width: '80%', // 너비 80%
    alignItems: 'center', // 중앙 정렬
  },
  title: {
    fontSize: 20, // 글자 크기 20
    fontWeight: 'bold', // 글자 두께 굵게
    marginBottom: 10, // 아래 여백 10,
    color: '#333'
  },
  message: {
    fontSize: 16, // 글자 크기 16
    marginBottom: 20, // 아래 여백 20
    textAlign: 'center', // 중앙 정렬
    color: '#333'
  },
});

export default WritePostPage;
