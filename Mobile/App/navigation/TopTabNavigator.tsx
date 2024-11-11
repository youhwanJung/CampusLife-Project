import GeneralPostsScreen from '../screens/CommunityScreens/GeneralPostsScreen'
import NoticeSchoolPostsScreen from '../screens/CommunityScreens/NoticeSchoolPostsScreen'
import NoticeHotPostsScreen from '../screens/CommunityScreens/NoticeHotPostsScreen'
import NoticeBookmarkScreen from '../screens/CommunityScreens/NoticeBookmarkScreen'
import BookmarkScreen from '../screens/CommunityScreens/BookmarkScreen'
import HotPostsScreen from '../screens/CommunityScreens/HotPostsScreen'
import DeadlineEventScreen from '../screens/EventScreens/DeadlineEventScreen';
import EventShopScreen from '../screens/EventScreens/EventShopScreen';
import { Text, View, StyleSheet, FlatList, TouchableWithoutFeedback, TouchableOpacity } from 'react-native';
import AcademicInfoScreen from '../screens/CardScreens/AcademicScreens/AcademicInfoScreen';
import AcademicRecord from '../screens/CardScreens/AcademicScreens/AcademicRecordScreen';
import SchoolClubScreen from '../screens/CommunityScreens/SchoolClubScreen';
import ContestPostScreen from '../screens/CommunityScreens/ContestPostScreen';
import { EventShopScreenStackNavigator } from '../navigation/StackNavigator'
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createMaterialTopTabNavigator } from '@react-navigation/material-top-tabs';
import { getFocusedRouteNameFromRoute } from '@react-navigation/native';
import React, { useState, useLayoutEffect } from 'react';
const CommunityTopTab = createBottomTabNavigator();
const NoticeTopTab = createBottomTabNavigator();
const CommunityTopBottomTab = createBottomTabNavigator();
const NoticeCommunityTopBottomTab = createBottomTabNavigator();
const EventTopTab = createMaterialTopTabNavigator();
const PostTopTab = createMaterialTopTabNavigator();
const PostDetailTopTab = createMaterialTopTabNavigator();
const AcademicTopTab = createMaterialTopTabNavigator();

import { UserData } from '../types/type';
import { Colors } from 'react-native/Libraries/NewAppScreen';

export const AcademicTopTabNavigator = ({ route }: any) => {
    const { userdata, LectureData } = route.params;
    return (
        <View style={{ flex: 1, backgroundColor: 'white' }}>
            <AcademicTopTab.Navigator
                screenOptions={({ }) => ({
                    tabBarStyle: {
                        elevation: 0,
                        backgroundColor: 'white',
                        height: 55,
                        //borderBottomWidth : 1,
                        zIndex: 0,
                        width: '50%',

                    },
                    tabBarIndicatorStyle: {
                        backgroundColor: '#9A9EFF',
                        width: '30%'
                    },
                    tabBarLabelStyle: {
                        //backgroundColor : 'red',
                        fontSize: 20,
                        fontWeight: 'bold'
                    },
                    gestureEnabled: false,
                    swipeEnabled: true,
                    animationEnabled: false,
                })}>
                <AcademicTopTab.Screen
                    name="학적"
                    component={AcademicInfoScreen}
                    initialParams={{ userdata, LectureData }}
                />
                <AcademicTopTab.Screen
                    name="수강신청이력"
                    component={AcademicRecord}
                    initialParams={{ userdata, LectureData }}
                />
            </AcademicTopTab.Navigator>
        </View>
    )
}


export const PostTopTabNavigator = ({ route }: any) => {
    const { userdata } = route.params;
    return (
        <View style={{ flex: 1, backgroundColor: 'white' }}>
            <PostTopTab.Navigator
                screenOptions={({ }) => ({
                    tabBarStyle: {
                        shadowOffset: {
                            width: 0,
                            height: 0, // for iOS
                        },
                        elevation: 5,
                        backgroundColor: 'white',
                        height: 50,
                        width: 260,
                        //borderBottomWidth : 1,
                        zIndex: 0,
                        borderWidth: 1,
                        marginLeft: 10,
                        marginTop: 10,
                        borderRadius: 5,

                    },
                    tabBarIndicatorStyle: {
                        backgroundColor: 'transparent',
                        //orderWidth : 5,
                        //width: 70,
                        //left: 43,
                        borderTopColor: '#9A9EFF', // 인디케이터의 색상 설정
                        borderTopWidth: 5, // 인디케이터의 두께 설정
                        width: 60,
                        marginLeft: 33
                    },
                    tabBarLabelStyle: {
                        fontSize: 20,
                        fontWeight: 'bold',
                        borderRadius: 16,
                        //elevation : 5,
                    },
                    //gestureEnabled: false,
                    //swipeEnabled: false,
                    //animationEnabled: false,
                })}>
                <PostTopTab.Screen
                    name="전체 게시판"
                    component={PostDetailTopTabNavigator}
                    initialParams={{ department_check: 0, userdata }} />
                <PostTopTab.Screen
                    name="학과 게시판"
                    component={PostDetailTopTabNavigator}
                    initialParams={{ department_check: 1, userdata }} />
            </PostTopTab.Navigator>
        </View>
    )
}

