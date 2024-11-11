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
  Linking
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

import { UserData, EventData } from '../types/type'

const width = Dimensions.get('window').width;

type PostData = {
  post_id: number,
  title: string,
  contents: string,
  date: string,
  view: number,
  like: number,
  name: string,
  admin_check: boolean
}

type ContestData = {
  post_id: number,
  user_id: number
  department_check: boolean,
  inform_check: boolean,
  Club_check: boolean,
  title: string,
  date: string
  contest_check: boolean,
  url: string,
  sources: string,
  post_photo: string
}

const AdminMain = ({ navigation, route }: any) => {
  const { userdata, LectureData } = route.params;
  const [schoolpostdata, setSchoolPostData] = useState<PostData[]>([]);
  const [departmentpostdata, setDepartmentPostData] = useState<PostData[]>([]);
  const [hotpostdata, setHotPostData] = useState<PostData[]>([]);
  const [contestdata, setContestData] = useState<ContestData[]>([]);
  const [userData, setUserData] = useState<UserData>(userdata);
  const [eventData, setEventData] = useState<EventData[]>([]);
  const [Userdepartment, setUserDepartment] = useState<string>('');
  const fileUri = `${config.serverUrl}/${userData.profile_photo}`;

  /** 기본 이벤트 정보 */
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

  /** eventData 배열을 풀어서 기존 이벤트 배열에 추가 */
  const allEvents = [
    ...initialEvents,
    ...eventData.map(event => ({
      screen: "DeadlineEventScreen",
      label: event.name,
      info: event.simple_info,
      imageSource: event.event_photo[0].event_photo,
      params: { userdata: userData, eventdata: event }
    })),
  ];

  const view_count_up = async (post_id: any) => {
    try {
      const response = await fetch(`${config.serverUrl}/view_count_up`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          post_id: post_id
        })
      })
      const result = await response.json();
    } catch (error) {
      console.error('포스트 View 올리기 누르기 실패', error);
    }
  }

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

  const get_user_department = async () => {
    try {
      const response = await fetch(`${config.serverUrl}/get_department_name`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          department_name: userData.department_pk,
        })
      })
      const userdepartment = await response.json();
      const userDepartment = userdepartment.userdepartment; //키값을 치면 값을 json에서 추출할 수 있다.
      setUserDepartment(userDepartment);
    } catch (error) {
      console.error('유저 학과 이름 가져오기 실패:', error);
    }
  }

  const fetchschoolpostData = async () => {
    try {
      const response = await fetch(`${config.serverUrl}/MainPageSchoolPost`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          campus_id: userData.campus_pk,
        })
      })
      const data = await response.json();
      setSchoolPostData(data);
    } catch (error) {
      console.error('유저 학과 이름 가져오기 실패:', error);
    }
  }

  const fetchdepartmentpostData = async () => {
    try {
      const response = await fetch(`${config.serverUrl}/MainPagedepartmentPost`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          department_id: userData.department_pk
        }),
      })
      const data = await response.json();
      setDepartmentPostData(data);
    } catch (error) {
      console.error(error);
    } finally {
    }
  }
  const settingUserData = () => {
    setUserData(userdata);
  }

  const fetchhotpostData = async () => {
    try {
      const response = await fetch(`${config.serverUrl}/MainPagehotPost`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          campus_id: userData.campus_pk,
        })
      })
      const data = await response.json();
      setHotPostData(data);
    } catch (error) {
      console.error('유저 학과 이름 가져오기 실패:', error);
    }
  }

  //공모전 정보 가져오기
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
      setContestData(data);
    } catch (error) {
      console.error(error);
    }
  }

  const GetEditEventImage = async (event_id: number) => {
    try {
      const response = await fetch(`${config.serverUrl}/GetEditEventImage`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          event_id: event_id
        }),
      })
      const data = await response.json();
      return data;
    } catch (error) {
      console.error(error);
    } finally {
    }
  }

  const Get_Event_Data = async () => {
    try {
      const response = await fetch(`${config.serverUrl}/Get_Event_Data`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          campus_id: userData.campus_pk,
        }),
      });

      if (!response.ok) {
        throw new Error('서버 응답 오류');
      }
      const eventData = await response.json();
      const eventsWithImages = await Promise.all(eventData.map(async (event: any) => {
        const eventImage = await GetEditEventImage(event.event_id);
        return {
          ...event,
          event_photo: eventImage
        };
      }));
      setEventData(eventsWithImages);
    } catch (error) {
      console.error(error);
    }
  };

  const StudentInfo = async () => {
    navigation.navigate('StudentInfoNavigator', { userData, Userdepartment });
  }

  useFocusEffect(
    React.useCallback(() => {
      fetchschoolpostData();
      fetchdepartmentpostData();
      fetchhotpostData();
      fetchContestpostData();
      settingUserData();
      get_user_department();
      Get_Event_Data();
      if (navigation.getState().routes[navigation.getState().index].params?.updatedUserData) {
        const updatedUserData = navigation.getState().routes[navigation.getState().index].params.updatedUserData;
        setUserData(updatedUserData);
      }
    }, [navigation])
  )

  return (
    <View style={styles.container}>
      <ScrollView>
        {/* 프로필 영역 */}
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
                  </View>
                  <Text style={styles.userInfo}>관리자/{userData.name}</Text>
                </View>
              </View>
            </View>
            {/* 프로필 하단 영역 */}
            <View style={styles.profileBoxBottom}>
              <TouchableOpacity style={styles.tabButton} onPress={() => navigation.navigate("ManagementUserScreen")}>
                <IconI style={styles.tabIcon} name="users" size={30} />
                <Text style={styles.tabText}>유저 관리</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.tabButton} onPress={() => navigation.navigate("AdminStackNavigator")}>
                <IconD style={styles.tabIcon} name="shopping-cart" size={28} />
                <Text style={styles.tabText}>물품 등록</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.tabButton} onPress={() => navigation.navigate("AlarmDialogScreen")}>
                <IconD style={styles.tabIcon} name="bell" size={30} />
                <Text style={styles.tabText}>알림</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.tabButton} onPress={() => navigation.navigate("SchoolInfoScreen")}>
                <IconE style={styles.tabIcon} name="information-circle-outline" size={30} />
                <Text style={styles.tabText}>학교정보</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.tabButton} onPress={StudentInfo}>
                <IconB style={styles.tabIcon} name="idcard" size={30} />
                <Text style={styles.tabText}>정보변경</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>

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
                  onPress={() => {
                    navigation.navigate(event.screen, event.params)
                  }}
                  style={styles.eventBox}>
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
            <TouchableOpacity onPress={() => {
              navigation.navigate('NoticeScreenStackNavigator', {
                screen: 'NoticePostTopTabNavigator',
                params: { screen: '학교 공지사항' }
              });
            }}
              style={styles.postDetailArea}>
              <Text style={styles.postDetailText}>더보기</Text>
              <IconB style={styles.postDetailIcon} name={"caretright"} size={17} />
            </TouchableOpacity>
          </View>
          <View style={styles.postBoxArea}>
            <View style={styles.postBox}>
              {schoolpostdata.slice(0, 5).map((post, index) => (
                <TouchableOpacity style={styles.postLabelArea} key={index} onPress={async () => {
                  await view_count_up(post.post_id);
                  navigation.navigate("NoticePostDetailScreen", { item: post, userData })
                }}>
                  <View style={styles.postLabelTextArea}>
                    <Text style={styles.postLabelText}
                      numberOfLines={1}
                      ellipsizeMode="tail">{post?.title}</Text>
                    {post.view < 20 && <IconH style={styles.postLabelIcon} name="burst-new" size={40} />}
                  </View>
                  <View style={styles.postViewArea}>
                    <Text style={styles.postViewText}>{post?.view}</Text>
                    <IconB style={styles.postViewIcon} name="eyeo" size={30} />
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
            <TouchableOpacity onPress={() => {
              navigation.navigate('NoticeScreenStackNavigator', {
                screen: 'NoticePostTopTabNavigator',
                params: { screen: '학과 공지사항' }
              });
            }}
              style={styles.postDetailArea}>
              <Text style={styles.postDetailText}>더보기</Text>
              <IconB style={styles.postDetailIcon} name={"caretright"} size={17} />
            </TouchableOpacity>
          </View>
          <View style={styles.postBoxArea}>
            <View style={styles.postBox}>
              {departmentpostdata.slice(0, 5).map((post, index) => (
                <TouchableOpacity style={styles.postLabelArea} key={index} onPress={async () => {
                  await view_count_up(post.post_id);
                  navigation.navigate("NoticePostDetailScreen", { item: post, userData })
                }}>
                  <View style={styles.postLabelTextArea}>
                    <Text style={styles.postLabelText}
                      numberOfLines={1}
                      ellipsizeMode="tail">{post?.title}</Text>
                    {post.view < 20 && <IconH style={styles.postLabelIcon} name="burst-new" size={40} />}
                  </View>
                  <View style={styles.postViewArea}>
                    <Text style={styles.postViewText}>{post?.view}</Text>
                    <IconB style={styles.postViewIcon} name="eyeo" size={30} />
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
            <TouchableOpacity onPress={() => {
              navigation.navigate('CommunityScreenStackNavigator', {
                screen: 'PostTopTabNavigator',
                params: { screen: '전체 게시판', params: { screen: 'HOT' } }
              });
            }}
              style={styles.postDetailArea}>
              <Text style={styles.postDetailText}>더보기</Text>
              <IconB style={styles.postDetailIcon} name={"caretright"} size={17} />
            </TouchableOpacity>
          </View>
          <View style={styles.postBoxArea}>
            <View style={styles.postBox}>
              {hotpostdata.slice(0, 5).map((post, index) => (
                <TouchableOpacity style={styles.postLabelArea} key={index} onPress={async () => {
                  await view_count_up(post.post_id);
                  navigation.navigate("PostDetailScreen", { item: post, userData })
                }}>
                  <View style={styles.postLabelTextArea}>
                    <Text style={styles.postLabelText}
                      numberOfLines={1}
                      ellipsizeMode="tail">{post?.title}</Text>
                    {post.view < 20 && <IconH style={styles.postLabelIcon} name="burst-new" size={40} />}
                  </View>
                  <View style={styles.postViewArea}>
                    <Text style={styles.postViewText}>{post?.view}</Text>
                    <IconB style={styles.postViewIcon} name="eyeo" size={30} />
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
                  params: { screen: '전체 게시판', params: { screen: 'HOT' } }
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
    alignItems: 'center',
  },
  userName: {
    color: 'black',
    fontSize: 25,
    fontWeight: 'bold',
  },
  userInfo: {
    color: 'black',
    fontSize: 15,
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
    paddingHorizontal: 10,
  },
  contestBox: {
    backgroundColor: 'white',
    width: 150,
    height: 200,
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
});

export default AdminMain;
