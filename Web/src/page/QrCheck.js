import React, { useState, useEffect } from 'react';
import QRCode from 'react-qr-code';
import styles from './QrCheck.module.css';
import { useLocation } from 'react-router-dom';
import { useNavigate } from 'react-router-dom';
import config from './config';

function QrCheck() {
  const [qrData, setQrData] = useState("");
  const navigate = useNavigate();
  const [remainingTime, setRemainingTime] = useState(1); // QR code validity time (seconds)
  const qrTime = 1; // QR code regeneration interval (seconds)
  const location = useLocation();
  const { selectLecture, weeknum, ProfessorInfo } = location.state || {};

  useEffect(() => {
    const generateQRDataWithTimestamp = () => {
      const prefix = "CampusLife_" + selectLecture.lecture_name + "_";
      const now = new Date();
      const timestamp = `${now.getFullYear()}-${(now.getMonth() + 1).toString().padStart(2, '0')}-${now.getDate().toString().padStart(2, '0')} ${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}:${now.getSeconds().toString().padStart(2, '0')}`;
      return prefix + timestamp;
    };

    const updateQRCode = () => {
      setQrData(generateQRDataWithTimestamp());
      setRemainingTime(5); // Reset remaining time
    };

    updateQRCode(); // Initial QR code generation

    const interval = setInterval(() => {
      updateQRCode(); // Periodically update QR code
      setRemainingTime(5); // Reset remaining time with each update
    }, qrTime * 1000);

    const countdown = setInterval(() => {
      setRemainingTime(prevTime => prevTime > 0 ? prevTime - 1 : 0); // Decrease remaining time
    }, 1000);

    return () => {
      clearInterval(interval);
      clearInterval(countdown);
    };
  }, []);

  const handleNavigateToTest = () => {
    navigate('/test', { state: { selectLecture, ProfessorInfo } });
  };

  useEffect(() => {
    if (remainingTime === 0) {
      setQrData(""); // Clear QR code when time is up
    }
  }, [remainingTime]);

  // 해당 과목을 듣는 전체 총 학생 PK 가져오기
  const GetTotalStudentPK = async () => {
    try {
      const response = await fetch(`${config.serverUrl}/GetTotalStudentPK`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          lecture_id: selectLecture.lecture_id,
        })
      });
      const TotalStudentFk = await response.json();
      return TotalStudentFk;
    } catch (error) {
      console.error(error);
    }
  };

  // 해당 과목 출석한 총 학생 PK 가져오기
  const GetAttendanceStudentPK = async () => {
    try {
      const response = await fetch(`${config.serverUrl}/GetAttendanceStudentPK`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          lecture_id: selectLecture.lecture_id,
          weeknum: weeknum,
        })
      });
      const AttendanceStudentFk = await response.json();
      return AttendanceStudentFk;
    } catch (error) {
      console.error(error);
    }
  };

  // 나머지 학생들 데이터 결석 처리하기
  const InsertMissingStudentAttendance = async (sutdent_fk, classnum) => {
    try {
      const response = await fetch(`${config.serverUrl}/InsertMissingStudentAttendance`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          sutdent_fk: sutdent_fk,
          lecture_fk: selectLecture.lecture_id,
          weeknum: weeknum,
          classnum: classnum,
        })
      });
      console.log(response);
    } catch (error) {
      console.error(error);
    }
  };

  // 현재 absent 값을 가져오는 함수 수정
  const getCurrentAbsentCount = async (lectureId) => {
    try {
      const response = await fetch(`${config.serverUrl}/GetabsentStudent`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          lecture_id: lectureId,
        }),
      });

      const result = await response.json();
      console.log(result)
      return result
    } catch (error) {
      console.error("현재 absent 값 가져오기 실패:", error);
      return 0; // 오류 발생 시 0 반환
    }
  };


  // 출석 정보를 업데이트하는 함수 수정
  const updateAttendanceInfo = async (lectureId, absentCount, nonattendanceCount) => {
    try {
      const response = await fetch(`${config.serverUrl}/ChangeAllStudentInfo`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          lecture_id: lectureId,
          nonattendance: nonattendanceCount, // 기존 값으로 설정
          attendance: 0,    // 기존 값으로 설정
          tardy: 0,         // 기존 값으로 설정
          absent: absentCount, // 결석 학생 수 (현재 값 + 3)
        }),
      });

      const result = await response.json();
      if (!result.success) {
        throw new Error(result.message);
      }
      console.log("출석 정보 업데이트 성공:", result);
    } catch (error) {
      console.error("출석 정보 업데이트 실패:", error);
    }
  };

  const handleCompleteAttendance = async () => {
    const TotalStudentPK = await GetTotalStudentPK(); // 과목 총 학생 FK
    const AttendanceStudentPK = await GetAttendanceStudentPK(); // 과목 출석 학생 FK

    const totalStudentIds = new Set(TotalStudentPK.map(item => item.student_id));
    const attendanceStudentIds = new Set(AttendanceStudentPK.map(item => item.student_id));

    // Find the student_ids that are in TotalStudentPK but not in AttendanceStudentPK
    const missingStudentIds = [...totalStudentIds].filter(id => !attendanceStudentIds.has(id)); // 나머지 학생 FK

    const periods = [1, 2, 3];

    // 결석 처리
    for (const student of missingStudentIds) {
        for (const period of periods) {
            try {
                await InsertMissingStudentAttendance(student, period);
            } catch (error) {
                console.error(error);
            }
        }
    }

    // 현재 absent 및 nonattendance 값을 가져오기
    const currentAbsentData = await getCurrentAbsentCount(selectLecture.lecture_id);
    console.log("현재 결석 데이터:", currentAbsentData); // 로그 추가

    // 각 객체에 대해 nonattendance 값을 3 감소시키고, absent 값을 3 증가시키기
    for (const item of currentAbsentData) {
        const updatedNonattendanceCount = Math.max(item.nonattendance - 3, 0); // nonattendance는 음수가 되지 않도록
        const updatedAbsentCount = item.absent + 3; // absent는 3 증가

        // 출석 정보를 업데이트하는 API 호출
        await updateAttendanceInfo(selectLecture.lecture_id, updatedAbsentCount, updatedNonattendanceCount);
    }

    handleNavigateToTest();
};

  return (
    <div className={styles.App}>
      <header className="App-header">
        <h1>출석 체크</h1>
        <div>
          <QRCode value={qrData} bgColor={'white'} size={512} />
        </div>
        {/* <p>남은 시간: {remainingTime}초</p> */}
      </header>
      <div className={styles.Button_space}>
        <button className={styles.completeAttendance} onClick={handleCompleteAttendance}>
          <p className={styles.completeAttendanceText}>출석 마감</p>
        </button>
      </div>
    </div>
  );
}

export default QrCheck;