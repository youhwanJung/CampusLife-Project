import React, { useState, useEffect, useRef } from 'react';
import {
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Text,
  View,
  Dimensions,
  Image,
  Alert,
  Linking,
  Modal,
  Pressable,
  LogBox 
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import Swiper from 'react-native-swiper';
import ImageCropPicker from 'react-native-image-crop-picker';
import config from '../config';

// 다양한 아이콘 라이브러리 import
import IconA from 'react-native-vector-icons/MaterialIcons';
import IconB from 'react-native-vector-icons/AntDesign';
import IconC from 'react-native-vector-icons/FontAwesome';
import IconD from 'react-native-vector-icons/Feather';
import IconE from 'react-native-vector-icons/Ionicons';
import IconF from 'react-native-vector-icons/Fontisto';
import IconG from 'react-native-vector-icons/MaterialCommunityIcons';
import IconH from 'react-native-vector-icons/Foundation';
import IconI from 'react-native-vector-icons/FontAwesome5';
import IconJ from 'react-native-vector-icons/MaterialIcons';
import IconK from 'react-native-vector-icons/Entypo';

// 디바이스 너비 가져오기
const width = Dimensions.get('window').width;

const aramCount = 10


// 포스트 데이터 타입 정의
type PostData = {
  post_id: number,
  title: string,
  contents: string,
  date: string,
  view: number,
  like: number,
  name: string,
  admin_check: boolean
};

// 사용자 포인트 타입 정의
export type UserPoint = {
  point: number,
};

// 이벤트 데이터 타입 정의 (추가적으로 필요한 경우 수정)
export type EventData = {
  event_id: number,
  name: string,
  simple_info: string,
  event_photo: { event_photo: string }[],
  // 추가 필드...
};

// 사용자 데이터 타입 정의 (추가적으로 필요한 경우 수정)
export type UserData = {
  user_pk: number,
  name: string,
  profile_photo: string,
  department_pk: number,
  campus_pk: number,
  grade: number,
  // 추가 필드...
};

// 공모전 데이터 정보 (추가적으로 필요한 경우 수정)
type ContestData = {
  post_id: number,
  user_id: number,
  department_check: boolean,
  inform_check: boolean,
  Club_check: boolean,
  title: string,
  date: string,
  contest_check: boolean,
  url: string,
  sources: string,
  post_photo: string
}

const MainPage = ({ navigation, route }: any) => {
  const { userdata, LectureData } = route.params;
  const [isModalVisible, setModalVisible] = useState(false); // 모달 상태 관리

  useEffect(() => {
    LogBox.ignoreAllLogs()
  }, [])

  // 상태 변수 선언
  const [schoolPostData, setSchoolPostData] = useState<PostData[]>([]);
  const [departmentPostData, setDepartmentPostData] = useState<PostData[]>([]);
  const [hotPostData, setHotPostData] = useState<PostData[]>([]);
  const [userData, setUserData] = useState<UserData>(userdata);
  const [userPoint, setUserPoint] = useState<UserPoint>({ point: 0 });
  const [eventData, setEventData] = useState<EventData[]>([]);
  const [userDepartment, setUserDepartment] = useState<string>('');
  const [contestdata, setContestdata] = useState<ContestData[]>([]);
  const [aramCount, setaramCount] = useState(0);
  // 프로필 사진 URI
  const fileUri = `${config.serverUrl}/${userData.profile_photo}`;

  const toggleModal = () => {
    setModalVisible(!isModalVisible);
  };

  /**
   * 포스트의 조회수를 증가시키는 함수
   * @param post_id 포스트 ID
   */
  const viewCountUp = async (post_id: number) => {
    try {
      const response = await fetch(`${config.serverUrl}/view_count_up`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ post_id }),
      });
      const result = await response.json();
      // 조회수 증가 성공 시 처리 로직 (필요 시 추가)
    } catch (error) {
      console.error('포스트 조회수 증가 실패:', error);
    }
  };

  /**
   * 이미지 갤러리 열기 및 선택한 이미지 처리
   */
  const getPhotos = async () => {
    try {
      const images = await ImageCropPicker.openPicker({
        multiple: true,
        mediaType: 'photo',
        includeBase64: true,
        includeExif: true,
      });

      const formData = new FormData();
      images.forEach(image => {
        formData.append('images', {
          uri: image.path,
          type: 'image/jpeg',
          name: `${Date.now()}_${image.filename || userData.user_pk}.png`,
        });
      });

      // 이미지 업로드 함수 호출 (현재는 주석 처리됨)
      // await uploadImages(formData);
    } catch (error) {
      console.error('이미지 선택 실패:', error);
    }
  };

  /**
   * 이미지 업로드 함수 (현재는 주석 처리됨)
   * @param formData 이미지 데이터를 포함한 FormData
   */
  /* const uploadImages = async (formData: FormData) => {
    try {
      const response = await fetch(`${config.serverUrl}/upload`, {
        method: 'POST',
        body: formData,
      });
      if (response.ok) {
        console.log('이미지 업로드 성공');
      } else {
        console.error('이미지 업로드 실패');
      }
    } catch (error) {
      console.error('이미지 업로드 오류:', error);
    }
  }; */

  /**
   * 사용자의 학과 이름을 서버에서 가져오는 함수
   */
  const getUserDepartment = async () => {
    try {
      const response = await fetch(`${config.serverUrl}/get_department_name`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ department_name: userData.department_pk }),
      });
      const userDepartmentData = await response.json();
      const departmentName = userDepartmentData.userdepartment;
      setUserDepartment(departmentName);
    } catch (error) {
      console.error('유저 학과 이름 가져오기 실패:', error);
    }
  };

  /**
   * 학교 공지사항 데이터를 서버에서 가져오는 함수
   */
  const fetchSchoolPostData = async () => {
    try {
      const response = await fetch(`${config.serverUrl}/MainPageSchoolPost`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ campus_id: userData.campus_pk }),
      });
      const data = await response.json();
      setSchoolPostData(data);
    } catch (error) {
      console.error('학교 공지사항 가져오기 실패:', error);
    }
  };

  /**
   * 학과 공지사항 데이터를 서버에서 가져오는 함수
   */
  const fetchDepartmentPostData = async () => {
    try {
      const response = await fetch(`${config.serverUrl}/MainPagedepartmentPost`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ department_id: userData.department_pk }),
      });
      const data = await response.json();
      setDepartmentPostData(data);
    } catch (error) {
      console.error('학과 공지사항 가져오기 실패:', error);
    }
  };

  /**
   * 인기글 데이터를 서버에서 가져오는 함수
   */
  const fetchHotPostData = async () => {
    try {
      const response = await fetch(`${config.serverUrl}/MainPagehotPost`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ campus_id: userData.campus_pk }),
      });
      const data = await response.json();
      setHotPostData(data);
    } catch (error) {
      console.error('인기글 가져오기 실패:', error);
    }
  };

  /**
   * 공모전 정보 서버에서 가져오는 함수
   */
  const fetchContestpostData = async () => {
    try {
      const response = await fetch(`${config.serverUrl}/fetchContestpostData`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          campus_id: userData.campus_pk,
        })
      })
      const data = await response.json();
      setContestdata(data);
    } catch (error) {
      console.error(error);
    }
  }

  /**
   * 사용자 포인트를 서버에서 가져오는 함수
   */
  const getUserPoint = async () => {
    try {
      const response = await fetch(`${config.serverUrl}/get_user_point`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ user_id: userData.user_pk }),
      });
      const userPoint = await response.json();
      setUserPoint(userPoint);
    } catch (error) {
      console.error('유저 포인트 가져오기 실패:', error);
    }
  };

  /**
   * 이벤트 데이터를 서버에서 가져오는 함수
   */
  const getEventData = async () => {
    try {
      const response = await fetch(`${config.serverUrl}/Get_Event_Data`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ campus_id: userData.campus_pk }),
      });

      if (!response.ok) {
        throw new Error('서버 응답 오류');
      }

      const eventDataResponse = await response.json();

      // 이벤트마다 이미지 가져오기
      const eventsWithImages = await Promise.all(
        eventDataResponse.map(async (event: any) => {
          const eventImage = await getEditEventImage(event.event_id);
          return {
            ...event,
            event_photo: eventImage || [{ event_photo: 'default_image_url' }],
          };
        })
      );

      setEventData(eventsWithImages);
    } catch (error) {
      console.error('이벤트 데이터 가져오기 실패:', error);
    }
  };

  /**
   * 특정 이벤트의 이미지를 서버에서 가져오는 함수
   * @param event_id 이벤트 ID
   */
  const getEditEventImage = async (event_id: number) => {
    try {
      const response = await fetch(`${config.serverUrl}/GetEditEventImage`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ event_id }),
      });
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('이벤트 이미지 가져오기 실패:', error);
      return null;
    }
  };

  const getUserAramCount = async () => {
    try {
      const response = await fetch(`${config.serverUrl}/getUserAramCount`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ user_id: userData.user_pk }),
      });
      const userAramCount = await response.json();
      setaramCount(userAramCount);
    } catch (error) {
      console.error('유저 알람 카운트 가져오기 실패:', error);
    }
  };

  // 초기 이벤트 데이터 (임시)
  const initialEvents = [
    {
      screen: "AttendanceCheckEventScreen",
      imageSource: "1718551969957-1718551969312_12",
      label: "출석체크 이벤트!",
      info: "앱을 정기적으로 출석할 시에 포인트를 제공해 드립니다!",
      params: {}
    },
    {
      screen: "FriendCodeEventScreen",
      imageSource: "1718551983124-1718551982503_12",
      label: "친구코드 이벤트!",
      info: "친구에게 나의 코드를 보낼시에 포인트를 제공해 드립니다!",
      params: {}
    },
  ];

  // 모든 이벤트 데이터 결합
  const allEvents = [
    ...initialEvents,
    ...eventData.map(event => ({
      screen: "DeadlineEventScreen",
      label: event.name,
      info: event.simple_info,
      imageSource: event.event_photo[0].event_photo, // event_photo가 이미지 URL을 담고 있다고 가정
      params: { userdata: userData, eventdata: event }
    })),
  ];

  /**
   * 사용자 정보 페이지로 네비게이션하는 함수
   */
  const navigateToStudentInfo = () => {
    navigation.navigate('StudentInfoNavigator', { userData, userDepartment });
  };

  /**
   * 학적 확인 페이지로 네비게이션하는 함수
   */
  const navigateToAcademicInfo = () => {
    navigation.navigate('AcademicInfoNavigator', { userData, LectureData });
  };

  // 화면이 포커스될 때 데이터 가져오기
  useFocusEffect(
    React.useCallback(() => {
      const fetchData = async () => {
        try {
          setUserData(userdata);
          await getUserAramCount();
          await fetchSchoolPostData();
          await fetchDepartmentPostData();
          await fetchHotPostData();
          await fetchContestpostData();
          await getUserDepartment();
          await getUserPoint();
          await getEventData();

          // 업데이트된 사용자 데이터가 있는지 확인 후 상태 업데이트
          const currentRoute = navigation.getState().routes[navigation.getState().index];
          if (currentRoute.params?.updatedUserData) {
            const updatedUserData = currentRoute.params.updatedUserData;
            setUserData(updatedUserData);
          }
        } catch (error) {
          console.error('데이터 가져오기 오류:', error);
        }
      };

      fetchData();
    }, [navigation, userdata])
  );

  return (
    <View style={styles.container}>
      <ScrollView>
        {/* 프로필 영역 */}
        <ScrollView horizontal pagingEnabled showsHorizontalScrollIndicator={false}>
          <View style={styles.profileArea}>
            <View style={styles.profileBox}>
              {/* 프로필 상단 영역 */}
              <View style={styles.profileBoxTop}>
                <TouchableOpacity onPress={getPhotos} style={styles.profileImageArea}>
                  {userData.profile_photo ? (
                    <Image source={{ uri: fileUri }} style={styles.profileImage} />
                  ) : (
                    <IconI name="user" size={40} color="black" />
                  )}
                </TouchableOpacity>
                <View style={styles.userInfoNPointArea}>
                  <View style={styles.userInfoArea}>
                    <View style={styles.userNameRow}>
                      <Text style={styles.userName}>{userData.name}</Text>
                      <TouchableOpacity
                        style={styles.pointCheckBox}
                        onPress={() => navigation.navigate("PointHistoryScreen")}
                      >
                        <Text style={styles.pointCheckFont}>내 포인트 이력</Text>
                      </TouchableOpacity>
                    </View>
                    <Text style={styles.userInfo}>{userDepartment}/{userData.grade}학년</Text>
                  </View>
                  <View style={styles.pointArea}>
                    <IconA style={styles.pointIcon} name="payments" size={36} />
                    <Text style={styles.userPoint}>{userPoint?.point}P</Text>
                    <TouchableOpacity
                      onPress={() => navigation.navigate("EventScreenStackNavigator", { userPoint })}
                    >
                      <IconI name={"shopping-bag"} size={23} style={styles.pointNavigationIcon} />
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
              {/* 프로필 하단 영역 */}
              <View style={styles.profileBoxBottom}>
                <TouchableOpacity style={styles.tabButton} onPress={navigateToStudentInfo}>
                  <IconB style={styles.tabIcon} name="idcard" size={30} />
                  <Text style={styles.tabText}>정보변경</Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.tabButton} onPress={() => navigation.navigate("StudyRoomStackNavigator")}>
                  <IconF style={styles.tabIcon} name="prescription" size={30} />
                  <Text style={styles.tabText}>스터디룸</Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.tabButton} onPress={navigateToAcademicInfo}>
                  <IconC style={styles.tabIcon} name="calendar-check-o" size={30} />
                  <Text style={styles.tabText}>학적정보</Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.tabButton} onPress={() => navigation.navigate("SchoolInfoScreen")}>
                  <IconE style={styles.tabIcon} name="information-circle-outline" size={30} />
                  <Text style={styles.tabText}>학교정보</Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.tabButton} onPress={() => navigation.navigate("AlarmDialogScreen")}>
                  <IconD style={styles.tabIcon} name="bell" size={30} />
                  <Text style={styles.tabText}>알림</Text>
                  {aramCount > 0 && (
                    <View style={styles.notificationBadge}>
                      <Text style={styles.notificationCount}>{aramCount}</Text>
                    </View>
                  )}
                </TouchableOpacity>


              </View>
            </View>
          </View>
          {/* 뱃지 영역 */}
          <View style={styles.badgeArea}>
            <View style={styles.badgeBox}>
              <View style={styles.TitleArea}>
                <IconK name="help-with-circle" size={25} color={'white'} />
                <Text style={styles.badgeTitleText}>내 보유 뱃지</Text>
                <TouchableOpacity onPress={toggleModal}>
                  <IconK style={styles.badgeTitleIcon} name="help-with-circle" size={25} color={'#333'} />
                </TouchableOpacity>
              </View>
              <ScrollView horizontal={true} style={styles.badgeContainer} nestedScrollEnabled={true}>
                <View style={styles.badgeItem}>
                  {/* 
                  source={require('../assets/뱃지.png')}
                  source={require('../assets/뱃지2.png')}
                  source={require('../assets/뱃지3.png')}
                  source={require('../assets/뱃지4.png')}
                  source={require('../assets/뱃지5.png')}
                  source={require('../assets/뱃지6.png')}
                  source={require('../assets/뱃지7.png')}
                  */}
                  <Image
                    source={require('../assets/뱃지.png')}
                    resizeMode="contain"
                    style={styles.badgeImage}
                  />
                  <Text style={styles.badgeText}>뱃지1</Text>
                </View>
                <View style={styles.badgeItem}>
                  <Image
                    source={require('../assets/뱃지2.png')}
                    resizeMode="contain"
                    style={styles.badgeImage}
                  />
                  <Text style={styles.badgeText}>뱃지2</Text>
                </View>
                <View style={styles.badgeItem}>
                  <Image
                    source={require('../assets/뱃지3.png')}
                    resizeMode="contain"
                    style={styles.badgeImage}
                  />
                  <Text style={styles.badgeText}>뱃지3</Text>
                </View>
                <View style={styles.badgeItem}>
                  <Image
                    source={require('../assets/뱃지.png')}
                    resizeMode="contain"
                    style={styles.badgeImage}
                  />
                  <Text style={styles.badgeText}>뱃지1</Text>
                </View>
                <View style={styles.badgeItem}>
                  <Image
                    source={require('../assets/뱃지2.png')}
                    resizeMode="contain"
                    style={styles.badgeImage}
                  />
                  <Text style={styles.badgeText}>뱃지2</Text>
                </View>
                <View style={styles.badgeItem}>
                  <Image
                    source={require('../assets/뱃지3.png')}
                    resizeMode="contain"
                    style={styles.badgeImage}
                  />
                  <Text style={styles.badgeText}>뱃지3</Text>
                </View>
                <View style={styles.badgeItem}>
                  <Image
                    source={require('../assets/뱃지.png')}
                    resizeMode="contain"
                    style={styles.badgeImage}
                  />
                  <Text style={styles.badgeText}>뱃지1</Text>
                </View>
                <View style={styles.badgeItem}>
                  <Image
                    source={require('../assets/뱃지2.png')}
                    resizeMode="contain"
                    style={styles.badgeImage}
                  />
                  <Text style={styles.badgeText}>뱃지2</Text>
                </View>
                <View style={styles.badgeItem}>
                  <Image
                    source={require('../assets/뱃지3.png')}
                    resizeMode="contain"
                    style={styles.badgeImage}
                  />
                  <Text style={styles.badgeText}>뱃지3</Text>
                </View>
              </ScrollView>
            </View>
            {/* 모달 구현 */}
            <Modal
              animationType="slide"
              transparent={true}
              visible={isModalVisible}
              onRequestClose={toggleModal}
            >
              <View style={styles.modalContainer}>
                <View style={styles.modalContent}>
                  <Text style={styles.modalTitle}>뱃지 획득 방법</Text>
                  <Text style={styles.modalText}>
                    뱃지는 특정 이벤트, 출석 체크, 포인트 적립 등을 통해 획득할 수 있습니다.
                    각 뱃지는 특별한 의미를 가지고 있으며, 다양한 활동을 통해 뱃지를 모아보세요!
                  </Text>
                  <Pressable style={styles.closeButton} onPress={toggleModal}>
                    <Text style={styles.closeButtonText}>닫기</Text>
                  </Pressable>
                </View>
              </View>
            </Modal>
          </View>
        </ScrollView>
        {/* 이벤트 영역 */}
        <View style={styles.eventArea}>
          <View style={styles.eventHead}>
            <Text style={styles.eventHeadText}>이벤트</Text>
            <IconF style={styles.eventHeadIcon} name="ticket" size={27} />
          </View>
          <View style={styles.eventSwipeArea}>
            <Swiper loop={true} removeClippedSubviews={false}>
              {allEvents.map((event, index) => (
                <TouchableOpacity
                  key={index}
                  onPress={() => navigation.navigate(event.screen, event.params)}
                  style={styles.eventBox}
                >
                  <View style={styles.eventImageArea}>
                    <Image
                      style={styles.eventImage}
                      source={{ uri: `${config.photoUrl}/${event.imageSource}.png` }}
                    />
                  </View>
                  <View style={styles.eventTextArea}>
                    <Text style={styles.eventLabelText}>{event.label}</Text>
                    <Text style={styles.eventInfoText}>{event.info}</Text>
                  </View>
                </TouchableOpacity>
              ))}
            </Swiper>
          </View>
        </View>

        {/* 학교 공지사항 영역 */}
        <View style={styles.postArea}>
          <View style={styles.postHeadArea}>
            <View style={styles.postHeadTextIconArea}>
              <Text style={styles.postHeadText}>학교 공지사항</Text>
              <IconG style={styles.postHeadIcon} name="file-document-multiple" size={28} />
            </View>
            <TouchableOpacity
              onPress={() => {
                navigation.navigate('NoticeScreenStackNavigator', {
                  screen: 'NoticePostTopTabNavigator',
                  params: { screen: '학교 공지사항' },
                  item: { userDepartment }
                });
              }}
              style={styles.postDetailArea}
            >
              <Text style={styles.postDetailText}>더보기</Text>
              <IconB style={styles.postDetailIcon} name={"caretright"} size={17} />
            </TouchableOpacity>
          </View>
          <View style={styles.postBoxArea}>
            <View style={styles.postBox}>
              {schoolPostData.slice(0, 5).map((post, index) => (
                <TouchableOpacity
                  key={post.post_id}
                  style={styles.postLabelArea}
                  onPress={async () => {
                    await viewCountUp(post.post_id);
                    navigation.navigate("NoticePostDetailScreen", { item: post, userData, userDepartment });
                  }}
                >
                  <View style={styles.postLabelTextArea}>
                    <Text
                      style={styles.postLabelText}
                      numberOfLines={1}
                      ellipsizeMode="clip"
                    >
                      {post.title}
                    </Text>
                    {/* 조회수가 20 미만일 때 "new" 아이콘 표시 */}
                    {post.view < 20 && <IconH style={styles.postLabelIcon} name="burst-new" size={40} />}
                  </View>
                  <View style={styles.postViewArea}>
                    <Text style={styles.postViewText}>{post.view}</Text>
                    <IconB style={styles.postViewIcon} name="eyeo" size={25} />
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </View>

        {/* 학사 공지사항 영역 */}
        <View style={styles.postArea}>
          <View style={styles.postHeadArea}>
            <View style={styles.postHeadTextIconArea}>
              <Text style={styles.postHeadText}>학사 공지사항</Text>
              <IconG style={styles.postHeadIcon} name="file-document-multiple" size={28} />
            </View>
            <TouchableOpacity
              onPress={() => {
                navigation.navigate('NoticeScreenStackNavigator', {
                  screen: 'NoticePostTopTabNavigator',
                  params: { screen: '학과 공지사항' },
                  item: { userDepartment }
                });
              }}
              style={styles.postDetailArea}
            >
              <Text style={styles.postDetailText}>더보기</Text>
              <IconB style={styles.postDetailIcon} name={"caretright"} size={17} />
            </TouchableOpacity>
          </View>
          <View style={styles.postBoxArea}>
            <View style={styles.postBox}>
              {departmentPostData.slice(0, 5).map((post, index) => (
                <TouchableOpacity
                  key={post.post_id}
                  style={styles.postLabelArea}
                  onPress={async () => {
                    await viewCountUp(post.post_id);
                    navigation.navigate("NoticePostDetailScreen", { item: post, userData, userDepartment });
                  }}
                >
                  <View style={styles.postLabelTextArea}>
                    <Text
                      style={styles.postLabelText}
                      numberOfLines={1}
                      ellipsizeMode="clip"
                    >
                      {post.title}
                    </Text>
                    {/* 조회수가 20 미만일 때 "new" 아이콘 표시 */}
                    {post.view < 20 && <IconH style={styles.postLabelIcon} name="burst-new" size={40} />}
                  </View>
                  <View style={styles.postViewArea}>
                    <Text style={styles.postViewText}>{post.view}</Text>
                    <IconB style={styles.postViewIcon} name="eyeo" size={25} />
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </View>

        {/* 인기글 영역 */}
        <View style={styles.postArea}>
          <View style={styles.postHeadArea}>
            <View style={styles.postHeadTextIconArea}>
              <Text style={styles.postHeadText}>인기글</Text>
              <IconF style={styles.postHeadIcon} name="fire" size={27} />
            </View>
            <TouchableOpacity
              onPress={() => {
                navigation.navigate('CommunityScreenStackNavigator', {
                  screen: 'PostTopTabNavigator',
                  params: { screen: '전체 게시판', params: { screen: 'HOT' } },
                  item: { userDepartment }
                });
              }}
              style={styles.postDetailArea}
            >
              <Text style={styles.postDetailText}>더보기</Text>
              <IconB style={styles.postDetailIcon} name={"caretright"} size={17} />
            </TouchableOpacity>
          </View>
          <View style={styles.postBoxArea}>
            <View style={styles.postBox}>
              {hotPostData.slice(0, 5).map((post, index) => (
                <TouchableOpacity
                  key={post.post_id}
                  style={styles.postLabelArea}
                  onPress={async () => {
                    await viewCountUp(post.post_id);
                    navigation.navigate("PostDetailScreen", { item: post, userData, userDepartment });
                  }}
                >
                  <View style={styles.postLabelTextArea}>
                    <Text
                      style={styles.postLabelText}
                      numberOfLines={1}
                      ellipsizeMode="tail"
                    >
                      {post.title}
                    </Text>
                    {/* 조회수가 20 미만일 때 "new" 아이콘 표시 */}
                    {post.view < 20 && <IconH style={styles.postLabelIcon} name="burst-new" size={40} />}
                  </View>
                  <View style={styles.postViewArea}>
                    <Text style={styles.postViewText}>{post.view}</Text>
                    <IconB style={styles.postViewIcon} name="eyeo" size={25} />
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </View>

        {/* 공모전 영역 */}
        <View style={styles.contestArea}>
          <View style={styles.contestHeadArea}>
            <View style={styles.contestHeadTextArea}>
              <Text style={styles.contestHeadText}>공모전</Text>
              <IconJ style={styles.contestHeadIcon} name="festival" size={27} />
            </View>
            <TouchableOpacity
              onPress={() => {
                navigation.navigate('CommunityScreenStackNavigator', {
                  screen: 'PostTopTabNavigator',
                  params: { screen: '전체 게시판', params: { screen: 'HOT' } },
                  item: { userDepartment }
                });
              }}
              style={styles.contestDetailArea}
            >
              <Text style={styles.contestDetailText}>더보기</Text>
              <IconB style={styles.contestDetailIcon} name={"caretright"} size={17} />
            </TouchableOpacity>
          </View>
          <ScrollView horizontal={true} showsHorizontalScrollIndicator={false} style={styles.contestBoxArea}>
            {contestdata.map((item) => (
              <TouchableOpacity
                key={item.post_id}
                style={styles.contestBox}
                onPress={() => Linking.openURL(item.url)} >
                <View style={styles.contestImageArea}>
                  {item.post_photo ? (
                    <Image style={styles.contestImage} source={{ uri: `${config.photoUrl}/${item.post_photo}.png` }} />
                  ) : (
                    <View style={[styles.contestImage, styles.noImageContainer]}>
                      <IconB name="picture" size={40} color="#ccc" />
                      <Text style={styles.noImageText}>이미지 없음</Text>
                    </View>
                  )}
                </View>
                <View style={styles.contestTextArea}>
                  <View style={styles.contestTextTitleArea}>
                    <Text style={styles.contestTextTitle}>{item.title}</Text>
                  </View>
                  <View style={styles.contestTextInfoArea}>
                    <Text style={styles.contestTextInfo}>{item.sources}</Text>
                  </View>
                </View>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      </ScrollView>
    </View>
  );
};

// 스타일 정의
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9F9F9', // 전체 배경색
  },
  profileArea: {
    alignSelf: 'center',
    width: width * 0.9,
    height: 190, // 프로필 박스 높이
    marginVertical: 20,
    marginHorizontal: (width - width * 0.9) / 2
  },
  profileBox: {
    flex: 1,
    borderRadius: 20,
    elevation: 5, // 안드로이드 그림자
    backgroundColor: 'white', // 배경색
  },
  profileBoxTop: {
    backgroundColor: '#FFFADD', // 상단 프로필 배경색
    width: '100%',
    height: '65%', // 상단 영역 높이
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    borderBottomWidth: 1,
    borderColor: 'gray',
    justifyContent: 'flex-start',
    alignItems: 'center',
    flexDirection: 'row',
  },
  profileImageArea: {
    width: 85,
    height: 85,
    borderRadius: 50,
    borderWidth: 1,
    borderColor: 'lightgray',
    marginLeft: 35,
    backgroundColor: 'white',
    alignItems: 'center',
    justifyContent: 'center',
  },
  profileImage: {
    width: 85,
    height: 85,
    borderRadius: 50,
  },
  userInfoNPointArea: {
    flexDirection: 'column',
    marginLeft: 20,
  },
  userInfoArea: {
    flexDirection: 'column',
    maxWidth: width * 0.5,
  },
  userNameRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  userName: {
    color: 'black',
    fontSize: 25,
    fontWeight: 'bold',
  },
  pointCheckBox: {
    backgroundColor: '#A8D5BA',
    width: 120,
    height: 30,
    marginLeft: 10,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 10,
    elevation: 5,
  },
  pointCheckFont: {
    fontSize: 16,
    fontWeight: 'bold',
    color: 'black',
  },
  userInfo: {
    color: 'black',
    fontSize: 15,
  },
  pointArea: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  pointIcon: {
    color: 'black',
  },
  userPoint: {
    color: 'black',
    fontSize: 24,
    marginHorizontal: 5,
  },
  pointNavigationIcon: {
    color: '#2e8b57',
  },
  profileBoxBottom: {
    backgroundColor: 'white',
    height: '35%', // 하단 영역 높이
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    flexDirection: 'row',
  },
  tabButton: {
    width: '20%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabIcon: {
    color: 'black',
    marginVertical: 2,
  },
  tabText: {
    color: 'black',
    fontSize: 15,
  },
  notificationBadge: {
    position: 'absolute',
    right: 10, // 아이콘에 대한 위치 조정
    top: 5,
    backgroundColor: 'red',
    borderRadius: 10,
    width: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  notificationCount: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
  },
  badgeArea: {
    alignSelf: 'center',
    width: width * 0.9,
    height: 190, // 기존보다 약간 높여서 공간 확보
    marginVertical: 20,
    marginHorizontal: (width - width * 0.9) / 2,
    backgroundColor: '#E8F0FE', // 부드러운 배경색 추가
    borderRadius: 15, // 모서리를 둥글게
    elevation: 5, // 그림자 추가
  },
  badgeBox: {
    backgroundColor: '#FFFFFF', // 배경을 흰색으로 유지
    borderRadius: 15,
    elevation: 5,
    padding: 10, // 내부 여백 추가
  },
  TitleArea: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginHorizontal: 10
  },
  badgeTitleText: {
    color: '#333', // 제목을 조금 더 어두운 색상으로
    fontWeight: 'bold',
    fontSize: 22, // 폰트 크기를 약간 키움
    padding: 10,
  },
  badgeTitleIcon: {
    bottom: 10
  },
  badgeContainer: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    backgroundColor: '#FFFFFF',
  },
  badgeItem: {
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 8, // 간격을 조금 더 넓힘
    backgroundColor: '#F3F4F6', // 뱃지 아이템마다 배경색 추가
    borderRadius: 10, // 둥근 모서리
    padding: 10, // 패딩 추가
    elevation: 3, // 약간의 그림자 추가
  },
  badgeImage: {
    width: 65, // 이미지 크기를 조금 키움
    height: 65,
    opacity: 0.9, // 이미지 투명도를 조금 줄여 더 뚜렷하게
  },
  badgeText: {
    color: '#333', // 텍스트를 어두운 색으로
    fontWeight: 'bold', // 강조
    marginTop: 5, // 텍스트와 이미지 사이 여백 추가
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)', // 반투명 배경
  },
  modalContent: {
    width: width * 0.8,
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 20,
    alignItems: 'center',
    elevation: 10,
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  modalText: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 20,
  },
  closeButton: {
    backgroundColor: '#FFC700',
    borderRadius: 10,
    paddingVertical: 10,
    paddingHorizontal: 20,
  },
  closeButtonText: {
    color: 'white',
    fontSize: 16,
  },

  eventArea: {
    width: width,
    alignSelf: 'center',
  },
  eventHead: {
    width: width * 0.85,
    alignSelf: 'center',
    alignItems: 'center',
    justifyContent: 'flex-start',
    flexDirection: 'row',
    marginVertical: 5,
  },
  eventHeadText: {
    color: 'black',
    fontSize: 20,
    fontWeight: 'bold',
  },
  eventHeadIcon: {
    color: '#FFC700',
    marginHorizontal: 5,
  },
  eventSwipeArea: {
    width: '100%',
    height: 320, // 이벤트 스와이프 영역 높이
  },
  eventBox: {
    backgroundColor: 'white',
    width: width * 0.9,
    height: '85%', // 이벤트 박스 높이
    alignSelf: 'center',
    borderRadius: 20,
    elevation: 5,
  },
  eventImageArea: {
    width: '100%',
    height: '70%', // 이벤트 이미지 영역 높이
  },
  eventImage: {
    flex: 1,
    width: '100%',
    resizeMode: 'contain',
  },
  eventTextArea: {
    width: '100%',
    height: '30%', // 이벤트 텍스트 영역 높이
    padding: 15,
  },
  eventLabelText: {
    color: 'black',
    fontSize: 20,
    fontWeight: 'bold',
  },
  eventInfoText: {
    color: 'black',
    fontSize: 14,
    marginVertical: 5,
  },
  postArea: {
    width: width,
    alignItems: 'center',
    marginVertical: 10,
  },
  postHeadArea: {
    width: width * 0.85,
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: 5,
  },
  postHeadTextIconArea: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  postHeadText: {
    color: 'black',
    fontSize: 20,
    fontWeight: 'bold',
  },
  postHeadIcon: {
    color: "#FFC700",
    marginHorizontal: 10,
  },
  postDetailArea: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  postDetailText: {
    color: 'black',
    fontSize: 17,
    marginHorizontal: 5,
  },
  postDetailIcon: {
    color: 'black',
  },
  postBoxArea: {
    width: width * 0.9,
    height: 250, // 게시물 박스 영역 높이
  },
  postBox: {
    backgroundColor: 'white',
    width: '100%',
    height: '100%',
    borderRadius: 20,
    elevation: 5,
    padding: 10,
    paddingHorizontal: 5
  },
  postLabelArea: {
    flex: 1,
    height: '20%',
    marginLeft: 15,
    marginRight: 13,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  postLabelTextArea: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '70%',
  },
  postLabelText: {
    color: 'black',
    fontSize: 19,
    paddingRight: 5
  },
  // 조회수가 20 미만일 때 "new" 아이콘 스타일
  postLabelIcon: {
    color: 'red',
    marginLeft: 5, // 제목과 아이콘 간의 간격 조절
  },
  postViewArea: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: 60,
  },
  postViewIcon: {
    color: '#F29F05',
  },
  postViewText: {
    color: 'black',
    fontSize: 17,
  },
  contestArea: {
    width: width,
    marginVertical: 15,
    alignItems: 'center',
  },
  contestHeadArea: {
    width: width * 0.85,
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: 5,
  },
  contestHeadTextArea: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  contestHeadText: {
    color: 'black',
    fontSize: 20,
    fontWeight: 'bold',
  },
  contestHeadIcon: {
    color: "#FFC700",
    marginHorizontal: 10,
  },
  contestDetailArea: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  contestDetailText: {
    color: 'black',
    fontSize: 17,
    marginHorizontal: 5,
  },
  contestDetailIcon: {
    color: 'black',
  },
  contestBoxArea: {
    height: 300,
    flexDirection: 'row',
    paddingHorizontal: 15,
  },
  contestBox: {
    backgroundColor: 'white',
    width: 150,
    height: 220,
    marginHorizontal: 10,
    borderRadius: 10,
    elevation: 10,
  },
  contestImageArea: {
    width: '100%',
    height: '70%',
    borderTopStartRadius: 10,
    borderTopEndRadius: 10,
    backgroundColor: '#e0e0e0', // 이미지가 없을 때 배경색
    justifyContent: 'center',
    alignItems: 'center',
  },
  contestImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'contain',
    borderTopRightRadius: 10,
    borderTopLeftRadius: 10,
  },
  contestTextArea: {
    width: '100%',
    height: '30%',
    borderBottomStartRadius: 10,
    borderBottomEndRadius: 10,
  },

  contestTextTitleArea: {
    width: '95%',
    height: '60%',
    alignSelf: 'center',
  },
  contestTextTitle: {
    color: 'black',
    fontSize: 14,
    fontWeight: 'bold'
  },
  contestTextInfoArea: {
    width: '95%',
    height: '40%',
    alignSelf: 'center'
  },
  contestTextInfo: {
    color: 'black',
    fontSize: 12,
  },
  contestRightArea: { // 여백
    width: 20,
  },
  // 이미지가 없을 때 표시할 대체 콘텐츠 스타일
  noImageContainer: {
    backgroundColor: '#e0e0e0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  noImageText: {
    marginTop: 5,
    color: '#555',
    fontSize: 14,
  },
  footerSpacing: {
    height: 85,
  },
});

export default MainPage;
