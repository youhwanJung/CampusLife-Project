import React, { useEffect, useLayoutEffect, useState } from 'react';
import { Text, Touchable, TouchableOpacity, View } from 'react-native';
import { createStackNavigator } from '@react-navigation/stack';
import { useNavigation } from '@react-navigation/native';
import { useFocusEffect } from '@react-navigation/native';
import ManagementUserScreen from "../Admin_Screens/UserManagement"
import MainScreen from '../screens/MainScreen';
import AttendanceScreen from '../screens/AttendanceScreens/AttendanceScreen';
import TimetableScreen from '../screens/TimetableScreen';
import WritePostScreen from '../screens/CommunityScreens/WritePostScreen';
import LoginScreen from '../screens/LoginScreens/LoginScreen';
import TosScreen from '../screens/LoginScreens/TosScreen';
import RegisterScreen from '../screens/LoginScreens/RegisterScreen';
import SearchScreen from '../screens/LoginScreens/SearchScreen';
import { AcademicTopTabNavigator } from '../navigation/TopTabNavigator';
import EventShopScreen from '../screens/EventScreens/EventShopScreen'
import EventHaveCouponScreen from '../screens/EventScreens/EventHaveCouponScreen';
import { getFocusedRouteNameFromRoute } from '@react-navigation/native';
import PostDetailScreen from '../screens/CommunityScreens/PostDetailScreen';
import SchoolClubDetailScreen from '../screens/CommunityScreens/SchoolClubDetailScreen';
import NoticePostDetailScreen from '../screens/CommunityScreens/NoticePostDetailScreen';
import SearchPostScreen from '../screens/CommunityScreens/SerchPostScreen';
import WritePostDetailScreen from '../screens/CommunityScreens/NoticeWritePostScreen';
import FullScreenCamera from '../screens/AttendanceScreens/FullScreenCamera'
import AttendanceCheckEventScreen from '../screens/EventScreens/AttendanceCheckEventScreen';
import FriendCodeEventScreen from '../screens/EventScreens/FriendCodeEventScreen';
import StudentInfoScreen from '../screens/CardScreens/StudentInfoScreen';
import AcademicInfoScreen from '../screens/CardScreens/AcademicScreens/AcademicInfoScreen';
import SchoolInfoScreen from '../screens/CardScreens/SchoolInfoScreen';
import StudyRoomScreen from '../screens/CardScreens/StudyRoomScreen'
import AlarmDialogScreen from '../screens/CardScreens/AlarmDialogScreen';
import DeadlineEventScreen from '../screens/EventScreens/DeadlineEventScreen';
import EditPostScreen from '../screens/CommunityScreens/EditPostScreen';
import SchoolClubSignScreen from '../screens/CommunityScreens/SchoolClubSignScreen';
import SchoolClubSignStateScreen from '../screens/CommunityScreens/SchoolClubSignStateScreen';
import SchoolClubSignDetailScreen from '../screens/CommunityScreens/SchoolClubSignDetailScreen';
import { UserData } from "../types/type";
import { PostTopTabNavigator } from './TopTabNavigator';
import { MainTabNavigator } from './BottomTabNavigator'
import { AdminTabNavigator } from './BottomTabNavigator';
import { TopbTabNavigator, NoticeTopbTabNavigator } from './TopTabNavigator'
import AdminMainScreen from '../Admin_Screens/AdminMain';
import SchoolInfoChangeScreen from '../Admin_Screens/SchoolInfoChange';
import NoticeSchoolPostsScreen from '../screens/CommunityScreens/NoticeSchoolPostsScreen'
import StudyRoomDetailScreen from '../screens/CardScreens/StudyRoomDetailScreen';
import MyPostScreen from '../screens/CommunityScreens/MyPostScreen';
import { RegisterItemStackNavigator } from '../Admin_Screens/Navigation/AdminStackNavigator';
import PointHistoryScreen from '../screens/PointHistoryScreen';
import type { IMPData } from 'iamport-react-native';


import IconD from 'react-native-vector-icons/AntDesign';
import IconG from 'react-native-vector-icons/FontAwesome6';
import IconF from 'react-native-vector-icons/FontAwesome';
import IconH from 'react-native-vector-icons/FontAwesome5';
import config from '../config';

