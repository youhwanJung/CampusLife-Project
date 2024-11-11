import React, { useCallback, useState } from 'react';
import { View, StyleSheet, Dimensions, Text, Image, Alert, Modal, TouchableOpacity, TextInput } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { ScrollView } from 'react-native-gesture-handler';
import IconSetting from 'react-native-vector-icons/Entypo';
import { UserData } from '../types/type';
import config from '../config';
import { useFocusEffect } from '@react-navigation/native';

type userInfo = {
  user_id: number,
  id: string,
  point: number,
  profilePhoto: string,
  title: string,
  report_confirm: number,
  student_name: string,
  student_id: number,
  department_id: number,
  department_name: string,
  campus_id: number,
  caution: number,
};

/** 유저 등급에 따른 색상 지정 */
const getRoleColor = (role: string) => {
  switch (role) {
    case '반장':
      return 'green';
    case '학우회장':
      return 'blue';
    case '일반학생':
      return 'black';
    case '학교':
      return 'red';
    default:
      return 'black';
  }
};

/** 유저 관리 */
const UserManagement = ({ route }: any) => {
  const { userdata } = route.params;
  const [selectedDepartment, setSelectedDepartment] = useState('');
  const [selectedAdmin, setSelectedAdmin] = useState('');
  const [selectedUser, setSelectedUser] = useState<any>(null); // 선택된 사용자 상태
  const [departments, setDepartments] = useState<string[]>([]);
  const [usergetData, setUserData] = useState<UserData>(userdata);
  const [userData, setUserDataState] = useState<userInfo[]>([]);
  const [admin_check, setAdminCheck] = useState<string[]>([]);
  const [roleModalVisible, setRoleModalVisible] = useState(false); // 권한 변경 모달의 가시성 상태
  const [pointsModalVisible, setPointsModalVisible] = useState(false); // 포인트 수정 모달의 가시성 상태
  const [selectedRole, setSelectedRole] = useState<string>('');
  const [newPoints, setNewPoints] = useState<number | undefined>(undefined);

  const get_department = async () => {
    try {
      const response = await fetch(`${config.serverUrl}/get_department`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          campus_id: usergetData.campus_pk
        })
      });

      if (!response.ok) {
        throw new Error('Network response was not ok');
      }

      const data = await response.json();
      //console.log(data); // API에서 받아온 데이터 확인

      // 데이터에서 학과 이름들을 추출하여 departments 배열에 저장
      const departmentNames = data.map((item: any) => item.department_name); // 예시로 department_name을 가져오는 코드

      setDepartments(departmentNames); // departments 배열 업데이트
    } catch (error) {
      console.error('Failed to fetch departments:', error);
    }
  };

  const get_user_Info = async () => {
    try {
      const response = await fetch(`${config.serverUrl}/get_user_Info`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          campus_id: usergetData.campus_pk
        })
      });

      if (!response.ok) {
        throw new Error('Network response was not ok');
      }

      const data = await response.json();

      // title이 '학교'인 데이터는 필터링하여 제외
      const filteredData = data.filter((item: any) => item.title !== '학교');

      // 필터링된 데이터에서 adminCheckNames 추출
      const adminCheckNames = filteredData.map((item: any) => item.title);
      const uniqueAdminCheckNames = Array.from(new Set(adminCheckNames)) as string[];
      setAdminCheck(uniqueAdminCheckNames);

      setUserDataState(filteredData);
    } catch (error) {
      console.error('Failed to fetch user info:', error);
    }
  };

  const filteredUserData = userData.filter((user) => {
    return (
      (selectedDepartment === '' || user.department_name === selectedDepartment) &&
      (selectedAdmin === '' || (user.title === selectedAdmin && user.title !== '학교'))
    );
  });

  // 각 사용자의 설정 아이콘을 클릭하여 선택된 사용자 상태를 업데이트합니다.
  const setSettingUser = (user: any) => {
    if (selectedUser && selectedUser.user_id === user.user_id) {
      setSelectedUser(null); // 이미 선택된 사용자를 다시 누르면 드롭다운 닫기
    } else {
      setSelectedUser(user); // 새로운 사용자를 선택하면 드롭다운 열기
    }
  };

  /** 경고 주기 기능 */
  const handleReportCheck = async () => {
    if (selectedUser) {
      Alert.alert(
        '경고 주기',
        `선택된 사용자에게 경고를 주시겠습니까?`,
        [
          {
            text: '취소',
            style: 'cancel'
          },
          {
            text: '확인',
            onPress: async () => {
              try {
                const response = await fetch(`${config.serverUrl}/update_user_caution`, {
                  method: 'POST',
                  headers: {
                    'Content-Type': 'application/json',
                  },
                  body: JSON.stringify({
                    user_pk: selectedUser.user_id // 선택된 사용자의 user_id를 서버로 전송
                  })
                });

                if (!response.ok) {
                  throw new Error('Network response was not ok');
                }

                // 서버에서 데이터 업데이트 완료 후, 클라이언트 측에서 상태 업데이트
                const updatedUserData = [...userData];
                const index = updatedUserData.findIndex(user => user.user_id === selectedUser.user_id);
                if (index !== -1) {
                  updatedUserData[index].caution += 1; // 경고 누적 횟수 1 증가
                  setUserDataState(updatedUserData); // 상태 업데이트
                }

                // 성공 또는 실패 메시지 출력
                const data = await response.json();
                //console.log(data.message);

                // 여기에 필요한 UI 업데이트 등을 처리할 수 있습니다.

              } catch (error) {
                console.error('Failed to update caution:', error);
                // 실패 처리
              }
            }
          }
        ]
      );
    }
  };

  /** 권한 변경 */
  const handleRoleChange = async () => {
    if (!selectedUser || !selectedRole) {
      // 선택된 사용자나 권한이 없는 경우 사용자에게 알림을 보여줄 수 있습니다.
      Alert.alert(
        '경고',
        '권한을 선택해주세요.',
        [
          { text: '확인', onPress: () => { } }
        ],
        { cancelable: false }
      );
      return;
    }

    try {
      const response = await fetch(`${config.serverUrl}/update_user_title`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          user_pk: selectedUser.user_id,
          title: selectedRole
        })
      });

      if (!response.ok) {
        throw new Error('Network response was not ok');
      }

      // 서버에서 데이터 업데이트 완료 후, 클라이언트 측에서 상태 업데이트
      const updatedUserData = [...userData];
      const index = updatedUserData.findIndex(user => user.user_id === selectedUser.user_id);
      if (index !== -1) {
        updatedUserData[index].title = selectedRole;
        setUserDataState(updatedUserData);
      }

      const data = await response.json();
      //console.log(data.message); // 성공 또는 실패 메시지 출력

      // 알림창 표시
      Alert.alert(
        '완료',
        '권한이 성공적으로 변경되었습니다.',
        [
          { text: '확인', onPress: () => closeRoleModal() }
        ],
        { cancelable: false }
      );

      // 여기에 필요한 UI 업데이트 등을 처리할 수 있습니다.

    } catch (error) {
      console.error('Failed to update user title:', error);
    }
  };


  /** 권한 변경 모달 열기 */
  const openRoleModal = () => {
    setRoleModalVisible(true);
  };

  /** 포인트 수정 모달 열기 */ 
  const openPointsModal = () => {
    setPointsModalVisible(true);
  };

  /** 권한 변경 기능 */
  const handleChangeRole = () => {
    if (selectedUser) {
      openRoleModal();
    }
  };

  /** 포인트 수정 기능 */
  const handleModifyPoints = () => {
    if (selectedUser) {
      openPointsModal();
    }
  };

  /** 권한 변경 모달 닫기 */
  const closeRoleModal = () => {
    setRoleModalVisible(false);
  };

  /** 포인트 수정 모달 닫기 */
  const closePointsModal = () => {
    setPointsModalVisible(false);
  };

  /** 선택된 권한 업데이트 */
  const handleRoleSelect = (role: string) => {
    setSelectedRole(role);
  };

  /** 선택된 유저 포인트 변경 */
  const handlePointsChange = (text: string) => {
    const points = parseInt(text, 10); // 문자열을 숫자로 변환
    if (!isNaN(points)) {
      setNewPoints(points); // 숫자가 유효하면 newPoints 상태 업데이트
    } else {
      setNewPoints(undefined); // 유효하지 않은 경우 newPoints 초기화
    }
  };

  const pointCalculator = (before : number, after : any) => {
    if(before > after) {
      return 0
    }else if(before < after) {
      return 1
    }
  }

  const AddAdminPointHistory = async () => {
    const status = pointCalculator(selectedUser.point, newPoints);
    if(newPoints) {
      const point = Math.abs(selectedUser.point - newPoints);
      try {
        const response = await fetch(`${config.serverUrl}/AddAdminPointHistory`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            user_id : selectedUser.user_id,
            point : point,
            status : status,
  
          })
        });
      } catch (error) {
      }
    }
  }

  /** 선택된 유저 포인트 변경 서버 업데이트 */
  const handlePointsModify = async () => {
    if (selectedUser && newPoints !== undefined) {
      try {
        const response = await fetch(`${config.serverUrl}/update_user_allpoint`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            user_pk: selectedUser.user_id,
            point: newPoints,
          }),
        });
        await response.json();
        const updatedUserData = userData.map(user =>
          user.user_id === selectedUser.user_id ? { ...user, point: newPoints } : user
        );
        setUserDataState(updatedUserData);

        Alert.alert(
          '완료',
          '포인트가 성공적으로 수정되었습니다.',
          [{ text: '확인', onPress: closePointsModal }],
          { cancelable: false }
        );

      } catch (error) {
        console.error('Failed to update user points:', error);
        Alert.alert('오류', '포인트 업데이트 실패', [{ text: '확인' }]);
      }
    }
  };

  useFocusEffect(
    React.useCallback(() => {
        const fetchData = async () => {
            try {
              await get_department();
              await get_user_Info();
            } catch (error) {
                console.error('Error fetching data:', error);
            }
        };
        fetchData();
    }, [])
);

  return (
    <View style={styles.container}>
      {/* 학과 및 관리자 유형 선택 피커 */}
      <View style={styles.pickerContainer}>
        <Picker
          selectedValue={selectedDepartment}
          style={styles.picker}
          onValueChange={(itemValue) => setSelectedDepartment(itemValue)}
        >
          <Picker.Item label="전체 학과" value="" />
          {departments.map((department, index) => (
            <Picker.Item key={index} label={department} value={department} />
          ))}
        </Picker>
        <Picker
          selectedValue={selectedAdmin}
          style={styles.picker}
          onValueChange={(itemValue) => setSelectedAdmin(itemValue)}
        >
          <Picker.Item label="전체 유저 타입" value="" />
          {admin_check.map((role, index) => (
            role !== '학교' && <Picker.Item key={index} label={role} value={role} />
          ))}
        </Picker>
      </View>

      {/* 사용자 목록 스크롤 뷰 */}
      <ScrollView>
        {filteredUserData.map((user, index) => (
          <View key={index} style={styles.userInfoBox}>
            <View style={styles.imageArea}>
              <Image style={styles.image} source={{ uri: `${config.serverUrl}/${user.profilePhoto}` }} />
            </View>
            <View style={styles.userInfoArea}>
              <View style={styles.userInfo}>
                <Text style={styles.name}>{user.student_name}</Text>
                <Text style={styles.id}>{user.id}</Text>
                <Text style={styles.department}>{user.department_name}</Text>
              </View>
              <View style={styles.userInfo}>
                <Text style={[styles.report, user.report_confirm > 3 && { color: 'red' }]}>
                  경고누적횟수 : {user.caution}회
                </Text>
                <Text style={[styles.admin, { color: getRoleColor(user.title) }]}>
                  {user.title}
                </Text>
                <Text style={styles.point}>{user.point} P</Text>
              </View>
            </View>
            <View style={styles.userSettingArea}>
              {/* 설정 아이콘 버튼 */}
              <TouchableOpacity
                style={styles.userSettingBtn}
                onPress={() => setSettingUser(user)}
              >
                <IconSetting style={styles.userSettingIcon} name='dots-three-vertical' />
              </TouchableOpacity>
            </View>
            {/* 선택된 사용자에 대한 드롭다운 메뉴 */}
            {selectedUser && selectedUser.user_id === user.user_id && (
              <View style={styles.dropdown}>
                <TouchableOpacity style={styles.dropdownItem} onPress={handleReportCheck}>
                  <Text style={styles.dropdownText}>경고주기</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.dropdownItem} onPress={handleChangeRole}>
                  <Text style={styles.dropdownText}>권한 변경</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.dropdownItem} onPress={handleModifyPoints}>
                  <Text style={styles.dropdownText}>포인트 수정</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        ))}
      </ScrollView>

      {/* 권한 변경 모달 */}
      <Modal
        visible={roleModalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={closeRoleModal}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <View style={styles.roleOptionsContainer}>
              <TouchableOpacity
                style={[styles.roleOption, selectedRole === '반장' && styles.selectedRoleOption]}
                onPress={() => handleRoleSelect('반장')}
              >
                <Text style={styles.roleOptionText}>반장</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.roleOption, selectedRole === '학우회장' && styles.selectedRoleOption]}
                onPress={() => handleRoleSelect('학우회장')}
              >
                <Text style={styles.roleOptionText}>학우회장</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.roleOption, selectedRole === '일반학생' && styles.selectedRoleOption]}
                onPress={() => handleRoleSelect('일반학생')}
              >
                <Text style={styles.roleOptionText}>일반학생</Text>
              </TouchableOpacity>
            </View>
            <View style={styles.buttonContainer}>
              <TouchableOpacity style={styles.cancelButton} onPress={closeRoleModal}>
                <Text style={styles.buttonText}>취소</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.confirmButton} onPress={handleRoleChange}>
                <Text style={styles.buttonText}>확인</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>


      {/* 포인트 수정 모달 */}
      <Modal
        visible={pointsModalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={closePointsModal}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>포인트 수정</Text>
            <View style={styles.modalInputContainer}>
              {/* Example input field (adjust as per your application's requirements) */}
              <TextInput
                style={styles.modalInput}
                placeholder={selectedUser?.point.toString()}
                keyboardType="numeric"
                value={newPoints !== undefined ? newPoints.toString() : ''}
                onChangeText={handlePointsChange}
              />
            </View>
            <View style={styles.modalButtonContainer}>
              <TouchableOpacity style={styles.modalButton} onPress={async () => {
                await AddAdminPointHistory();
                await handlePointsModify();
                }}>
                <Text style={styles.modalButtonText}>확인</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.modalButton} onPress={closePointsModal}>
                <Text style={styles.modalButtonText}>취소</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

    </View>
  );
};

