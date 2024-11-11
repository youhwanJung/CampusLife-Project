const express = require('express');
const cors = require('cors');
const app = express();
const PORT = process.env.PORT || 4000;

const mariadb = require('mariadb');
const fs = require('fs');
const data = fs.readFileSync('./src/page/database.json');
const conf = JSON.parse(data);

const pool = mariadb.createPool({
    host: conf.host,
    user: conf.user,
    password: conf.password,
    port: conf.port,
    database: conf.database,
    multipleStatements: true,
    connectionLimit: 10, // 연결 풀 최대 크기
    acquireTimeout: 10000, // 연결 시도 시간
    connectTimeout: 10000 // 연결 타임아웃 시간
});

pool.getConnection()
    .then(conn => {
        console.log("MariaDB connection successful");
        conn.release(); // 연결 반환
    })
    .catch(err => {
        console.error("Error in MariaDB connection:", err);
    });

app.use(cors());
app.use(express.json());

// 테스트 디비문
app.get('/test-connection', async (req, res) => {
    try {
        const conn = await pool.getConnection();
        const rows = await conn.query("SELECT 1 as test");
        conn.release(); // 연결을 풀에 반환
        res.send({ success: true, rows });
    } catch (err) {
        console.error("DB 연결 오류:", err);
        res.status(500).send({ success: false, message: "DB 연결 실패" });
    }
});

// 교수 정보 가져오기
app.post('/CheckProfessorInfo', async (req, res) => {
    const { id, pass } = req.body;
    try {
        const conn = await pool.getConnection();
        const query = `SELECT * FROM professor WHERE professor.id = ? AND professor.pass = ?`;
        const rows = await conn.query(query, [id, pass]);
        conn.release(); // 연결을 풀에 반환

        if (rows.length === 0) {
            // 조회된 행이 없을 때
            console.log("교수 정보 없음");
            return res.status(404).json({ success: false, message: "교수 정보를 찾을 수 없습니다." });
        }

        // 교수 정보가 존재할 때
        const processedData = rows.map(item => ({
            professor_id: item.professor_id,
            campus_id: item.campus_id,
            department_id: item.department_id,
            id: item.id,
            pass: item.pass,
            name: item.name,
            professor_room: item.professor_room,
            tell_num: item.tell_num,
        }));

        console.log("교수 정보 가져오기 성공");
        res.json({ success: true, data: processedData });
    } catch (error) {
        console.error("교수 정보 가져오기 실패:", error);
        res.status(500).json({ success: false, message: "연결 실패" });
    }
});

// 교수 강의 과목 전부 가져오기
app.post('/GetProfessorLecture', async (req, res) => {
    const { professor_id } = req.body;
    try {
        const conn = await pool.getConnection();
        const query = `SELECT * FROM lecture WHERE lecture.professor_id = ?`;
        const rows = await conn.query(query, [professor_id]);
        conn.release();

        // 교수 정보가 존재할 때
        const processedData = rows.map(item => ({
            lecture_id: item.lecture_id,
            professor_id: item.professor_id,
            credit: item.credit,
            lecture_name: item.lecture_name,
            lecture_room: item.lecture_room,
            lecture_time: item.lecture_time,
            week: item.week,
            division: item.division,
            lecture_grade: item.lecture_grade,
            lecture_semester: item.lecture_semester,
            lecture_have_week: item.lecture_have_week,
            section_class: item.section_class,
            lecture_start_date: item.lecture_start_date
        }));

        console.log("교수 강의 과목 가져오기 성공");
        console.log(processedData);
        res.json(processedData);
    } catch (error) {
        console.error("교수 강의 과목 가져오기 실패:", error);
        res.status(500).json({ success: false, message: "연결 실패" });
    }
});

// 해당 과목을 듣는 전체 총 학생 수 가져오기
app.post('/GetTotalStudentNum', async (req, res) => {
    const { lecture_id } = req.body;
    try {
        const conn = await pool.getConnection();
        const query =
            `SELECT 
            COUNT(DISTINCT student_id) AS unique_student_count
        FROM 
            lecture_have_object
        WHERE 
            lecture_id = ?`;
        const rows = await conn.query(query, [lecture_id]);
        conn.release();

        const processedData = rows.length > 0 ? {
            TotalstudentNum: rows[0].unique_student_count.toString()
        } : { TotalstudentNum: "0" };
        console.log("해당 과목을 듣는 전체 총 학생 수 가져오기 성공");

        res.json(processedData);
    } catch (error) {
        console.error("해당 과목을 듣는 전체 총 학생 수 가져오기 실패:", error);
        res.status(500).json({ success: false, message: "연결 실패" });
    }
});

