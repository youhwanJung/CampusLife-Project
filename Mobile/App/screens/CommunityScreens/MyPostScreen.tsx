import React, { useState, useRef, useCallback , useEffect} from 'react';
import { useFocusEffect } from '@react-navigation/native';
import { Text, View, FlatList, TouchableWithoutFeedback, TouchableOpacity, RefreshControl, StyleSheet } from 'react-native';
import IconB from 'react-native-vector-icons/AntDesign';
import IconC from 'react-native-vector-icons/FontAwesome';
import { UserData } from '../../types/type';
import { Swipeable, GestureHandlerRootView } from 'react-native-gesture-handler';
import config from '../../config';
import { el } from 'date-fns/locale';
import DropDownPicker from 'react-native-dropdown-picker';

type PostData = {
    post_id: number;
    title: string;
    contents: string;
    date: string;
    view: number;
    like: number;
    name: string;
    user_title: string;
    inform_check: boolean;
    contest_check: boolean;
    Club_check: boolean;
    department_check: boolean;
};

const renderEmptyItem = () => <View style={styles.footerSpacing} />;

const MyPostScreen = ({ route, navigation }: any) => {
    const { userdata } = route.params;
    const [communityData, setCommunityData] = useState<PostData[]>([]); //전체
    const [userData, setUserData] = useState<UserData>(userdata);
    const [userHavePost, setUserHavePost] = useState<any[]>([]);
    const [refreshing, setRefreshing] = useState(false);
    const swipeableRefs = useRef<(Swipeable | null)[]>(new Array().fill(null));
    const [open, setOpen] = useState(false); //드롭다운 메뉴 열기 닫기
    const [value, setValue] = useState('전체'); //카테고리 값

    const [noticePost, setNoticePost] = useState<PostData[]>([]); //학교공지사항
    const [noticeDepartmentPost, setNoticeDepartmentPost] = useState<PostData[]>([]); //학과공지사항
    const [contestPost, setContestPost] = useState<PostData[]>([]); //공모전
    const [communityPost, setCommunityPost] = useState<PostData[]>([]); //전체게시글
    const [departmentCommunityPost, SetDepartmentCommunityPost] = useState<PostData[]>([]); //학과게시글
    const [clubPost, SetClubPost] = useState<PostData[]>([]); //동아리

    useEffect(() => {
        if (value == "전체") {
            setValue("전체");
        }else if(value == "전체게시판") {
            setValue("전체게시판");
        }else if(value == "학과게시판") {
            setValue("학과게시판");
        }else if(value == "동아리게시판") {
            setValue("동아리게시판");
        }else if(value == "학교공지사항") {
            setValue("학교공지사항");
        }else if(value == "학과공지사항") {
            setValue("학과공지사항");
        }else if(value == "공모전게시글") {
            setValue("공모전게시글");
        }
      }, [value]);

    //일반유저
    const [items1, setItems1] = useState([
        { label: '전체', value: '전체' },
        { label: '전체게시판', value: '전체게시판' },
        { label: '학과게시판', value: '학과게시판' },
        { label: '동아리게시판', value: '동아리게시판' }
    ]);

    //권한유저
    const [items2, setItems2] = useState([
        { label: '전체', value: '전체' },
        { label: '전체게시판', value: '전체게시판' },
        { label: '학과게시판', value: '학과게시판' },
        { label: '학과공지사항', value: '학과공지사항' },
        { label: '동아리게시판', value: '동아리게시판' }
    ]);

    //관리자
    const [items3, setItems3] = useState([
        { label: '전체', value: '전체' },
        { label: '학교공지사항', value: '학교공지사항' },
        { label: '학과공지사항', value: '학과공지사항' },
        { label: '공모전게시글', value: '공모전게시글' },
    ]);

    const FilterData = () => {
        if(value == "전체") {
            return communityData
        }else if(value == "전체게시판" ) {
            return communityPost
        }else if (value == "학과게시판") {
            return departmentCommunityPost
        }else if (value == "동아리게시판") {
            return clubPost
        }else if (value == "학교공지사항") {
            return noticePost
        }else if (value == "학과공지사항") {
            return noticeDepartmentPost
        }else if (value == "공모전게시글") {
            return contestPost
        }
    }

    const onRefresh = async () => {
        setRefreshing(true);
        await AreYouHavePost();
        setTimeout(() => setRefreshing(false), 500);
    };

    const closeBookmark = useCallback((index: number) => {
        swipeableRefs.current[index]?.close();
    }, []);

    const viewCountUp = async (post_id: number) => {
        try {
            await fetch(`${config.serverUrl}/view_count_up`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ post_id }),
            });
        } catch (error) {
            console.error('조회수 증가 실패:', error);
        }
    };

    const addBookmark = async (user_pk: number, post_pk: number) => {
        try {
            const response = await fetch(`${config.serverUrl}/add_book_mark`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ user_id: user_pk, post_id: post_pk }),
            });
            if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        } catch (error) {
            console.error('북마크 추가 실패:', error);
        }
    };

    const removeBookmark = async (user_pk: number, post_pk: number) => {
        try {
            const response = await fetch(`${config.serverUrl}/delete_book_mark`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ user_id: user_pk, post_id: post_pk }),
            });
            if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        } catch (error) {
            console.error('북마크 삭제 실패:', error);
        }
    };

    const handleBookmark = async (item: PostData, index: number) => {
        try {
            if (userHavePost.some(posts => item.post_id === posts.post_id)) {
                await removeBookmark(userData.user_pk, item.post_id);
                setUserHavePost(prev => prev.filter(post => post.post_id !== item.post_id));
            } else {
                await addBookmark(userData.user_pk, item.post_id);
                setUserHavePost(prev => [...prev, item]);
            }
            closeBookmark(index);
        } catch (error) {
            console.error('북마크 처리 실패:', error);
        }
    };

    const renderRightActions = (item: PostData, index: number) => (
        <TouchableOpacity onPress={() => handleBookmark(item, index)} style={styles.bookmarkButton}>
            {userHavePost.some(posts => item.post_id === posts.post_id) ? (
                <Text style={styles.bookmarkedIcon}>
                    <IconC name="bookmark" size={40} />
                </Text>
            ) : (
                <Text style={styles.bookmarkIcon}>
                    <IconC name="bookmark-o" size={40} />
                </Text>
            )}
        </TouchableOpacity>
    );

    const getMyPostData = async () => {
        try {
            const response = await fetch(`${config.serverUrl}/getMyPostData`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ user_id: userData.user_pk }),
            });
            const postsData = await response.json();

            let noticePost : PostData[]= [];
            let noticeDepartmentPost : PostData[] = [];
            let contestPost : PostData[] = [];
            let communityPost : PostData[] = [];
            let departmentCommunityPost : PostData[] = [];
            let clubPost : PostData[] = [];

           

            // postsData 배열을 순회하며 조건에 맞게 분류
            postsData.forEach((post : PostData)=> {
                if (post.inform_check === true && post.contest_check === false && post.department_check === false) {
                    noticePost.push(post);  // 공지사항 게시물
                } else if (post.inform_check === true && post.contest_check === false && post.department_check === true) {
                    noticeDepartmentPost.push(post);  // 학과 공지사항 게시물
                } else if (post.inform_check === true && post.contest_check === true && post.department_check === false) {
                    contestPost.push(post);  // 경진대회 게시물
                } else if (post.inform_check === false && post.Club_check === false && post.department_check === false) {
                    communityPost.push(post);  // 커뮤니티 게시물
                } else if (post.inform_check === false && post.Club_check === false && post.department_check === true) {
                    departmentCommunityPost.push(post);  // 학과 커뮤니티 게시물
                } else if (post.inform_check === false && post.Club_check === true && post.department_check === false) {
                    clubPost.push(post);  // 동아리 게시물
                }
            });
            // 각각의 상태 업데이트
            setNoticePost(noticePost);
            setNoticeDepartmentPost(noticeDepartmentPost);
            setContestPost(contestPost);
            setCommunityPost(communityPost);
            SetDepartmentCommunityPost(departmentCommunityPost);
            SetClubPost(clubPost);
            setCommunityData(postsData); //전체
        } catch (error) {
            console.error('게시물 가져오기 실패:', error);
        }
    };

    const AreYouHavePost = async () => {
        try {
            const response = await fetch(`${config.serverUrl}/get_user_have_post`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ user_id: userData.user_pk }),
            });
            const userHavePosts = await response.json();
            setUserHavePost(userHavePosts);
        } catch (error) {
            console.error('북마크 가져오기 실패:', error);
        }
    };

    const SetCategoryItem = () => {
        if (userData.title == "일반학생") {
            return items1
        } else if (userData.title == "학교") {
            return items3
        } else {
            return items2
        }
    }

    const SetCategorySetItem = () => {
        if (userData.title == "일반학생") {
            return setItems1
        } else if (userData.title == "학교") {
            return setItems3
        } else {
            return setItems2
        }
    }

    useFocusEffect(
        React.useCallback(() => {
            const fetchData = async () => {
                await getMyPostData();
                await AreYouHavePost();
            };
    
            fetchData(); // 비동기 함수를 호출하여 실행
    
        }, [])
    );
    
    const renderItem = ({ item, index }: { item: PostData; index: number }) => (
        <GestureHandlerRootView style={{ flex: 1 }}>
            <Swipeable ref={instance => (swipeableRefs.current[index] = instance)} renderRightActions={() => renderRightActions(item, index)}>
                <TouchableWithoutFeedback
                    onPress={async () => {
                        await viewCountUp(item.post_id);
                        console.log(item);
                        if (item.inform_check === true && item.Club_check === false) {
                            navigation.navigate('NoticePostDetailScreen', { item, userData })
                        } else if(item.inform_check === false && item.Club_check === false){
                            navigation.navigate('PostDetailScreen', { item, userData });
                        } else if(item.Club_check === true){
                            navigation.navigate('SchoolClubDetailScreen', { item, userData });
                        }
                    }}>
                    <View style={styles.postItem}>
                        <View style={styles.postHeader}>
                            <View style={styles.postTitleSection}>
                                <Text style={styles.postTitle} numberOfLines={1}>{item.title}</Text>
                            </View>
                            <View style={styles.viewCountSection}>
                                <Text style={styles.viewIcon}>
                                    <IconB name="eyeo" size={26} />
                                </Text>
                                <Text style={styles.viewCountText}>{item.view}</Text>
                            </View>
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
                                <Text> | {item.date}</Text>
                            </View>
                            <View style={styles.likeCountSection}>
                                <Text style={styles.likeIcon}>
                                    <IconB name="like1" size={21} />
                                </Text>
                                <Text style={styles.likeCountText}>{item.like}</Text>
                            </View>
                        </View>
                    </View>
                </TouchableWithoutFeedback>
            </Swipeable>
        </GestureHandlerRootView>
    );

    return (
        <View style={styles.container}>
            <View style={styles.CategorySpace}>
                <DropDownPicker
                    open={open}
                    value={value}
                    items={SetCategoryItem()}
                    setOpen={setOpen}
                    setValue={setValue}
                    setItems={SetCategorySetItem()}
                    containerStyle={{ width: 160, backgroundColor: 'white', zIndex: 1000 }}
                    dropDownContainerStyle={styles.dropdown}
                    style={styles.dropdownStyle}
                    labelStyle={styles.labelStyle}
                    placeholderStyle={styles.placeholderStyle}
                />
            </View>
            <FlatList
                data={FilterData()}
                renderItem={renderItem}
                ListFooterComponent={renderEmptyItem}
                refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
            />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: 'white',
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
    },
    likeCountSection: {
        width: '13%',
        flexDirection: 'row',
        alignItems: 'center',
        bottom: 5,
        left: 2,
        justifyContent: 'flex-start',
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
    postTitle: {
        fontSize: 19,
        marginLeft: 10,
        color: 'black',
    },
    viewIcon: {
        color: '#F29F05',
    },
    viewCountText: {
        color: 'black',
        marginLeft: 4,
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
    footerSpacing: {
        height: 85,
    },
    likeIcon: {
        color: '#F29F05',
    },
    likeCountText: {
        color: 'black',
        marginLeft: 7,
        top: 1
    },
    dropdown: {
        backgroundColor: '#ffffff',  // 드롭다운 리스트의 배경색
        borderColor: '#cccccc',  // 테두리 색상
        borderRadius: 10,  // 모서리 둥글게
        borderLeftWidth: 2,
        borderRightWidth: 2,
        borderBottomWidth: 2
    },

    dropdownStyle: {
        backgroundColor: 'white',  // 선택된 옵션의 배경색
        borderColor: '#cccccc',  // 기본 테두리 색상
        borderRadius: 10,  // 모서리를 둥글게
        height: 50,  // 높이 설정
        paddingHorizontal: 10,  // 텍스트와 테두리 사이 간격
        borderWidth: 2
    },

    labelStyle: {
        fontSize: 16,  // 폰트 크기 설정
        color: 'black',  // 글자 색상
        fontWeight: 'bold'
    },

    placeholderStyle: {
        fontSize: 14,  // 플레이스홀더 폰트 크기
        color: 'black',  // 플레이스홀더 색상
    },

    CategorySpace: {
        height: '7%',
        padding: 10
    }
});

export default MyPostScreen;
