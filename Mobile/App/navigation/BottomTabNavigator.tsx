import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { useNavigation } from '@react-navigation/native';
import { Text } from 'react-native';

// 필요한 스택 네비게이터들을 import
import { PostTopTabNavigator } from "../navigation/TopTabNavigator";
import { MainScreenStackNavigator, AdminMainScreenStackNavigator } from './StackNavigator';
import { CommunityScreenStackNavigator, NoticeScreenStackNavigator } from './StackNavigator';
import { AdminEventStackNavigator } from '../Admin_Screens/Navigation/AdminStackNavigator';
import { ReportStackNavigator } from '../Admin_Screens/Navigation/AdminStackNavigator';
import { AttendanceScreenStackNavigator } from './StackNavigator';
import { TimetableScreenStackNavigator } from './StackNavigator';

// 아이콘 라이브러리 import
import IconA from 'react-native-vector-icons/Entypo';
import IconB from 'react-native-vector-icons/Fontisto';
import IconC from 'react-native-vector-icons/FontAwesome6';
import IconF from 'react-native-vector-icons/FontAwesome';
import IconD from 'react-native-vector-icons/MaterialIcons';

const Tab = createBottomTabNavigator();

// 메인 바텀 탭 네비게이션
export const MainTabNavigator = ({ route }: any) => {
  const navigation: any = useNavigation(); // 네비게이션 훅 사용
  const { userdata, LectureData } = route.params; // 라우트로부터 전달된 사용자 데이터와 강의 데이터를 가져옴
  
  return (
    <Tab.Navigator
      screenOptions={{
        tabBarStyle: {
          height: 65, // 탭 바의 높이 설정
          position: 'absolute', // 탭 바를 화면 하단에 고정
          bottom: 16, 
          right: 10, 
          left: 10, 
          borderRadius: 20, // 탭 바의 둥근 모서리 설정
          backgroundColor: 'white', // 배경색 설정
        },
        tabBarActiveTintColor: 'black', // 활성화된 탭의 색상 설정
      }}>
      <Tab.Screen
        name="MainPage"
        component={MainScreenStackNavigator}
        options={{
          title: '홈',
          headerShown: false, // 상단 헤더를 숨김
          tabBarIcon: ({ color, size }) => (
            <IconC name="house" size={size} color={color} /> // 아이콘 설정
          ),
          tabBarLabel: () => (
            <Text style={{ fontSize: 13, marginBottom: 5, color: 'gray' }}>홈</Text> // 라벨 스타일 설정
          )
        }}
        initialParams={{ userdata , LectureData }} // 초기 파라미터 전달
      />
      
      <Tab.Screen
        name="CommunityScreenStackNavigator"
        component={CommunityScreenStackNavigator}
        options={{
          headerShown: false,
          tabBarIcon: ({ color, size }) => (
            <IconA name="chat" size={30} color={color} />
          ),
          tabBarLabel: () => (
            <Text style={{ fontSize: 13, marginBottom: 5, color: 'gray' }}>커뮤니티</Text>
          )
        }}
        initialParams={{ userdata }}
      />
      
      <Tab.Screen
        name="NoticeScreenStackNavigator"
        component={NoticeScreenStackNavigator}
        options={{
          headerShown: false,
          tabBarIcon: ({ color, size }) => (
            <IconA name="megaphone" size={30} color={color} />
          ),
          tabBarLabel: () => (
            <Text style={{ fontSize: 13, marginBottom: 5, color: 'gray' }}>공지사항</Text>
          )
        }}
        initialParams={{ userdata }}
      />

      <Tab.Screen
        name="AttendanceStackNavigator"
        component={AttendanceScreenStackNavigator}
        options={{
          headerShown: false,
          title: '출석',
          tabBarIcon: ({ color, size }) => (
            <IconA name="check" size={37} color={color} />
          ),
          tabBarLabel: () => (
            <Text style={{ fontSize: 13, marginBottom: 5, color: 'gray' }}>출석</Text>
          )
        }}
        initialParams={{ userdata, LectureData }}
      />

      <Tab.Screen
        name="TimetableStackNavigator"
        component={TimetableScreenStackNavigator}
        options={{
          title: '시간표',
          headerShown: false,
          tabBarIcon: ({ color, size }) => (
            <IconC name="calendar-days" size={30} color={color} />
          ),
          tabBarLabel: () => (
            <Text style={{ fontSize: 13, marginBottom: 5, color: 'gray' }}>시간표</Text>
          )
        }}
        initialParams={{ userdata, LectureData }}
      />
    </Tab.Navigator>
  );
}

