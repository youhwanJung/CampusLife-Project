import React, { useState, useRef, useCallback } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import {
  Text,
  View,
  FlatList,
  TouchableWithoutFeedback,
  TouchableOpacity,
  RefreshControl,
  StyleSheet,
  Image,
} from 'react-native';
import IconB from 'react-native-vector-icons/AntDesign';
import IconC from 'react-native-vector-icons/FontAwesome';
import { Swipeable, GestureHandlerRootView } from 'react-native-gesture-handler';
import config from '../../config';
import LinearGradient from 'react-native-linear-gradient'; // 그라데이션 추가

// 게시물 데이터 타입 정의
type PostData = {
  post_id: number;
  title: string;
  contents: string;
  date: string;
  view: number;
  like: number;
  name: string;
  user_title: string;
  image?: string; // 이미지 URL 추가 (옵셔널)
  Club_check: number;
};

// 하단 공백 생성 함수 (하단바 영역 고려)
const renderEmptyItem = () => {
  return <View style={styles.footerSpacing} />;
};

const SchoolClubScreen = ({ route, navigation }: any) => {
  // 컴포넌트 상태 및 초기화
  const { userdata } = route.params;
  const [clubData, setClubData] = useState<PostData[]>([]); // 동아리 게시물 목록 상태
  const [userData, setUserData] = useState(userdata); // 유저 데이터 상태
  const [userHavePost, setUserHavePost] = useState<PostData[]>([]); // 유저가 북마크한 게시물 목록 상태
  const [refreshing, setRefreshing] = useState(false); // 새로고침 상태
  const swipeableRefs = useRef<(Swipeable | null)[]>([]); // Swipeable 참조 배열
  const [selectedImages, setSelectedImages] = useState<any[]>([]); // 선택된 이미지 상태
  const [selectedFormImages, setSelectedFormImages] = useState<FormData[]>([]); // 폼 데이터 형태의 이미지 상태

  // 이미지 업로드 API 호출
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

  // 이미지 삭제
  const handleImageRemove = (index: number) => {
    setSelectedImages(selectedImages.filter((_, i) => i !== index));
    setSelectedFormImages(selectedFormImages.filter((_, i) => i !== index));
  };

  // 동아리 게시물 가져오기 함수
  const getClubPosts = async () => {
    try {
      const response = await fetch(`${config.serverUrl}/Clubpost`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });
      const postsData = await response.json();
      setClubData(postsData); // 게시물 데이터 설정
    } catch (error) {
      console.error('동아리 게시물 가져오기 실패:', error);
    }
  };

  // 새로고침 핸들러
  const onRefresh = async () => {
    setRefreshing(true);
    await getClubPosts(); // 데이터를 다시 로드
    setRefreshing(false);
  };

  // 북마크 닫기
  const closeBookmark = useCallback((index: number) => {
    swipeableRefs.current[index]?.close();
  }, []);

  // 조회수 증가 함수 (샘플 데이터에서는 기능하지 않음)
  const viewCountUp = async (post_id: any) => {
    try {
      await fetch(`${config.serverUrl}/view_count_up`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ post_id }),
      });
    } catch (error) {
      console.error('조회수 증가 실패', error);
    }
  };

  // 북마크 추가 함수
  const addBookmark = async (item: PostData) => {
    setUserHavePost((prev) => [...prev, item]);
  };

  // 북마크 삭제 함수
  const removeBookmark = async (post_id: number) => {
    setUserHavePost((prev) => prev.filter((post) => post.post_id !== post_id));
  };

  // 북마크 처리 핸들러 (추가/삭제)
  const handleBookmark = async (item: PostData, index: number) => {
    // 이미 북마크된 게시물이면 삭제, 그렇지 않으면 추가
    if (userHavePost.some((post) => post.post_id === item.post_id)) {
      await removeBookmark(item.post_id);
    } else {
      await addBookmark(item);
    }
    closeBookmark(index); // Swipeable 닫기
  };

  // 북마크 UI 렌더링
  const renderRightActions = (item: PostData, index: number) => (
    <TouchableOpacity onPress={() => handleBookmark(item, index)} style={styles.bookmarkButton}>
      {userHavePost.some((post) => post.post_id === item.post_id) ? (
        <IconC name="bookmark" size={30} color="#F29F05" />
      ) : (
        <IconC name="bookmark-o" size={30} color="#F29F05" />
      )}
    </TouchableOpacity>
  );

  useFocusEffect(
    React.useCallback(() => {
      const fetchData = async () => {
        await getClubPosts();  // 비동기 함수 호출
      };

      fetchData(); // 비동기 함수를 호출하여 실행

    }, [])
  );

  // 게시물 리스트 아이템 렌더링 함수
  const renderItem = ({ item, index }: { item: PostData; index: number }) => (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <Swipeable
        ref={(ref) => (swipeableRefs.current[index] = ref)}
        renderRightActions={() => renderRightActions(item, index)}
        onSwipeableWillOpen={() => console.log(`${index} 스와이프 열림`)}
        onSwipeableWillClose={() => console.log(`${index} 스와이프 닫힘`)}>
        <TouchableWithoutFeedback
          onPress={async () => {
            await viewCountUp(item.post_id);
            navigation.navigate('SchoolClubDetailScreen', { item, userData });
            console.log(item);
            console.log(userData);
          }}>
          <View style={styles.postItem}>
            {/* 이미지 추가 또는 대체 콘텐츠 표시 */}
            {item.image ? (
              <Image source={{ uri: `${config.photoUrl}/${item.image}.png` }} style={styles.postImage} />
            ) : (
              <View style={[styles.postImage, styles.noImageContainer]}>
                <IconB name="picture" size={40} color="#ccc" />
                <Text style={styles.noImageText}>이미지 없음</Text>
              </View>
            )}
            <View style={styles.postContent}>
              <View style={styles.postHeader}>
                <Text style={styles.postTitle}>{item.title}</Text>
              </View>
              <View style={styles.postFooter}>
                <View style={styles.authorSection}>
                  <Text
                    style={[
                      styles.authorName,
                      item.user_title === '학교' && styles.schoolRole,
                      item.user_title === '반장' && styles.leaderRole,
                      item.user_title === '학우회장' && styles.presidentRole,
                    ]}>
                    {item.name}
                  </Text>
                  <Text style={styles.dateText}> | {item.date}</Text>
                </View>
                <View style={styles.statsSection}>
                  <View style={styles.statItem}>
                    <IconB name="eyeo" size={16} color="#555" />
                    <Text style={styles.statText}>{item.view}</Text>
                  </View>
                  <View style={styles.statItem}>
                    <IconB name="like1" size={16} color="#F29F05" />
                    <Text style={styles.statText}>{item.like}</Text>
                  </View>
                </View>
              </View>
            </View>
          </View>
        </TouchableWithoutFeedback>
      </Swipeable>
    </GestureHandlerRootView>
  );

  return (
    <View style={styles.container}>
      <View style={styles.headerSpacing} />
      <FlatList
        data={clubData}
        renderItem={renderItem}
        ListFooterComponent={renderEmptyItem}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        keyExtractor={(item) => item.post_id.toString()}
        contentContainerStyle={styles.listContent}
      />
    </View>
  );
};

