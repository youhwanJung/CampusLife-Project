import React, { useState, useEffect } from 'react';
import {
    Text,
    TextInput,
    View,
    StyleSheet,
    TouchableOpacity,
    ScrollView,
    Image,
    Dimensions,
    Modal,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import IconA from 'react-native-vector-icons/FontAwesome5';
import ModalBox from 'react-native-modalbox';
import { launchImageLibrary, ImagePickerResponse } from 'react-native-image-picker';
import { UserData } from "../../types/type";
import config from '../../config';

// 디바이스 화면 너비 가져오기
const width = Dimensions.get('window').width;

const StudentInfoScreen = ({ route, navigation }: any) => {
    // 모달 상태 관리 변수
    const [isCameraModalOpen, setIsCameraModalOpen] = useState(false);
    const [isAlertModalOpen, setIsAlertModalOpen] = useState(false);
    const [alertMessage, setAlertMessage] = useState("");

    // 라우트 파라미터에서 사용자 데이터 추출
    const { userData, Userdepartment } = route.params;
    const [userdata, setUserData] = useState<UserData>(userData);
    const [UserUniversity, setUserUniversity] = useState<string | undefined>();
    const [imageResponse, setImageResponse] = useState<ImagePickerResponse | null>(null);
    const [imageFormData, setImageFormData] = useState<FormData | null>(null);

    /**
     * 프로필 사진을 선택하기 위해 이미지 라이브러리를 여는 함수
     */
    const getPhotos = () => {
        const options: any = {
            mediaType: 'photo',
        };
        launchImageLibrary(options, (response) => {
            if (response.didCancel) {
                console.log("사진 선택 취소");
            } else if (response.errorCode) {
                console.log(`imagePicker 에러 : ${response.errorCode}`);
            } else {
                if (response.assets && response.assets.length > 0) {
                    setImageResponse(response);
                    const fileName = `${Date.now()}.png`;
                    const formData = new FormData();
                    formData.append('images', {
                        uri: response.assets[0].uri,
                        type: response.assets[0].type,
                        name: fileName,
                    });
                    setImageFormData(formData);
                }
            }
        });
    };

    /**
     * 서버에서 사용자의 대학 이름을 가져오는 함수
     */
    const getUserUniversity = async () => {
        try {
            const response = await fetch(`${config.serverUrl}/get_university_name`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    university_name: userdata.campus_pk,
                }),
            });
            const result = await response.json();
            setUserUniversity(result.useruniversity);
        } catch (error) {
            console.error('유저 학교 이름 가져오기 실패:', error);
        }
    };

    /**
     * 사용자 계정을 삭제하는 함수
     */
    const deleteUser = async () => {
        try {
            const response = await fetch(`${config.serverUrl}/delete_user`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    user_pk: userdata.user_pk,
                }),
            });
            const data = await response.json();
            if (response.ok) {
                showAlertModal(data.message, () => navigation.navigate("LoginScreen"));
            } else {
                throw new Error(data.message);
            }
        } catch (error) {
            console.error('계정 삭제 실패:', error);
            showAlertModal("계정 삭제 실패");
        }
    };

    /**
     * 사용자 계정을 업데이트하는 함수
     */
    const updateAccount = async () => {
        try {
            const response = await fetch(`${config.serverUrl}/updateAccount`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    email: userdata.email,
                    grade: userdata.grade,
                    currentstatus: userdata.currentstatus,
                    student_id: userdata.student_pk,
                }),
            });
            const data = await response.json();
            if (response.ok && userdata.title !== "학교") {
                if (imageFormData) {
                    const imageFileName = await uploadImages(imageFormData);
                    if (imageFileName) {
                        userdata.profile_photo = imageFileName;
                        await updateImage(imageFileName);
                    }
                }
                showAlertModal(data.message, () => navigation.navigate("MainScreen", { updatedUserData: userdata }));
            } else {
                showAlertModal(data.message, () => navigation.navigate("AdminScreen", { updatedUserData: userdata }));
            }
        } catch (error) {
            console.error('계정 업데이트 실패:', error);
            showAlertModal("계정 업데이트 실패");
        }
    };

    /**
     * 기본 이미지를 설정하는 함수
     */
    const setDefaultImage = () => {
        setUserData(prev => ({ ...prev, profile_photo: null }));
    };

    /**
     * 이미지 파일명을 서버에 업데이트하는 함수
     */
    const updateImage = async (imageFileName: string | null) => {
        try {
            const response = await fetch(`${config.serverUrl}/updateImg`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    profilePhoto: imageFileName,
                    user_id: userdata.user_pk,
                }),
            });
            await response.json();
        } catch (error) {
            console.error('이미지 업데이트 실패:', error);
        }
    };

    /**
     * 이미지를 서버에 업로드하는 함수
     */
    const uploadImages = async (formData: FormData) => {
        try {
            const response = await fetch(`${config.serverUrl}/upload`, {
                method: 'POST',
                body: formData,
            });
            const imageName = await response.text();
            return imageName;
        } catch (error: any) {
            console.error('이미지 업로드 실패:', error);
        }
    };

    /**
     * 로그아웃 함수
     */
    const logout = () => {
        navigation.navigate("LoginScreen");
    };

    /**
     * 모달 열기 및 닫기 함수
     */
    const openCameraModal = () => setIsCameraModalOpen(true);
    const closeCameraModal = () => setIsCameraModalOpen(false);

    /**
     * 알림 모달 표시 함수
     */
    const showAlertModal = (message: string, onComplete?: () => void) => {
        setAlertMessage(message);
        setIsAlertModalOpen(true);

        // 모달이 열리면 2초 후에 자동으로 닫힘
        setTimeout(() => {
            setIsAlertModalOpen(false);
            if (onComplete) {
                onComplete();
            }
        }, 500); // 2초 후에 모달 닫기
    };

    /**
     * 화면 포커스 시 사용자 대학 이름을 가져오는 효과
     */
    useFocusEffect(
        React.useCallback(() => {
            const fetchData = async () => {
                await getUserUniversity(); // 비동기 함수 호출
            };

            fetchData(); // 비동기 함수를 호출하여 실행

        }, [])
    );

    /**
     * 프로필 사진을 렌더링하는 로직
     */
    let content: JSX.Element;
    if (imageResponse && imageResponse.assets) {
        content = <Image source={{ uri: imageResponse.assets[0].uri }} style={styles.image} />;
    } else if (userdata.profile_photo) {
        content = <Image source={{ uri: `${config.photoUrl}/${userdata.profile_photo}` }} style={styles.image} />;
    } else {
        content = <IconA name="user" size={70} color="black" style={[styles.image, { paddingLeft: 30, paddingTop: 25 }]} />;
    }

    return (
        <View style={styles.container}>
            <ScrollView contentContainerStyle={styles.scrollContainer}>
                {/* 프로필 사진 영역 */}
                <View style={styles.profilePicture}>
                    {content}
                    <TouchableOpacity style={styles.cameraButton} onPress={openCameraModal}>
                        <IconA name="camera" size={24} color="#fff" />
                    </TouchableOpacity>
                </View>

                {/* 학생 정보 영역 */}
                <View style={styles.studentInfoArea}>
                    {/* 학교 정보 */}
                    <InfoRow title="학교" data={UserUniversity} />
                    {/* 학과 정보 */}
                    <InfoRow title="학과" data={Userdepartment} />

                    {/* 학교 계정이 아닌 경우에만 재학 상태와 학년 표시 */}
                    {userdata.title !== '학교' && (
                        <>
                            {userdata.currentstatus === "졸업" ? (
                                <InfoRow title="재학상태" data={userdata.currentstatus} />
                            ) : (
                                <>
                                    <InfoRow title="학년" data={`${userdata.grade}학년`} />
                                    <InfoRow title="재학상태" data={userdata.currentstatus} />
                                </>
                            )}
                        </>
                    )}

                    {/* 기타 정보 */}
                    <InfoRow title="학번" data={userdata.student_pk ? userdata.student_pk.toString() : "정보 없음"} />
                    <InfoRow title="생년월일" data={userdata.birth} />
                    <InfoRow title="성명(한글)" data={userdata.name} />
                    <InfoRow title="성명(영어)" data={"정보 없음"} />
                    <InfoRow title="아이디" data={userdata.id} />
                    <InfoRow title="전화(집)" data={"정보 없음"} />
                    <InfoRow title="전화(H.P)" data={"정보 없음"} />
                    {/* 이메일 입력 필드 */}
                    <InfoInputRow
                        title="E-mail"
                        value={userdata.email}
                        onChangeText={(text) => setUserData(prev => ({ ...prev, email: text }))}
                    />
                    <InfoRow title="우편주소" data={"정보 없음"} />
                    <InfoRow title="주소" data={"정보 없음"} />
                    <InfoRow title="상세주소" data={"정보 없음"} />
                    <InfoRow title="은행명" data={"정보 없음"} />
                    <InfoRow title="은행계좌" data={"정보 없음"} />
                    <InfoRow title="예금주" data={"정보 없음"} />
                </View>

                {/* 버튼 영역 */}
                <View style={styles.buttonArea}>
                    <TouchableOpacity
                        style={[styles.button, styles.deleteButton]}
                        onPress={deleteUser}
                    >
                        <Text style={styles.buttonText}>회원 탈퇴</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={[styles.button, styles.logoutButton]}
                        onPress={logout}
                    >
                        <Text style={styles.buttonText}>로그아웃</Text>
                    </TouchableOpacity>
                </View>
            </ScrollView>

            {/* 확인 버튼 */}
            <TouchableOpacity style={styles.confirmButton} onPress={updateAccount}>
                <Text style={styles.confirmButtonText}>확인</Text>
            </TouchableOpacity>

            {/* 카메라 모달 */}
            <ModalBox
                isOpen={isCameraModalOpen}
                style={stylesModal.cameraModal}
                position="center"
                swipeToClose={true}
                onClosed={closeCameraModal}
            >
                <View style={stylesModal.cameraModalContent}>
                    <Text style={stylesModal.cameraModalTitle}>프로필 사진 변경</Text>
                    <TouchableOpacity onPress={getPhotos} style={stylesModal.cameraOption}>
                        <Text style={stylesModal.cameraOptionText}>앨범에서 사진 선택</Text>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={setDefaultImage} style={stylesModal.cameraOption}>
                        <Text style={stylesModal.cameraOptionText}>기본 이미지 설정</Text>
                    </TouchableOpacity>
                </View>
            </ModalBox>

            {/* 알림 모달 */}
            <Modal
                visible={isAlertModalOpen}
                transparent={true}
                animationType="fade"
                onRequestClose={() => setIsAlertModalOpen(false)}
            >
                <View style={stylesAlertModal.modalBackground}>
                    <View style={stylesAlertModal.modalContainer}>
                        <Text style={stylesAlertModal.modalMessage}>{alertMessage}</Text>
                    </View>
                </View>
            </Modal>
        </View>
    );
};

