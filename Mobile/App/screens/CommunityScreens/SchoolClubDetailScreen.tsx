import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
    View,
    Text,
    TextInput,
    StyleSheet,
    ScrollView,
    Image,
    Alert,
    Modal,
    TouchableOpacity,
    FlatList,
    Dimensions,
    Keyboard
} from 'react-native';
import IconA from 'react-native-vector-icons/Entypo';
import IconB from 'react-native-vector-icons/AntDesign';
import IconC from 'react-native-vector-icons/Feather';
import IconD from 'react-native-vector-icons/EvilIcons';
import { useFocusEffect } from '@react-navigation/native';
import { PostDeatilData, CommentsWithRecomments, PostPhoto, UserData } from "../../types/type";
import config from '../../config';

const width = Dimensions.get("window").width;

// 신고 관련 타입 정의
type ReportUser = {
    post_id: number,
    user_id: number,
    report_name: string,
}

type ReportCommentUser = {
    comment_id: number,
    report_comment_name: string,
}

const SchoolClubDetailScreen: React.FC = ({ route, navigation }: any) => {
    console.log("you are in SchoolClubDetailScreen");
    const { item, userData } = route.params;

    // 상태 변수 정의
    const [commentText, setCommentText] = useState('');
    const [inputHeight, setInputHeight] = useState(40);
    const [postDetailInfo, setPostDetailInfo] = useState<PostDeatilData>();
    const [userdata, setUserData] = useState<UserData>(userData);
    const [comments, setComments] = useState<CommentsWithRecomments[]>([]);
    const [userReport, setUserReport] = useState<ReportUser[]>([]);
    const [userCommentReport, setUserCommentReport] = useState<ReportCommentUser[]>([]);
    const [isCommentOrRecomment, setIsCommentOrRecomment] = useState(0);
    const [isEditComment, setIsEditComment] = useState(0);
    const [commentsPk, setCommentsPk]: any = useState();
    const [editCommentPk, setEditCommentPk]: any = useState();
    const [editRecommentPk, setEditRecommentPk]: any = useState();
    const [isPushLike, setIsPushLike]: any = useState();
    const [showOptions, setShowOptions] = useState(false);
    const [activeCommentId, setActiveCommentId] = useState<number | null>(null);
    const inputRef = useRef<TextInput>(null);
    const [postImages, setPostImages] = useState<PostPhoto[]>([]);
    const [showModal, setShowModal] = useState(false);
    const [activeImageIndex, setActiveImageIndex] = useState<null | number>(null);
    // 옵션 메뉴 토글 함수
    const toggleOptions = () => {
        setShowOptions(!showOptions);
    };

    // 댓글 옵션 토글 함수
    const toggleOptions2 = (commentId: number) => {
        setActiveCommentId(activeCommentId === commentId ? null : commentId);
    };

    // 댓글 입력 필드 포커스 함수
    const onFocusName = useCallback(() => {
        inputRef.current?.focus();
    }, []);

    // 댓글 수정 시 포커스 함수
    const onFocusEditComment = useCallback((comment_info: any) => {
        setCommentText(comment_info.content);
        inputRef.current?.focus();
    }, []);

    // 대댓글 수정 시 포커스 함수
    const onFocusEditReComment = useCallback((recomment_info: any) => {
        setCommentText(recomment_info.content);
        inputRef.current?.focus();
    }, []);

    // 이미지 모달 열기 함수
    const openImageModal = (index: number) => {
        setActiveImageIndex(index);
        setShowModal(true);
    };

    // 모달 닫기 함수
    const closeModal = () => {
        console.log('Attempting to close modal...');
        setShowModal(false);
        setActiveImageIndex(null);
    };

    // 화면 포커스 시 데이터 가져오기
    useFocusEffect(
        React.useCallback(() => {
            const fetchData = async () => {
                try {
                    await fetchPostDetail();
                    await fetchPostPhotos();
                    setUserData(userdata);
                } catch (error) {
                    console.error('데이터 가져오기 실패:', error);
                }
            };
            fetchData();
        }, [])
    );

    // 좋아요 여부 확인 함수
    const isUserPostLike = async () => {
        try {
            const response = await fetch(`${config.serverUrl}/is_user_post_like`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    user_id: userdata.user_pk,
                    post_id: postDetailInfo?.post_id
                })
            });
            const result = await response.json();
            return result.isLiked;
        } catch (error) {
            console.error(error);
        }
    };

    // 좋아요 취소 함수
    const cancelPostLike = async (post_id: any) => {
        try {
            const response = await fetch(`${config.serverUrl}/cancel_post_like`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    user_id: userdata.user_pk,
                    post_id: post_id
                })
            });
            await response.json();
        } catch (error) {
            console.error(error);
        }
    };

    // 좋아요 추가 함수
    const putUserPostLike = async () => {
        try {
            const response = await fetch(`${config.serverUrl}/put_user_post_like`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    user_id: userdata.user_pk,
                    post_id: postDetailInfo?.post_id
                })
            });
        } catch (error) {
            console.error(error);
        }
    };

    // 포스트 상세 정보 가져오기 함수
    const fetchPostDetail = async () => {
        try {
            const response = await fetch(`${config.serverUrl}/get_post_detail`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    post_id: item.post_id
                })
            });
            const postDetail = await response.json();
            setPostDetailInfo(postDetail);
        } catch (error) {
            console.error('포스트 상세 정보 가져오기 실패:', error);
        }
    };

    // 포스트 사진 가져오기 함수
    const fetchPostPhotos = async () => {
        try {
            const response = await fetch(`${config.serverUrl}/DetailPostPhoto`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    post_id: item.post_id
                })
            });
            const photos = await response.json();
            setPostImages(photos);
            console.log(photos);
        } catch (error) {
            console.error('포스트 사진 가져오기 실패:', error);
        }
    };

    const UpdateAramCount = async (user_id : any) => {
        try {
            await fetch(`${config.serverUrl}/update_aram_count`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ 
                    user_id : user_id
                })
            });
        } catch (error) {
            console.error('알람 카운트 업데이트 실패', error);
        }
    };


    // 좋아요 30개 이상 시 핫 포스터 등록 및 알림 전송
    const addHotAlarm = async () => {
        try {
            await fetch(`${config.serverUrl}/addHotAram`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    target_id: postDetailInfo?.post_id,
                })
            });
            //await UpdateAramCount();
        } catch (error) {
            console.error('알람 전송 실패', error);
        }
    };

    // 포스트 신고 알람 전송 함수
    const reportPostAlarm = async () => {
        try {
            await fetch(`${config.serverUrl}/reportPostAram`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    target_id: postDetailInfo?.post_id,
                })
            });
            await UpdateAramCount(21);
        } catch (error) {
            console.error('알람 전송 실패', error);
        }
    };

    // 좋아요 시 알람 전송 함수
    const addLikeAlarm = async () => {
        try {
            await fetch(`${config.serverUrl}/addLikeAram`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    user_id: postDetailInfo?.user_id,
                    target_id: postDetailInfo?.post_id,
                })
            });
            await UpdateAramCount(postDetailInfo?.user_id);
        } catch (error) {
            console.error('알람 전송 실패', error);
        }
    };

    // 포스트 좋아요 증가 함수
    const likePost = async (post_id: any) => {
        try {
            const response = await fetch(`${config.serverUrl}/post_like_up`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    post_id: post_id,
                    user_id: userdata.user_pk
                })
            });
            await response.json();
            await fetchPostDetail(); // 좋아요 누르면 바로 반영
        } catch (error) {
            console.error('포스트 좋아요 실패:', error);
        }
    };

    // 포스트 좋아요 취소 함수
    const unlikePost = async (post_id: any) => {
        try {
            const response = await fetch(`${config.serverUrl}/post_like_down`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    post_id: post_id,
                    user_id: userdata.user_pk
                })
            });
            await response.json();
            await fetchPostDetail(); // 좋아요 취소 시 바로 반영
        } catch (error) {
            console.error('포스트 좋아요 취소 실패:', error);
        }
    };

    // 사용자 신고 등록 함수
    const putUserReport = async () => {
        try {
            const response = await fetch(`${config.serverUrl}/putuserreport`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    post_id: postDetailInfo?.post_id,
                    report_name: userdata.name
                })
            });
            if (response.ok) {
                const data = await response.json();
                setUserReport(prev => [
                    ...prev,
                    {
                        post_id: postDetailInfo?.post_id || 0,
                        user_id: postDetailInfo?.user_id || 0,
                        report_name: typeof userdata.name === 'string' ? userdata.name : ''
                    }
                ]);
                Alert.alert("신고 예약 되었습니다.");
            } else {
                throw new Error('Network response was not ok');
            }
        } catch (error) {
            console.error('신고 제출 실패:', error);
            Alert.alert('신고 제출에 실패하였습니다.');
        }
    };


    //댓글수정
    const editcomment = async () => {
        try {
            const response = await fetch(`${config.serverUrl}/editcomment`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    comment_pk: editCommentPk,
                    contents: commentText
                })
            });
            await response.json();
            await CommentList();
        } catch (error) {
            console.error('댓글 수정 실패!', error);
        }
    }

    // 게시글 삭제 함수
    const deletePost = async () => {
        try {
            const response = await fetch(`${config.serverUrl}/deletepost`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    post_id: postDetailInfo?.post_id,
                }),
            });

            if (!response.ok) {
                throw new Error('Network response was not ok');
            }

            const result = await response.json();

            // 삭제 성공 시 알림 후 이전 화면으로 이동
            Alert.alert(
                '알림',
                '게시글이 삭제되었습니다.',
                [
                    {
                        text: '확인',
                        onPress: () => navigation.goBack(),
                    },
                ],
                { cancelable: false }
            );
        } catch (error) {
            console.error('게시글 삭제 실패:', error);
            Alert.alert('오류', '게시글 삭제에 실패했습니다.');
        }
    };

    // 중복 신고 여부 확인 및 신고 처리 함수
    const reportUserDuplicate = async () => {
        const isDuplicateReport = userReport.some((report) =>
            userdata.name === report.report_name && postDetailInfo?.post_id === report.post_id
        );
        if (isDuplicateReport) {
            Alert.alert("해당 게시물은 이미 신고 접수가 완료되었습니다.");
        } else {
            await putUserReport();
            await reportPostAlarm();
        }
    };

    // 사용자 신고 데이터 가져오기 함수
    const getUserReport = async () => {
        try {
            const response = await fetch(`${config.serverUrl}/getuserreport`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                },
            });
            const data = await response.json();
            setUserReport(data);
            return data;
        } catch (error) {
            console.error('신고 데이터 가져오기 실패:', error);
        }
    };

    //댓글달기
    const writecomment = async () => {
        try {
            const response = await fetch(`${config.serverUrl}/writecomment`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    post_id: postDetailInfo?.post_id,
                    user_id: userdata.user_pk,
                    contents: commentText
                })
            });
            await response.json();
            await CommentList();
        } catch (error) {
            console.error('댓글 쓰기 실패!', error);
        }
    }


    const EditreCommentAlert = () => {
        Alert.alert(
            "대댓글 수정",
            "정말로 대댓글을 수정하시겠습니까?",
            [
                {
                    text: "취소",
                    style: "cancel"
                },
                { text: "확인", onPress: async () => { await editrecomment(); } }
            ],
        );
    };

    //대댓글 달기
    const writerecomment = async () => {
        try {
            const response = await fetch(`${config.serverUrl}/rewritecomment`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    comment_id: commentsPk,
                    user_id: userdata.user_pk,
                    contents: commentText
                })
            });
            await CommentList();
        } catch (error) {
            console.error('대댓글 쓰기 실패!', error);
        }
    }

    const EditCommentAlert = () => {
        Alert.alert(
            "댓글 수정",
            "정말로 댓글을 수정하시겠습니까?",
            [
                {
                    text: "취소",
                    style: "cancel"
                },
                { text: "확인", onPress: async () => { await editcomment(); } }
            ],
        );
    };

    //댓글수정
    const editrecomment = async () => {
        try {
            const response = await fetch(`${config.serverUrl}/editrecomment`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    recomment_pk: editCommentPk,
                    contents: commentText
                })
            });
            await response.json();
            await CommentList();
        } catch (error) {
            console.error('대댓글 수정 실패!', error);
        }
    }

    //댓글 좋아요 누르면 해당 댓글 쓴 사람한테 알람
    const addCommentLikeAram = async (comment_id: any, user_id: any) => {
        try {
            const response = await fetch(`${config.serverUrl}/addCommentLikeAram`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    user_id: user_id, //이거, 댓글 쓴 사람 PK 넣어줘야됨
                    target_id: comment_id, //이거 comment PK 넣어줘야됨
                })
            });
            await UpdateAramCount(user_id);
        } catch (error) {
            console.error('알람 전송 실패', error);
        }
    }


    //대댓글 리스트 가져오기(잘 작동하고.)
    const fetchRecommentData = async (comment_pk: any) => {
        try {
            const response = await fetch(`${config.serverUrl}/get_recomment`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    comment_id: comment_pk
                })
            })
            const recomment = await response.json();
            return recomment;
        } catch (error) {
            console.error('대댓글 하나 가져오기 실패:', error);
        }
    }

    //댓글 좋아요 중복 방치
    const is_user_comment_like = async (comment_id: any) => {
        try {
            const response = await fetch(`${config.serverUrl}/is_user_comment_like`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    user_id: userdata.user_pk,
                    comment_id: comment_id
                })
            })
            const result = await response.json();
            return result.isLiked;
        } catch (error) {
            console.error(error);
        }
    }

    //댓글 좋아요 누르기
    const comment_like_num_up = async (comment_id: any) => {
        try {
            const response = await fetch(`${config.serverUrl}/comment_like_up`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    comment_id: comment_id
                })
            })
            await response.json();
            await CommentList();
            //console.log("댓글 좋아요 누르기 성공!")
        } catch (error) {
            console.error('댓글 좋아요 누르기 실패', error);
        }
    }

    //댓글 좋아요 테이블에서 해당 유저 삭제
    const cancel_comment_like = async (comment_id: any) => {
        try {
            const response = await fetch(`${config.serverUrl}/cancel_comment_like`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    user_id: userdata.user_pk,
                    comment_id: comment_id
                })
            })
            await response.json();
        } catch (error) {
            console.error(error);
        }
    }


    //댓글 작성 알람 추가
    const addCommentAram = async () => {
        try {
            const response = await fetch(`${config.serverUrl}/addCommentAram`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    user_id: postDetailInfo?.user_id,
                    target_id: postDetailInfo?.post_id,
                })
            });
        } catch (error) {
            console.error('알람 전송 실패', error);
        }
    }

    //댓글 좋아요 기록을 저장
    const put_user_comment_like = async (comment_id: any) => {
        try {
            const response = await fetch(`${config.serverUrl}/put_user_comment_like`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    user_id: userdata.user_pk,//해당 유저의 pk
                    comment_id: comment_id //해당 댓글의 pk
                })
            })
        } catch (error) {
            console.error(error);
        }
    }

    //댓글 좋아요 내리기
    const comment_like_num_down = async (comment_id: any) => {
        try {
            const response = await fetch(`${config.serverUrl}/comment_like_num_down`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    comment_id: comment_id
                })
            })
            await response.json();
        } catch (error) {
            console.error('댓글 좋아요 누르기 실패', error);
        }
    }

    // 포스트 좋아요 알림 함수
    const postLikeAlert = (post_id: any) => {
        Alert.alert(
            "좋아요!!",
            "좋아요를 누르시겠습니까?",
            [
                {
                    text: "취소",
                    onPress: async () => console.log("취소 클릭"),
                    style: "cancel"
                },
                {
                    text: "확인", onPress: async () => {
                        const is_post_like: boolean = await isUserPostLike();
                        if (is_post_like) {
                            await likePost(post_id);
                            await putUserPostLike();
                            await addLikeAlarm();
                            if (postDetailInfo?.like === 29) { // 좋아요가 30개가 되면
                                await addHotAlarm();
                            }
                        } else {
                            console.log("이미 좋아요를 눌렀습니다.");
                        }
                    }
                }
            ]
        );
    };

    //대댓글 좋아요 누르면 해당 대댓글 쓴 사람한테 알람
    const addRecommentLikeAram = async (comment_id: any, user_id: any) => {
        try {
            const response = await fetch(`${config.serverUrl}/addRecommentLikeAram`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    user_id: user_id, //이거, 대댓글 쓴 사람 PK 넣어줘야됨
                    target_id: comment_id, //이거 recomment PK 넣어줘야됨
                })
            });
            await UpdateAramCount(user_id);
        } catch (error) {
            console.error('알람 전송 실패', error);
        }
    }


    //댓글 리스트 가져오기
    const CommentList = async () => {
        try {
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 5000);
            const response = await fetch(`${config.serverUrl}/get_comment`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    post_ida: item.post_id
                })
            })
            const get_comment = await response.json();
            //댓글과 연결된 대댓글을 연결하는 작업
            const commentsWithRecomments = await Promise.all(
                get_comment.map(async (comment: any) => {
                    const recommentData = await fetchRecommentData(comment.comment_id);
                    return { ...comment, recomments: recommentData };
                })
            );
            setComments(commentsWithRecomments);
            console.log(comments)
            clearTimeout(timeoutId);
            return (commentsWithRecomments);
        } catch (error) {
            console.error('댓글리스트 가져오기 실패:', error);
        }
    }

    //대댓글 좋아요 누르기
    const recomment_like_num_up = async (recomment_id: any) => {
        try {
            const response = await fetch(`${config.serverUrl}/recomment_like_up`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    recomment_id: recomment_id
                })
            })
            const result = await response.json();
        } catch (error) {
            console.error('대댓글 좋아요 누르기 실패', error);
        }
    }

    //댓글 좋아요 테이블에서 해당 유저 삭제
    const cancel_recomment_like = async (recomment_id: any) => {
        try {
            const response = await fetch(`${config.serverUrl}/cancel_recomment_like`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    user_id: userdata.user_pk,
                    recomment_id: recomment_id
                })
            })
            await response.json();
        } catch (error) {
            console.error(error);
        }
    }

    //대댓글 좋아요 기록을 저장
    const put_user_recomment_like = async (recomment_id: any) => {
        try {
            const response = await fetch(`${config.serverUrl}/put_user_recomment_like`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    user_id: userdata.user_pk,//해당 유저의 pk
                    recomment_id: recomment_id //해당 대댓글의 pk
                })
            })
        } catch (error) {
            console.error(error);
        }
    }

    //대댓글 좋아요 수 내리기
    const recomment_like_num_down = async (recomment_id: any) => {
        try {
            const response = await fetch(`${config.serverUrl}/recomment_like_num_down`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    recomment_id: recomment_id
                })
            })
            const result = await response.json();
        } catch (error) {
            console.error('대댓글 좋아요 누르기 실패', error);
        }
    }

    //대댓글 좋아요 중복 방치
    const is_user_recomment_like = async (recomment_id: any) => {
        try {
            const response = await fetch(`${config.serverUrl}/is_user_recomment_like`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    user_id: userdata.user_pk,
                    recomment_id: recomment_id
                })
            })
            const result = await response.json();
            return result.isLiked;
        } catch (error) {
            console.error(error);
        }
    }


    // 포스트 좋아요 취소 알림 함수
    const postCancelLikeAlert = (post_id: any) => {
        Alert.alert(
            "좋아요 취소!!",
            "좋아요를 취소하시겠습니까??",
            [
                {
                    text: "취소",
                    onPress: async () => console.log("취소 클릭"),
                    style: "cancel"
                },
                {
                    text: "확인", onPress: async () => {
                        await unlikePost(post_id);
                        await cancelPostLike(post_id);
                    }
                }
            ]
        );
    };

    // 본인 게시물 수정 불가 알림 함수
    const noYourPostAlert = () => {
        Alert.alert(
            "본인 게시물만 수정할 수 있습니다.",
            "게시물 수정은 본인이 작성한 게시물만 할 수 있습니다.",
            [
                {
                    text: "취소",
                    style: "cancel"
                },
                { text: "확인" }
            ],
        );
    };



    // 게시글 수정 화면으로 이동 시 포스트 정보 가져오기
    const getPostInfo = async () => {
        try {
            const response = await fetch(`${config.serverUrl}/get_post_info`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    post_id: postDetailInfo?.post_id
                })
            });
            const post_info = await response.json();
            return post_info;
        } catch (error) {
            console.error(error);
        }
    };

    const put_user_comment_report = async (comment_id: number) => {
        try {
            const response = await fetch(`${config.serverUrl}/putusercommentreport`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    comment_id: comment_id,
                    report_comment_name: userdata.name
                })
            });
            if (response.ok) {
                const data = await response.json();
                setUserCommentReport(prev => [
                    ...prev,
                    {
                        comment_id: comment_id || 0,
                        report_comment_name: typeof userdata.name === 'string' ? userdata.name : '' // Ensure report_comment_name is a string
                    }
                ]);
                Alert.alert("신고 예약 되었습니다."); // 성공 메시지 표시
            } else {
                throw new Error('Network response was not ok');
            }
        } catch (error) {
            Alert.alert('신고 제출에 실패하였습니다.'); // 실패 메시지 표시
        }
    };

    const reportCommentAram = async () => {
        try {
            const response = await fetch(`${config.serverUrl}/reportCommentAram`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    target_id: postDetailInfo?.post_id,
                })
            });
            await UpdateAramCount(21);
        } catch (error) {
            console.error('알람 전송 실패', error);
        }
    }

    const deleteComment = async (comment_id: number) => {
        try {
            const response = await fetch(`${config.serverUrl}/deletecomment`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    comment_id: comment_id,
                }),
            });

            if (!response.ok) {
                throw new Error('Network response was not ok');
            }

            const result = await response.json();
            await CommentList();

            Alert.alert(
                '알림',
                '댓글이 삭제되었습니다.',
                [
                    {
                        text: '확인',
                    },
                ],
                { cancelable: false }
            );
            //console.log('함수 잘 마무리!');
        } catch (error) {
            console.error('댓글 삭제 실패:', error);
            Alert.alert('오류', '댓글 삭제에 실패했습니다.');
        }
    };

    const writeComment = async () => {
        if (isCommentOrRecomment == 0 && isEditComment == 0) { //댓글작성
            await writecomment();
            await addCommentAram();

        } else if (isCommentOrRecomment == 1 && isEditComment == 0) { //대댓글 작성
            await writerecomment();
            await addCommentAram();

        } else if (isCommentOrRecomment == 0 && isEditComment == 1) { //댓글 수정
            EditCommentAlert();
        } else if (isCommentOrRecomment == 1 && isEditComment == 1) { //대댓글 수정
            EditreCommentAlert();
        }
        setCommentText('');
        Keyboard.dismiss();
    };

    const comment_Like_alert = (comment_id: any, user_pk: any) => {
        Alert.alert(
            "댓글 좋아요!!",
            "댓글에 좋아요를 누르시겠습니까?",
            [
                {
                    text: "취소",
                    onPress: () => console.log("취소 클릭"),
                    style: "cancel"
                },
                {
                    text: "확인", onPress: async () => {
                        await comment_like_num_up(comment_id);
                        await put_user_comment_like(comment_id);
                        await addCommentLikeAram(comment_id, user_pk);
                        await CommentList();
                    }
                }
            ]
        );
    };

    const Comment_Cancel_Like_alert = (comment_id: any, user_pk: any) => {
        Alert.alert(
            "댓글 좋아요 취소!!",
            "댓글 좋아요를 취소하시겠습니까??",
            [
                {
                    text: "취소",
                    onPress: async () => console.log("취소 클릭"),
                    style: "cancel"
                },
                {
                    text: "확인", onPress: async () => {
                        await comment_like_num_down(comment_id);
                        await cancel_comment_like(comment_id);
                        await CommentList();
                    }
                }
            ]
        );
    };


    const recomment_Like_alert = (recomment_id: any, user_pk: any) => {
        Alert.alert(
            "대댓글 좋아요!!",
            "대댓글에 좋아요를 누르시겠습니까?",
            [
                {
                    text: "취소",
                    onPress: () => console.log("취소 클릭"),
                    style: "cancel"
                },
                {
                    text: "확인", onPress: async () => {
                        await recomment_like_num_up(recomment_id);
                        await put_user_recomment_like(recomment_id);
                        await addRecommentLikeAram(recomment_id, user_pk);
                        await CommentList();

                    }
                }
            ]
        );
    };

    const NoyourCommentAlert = (comment_id: any) => {
        Alert.alert(
            "댓글 수정 불가",
            "본인이 작성한 댓글만 수정 할 수 있습니다.",
            [
                {
                    text: "취소",
                    style: "cancel"
                },
                { text: "확인", onPress: () => { toggleOptions2(comment_id); } }
            ],
        );
    };

    const recomment_Like_Cancel_alert = (recomment_id: any, user_pk: any) => {
        Alert.alert(
            "대댓글 좋아요 취소!!",
            "대댓글에 좋아요를 취소하시겠습니까?",
            [
                {
                    text: "취소",
                    onPress: () => console.log("취소 클릭"),
                    style: "cancel"
                },
                {
                    text: "확인", onPress: async () => {
                        await recomment_like_num_down(recomment_id);
                        await cancel_recomment_like(recomment_id);
                        await CommentList();
                    }
                }
            ]
        );
    };

    const NoyourreCommentAlert = (recomment_id: any) => {
        Alert.alert(
            "대댓글 수정 불가",
            "본인이 작성한 대댓글만 수정 할 수 있습니다.",
            [
                {
                    text: "취소",
                    style: "cancel"
                },
                { text: "확인", onPress: () => { toggleOptions2(recomment_id); } }
            ],
        );
    };

    const ReportUserduplicate2 = async (comment_id: number) => {

        const isDuplicateReport = userCommentReport.some((report) =>
            userdata.name === report.report_comment_name && comment_id === report.comment_id
        );
        if (isDuplicateReport) {
            Alert.alert("해당 게시물에 대해 신고할 수 없습니다.");
        } else {
            await put_user_comment_report(comment_id);
            await reportCommentAram();
        }
    }

    const deleterecomment = async (recomment_id: number) => {
        try {
            const response = await fetch(`${config.serverUrl}/deleterecomment`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    recomment_id: recomment_id,
                }),
            });

            if (!response.ok) {
                throw new Error('Network response was not ok');
            }

            const result = await response.json();
            await CommentList();

            Alert.alert(
                '알림',
                '댓글이 삭제되었습니다.',
                [
                    {
                        text: '확인',
                    },
                ],
                { cancelable: false }
            );
        } catch (error) {
            console.error('댓글 삭제 실패:', error);
            Alert.alert('오류', '댓글 삭제에 실패했습니다.');
        }
    };

    // 댓글 입력 필드 크기 변경 핸들러
    const handleContentSizeChange = (e: any) => {
        const maxLineHeight = 112;
        const currentLineHeight = e.nativeEvent.contentSize.height;

        if (currentLineHeight <= maxLineHeight) {
            setInputHeight(e.nativeEvent.contentSize.height);
        }
        // console.log(e.nativeEvent.contentSize.height);
    };

    // 댓글 입력 변경 핸들러
    const handleInputChange = (inputText: string) => {
        setCommentText(inputText);
    };

    // 게시일 포맷팅
    const writeDate = postDetailInfo?.write_date;
    let formattedDate = "";
    if (writeDate) {
        const parts = writeDate.split("-");
        const datePart = parts.slice(0, 3).join("-");
        const timePart = parts.slice(3).join(":");
        formattedDate = `${datePart} ${timePart}`;
    }

    // 컴포넌트 마운트 시 사용자 신고 데이터 가져오기
    useEffect(() => {
        const fetchData = async () => {
            try {
                await getUserReport();
                await CommentList();
            } catch (error) {
                console.error('데이터 가져오기 실패:', error);
            }
        };

        fetchData();
    }, []);


    return (
        <View style={styles.container}>
            <ScrollView>
                {/* 작성자 정보 영역 */}
                <View style={styles.writerArea}>
                    <View style={styles.writer}>
                        <View style={styles.writerPic}>
                            <Image
                                source={{ uri: `${config.photoUrl}/${postDetailInfo?.writer_propile}` }}
                                style={{ flex: 1, borderRadius: 12 }}
                            />
                        </View>
                        <View style={styles.writerInfo}>
                            <Text style={styles.writerName}>
                                {postDetailInfo?.post_writer}({postDetailInfo?.writer_department})
                            </Text>
                            <Text style={styles.writeTime}>{formattedDate}</Text>
                        </View>
                    </View>
                    {/* 옵션 버튼 */}
                    <TouchableOpacity onPress={toggleOptions} style={{ zIndex: 1000 }} >
                        <IconA size={35} color="black" name={"dots-three-vertical"} />
                    </TouchableOpacity>

                    {/* 옵션 메뉴 */}
                    {showOptions && (
                        <View style={optionStyle.container}>
                            {/* 수정 옵션 */}
                            <TouchableOpacity style={optionStyle.boxArea}
                                onPress={async () => {
                                    if (userdata.user_pk === postDetailInfo?.user_id) {
                                        const post_edit_info = await getPostInfo();
                                        navigation.navigate("EditPostScreen", { userdata, post_edit_info, postImages });
                                    } else {
                                        noYourPostAlert();
                                        toggleOptions();
                                    }
                                }}>
                                <Text style={optionStyle.boxText}>수정</Text>
                            </TouchableOpacity>
                            <View style={optionStyle.boxLine}></View>
                            {/* 신고 옵션 */}
                            <TouchableOpacity
                                style={optionStyle.boxArea}
                                onPress={() => {
                                    if (userdata.user_pk === postDetailInfo?.user_id) {
                                        Alert.alert("본인은 신고할 수 없습니다.");
                                    } else {
                                        reportUserDuplicate();
                                    }
                                }}>
                                <Text style={optionStyle.boxText}>신고</Text>
                            </TouchableOpacity>
                            {/* 삭제 옵션: 사용자 권한에 따라 표시 */}
                            {(userdata?.title === "학교" || postDetailInfo?.post_writer === userdata?.name) && (
                                <>
                                    <View style={optionStyle.boxLine}></View>
                                    <TouchableOpacity style={optionStyle.boxArea} onPress={deletePost}>
                                        <Text style={optionStyle.boxText}>삭제</Text>
                                    </TouchableOpacity>
                                </>
                            )}
                        </View>
                    )}
                </View>

                {/* 포스트 내용 영역 */}
                <View style={styles.postArea}>
                    <Text style={styles.postTitle}>{postDetailInfo?.title}</Text>
                    <Text style={styles.postContent}>{postDetailInfo?.contents}</Text>

                    {/* 포스트 이미지 스크롤: postImages가 있을 때만 렌더링 */}
                    {postImages.length > 0 && (
                        <ScrollView horizontal style={styles.imagePreviewContainer} showsHorizontalScrollIndicator={false}>
                            {postImages.map((image, index) => (
                                <TouchableOpacity
                                    key={index}
                                    onPress={() => openImageModal(index)}
                                    style={postImages.length === 1 ? styles.previewImageFullArea : null}>
                                    <Image
                                        source={{ uri: `${config.photoUrl}/${image.post_photo}.png` }}
                                        style={postImages.length === 1 ? styles.previewImageFullWidth : styles.previewImage}
                                    />
                                </TouchableOpacity>
                            ))}
                        </ScrollView>
                    )}
                </View>

                {/* 포스트 상태 (좋아요, 조회수) */}
                <View style={styles.postState}>
                    <TouchableOpacity onPress={async () => {
                        const is_post_like: boolean = await isUserPostLike();
                        if (is_post_like) {
                            postLikeAlert(postDetailInfo?.post_id);
                        } else {
                            postCancelLikeAlert(postDetailInfo?.post_id);
                        }
                    }}>
                        <IconB name="like1" size={24} color={'black'} />
                    </TouchableOpacity>
                    <Text style={styles.likeCount}>{postDetailInfo?.like}</Text>
                    <Text style={{ color: 'black', marginLeft: 5 }}>
                        <IconB name="eyeo" size={24} />
                    </Text>
                    <Text style={styles.viewCount}>{postDetailInfo?.view}</Text>
                </View>
                <View style={{ height: 20 }}></View>
                {
                    comments.map(item => (
                        <View key={item.comment_id} style={styles.commentcontainer}>
                            <View style={styles.commentTop}>
                                <View style={styles.commentInfo}>
                                    <View style={styles.commentPic}>
                                        <Image
                                            source={{ uri: `${config.photoUrl}/${item?.user_profile}` }}
                                            style={{ width: 40, height: 40, borderRadius: 8, }}
                                        />
                                    </View>
                                    <View style={styles.commentName}>
                                        <Text style={{ fontSize: 17, color: 'black', fontWeight: "bold", }}>{item.student_name}</Text>
                                        <Text style={{ fontSize: 15, color: 'black' }}>{item.department_name}</Text>
                                    </View>
                                </View>
                                <View style={styles.commentOptionBox}>
                                    <TouchableOpacity
                                        style={styles.commentOptionIcon}
                                        onPress={() => {
                                            setIsCommentOrRecomment(1);
                                            setCommentsPk(item.comment_id);
                                            onFocusName();
                                        }}>
                                        <IconD size={29} color="black"
                                            name={"comment"} />
                                    </TouchableOpacity>
                                    <TouchableOpacity
                                        style={styles.commentOptionIcon}
                                        onPress={async () => {
                                            const is_comment_like: boolean = await is_user_comment_like(item.comment_id);
                                            if (is_comment_like) {
                                                comment_Like_alert(item.comment_id, item.user_id);
                                            } else {
                                                Comment_Cancel_Like_alert(item.comment_id, item.user_id);
                                            }

                                        }}>
                                        <IconD size={32} color="black" style={{ top: 1, left: 2 }}
                                            name={"like"} />
                                    </TouchableOpacity>
                                    <TouchableOpacity style={styles.commentOptionIcon}>
                                        <IconA size={20} color="black"
                                            name={"dots-three-vertical"} onPress={() => toggleOptions2(item.comment_id)} />
                                    </TouchableOpacity>
                                </View>
                            </View>
                            {activeCommentId === item.comment_id && (
                                <View style={optionStyle.commentContainer}>
                                    <TouchableOpacity style={optionStyle.boxArea} onPress={() => {
                                        if (userdata.user_pk == item.user_id) {
                                            setIsEditComment(1);
                                            toggleOptions2(item.comment_id);
                                            setEditCommentPk(item.comment_id);
                                            onFocusEditComment(item);
                                        } else {
                                            NoyourCommentAlert(item.comment_id);
                                        }
                                    }}>
                                        <Text style={optionStyle.boxText}>수정</Text>
                                    </TouchableOpacity>
                                    <View style={optionStyle.boxLine}></View>
                                    <TouchableOpacity
                                        style={optionStyle.boxArea}
                                        onPress={() => {
                                            if (userdata.user_pk === item.user_id) {
                                                Alert.alert("본인은 신고할 수 없습니다.");
                                            } else {
                                                //댓글
                                                ReportUserduplicate2(item.comment_id);
                                            }
                                        }}>
                                        <Text style={optionStyle.boxText}>신고</Text>
                                    </TouchableOpacity>
                                    {(userdata?.title === "학교" || item.student_name === userdata?.name) && (
                                        <>
                                            <View style={optionStyle.boxLine}></View>
                                            <TouchableOpacity style={optionStyle.boxArea} onPress={() => deleteComment(item.comment_id)}>
                                                <Text style={optionStyle.boxText}>삭제</Text>
                                            </TouchableOpacity>
                                        </>
                                    )}
                                </View>
                            )}
                            <View style={styles.commentContentArea}>
                                <Text style={styles.commentContent}>{item.content}</Text>
                                <View style={styles.commentState}>
                                    <Text style={styles.commentStateText}>
                                        {item.date}
                                    </Text>
                                    <IconD size={27} color="black" name={"like"} />
                                    <Text style={styles.commentStateText}>{item.like}</Text>
                                </View>
                            </View>
                            {item.recomments.map(subitem => (
                                <View key={subitem.recomment_id}>
                                    <View style={styles.recommentTop}>
                                        <View style={styles.commentInfo}>
                                            <IconC name="corner-down-right" size={30} color={'black'} style={{ marginHorizontal: 5 }} />
                                            <View style={styles.commentPic}>
                                                <Image
                                                    source={{ uri: `${config.photoUrl}/${subitem?.user_profile}` }}
                                                    style={{ width: 40, height: 40, borderRadius: 8, }}
                                                />
                                            </View>
                                            <View style={styles.commentName}>
                                                <Text style={{ fontSize: 17, color: 'black', fontWeight: "bold", }}>{subitem.student_name}</Text>
                                                <Text style={{ fontSize: 15, color: 'black' }}>{subitem.department_name}</Text>
                                            </View>
                                        </View>
                                        <View style={styles.recommentOptionBox}>
                                            <TouchableOpacity
                                                style={styles.commentOptionIcon}
                                                onPress={async () => {
                                                    const is_recomment_like: boolean = await is_user_recomment_like(subitem.recomment_id);
                                                    if (is_recomment_like) {
                                                        recomment_Like_alert(subitem.recomment_id, subitem.user_id)
                                                    } else {
                                                        recomment_Like_Cancel_alert(subitem.recomment_id, subitem.user_id)
                                                    }
                                                }}>
                                                <IconD size={32} color="black" name={"like"} style={{ top: 1, left: 2 }} />
                                            </TouchableOpacity>
                                            <TouchableOpacity style={styles.commentOptionIcon}>
                                                <IconA size={20} color="black" name={"dots-three-vertical"} onPress={() => toggleOptions2(subitem.recomment_id)} />
                                            </TouchableOpacity>
                                        </View>
                                    </View>
                                    <View style={[styles.recommentContentArea]}>
                                        <Text style={[styles.commentContent]}>{subitem.content}</Text>
                                        <View style={styles.commentState}>
                                            <Text style={styles.commentStateText}>{subitem.date}</Text>
                                            <IconD size={27} color="black" name={"like"} />
                                            <Text style={styles.commentStateText}>{subitem.like}</Text>
                                        </View>
                                    </View>
                                    {activeCommentId === subitem.recomment_id && (
                                        <View style={optionStyle.commentContainer}>
                                            <TouchableOpacity style={optionStyle.boxArea} onPress={() => {
                                                if (userdata.user_pk == subitem.user_id) {
                                                    setIsEditComment(1);
                                                    toggleOptions2(subitem.recomment_id);
                                                    setIsCommentOrRecomment(1);
                                                    setEditCommentPk(subitem.recomment_id);
                                                    onFocusEditReComment(subitem);
                                                } else {
                                                    NoyourreCommentAlert(subitem.recomment_id);
                                                }
                                            }}>
                                                <Text style={optionStyle.boxText}>수정</Text>
                                            </TouchableOpacity>
                                            <View style={optionStyle.boxLine}></View>
                                            <TouchableOpacity
                                                style={optionStyle.boxArea}
                                                onPress={() => {
                                                    if (userdata.user_pk === item.user_id) {
                                                        Alert.alert("본인은 신고할 수 없습니다.");
                                                    } else {
                                                        //댓글신고
                                                        ReportUserduplicate2(item.comment_id);
                                                    }
                                                }}>
                                                <Text style={optionStyle.boxText}>신고</Text>
                                            </TouchableOpacity>
                                            {(userdata?.title === "학교" || subitem.student_name === userdata?.name) && (
                                                <>
                                                    <View style={optionStyle.boxLine}></View>
                                                    <TouchableOpacity style={optionStyle.boxArea} onPress={() => deleterecomment(subitem.recomment_id)}>
                                                        <Text style={optionStyle.boxText}>삭제</Text>
                                                    </TouchableOpacity>
                                                </>
                                            )}
                                        </View>
                                    )}
                                </View>
                            ))}
                        </View>
                    ))
                }
                {/* 동아리 신청 및 현황 파악 버튼 */}
                <View style={styles.buttonContainer}>
                    {(userdata?.user_pk !== postDetailInfo?.user_id) && (
                        <TouchableOpacity
                            style={styles.button}
                            onPress={() => {
                                console.log("동아리 신청하기.");
                                navigation.navigate("SchoolClubSignScreen", { item, userData });
                            }}
                        >
                            <Text style={styles.buttonText}>동아리 신청하기</Text>
                        </TouchableOpacity>
                    )}
                    {(userdata?.user_pk === postDetailInfo?.user_id) && (
                        <TouchableOpacity
                            style={styles.button}
                            onPress={() => {
                                console.log("동아리 현황 파악하기.");
                                navigation.navigate("SchoolClubSignStateScreen", { item, userData });
                            }}
                        >
                            <Text style={styles.buttonText}>동아리 현황 파악하기</Text>
                        </TouchableOpacity>
                    )}
                </View>
            </ScrollView>

            {/* 이미지 모달 */}
            {activeImageIndex !== null && (
                <Modal
                    visible={showModal}
                    transparent={true}
                    animationType="slide"
                    onRequestClose={closeModal}
                >
                    <View style={styles.modalTop}>
                        <TouchableOpacity onPress={closeModal} style={styles.closeModalButton}>
                            <Text style={styles.closeModalText}>X</Text>
                        </TouchableOpacity>
                    </View>
                    <View style={styles.modalBackground}>
                        <FlatList
                            data={postImages}
                            horizontal
                            pagingEnabled
                            initialScrollIndex={activeImageIndex}
                            getItemLayout={(data, index) => (
                                { length: width, offset: width * index, index }
                            )}
                            showsHorizontalScrollIndicator={false}
                            renderItem={({ item }) => (
                                <Image
                                    source={{ uri: `${config.photoUrl}/${item.post_photo}.png` }}
                                    style={styles.fullImage}
                                />
                            )}
                            keyExtractor={(_, index) => index.toString()}
                        />
                    </View>
                </Modal>
            )}


            <View style={styles.writeCommentBox}>
                <View style={[styles.inputtext, { height: inputHeight }]}>
                    <TextInput
                        ref={inputRef}
                        style={{ paddingLeft: 20, fontSize: 20, color: 'black' }}
                        onChangeText={handleInputChange}
                        onBlur={() => {
                            setIsCommentOrRecomment(0);
                            setIsEditComment(0);
                        }}
                        onContentSizeChange={handleContentSizeChange}
                        value={commentText}
                        multiline={true}
                        placeholder="댓글을 입력하세요."
                        placeholderTextColor={'gray'}
                    />
                </View>
                <TouchableOpacity
                    onPress={async () => {
                        await writeComment();
                    }}
                    style={styles.sendspace}>
                    <Text style={{ color: '#F29F05', justifyContent: 'flex-end' }}> <IconC name="send" size={34} /></Text>
                </TouchableOpacity>
            </View>
        </View >

    );

};

