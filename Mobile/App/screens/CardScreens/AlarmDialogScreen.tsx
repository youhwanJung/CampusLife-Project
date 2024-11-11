import React, { useState, useCallback } from 'react';
import {
    Text,
    View,
    StyleSheet,
    ScrollView,
    RefreshControl,
    TouchableHighlight,
    Alert,
    Modal,
    TouchableOpacity,
    ActivityIndicator
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import config from '../../config';
import { UserData, aramData, EventData } from '../../types/type';

import IconB from 'react-native-vector-icons/AntDesign';
import IconA from 'react-native-vector-icons/Fontisto';
import IconD from 'react-native-vector-icons/Entypo';
import IconE from 'react-native-vector-icons/FontAwesome5';
import IconF from 'react-native-vector-icons/MaterialCommunityIcons';

/**
 * 알람 다이얼로그 화면 컴포넌트
 * @param route - 네비게이션 라우트 파라미터
 * @param navigation - 네비게이션 객체
 */
const AlarmDialogScreen = ({ route, navigation }: any) => {
    // 라우트 파라미터에서 사용자 데이터 추출
    const { userdata } = route.params;

    // 상태 변수 선언
    const [refreshing, setRefreshing] = useState(false);
    const [userData, setUserData] = useState<UserData>(userdata);
    const [aramList, setAaramList] = useState<aramData[]>([]);
    const [isModalVisible, setIsModalVisible] = useState(false); // 모달 가시성 상태
    const [message, setMessage] = useState(''); // 쪽지 내용 상태
    const [club_aram, setmessage] = useState('');
    const [loading, setLoading] = useState(false); // 로딩 상태 추가


    /**
     * 화면 포커스 시 데이터 가져오기
     */
    useFocusEffect(
        React.useCallback(() => {
            const fetchData = async () => {
                try {
                    setLoading(true); // 로딩 시작
                    setUserData(userdata);
                    await get_aram_data();
                } catch (error) {
                    console.error('데이터 가져오기 오류:', error);
                } finally {
                    setLoading(false); // 로딩 종료
                }
            };
            fetchData();
        }, [userdata])
    );

    /**
     * 화면 새로고침 함수
     */
    const onRefresh = useCallback(async () => {
        setRefreshing(true);
        await get_aram_data().then(() => setRefreshing(false));
    }, []);

    /**
     * 특정 이벤트의 데이터를 가져오는 함수
     * @param event_id - 이벤트 ID
     * @returns 이벤트 데이터 또는 null
     */
    const Get_One_Event_Data = async (event_id: any): Promise<EventData | null> => {
        try {
            const response = await fetch(`${config.serverUrl}/Get_One_Event_Data`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ event_id }),
            });

            if (!response.ok) {
                throw new Error('서버 응답 오류');
            }

            const eventData = await response.json();
            const eventImage = await GetEditEventImage(eventData.event_id);
            return { ...eventData, event_photo: eventImage };
        } catch (error) {
            console.error('이벤트 데이터 가져오기 실패:', error);
            return null;
        }
    };

    /**
     * 이벤트의 이미지를 가져오는 함수
     * @param event_id - 이벤트 ID
     * @returns 이벤트 이미지 URL 또는 undefined
     */
    const GetEditEventImage = async (event_id: number): Promise<string | undefined> => {
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
            return undefined;
        }
    };

    /**
     * 알람 데이터를 서버에서 가져오는 함수
     */
    const get_aram_data = async () => {
        try {
            const response = await fetch(`${config.serverUrl}/get_aram_data`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ user_id: userData.user_pk }),
            });
            const data = await response.json();
            setAaramList(data);
        } catch (error) {
            console.error('알람 정보 가져오기 실패:', error);
        }
    };

    /**
     * 게시물 상세 정보를 가져오는 함수
     * @param post_id - 게시물 ID
     * @returns 게시물 상세 데이터 또는 undefined
     */
    const go_post_detail = async (post_id: any) => {
        try {
            const response = await fetch(`${config.serverUrl}/go_post_detail`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ post_id }),
            });
            if (!response.ok) {
                throw new Error('게시물 상세 정보 가져오기 실패');
            }
            const postDetail = await response.json();
            return postDetail;
        } catch (error) {
            console.error('게시물 상세 정보 가져오기 실패:', error);
            return undefined;
        }
    };

    /**
     * 게시물 조회 수를 증가시키는 함수
     * @param post_id - 게시물 ID
     */
    const view_count_up = async (post_id: any) => {
        try {
            const response = await fetch(`${config.serverUrl}/view_count_up`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ post_id }),
            });
            if (!response.ok) {
                throw new Error('조회수 증가 실패');
            }
            await response.json();
        } catch (error) {
            console.error('조회수 증가 실패:', error);
        }
    };

    /**
     * 대댓글의 게시물 ID를 가져오는 함수
     * @param comment_id - 댓글 ID
     * @returns 게시물 ID 또는 undefined
     */
    const get_recomment_post_pk = async (comment_id: any): Promise<number | undefined> => {
        try {
            const response = await fetch(`${config.serverUrl}/get_recomment_post_pk`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ comment_id }),
            });
            const post_pk = await response.json();
            return post_pk;
        } catch (error) {
            console.error('대댓글 게시물 ID 가져오기 실패:', error);
            return undefined;
        }
    };

    /**
     * 특정 알람을 삭제하는 함수
     * @param aram_id - 알람 ID
     */
    const delete_aram_data = (aram_id: number) => {
        Alert.alert(
            "알람 삭제",
            "알람을 정말로 삭제하시겠습니까?",
            [
                {
                    text: "취소",
                    onPress: () => console.log("취소 클릭"),
                    style: "cancel"
                },
                {
                    text: "확인",
                    onPress: async () => {
                        await deleteMyaram(aram_id);
                        delete_aram();
                    }
                }
            ]
        );
    };

    /**
     * 서버에서 알람을 삭제하는 함수
     * @param aram_id - 알람 ID
     */
    const deleteMyaram = async (aram_id: number) => {
        try {
            const response = await fetch(`${config.serverUrl}/deleteMyaram`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ aram_id }),
            });
            if (!response.ok) {
                throw new Error('알람 삭제 실패');
            }
            await response.json();
            await get_aram_data();
        } catch (error) {
            console.error('알람 삭제 실패:', error);
        }
    };

    /**
     * 알람 삭제 성공 메시지를 보여주는 함수
     */
    const delete_aram = () => {
        Alert.alert(
            "알람 삭제 성공!",
            "알람을 성공적으로 삭제하였습니다!",
            [{ text: "확인" }]
        );
    };

    /**
     * 상세 화면으로 이동하는 함수
     * @param postDetail - 게시물 상세 데이터
     * @param screen - 이동할 화면 이름
     */
    const navigateToDetailScreen = (postDetail: any, screen: string) => {
        if (screen === "PostDetailScreen") {
            navigation.navigate("PostDetailScreen", { item: postDetail[0], userData });
        } else if (screen === "NoticePostDetailScreen") {
            navigation.navigate("NoticePostDetailScreen", { item: postDetail[0], userData });
        }
    };

    /**
     * 알람의 target_type에 따라 적절한 화면으로 네비게이션하는 함수
     * @param item2 - 알람 데이터
     */
    const NavigationPage = async (item: aramData) => {
        switch (item.target_type) {
            case 'my_post_comment': // 내 게시물 댓글
                const postList1 = await go_post_detail(item.post_comment_id);
                if (postList1) {
                    await view_count_up(item.post_comment_id);
                    navigateToDetailScreen(postList1, "PostDetailScreen");
                }
                break;
            case 'hot_post': // 핫 게시물
                const postList2 = await go_post_detail(item.hot_post_id);
                if (postList2) {
                    await view_count_up(item.hot_post_id);
                    navigateToDetailScreen(postList2, "PostDetailScreen");
                }
                break;
            case 'school_notice': // 학교 공지사항
                const postList3 = await go_post_detail(item.school_notice_id);
                if (postList3) {
                    await view_count_up(item.school_notice_id);
                    navigateToDetailScreen(postList3, "NoticePostDetailScreen");
                }
                break;
            case 'department_notice': // 학과 공지사항
                const postList4 = await go_post_detail(item.department_notice_id);
                if (postList4) {
                    await view_count_up(item.department_notice_id);
                    navigateToDetailScreen(postList4, "NoticePostDetailScreen");
                }
                break;
            case 'my_post_like': // 내 게시물 좋아요
                const postList5 = await go_post_detail(item.my_post_like_id);
                if (postList5) {
                    await view_count_up(item.my_post_like_id);
                    navigateToDetailScreen(postList5, "PostDetailScreen");
                }
                break;
            case 'new_event': // 새 이벤트
                const eventData: EventData | null = await Get_One_Event_Data(item.new_event_id);
                if (eventData) {
                    navigation.navigate("DeadlineEventScreen", { userdata: userData, eventdata: eventData });
                } else {
                    Alert.alert(
                        "이벤트 마감 및 삭제",
                        "해당 이벤트는 마감되었거나 삭제되었습니다! 다음 이벤트를 노려주세요."
                    );
                }
                break;
            case 'report_post': // 게시물 신고
                const postList6 = await go_post_detail(item.report_post_id);
                if (postList6) {
                    navigateToDetailScreen(postList6, "PostDetailScreen");
                }
                break;
            case 'report_comment': // 댓글 신고
                const postList7 = await go_post_detail(item.report_comment_id);
                if (postList7) {
                    navigateToDetailScreen(postList7, "PostDetailScreen");
                }
                break;
            case 'my_comment_like': // 내 댓글 좋아요
                const postList8 = await go_post_detail(item.comment_post_id);
                if (postList8) {
                    navigateToDetailScreen(postList8, "PostDetailScreen");
                }
                break;
            case 'my_recomment_like': // 내 대댓글 좋아요
                const recomment_post_pk = await get_recomment_post_pk(item.recomment_comment_id);
                if (recomment_post_pk !== undefined) {
                    const postList9 = await go_post_detail(recomment_post_pk);
                    if (postList9) {
                        navigateToDetailScreen(postList9, "PostDetailScreen");
                    }
                }
                break;
            case 'school_club': // 동아리
                setmessage(item.my_club_register_comment);
                setIsModalVisible(true);
                break;
            default:
                console.log("알람 타입에 맞는 화면이 없습니다.");
        }
    };

    /**
     * 알람의 target_type에 따라 적절한 내용을 렌더링하는 함수
     * @param item - 알람 데이터
     * @returns JSX.Element 또는 null
     */
    const renderTargetContent = (item: aramData) => {
        switch (item.target_type) {
            case 'my_post_comment':
                return <Text style={styles.content}>{item.post_comment_title}</Text>;
            case 'hot_post':
                return <Text style={styles.content}>{item.hot_post_title}</Text>;
            case 'school_notice':
                return <Text style={styles.content}>{item.school_notice_title}</Text>;
            case 'department_notice':
                return <Text style={styles.content}>{item.department_notice_title}</Text>;
            case 'my_post_like':
                return <Text style={styles.content}>{item.my_post_like_title}</Text>;
            case 'new_event':
                return <Text style={styles.content}>{item.new_event_name}</Text>;
            case 'friend_code':
                return <Text style={styles.content}>{item.friend_code_my_name}님이 코드를 입력했습니다</Text>;
            case 'report_post':
                return <Text style={styles.content}>{item.report_post_title}</Text>;
            case 'report_comment':
                return <Text style={styles.content}>{item.report_comment_title}</Text>;
            case 'good_event':
                return <Text style={styles.content}>{item.good_event_name}</Text>;
            case 'my_comment_like':
                return <Text style={styles.content}>{item.comment_contents}</Text>;
            case 'my_recomment_like':
                return <Text style={styles.content}>{item.recomment_contents}</Text>;
            case 'school_club':
                console.log(item.my_club_register_comment);
                return <Text style={styles.content} numberOfLines={1}>{item.my_club_register_comment}</Text>;
            case 'report_delete':
                console.log(item.delete_post_title)
                return <Text style={styles.content} numberOfLines={1}>{item.delete_post_title}</Text>;
            default:
                return null;
        }
    };

    /**
     * 알람의 target_type에 따라 적절한 아이콘을 렌더링하는 함수
     * @param item - 알람 데이터
     * @returns JSX.Element 또는 null
     */
    const renderTargetIcon = (item: aramData) => {
        switch (item.target_type) {
            case 'my_post_comment': // 내 게시물에 댓글 달았을 때
                return <IconD name="chat" size={30} color="#F29F05" />;
            case 'hot_post': // 핫 게시물
                return <IconA name="fire" size={30} color="red" />;
            case 'school_notice': // 학교 공지사항
                return <IconD name="megaphone" size={30} color="#F29F05" />;
            case 'department_notice': // 학과 공지사항
                return <IconD name="megaphone" size={30} color="#F29F05" />;
            case 'my_post_like': // 내 게시물 좋아요
                return <IconB name="like1" size={30} color="#F29F05" />;
            case 'new_event': // 새 이벤트
                return <IconD name="mail" size={30} color="#F29F05" />;
            case 'friend_code': // 친구 코드 입력
                return <IconE name="user-friends" size={30} color="#F29F05" />;
            case 'report_post': // 게시물 신고
                return <IconE name="exclamation" size={30} color="#F29F05" />;
            case 'report_comment': // 댓글 신고
                return <IconE name="exclamation" size={30} color="#F29F05" />;
            case 'good_event': // 이벤트 선정
                return <IconF name="emoticon-happy" size={30} color="#F29F05" />;
            case 'my_comment_like': // 내 댓글 좋아요
                return <IconB name="like1" size={30} color="#F29F05" />;
            case 'my_recomment_like': // 내 대댓글 좋아요
                return <IconB name="like1" size={30} color="#F29F05" />;
            case 'school_club': // 내 대댓글 좋아요
                return <IconE name="address-book" size={30} color="#F29F05" />;
            case 'report_delete':
                return <IconE name="exclamation" size={30} color="#F29F05" />;
            default:
                return null;
        }
    };

    return (
        <View style={styles.container}>
            {loading ? ( // 로딩 중일 때 ActivityIndicator를 보여줌
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color="#F29F05" />
                    <Text style={{ color: '#333' }}>불러오는 중...</Text>
                </View>
            ) : (
                <ScrollView
                    style={styles.scrollView}
                    refreshControl={
                        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
                    }
                >
                    {aramList.map((item, index) => (
                        <View key={index} style={styles.alarmContainer}>
                            <TouchableHighlight
                                style={styles.touchable}
                                underlayColor="#E0E0E0"
                                onPress={() => NavigationPage(item)}
                                onLongPress={() => delete_aram_data(item.aram_id)}
                            >
                                {/* 안 읽은 알람이면 테두리 추가 */}
                                <View style={[
                                    styles.card,
                                    item.time == '2024-02-30' && styles.unreadBorder // 안 읽은 알람에 테두리 스타일 추가
                                ]}>
                                    <View style={styles.iconArea}>
                                        {renderTargetIcon(item)}
                                        {/* 안 읽은 알람이면 빨간 점 추가 */}
                                        {item.time == '2024-02-30' && <View style={styles.unreadDot} />}
                                    </View>
                                    <View style={styles.textArea}>
                                        <Text style={styles.title}>{item.title}</Text>
                                        {renderTargetContent(item)}
                                        <Text style={styles.time}>{item.time}</Text>
                                    </View>
                                </View>
                            </TouchableHighlight>
                        </View>
                    ))}
                    <Modal
                        animationType="slide"
                        transparent={true}
                        visible={isModalVisible}
                        onRequestClose={() => {
                            setIsModalVisible(false);
                        }}
                    >
                        <View style={styles.modalContainer}>
                            <View style={styles.modalContent}>
                                <Text style={styles.modalTitle}>동아리 쪽지</Text>
                                <Text
                                    style={styles.messageInput}
                                    numberOfLines={4}
                                >
                                    {club_aram}
                                </Text>
                                <View style={styles.modalButtons}>
                                    <TouchableOpacity style={styles.closeButton} onPress={() => setIsModalVisible(false)}>
                                        <Text style={styles.closeButtonText}>취소</Text>
                                    </TouchableOpacity>
                                </View>
                            </View>
                        </View>
                    </Modal>
                </ScrollView>
            )}
        </View>
    );
};