// 학생 출석 상태 가져오기
app.post('/GetWeekClassStudentAttendanceStates', async (req, res) => {
    const { lecture_id, weeknum, classnum } = req.body;
    try {
        const conn = await pool.getConnection();
        const query =
            `
            SELECT
	            student.student_id,
	            student.name AS student_name,
	            department.name AS department_name,
	            lecture_week_info.lecture_fk,
	            lecture_week_info.weeknum,
	            lecture_week_info.classnum,
	            lecture_week_info.attendance_Info
            FROM
	            lecture_week_info
            JOIN 
	            student ON lecture_week_info.student_fk = student.student_id
            JOIN
	            department ON student.department_id = department.department_id
            WHERE
	            lecture_week_info.lecture_fk = ?
            AND
	            lecture_week_info.weeknum = ?
            AND
	            lecture_week_info.classnum = ?
            `;
        const rows = await conn.query(query, [lecture_id, weeknum, classnum]);
        conn.release();

        // 교수 정보가 존재할 때
        const processedData = rows.map(item => ({
            student_id: item.student_id,
            student_name: item.student_name,
            department_name: item.department_name,
            lecture_id: item.lecture_fk,
            weeknum: item.weeknum,
            classnum: item.classnum,
            attendance_Info: item.attendance_Info
        }));

        console.log("학생 출석 상태 가져오기 성공");
        res.json(processedData);
    } catch (error) {
        console.error("학생 출석 상태 가져오기:", error);
        res.status(500).json({ success: false, message: "연결 실패" });
    }
});

// 해당 과목 듣는 학생 정보 가져오기
app.post('/GetTotalStudentInfo', async (req, res) => {
    const { lecture_id } = req.body;
    try {
        const conn = await pool.getConnection();
        const query =
            `
            SELECT
	            student.student_id,
	            student.name AS student_name,
	            department.name AS department_name,
	            lecture_have_object.lecture_id
            FROM
	            lecture_have_object
            JOIN 
	            student ON lecture_have_object.student_id = student.student_id
            JOIN
	            department ON student.department_id = department.department_id
            WHERE
	            lecture_have_object.lecture_id = ?
            `;
        const rows = await conn.query(query, [lecture_id]);
        conn.release();

        // 교수 정보가 존재할 때
        const processedData = rows.map(item => ({
            student_id: item.student_id,
            student_name: item.student_name,
            department_name: item.department_name,
            lecture_id: item.lecture_fk,
        }));

        console.log("해당 과목 듣는 학생 정보 가져오기 성공");
        res.json(processedData);
    } catch (error) {
        console.error("해당 과목 듣는 학생 정보 가져오기:", error);
        res.status(500).json({ success: false, message: "연결 실패" });
    }
});

// 해당 학생 출석정보 변경
app.post('/ChangeStudentState', async (req, res) => {
    const { student_id, lecture_id, weeknum, classnum, student_info } = req.body;
    console.log('Received Data:', { student_id, lecture_id, weeknum, classnum, student_info }); // 로그 추가
    try {
        const conn = await pool.getConnection();
        const query = `
            UPDATE 
                lecture_week_info
            SET 
                attendance_Info = ?
            WHERE 
                student_fk = ?
            AND
                weeknum = ?
            AND
                lecture_fk = ?
            AND
                classnum = ?;
        `;
        const result = await conn.query(query, [student_info, student_id, weeknum, lecture_id, classnum]);
        console.log('Query Result:', result); // 쿼리 결과 로그
        conn.release();
        console.log("해당 학생 출석정보 변경 성공");
        res.status(200).json({ message: '서버가 잘 마무리되었습니다.' });
    } catch (error) {
        console.error("해당 학생 출석정보 변경 실패:", error);
        res.status(500).json({ success: false, message: "연결 실패" });
    }
});

app.post('/GetTotalStudentPK', async (req, res) => {
    const { lecture_id } = req.body;
    try {
        const conn = await pool.getConnection();
        const query =
            `
                SELECT student_id FROM lecture_have_object WHERE lecture_have_object.lecture_id = ?
            `;
        const rows = await conn.query(query, [lecture_id]);
        conn.release();

        const processedData = rows.map(item => ({
            student_id: item.student_id,
        }));

        console.log("해당 과목 듣는 학생 정보 FK 배열 가져오기 성공");
        res.json(processedData);
    } catch (error) {
        console.error("해당 과목 듣는 학생 정보 FK 배열 가져오기 실패:", error);
        res.status(500).json({ success: false, message: "연결 실패" });
    }
});