// 스타일 정의
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    paddingTop: 80, // 상단 여백 조정
  },

  headerSpacing: {
    height: 40,
    backgroundColor: 'white',
  },

  listContent: {
    paddingHorizontal: 10,
    paddingBottom: 20,
  },
  postItem: {
    flexDirection: 'row',
    marginVertical: 8,
    backgroundColor: '#fafafa',
    borderRadius: 10,
    overflow: 'hidden',
    elevation: 2,
  },
  postImage: {
    width: 100,
    height: 100,
    backgroundColor: '#e0e0e0', // 이미지가 없을 때 배경색
    justifyContent: 'center',
    alignItems: 'center',
  },
  noImageContainer: {
    backgroundColor: '#e0e0e0',
  },
  noImageText: {
    marginTop: 5,
    color: '#555',
    fontSize: 14,
  },
  postContent: {
    flex: 1,
    padding: 10,
    justifyContent: 'space-between',
  },
  postHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  postTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  postFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  authorSection: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  authorName: {
    fontSize: 14,
    color: '#555',
  },
  dateText: {
    fontSize: 12,
    color: '#999',
    marginLeft: 5,
  },
  statsSection: {
    flexDirection: 'row',
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 15,
  },
  statText: {
    marginLeft: 4,
    fontSize: 12,
    color: '#555',
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
  footerSpacing: {
    height: 85,
  },
  bookmarkButton: {
    backgroundColor: '#FFDFC1',
    justifyContent: 'center',
    alignItems: 'center',
    width: 70,
  },
  bookmarkedIcon: {
    color: '#F29F05',
  },
  bookmarkIcon: {
    color: '#F29F05',
  },
});

export default SchoolClubScreen;