const RootStack = createStackNavigator();
const LoginStack = createStackNavigator();
const MainStack = createStackNavigator();
const AdminMainStack = createStackNavigator();
const CoummunityStack = createStackNavigator();
const NoticeStack = createStackNavigator();
const EventStack = createStackNavigator();
const AttendanceStack = createStackNavigator();
const TimetableStack = createStackNavigator();
const EventShopStack = createStackNavigator();
const ReqularEventScreenStack = createStackNavigator();
const AdminStack = createStackNavigator();
const StudyRoomStack = createStackNavigator();

export interface CertificationParams {
    params: IMPData.CertificationData;
    userCode: string;
    tierCode?: string;
}

export interface PaymentParams {
    params: IMPData.PaymentData;
    userCode: string;
    tierCode?: string;
}

export type RootStackParamList = {
    Home: undefined;
    Certification: CertificationParams | undefined;
    CertificationTest: undefined;
    CertificationResult: any;
    Payment: PaymentParams | undefined;
    PaymentTest: undefined;
    PaymentResult: any;
};

//모든 네비게이터 객체의 최상위 네비게이터
export const RootStackNavigator = (route: any) => {
    const navigation: any = useNavigation();
    const [dataFromScreen1, setDataFromScreen1] = useState<any>();

    return (
        <RootStack.Navigator initialRouteName="LoginScreenStackNavigator">
            <RootStack.Screen name="LoginScreenStackNavigator" component={LoginScreenStackNavigator} options={{ headerShown: false }} />
            <RootStack.Screen name="AdminTabNavigator" component={AdminTabNavigator} options={{ headerShown: false }} />
            <RootStack.Screen name="MainTabNavigator" component={MainTabNavigator} options={{ headerShown: false }} />
            <RootStack.Screen
                name="WritePostScreen"
                component={WritePostScreen}
                options={({ navigation }: any) => ({
                    headerStyle: {
                        backgroundColor: '#F27405',
                    },
                    headerLeft: () => (
                        <TouchableOpacity onPress={() => navigation.navigate("CommunityScreenStackNavigator")}>
                            <IconD style={{ marginLeft: 10 }} name="back" size={30} color="white" />
                        </TouchableOpacity>
                    ),
                    headerTintColor: 'white',
                    headerTitleAlign: 'center',
                    title: '커뮤니티',
                })}
            />
            <RootStack.Screen
                name="EditPostScreen"
                //하단 바텀 탭 바를 없애기 위해선 여기에 있을 수밖에 없다.
                //포스터의 디테일한 데이터를 인자로 넘겨줘야한다.
                component={EditPostScreen}
                options={({ navigation }: any) => ({
                    headerStyle: {
                        backgroundColor: '#F27405',
                    },
                    headerLeft: () => (
                        <TouchableOpacity onPress={() => navigation.goBack()}>
                            <IconD style={{ marginLeft: 10 }} name="back" size={30} color="white" />
                        </TouchableOpacity>
                    ),
                    headerTintColor: 'white',
                    headerTitleAlign: 'center',
                    title: '게시물 수정',
                })}
            />
            <RootStack.Screen
                name="PostDetailScreen"
                component={PostDetailScreen}
                options={({ navigation }: any) => ({
                    headerStyle: {
                        backgroundColor: '#F27405',
                    },
                    headerLeft: () => (
                        <TouchableOpacity onPress={() => navigation.goBack()}>
                            <IconD style={{ marginLeft: 10 }} name="back" size={30} color="white" />
                        </TouchableOpacity>
                    ),
                    headerTintColor: 'white',
                    headerTitleAlign: 'center',
                    title: '커뮤니티',
                })}
            />

            <RootStack.Screen
                name="SchoolClubDetailScreen"
                component={SchoolClubDetailScreen}
                options={({ navigation }: any) => ({
                    headerStyle: {
                        backgroundColor: '#F27405',
                    },
                    headerLeft: () => (
                        <TouchableOpacity onPress={() => navigation.goBack()}>
                            <IconD style={{ marginLeft: 10 }} name="back" size={30} color="white" />
                        </TouchableOpacity>
                    ),
                    headerTintColor: 'white',
                    headerTitleAlign: 'center',
                    title: '커뮤니티',
                })}
            />

            <RootStack.Screen
                name="SchoolClubSignScreen"
                component={SchoolClubSignScreen}
                options={({ navigation }: any) => ({
                    headerStyle: {
                        backgroundColor: '#F27405',
                    },
                    headerLeft: () => (
                        <TouchableOpacity onPress={() => navigation.goBack()}>
                            <IconD style={{ marginLeft: 10 }} name="back" size={30} color="white" />
                        </TouchableOpacity>
                    ),
                    headerTintColor: 'white',
                    headerTitleAlign: 'center',
                    title: '동아리 신청',
                })}
            />

            <RootStack.Screen
                name="SchoolClubSignStateScreen"
                component={SchoolClubSignStateScreen}
                options={({ navigation }: any) => ({
                    headerStyle: {
                        backgroundColor: '#F27405',
                    },
                    headerLeft: () => (
                        <TouchableOpacity onPress={() => navigation.goBack()}>
                            <IconD style={{ marginLeft: 10 }} name="back" size={30} color="white" />
                        </TouchableOpacity>
                    ),
                    headerTintColor: 'white',
                    headerTitleAlign: 'center',
                    title: '커뮤니티',
                })}
            />

            <RootStack.Screen
                name="SchoolClubSignDetailScreen"
                component={SchoolClubSignDetailScreen}
                options={({ navigation }: any) => ({
                    headerStyle: {
                        backgroundColor: '#F27405',
                    },
                    headerLeft: () => (
                        <TouchableOpacity onPress={() => navigation.goBack()}>
                            <IconD style={{ marginLeft: 10 }} name="back" size={30} color="white" />
                        </TouchableOpacity>
                    ),
                    headerTintColor: 'white',
                    headerTitleAlign: 'center',
                    title: '커뮤니티',
                })}
            />


            <RootStack.Screen
                name="NoticePostDetailScreen"
                component={NoticePostDetailScreen}
                options={({ navigation }: any) => ({
                    headerStyle: {
                        backgroundColor: '#F27405',
                    },
                    headerLeft: () => (
                        <TouchableOpacity onPress={() => navigation.goBack()}>
                            <IconD style={{ marginLeft: 10 }} name="back" size={30} color="white" />
                        </TouchableOpacity>
                    ),
                    headerTintColor: 'white',
                    headerTitleAlign: 'center',
                    title: '공지사항',
                })}
            />

            <RootStack.Screen
                name="WritePostDetailScreen"
                component={WritePostDetailScreen}
                options={({ navigation }: any) => ({
                    headerStyle: {
                        backgroundColor: '#F27405',
                    },
                    headerLeft: () => (
                        <TouchableOpacity onPress={() => navigation.goBack()}>
                            <IconD style={{ marginLeft: 10 }} name="back" size={30} color="white" />
                        </TouchableOpacity>
                    ),
                    headerTintColor: 'white',
                    headerTitleAlign: 'center',
                    title: '공지사항',
                })}
            />

            <RootStack.Screen name="SearchPostScreen"
                component={SearchPostScreen}
                options={{ headerShown: false }}>
            </RootStack.Screen>
            <AttendanceStack.Screen name="FullScreenCamera" component={FullScreenCamera} options={{ headerShown: false }} />
        </RootStack.Navigator>
    )
}