/**
 * 정보 행 컴포넌트
 * @param title - 정보의 제목
 * @param data - 정보의 데이터
 */
const InfoRow = ({ title, data }: { title: string; data: string | undefined }) => (
    <View style={styles.infoRow}>
        <View style={styles.infoTitle}>
            <Text style={styles.infoTitleText}>{title}</Text>
        </View>
        <View style={styles.infoData}>
            <View style={styles.infoDataTextArea}>
                <Text style={styles.infoDataText}>{data || "정보 없음"}</Text>
            </View>
        </View>
    </View>
);

/**
 * 입력 가능한 정보 행 컴포넌트
 * @param title - 정보의 제목
 * @param value - 입력 필드의 값
 * @param onChangeText - 텍스트 변경 시 호출되는 함수
 */
const InfoInputRow = ({ title, value, onChangeText }: { title: string; value: string; onChangeText: (text: string) => void }) => (
    <View style={styles.infoRow}>
        <View style={styles.infoTitle}>
            <Text style={styles.infoTitleText}>{title}</Text>
        </View>
        <View style={styles.infoData}>
            <View style={styles.infoDataTextArea}>
                <TextInput
                    style={styles.infoDataInput}
                    value={value}
                    onChangeText={onChangeText}
                    placeholder="정보를 입력하세요"
                    placeholderTextColor="#999"
                />
            </View>
        </View>
    </View>
);

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F5F5F5',
    },
    scrollContainer: {
        paddingVertical: 20,
        paddingBottom: 80,
    },
    profilePicture: {
        marginTop: 10,
        width: 120,
        height: 120,
        borderRadius: 60,
        justifyContent: 'center',
        alignSelf: 'center',
        position: 'relative',
        backgroundColor: '#E0E0E0',
        elevation: 10,
    },
    cameraButton: {
        position: 'absolute',
        bottom: 0,
        right: 0,
        backgroundColor: '#4CAF50',
        borderRadius: 20,
        padding: 8,
        elevation: 5,
    },
    image: {
        width: '100%',
        height: '100%',
        borderRadius: 60,
    },
    studentInfoArea: {
        backgroundColor: '#FFFFFF',
        width: '90%',
        alignSelf: 'center',
        borderRadius: 10,
        borderWidth: 1,
        borderColor: '#DDDDDD',
        marginVertical: 20,
        paddingVertical: 10,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 5,
        elevation: 3,
    },
    infoRow: {
        flexDirection: 'row',
        alignSelf: 'center',
        width: '90%',
        height: 50,
        borderBottomWidth: 1,
        borderColor: '#EEEEEE',
        alignItems: 'center',
    },
    infoTitle: {
        width: '30%',
        justifyContent: 'center',
        alignItems: 'flex-start',
    },
    infoTitleText: {
        color: '#333333',
        fontSize: 16,
        fontWeight: '600',
    },
    infoData: {
        width: '70%',
        justifyContent: 'center',
        alignItems: 'flex-start',
    },
    infoDataTextArea: {
        width: '100%',
        paddingHorizontal: 10,
        paddingVertical: 5,
        borderRadius: 5,
        backgroundColor: '#F9F9F9',
    },
    infoDataText: {
        color: '#555555',
        fontSize: 16,
    },
    infoDataInput: {
        color: '#555555',
        fontSize: 16,
        padding: 0,
    },
    buttonArea: {
        width: '90%',
        alignSelf: 'center',
        borderRadius: 10,
        borderWidth: 1,
        borderColor: '#DDDDDD',
        backgroundColor: '#FFFFFF',
        marginBottom: 20,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 5,
        elevation: 3,
    },
    button: {
        width: '100%',
        height: 50,
        alignItems: 'center',
        justifyContent: 'center',
    },
    deleteButton: {
        borderBottomWidth: 1,
        borderColor: '#DDDDDD',
    },
    logoutButton: {
        borderTopWidth: 1,
        borderColor: '#DDDDDD',
    },
    buttonText: {
        fontSize: 18,
        fontWeight: '600',
        color: '#FF5252',
    },
    confirmButton: {
        backgroundColor: '#6200EE',
        width: '90%',
        height: 50,
        alignSelf: 'center',
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: 25,
        shadowColor: '#6200EE',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 5,
        elevation: 5,
        marginBottom: 20,
        position: 'absolute',
        bottom: 0,
    },
    confirmButtonText: {
        fontSize: 18,
        color: '#FFFFFF',
        fontWeight: "600",
    },
});

const stylesModal = StyleSheet.create({
    cameraModal: {
        borderRadius: 20,
        height: 200,
        width: '90%',
        backgroundColor: '#FFFFFF',
        padding: 20,
    },
    cameraModalContent: {
        alignItems: 'center',
        justifyContent: 'center',
    },
    cameraModalTitle: {
        fontSize: 20,
        color: "#333333",
        fontWeight: "700",
        marginBottom: 20,
    },
    cameraOption: {
        width: '100%',
        paddingVertical: 15,
        alignItems: 'center',
    },
    cameraOptionText: {
        fontSize: 18,
        color: "#6200EE",
        fontWeight: "600",
    },
});

const stylesAlertModal = StyleSheet.create({
    modalBackground: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    modalContainer: {
        width: '80%',
        backgroundColor: '#FFFFFF',
        borderRadius: 10,
        padding: 20,
        alignItems: 'center',
    },
    modalMessage: {
        fontSize: 18,
        color: '#333333',
        textAlign: 'center',
    },
});

export default StudentInfoScreen;
