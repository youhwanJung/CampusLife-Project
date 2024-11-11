import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './Test.module.css';
import { BiQrScan } from "react-icons/bi";
import { FaSearch } from "react-icons/fa";
import { useLocation } from 'react-router-dom';
import config from './config'
import Modal from 'react-modal';
import Select from 'react-select';

Modal.setAppElement('#root'); // 접근성을 위해 필요합니다.

const options = [
    { value: 'all', label: '전체' },
    { value: 'attendance', label: '출결' },
    { value: 'absent', label: '결석' },
    { value: 'late', label: '지각' }
];

function Test() {
    const navigate = useNavigate();
    const location = useLocation();
    const { selectLecture, ProfessorInfo } = location.state || {};
    const [selected, setSelected] = useState({ weekIndex: 0, classIndex: 0 }); //주차와 교시(차시)를 선택할때 사용하는 데이터
    const [totalStudentNum, setTotalStudentNum] = useState();
    const [studentAttendanceStates, setStudentAttendanceStates] = useState([]); //주차와 교시(차시)를 선택하여 학생들의 데이터를 가져옴
    const [totalStudentInfo, setTotalStudentInfo] = useState([]);
    const [StudentAttendanceInfo, setStudentAttendanceInfo] = useState([]);
    const [isOpen, setIsOpen] = useState(false);
    const [selectedOption, setSelectedOption] = useState(options[0]); //리스트 박스 값 저장
    const [inputValue, setInputValue] = useState(''); //학생 이름 찾는 Text
    const [filteredStudents, setFilteredStudents] = useState(''); // 필터링된 학생 상태
    const [selectedStudent, setSelectedStudent] = useState(null); //선택한 학생 id

    const openModal = () => setIsOpen(true);
    const closeModal = () => setIsOpen(false);

    // 리스트 박스 핸들러
    const handleChange = (option) => {
        setSelectedOption(option);
        //console.log("Selected option:", option);
    }

    // 학생 이름 찾을 때 사용되는 함수
    const handleInputChange = (event) => {
        const value = event.target.value;
        setInputValue(value);

        if (value === '') {
            setFilteredStudents([]);
            return;
        }

        const filtered = studentAttendanceStates.filter((student) =>
            student.student_name.includes(value)
        );
        let filteredStates = filtered;
        //console.log(filtered);

        if (selectedOption.value === 'attendance') {
            filteredStates = filtered.filter(
                (student) => student.attendance_Info === '출결'
            );
        } else if (selectedOption.value === 'absent') {
            filteredStates = filtered.filter(
                (student) => student.attendance_Info === '결석'
            );
        } else if (selectedOption.value === 'late') {
            filteredStates = filtered.filter(
                (student) => student.attendance_Info === '지각'
            );
        }
        setFilteredStudents(filteredStates);
    };

    useEffect(() => {
        const fetchData = async () => {
            try {
                await GetTotalStudentNum();
                await GetWeekClassStudentAttendanceStates(1, 1);
                await GetTotalStudentInfo();

            } catch (error) {
                console.error(error);
            }
        };
        fetchData();
    }, [selectedOption]);



    //주차 차시 색 변경 함수
    const handleButtonClick = (weekIndex, classIndex) => {
        setSelected({ weekIndex, classIndex });
        GetWeekClassStudentAttendanceStates(weekIndex + 1, classIndex + 1);
    };

    //해당과목 날짜 변환기
    const formatDateWithOffset = (dateString, offsetDays) => {
        //console.log(dateString);
        const date = new Date(dateString);
        date.setDate(date.getDate() + offsetDays);
        const month = (date.getMonth() + 1).toString().padStart(2, '0');
        const day = date.getDate().toString().padStart(2, '0');

        return `${month}월 ${day}일`;
    };
    //해당과목 시간 변환기
    function splitTimeSlots(timeRange) {
        const [startTime, endTime] = timeRange.replace(/\s/g, '').split('~');
        const [startHour, startMinute] = startTime.split(':').map(Number);
        const [endHour] = endTime.split(':').map(Number);
        const timeSlots = [];

        let currentHour = startHour;
        let currentMinute = startMinute;

        while (currentHour < endHour) {
            const nextHour = currentHour + 1;
            const nextMinute = 0;

            timeSlots.push(`${String(currentHour).padStart(2, '0')}: ${String(currentMinute).padStart(2, '0')} ~ ${String(nextHour).padStart(2, '0')}: ${String(nextMinute).padStart(2, '0')}`);

            currentHour++;
        }

        return timeSlots;
    }

    // 테스트
    const input = "14 : 10 ~ 17 : 00";
    const result = splitTimeSlots(input);
    //console.log(result);


    //QR 코드 화면으로 이동하기
    const handleNavigateToQrCheck = (weeknum) => {
        navigate('/qrcheck', { state: { selectLecture, weeknum, ProfessorInfo } });
    };

    //해당 과목을 듣는 전체 총 학생 수 가져오기
    const GetTotalStudentNum = async () => {
        try {
            const response = await fetch(`${config.serverUrl}/GetTotalStudentNum`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    lecture_id: selectLecture.lecture_id
                })
            })
            const TotalStudentNum = await response.json();
            setTotalStudentNum(TotalStudentNum.TotalstudentNum);
        } catch (error) {
            console.error(error);
        }
    }

    const GetStudentAttendanceInfo = async () => {
        try {
            const response = await fetch(`${config.serverUrl}/GetAttendanceStudent`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    student_id: selectedStudent.student_id,
                    lecture_id: selectLecture.lecture_id
                })
            })
            const StudentAttendanceInfo = await response.json();
            setStudentAttendanceInfo(StudentAttendanceInfo[0]);
        } catch (error) {
            console.error(error);
        }
    }


    //해당 과목을 듣는 전체 총 학생 정보 가져오기
    const GetTotalStudentInfo = async () => {
        try {
            const response = await fetch(`${config.serverUrl}/GetTotalStudentInfo`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    lecture_id: selectLecture.lecture_id
                })
            })
            const TotalStudentInfo = await response.json();
            setTotalStudentInfo(TotalStudentInfo);
        } catch (error) {
            console.error(error);
        }
    }

    //주차와 차시를 통한 학생들 출결 상태 가져오기
    const GetWeekClassStudentAttendanceStates = async (weeknum, classnum) => {
        try {
            const response = await fetch(`${config.serverUrl}/GetWeekClassStudentAttendanceStates`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    lecture_id: selectLecture.lecture_id,
                    weeknum: weeknum,
                    classnum: classnum
                })
            })
            const StudentAttendanceStates = await response.json();
            let filteredStates = StudentAttendanceStates;
            //console.log(filteredStates);

            if (selectedOption.value === 'attendance') {
                filteredStates = StudentAttendanceStates.filter(
                    (student) => student.attendance_Info === '출결'
                );
            } else if (selectedOption.value === 'absent') {
                filteredStates = StudentAttendanceStates.filter(
                    (student) => student.attendance_Info === '결석'
                );
            } else if (selectedOption.value === 'late') {
                filteredStates = StudentAttendanceStates.filter(
                    (student) => student.attendance_Info === '지각'
                );
            }

            setStudentAttendanceStates(filteredStates);
            setFilteredStudents(filteredStates);
        } catch (error) {
            console.error(error);
        }
    }

    //학생의 출결정보 변경 처리 함수
    const ChangeStudentState = async (weeknum, classnum, student_id, newState) => {
        let student_info = ''; // 새로운 상태 설정
    
        // 기존 상태에 따라 새로운 상태 설정 및 StudentAttendanceInfo 값 증감 처리
        let updatedAttendanceInfo = { ...StudentAttendanceInfo };
    
        if (selectedStudent.attendance_Info === '출결') {
            if (newState === 1){
                student_info = '출결';
            } else if (newState === 2) { // 결석으로 변경
                updatedAttendanceInfo.attendance -= 1;
                updatedAttendanceInfo.absent += 1;
                student_info = '결석';
            } else if (newState === 3) { // 지각으로 변경
                updatedAttendanceInfo.attendance -= 1;
                updatedAttendanceInfo.tardy += 1;
                student_info = '지각';
            }
        } else if (selectedStudent.attendance_Info === '지각') {
            if (newState === 1) { // 출결로 변경
                updatedAttendanceInfo.tardy -= 1;
                updatedAttendanceInfo.attendance += 1;
                student_info = '출결';
            } else if (newState === 2) { // 결석으로 변경
                updatedAttendanceInfo.tardy -= 1;
                updatedAttendanceInfo.absent += 1;
                student_info = '결석';
            } else if (newState === 3){
                student_info = '지각';
            }
        } else if (selectedStudent.attendance_Info === '결석') {
            if (newState === 1) { // 출결로 변경
                updatedAttendanceInfo.absent -= 1;
                updatedAttendanceInfo.attendance += 1;
                student_info = '출결';
            } else if (newState === 2){
                student_info = '결석';
            } else if (newState === 3) { // 지각으로 변경
                updatedAttendanceInfo.absent -= 1;
                updatedAttendanceInfo.tardy += 1;
                student_info = '지각';
            }
        }
    
        try {
            // 1. ChangeStudentState API 호출 (해당 주차, 차시의 출석 정보 업데이트)
            const stateResponse = await fetch(`${config.serverUrl}/ChangeStudentState`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    student_id: student_id,
                    lecture_id: selectLecture.lecture_id,
                    weeknum: weeknum,
                    classnum: classnum,
                    student_info: student_info
                })
            });
    
            if (!stateResponse.ok) {
                throw new Error('ChangeStudentState API 호출 실패');
            }
    
            // 2. ChangeStudentInfo API 호출 (StudentAttendanceInfo 값 업데이트)
            const infoResponse = await fetch(`${config.serverUrl}/ChangeStudentInfo`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    student_id: student_id,
                    lecture_id: selectLecture.lecture_id,
                    nonattendance : updatedAttendanceInfo.nonattendance,
                    attendance: updatedAttendanceInfo.attendance,
                    tardy: updatedAttendanceInfo.tardy,
                    absent: updatedAttendanceInfo.absent
                })
            });
            if (!infoResponse.ok) {
                throw new Error('ChangeStudentInfo API 호출 실패');
            }
    
            // 3. 로컬에서 StudentAttendanceInfo 업데이트
            setStudentAttendanceInfo(updatedAttendanceInfo);
    
            console.log("출석 상태와 카운트 업데이트 성공");
            await GetWeekClassStudentAttendanceStates(weeknum, classnum); // 상태 업데이트 후 데이터 다시 불러오기
    
        } catch (error) {
            console.error("출석 상태 또는 카운트 업데이트 중 오류:", error);
        }
    };

    const weeksData = Array.from({ length: selectLecture.lecture_have_week }, (_, i) => {
        const Tiemslosts = splitTimeSlots(selectLecture.lecture_time);
    
        // 8월 28일이 첫 주차가 되도록 시작 날짜를 조정
        const firstWeekDate = new Date("2023-11-05"); // 1주차 기준 날짜를 8월 28일로 설정
        const lecture_start_date = formatDateWithOffset(firstWeekDate, i * 7); // 매주 7일씩 증가
    
        let attendanceCount = 0;
        let lateCount = 0;
        let absentCount = 0;
    
        studentAttendanceStates.forEach(student => {
            if (student.weeknum === i + 1) { // 현재 주차에 맞는 학생들만 처리
                if (student.attendance_Info === '출결') {
                    attendanceCount++;
                } else if (student.attendance_Info === '지각') {
                    lateCount++;
                } else if (student.attendance_Info === '결석') {
                    absentCount++;
                }
            }
        });
    
        return {
            week: `${i + 1}주차 (${lecture_start_date})`,
            attendance: `출석: ${attendanceCount} 지각: ${lateCount} 결석: ${absentCount}`,
            classStatus: '강의상태: 미출결',
            classTimes: [
                `1교시 ${lecture_start_date} ${Tiemslosts[0]}`,
                `2교시 ${lecture_start_date} ${Tiemslosts[1]}`,
                `3교시 ${lecture_start_date} ${Tiemslosts[2]}`
            ]
        };
    });
    

    useEffect(() => {
        if (selectedStudent) {
            GetStudentAttendanceInfo();
        }
    }, [selectedStudent]);
    

    return (
        <div className={styles.container}>
            <div className={styles.head}>
                <div className={styles.side}></div>
                <div className={styles.headText}>
                    <div className={styles.headTextArea}>
                        <p className={styles.lectureName}>강의명 : {selectLecture.lecture_name}
                            {selectLecture.lecture_room === "온라인수업" ? ' (온라인 수업)' : ' (대면, 주간)'}
                        </p>
                        <p className={styles.lectureInfo}>강의 수강자 : {selectLecture.lecture_grade}학년 [{selectLecture.section_class}]</p>
                        <p className={styles.lectureInfo}>강의실 : {selectLecture.lecture_room}</p>
                    </div>
                </div>
                <div className={styles.side}></div>
            </div>
            <div className={styles.body}>
                <div className={styles.side}></div>
                <div className={styles.content}>
                    <div className={styles.class}>
                        {weeksData.map((week, weekIndex) => (
                            <div key={weekIndex} className={styles.classBox}>
                                <div className={styles.week}>
                                    <div className={styles.weekBox}>
                                        <p className={styles.weekText}>{week.week}</p>
                                        <p className={styles.attendace}>{week.attendance}</p>
                                    </div>
                                    <div className={styles.classStudent}>
                                        <p className={styles.studentNum}>총 수강학생: {totalStudentNum}</p>
                                    </div>
                                    <BiQrScan onClick={() => handleNavigateToQrCheck(weekIndex + 1)} size={80} className={styles.qr} />
                                </div>
                                {week.classTimes.map((classTime, classIndex) => (
                                    <div
                                        key={classIndex}
                                        className={`${styles.detailClassBox} ${selected.weekIndex === weekIndex && selected.classIndex === classIndex ? styles.selected : ''}`}
                                        onClick={() => {
                                        
                                            handleButtonClick(weekIndex, classIndex);
                                        }}
                                        role="button"
                                        tabIndex={0}
                                    >
                                        <div className={styles.detailClassText}>
                                            <p className={styles.classNum}>{classTime.split(' ')[0]}</p>
                                            <p className={styles.classTime}>{classTime}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ))}
                    </div>
                    <div className={styles.student}>
                        <div className={styles.attendaceFind}>
                            <p className={styles.attendaceFindText}>출석자현황</p>
                            <input
                                type="text"
                                value={inputValue}
                                onChange={handleInputChange}
                                placeholder="찾으시는 학생 이름을 입력해주세요"
                                style={{ width: '400px' }}
                            />

                            <FaSearch size={50} className={styles.search} />
                        </div>
                        <Select
                            value={selectedOption}
                            onChange={handleChange}
                            options={options}
                        />
                        {(filteredStudents.length
                            ? filteredStudents
                            : (studentAttendanceStates.length > 0
                                ? studentAttendanceStates
                                : (inputValue === ''
                                    ? totalStudentInfo
                                    : []))
                        ).map((student, index) => (
                            <div key={index} className={styles.studentInfoBox}>
                                <div className={styles.studentInfo}>
                                    <div className={styles.studentText}>
                                        <p className={styles.studentInfoText}>({student.student_id}) {student.student_name}</p>
                                        <p className={styles.studentDepartment}>{student.department_name}</p>
                                    </div>
                                    {studentAttendanceStates.length > 0 && (
                                        <div className={styles.chagneAttendaceBox}>
                                            <button
                                                className={styles.changeAttendaceButton}
                                                onClick={() => {
                                                    setSelectedStudent(student);  // 여기서는 selectedStudent를 설정
                                                    openModal();  // 모달을 연다
                                                }}>
                                                <p className={styles.changeAttendaceButtonText}>출석자 정보변경</p>
                                            </button>
                                            <Modal
                                                isOpen={isOpen}
                                                onRequestClose={closeModal}
                                                contentLabel="Example Modal"
                                                style={{
                                                    overlay: {
                                                        backgroundColor: 'rgba(0, 0, 0, 0.5)',  // 모달 배경 반투명 처리
                                                        zIndex: 1000,  // 다른 요소보다 위에 있도록 설정
                                                    },
                                                    content: {
                                                        top: '50%',
                                                        left: '50%',
                                                        right: 'auto',
                                                        bottom: 'auto',
                                                        marginRight: '-50%',
                                                        transform: 'translate(-50%, -50%)',
                                                        width: '220px',
                                                        height: '260px',
                                                        borderRadius: '10px',
                                                        padding: '10px',
                                                    },
                                                }}
                                            >
                                                <div className={styles.modalheaderBox}>
                                                    <p className={styles.modalheaderText}>출석정보변경</p>
                                                    <button className={styles.ModalCancleButton} onClick={closeModal}>닫기</button>
                                                </div>
                                                <div className={styles.modalbuttonBox}>
                                                    <button className={styles.ModalButton} onClick={async () => {
                                                        await ChangeStudentState(student.weeknum, student.classnum, selectedStudent.student_id, 1);
                                                        //console.log(student.student_id);
                                                        closeModal();
                                                    }
                                                    }>출결 처리</button>
                                                </div>
                                                <div className={styles.modalbuttonBox}>
                                                    <button className={styles.ModalButton} onClick={async () => {
                                                        await ChangeStudentState(student.weeknum, student.classnum, selectedStudent.student_id, 2);
                                                        closeModal();
                                                    }
                                                    }>결석 처리</button>
                                                </div>
                                                <div className={styles.modalbuttonBox}>
                                                    <button className={styles.ModalButton} onClick={async () => {
                                                        await ChangeStudentState(student.weeknum, student.classnum, selectedStudent.student_id, 3);
                                                        closeModal();
                                                    }
                                                    }>지각 처리</button>
                                                </div>
                                            </Modal>
                                        </div>
                                    )}
                                    <div className={styles.attendaceBox}>
                                        <div className={`${styles.attendaceCheckBox} 
                                                         ${student.attendance_Info === '출결' ? styles.present :
                                                student.attendance_Info === '결석' ? styles.absent :
                                                    student.attendance_Info === '지각' ? styles.late : ''}`}>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
                <div className={styles.side}></div>
            </div>
        </div>
    );
}

export default Test;