//로그인 관련 스택 네비게이터
export const LoginScreenStackNavigator = () => {
    return (
        <LoginStack.Navigator>
            <LoginStack.Screen name="LoginScreen" component={LoginScreen} options={{ headerShown: false }} />
            <LoginStack.Screen
                name="TosScreen"
                component={TosScreen}
                options={({ navigation }: any) => ({
                    headerStyle: {
                        backgroundColor: '#F27405',
                    },
                    headerLeft: () => (
                        <TouchableOpacity onPress={() => navigation.goBack()}>
                            <IconD style={{ marginLeft: 10 }} name="back" size={30} color="white" />
                        </TouchableOpacity>
                    ),
                    headerTintColor: 'white',
                    headerTitleAlign: 'center',
                    title: '이용약관',
                })}
            />
            <LoginStack.Screen
                name="RegisterScreen"
                component={RegisterScreen}
                options={({ navigation }: any) => ({
                    headerStyle: {
                        backgroundColor: '#F27405',
                    },
                    headerLeft: () => (
                        <TouchableOpacity onPress={() => navigation.goBack()}>
                            <IconD style={{ marginLeft: 10 }} name="back" size={30} color="white" />
                        </TouchableOpacity>
                    ),
                    headerTintColor: 'white',
                    headerTitleAlign: 'center',
                    title: '회원가입',
                })}
            />
            <LoginStack.Screen
                name="SearchScreen"
                component={SearchScreen}
                options={({ navigation }: any) => ({
                    headerStyle: {
                        backgroundColor: '#F27405',
                    },
                    headerLeft: () => (
                        <TouchableOpacity onPress={() => navigation.goBack()}>
                            <IconD style={{ marginLeft: 10 }} name="back" size={30} color="white" />
                        </TouchableOpacity>
                    ),
                    headerTintColor: 'white',
                    headerTitleAlign: 'center',
                    title: '아이디/비밀번호 찾기',
                })}
            />
        </LoginStack.Navigator>
    )
}