/**
 * 스타일 시트 정의
 */
const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F2F2F2',
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    scrollView: {
        paddingVertical: 10,
    },
    alarmContainer: {
        alignItems: 'center',
        marginBottom: 10,
    },
    touchable: {
        width: '90%',
        borderRadius: 10,
    },
    card: {
        flexDirection: 'row',
        backgroundColor: '#FFFFFF',
        borderRadius: 10,
        padding: 15,
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 5,
        elevation: 3,
    },
    unreadBorder: {
        borderWidth: 1,
        borderColor: '#FFC107', // 강조 테두리 색상
        borderRadius: 10,
    },
    iconArea: {
        width: 50,
        height: 50,
        borderRadius: 25,
        backgroundColor: '#FFF0E6',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 15,
    },
    unreadDot: {
        position: 'absolute',
        top: 0,
        right: 0,
        width: 10,
        height: 10,
        borderRadius: 5,
        backgroundColor: 'red', // 빨간 점
    },
    textArea: {
        flex: 1,
    },
    title: {
        fontSize: 18,
        color: '#333333',
        fontWeight: 'bold',
        marginBottom: 5,
    },
    content: {
        fontSize: 16,
        color: '#666666',
        marginBottom: 5,
    },
    time: {
        fontSize: 14,
        color: '#999999',
    },
    modalContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
    },
    modalContent: {
        width: '85%',
        backgroundColor: 'white',
        borderRadius: 20,
        padding: 25,
        alignItems: 'center',
    },
    modalTitle: {
        fontSize: 22,
        fontWeight: 'bold',
        marginBottom: 15,
        color: '#2D3436',
    },
    messageInput: {
        width: '100%',
        height: 120,
        borderColor: '#ccc',
        borderWidth: 1,
        borderRadius: 10,
        padding: 15,
        marginBottom: 20,
        textAlignVertical: 'top',
        fontSize: 16,
        color: '#34495E',
    },
    modalButtons: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        width: '100%',
    },
    sendButton: {
        backgroundColor: '#6C5CE7',
        paddingVertical: 12,
        paddingHorizontal: 25,
        borderRadius: 10,
    },
    sendButtonText: {
        fontSize: 16,
        color: 'white',
        fontWeight: 'bold',
    },
    closeButton: {
        backgroundColor: '#b2bec3',
        paddingVertical: 12,
        paddingHorizontal: 25,
        borderRadius: 10,
    },
    closeButtonText: {
        fontSize: 16,
        color: 'white',
        fontWeight: 'bold',
    },
});

export default AlarmDialogScreen;
