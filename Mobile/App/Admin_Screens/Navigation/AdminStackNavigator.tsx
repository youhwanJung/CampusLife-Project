import React, { useEffect, useLayoutEffect, useState } from 'react';
import { Text, Touchable, TouchableOpacity, View } from 'react-native';
import { createStackNavigator } from '@react-navigation/stack';
import { useNavigation } from '@react-navigation/native';
import { useFocusEffect } from '@react-navigation/native';
import IconD from 'react-native-vector-icons/AntDesign';
import CheckEvent from '../Event_Screens/CheckEvent';
import ModifyEvent from '../Event_Screens/ModifyEvent';
import ParticipantEvent from '../Event_Screens/ParticipantEvent';
import RegisterEvent from "../Event_Screens/RegisterEvent"
import CheckProduct from '../Product_Screens/CheckProduct';
import ModifyProduct from '../Product_Screens/ModifyProduct';
import RegisterProduct from '../Product_Screens/RegisterProduct';
import CheckReportPost from '../Report_Screens/CheckReportPost';
import ManagementUserScreen from '../UserManagement';

const AdminEventStack = createStackNavigator();
const ReportPostStack = createStackNavigator();
const RegisterItemStack = createStackNavigator();

/** 관리자 이벤트 스택 네비게이터 */
export const AdminEventStackNavigator = ({ navigation, route }: any) => {
    const { userdata } = route.params;
    return (
        <AdminEventStack.Navigator>
            <AdminEventStack.Screen name="CheckEvent"
                initialParams={{ userdata }}
                component={CheckEvent}
                options={{
                    headerStyle: {
                        backgroundColor: '#F27405',
                    },
                    headerLeft: () => (
                        <TouchableOpacity
                            onPress={() => navigation.navigate("AdminMain")}>
                            <IconD style={{ marginLeft: 10, }} name="back" size={30} color="white" />
                        </TouchableOpacity>
                    ),
                    headerTintColor: 'white',
                    headerTitleAlign: 'center',
                    title: '이벤트',
                }} />

            <AdminEventStack.Screen name="ParticipantEvent"
                initialParams={{ userdata }}
                component={ParticipantEvent}
                options={{
                    headerStyle: {
                        backgroundColor: '#F27405',
                    },
                    headerLeft: () => (
                        <TouchableOpacity
                            onPress={() => navigation.navigate("CheckEvent")}>
                            <IconD style={{ marginLeft: 10, }} name="back" size={30} color="white" />
                        </TouchableOpacity>
                    ),
                    headerTintColor: 'white',
                    headerTitleAlign: 'center',
                    title: '이벤트',
                }} />

            <AdminEventStack.Screen name="RegisterEvent"
                initialParams={{ userdata }}
                component={RegisterEvent}
                options={{
                    headerStyle: {
                        backgroundColor: '#F27405',
                    },
                    headerLeft: () => (
                        <TouchableOpacity
                            onPress={() => navigation.navigate("CheckEvent")}>
                            <IconD style={{ marginLeft: 10, }} name="back" size={30} color="white" />
                        </TouchableOpacity>
                    ),
                    headerTintColor: 'white',
                    headerTitleAlign: 'center',
                    title: '이벤트',
                }} />
            
            <AdminEventStack.Screen name="ModifyEvent"
                initialParams={{ userdata }}
                component={ModifyEvent}
                options={{
                    headerStyle: {
                        backgroundColor: '#F27405',
                    },
                    headerLeft: () => (
                        <TouchableOpacity
                            onPress={() => navigation.navigate("CheckEvent")}>
                            <IconD style={{ marginLeft: 10, }} name="back" size={30} color="white" />
                        </TouchableOpacity>
                    ),
                    headerTintColor: 'white',
                    headerTitleAlign: 'center',
                    title: '이벤트 편집',
                }} />
        </AdminEventStack.Navigator>
    );
};

//관리자 신고관리 스택 네비게이터
export const ReportStackNavigator = ({ navigation, route }: any) => {
    const { userdata } = route.params;
    return (
        <ReportPostStack.Navigator>
            <ReportPostStack.Screen name="CheckReportPost"
                component={CheckReportPost}
                initialParams={{ userdata }}
                options={{
                    headerStyle: {
                        backgroundColor: '#F27405',
                    },
                    headerLeft: () => (
                        <TouchableOpacity
                            onPress={() => navigation.navigate("AdminMain")}>
                            <IconD style={{ marginLeft: 10, }} name="back" size={30} color="white" />
                        </TouchableOpacity>
                    ),
                    headerTintColor: 'white',
                    headerTitleAlign: 'center',
                    title: '게시글 신고 관리',
                }} />
        </ReportPostStack.Navigator>
    );
};

//관리자 아이템 등록 및 수정
export const RegisterItemStackNavigator = ({ navigation, route }: any) => {
    const { userdata } = route.params;
    return (
        <RegisterItemStack.Navigator>
            <RegisterItemStack.Screen name="CheckProduct"
                component={CheckProduct}
                initialParams={{ userdata }}
                options={{
                    headerStyle: {
                        backgroundColor: '#F27405',
                    },
                    headerLeft: () => (
                        <TouchableOpacity
                            onPress={() => navigation.navigate("AdminMain")}>
                            <IconD style={{ marginLeft: 10, }} name="back" size={30} color="white" />
                        </TouchableOpacity>
                    ),
                    headerTintColor: 'white',
                    headerTitleAlign: 'center',
                    title: '물품 등록 현황',
                }} />
                
            <RegisterItemStack.Screen name="RegisterProduct"
                component={RegisterProduct}
                initialParams={{ userdata }}
                options={{
                    headerStyle: {
                        backgroundColor: '#F27405',
                    },
                    headerLeft: () => (
                        <TouchableOpacity
                            onPress={() => navigation.navigate("CheckProduct")}>
                            <IconD style={{ marginLeft: 10, }} name="back" size={30} color="white" />
                        </TouchableOpacity>
                    ),
                    headerTintColor: 'white',
                    headerTitleAlign: 'center',
                    title: '물품 등록',
                }} />

            <RegisterItemStack.Screen name="ModifyProduct"
                component={ModifyProduct}
                initialParams={{ userdata }}
                options={{
                    headerStyle: {
                        backgroundColor: '#F27405',
                    },
                    headerLeft: () => (
                        <TouchableOpacity
                            onPress={() => navigation.navigate("CheckProduct")}>
                            <IconD style={{ marginLeft: 10, }} name="back" size={30} color="white" />
                        </TouchableOpacity>
                    ),
                    headerTintColor: 'white',
                    headerTitleAlign: 'center',
                    title: '물품 편집',
                }} />
        </RegisterItemStack.Navigator>
    );
};