const width = Dimensions.get("window").width;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
  },
  pickerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: width * 0.95,
    marginVertical: 10,
  },
  picker: {
    height: 50,
    width: width * 0.45,
    backgroundColor: 'white',
    elevation: 3,
  },
  userInfoBox: {
    backgroundColor: 'white',
    width: width * 0.95,
    height: 127,
    flexDirection: 'row',
    padding: 5,
    marginVertical: 10,
    borderRadius: 10,
    elevation: 5,
    zIndex : 1,
    position: 'relative',
  },
  imageArea: {
    justifyContent: 'center', // 세로 중앙 정렬
    alignItems: 'flex-start',  // 왼쪽 정렬
    marginRight: 5,           // 이미지와 텍스트 사이 간격
  },

  image: {
    backgroundColor: '#666666',
    width: 90,
    height: 90,
    borderRadius: 50,
    borderWidth: 1,
    borderColor: '#999999',
    overflow: 'hidden'
  },
  userInfoArea: {
    flex: 1,
    marginLeft: 10,
    flexDirection: 'row',
  },
  userInfo: {
    flex: 1,
    justifyContent: 'space-around',
  },
  name: {
    color: 'black',
    fontSize: 20,
    fontWeight: 'bold',
  },
  id: {
    color: 'black',
    fontSize: 14,
  },
  department: {
    color: 'black',
    fontSize: 14,
  },
  report: {
    color: 'black',
    fontSize: 16,
    fontWeight: 'bold',
  },
  admin: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  point: {
    color: 'black',
    fontSize: 16,
    fontWeight: 'bold',
  },
  userSettingArea: {
    justifyContent: 'flex-start',
    alignItems: 'center',
    width: 40,
  },
  userSettingBtn: {
    paddingVertical: 10,
  },
  userSettingIcon: {
    color: 'black',
    fontSize: 24,
  },
  dropdown: {
    width: 110,
    position: 'absolute',
    right: 22,
    top: 40,
    backgroundColor: 'white',
    elevation: 5,
    borderRadius: 10,
    paddingHorizontal: 10,
    zIndex : 1000,
  },
  dropdownItem: {
    paddingVertical: 5,
  },
  dropdownText: {
    color: 'black',
    fontSize: 18
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'row',
    backgroundColor: 'rgba(0, 0, 0, 0.5)', // 반투명 검정 배경
  },
  modalContent: {
    backgroundColor: 'white',
    width: '80%',
    borderRadius: 10,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 3,
    },
    shadowOpacity: 0.27,
    shadowRadius: 4.65,
    elevation: 6,
  },
  roleOptionsContainer: {
    marginTop: 20,
  },
  roleOption: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    marginBottom: 10,
    borderRadius: 5,
    borderWidth: 1,
    borderColor: 'transparent',
    alignItems: 'center',
  },
  selectedRoleOption: {
    backgroundColor: '#F0F0F0', // 선택된 항목의 배경색
  },
  roleOptionText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 20,
  },
  cancelButton: {
    backgroundColor: 'gray',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 5,
    marginRight: 10,
  },
  confirmButton: {
    backgroundColor: '#4E93E3',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 5,
  },
  buttonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
    textAlign: 'center',
  },
  modalInputContainer: {
    marginBottom: 20,
    borderBottomWidth: 1,
    borderColor: '#ccc',
  },
  modalInput: {
    fontSize: 16,
    paddingVertical: 10,
    paddingHorizontal: 15,
  },
  modalButtonContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  modalButton: {
    backgroundColor: '#4E93E3',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 5,
    marginLeft: 10,
  },
  modalButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
});

export default UserManagement;
