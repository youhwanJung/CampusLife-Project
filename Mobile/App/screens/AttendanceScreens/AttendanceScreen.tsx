import React, { useState, useEffect } from 'react';
import { Alert, SafeAreaView, View, Text, TouchableOpacity, ScrollView, Dimensions, StyleSheet } from 'react-native';
import ModalBox from 'react-native-modalbox';
import IconA from 'react-native-vector-icons/FontAwesome5';
import { useNavigation } from '@react-navigation/native';
import { UserData, Lecture } from '../../types/type';
import config from '../../config';
import { useCameraPermission } from 'react-native-vision-camera';

type LectureData = {
  weeknum: number,
  classnum: number,
  attendance_Info: string
}

const width = Dimensions.get("window").width;

const AttendanceScreen = ({ navigation, route }: any) => {
  const { userdata, LectureData } = route.params;
  const [userData, setUserData] = useState<UserData>(userdata);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { requestPermission } = useCameraPermission();
  const [isCameraButton, setIsCameraButton] = useState(false);
  const [scannedCode, setScannedCode] = useState<string | null>(null);
  const [lectureList, setLectureList] = useState<Lecture[]>([]);
  const [selectedLecture, setSelectedLecture] = useState<Lecture | null>(null);
  const [lastScannedTime, setLastScannedTime] = useState<null | Date>(null);
  const [isScanned, setIsScanned] = useState(false);
  const [lastScannedWeek, setLastScannedWeek] = useState<number>(0);
  const [lectureInfo, setLectureInfo] = useState<LectureData[]>([]);

  const filterLectures = (lectures: Lecture[]) => {
    return lectures.map(lecture => ({
      ...lecture,
      today_lecture_state: true
    })).filter(
      (lecture) =>
        lecture.lecture_grade === userData.grade &&
        lecture.lecture_semester === userData.student_semester
    );
  };

  const getCurrentDate = () => {
    const days = ['일', '월', '화', '수', '목', '금', '토'];
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth() + 1;
    const date = now.getDate();
    const day = days[now.getDay()];

    return `${year}년 ${month}월 ${date}일 ${day}요일`;
  };

  const getCurrentDay = () => {
    const days = ['일요일', '월요일', '화요일', '수요일', '목요일', '금요일', '토요일'];
    const now = new Date();
    return days[now.getDay()];
  };

  const nowday = getCurrentDay();

  const formatTimeRange = (lectureTime: string) => {
    return lectureTime.split(' ~ ');
  };

  const generateTimeRanges = (lectureTime: string) => {
    const [start, end] = formatTimeRange(lectureTime);
    const timeRanges = [];

    let [currentHour, currentMinute] = start.split(':').map(Number);
    const [endHour, endMinute] = end.split(':').map(Number);

    while (!(currentHour === endHour && currentMinute === endMinute)) {
      if (currentMinute % 10 !== 0) {
        currentMinute = Math.ceil(currentMinute / 10) * 10;
      }

      const startHourStr = currentHour < 10 ? `0${currentHour}` : `${currentHour}`;
      const startMinuteStr = currentMinute < 10 ? `0${currentMinute}` : `${currentMinute}`;

      let nextHour = currentHour;
      let nextMinute = currentMinute + 50;

      if (nextMinute >= 60) {
        nextHour++;
        nextMinute -= 60;
      }

      if (nextHour > endHour || (nextHour === endHour && nextMinute > endMinute)) {
        break;
      }

      const nextHourStr = nextHour < 10 ? `0${nextHour}` : `${nextHour}`;
      const nextMinuteStr = nextMinute < 10 ? `0${nextMinute}` : `${nextMinute}`;

      const nextTime = `${startHourStr}:${startMinuteStr} ~ ${nextHourStr}:${nextMinuteStr}`;
      timeRanges.push(nextTime);

      currentHour = nextHour;
      currentMinute = nextMinute;

      currentMinute += 10;
      if (currentMinute >= 60) {
        currentHour++;
        currentMinute -= 60;
      }
    }

    return [...timeRanges];
  };

  const updateAttendanceStatus = async (lecture: Lecture) => {
    const periods = generateTimeRanges(lecture.lecture_time).length;
    const updatedLectureList = lectureList.map((lec) => {
      if (lec.lecture_name === lecture.lecture_name) {
        return {
          ...lec,
          nonattendance: lec.nonattendance - periods,
          attendance: lec.attendance + periods,
        };
      }
      return lec;
    });
    setLectureList(updatedLectureList);
    await Updatelecture(updatedLectureList);
  };

  const AttendanceCheck = async () => {
    try {
      const response = await fetch(`${config.serverUrl}/AttendanceCheck`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          user_id: userData.user_pk,
          event_point: 10,
        }),
      });
      const data = await response.json();
    } catch (error) {
      console.error(error);
    } finally {
    }
  };

  const Updatelecture = async (lecture: Lecture[]) => {
    try {
      const promises = lecture.map(async (lec) => {
        const response = await fetch(`${config.serverUrl}/updatelecture`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            student_id: userData.student_pk,
            lecture_id: lec.lecture_id,
            nonattendance: lec.nonattendance,
            attendance: lec.attendance,
            tardy: lec.tardy,
            absent: lec.absent,
          }),
        });
        const data = await response.json();
      });

      await Promise.all(promises);
    } catch (error) {
      console.log('출석 정보 업데이트 실패:', error);
    }
  };

  const insert_lecture_Info = async (weeknum: number, classnum: number, attendance_Info: string) => {
    try {
      const response = await fetch(`${config.serverUrl}/addLectureInfo`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          student_id: userData.student_pk,
          lecture_id: selectedLecture?.lecture_id,
          weeknum: weeknum,
          classnum: classnum,
          attendance_Info: attendance_Info
        })
      });
      const value = await response.json();
    } catch (error) {
      console.error('과목 정보 예약 실패!', error);
    }
  };

  const get_lecture_Info = async () => {
    try {
      const response = await fetch(`${config.serverUrl}/GetLectureInfo`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          student_id: userData.student_pk,
          lecture_id: selectedLecture?.lecture_id,
        }),
      });
      const data = await response.json();
      setLectureInfo(data);
      return data;  // 추가된 부분: 불러온 데이터를 반환
    } catch (error) {
      console.error('과목 정보 가져오기 실패:', error);
      return [];
    }
  };

  const openModal = (lecture: Lecture) => {
    setSelectedLecture(lecture);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setIsCameraButton(false);
  };

  const openCamera = (lecture: Lecture) => {
    if (lecture.isScanned) {
      Alert.alert(
        '출석 처리됨',
        '이미 출석 처리가 완료되었습니다. 하루에 한 번만 출석할 수 있습니다.',
        [{ text: '확인' }]
      );
    } else {
      navigation.navigate('FullScreenCamera', { selectedLecture: lecture });
      closeModal();
      setIsScanned(false);
      lecture.today_lecture_state = false;

      // 해당 과목의 출석 상태를 '이미 출석 완료'로 표시
      setLectureList(prevList =>
        prevList.map(lec =>
          lec.lecture_name === lecture.lecture_name ? { ...lec, isScanned: true } : lec
        )
      );
    }
  };

  const determineBoxColor = (weekIndex: number, classIndex: number) => {
    const matchingData = lectureInfo.find(
      data => data.weeknum === weekIndex + 1 && data.classnum === classIndex + 1
    );

    if (matchingData) {
      switch (matchingData.attendance_Info) {
        case "출결":
          return "#4CAF50"; // 출결
        case "미출결":
          return "#909090"; // 미출결
        case "지각":
          return "#FF9100"; // 지각
        case "결석":
          return "#C7253E"; // 결석
        default:
          return "#909090"; // 기본값은 미출결 색상
      }
    }

    return "#909090"; // 매칭되는 데이터가 없을 경우 기본 색상
  };

  React.useEffect(() => {
    requestPermission();
  }, []);

  /*React.useEffect(() => {
    if (isCameraButton) {
      navigation.navigate('FullScreenCamera');
      closeModal();
    }
  }, [isCameraButton]);*/

  useEffect(() => {
    setScannedCode(route.params?.scannedCode);
  }, [route.params?.scannedCode]);

  // Load lecture information to set the correct lastScannedWeek
  useEffect(() => {
    const loadLectureInfo = async () => {
      if (selectedLecture) {
        const currentWeekData = await get_lecture_Info(); // 서버에서 현재 출석 정보를 가져옴
        if (currentWeekData && currentWeekData.length > 0) {
          const lastRecordedWeek = Math.max(...currentWeekData.map((info: { weeknum: any; }) => info.weeknum)); // 가장 최근 주차를 찾음
          setLastScannedWeek(lastRecordedWeek);
        } else {
          setLastScannedWeek(1); // 출석 정보가 없으면 1주차로 설정
        }
      }
    };

    loadLectureInfo();
  }, [selectedLecture]);

  useEffect(() => {
    const filteredLectures = filterLectures(LectureData);
    setLectureList(filteredLectures);

    if (scannedCode && selectedLecture) {
      setLastScannedTime(new Date());
      setIsScanned(true);

      Alert.alert(
        '출석 확인',
        '출석 확인 되었습니다!',
        [{
          text: '확인',
          onPress: async () => {
            const currentWeekData = await get_lecture_Info();
            const lastRecordedWeek = currentWeekData.length > 0 ? Math.max(...currentWeekData.map((info: { weeknum: any; }) => info.weeknum)) : 0;
            const nextWeek = lastRecordedWeek + 1; // 다음 주차를 계산

            if (nextWeek <= selectedLecture.lecture_have_week) { // 다음 주차가 최대 주차보다 적으면 출석 기록
              generateTimeRanges(selectedLecture.lecture_time).forEach(async (_, classIndex) => {
                await insert_lecture_Info(nextWeek, classIndex + 1, "출결");
              });

              setLastScannedWeek(nextWeek); // 마지막 주차 업데이트
            }

            await updateAttendanceStatus(selectedLecture);
            await AttendanceCheck();
          }
        }],
        { cancelable: false }
      );
    }
  }, [scannedCode, LectureData]);

  useEffect(() => {
    const fetchDataAsync = async () => {
      try {
        if (isModalOpen && selectedLecture) {
          setLastScannedWeek(0);
          await get_lecture_Info();
        }
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };
    fetchDataAsync();
  }, [isModalOpen, selectedLecture]);

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
        <View style={styles.container}>
          <View style={styles.textContainer}>
            <Text style={styles.title}>오늘의 출석</Text>
            <Text style={styles.date}>{getCurrentDate()}</Text>
          </View>

          {lectureList.map((Lecture, index) => (
            Lecture.week === nowday && (
              <View key={index} style={styles.buttonContainer}>
                <TouchableOpacity style={styles.AttendanceList} onPress={() => openModal(Lecture)}>
                  <Text style={styles.ListText}>{Lecture.lecture_name}</Text>
                  <View style={styles.ListArea}>
                    <Text style={styles.ListInfo}>{Lecture.professor_name} | {Lecture.lecture_room}</Text>
                    <Text style={styles.ListInfoSec}>미출결: {Lecture.nonattendance} 출결: {Lecture.attendance} 지각: {Lecture.tardy} 결석: {Lecture.absent}</Text>
                  </View>
                </TouchableOpacity>
              </View>
            )
          ))}

          <View style={styles.textContainer2}>
            <Text style={styles.title2}>출석 현황</Text>
          </View>
          {lectureList.map((Lecture, index) => (
            Lecture.week !== nowday && (
              <View key={index} style={styles.buttonContainer2}>
                <TouchableOpacity style={styles.AttendanceList} onPress={() => openModal(Lecture)}>
                  <Text style={styles.ListText}>{Lecture.lecture_name}</Text>
                  <View style={styles.ListArea}>
                    <Text style={styles.ListInfo}>{Lecture.professor_name} | {Lecture.lecture_room}</Text>
                    <Text style={styles.ListInfo}>미출결: {Lecture.nonattendance} 출결: {Lecture.attendance} 지각: {Lecture.tardy} 결석: {Lecture.absent}</Text>
                  </View>
                </TouchableOpacity>
              </View>
            )
          ))}
          <View style={{ height: 100 }}></View>
        </View>
      </ScrollView>
      <ModalBox
        isOpen={isModalOpen && selectedLecture !== null}
        style={styles.modal}
        position="bottom"
        swipeToClose={false}
        onClosed={closeModal}
      >
        {selectedLecture && (
          <View style={styles.modalContainer}>
            <View style={styles.header}>
              <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', flex: 0.5 }}>
                <View>
                  <Text style={styles.ListText2}>{selectedLecture?.lecture_name}</Text>
                </View>
                <View style={styles.Icon}>
                  <TouchableOpacity onPress={() => openCamera(selectedLecture)}
                    disabled={nowday !== selectedLecture?.week}>
                    <IconA name="camera" size={32} color={nowday === selectedLecture?.week && !selectedLecture?.isScanned ? "black" : "gray"} />
                  </TouchableOpacity>
                </View>
              </View>
              <View>
                <View>
                  <Text style={styles.ListInfo2}>미출결: {selectedLecture?.nonattendance}  출결: {selectedLecture?.attendance}  지각: {selectedLecture?.tardy}  결석: {selectedLecture?.absent}</Text>
                </View>
              </View>
            </View>
            <View style={styles.WeekContainer}>
              <ScrollView>
                {[...Array(selectedLecture.lecture_have_week)].map((_, weekIndex) => (
                  <View key={weekIndex}>
                    <View style={styles.Week}>
                      <Text style={{ fontSize: 20, marginTop: 5, fontWeight: 'bold', color: 'black' }}>{weekIndex + 1}주차</Text>
                    </View>
                    <View style={styles.View}>
                      {generateTimeRanges(selectedLecture.lecture_time).map((timeRange, classIndex) => (
                        <View key={classIndex} style={styles.Include}>
                          <View style={styles.Attendance}>
                            <Text style={styles.timeText}>{classIndex + 1}차시 {timeRange}</Text>
                          </View>
                          <View style={styles.Box}>
                            <View style={[styles.realBox, { backgroundColor: determineBoxColor(weekIndex, classIndex) }]}>
                            </View>
                          </View>
                        </View>
                      ))}
                    </View>
                  </View>
                ))}
              </ScrollView>
            </View>
          </View>
        )}
        <View style={{ height: 100 }}></View>
      </ModalBox>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { // 컨테이너 전체를 담당
    flexGrow: 1,
    backgroundColor: 'white',
    alignContent: 'center',
  },
  textContainer: { // 오늘의 출석, 날짜 텍스트 컨테이너
    alignSelf: 'center',
    justifyContent: 'center',
    width: width * 0.9,
    paddingHorizontal: 5,
    marginVertical: 30,
  },
  textContainer2: { // 출석 현황 텍스트 컨테이너
    alignSelf: 'center',
    justifyContent: 'center',
    width: width * 0.9,
    paddingHorizontal: 5,
    marginVertical: 15,
  },
  title: { // 오늘의 출석 텍스트 css
    fontSize: 25,
    fontWeight: 'bold',
    marginBottom: 10,
    color: 'black',
  },
  title2: { // 출석 현황 텍스트 css
    fontSize: 25,
    fontWeight: 'bold',
    color: 'black',
  },
  date: { // 날짜 텍스트 css
    fontWeight: 'bold',
    fontSize: 20,
    color: 'gray'
  },
  buttonContainer: { // 오늘의 출석 버튼 컨테이너
    alignSelf: 'center',
    justifyContent: 'flex-start',
    width: width * 0.9
  },
  buttonContainer2: { // 출석 현황 버튼 컨테이너
    alignSelf: 'center',
    marginTop: 5,
    justifyContent: 'flex-start',
    width: width * 0.9
  },
  AttendanceList: { // 과목마다의 버튼 
    borderBottomWidth: 2,
    marginBottom: 8,
    borderColor: 'black',
    width: '100%',
    padding: 5
  },
  ListText: { // 과목명 텍스트
    fontSize: 20,
    color: 'black',
    fontWeight: 'bold',
  },
  ListText2: { // 버튼 누른 후 과목명 텍스트
    fontSize: 25,
    marginLeft: 25,
    color: 'black',
    fontWeight: 'bold'
  },
  ListArea: {
    flexDirection: 'row',
    justifyContent: 'space-between'
  },
  ListInfo: { // 과목마다의 출석 텍스트
    fontSize: 15,
    color: 'black'
  },
  ListInfoSec: {
    fontSize: 15,
    color: 'black'
  },
  ListInfo2: { // 버튼 누른 후 과목마다의 출석 텍스트
    fontSize: 15,
    marginLeft: 25,
    marginTop: 5,
    color: 'black'
  },
  modal: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    height: 600,
    backgroundColor: 'white', // 모달 배경색
    shadowColor: '#000', // 그림자 색상
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  modalContainer: {
    flex: 1,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    //backgroundColor : 'black',
  },
  header: {
    flex: 0.2,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    borderBottomWidth: 2,
    justifyContent: 'center',
    alignContent: 'center',
  },
  Week: {
    flex: 0.09,
    fontSize: 20,
    fontWeight: 'bold',
    color: 'black',
    backgroundColor: '#FCC3A2', // 헤더 배경색
    borderBottomWidth: 2,
    height: 45,
    paddingLeft: 25,
  },
  WeekContainer: {
    flex: 0.8,
  },
  View: {
    flex: 0.91,
  },
  Attendance: {
    flex: 0.9,
    fontSize: 17,
    fontWeight: 'bold',
    color: 'black',
    justifyContent: "center",
  },
  Box: {
    flex: 0.1,
    paddingRight: 12,
    justifyContent: "center",
    alignItems: "center",
  },
  Include: {
    flexDirection: 'row',
    borderBottomWidth: 2,
    flex: 0.13,
    backgroundColor: 'white', // 각 시간표 항목 배경색
  },
  Include2: {
    flexDirection: 'row',

  },
  realBox: {
    width: 25,
    height: 25,
    backgroundColor: '#909090',
    margin: 10,
    borderColor: 'black',
    borderWidth: 1,
  },
  timeText: {
    fontSize: 17,
    fontWeight: 'bold',
    color: 'black',
    marginLeft: 28,
    marginBottom: 5,
  },
  Icon: {
    marginRight: 20,
  }
});

export default AttendanceScreen;