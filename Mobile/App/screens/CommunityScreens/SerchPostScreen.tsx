import React, { useState, useEffect, useRef } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    TextInput,
    FlatList,
    TouchableWithoutFeedback,
    Animated,
    ActivityIndicator,
} from 'react-native';
import IconD from 'react-native-vector-icons/AntDesign';
import IconB from 'react-native-vector-icons/AntDesign';
import { UserData } from '../../types/type';
import config from '../../config';
import DropDownPicker from 'react-native-dropdown-picker';

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
    department_check: boolean;
    inform_check: boolean;
    Club_check: boolean;
    contest_check: boolean;
    url: string;
    sources: string;
};

const SearchPostScreen: React.FC = ({ route, navigation }: any) => {
    // 경로에서 사용자 데이터 가져오기
    const { userdata } = route.params;
    const [searchtext, setsearchtext] = useState(''); // 검색어 상태 관리

    // 게시물 데이터를 분류하여 상태로 관리
    const [generalCommunityData, setgeneralCommunityData] = useState<PostData[]>([]); // 학교 커뮤니티 데이터
    const [departmentCommunityData, setDepartmentCommunityPost] = useState<PostData[]>([]); // 학과 커뮤니티 데이터
    const [schoolNoticeData, setSchoolNoticeData] = useState<PostData[]>([]); // 학교 공지사항 데이터
    const [departmentNoticeData, setDepartmentNoticeData] = useState<PostData[]>([]); // 학과 공지사항 데이터
    const [allPostData, setAllPostData] = useState<PostData[]>([]); // 모든 게시물 데이터
    const [userData, setUserData] = useState<UserData>(userdata); // 사용자 데이터
    const [contestPost, setContestPost] = useState<PostData[]>([]); // 공모전 데이터
    const [clubPost, SetClubPost] = useState<PostData[]>([]); // 동아리 데이터

    // 드롭다운 메뉴의 상태 관리
    const [open, setOpen] = useState(false);
    const [open2, setOpen2] = useState(false);
    const [value, setValue] = useState('전체');
    const [value2, setValue2] = useState('전체');
    const [items, setItems] = useState([
        { label: '전체', value: '전체' },
        { label: '커뮤니티', value: '커뮤니티' },
        { label: '공지사항', value: '공지사항' },
    ]);
    const [items2, setItems2] = useState([
        { label: '전체', value: '전체' },
        { label: '학교', value: '학교' },
        { label: '학과', value: '학과' },
    ]);

    const [isLoading, setIsLoading] = useState(false); // 로딩 상태 추가
    const [error, setError] = useState(''); // 에러 메시지 상태

    // 애니메이션 값 초기화
    const opacity = useRef(new Animated.Value(0)).current;

    // 검색어 변경 시 상태 업데이트
    const handlesearchTextChange = (inputText: string) => {
        setsearchtext(inputText);
    };

    // 게시물 조회수 증가 함수
    const view_count_up = async (post_id: number) => {
        try {
            await fetch(`${config.serverUrl}/view_count_up`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    post_id: post_id,
                }),
            });
        } catch (error) {
            console.error('조회수 증가 실패', error);
        }
    };

    // 데이터 필터링 함수: 선택된 카테고리에 따라 데이터를 필터링하여 반환
    const FilterData = () => {
        if (value == '전체' && value2 == '전체') {
            return allPostData;
        } else if (value == '커뮤니티' && value2 == '학교') {
            return generalCommunityData;
        } else if (value == '커뮤니티' && value2 == '학과') {
            return departmentCommunityData;
        } else if (value == '동아리' && value2 == '학과') {
            return clubPost;
        } else if (value == '공지사항' && value2 == '학교') {
            return schoolNoticeData;
        } else if (value == '공지사항' && value2 == '학과') {
            return departmentNoticeData;
        } else if (value == '공모전' && value2 == '학교') {
            return contestPost;
        } else {
            return []; // 해당하는 데이터가 없을 경우 빈 배열 반환
        }
    };

    // 첫 번째 드롭다운 메뉴의 값(value2)이 변경되면 두 번째 드롭다운 메뉴의 옵션(items)을 업데이트
    useEffect(() => {
        if (value2 == '전체') {
            setValue('전체');
            setItems([{ label: '전체', value: '전체' }]);
        } else if (value2 == '학교') {
            setValue('커뮤니티');
            setItems([
                { label: '커뮤니티', value: '커뮤니티' },
                { label: '공지사항', value: '공지사항' },
                { label: '공모전', value: '공모전' },
            ]);
        } else if (value2 == '학과') {
            setValue('커뮤니티');
            setItems([
                { label: '커뮤니티', value: '커뮤니티' },
                { label: '공지사항', value: '공지사항' },
                { label: '동아리', value: '동아리' },
            ]);
        }
    }, [value2]);

    // 게시물 검색 함수
    const getGeneralposts = async () => {
        try {
            setIsLoading(true);
            setError('');
            const response = await fetch(`${config.serverUrl}/search_post`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    search_text: searchtext,
                }),
            });

            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }

            const postsdata: PostData[] = await response.json();

            // 게시물 분류를 위한 배열 초기화
            let noticePost: PostData[] = [];
            let noticeDepartmentPost: PostData[] = [];
            let contestPost: PostData[] = [];
            let communityPost: PostData[] = [];
            let departmentCommunityPost: PostData[] = [];
            let clubPost: PostData[] = [];

            // 게시물 분류 로직
            postsdata.forEach((post: PostData) => {
                if (post.inform_check && !post.contest_check && !post.department_check) {
                    noticePost.push(post); // 학교 공지사항
                } else if (post.inform_check && !post.contest_check && post.department_check) {
                    noticeDepartmentPost.push(post); // 학과 공지사항
                } else if (post.inform_check && post.contest_check && !post.department_check) {
                    contestPost.push(post); // 공모전
                } else if (!post.inform_check && !post.Club_check && !post.department_check) {
                    communityPost.push(post); // 학교 커뮤니티
                } else if (!post.inform_check && !post.Club_check && post.department_check) {
                    departmentCommunityPost.push(post); // 학과 커뮤니티
                } else if (!post.inform_check && post.Club_check && !post.department_check) {
                    clubPost.push(post); // 동아리
                }
            });

            // 상태 업데이트
            setDepartmentNoticeData(noticeDepartmentPost);
            setDepartmentCommunityPost(departmentCommunityPost);
            setSchoolNoticeData(noticePost);
            setgeneralCommunityData(communityPost);
            setContestPost(contestPost);
            SetClubPost(clubPost);
            setAllPostData(postsdata);

            // 애니메이션 시작
            Animated.timing(opacity, {
                toValue: 1,
                duration: 500,
                useNativeDriver: true,
            }).start();

        } catch (error) {
            console.error('게시물 검색 오류:', error);
            setError('게시물을 불러오는 중 오류가 발생했습니다.');
        } finally {
            setIsLoading(false);
        }
    };

    // 게시물 아이템 렌더링 함수
    const renderItem = ({ item }: { item: PostData }) => (
        <TouchableWithoutFeedback
            onPress={async () => {
                await view_count_up(item.post_id);
                navigation.navigate('PostDetailScreen', { item, userData });
            }}
        >
            <Animated.View style={[styles.postItem, { opacity }]}>
                <View style={styles.postHeader}>
                    <View style={styles.postTitleSection}>
                        <Text style={styles.postTitle} numberOfLines={1}>
                            {item.title}
                        </Text>
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
                            ]}
                        >
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
            </Animated.View>
        </TouchableWithoutFeedback>
    );

    // 필터된 데이터 가져오기
    const filteredData = FilterData();

    return (
        <View style={styles.container}>
            {/* 상단 검색 및 취소 버튼 */}
            <View style={styles.headerContainer}>
                <View style={styles.searchContainer}>
                    <IconD name="search1" size={22} color="#979797" style={styles.searchIcon} />
                    <TextInput
                        style={styles.textInput}
                        onChangeText={handlesearchTextChange}
                        value={searchtext}
                        placeholder="글 제목, 내용"
                        placeholderTextColor={'gray'}
                        onSubmitEditing={async () => {
                            await getGeneralposts();
                        }}
                        returnKeyType="search"
                    />
                </View>
                <TouchableOpacity
                    style={styles.cancelButton}
                    onPress={() => navigation.navigate('CommunityScreenStackNavigator')}
                >
                    <Text style={styles.cancelButtonText}>취소</Text>
                </TouchableOpacity>
            </View>

            {/* 드롭다운 메뉴 */}
            <View style={styles.dropdownContainer}>
                <DropDownPicker
                    open={open}
                    value={value2}
                    items={items2}
                    setOpen={setOpen}
                    setValue={setValue2}
                    setItems={setItems2}
                    containerStyle={styles.dropdownPicker}
                    dropDownContainerStyle={styles.dropdown}
                    style={styles.dropdownStyle}
                    labelStyle={styles.labelStyle}
                    placeholderStyle={styles.placeholderStyle}
                />
                <DropDownPicker
                    open={open2}
                    value={value}
                    items={items}
                    setOpen={setOpen2}
                    setValue={setValue}
                    setItems={setItems}
                    containerStyle={styles.dropdownPicker}
                    dropDownContainerStyle={styles.dropdown}
                    style={styles.dropdownStyle}
                    labelStyle={styles.labelStyle}
                    placeholder="Select an option"
                    placeholderStyle={styles.placeholderStyle}
                />
            </View>

            {/* 에러 메시지 */}
            {error ? (
                <View style={styles.errorView}>
                    <Text style={styles.errorText}>{error}</Text>
                </View>
            ) : isLoading ? (
                // 로딩 중일 때 애니메이션 표시
                <View style={styles.loadingView}>
                    <ActivityIndicator size="large" color="#0000ff" />
                </View>
            ) : allPostData.length === 0 ? (
                // 검색어를 입력하지 않았을 때 또는 검색 결과가 없을 때
                <View style={styles.noSearchView}>
                    <IconD name="search1" size={100} color="#979797" />
                    <Text style={styles.noSearchText}>게시판의 글을 검색해보세요</Text>
                </View>
            ) : filteredData.length === 0 ? (
                // 필터링 결과 게시물이 없을 때
                <View style={styles.noResultView}>
                    <Text style={styles.noResultText}>게시물이 없습니다.</Text>
                </View>
            ) : (
                // 게시물 리스트
                <Animated.FlatList
                    data={filteredData}
                    renderItem={renderItem}
                    keyExtractor={(item) => item.post_id.toString()}
                    style={{ zIndex: -1 }}
                />
            )}
        </View>
    );
};