export const PostDetailTopTabNavigator = ({ route }: any) => {
    const { department_check, userdata } = route.params;
    return (
        <View style={{ flex: 1, backgroundColor: 'white' }}>
            <PostDetailTopTab.Navigator
                screenOptions={({ }) => ({
                    tabBarStyle: {
                        shadowOffset: {
                            width: 0,
                            height: 0, // for iOS
                        },
                        elevation: 0,
                        zIndex: 0,
                        //borderWidth: 1,
                        borderTopRightRadius: 20,
                        borderTopLeftRadius: 20,
                        backgroundColor: 'white',
                        width: 240,
                        height: 45,


                    },
                    tabBarIndicatorStyle: {
                        //borderWidth : 2,
                        backgroundColor: 'transparent',
                        width: 20,
                        marginLeft: 31,
                        borderTopColor: '#9A9EFF', // 인디케이터의 색상 설정
                        borderTopWidth: 5, // 인디케이터의 두께 설정
                    },
                    tabBarLabelStyle: {
                        //backgroundColor : '#9A9EFF',
                        fontSize: 17,
                        fontWeight: 'bold',
                        //paddingVertical: 8, // 위아래 여백 추가
                        //paddingHorizontal: 16, // 좌우 여백 추가
                        borderRadius: 16,
                        //elevation : 5,
                    },
                    gestureEnabled: true,
                    swipeEnabled: false,
                    animationEnabled: true
                })}>
                <PostDetailTopTab.Screen
                    name="전체"
                    component={GeneralPostsScreen}
                    initialParams={{ department_check, userdata }} />
                <PostDetailTopTab.Screen
                    name="HOT"
                    component={HotPostsScreen}
                    initialParams={{ department_check, userdata }} />
                <PostDetailTopTab.Screen
                    name="책갈피"
                    component={BookmarkScreen}
                    initialParams={{ department_check, userdata }} />
            </PostDetailTopTab.Navigator>
        </View>

    )
}

export const TopBottomTabNavigator = ({ navigation, route }: any) => {
    const { department_check, userdata } = route.params
    //전체, HOT게시글, 책갈피 상단 탭 네비게이션
    return (
        <CommunityTopBottomTab.Navigator

            screenOptions={{
                tabBarStyle: {
                    shadowOffset: {
                        width: 0,
                        height: 0, // for iOS
                    },
                    elevation: 5,
                    zIndex: 0,
                    //borderWidth: 1,
                    borderRadius: 5,
                    backgroundColor: 'white',
                    width: 210,
                    height: 34,
                    position: 'absolute',
                    top: 80,
                    marginLeft: 10,

                },
                tabBarLabelStyle: {
                    //backgroundColor : '#9A9EFF',
                    fontSize: 17,
                    fontWeight: 'bold',
                    //paddingVertical: 8, // 위아래 여백 추가
                    //paddingHorizontal: 16, // 좌우 여백 추가
                    borderRadius: 5,
                    //elevation : 5,
                    marginBottom: 6,
                },
                tabBarActiveTintColor: 'black'

            }}>
            <CommunityTopBottomTab.Screen name='전체'
                component={department_check === 3 ? SchoolClubScreen : GeneralPostsScreen}
                initialParams={{ department_check, userdata }}
                options={{
                    headerShown: false,
                    tabBarIcon: () => null,
                }}>
            </CommunityTopBottomTab.Screen>

            <CommunityTopBottomTab.Screen name='HOT'
                component={HotPostsScreen}
                initialParams={{ department_check, userdata }}
                options={{
                    headerShown: false,
                    tabBarIcon: () => null,
                }} >
            </CommunityTopBottomTab.Screen>

            <CommunityTopBottomTab.Screen name='책갈피'
                component={BookmarkScreen}
                initialParams={{ department_check, userdata }}
                options={{
                    headerShown: false,
                    tabBarIcon: () => null,
                }} >
            </CommunityTopBottomTab.Screen>
        </CommunityTopBottomTab.Navigator>

    )
}