// 관리자 바텀 탭 네비게이션
export const AdminTabNavigator = ({ route }: any) => {
  const navigation: any = useNavigation(); // 네비게이션 훅 사용
  const { userdata, LectureData } = route.params; // 라우트로부터 전달된 사용자 데이터와 강의 데이터를 가져옴
  
  return (
    <Tab.Navigator
      screenOptions={{
        tabBarStyle: {
          height: 65, // 탭 바의 높이 설정
          position: 'absolute', // 탭 바를 화면 하단에 고정
          bottom: 16,
          right: 10,
          left: 10,
          borderRadius: 20, // 탭 바의 둥근 모서리 설정
          backgroundColor: 'white', // 배경색 설정
        },
        tabBarActiveTintColor: 'black', // 활성화된 탭의 색상 설정
      }}>
        
      <Tab.Screen
        name="AdminMainScreenStackNavigator"
        component={AdminMainScreenStackNavigator}
        options={{
          title: '홈',
          headerShown: false, // 상단 헤더를 숨김
          tabBarIcon: ({ color, size }) => (
            <IconC name="house" size={size} color={color} /> // 아이콘 설정
          ),
          tabBarLabel: () => (
            <Text style={{ fontSize: 13, marginBottom: 5, color: 'gray' }}>홈</Text> // 라벨 스타일 설정
          )
        }}
        initialParams={{ userdata , LectureData }} // 초기 파라미터 전달
      />

      <Tab.Screen
        name="AdminStackNavigator"
        component={AdminEventStackNavigator}
        options={{
          headerShown: false,
          title: '이벤트',
          tabBarIcon: ({ color, size }) => (
            <IconF name="star" size={34} color={color} />
          ),
          tabBarLabel: () => (
            <Text style={{ fontSize: 13, marginBottom: 5, color: 'gray' }}>이벤트</Text>
          )
        }}
        initialParams={{ userdata }}
      />

      <Tab.Screen
        name="ReportStackNavigator"
        component={ReportStackNavigator}
        options={{
          title: '게시글 관리',
          headerShown: false, // 상단 헤더를 숨김
          tabBarIcon: ({ color, size }) => (
            <IconD name="report" size={36} color={color} />
          ),
          tabBarLabel: () => (
            <Text style={{ fontSize: 13, marginBottom: 5, color: 'gray' }}>게시글 관리</Text>
          )
        }}
        initialParams={{ userdata, LectureData }}
      />

      <Tab.Screen
        name="NoticeScreenStackNavigator"
        component={NoticeScreenStackNavigator}
        options={{
          headerShown: false,
          tabBarIcon: ({ color, size }) => (
            <IconA name="megaphone" size={30} color={color} />
          ),
          tabBarLabel: () => (
            <Text style={{ fontSize: 13, marginBottom: 5, color: 'gray' }}>공지사항 관리</Text>
          )
        }}
        initialParams={{ userdata }}
      />

      <Tab.Screen
        name="CommunityScreenStackNavigator"
        component={CommunityScreenStackNavigator}
        options={{
          headerShown: false,
          tabBarIcon: ({ color, size }) => (
            <IconA name="chat" size={30} color={color} />
          ),
          tabBarLabel: () => (
            <Text style={{ fontSize: 13, marginBottom: 5, color: 'gray' }}>커뮤니티 관리</Text>
          )
        }}
        initialParams={{ userdata }}
      />
      
    </Tab.Navigator>
  );
}