// 스타일 정의
const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: 'white',
    },
    headerContainer: {
        flexDirection: 'row',
        paddingHorizontal: 10,
        paddingTop: 20,
        paddingBottom: 10,
        alignItems: 'center',
        backgroundColor: '#F2F2F2',
    },
    searchContainer: {
        flex: 1,
        flexDirection: 'row',
        backgroundColor: '#FFFFFF',
        borderRadius: 8,
        alignItems: 'center',
        paddingHorizontal: 10,
        marginRight: 10,
        elevation: 2, // 그림자 효과
    },
    searchIcon: {
        marginRight: 5,
    },
    textInput: {
        flex: 1,
        fontSize: 16,
        color: 'black',
    },
    cancelButton: {
        paddingVertical: 10,
        paddingHorizontal: 15,
        backgroundColor: '#9A9EFF',
        borderRadius: 8,
    },
    cancelButtonText: {
        fontSize: 16,
        color: 'white',
    },
    dropdownContainer: {
        flexDirection: 'row',
        paddingHorizontal: 10,
        marginBottom: 10,
    },
    dropdownPicker: {
        flex: 1,
        marginRight: 5,
    },
    dropdownStyle: {
        backgroundColor: 'white',
        borderColor: '#cccccc',
        borderRadius: 8,
        height: 50,
        paddingHorizontal: 10,
    },
    labelStyle: {
        fontSize: 14,
        color: 'black',
    },
    dropdown: {
        backgroundColor: '#ffffff',
        borderColor: '#cccccc',
    },
    placeholderStyle: {
        fontSize: 14,
        color: 'gray',
    },
    // 게시물 부분 스타일
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
    postTitleSection: {
        width: '87%',
        justifyContent: 'center',
        paddingRight: 10,
    },
    postTitle: {
        fontSize: 19,
        margin: 5,
        marginLeft: 10,
        color: 'black',
    },
    viewCountSection: {
        width: '13%',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'flex-start',
    },
    viewIcon: {
        color: '#F29F05',
    },
    viewCountText: {
        color: 'black',
        marginLeft: 4,
    },
    postFooter: {
        width: '100%',
        height: '40%',
        flexDirection: 'row',
    },
    authorSection: {
        width: '87%',
        flexDirection: 'row',
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
    likeCountSection: {
        width: '13%',
        flexDirection: 'row',
        alignItems: 'center',
        bottom: 5,
        left: 2,
        justifyContent: 'flex-start',
    },
    likeIcon: {
        color: '#F29F05',
    },
    likeCountText: {
        color: 'black',
        marginLeft: 7,
        top: 1,
    },
    noSearchView: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
    },
    noSearchText: {
        fontSize: 20,
        marginTop: 10,
        fontWeight: 'bold',
    },
    // 게시물이 없을 때 표시할 스타일
    noResultView: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
    },
    noResultText: {
        fontSize: 18,
        color: 'gray',
    },
    // 로딩 중일 때 표시할 스타일
    loadingView: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
    },
    // 에러 메시지 스타일
    errorView: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
    },
    errorText: {
        fontSize: 18,
        color: 'red',
    },
});

export default SearchPostScreen;