//메인 페이지 관련 스택 네비게이터
export const MainScreenStackNavigator = ({ route }: any) => {
    const navigation: any = useNavigation();
    React.useLayoutEffect(() => {
        const routeName = getFocusedRouteNameFromRoute(route);
        if (routeName === "MainScreen" || routeName === undefined) {
            navigation.setOptions({
                tabBarStyle: {
                    height: 65,
                    position: 'absolute',
                    bottom: 16,
                    right: 10,
                    left: 10,
                    borderRadius: 20,
                    backgroundColor: 'white',
                }
            });
        } else {
            navigation.setOptions({ tabBarStyle: { display: 'none' } });
        }
    }, [navigation, route])
    const { userdata, LectureData } = route.params;
    return (
        <MainStack.Navigator>
            <MainStack.Screen name="MainScreen" component={MainScreen} initialParams={{ userdata, LectureData }} options={{ headerShown: false }} />
            <MainStack.Screen
                name="StudentInfoNavigator"
                component={StudentInfoScreen}
                options={{

                    headerStyle: {
                        backgroundColor: '#F27405',
                    },

                    headerTintColor: 'white',
                    headerTitleAlign: 'center',
                    title: '정보변경',
                }}
            />
            <MainStack.Screen
                name="AcademicInfoNavigator"
                component={AcademicTopTabNavigator}
                initialParams={{ userdata, LectureData }}
                options={{
                    headerStyle: {
                        backgroundColor: '#F27405',
                    },
                    headerTintColor: 'white',
                    headerTitleAlign: 'center',
                    title: '학적정보',
                }}
            />
            <MainStack.Screen
                name="AlarmDialogScreen"
                initialParams={{ userdata }}
                component={AlarmDialogScreen}
                options={{
                    headerStyle: {
                        backgroundColor: '#F27405',
                    },
                    headerLeft: () => (
                        <TouchableOpacity
                            onPress={async () => {
                                try {
                                    // 서버 요청을 보냄
                                    await fetch(`${config.serverUrl}/init_aram_count`, {
                                        method: 'POST',
                                        headers: { 'Content-Type': 'application/json' },
                                        body: JSON.stringify({ user_id: userdata.user_pk }),
                                    });
                                    console.log('알람 카운트 초기화 성공');
                                } catch (error) {
                                    console.error('알람 카운트 초기화 실패', error);
                                }
                                // 서버 요청이 끝난 후 뒤로 가기
                                navigation.navigate("MainScreen")
                            }}
                        >
                            <IconD style={{ marginLeft: 10 }} name="back" size={30} color="white" />
                        </TouchableOpacity>
                    ),
                    headerTintColor: 'white',
                    headerTitleAlign: 'center',
                    title: '알람 확인',
                }}
            />

            <MainStack.Screen
                name="SchoolInfoScreen"
                component={SchoolInfoScreen}
                initialParams={{ userdata }}
                options={{
                    headerStyle: {
                        backgroundColor: '#F27405',
                    },
                    headerTintColor: 'white',
                    headerTitleAlign: 'center',
                    title: '학교 정보',
                }}
            />
            <MainStack.Screen
                name="StudyRoomStackNavigator"
                component={StudyRoomStackNavigator}
                initialParams={{ userdata }}
                options={{
                    headerShown: false
                }}
            />
            <MainStack.Screen
                name="EventScreenStackNavigator"
                component={EventScreenStackNavigator}
                initialParams={{ userdata }}
                options={{
                    headerShown: false
                }} />

            <MainStack.Screen
                name="AttendanceCheckEventScreen"
                component={AttendanceCheckEventScreen}
                initialParams={{ userdata }}
                options={{
                    headerStyle: {
                        backgroundColor: '#F27405',
                    },
                    headerTintColor: 'white',
                    headerTitleAlign: 'center',
                    title: '이벤트',
                }} />
            <MainStack.Screen
                name="FriendCodeEventScreen"
                component={FriendCodeEventScreen}
                initialParams={{ userdata }}
                options={{
                    headerStyle: {
                        backgroundColor: '#F27405',
                    },
                    headerTintColor: 'white',
                    headerTitleAlign: 'center',
                    title: '이벤트',
                }} />
            <MainStack.Screen
                name="DeadlineEventScreen"
                component={DeadlineEventScreen}
                options={{
                    headerStyle: {
                        backgroundColor: '#F27405',
                    },
                    headerTintColor: 'white',
                    headerTitleAlign: 'center',
                    title: '이벤트',
                }} />

            <MainStack.Screen
                name="PointHistoryScreen"
                component={PointHistoryScreen}
                initialParams={{ userdata }}
                options={{
                    headerStyle: {
                        backgroundColor: '#F27405',
                    },
                    headerTintColor: 'white',
                    headerTitleAlign: 'center',
                    title: '포인트 이력',
                }} />
        </MainStack.Navigator>
    );
};

