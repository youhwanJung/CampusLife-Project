import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './Main.module.css';
import { BiSolidNavigation } from "react-icons/bi";
import { useLocation } from 'react-router-dom';
import config from './config'

function Pagebtn({ handleNavigateToTest, lecture }) {
  return (
    <button onClick={handleNavigateToTest} className={styles.pagebtn}>
      <div className={styles.pagebtntext}>
        <h3>{lecture.lecture_name} <br /></h3>
        <h5>{lecture.lecture_grade + "학년 " + 
        "(총" + lecture.lecture_have_week + "주차) "+ 
        " " + lecture.lecture_room + 
        " (" + lecture.lecture_time + ")" } <br /></h5>
        <h5>{lecture.time}</h5>
      </div>
      <BiSolidNavigation size={80} />
    </button>
  );
}

function Main() {
  const [selectedCategory, setSelectedCategory] = useState('전공');
  const [professorLectures, setProfessorLectures] = useState({ 전공: [], 교양: [] }); //이게 lectures 역활을 할거야. 
  const navigate = useNavigate();
  const location = useLocation();
  const { ProfessorInfo } = location.state || {};

  //교수의 모든 강의 과목을 가져온다음 지태의 형태로 변환 해준다.
  useEffect(() => {
    const fetchData = async () => {
      try {
        const professorLecture = await GetProfessorLecture();
        const formattedLectures = {
          전공: professorLecture
            .filter((lecture) => lecture.division === '전공')
            .map((lecture) => ({
              lecture_id : lecture.lecture_id,
              professor_id : lecture.professor_id,
              credit : lecture.credit,
              lecture_name : lecture.lecture_name,
              lecture_room : lecture.lecture_room,
              lecture_time : lecture.lecture_time,
              week : lecture.week,
              division : lecture.division,
              lecture_grade : lecture.lecture_grade,
              lecture_semester : lecture.lecture_semester,
              lecture_have_week : lecture.lecture_have_week,
              section_class : lecture.section_class,
              lecture_start_date: lecture.lecture_start_date
            })),
          교양: professorLecture
            .filter((lecture) => lecture.division === '교양')
            .map((lecture) => ({
              lecture_id : lecture.lecture_id,
              professor_id : lecture.professor_id,
              credit : lecture.credit,
              lecture_name : lecture.lecture_name,
              lecture_room : lecture.lecture_room,
              lecture_time : lecture.lecture_time,
              week : lecture.week,
              division : lecture.division,
              lecture_grade : lecture.lecture_grade,
              lecture_semester : lecture.lecture_semester,
              lecture_have_week : lecture.lecture_have_week,
              section_class : lecture.section_class,
              lecture_start_date: lecture.lecture_start_date
            })),
        };
    
        // 상태 업데이트
        //console.log(formattedLectures);
        setProfessorLectures(formattedLectures);
      } catch (error) {
        console.error('Error fetching professor lectures:', error);
      }
    };
    fetchData(); 
  }, []); 

  const GetProfessorLecture = async () => {
    try {
      const response = await fetch(`${config.serverUrl}/GetProfessorLecture`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          professor_id : ProfessorInfo.professor_id
        })
      })
      const ProfessorData = await response.json();
      return ProfessorData;
    } catch (error) {
      console.error(error);
    }
  }

  const handleNavigateToTest = (selectLecture, ProfessorInfo) => {
    navigate('/test', { state: { selectLecture, ProfessorInfo} } );
  };

  const lectures = {
    전공: [
      { title: '강의1', details: '1학년 (002분반) B608', time: '(10:10 ~ 13:00) 화요일' },
      { title: '강의2', details: '2학년 (001분반) B609', time: '(11:00 ~ 12:30) 수요일' },
      { title: '강의3', details: '2학년 (001분반) B609', time: '(11:00 ~ 12:30) 목요일' },
      { title: '강의4', details: '2학년 (001분반) B609', time: '(11:00 ~ 12:30) 금요일' },
      // Add more 전공 lectures here
    ],
    교양: [
      { title: '강의1', details: '1학년 (003분반) A101', time: '(09:00 ~ 10:30) 월요일' },
      { title: '강의2', details: '2학년 (002분반) A102', time: '(14:00 ~ 15:30) 금요일' },
      // Add more 교양 lectures here
    ]
  };

  return (
    <div className={styles.container}>
      <div className={styles.area}>
        <div className={styles.selectLecture}>
          <button className={styles.btn} onClick={() => setSelectedCategory('전공')}>전공</button>
          <button className={styles.btn} onClick={() => setSelectedCategory('교양')}>교양</button>
        </div>
        <div className={styles.test}>
          <h1>{selectedCategory}과목</h1>
          <hr className={styles.hr} />
          {/*여기서 해당 과목의 정보를 넘겨줄거임 test 페이지로 */}
          {professorLectures[selectedCategory].map((lecture, index) => (
            <Pagebtn key={index} handleNavigateToTest={ () => {
              handleNavigateToTest(lecture, ProfessorInfo)
            }
              } lecture={lecture} />
          ))}
        </div>
      </div>
    </div>
  );
}

export default Main;