export const NoticeTopBottomTabNavigator = ({ navigation, route }: any) => {
    const { department_check, userdata } = route.params
    console.log(department_check);
    //전체, HOT게시글, 책갈피 상단 탭 네비게이션
    return (
        <NoticeCommunityTopBottomTab.Navigator
            screenOptions={{
                tabBarStyle: {
                    shadowOffset: {
                        width: 0,
                        height: 0, // for iOS
                    },
                    elevation: 5,
                    zIndex: 0,
                    //borderWidth: 1,
                    borderRadius: 5,
                    backgroundColor: 'white',
                    width: 210,
                    height: 34,
                    position: 'absolute',
                    top: 80,
                    marginLeft: 10,

                },
                tabBarLabelStyle: {
                    //backgroundColor : '#9A9EFF',
                    fontSize: 17,
                    fontWeight: 'bold',
                    //paddingVertical: 8, // 위아래 여백 추가
                    //paddingHorizontal: 16, // 좌우 여백 추가
                    borderRadius: 5,
                    //elevation : 5,
                    marginBottom: 6,
                },
                tabBarActiveTintColor: 'black'

            }}>
            <NoticeCommunityTopBottomTab.Screen name='전체'
                component={department_check === 3 ? ContestPostScreen : NoticeSchoolPostsScreen}
                initialParams={{ department_check, userdata }}
                options={{
                    headerShown: false,
                    tabBarIcon: () => null,
                }}>
            </NoticeCommunityTopBottomTab.Screen>

            <NoticeCommunityTopBottomTab.Screen name='HOT'
                component={NoticeHotPostsScreen}
                initialParams={{ department_check, userdata }}
                options={{
                    headerShown: false,
                    tabBarIcon: () => null,
                }} >
            </NoticeCommunityTopBottomTab.Screen>

            <NoticeCommunityTopBottomTab.Screen name='책갈피'
                component={NoticeBookmarkScreen}
                initialParams={{ department_check, userdata }}
                options={{
                    headerShown: false,
                    tabBarIcon: () => null,
                }} >
            </NoticeCommunityTopBottomTab.Screen>
        </NoticeCommunityTopBottomTab.Navigator>

    )
}

//커뮤니티 전체, 학과 게시판 상단 탭 네비게이션
export const TopbTabNavigator = ({ route, navigation }: any) => {
    const { userdata } = route.params;
    return (
        <CommunityTopTab.Navigator
            screenOptions={{
                tabBarStyle: {
                    shadowOffset: {
                        width: 0,
                        height: 0, // for iOS
                    },
                    elevation: 5,
                    backgroundColor: 'white',
                    height: 50,
                    width: 370,
                    //borderBottomWidth : 1,
                    zIndex: 0,
                    //borderWidth : 1,
                    marginLeft: 10,
                    marginTop: 10,
                    borderRadius: 5,
                    position: 'absolute',
                    top: 5


                },
                tabBarLabelStyle: {
                    fontSize: 20,
                    fontWeight: 'bold',
                    borderRadius: 16,
                    //elevation : 5,
                    marginBottom: 9,
                },
                tabBarActiveTintColor: 'black'

            }}>
            <CommunityTopTab.Screen name="전체 게시판"
                initialParams={{ department_check: 0, userdata }}
                component={TopBottomTabNavigator}
                options={{
                    headerShown: false,
                    tabBarIcon: () => null,
                }}
            />

            <CommunityTopTab.Screen name="학과 게시판"
                initialParams={{ department_check: 1, userdata }}
                component={TopBottomTabNavigator}
                options={{
                    headerShown: false,
                    tabBarIcon: () => null,
                }} />

            <CommunityTopTab.Screen name="동아리"
                initialParams={{ department_check: 3, userdata }}
                component={TopBottomTabNavigator}
                options={{
                    headerShown: false,
                    tabBarIcon: () => null,
                    tabBarItemStyle: {
                        marginLeft: -14, // 원하는 만큼 왼쪽으로 이동 (값은 조정 가능)
                    },

                }} />
        </CommunityTopTab.Navigator>
    );
}

//공지사항 학교 학과 상단 탭 네비게이션
export const NoticeTopbTabNavigator = ({ route }: any) => {
    const { userdata } = route.params;
    return (
        <NoticeTopTab.Navigator
            screenOptions={{
                tabBarStyle: {
                    shadowOffset: {
                        width: 0,
                        height: 0, // for iOS
                    },
                    elevation: 5,
                    backgroundColor: 'white',
                    height: 50,
                    width: 400,
                    //borderBottomWidth : 1,
                    zIndex: 0,
                    //borderWidth : 1,
                    marginLeft: 10,
                    marginTop: 10,
                    borderRadius: 5,
                    position: 'absolute',
                    top: 5


                },
                tabBarLabelStyle: {
                    fontSize: 20,
                    fontWeight: 'bold',
                    borderRadius: 16,
                    //elevation : 5,
                    marginBottom: 9,
                },
                tabBarActiveTintColor: 'black'
            }}>
            <NoticeTopTab.Screen name="학교 공지사항"
                initialParams={{ department_check: 0, userdata }}
                component={NoticeTopBottomTabNavigator}
                options={{
                    headerShown: false,
                    tabBarIcon: () => null,
                }}
            />

            <NoticeTopTab.Screen name="학과 공지사항"
                initialParams={{ department_check: 1, userdata }}
                component={NoticeTopBottomTabNavigator}
                options={{
                    headerShown: false,
                    tabBarIcon: () => null,
                }} />

            <NoticeTopTab.Screen name="공모전"
                initialParams={{ department_check : 3, userdata }}
                component={NoticeTopBottomTabNavigator}
                options={{
                    headerShown: false,
                    tabBarIcon: () => null,
                    tabBarItemStyle: {
                        marginLeft: -23, // 원하는 만큼 왼쪽으로 이동 (값은 조정 가능)
                    },

                }} />
        </NoticeTopTab.Navigator>
    );
}