export const AdminMainScreenStackNavigator = ({ route }: any) => {
    const navigation: any = useNavigation();
    const { userdata, LectureData } = route.params;
    React.useLayoutEffect(() => {
        const routeName = getFocusedRouteNameFromRoute(route);
        if (routeName === "AdminMain" || routeName === undefined) {
            navigation.setOptions({
                tabBarStyle: {
                    height: 65,
                    position: 'absolute',
                    bottom: 16,
                    right: 10,
                    left: 10,
                    borderRadius: 20,
                    backgroundColor: 'white',
                }
            });
        } else {
            navigation.setOptions({ tabBarStyle: { display: 'none' } });
        }
    }, [navigation, route])
    return (
        <AdminMainStack.Navigator>
            <AdminMainStack.Screen name="AdminMain" component={AdminMainScreen} initialParams={{ userdata, LectureData }} options={{ headerShown: false }} />
            <AdminMainStack.Screen
                name="StudentInfoNavigator"
                component={StudentInfoScreen}
                options={{
                    headerStyle: {
                        backgroundColor: '#F27405',
                    },
                    headerTintColor: 'white',
                    headerTitleAlign: 'center',
                    title: '정보변경',
                }}
            />
            <AdminMainStack.Screen
                name="AcademicInfoNavigator"
                component={AcademicTopTabNavigator}
                initialParams={{ userdata, LectureData }}
                options={{
                    headerStyle: {
                        backgroundColor: '#F27405',
                    },
                    headerTintColor: 'white',
                    headerTitleAlign: 'center',
                    title: '학적정보',
                }}
            />
            <AdminMainStack.Screen
                name="AlarmDialogScreen"
                initialParams={{ userdata }}
                component={AlarmDialogScreen}
                options={{
                    headerStyle: {
                        backgroundColor: '#F27405',
                    },
                    headerTintColor: 'white',
                    headerTitleAlign: 'center',
                    title: '알람 확인',
                }}
            />

            <AdminMainStack.Screen
                name="SchoolInfoScreen"
                component={SchoolInfoScreen}
                initialParams={{ userdata }}
                options={{
                    headerStyle: {
                        backgroundColor: '#F27405',
                    },
                    headerTintColor: 'white',
                    headerTitleAlign: 'center',
                    title: '학교 정보',
                }}
            />
            <AdminMainStack.Screen
                name="SchoolInfoChangeScreen"
                component={SchoolInfoChangeScreen}
                initialParams={{ userdata }}
                options={{
                    headerStyle: {
                        backgroundColor: '#F27405',
                    },
                    /*headerRight: () => (
                        <TouchableOpacity onPress={() => navigation.navigate("AdminMain")}>
                            <IconF style={{ marginRight: 10 }} name="edit" size={30} color="white" />
                        </TouchableOpacity>
                    ),*/
                    headerTintColor: 'white',
                    headerTitleAlign: 'center',
                    title: '학교 편집',
                }}
            />
            <AdminMainStack.Screen
                name="AdminStackNavigator"
                initialParams={{ userdata }}
                component={RegisterItemStackNavigator}
                options={{
                    headerShown: false
                }}
            />
            <AdminMainStack.Screen
                name="ManagementUserScreen"
                component={ManagementUserScreen}
                initialParams={{ userdata }}
                options={{
                    headerStyle: {
                        backgroundColor: '#F27405',
                    },
                    headerTintColor: 'white',
                    headerTitleAlign: 'center',
                    title: '유저 관리',
                }} />

            <AdminMainStack.Screen
                name="FriendCodeEventScreen"
                component={FriendCodeEventScreen}
                initialParams={{ userdata }}
                options={{
                    headerStyle: {
                        backgroundColor: '#F27405',
                    },
                    headerTintColor: 'white',
                    headerTitleAlign: 'center',
                    title: '이벤트',
                }} />
            <AdminMainStack.Screen
                name="DeadlineEventScreen"
                component={DeadlineEventScreen}
                options={{
                    headerStyle: {
                        backgroundColor: '#F27405',
                    },
                    headerTintColor: 'white',
                    headerTitleAlign: 'center',
                    title: '이벤트',
                }} />

            <AdminMainStack.Screen
                name="AttendanceCheckEventScreen"
                component={AttendanceCheckEventScreen}
                initialParams={{ userdata }}
                options={{
                    headerStyle: {
                        backgroundColor: '#F27405',
                    },
                    headerTintColor: 'white',
                    headerTitleAlign: 'center',
                    title: '이벤트',
                }} />
        </AdminMainStack.Navigator>
    );
};