// 스타일 시트 정의
const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: 'white'
    },
    writerArea: { // 상단 작성자 영역
        height: 100,
        borderBottomWidth: 1,
        borderRadius: 20,
        borderColor: 'gray',
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingHorizontal: 35,
        alignItems: 'center',
    },
    writer: {
        flexDirection: 'row',
    },
    writerPic: { // 작성자 프로필 사진
        width: 60,
        height: 60,
        borderRadius: 12,
        backgroundColor: 'gray'
    },
    writerInfo: { // 작성자 정보 영역
        height: 60,
        marginHorizontal: 10,
        justifyContent: 'space-evenly',
    },
    writerName: { // 작성자 이름
        fontSize: 17,
        fontWeight: 'bold',
        color: 'black'
    },
    writeTime: { // 작성 시간
        fontSize: 17,
        color: 'black'
    },
    optionBox: { // 옵션 메뉴 스타일
        position: 'absolute',
        top: 70,
        right: 20,
        width: 120,
        backgroundColor: 'white',
        borderRadius: 8,
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        elevation: 5,
        paddingVertical: 10,
        paddingHorizontal: 5,
        zIndex: 9999
    },
    optionText: { // 옵션 텍스트 스타일
        fontSize: 15,
        fontWeight: "bold",
        color: "black",
        paddingLeft: 10
    },
    optionLine: { // 옵션 메뉴 구분선
        width: 100,
        height: 0.4,
        backgroundColor: 'black',
        marginRight: 20,
        marginTop: 10,
        marginBottom: 10
    },
    postArea: { // 포스트 내용 영역
        flex: 1,
        marginHorizontal: 25,
        marginVertical: 15,
    },
    postTitle: { // 포스트 제목
        fontSize: 20,
        color: 'black',
        fontWeight: 'bold'
    },
    postContent: { // 포스트 내용
        fontSize: 18,
        color: 'black',
        marginTop: 10,
        marginBottom: 20
    },
    postState: { // 포스트 상태 (좋아요, 조회수)
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 25,
        paddingBottom: 20,
        marginBottom: 20,
        borderColor: 'gray',
        borderBottomWidth: 1,
        borderRadius: 20
    },
    likeCount: { // 좋아요 수
        color: 'black',
        fontSize: 20,
        marginLeft: 5
    },
    viewCount: { // 조회수
        color: 'black',
        fontSize: 20,
        marginLeft: 5
    },
    imagePreviewContainer: { // 이미지 스크롤 컨테이너
        flexDirection: 'row',
    },
    previewImage: { // 이미지 미리보기 스타일
        width: 100,
        height: 100,
        marginRight: 10,
        borderRadius: 10,
        resizeMode: 'contain',
    },
    previewImageFullArea: { // 이미지가 한 장일 때 전체 영역 사용
        width: width - 60,
        height: width - 60,
    },
    previewImageFullWidth: { // 이미지가 한 장일 때 전체 너비 사용
        width: '100%',
        height: '100%',
        borderRadius: 10,
    },
    fullImage: { // 모달에서 보여지는 전체 이미지 스타일
        flex: 1,
        width: width,
        height: '100%',
        resizeMode: 'contain'
    },
    modalBackground: { // 모달 배경 스타일
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
    },
    modalTop: { // 모달 상단 닫기 버튼 영역
        width: '100%',
        height: 50,
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'flex-end'
    },
    closeModalButton: { // 모달 닫기 버튼 스타일
        width: 50,
        height: 50,
        alignItems: 'center',
        justifyContent: 'center',
    },
    closeModalText: { // 모달 닫기 텍스트 스타일
        color: 'white',
        fontSize: 30,
    },
    buttonContainer: { // 하단 버튼 컨테이너 스타일
        marginHorizontal: 10,
        alignItems: 'center',
    },
    button: { // 커스터마이징된 버튼 스타일
        width: '100%',
        backgroundColor: '#4CAF50', // 원하는 배경색으로 변경
        paddingVertical: 15,
        borderRadius: 10,
        alignItems: 'center',
        justifyContent: 'center',
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        elevation: 5,
    },
    buttonText: { // 버튼 텍스트 스타일
        color: 'white',
        fontSize: 16,
        fontWeight: 'bold',
    },
    orText: { // 'or' 텍스트 스타일
        marginVertical: 10,
        fontSize: 16,
        color: 'gray'
    },

    writeCommentBox: {
        backgroundColor: '#D9D9D9',
        margin: 10,
        borderRadius: 10,
        flexDirection: 'row',
    },

    inputtext: {
        width: '88%',
        borderTopLeftRadius: 10,
        borderBottomLeftRadius: 10,
    },

    sendspace: {
        width: 45,
        height: 45,
        borderRadius: 10,
        justifyContent: 'center',
        marginRight: 20,
    },
    //만약에 사진 추가 하려면 여기에
    commentcontainer: {
        minHeight: 120,
        marginBottom: 10,
        borderBottomWidth: 1,
        borderBottomColor: 'gray',
        borderRadius: 20,
    },
    commentTop: {
        height: 50,
        flexDirection: 'row',
        alignItems: 'center',
        marginHorizontal: 20,
        justifyContent: 'space-between'
    },
    commentInfo: {
        flexDirection: 'row',
        alignItems: 'center'
    },
    commentPic: {
        width: 40,
        height: 40,
        borderRadius: 8,
        backgroundColor: 'gray'
    },
    commentName: {
        marginHorizontal: 10,
    },
    commentOptionBox: {
        width: 120,
        height: 35,
        backgroundColor: '#CED4DA',
        borderRadius: 8,
        elevation: 5,
        flexDirection: 'row',
    },
    commentOptionIcon: {
        width: 40,
        height: 35,
        justifyContent: 'center',
        alignItems: 'center'
    },
    commentContentArea: {
        paddingHorizontal: 25,
        paddingVertical: 10,
    },
    commentContent: {
        fontSize: 19,
        color: 'black',
    },
    commentState: {
        flexDirection: 'row',
        marginTop: 10
    },
    commentStateText: {
        fontSize: 15,
        color: 'black',
    },
    recommentTop: {
        height: 50,
        flexDirection: 'row',
        alignItems: 'center',
        marginHorizontal: 20,
        marginTop: 15,
        justifyContent: 'space-between',
    },
    recommentOptionBox: {
        width: 80,
        height: 35,
        backgroundColor: '#CED4DA',
        borderRadius: 8,
        elevation: 5,
        flexDirection: 'row',
    },
    recommentContentArea: {
        paddingHorizontal: 25,
        paddingLeft: 70,
        paddingVertical: 10,
    },

    commentOption: {
        top: 45,
        right: 20,
        position: 'absolute',
        width: 120,
        backgroundColor: 'white',
        borderRadius: 8,
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        elevation: 5,
        paddingVertical: 10,
        paddingHorizontal: 5,
    },

    recommentOption: {
        top: 60,
        right: 20,
        position: 'absolute',
        width: 120,
        backgroundColor: 'white',
        borderRadius: 8,
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        elevation: 5,
        paddingVertical: 10,
        paddingHorizontal: 5,
    },

});

const optionStyle = StyleSheet.create({
    container: {
        position: 'absolute',
        top: 65,
        right: 20,
        backgroundColor: 'white',
        elevation: 5,
        borderRadius: 10,
    },
    commentContainer: {
        position: 'absolute',
        top: 45,
        right: 20,
        backgroundColor: 'white',
        elevation: 5,
        borderRadius: 10
    },
    boxArea: {
        width: 100,
        paddingHorizontal: 10,
        paddingVertical: 5,
    },
    boxText: {
        fontSize: 15,
        fontWeight: "bold",
        color: "black",
    },
    boxLine: {
        backgroundColor: 'black',
        width: '85%',
        height: 1,
        alignSelf: 'center'
    }
})

export default SchoolClubDetailScreen;
