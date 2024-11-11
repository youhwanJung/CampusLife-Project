import React, { useState, useRef, useEffect } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import {
  Text,
  View,
  FlatList,
  TouchableWithoutFeedback,
  RefreshControl,
  StyleSheet,
} from 'react-native';
import IconB from 'react-native-vector-icons/AntDesign';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { Picker } from '@react-native-picker/picker';
import { UserData } from '../../types/type';
import config from '../../config';

// 타입 정의
type ReportUser = {
  reportId: number;
  report_name: string;
  post_id: number;
  department_check: boolean;
  user_id: number;
  title: string;
  contents: string;
  write_date: string;
  view: number;
  like: number;
  userStudentId: number;
  userTitle: string;
  post_writer: string;
  campusId: number;
  campusName: string;
  departmentId: number;
  writer_department: string;
  writer_profile: string;
};

type CommentReport = {
  report_comment_id: number;
  comment_id: number;
  report_comment_name: string;
  contents: string;
  comment_date: string;
  comment_like: number;
  post_id: number;
  department_check: boolean;
  user_id: number;
  student_id: number;
  student_name: string;
  department_id: number;
  department_name: string;
};

/**
 * 신고된 게시글과 댓글을 확인하는 컴포넌트입니다.
 */
const CheckReportPost = ({ route, navigation }: any) => {
  const { userdata } = route.params;
  const ref = useRef(null);

  // 상태 변수 선언
  const [userData, setUserData] = useState<UserData>(userdata);
  const [userReport, setUserReport] = useState<ReportUser[]>([]);
  const [userCommentReport, setUserCommentReport] = useState<CommentReport[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedType, setSelectedType] = useState('게시글'); // 게시글/댓글 선택
  const [selectedCategory, setSelectedCategory] = useState('전체 게시판'); // 카테고리 선택
  const [selectedDepartment, setSelectedDepartment] = useState(''); // 학과 선택
  const [departments, setDepartments] = useState<string[]>([]); // 학과 목록

  // 화면에 집중될 때마다 데이터 가져오기
  useFocusEffect(
    React.useCallback(() => {
      const fetchData = async () => {
        try {
          await getUserReport();
          await getDepartments();
          await getUserCommentReport();
        } catch (error) {
          console.error('데이터 가져오기 오류:', error);
        }
      };
      fetchData();
    }, [])
  );

  // 학과 게시판 선택 시 학과 기본값 설정
  useEffect(() => {
    if (selectedCategory === '학과 게시판' && departments.length > 0) {
      setSelectedDepartment(departments[0]);
    }
  }, [selectedCategory, departments]);

  /**
   * 신고된 게시글 데이터를 서버로부터 가져옵니다.
   */
  const getUserReport = async () => {
    try {
      const response = await fetch(`${config.serverUrl}/getUserReportInfo`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });
      if (!response.ok) throw new Error('네트워크 응답 오류');

      let data = await response.json();
      // 작성일 기준 내림차순 정렬
      data.sort(
        (a: ReportUser, b: ReportUser) =>
          new Date(b.write_date).getTime() - new Date(a.write_date).getTime()
      );
      setUserReport(data);
    } catch (error) {
      console.error('게시글 데이터 가져오기 실패:', error);
    }
  };

  /**
   * 신고된 댓글 데이터를 서버로부터 가져옵니다.
   */
  const getUserCommentReport = async () => {
    try {
      const response = await fetch(`${config.serverUrl}/getUserCommentReportInfo`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });
      if (!response.ok) throw new Error('네트워크 응답 오류');

      let data = await response.json();
      setUserCommentReport(data);
    } catch (error) {
      console.error('댓글 데이터 가져오기 실패:', error);
    }
  };

  /**
   * 학과 목록을 서버로부터 가져옵니다.
   */
  const getDepartments = async () => {
    try {
      const response = await fetch(`${config.serverUrl}/get_department`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ campus_id: userData.campus_pk }),
      });
      if (!response.ok) throw new Error('네트워크 응답 오류');

      const data = await response.json();
      const departmentNames = data.map((item: any) => item.department_name);
      setDepartments(departmentNames);
    } catch (error) {
      console.error('학과 목록 가져오기 실패:', error);
    }
  };

  /**
   * 화면 새로고침 시 데이터를 다시 가져옵니다.
   */
  const onRefresh = async () => {
    setRefreshing(true);
    if (selectedType === '게시글') {
      await getUserReport();
    } else if (selectedType === '댓글') {
      await getUserCommentReport();
    }
    setRefreshing(false);
  };

  /**
   * 리스트 아이템을 렌더링합니다.
   */
  const renderItem = ({ item }: { item: ReportUser | CommentReport }) => {
    if (selectedType === '게시글' && 'title' in item) {
      // 게시글 필터링
      if (
        (selectedCategory === '전체 게시판' && !item.department_check) ||
        (selectedCategory === '학과 게시판' &&
          item.department_check &&
          item.writer_department === selectedDepartment)
      ) {
        return (
          <GestureHandlerRootView style={{ flex: 1 }}>
            <TouchableWithoutFeedback
              onPress={() =>
                navigation.navigate('PostDetailScreen', { item, userData: userdata })
              }
            >
              <View style={styles.postItem}>
                <View style={styles.postHeader}>
                  <View style={styles.postTitleSection}>
                    <Text style={styles.postTitle}>{item.title}</Text>
                  </View>
                  <View style={styles.viewCountSection}>
                    <Text style={styles.viewIcon}>
                      <IconB name="eyeo" size={20} />
                    </Text>
                    <Text style={styles.viewCountText}>{item.view}</Text>
                  </View>
                </View>
                <View style={styles.postFooter}>
                  <View style={styles.authorSection}>
                    <Text
                      style={[
                        styles.authorName,
                        item.userTitle === '학교' && styles.schoolRole,
                        item.userTitle === '반장' && styles.leaderRole,
                        item.userTitle === '학우회장' && styles.presidentRole,
                      ]}
                    >
                      {item.post_writer}
                    </Text>
                    <Text> | {item.write_date}</Text>
                    <Text style={styles.reporterText}>신고자: {item.report_name}</Text>
                  </View>
                  <View style={styles.likeCountSection}>
                    <Text style={styles.likeIcon}>
                      <IconB name="like1" size={18} />
                    </Text>
                    <Text style={styles.likeCountText}>{item.like}</Text>
                  </View>
                </View>
              </View>
            </TouchableWithoutFeedback>
          </GestureHandlerRootView>
        );
      }
    } else if (selectedType === '댓글' && 'comment_id' in item) {
      // 댓글 필터링
      if (
        (selectedCategory === '전체 게시판' && !item.department_check) ||
        (selectedCategory === '학과 게시판' &&
          item.department_check &&
          item.department_name === selectedDepartment)
      ) {
        return (
          <GestureHandlerRootView style={{ flex: 1 }}>
            <TouchableWithoutFeedback
              onPress={() =>
                navigation.navigate('PostDetailScreen', { item, userData: userdata })
              }
            >
              <View style={styles.postItem}>
                <View style={styles.postHeader}>
                  <View style={styles.postTitleSection}>
                    <Text style={styles.postTitle}>{item.contents}</Text>
                  </View>
                  <View style={styles.viewCountSection}>
                    <Text style={styles.viewIcon}>
                      <IconB name="eyeo" size={20} />
                    </Text>
                    <Text style={styles.viewCountText}>{item.comment_like}</Text>
                  </View>
                </View>
                <View style={styles.postFooter}>
                  <View style={styles.authorSection}>
                    <Text style={styles.authorName}>{item.student_name}</Text>
                    <Text> | {item.comment_date}</Text>
                    <Text style={styles.reporterText}>신고자: {item.report_comment_name}</Text>
                  </View>
                  <View style={styles.likeCountSection}>
                    <Text style={styles.likeIcon}>
                      <IconB name="like1" size={18} />
                    </Text>
                    <Text style={styles.likeCountText}>{item.comment_like}</Text>
                  </View>
                </View>
              </View>
            </TouchableWithoutFeedback>
          </GestureHandlerRootView>
        );
      }
    }
    return null;
  };

  /**
   * 사용자 타이틀에 따라 색상을 반환합니다.
   */
  const getTitleColor = (title: string) => {
    switch (title) {
      case '학교':
        return 'red';
      case '반장':
        return 'green';
      case '학우회장':
        return 'blue';
      default:
        return 'black';
    }
  };

  return (
    <View style={styles.container} ref={ref}>
      {/* 필터 선택 영역 */}
      <View style={styles.pickerContainer}>
        <Picker
          selectedValue={selectedType}
          style={styles.picker}
          onValueChange={(itemValue) => setSelectedType(itemValue)}
        >
          <Picker.Item label="게시글" value="게시글" />
          <Picker.Item label="댓글" value="댓글" />
        </Picker>
        <Picker
          selectedValue={selectedCategory}
          style={styles.picker}
          onValueChange={(itemValue) => {
            setSelectedCategory(itemValue);
            if (itemValue === '학과 게시판' && departments.length > 0) {
              setSelectedDepartment(departments[0]);
            }
          }}
        >
          <Picker.Item label="전체 게시판" value="전체 게시판" />
          <Picker.Item label="학과 게시판" value="학과 게시판" />
        </Picker>
        {selectedCategory === '학과 게시판' && (
          <Picker
            selectedValue={selectedDepartment}
            style={styles.picker}
            onValueChange={(itemValue) => setSelectedDepartment(itemValue)}
          >
            {departments.map((department, index) => (
              <Picker.Item key={index} label={department} value={department} />
            ))}
          </Picker>
        )}
      </View>

      {/* 신고된 게시글/댓글 리스트 */}
      <FlatList
        style={styles.flatliststyle}
        data={selectedType === '게시글' ? userReport : userCommentReport}
        renderItem={renderItem}
        keyExtractor={(item, index) => index.toString()}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        ListFooterComponent={<View style={styles.footerSpacing} />}
      />
    </View>
  );
};