//커뮤니티 페이지 관련 스택 네비게이터
export const CommunityScreenStackNavigator = ({ route, navigation }: any) => {
    const { userdata } = route.params;
    return (
        <CoummunityStack.Navigator>
            <CoummunityStack.Screen
                name="PostTopTabNavigator"
                component={TopbTabNavigator}
                initialParams={{ userdata }}
                options={{
                    headerStyle: {
                        backgroundColor: '#F27405',
                    },
                    headerLeft: () => (
                        <View style={{ flexDirection: 'row' }}>
                            <TouchableOpacity onPress={() => navigation.goBack()}>
                                <IconD style={{ marginLeft: 10 }} name="back" size={30} color="white" />
                            </TouchableOpacity>
                            {userdata.title !== "학교" && (
                                <TouchableOpacity onPress={() => navigation.navigate("StudentMyPostScreen", { userdata })}>
                                    <IconF style={{ marginLeft: 10 }} name="user" size={30} color="white" />
                                </TouchableOpacity>
                            )}
                        </View>
                    ),
                    headerRight: () => (
                        <View style={{ flexDirection: 'row' }}>
                            {userdata.title !== "학교" && (
                                <TouchableOpacity onPress={() => navigation.navigate("WritePostScreen", { userdata })}>
                                    <IconD style={{ marginRight: 10 }} name="form" size={30} color="white" />
                                </TouchableOpacity>
                            )}
                            <TouchableOpacity onPress={() => navigation.navigate("SearchPostScreen", { userdata })}>
                                <IconD style={{ marginRight: 10 }} name="search1" size={30} color="white" />
                            </TouchableOpacity>
                        </View>
                    ),
                    headerTintColor: 'white',
                    headerTitleAlign: 'center',
                    title: '커뮤니티',
                }}
            />
            <CoummunityStack.Screen
                name="StudentMyPostScreen"
                component={MyPostScreen}
                initialParams={{ userdata }}
                options={{
                    headerStyle: {
                        backgroundColor: '#F27405',
                    },
                    headerLeft: () => (
                        <View style={{ flexDirection: 'row' }}>
                            <TouchableOpacity
                                onPress={() => navigation.navigate(PostTopTabNavigator)}>
                                <IconD style={{ marginLeft: 10, }} name="back" size={30} color="white" />
                            </TouchableOpacity>
                        </View>
                    ),
                    headerTintColor: 'white',
                    headerTitleAlign: 'center',
                    title: '내가 쓴 게시글',
                }}
            />
        </CoummunityStack.Navigator>

    );
};