app.post('/GetAttendanceStudentPK', async (req, res) => {
    const { lecture_id, weeknum } = req.body;
    try {
        const conn = await pool.getConnection();
        const query =
            `
                SELECT DISTINCT 
                    student_fk 
                FROM 
                    lecture_week_info 
                WHERE 
                    lecture_fk = ? AND weeknum = ?;
            `;
        const rows = await conn.query(query, [lecture_id, weeknum]);
        conn.release();

        const processedData = rows.map(item => ({
            student_id: item.student_fk,
        }));

        console.log("해당 과목 출석 학생 정보 FK 배열 가져오기 성공");
        res.json(processedData);
    } catch (error) {
        console.error("해당 과목 출석 학생 정보 FK 배열 가져오기 실패:", error);
        res.status(500).json({ success: false, message: "연결 실패" });
    }
});

app.post('/InsertMissingStudentAttendance', async (req, res) => {
    const { sutdent_fk, lecture_fk, weeknum, classnum } = req.body;
    try {
        const conn = await pool.getConnection();
        const query =
            `
                INSERT INTO lecture_week_info (student_fk, lecture_fk, weeknum, classnum, attendance_Info)
                VALUES (?, ?, ?, ? , '결석');
            `;
        await conn.query(query, [sutdent_fk, lecture_fk, weeknum, classnum]);
        conn.release();
        res.status(200).json({ message: '서버가 잘 마무리되었습니다.' });
    } catch (error) {
        console.error("나머지 학생 데이터 넣기 실패:", error);
        res.status(500).json({ success: false, message: "연결 실패" });
    }
});


app.post('/GetAttendanceStudent', async (req, res) => {
    const { student_id, lecture_id } = req.body;
    try {
        const conn = await pool.getConnection();
        
        const query = `
            SELECT nonattendance, attendance, tardy, absent 
            FROM lecture_have_object 
            WHERE student_id = ? AND lecture_id = ?
        `;

        // 쿼리 실행
        const rows = await conn.query(query, [student_id, lecture_id]);
        conn.release();

        // 데이터를 필요한 형식으로 가공
        const processedData = rows.map(item => ({
            nonattendance: item.nonattendance,
            attendance: item.attendance,
            tardy: item.tardy,
            absent: item.absent
        }));

        console.log("해당 과목 출석 학생 정보 가져오기 성공");
        res.json(processedData);
    } catch (error) {
        console.error("해당 과목 출석 학생 정보 가져오기 실패:", error);
        res.status(500).json({ success: false, message: "연결 실패" });
    }
});

app.post('/GetabsentStudent', async (req, res) => {
    const { lecture_id } = req.body;
    try {
        const conn = await pool.getConnection();
        
        const query = `
            SELECT absent, nonattendance 
            FROM lecture_have_object 
            WHERE lecture_id = ?
            `
        ;

        // 쿼리 실행
        const rows = await conn.query(query, [lecture_id]);
        conn.release();

        // 데이터를 필요한 형식으로 가공
        const processedData = rows.map(item => ({
            absent: item.absent,
            nonattendance : item.nonattendance
        }));

        console.log("해당 과목 출석 학생 정보 가져오기 성공");
        res.json(processedData);
    } catch (error) {
        console.error("해당 과목 출석 학생 정보 가져오기 실패:", error);
        res.status(500).json({ success: false, message: "연결 실패" });
    }
});


app.post('/ChangeStudentInfo', async (req, res) => {
    const { student_id, lecture_id, nonattendance, attendance, tardy, absent } = req.body;
    try {
        const conn = await pool.getConnection();
        const query = `
            UPDATE lecture_have_object 
            SET 
                nonattendance = ?, 
                attendance = ?, 
                tardy = ?, 
                absent = ? 
            WHERE student_id = ? AND lecture_id = ?
        `;
        await conn.query(query, [nonattendance, attendance, tardy, absent, student_id, lecture_id]);
        conn.release();
        console.log("해당 학생 출석정보 변경 성공");
        res.status(200).json({ message: '서버가 잘 마무리되었습니다.' });
    } catch (error) {
        console.error("해당 학생 출석정보 변경 실패:", error);
        res.status(500).json({ success: false, message: "연결 실패" });
    }
});

app.post('/ChangeAllStudentInfo', async (req, res) => {
    const { lecture_id, nonattendance, attendance, tardy, absent } = req.body;
    try {
        const conn = await pool.getConnection();
        const query = `
            UPDATE lecture_have_object 
            SET 
                nonattendance = ?, 
                attendance = ?, 
                tardy = ?, 
                absent = ? 
            WHERE lecture_id = ?`
        ;
        await conn.query(query, [nonattendance, attendance, tardy, absent, lecture_id]);
        conn.release();
        console.log("해당 학생 출석정보 변경 성공");
        res.status(200).json({ message: '서버가 잘 마무리되었습니다.' });
    } catch (error) {
        console.error("해당 학생 출석정보 변경 실패:", error);
        res.status(500).json({ success: false, message: "연결 실패" });
    }
}); 

app.listen(PORT, () => {
    console.log(`서버가 포트 ${PORT}에서 실행 중입니다.`);
});