// 스타일 정의
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
  },
  pickerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 10,
    backgroundColor: 'white',
  },
  picker: {
    flex: 1,
    marginHorizontal: 5,
    backgroundColor: '#eeeeee',
  },
  flatliststyle: {
    flex: 1,
  },
  postItem: {
    paddingHorizontal: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#CCCCCC',
    backgroundColor: 'white',
    flex: 1,
    height: 70,
  },
  postHeader: {
    flex: 1,
    height: '60%',
    flexDirection: 'row',
  },
  postFooter: {
    width: '100%',
    height: '40%',
    flexDirection: 'row',
  },
  postTitleSection: {
    width: '87%',
    justifyContent: 'center',
    paddingRight: 10,
  },
  viewCountSection: {
    width: '13%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-start',
  },
  authorSection: {
    width: '87%',
    flexDirection: 'row',
    alignItems: 'center',
  },
  likeCountSection: {
    width: '13%',
    flexDirection: 'row',
    alignItems: 'center',
    bottom: 5,
    left: 2,
    justifyContent: 'flex-start',
  },
  postTitle: {
    fontSize: 18,
    margin: 5,
    marginLeft: 10,
    color: 'black',
  },
  viewIcon: {
    color: '#F29F05',
  },
  viewCountText: {
    color: 'black',
    marginLeft: 7,
  },
  authorName: {
    fontSize: 13,
    marginLeft: 10,
  },
  schoolRole: {
    color: 'red',
  },
  leaderRole: {
    color: 'green',
  },
  presidentRole: {
    color: 'blue',
  },
  reporterText: {
    color: 'black',
    fontSize: 13,
    paddingLeft: 10,
  },
  likeIcon: {
    color: '#F29F05',
  },
  likeCountText: {
    color: 'black',
    marginLeft: 7,
    top: 1,
  },
  footerSpacing: {
    height: 85,
  },
});

export default CheckReportPost;