//공지사항 스택 네비게이터
export const NoticeScreenStackNavigator = ({ route, navigation }: any) => {
    const { userdata } = route.params;
    return (
        <NoticeStack.Navigator>
            <NoticeStack.Screen
                name="NoticePostTopTabNavigator"
                component={NoticeTopbTabNavigator}
                initialParams={{ userdata }}
                options={{
                    headerStyle: {
                        backgroundColor: '#F27405',
                    },
                    headerLeft: () => (
                        <View style={{ flexDirection: 'row' }}>
                            <TouchableOpacity onPress={() => navigation.goBack()}>
                                <IconD style={{ marginLeft: 10 }} name="back" size={30} color="white" />
                            </TouchableOpacity>
                            {userdata.title !== "일반학생" && (
                                <TouchableOpacity onPress={() => navigation.navigate("AdminMyPostScreen", { userdata })}>
                                    <IconF style={{ marginLeft: 10 }} name="user" size={30} color="white" />
                                </TouchableOpacity>
                            )}
                        </View>
                    ),
                    headerRight: () => (
                        <View style={{ flexDirection: 'row' }}>
                            {userdata.title !== "일반학생" && (
                                <TouchableOpacity onPress={() => navigation.navigate("WritePostDetailScreen", { userdata })}>
                                    <IconD style={{ marginRight: 10 }} name="form" size={30} color="white" />
                                </TouchableOpacity>
                            )}
                            <TouchableOpacity onPress={() => navigation.navigate("SearchPostScreen", { userdata })}>
                                <IconD style={{ marginRight: 10 }} name="search1" size={30} color="white" />
                            </TouchableOpacity>
                        </View>
                    ),
                    headerTintColor: 'white',
                    headerTitleAlign: 'center',
                    title: '공지사항',
                }}
            />
            <NoticeStack.Screen
                name="AdminMyPostScreen"
                component={MyPostScreen}
                initialParams={{ userdata }}
                options={{
                    headerStyle: {
                        backgroundColor: '#F27405',
                    },
                    headerLeft: () => (
                        <View style={{ flexDirection: 'row' }}>
                            <TouchableOpacity
                                onPress={() => navigation.navigate("NoticePostTopTabNavigator")}>
                                <IconD style={{ marginLeft: 10, }} name="back" size={30} color="white" />
                            </TouchableOpacity>
                        </View>
                    ),
                    headerTintColor: 'white',
                    headerTitleAlign: 'center',
                    title: '내가 쓴 게시글',
                }}
            />
        </NoticeStack.Navigator>

    );
};

//이벤트 페이지 관련 스택 네비게이터
export const EventScreenStackNavigator = ({ navigation, route }: any) => {
    const { userdata, userPoint } = route.params;
    return (
        <EventStack.Navigator>
            <EventStack.Screen name="EventShopScreenStackNavigator"
                component={EventShopScreenStackNavigator}
                initialParams={{ userdata, userPoint }}
                options={{
                    headerStyle: {
                        backgroundColor: '#F27405',
                    },
                    headerLeft: () => (
                        <TouchableOpacity
                            onPress={() => navigation.goBack()}>
                            <IconD style={{ marginLeft: 10, }} name="back" size={30} color="white" />
                        </TouchableOpacity>
                    ),
                    headerRight: () => (
                        <TouchableOpacity
                            onPress={() => navigation.navigate("EventHaveCouponScreen")}>
                            <Text style={{ color: 'black', marginRight: 10, }}><IconG name="ticket" size={30} /></Text>
                        </TouchableOpacity>
                    ),
                    headerTintColor: 'white',
                    headerTitleAlign: 'center',
                    title: '이벤트 상점',
                }}
            />
            <EventShopStack.Screen name="EventHaveCouponScreen"
                component={EventHaveCouponScreen}
                initialParams={{ userdata, userPoint }}
                options={{
                    headerStyle: {
                        backgroundColor: '#F27405',
                    },
                    headerLeft: () => (
                        <TouchableOpacity
                            onPress={() => navigation.navigate("EventShopScreenStackNavigator")}>
                            <IconD style={{ marginLeft: 10, }} name="back" size={30} color="white" />
                        </TouchableOpacity>
                    ),
                    headerTintColor: 'white',
                    headerTitleAlign: 'center',
                    title: '쿠폰함',
                }} />
        </EventStack.Navigator>
    );
};


//출석체크 페이지 관련 스택 네비게이터
export const AttendanceScreenStackNavigator = ({ navigation, route }: any) => {
    const { userdata, LectureData } = route.params;
    //console.log(userdata);
    return (
        <AttendanceStack.Navigator>
            <AttendanceStack.Screen name="AttendanceScreen"
                component={AttendanceScreen} initialParams={{ userdata, LectureData }}
                options={{
                    headerStyle: {
                        backgroundColor: '#F27405',
                    },


                    headerLeft: () => (
                        <TouchableOpacity
                            onPress={() => navigation.navigate("MainPage")}>
                            <IconD style={{ marginLeft: 10, }} name="back" size={30} color="white" />
                        </TouchableOpacity>
                    ),
                    headerTintColor: 'white',
                    headerTitleAlign: 'center',
                    title: '출석',
                }} />
        </AttendanceStack.Navigator>
    );
};

//시간표 페이지 관련 스택 네비게이터
export const TimetableScreenStackNavigator = ({ route, navigation }: any) => {
    const { userdata, LectureData } = route.params;
    return (
        <TimetableStack.Navigator>
            <TimetableStack.Screen name="TimetableScreen"
                component={TimetableScreen}
                initialParams={{ userdata, LectureData }}
                options={{
                    headerStyle: {
                        backgroundColor: '#F27405',
                    },


                    headerLeft: () => (
                        <TouchableOpacity
                            onPress={() => navigation.navigate("MainPage")}>
                            <IconD style={{ marginLeft: 10, }} name="back" size={30} color="white" />
                        </TouchableOpacity>
                    ),
                    headerTintColor: 'white',
                    headerTitleAlign: 'center',
                    title: '시간표',
                }} />
        </TimetableStack.Navigator>
    );
};

export const EventShopScreenStackNavigator = ({ navigation, route }: any) => {
    const { userdata, userPoint } = route.params;
    //console.log(userdata);
    return (
        <EventShopStack.Navigator>
            <EventShopStack.Screen
                name="EventShopScreen"
                component={EventShopScreen}
                initialParams={{ userdata, userPoint }}
                options={{
                    headerShown: false
                }} />
        </EventShopStack.Navigator>
    )
}

export const StudyRoomStackNavigator = ({ navigation, route }: any) => {
    const { userdata } = route.params;
    return (
        <StudyRoomStack.Navigator>
            <StudyRoomStack.Screen
                name="StudyRoomScreen"
                component={StudyRoomScreen}
                initialParams={{ userdata }}
                options={{
                    headerStyle: {
                        backgroundColor: '#F27405',
                    },
                    headerRight: () => (
                        <TouchableOpacity onPress={() => navigation.navigate("StudyRoomDetailScreen")}>
                            <IconH style={{ marginRight: 10 }} name="calendar-check" size={30} color="white" />
                        </TouchableOpacity>
                    ),
                    headerTintColor: 'white',
                    headerTitleAlign: 'center',
                    title: '스터디룸',
                }} />
            <StudyRoomStack.Screen
                name="StudyRoomDetailScreen"
                component={StudyRoomDetailScreen}
                initialParams={{ userdata }}
                options={{
                    headerStyle: {
                        backgroundColor: '#F27405',
                    },
                    headerTintColor: 'white',
                    headerTitleAlign: 'center',
                    title: '스터디룸',
                }} />
        </StudyRoomStack.Navigator>
    )
}