const mariadb = require('mariadb');
const PORT = 3000;

//마리아 db설정
const pool = mariadb.createPool({
    host: '127.0.0.1',
    port: 3306,
    user: 'dohyun',
    password: '0000',
    connectionLimit: 10,
    database: 'campuslife',
});


//학교 공지사항에서 전체 게시글 가져오는 쿼리
async function getNoticePosts(campus_id) {
    let conn;
    try {
        conn = await pool.getConnection();
        const query = (
            "SELECT post.post_id, post.title, post.contents, post.date, post.view, post.`like`, student.name, user.title AS user_title, student.campus_id "
            + "FROM "
            + "post "
            + "LEFT JOIN "
            + "user "
            + "ON post.user_id = user.user_id "
            + "LEFT JOIN "
            + "student "
            + "ON user.student_id = student.student_id "
            + "WHERE "
            + "post.department_check = 0 AND post.inform_check = 1 AND student.campus_id = ? AND post.contest_check = 0 "
            + "ORDER BY post.date DESC"
        );
        const rows = await conn.query(query, [campus_id]);
        return rows;
    } catch (err) {
        throw err;
    } finally {
        if (conn) conn.release();
    }
}

//학교 공지사항에서 학과 게시글 가져오는 쿼리
async function getNoticeDepartmentPosts(department_id) {
    let conn;
    try {
        conn = await pool.getConnection();
        const query = (
            "SELECT post.post_id, post.title, post.contents, post.date, post.view, post.`like`, student.name, user.title AS user_title "
            + "FROM "
            + "post "
            + "LEFT JOIN "
            + "user "
            + "ON post.user_id = user.user_id "
            + "LEFT JOIN "
            + "student "
            + "ON user.student_id = student.student_id "
            + "WHERE "
            + "post.department_check = 1 AND post.inform_check = 1 AND student.department_id = ? "
            + "ORDER BY post.date DESC"
        );
        const rows = await conn.query(query, [department_id]);
        return rows;
    } catch (err) {
        throw err;
    } finally {
        if (conn) conn.release();
    }
}

//학교 게시판에서 핫 게시물을 가져오는 쿼리
async function getNoticeHotPosts(campus_id) {
    let conn;
    try {
        conn = await pool.getConnection(campus_id);
        const query = (
            "SELECT post.post_id, post.title, post.contents, post.date, post.view, post.`like`, student.name, user.title AS user_title, student.campus_id "
            + "FROM "
            + "post "
            + "LEFT JOIN "
            + "user "
            + "ON post.user_id = user.user_id "
            + "LEFT JOIN "
            + "student "
            + "ON user.student_id = student.student_id "
            + "WHERE "
            + "post.department_check = 0 AND post.inform_check = 1 AND post.`like` >= 30 AND student.campus_id = ? "
            + "ORDER BY post.date DESC"
        );
        const rows = await conn.query(query, [campus_id]);
        return rows;
    } catch (err) {
        throw err;
    } finally {
        if (conn) conn.release();
    }
}

//학교 게시판에서 핫 게시물을 가져오는 쿼리
async function getNoticeDepartmentHotPosts(department_id) {
    let conn;
    try {
        conn = await pool.getConnection();
        const query = (
            "SELECT post.post_id, post.title, post.contents, post.date, post.view, post.`like`, student.name, user.title AS user_title, student.department_id "
            + "FROM "
            + "post "
            + "LEFT JOIN "
            + "user "
            + "ON post.user_id = user.user_id "
            + "LEFT JOIN "
            + "student "
            + "ON user.student_id = student.student_id "
            + "WHERE "
            + "post.department_check = 1 AND post.inform_check = 1 AND post.`like` >= 30 AND student.department_id = ? "
            + "ORDER BY post.date DESC"
        );
        const rows = await conn.query(query, [department_id]);
        return rows;
    } catch (err) {
        throw err;
    } finally {
        if (conn) conn.release();
    }
}

//학교 공지사항에서 책갈피 가져오기
async function getNoticeBookmarkPosts(user_id) {
    let conn;
    try {
        conn = await pool.getConnection();
        const query = (
            `SELECT 
            post.post_id, 
            post.title, 
            post.contents, 
            post.date, 
            post.view, 
            post.\`like\`, 
            student.name, 
            user.title AS user_title
        FROM 
            post
        LEFT JOIN 
            user ON post.user_id = user.user_id
        LEFT JOIN 
            student ON user.student_id = student.student_id
        LEFT JOIN 
            user_have_post ON post.post_id = user_have_post.post_id
        WHERE 
            post.department_check = 0 
            AND post.inform_check = 1 
            AND user_have_post.user_id = ?
        GROUP BY 
            post.post_id
        ORDER BY 
            COUNT(user_have_post.post_id) DESC;`
        );
        const rows = await conn.query(query, [user_id]);
        return rows;
    } catch (err) {
        throw err;
    } finally {
        if (conn) conn.release();
    }
}

//학과 공지사항에서 책갈피 가져오기
async function getNoticeDepartmentBookmarkPosts(user_id, department_id) {
    let conn;
    try {
        conn = await pool.getConnection();
        const query = (
            `SELECT 
            post.post_id, 
            post.title, 
            post.contents, 
            post.date, 
            post.view, 
            post.\`like\`, 
            student.name, 
            user.title AS user_title
        FROM 
            post
        LEFT JOIN 
            user ON post.user_id = user.user_id
        LEFT JOIN 
            student ON user.student_id = student.student_id
        LEFT JOIN 
            user_have_post ON post.post_id = user_have_post.post_id
        WHERE 
            post.department_check = 1 
            AND post.inform_check = 1 
            AND user_have_post.user_id = ?
            AND student.department_id = ?
        GROUP BY 
            post.post_id
        ORDER BY 
            COUNT(user_have_post.post_id) DESC;`
        );
        const rows = await conn.query(query, [user_id, department_id]);
        return rows;
    } catch (err) {
        throw err;
    } finally {
        if (conn) conn.release();
    }
}

//전체 게시판에서 전체 게시글을 가져오는 쿼리
async function getGeneralPosts(campus_id) {
    let conn;
    try {
        conn = await pool.getConnection();
        const query = (
            "SELECT post.post_id, post.title, post.contents, post.date, post.view, post.`like`, student.name, user.title AS user_title, student.campus_id "
            + "FROM "
            + "post "
            + "LEFT JOIN "
            + "user "
            + "ON post.user_id = user.user_id "
            + "LEFT JOIN "
            + "student "
            + "ON user.student_id = student.student_id "
            + "WHERE "
            + "post.department_check = 0 AND post.inform_check = 0 AND student.campus_id = ? AND post.Club_check = 0 "
            + "ORDER BY post.date DESC"
        );
        const rows = await conn.query(query, [campus_id]);
        return rows;
    } catch (err) {
        throw err;
    } finally {
        if (conn) conn.release();
    }
}

//전체 게시판에서 전체 게시글을 가져오는 쿼리
async function getContestPosts(campus_id) {
    let conn;
    try {
        conn = await pool.getConnection();
        const query = (
            "SELECT post.post_id, post.title, post.contents, post.date, post.view, post.`like`, post.url, post.sources, post.contest_check, student.name, user.title AS user_title, student.campus_id "
            + "FROM "
            + "post "
            + "LEFT JOIN "
            + "user "
            + "ON post.user_id = user.user_id "
            + "LEFT JOIN "
            + "student "
            + "ON user.student_id = student.student_id "
            + "WHERE "
            + "post.department_check = 0 AND post.inform_check =1 AND student.campus_id = ? AND post.Club_check = 0 AND post.contest_check = 1 "
            + "ORDER BY post.date DESC"
        );
        const rows = await conn.query(query, [campus_id]);
        return rows;
    } catch (err) {
        throw err;
    } finally {
        if (conn) conn.release();
    }
}

async function ClubPosts() {
    let conn;
    try {
        conn = await pool.getConnection();
        const query = (
            "SELECT post.post_id, post.title, post.contents, post.date, post.view, post.`like`, student.name, post_photo.post_photo AS image, user.title AS user_title "
            + "FROM post "
            + "LEFT JOIN user ON post.user_id = user.user_id "
            + "LEFT JOIN student ON user.student_id = student.student_id "
            + "LEFT JOIN post_photo ON post.post_id = post_photo.post_id "
            + "WHERE post.Club_check = 1 "
            + "ORDER BY post.date DESC"
        );
        const rows = await conn.query(query, []);
        return rows;
    } catch (err) {
        throw err;
    } finally {
        if (conn) conn.release();
    }
}

//전체 게시판에서 전체 게시글을 가져오는 쿼리
async function getMyPostData(user_id) {
    let conn;
    try {
        conn = await pool.getConnection();
        const query = (
            "SELECT post.post_id, post.title, post.contents, post.date, post.view, post.`like`, post.inform_check, post.contest_check, student.name, user.title AS user_title, student.campus_id "
            + ",post.department_check, post.Club_check "
            + "FROM "
            + "post "
            + "LEFT JOIN "
            + "user "
            + "ON post.user_id = user.user_id "
            + "LEFT JOIN "
            + "student "
            + "ON user.student_id = student.student_id "
            + "WHERE "
            + "user.user_id = ? "
            + "ORDER BY post.date DESC"
        );
        const rows = await conn.query(query, [user_id]);
        return rows;
    } catch (err) {
        throw err;
    } finally {
        if (conn) conn.release();
    }
}

//전체 게시판에서 핫 게시물을 가져오는 쿼리
async function getHotPosts(campus_id) {
    let conn;
    try {
        conn = await pool.getConnection();
        const query = (
            "SELECT post.post_id, post.title, post.contents, post.date, post.view, post.`like`, student.name, user.title AS user_title, student.campus_id "
            + "FROM "
            + "post "
            + "LEFT JOIN "
            + "user "
            + "ON post.user_id = user.user_id "
            + "LEFT JOIN "
            + "student "
            + "ON user.student_id = student.student_id "
            + "WHERE "
            + "post.department_check = 0 AND post.inform_check =0 AND post.`like` >= 30 AND student.campus_id = ? "
            + "ORDER BY post.date DESC"
        );
        const rows = await conn.query(query, [campus_id]);
        return rows;
    } catch (err) {
        throw err;
    } finally {
        if (conn) conn.release();
    }
}

//전체 게시판에서 책갈피한 게시물을 가져오는 쿼리
async function getBookmarkPosts(user_id) {
    let conn;
    try {
        conn = await pool.getConnection();
        const query = (
            `SELECT 
                post.post_id, 
                post.title, 
                post.contents, 
                post.date, 
                post.view, 
                post.\`like\`, 
                student.name, 
                user.title AS user_title,
                COUNT(user_have_post.post_id) AS bookmark_count
            FROM 
                post
            LEFT JOIN 
                user ON post.user_id = user.user_id
            LEFT JOIN 
                student ON user.student_id = student.student_id
            LEFT JOIN 
                user_have_post ON post.post_id = user_have_post.post_id
            WHERE 
                post.department_check = 0 
                AND post.inform_check = 0 
                AND user_have_post.user_id = ?
            GROUP BY 
                post.post_id
            ORDER BY 
                post.date DESC;`
        );
        const rows = await conn.query(query, [user_id]);
        return rows;
    } catch (err) {
        throw err;
    } finally {
        if (conn) conn.release();
    }
}

//학과 게시판에서 전체 게시글을 가져오는 쿼리
async function getDepartmentPosts(department_id) {
    let conn;
    try {
        conn = await pool.getConnection();
        const query = (
            "SELECT post.post_id, post.title, post.contents, post.date, post.view, post.`like`, student.name, user.title AS user_title, student.department_id "
            + "FROM "
            + "post "
            + "LEFT JOIN "
            + "user "
            + "ON post.user_id = user.user_id "
            + "LEFT JOIN "
            + "student "
            + "ON user.student_id = student.student_id "
            + "WHERE "
            + "post.department_check = 1 AND post.inform_check = 0 AND student.department_id = ? AND post.Club_check = 0 "
            + "ORDER BY post.date DESC"
        );
        const rows = await conn.query(query, [department_id]);
        return rows;
    } catch (err) {
        throw err;
    } finally {
        if (conn) conn.release();
    }
}

//학과 게시판에서 핫 게시물을 가져오는 쿼리
async function getdepartmentHotPosts(department_id) {
    let conn;
    try {
        conn = await pool.getConnection();
        const query = (
            "SELECT post.post_id, post.title, post.contents, post.date, post.view, post.`like`, student.name, user.title AS user_title "
            + "FROM "
            + "post "
            + "LEFT JOIN "
            + "user "
            + "ON post.user_id = user.user_id "
            + "LEFT JOIN "
            + "student "
            + "ON user.student_id = student.student_id "
            + "WHERE "
            + "post.department_check = 1 AND post.inform_check = 0 AND post.`like` >= 30 AND student.department_id = ? "
            + "ORDER BY post.date DESC"
        );
        const rows = await conn.query(query, [department_id]);
        return rows;
    } catch (err) {
        throw err;
    } finally {
        if (conn) conn.release();
    }
}

// 게시판에서 책갈피한 게시물을 가져오는 쿼리
async function getdepartmentBookmarkPosts(user_id, department_id) {
    let conn;
    try {
        conn = await pool.getConnection();
        const query = (
            `SELECT 
            post.post_id, 
            post.title, 
            post.contents, 
            post.date, 
            post.view, 
            post.\`like\`, 
            student.name, 
            user.title AS user_title
        FROM 
            post
        LEFT JOIN 
            user ON post.user_id = user.user_id
        LEFT JOIN 
            student ON user.student_id = student.student_id
        LEFT JOIN 
            user_have_post ON post.post_id = user_have_post.post_id
        WHERE 
            post.department_check = 1 
            AND post.inform_check = 0 
            AND user_have_post.user_id = ?
            AND student.department_id = ?
        GROUP BY 
            post.post_id
        ORDER BY 
            COUNT(user_have_post.post_id) DESC;`
        );
        const rows = await conn.query(query, [user_id, department_id]);
        return rows;
    } catch (err) {
        throw err;
    } finally {
        if (conn) conn.release();
    }
}

//메인 화면에서 핫 게시글을 가져오는 쿼리
async function gethotpostdata(campus_id) {
    let conn;
    try {
        conn = await pool.getConnection();
        const query = (
            "SELECT post.post_id, post.title, post.contents, post.date, post.view, post.`like`, student.name, user.admin_check, student.campus_id "
            + "FROM "
            + "post "
            + "LEFT JOIN "
            + "user "
            + "ON post.user_id = user.user_id "
            + "LEFT JOIN "
            + "student "
            + "ON user.student_id = student.student_id "
            + "WHERE "
            + "post.department_check = 0 AND post.inform_check =0 AND post.`like` >= 30 AND student.campus_id = ? "
            + "ORDER BY post.date DESC "
            + "LIMIT 5"
        );
        const rows = await conn.query(query, [campus_id])
        return rows;
    } catch (err) {
        throw err;
    } finally {
        if (conn) conn.release();
    }
}

//메인 화면에서 학과 게시글을 가져오는 쿼리
async function getdeparmentpostdata(department_id) {
    let conn;
    try {
        conn = await pool.getConnection();
        const query = ("SELECT post.post_id, post.title, post.contents, post.date, post.view, post.`like`, student.name, user.admin_check "
            + "FROM "
            + "post "
            + "LEFT JOIN "
            + "user "
            + "ON post.user_id = user.user_id "
            + "LEFT JOIN "
            + "student "
            + "ON user.student_id = student.student_id "
            + "WHERE "
            + "post.department_check = 1 AND post.inform_check = 1 AND student.department_id = ? "
            + "ORDER BY post.date DESC "
            + "LIMIT 5")
        const rows = await conn.query(query, [department_id])
            ;
        return rows;
    } catch (err) {
        throw err;
    } finally {
        if (conn) conn.release();
    }
}

//메인 화면에서 학교 게시글을 가져오는 쿼리
async function getschoolpostdata(campus_id) {
    let conn;
    try {
        conn = await pool.getConnection(campus_id);
        const query = ("SELECT post.post_id, post.title, post.contents, post.date, post.view, post.`like`, student.name, user.admin_check, student.campus_id "
            + "FROM "
            + "post "
            + "LEFT JOIN "
            + "user "
            + "ON post.user_id = user.user_id "
            + "LEFT JOIN "
            + "student "
            + "ON user.student_id = student.student_id "
            + "WHERE "
            + "post.department_check = 0 AND post.inform_check = 1 AND student.campus_id = ? AND post.contest_check = 0 "
            + "ORDER BY post.date DESC "
            + "LIMIT 5")
        const rows = await conn.query(query, [campus_id])
        return rows;
    } catch (err) {
        throw err;
    } finally {
        if (conn) conn.release();
    }
}

//작성한 게시글을 넣는 쿼리
async function insertDataIntoDB(post_id, user_id, department_check, inform_check, title, contents, view, like) {
    let conn;
    try {
        conn = await pool.getConnection();
        // 데이터 삽입 쿼리 작성
        const query = `INSERT INTO post (post_id, user_id, department_check, inform_check, title, contents, date, view, \`like\`) 
               VALUES (?, ?, ?, ?, ?, ?, NOW(), ?, ?)`;
        // 쿼리 실행
        const result = await conn.query(query, [post_id, user_id, department_check, inform_check, title, contents, view, like]);
        console.log('Data inserted successfully:', result);
    } catch (err) {
        console.error('Error inserting data:', err);
    } finally {
        if (conn) conn.release(); // 연결 해제
    }
}
//로그인할때(유저 PK값 가져오기)
async function getuserpk(user_id, user_passwd) {
    let conn;
    try {
        conn = await pool.getConnection();
        // 데이터 삽입 쿼리 작성
        const rows = await conn.query(`
            SELECT user.user_id, 
                user.student_id, user.friend_code, 
                user.point, user.admin_check, 
                user.profilePhoto,
                user.id,
                user.title,
                user.report_confirm,
                user.aram_count,
                student.name, 
                student.campus_id, 
                student.department_id, 
                student.phone,
                student.email, 
                student.grade,
                student.birth,
                student.currentstatus,
                student.student_semester,
                department_have_object.college
            FROM 
                user 
            LEFT JOIN 
                student ON user.student_id = student.student_id
            LEFT JOIN
                department_have_object ON student.campus_id = department_have_object.campus_id
                AND student.department_id = department_have_object.department_id
            WHERE
                user.id = ? AND user.passwd = ?
        `, [user_id, user_passwd]);

        return rows;
    } catch (err) {
        console.error('Error inserting data:', err);
    } finally {
        if (conn) conn.release(); // 연결 해제
    }
}

// 과목의 정보를 가져오는 쿼리
async function getLectureList(studentId) {
    let conn;
    try {
        conn = await pool.getConnection();
        const rows = await conn.query(`
                    SELECT 
                lecture.lecture_id, 
                professor.name, 
                lecture.credit, 
                lecture.lecture_name, 
                lecture.lecture_room, 
                lecture.lecture_time, 
                lecture.lecture_grade,
                lecture.lecture_semester,
                lecture.week,
                lecture.division,
                lecture.lecture_have_week,
                lecture_have_object.nonattendance, 
                lecture_have_object.attendance, 
                lecture_have_object.tardy, 
                lecture_have_object.absent,
                lecture_have_object.lecture_credit,
                lecture_have_object.lecture_grades
            FROM 
                lecture
            JOIN 
                professor ON lecture.professor_id = professor.professor_id
            JOIN 
                lecture_have_object ON lecture.lecture_id = lecture_have_object.lecture_id
            WHERE 
                lecture_have_object.student_id = ?
        `, [studentId]);
        return rows;
    } catch (err) {
        console.error(err);
        throw err;
    } finally {
        if (conn) conn.release();
    }
}

//과목 업데이트 
async function Updatelecture(student_id, lecture_id, nonattendance, attendance, tardy, absent) {
    let conn;
    try {
        conn = await pool.getConnection();
        // 데이터 업데이트 쿼리 작성
        const query = `
            UPDATE lecture_have_object 
            SET 
                nonattendance = ?, 
                attendance = ?, 
                tardy = ?, 
                absent = ?
            WHERE student_id = ? AND lecture_id = ?
        `;
        const result = await conn.query(query, [nonattendance, attendance, tardy, absent, student_id, lecture_id]);
        // 쿼리 실행
        console.log('Data updated successfully:', result);
    } catch (err) {
        console.error('Error updating data:', err);
    } finally {
        if (conn) conn.release(); // 연결 해제
    }
}

async function get_event_objcet(campus_id) {
    let conn;
    try {
        conn = await pool.getConnection();
        const rows = await conn.query(
            `SELECT * FROM event_object WHERE campus_id = ? AND sell_check = 0`
            , [campus_id]);
        return rows;

    } catch (err) {
        throw err;
    } finally {
        if (conn) conn.release();
    }
}

async function admin_get_event_objcet(campus_id) {
    let conn;
    try {
        conn = await pool.getConnection();
        const rows = await conn.query(
            `SELECT * FROM event_object WHERE campus_id = ? ORDER BY object_id DESC`
            , [campus_id]);
        return rows;

    } catch (err) {
        throw err;
    } finally {
        if (conn) conn.release();
    }
}

//바코드 최댓값 가져오기
async function getBarcordMaxNum() {
    let conn;
    try {
        conn = await pool.getConnection();
        const rows = await conn.query(`
            SELECT MAX(code_num) AS max_code_num FROM event_object;
        `)
        return rows;
    } catch (err) {
        throw err;
    } finally {
        if (conn) conn.release();
    }
}

//상품 등록하기
async function PostItem(campus_id, name, price, code_num, using_time, image_num, sell_check, explain) {
    let conn;
    try {
        conn = await pool.getConnection();
        // 데이터 삽입 쿼리 작성
        const query = "INSERT INTO event_object (campus_id, name, price, code_num, using_time, image_num, sell_check, `explain`) VALUES (?, ?, ?, ?, ?, ?, ?, ?)";

        // 쿼리 실행
        const result = await conn.query(query, [campus_id, name, price, code_num, using_time, image_num, sell_check, explain]);
        console.log('Data inserted successfully:', result);
    } catch (err) {
        console.error('Error inserting data:', err);
    } finally {
        if (conn) conn.release(); // 연결 해제
    }
}

//상품 편집하기
async function UpdateItem(name, newname, price, using_time, image_num, sell_check, explain) {
    let conn;
    try {
        conn = await pool.getConnection();
        // 데이터 업데이트 쿼리 작성
        const query = "UPDATE event_object SET"
            + " name = ?, price = ?, using_time = ?, image_num = ?, sell_check = ?, `explain` = ? WHERE NAME = ?"
        const result = await conn.query(query, [newname, price, using_time, image_num, sell_check, explain, name]);
        // 쿼리 실행
        console.log('Data updated successfully:', result);
    } catch (err) {
        console.error('Error updating data:', err);
    } finally {
        if (conn) conn.release(); // 연결 해제
    }
}

//상품 삭제하기
async function DeleteItem(name, deltenum) {
    let conn;
    try {
        conn = await pool.getConnection();
        // 데이터 업데이트 쿼리 작성
        const query = "DELETE FROM event_object "
            + "WHERE name = ? "
            + "LIMIT ?"
        const result = await conn.query(query, [name, deltenum]);
        // 쿼리 실행
        console.log('Data updated successfully:', result);
    } catch (err) {
        console.error('Error updating data:', err);
    } finally {
        if (conn) conn.release(); // 연결 해제
    }
}

//유저삭제
async function DeleteUser(user_pk) {
    let conn;
    try {
        conn = await pool.getConnection();
        // 데이터 업데이트 쿼리 작성
        const query = "DELETE FROM user "
            + "WHERE user_id = ?"
        const result = await conn.query(query, [user_pk]);
        // 쿼리 실행
        console.log('Data updated successfully:', result);
    } catch (err) {
        console.error('Error updating data:', err);
    } finally {
        if (conn) conn.release(); // 연결 해제
    }
}

//해당 학생 학과 이름가져오기
async function get_department_name(department_name) {
    let conn;
    try {
        conn = await pool.getConnection();
        // 데이터 업데이트 쿼리 작성
        const query = "SELECT department.name FROM department WHERE department_id = ?"
        const result = await conn.query(query, [department_name]);
        //console.log(result);
        return result;
    } catch (err) {
        console.error('Error updating data:', err);
    } finally {
        if (conn) conn.release(); // 연결 해제
    }
}

//해당 학과 이름가져오기
async function get_department(campus_id) {
    let conn;
    try {
        conn = await pool.getConnection();
        const query = `
            SELECT department.name
            FROM department_have_object
            INNER JOIN department ON department_have_object.department_id = department.department_id
            WHERE department_have_object.campus_id = ?;
        `;
        const result = await conn.query(query, [campus_id]);
        return result;
    } catch (err) {
        console.error('Error fetching department data:', err);
        throw err; // 에러를 호출자에게 다시 던짐
    } finally {
        if (conn) conn.release(); // 연결 해제
    }
}

async function get_university_name(university_name) {
    let conn;

    try {
        conn = await pool.getConnection();
        // 데이터 업데이트 쿼리 작성
        const query = "SELECT campus.name FROM campus WHERE campus_id = ?"
        const result = await conn.query(query, [university_name]);
        return result;
    } catch (err) {
        console.error('Error updating data:', err);
    } finally {
        if (conn) conn.release(); // 연결 해제
    }
}

//계정 삭제하기
async function DeleteUser(user_pk) {
    let conn;
    try {
        conn = await pool.getConnection();
        // 데이터 업데이트 쿼리 작성
        const query = "DELETE FROM user "
            + "WHERE user_id = ?"
        const result = await conn.query(query, [user_pk]);
        // 쿼리 실행
        console.log('Data updated successfully:', result);
    } catch (err) {
        console.error('Error updating data:', err);
        alert(data.message);
    } finally {
        if (conn) conn.release(); // 연결 해제
    }
}


//계정 업데이트
async function Updateaccount(email, grade, currentstatus, student_id) {
    let conn;
    try {
        conn = await pool.getConnection();
        // 데이터 업데이트 쿼리 작성
        const query = "UPDATE student SET"
            + " email = ?, grade = ?, currentstatus = ? WHERE student_id = ?"
        const result = await conn.query(query, [email, grade, currentstatus, student_id]);
        // 쿼리 실행
        //console.log('Data updated successfully:', result);
    } catch (err) {
        //console.error('Error updating data:', err);
    } finally {
        if (conn) conn.release(); // 연결 해제
    }
}

//이미지 경로 수정
async function UpdateImg(profilePhoto, user_id) {
    let conn;
    try {
        conn = await pool.getConnection();
        // 데이터 업데이트 쿼리 작성
        const query = "UPDATE user SET profilePhoto = ? WHERE user_id = ?"
        const result = await conn.query(query, [profilePhoto, user_id]);
        // 쿼리 실행
        //console.log('Data updated successfully:', result);
    } catch (err) {
        //console.error('Error updating data:', err);
    } finally {
        if (conn) conn.release(); // 연결 해제
    }
}

//이미지 경로 삭제
async function DeleteImg(profilePhoto) {
    let conn;
    try {
        conn = await pool.getConnection();
        // 데이터 업데이트 쿼리 작성
        const query = "DELETE FROM user "
            + "WHERE profilePhoto = ? "
        const result = await conn.query(query, [profilePhoto]);
        // 쿼리 실행
        console.log('Data updated successfully:', result);
    } catch (err) {
        console.error('Error updating data:', err);
    } finally {
        if (conn) conn.release(); // 연결 해제
    }
}
//유저가 소유한 포스터 가져오기
async function get_user_have_posts(user_pk) {
    let conn;
    try {
        conn = await pool.getConnection();
        const query = "SELECT * FROM user_have_post WHERE user_id = ?"
        const result = await conn.query(query, [user_pk]);
        //console.log(result);
        return result;
    } catch (err) {
        //console.error('Error updating data:', err);
    } finally {
        if (conn) conn.release(); // 연결 해제
    }
}

//책갈피 추가하기
async function add_book_mark(user_id, post_id) {
    let conn;
    try {
        conn = await pool.getConnection();
        const query = "INSERT INTO user_have_post (user_id, post_id) VALUES (?, ?)"
        const result = await conn.query(query, [user_id, post_id]);
        return true;
    } catch (err) {
        console.error('Error updating data:', err);
        return false;
    } finally {
        if (conn) conn.release(); // 연결 해제
    }
}

//책갈피 삭제하기
async function delete_book_mark(user_id, post_id) {
    let conn;
    try {
        conn = await pool.getConnection();
        const query = "DELETE FROM user_have_post WHERE user_id = ? AND post_id = ?"
        const result = await conn.query(query, [user_id, post_id]);
        return true;
    } catch (err) {
        console.error('Error updating data:', err);
        return false;
    } finally {
        if (conn) conn.release(); // 연결 해제
    }
}

//디테일 포스트의 정보를 서버에서 가져오는 함수
async function get_post_detail(post_id) {
    let conn;
    try {
        conn = await pool.getConnection();
        // 데이터 삽입 쿼리 작성
        const rows = await conn.query("SELECT "
            + "student.name AS student_name, department.name AS department_name,"
            + "post.date, post.title, "
            + "post.`contents`, post.`like`,"
            + "post.`view`, user.profilePhoto, post.post_id, post.user_id, post.url, post.sources, post.contest_check "
            + "FROM "
            + "student "
            + "LEFT JOIN "
            + "user ON student.student_id = user.student_id "
            + "LEFT JOIN "
            + "department ON department.department_id = student.department_id "
            + "LEFT JOIN post ON post.user_id = user.user_id "
            + "WHERE post.post_id = ?", post_id)
        //console.log(rows);
        return rows;
    } catch (err) {
        console.error('Error inserting data:', err);
    } finally {
        if (conn) conn.release(); // 연결 해제
    }
}

async function DetailPostPhoto(post_id) {
    let conn;
    try {
        conn = await pool.getConnection();
        const query = `
            SELECT * FROM post_photo WHERE post_id = ?    
        `;
        const rows = await conn.query(query, [post_id]);
        return rows;

    } catch (err) {
        console.error('Error inserting data:', err);
    } finally {
        if (conn) conn.release(); // 연결 해제
    }
}

//댓글 리스트 가져오기
async function getComment(post_ida) {
    let conn;
    try {
        conn = await pool.getConnection();
        // 데이터 삽입 쿼리 작성
        const query = `
            SELECT 
                comment.comment_id, comment.contents, comment.date, comment.\`like\`,
                student.name AS student_name, department.name AS department_name, 
                user.user_id, post.post_id, user.profilePhoto
            FROM 
                user
                LEFT JOIN student ON user.student_id = student.student_id
                LEFT JOIN department ON student.department_id = department.department_id
                LEFT JOIN comment ON comment.user_id = user.user_id
                LEFT JOIN post ON comment.post_id = post.post_id
            WHERE 
                post.post_id = ? ORDER BY comment.date DESC`;

        const rows = await conn.query(query, [post_ida]);
        return rows;

    } catch (err) {
        console.error('Error inserting data:', err);
    } finally {
        if (conn) conn.release(); // 연결 해제
    }
}

//대댓글 가져오기
async function getReComment(comment_id) {
    //console.log(comment_id);
    let conn;
    try {
        conn = await pool.getConnection();
        // 데이터 삽입 쿼리 작성
        const query = `
        SELECT 
        recomment.recomment_id, recomment.\`contents\`, recomment.date, recomment.\`like\`,
        student.name AS student_name, department.name AS department_name, comment.comment_id,user.user_id, user.profilePhoto
        FROM
        recomment
        LEFT JOIN
        comment ON recomment.comment_id = comment.comment_id
        LEFT JOIN
        user ON user.user_id = recomment.user_id
        LEFT JOIN
        student ON student.student_id = user.student_id
        LEFT JOIN
        department ON department.department_id = student.department_id
        WHERE comment.comment_id = ?;`;

        const rows = await conn.query(query, [comment_id]);
        return rows;

    } catch (err) {
        console.error('Error inserting data:', err);
    } finally {
        if (conn) conn.release(); // 연결 해제
    }
}

//학교의 정보 가져오기
async function get_campus_Info() {
    let conn;
    try {
        conn = await pool.getConnection();
        const query =
            `SELECT 
                department.department_id,
                department.name AS department_name, 
                campus.campus_id, 
                campus.name AS campus_name,
                campus_have_department.department_phone, 
                campus_have_department.department_floor, 
                campus_have_department.department_building
            FROM 
                campus_have_department
            JOIN 
                department ON campus_have_department.department_id = department.department_id
            JOIN 
                campus ON campus_have_department.campus_id = campus.campus_id;
        `;
        const result = await conn.query(query);
        return result;
    } catch (err) {
        console.error('Error updating data:', err);
    } finally {
        if (conn) conn.release(); // 연결 해제
    }
}

//학교 건물 정보 가져오기
async function get_campus_building_Info() {
    let conn;
    try {
        conn = await pool.getConnection();
        const query =
            `SELECT 
                campus.campus_id, 
                campus_building.building_name, 
                campus_building.campus_place, 
                campus_building.latitude,
                campus_building.longitude
            FROM 
                campus_building
            JOIN 
                campus ON campus_building.campus_id = campus.campus_id;
        `;
        const result = await conn.query(query);
        return result;
    } catch (err) {
        console.error('Error updating data:', err);
    } finally {
        if (conn) conn.release(); // 연결 해제
    }
}



async function updateUserImg(user_pk, photopath) {
    let conn;
    try {
        conn = await pool.getConnection();
        // 데이터 삽입 쿼리 작성
        const query = `UPDATE user
        SET profilePhoto = ?
        WHERE user_id = ?;`
        await conn.query(query, [photopath, user_pk]);
        console.log(`[StudentInfoScreen] : DB에 사진 저장 성공`);
    } catch (err) {
        console.log(`[StudentInfoScreen] : DB에 사진 저장 실패`);
    } finally {
        if (conn) conn.release(); // 연결 해제
    }
}

async function Get_One_Event_Item(item_name) {
    let conn;
    try {
        conn = await pool.getConnection();
        const query = (
            `SELECT *
            FROM event_object eo
            WHERE eo.object_id = (
                SELECT MIN(eo2.object_id)
                FROM event_object eo2
                WHERE eo2.name = ? AND eo2.sell_check = 0
            );`
        );
        const rows = await conn.query(query, [item_name]);
        return rows;
    } catch (err) {
        throw err;
    } finally {
        if (conn) conn.release();
    }
}


async function post_comment(post_id, user_id, contents) {
    let conn;
    try {
        conn = await pool.getConnection();
        const query = `INSERT INTO comment (post_id, user_id, contents, \`like\`)VALUES (?, ?, ?, DEFAULT);`
        await conn.query(query, [post_id, user_id, contents]);
        return true;
    } catch (err) {
        return false;
    } finally {
        if (conn) conn.release(); // 연결 해제
    }
}
//대댓글 달기
async function post_recomment(comment_id, user_id, contents) {
    let conn;
    try {
        conn = await pool.getConnection();
        const query = `INSERT INTO recomment (comment_id, user_id, contents, \`like\`)VALUES (?, ?, ?, DEFAULT);`
        await conn.query(query, [comment_id, user_id, contents]);
        return true;
    } catch (err) {
        return false;
    } finally {
        if (conn) conn.release(); // 연결 해제
    }
}

async function post_like_up(post_id) {
    let conn;
    try {
        conn = await pool.getConnection();
        const query = `UPDATE post
        SET \`like\` = \`like\` + 1
        WHERE post_id = ?`
        const result = await conn.query(query, [post_id]);
        return true;
    } catch (err) {
        console.error('Error updating data:', err);
        return false;
    } finally {
        if (conn) conn.release(); // 연결 해제
    }
}

async function post_like_down(post_id) {
    let conn;
    try {
        conn = await pool.getConnection();
        const query = `UPDATE post
        SET \`like\` = \`like\` - 1
        WHERE post_id = ?`
        const result = await conn.query(query, [post_id]);
        return true;
    } catch (err) {
        console.error('Error updating data:', err);
        return false;
    } finally {
        if (conn) conn.release(); // 연결 해제
    }
}

async function comment_like_up(comment_id) {
    let conn;
    try {
        conn = await pool.getConnection();
        const query = `UPDATE comment
        SET \`like\` = \`like\` + 1
        WHERE comment_id = ?`
        const result = await conn.query(query, [comment_id]);
        return true;
    } catch (err) {
        console.error('Error updating data:', err);
        return false;
    } finally {
        if (conn) conn.release(); // 연결 해제
    }
}

async function comment_like_num_down(comment_id) {
    let conn;
    try {
        conn = await pool.getConnection();
        const query = `UPDATE comment
        SET \`like\` = \`like\` - 1
        WHERE comment_id = ?`
        const result = await conn.query(query, [comment_id]);
        return true;
    } catch (err) {
        console.error('Error updating data:', err);
        return false;
    } finally {
        if (conn) conn.release(); // 연결 해제
    }
}


async function recomment_like_up(recomment_id) {
    let conn;
    try {
        conn = await pool.getConnection();
        const query = `UPDATE recomment
        SET \`like\` = \`like\` + 1
        WHERE recomment_id = ?`
        const result = await conn.query(query, [recomment_id]);
        return true;
    } catch (err) {
        console.error('Error updating data:', err);
        return false;
    } finally {
        if (conn) conn.release(); // 연결 해제
    }
}

async function recomment_like_num_down(recomment_id) {
    let conn;
    try {
        conn = await pool.getConnection();
        const query = `UPDATE recomment
        SET \`like\` = \`like\` - 1
        WHERE recomment_id = ?`
        const result = await conn.query(query, [recomment_id]);
        return true;
    } catch (err) {
        console.error('Error updating data:', err);
        return false;
    } finally {
        if (conn) conn.release(); // 연결 해제
    }
}

async function write_post(user_id, department_check, inform_check, contest_check, title, contents, url, sources, Club_check) {
    let conn;
    try {
        conn = await pool.getConnection();
        const query = `INSERT INTO post (user_id, department_check, inform_check, Club_check, contest_check, title, contents, view, \`like\`, url, sources)
        VALUES (?, ?, ?, ?, ?, ?, ?, DEFAULT, DEFAULT, ?, ?);`
        const result = await conn.query(query, [user_id, department_check, inform_check, Club_check, contest_check, title, contents, url, sources]);
        const postId = result.insertId.toString();
        return postId;
    } catch (err) {
        console.error(err);
        return false;
    } finally {
        if (conn) conn.release(); // 연결 해제
    }
}

//사진 등록 프로시저 작성 하고 넣어둘건데 일단 어떻게 만들었는지 보자
async function RegistorPostPhoto(post_id, post_photo) {
    let conn;
    try {
        conn = await pool.getConnection();
        const photosJson = JSON.stringify(post_photo);
        const query = `CALL RegisterPostPhoto(?, ?)`;
        await conn.query(query, [post_id, photosJson]);
    } catch (err) {
        console.error('Error inserting data:', err);
    } finally {
        if (conn) conn.release(); // 연결 해제
    }
}

async function update_post(post_id, department_check, contest_check, Club_check, url, sources, inform_check, title, contents) {
    let conn;
    try {
        conn = await pool.getConnection();
        const query = `
        UPDATE 
            post
        SET 
            inform_check = ?,
            department_check = ?,
            contest_check = ?,
            Club_check = ?,
            title = ?,
            contents = ?,
            url = ?,
            sources =?
        WHERE
            post_id = ?`
        const result = await conn.query(query, [inform_check, department_check, contest_check, Club_check, title, contents, url, sources, post_id]);
        const postId = result.insertId.toString(); // Retrieve the inserted post's ID
        return postId;
    } catch (err) {
        console.error(err);
        return false;
    } finally {
        if (conn) conn.release(); // 연결 해제
    }
}

async function view_count_up(post_id) {
    let conn;
    try {
        conn = await pool.getConnection();
        const query = `UPDATE post
        SET view = view + 1
        WHERE post_id = ?`
        const result = await conn.query(query, [post_id]);
        return true;
    } catch (err) {
        console.error('Error updating data:', err);
        return false;
    } finally {
        if (conn) conn.release(); // 연결 해제
    }
}

async function post_comment(post_id, user_id, contents) {
    let conn;
    try {
        conn = await pool.getConnection();
        const query = `INSERT INTO comment (post_id, user_id, contents, \`like\`)VALUES (?, ?, ?, DEFAULT);`
        await conn.query(query, [post_id, user_id, contents]);
        console.log("댓글달기 성공!");
        return true;
    } catch (err) {
        console.error('댓글달기 실패!:', err);
        return false;
    } finally {
        if (conn) conn.release(); // 연결 해제
    }
}
//대댓글 달기
async function post_recomment(comment_id, user_id, contents) {
    let conn;
    try {
        conn = await pool.getConnection();
        const query = `INSERT INTO recomment (comment_id, user_id, contents, \`like\`)VALUES (?, ?, ?, DEFAULT);`
        await conn.query(query, [comment_id, user_id, contents]);
        return true;
    } catch (err) {
        console.error('대댓글달기 실패!:', err);
        return false;
    } finally {
        if (conn) conn.release(); // 연결 해제
    }
}

async function post_like_up(post_id) {
    let conn;
    try {
        conn = await pool.getConnection();
        const query = `UPDATE post
        SET \`like\` = \`like\` + 1
        WHERE post_id = ?`
        const result = await conn.query(query, [post_id]);
        return true;
    } catch (err) {
        console.error('Error updating data:', err);
        return false;
    } finally {
        if (conn) conn.release(); // 연결 해제
    }
}

async function comment_like_up(comment_id) {
    let conn;
    try {
        conn = await pool.getConnection();
        const query = `UPDATE comment
        SET \`like\` = \`like\` + 1
        WHERE comment_id = ?`
        await conn.query(query, [comment_id]);
        return true;
    } catch (err) {
        console.error('Error updating data:', err);
        return false;
    } finally {
        if (conn) conn.release(); // 연결 해제
    }
}


async function recomment_like_up(recomment_id) {
    let conn;
    try {
        conn = await pool.getConnection();
        const query = `UPDATE recomment
        SET \`like\` = \`like\` + 1
        WHERE recomment_id = ?`
        const result = await conn.query(query, [recomment_id]);
        return true;
    } catch (err) {
        console.error('Error updating data:', err);
        return false;
    } finally {
        if (conn) conn.release(); // 연결 해제
    }
}


//학과 게시판에서 전체 게시글을 가져오는 쿼리
async function searchPost(search_text) {
    let conn;
    try {
        conn = await pool.getConnection();
        const rows = await conn.query(
            "SELECT post.post_id, post.title, post.contents, post.date, post.view, post.`like`, post.department_check, post.inform_check, student.name, user.title AS user_title, post.contest_check, post.Club_check, post.url, post.sources " +
            "FROM post " +
            "LEFT JOIN user ON post.user_id = user.user_id " +
            "LEFT JOIN student ON user.student_id = student.student_id " +
            "WHERE post.contents LIKE ? OR post.title LIKE ? " +
            "ORDER BY post.date DESC;",
            [`%${search_text}%`, `%${search_text}%`]
        );
        return rows;
    } catch (err) {
        console.log(err)
        throw err;
    } finally {
        if (conn) conn.release();
    }
}

async function view_count_up(post_id) {
    let conn;
    try {
        conn = await pool.getConnection();
        const query = `UPDATE post
        SET view = view + 1
        WHERE post_id = ?`
        const result = await conn.query(query, [post_id]);
        return true;
    } catch (err) {
        console.error('Error updating data:', err);
        return false;
    } finally {
        if (conn) conn.release(); // 연결 해제
    }
}

//로그인할때(유저 PK값 가져오기)
async function getyourpoint(user_id) {
    let conn;
    try {
        conn = await pool.getConnection();
        // 데이터 삽입 쿼리 작성
        const rows = await conn.query(
            'SELECT user.point FROM user WHERE user_id = ?', [user_id]);
        //console.log(rows);
        return rows;
    } catch (err) {
        console.error('Error inserting data:', err);
    } finally {
        if (conn) conn.release(); // 연결 해제
    }
}

async function update_user_point(user_pk, price) {
    let conn;
    try {
        conn = await pool.getConnection();
        const query = 'UPDATE user SET point = point - ? WHERE user_id = ?'
        const result = await conn.query(query, [price, user_pk]);
        return true;
    } catch (err) {
        console.error('Error updating data:', err);
        return false;
    } finally {
        if (conn) conn.release(); // 연결 해제
    }
}

async function update_object(object_pk) {
    let conn;
    try {
        conn = await pool.getConnection();
        const query = `UPDATE event_object
        SET sell_check = 1
        WHERE object_id = ?`
        const result = await conn.query(query, [object_pk]);
        return true;
    } catch (err) {
        console.error('Error updating data:', err);
        return false;
    } finally {
        if (conn) conn.release(); // 연결 해제
    }
}

async function insert_user_have_object(user_id, object_id) {
    let conn;
    try {
        conn = await pool.getConnection();
        const query = `INSERT INTO student_have_object (user_id, object_id, using_check, using_date)
        VALUES (?, ?, 0, DEFAULT);`
        await conn.query(query, [user_id, object_id]);
        return true;
    } catch (err) {
        console.error(err);
        return false;
    } finally {
        if (conn) conn.release(); // 연결 해제
    }
}

async function getUserHaveCoupon(user_id) {
    let conn;
    try {
        conn = await pool.getConnection();
        const query = (
            `SELECT 
            eo.object_id,
            eo.name,
            eo.price,
            eo.code_num,
            eo.using_time,
            eo.image_num,
            eo.sell_check,
            eo.explain,
            sho.buy_date,
            sho.using_check,
            sho.using_date
        FROM 
            event_object eo
        JOIN 
            student_have_object sho ON eo.object_id = sho.object_id
        WHERE 
            sho.user_id = ?`
        );
        const rows = await conn.query(query, [user_id]);
        return rows;
    } catch (err) {
        throw err;
    } finally {
        if (conn) conn.release();
    }
}

//학교 pk값을 통해 캠퍼스이름 스터디룸이름 가져오기
async function getCampus(campus_id) {
    let conn;
    try {
        conn = await pool.getConnection();
        const query = `
            SELECT study_room.study_room_id, study_room.study_room_name, study_room.campus_place, study_room.image
            FROM study_room
            JOIN campus ON study_room.campus_id = campus.campus_id
            WHERE study_room.campus_id = ?
        `;
        const rows = await conn.query(query, [campus_id]);
        //console.log(rows);
        return rows;
    } catch (err) {
        console.error('Error fetching data:', err);
    } finally {
        if (conn) conn.release(); // 연결 해제
    }
}

async function insert_student_study_room(student, study_room, study_room_date, study_room_time) {
    let conn;
    try {
        conn = await pool.getConnection();
        const query = `INSERT INTO study_room_have_object (student, study_room, study_room_date, study_room_time)
        VALUES (?, ?, ?, ?);`
        await conn.query(query, [student, study_room, study_room_date, study_room_time]);
        return true;
    } catch (err) {
        console.error(err);
        return false;
    } finally {
        if (conn) conn.release(); // 연결 해제
    }
}

async function get_student_study_room(student) {
    let conn;
    try {
        conn = await pool.getConnection();
        const query = `
        SELECT
            study_room_have_object.student,
            study_room.study_room_name,
            study_room.image,
            study_room_have_object.study_room_date,
            study_room_have_object.study_room_time
        FROM
            study_room_have_object
            INNER JOIN study_room ON study_room_have_object.study_room = study_room.study_room_id
        WHERE
            study_room_have_object.student = ?;
        `;
        const rows = await conn.query(query, [student]);
        return rows;
    } catch (err) {
        console.error(err);
        return false;
    } finally {
        if (conn) conn.release(); // 연결 해제
    }
}

async function get_studyroom_date() {
    let conn;
    try {
        conn = await pool.getConnection();
        const query = `SELECT study_room.study_room_name, study_room_have_object.study_room_date, study_room_have_object.study_room_time
        FROM study_room_have_object
        JOIN study_room ON study_room_have_object.study_room = study_room.study_room_id;`
        const rows = await conn.query(query);
        return rows;
    } catch (err) {
        console.error(err);
        return false;
    } finally {
        if (conn) conn.release(); // 연결 해제
    }
}

// 알람 전체 이리내
async function get_aram_data(user_id) {
    let conn;
    try {
        conn = await pool.getConnection();
        const query = (
            `SELECT 
            aram.aram_id,
            aram.user_id,
            aram.target_id,
            aram.title,
            aram.target_type,
            aram.time,
            post_comment.post_id AS post_comment_id,
            post_comment.title AS post_comment_title,
            hot_post.post_id AS hot_post_id,
            hot_post.title AS hot_post_title,
            school_notice.post_id AS school_notice_id,
            school_notice.title AS school_notice_title,
            department_notice.post_id AS department_notice_id,
            department_notice.title AS department_notice_title,
            my_post_like.post_id AS my_post_like_id,
            my_post_like.title AS my_post_like_title,
            new_event.event_id AS new_event_id,
            new_event.name AS new_event_name,
            friend_code.friend_code_id AS friend_code_id,
            friend_code.my_name AS friend_code_my_name,
            report_post.post_id AS report_post_id,
            report_post.title AS report_post_title,
            report_comment.post_id AS report_comment_id,
            report_comment.title AS report_comment_title,
            good_event.event_id AS good_event_id,
            good_event.name AS good_event_name,
            my_comment_like.post_id AS comment_post_id,
            my_comment_like.contents AS comment_contents,
            my_comment_like.comment_id AS comment_comment_id,
            my_recomment_like.recomment_id AS recomment_recomment_id,
            my_recomment_like.comment_id AS recomment_comment_id,
            my_recomment_like.contents AS recomment_contents,
            my_club_register.Post_fk AS my_club_register_post_id,
            my_club_register.comment AS my_club_register_comment,
            delete_post_info.post_id AS delete_post_id,
            delete_post_info.reason AS delete_post_reason,
            delete_post_info.title AS delete_post_title,
            student.name AS student_name
        FROM
            aram
        LEFT JOIN
            post AS post_comment ON aram.target_type = 'my_post_comment' AND aram.target_id = post_comment.post_id
        LEFT JOIN
            post AS hot_post ON aram.target_type = 'hot_post' AND aram.target_id = hot_post.post_id
        LEFT JOIN
            post AS school_notice ON aram.target_type = 'school_notice' AND aram.target_id = school_notice.post_id
        LEFT JOIN
            post AS department_notice ON aram.target_type = 'department_notice' AND aram.target_id = department_notice.post_id
        LEFT JOIN
            post AS my_post_like ON aram.target_type = 'my_post_like' AND aram.target_id = my_post_like.post_id
        LEFT JOIN
            event AS new_event ON aram.target_type = 'new_event' AND aram.target_id = new_event.event_id
        LEFT JOIN
            user_friend_code AS friend_code ON aram.target_type = 'friend_code' AND aram.target_id = friend_code.friend_code_id
        LEFT JOIN
        		post AS report_post ON aram.target_type = 'report_post' AND aram.target_id = report_post.post_id
        LEFT JOIN
        		post AS report_comment ON aram.target_type = 'report_comment' AND aram.target_id = report_comment.post_id
        LEFT JOIN 
             EVENT AS good_event ON aram.target_type = 'good_event' AND aram.target_id = good_event.event_id
        LEFT JOIN
             comment AS my_comment_like ON aram.target_type = 'my_comment_like' AND aram.target_id = my_comment_like.comment_id
        LEFT JOIN
             recomment AS my_recomment_like ON aram.target_type = 'my_recomment_like' AND aram.target_id = my_recomment_like.recomment_id
        LEFT JOIN
    		 user ON aram.user_id = user.user_id  
		LEFT JOIN
             student ON user.student_id = student.student_id
        LEFT JOIN
        	 club_register AS my_club_register ON aram.target_type = 'school_club' AND aram.target_id = my_club_register.Post_fk
             AND student.name = my_club_register.Name
        LEFT JOIN
             delete_post_info AS delete_post_info ON aram.target_type = 'report_delete' AND aram.target_id = delete_post_info.post_id
        WHERE
            aram.user_id = ?
        ORDER BY
            aram.time DESC;`
        );
        const rows = await conn.query(query, [user_id]);
        return rows;
    } catch (err) {
        throw err;
    } finally {
        if (conn) conn.release();
    }
}

//전체 게시판에서 전체 게시글을 가져오는 쿼리
async function get_one_post(post_id) {
    let conn;
    try {
        conn = await pool.getConnection();
        const query = (
            "SELECT post.post_id, post.title, post.contents, post.date, post.view, post.`like`, student.name, user.admin_check "
            + "FROM "
            + "post "
            + "LEFT JOIN "
            + "user "
            + "ON post.user_id = user.user_id "
            + "LEFT JOIN "
            + "student "
            + "ON user.student_id = student.student_id "
            + "WHERE "
            + "post.post_id = ?"
        );
        const rows = await conn.query(query, [post_id]);
        return rows;
    } catch (err) {
        throw err;
    } finally {
        if (conn) conn.release();
    }
}

async function addCommentAram(user_id, target_id) {
    let conn;
    try {
        conn = await pool.getConnection();
        const query = `INSERT INTO aram (user_id, target_id, title, target_type) VALUES (?, ?, "게시물에 답글이 달렸습니다!", "my_post_comment");`
        await conn.query(query, [user_id, target_id]);
        return true;
    } catch (err) {
        console.error(err);
        return false;
    } finally {
        if (conn) conn.release(); // 연결 해제
    }
}

async function addGoodEventAram(user_id, target_id) {
    let conn;
    try {
        conn = await pool.getConnection();
        const query = `INSERT INTO aram (user_id, target_id, title, target_type) VALUES (?, ?, "이벤트에 당첨되셨습니다 축하드립니다!", "good_event");`
        await conn.query(query, [user_id, target_id]);

        return true;
    } catch (err) {
        console.error(err);
        return false;
    } finally {
        if (conn) conn.release(); // 연결 해제
    }
}

async function addHotAram(target_id) {
    let conn;
    try {
        conn = await pool.getConnection();
        const query = `CALL SendEventNotification(?, '오늘의 HOT 게시물입니다!', 'hot_post');`
        await conn.query(query, [target_id]);
        return true;
    } catch (err) {
        console.error(err);
        return false;
    } finally {
        if (conn) conn.release(); // 연결 해제
    }
}

async function reportPostAram(target_id) {
    let conn;
    try {
        conn = await pool.getConnection();
        const query = `CALL InsertIntoAramForAdminUsers(?, '게시물 신고 요청이 들어왔습니다!', 'report_post');`
        await conn.query(query, [target_id]);
        return true;
    } catch (err) {
        console.error(err);
        return false;
    } finally {
        if (conn) conn.release(); // 연결 해제
    }
}

async function reportCommentAram(target_id) {
    let conn;
    try {
        conn = await pool.getConnection();
        const query = `CALL InsertIntoAramForAdminUsers(?, '댓글 신고 요청이 들어왔습니다!', 'report_comment');`
        await conn.query(query, [target_id]);
        return true;
    } catch (err) {
        console.error(err);
        return false;
    } finally {
        if (conn) conn.release(); // 연결 해제
    }
}

async function addSchoolNoticeAram(target_id) {
    let conn;
    try {
        conn = await pool.getConnection();
        const query = `CALL SendEventNotification(?, '학교 공지사항 글이 등록되었습니다!', 'school_notice');`
        await conn.query(query, [target_id]);

        return true;
    } catch (err) {
        console.error(err);
        return false;
    } finally {
        if (conn) conn.release(); // 연결 해제
    }
}

async function addDepartmentNoticeAram(target_id) {
    let conn;
    try {
        conn = await pool.getConnection();
        const query = `CALL SendEventNotification(?, '학과 공지사항 글이 등록되었습니다!', 'department_notice');`
        await conn.query(query, [target_id]);

        return true;
    } catch (err) {
        console.error(err);
        return false;
    } finally {
        if (conn) conn.release(); // 연결 해제
    }
}

async function addNewEventAram(target_id) {
    let conn;
    try {
        conn = await pool.getConnection();
        const query = `CALL SendEventNotification(?, '새로운 이벤트가 등록되었습니다!', 'new_event');`
        await conn.query(query, [target_id]);
        return true;
    } catch (err) {
        console.error(err);
        return false;
    } finally {
        if (conn) conn.release(); // 연결 해제
    }
}

async function allUser_id() {
    let conn;
    try {
        conn = await pool.getConnection();
        const userIds = await conn.query('SELECT user_id FROM user WHERE admin_check != 1');
        return userIds
    } catch (err) {
        console.error(err);
    } finally {
        if (conn) conn.release();
    }
}

async function addLikeAram(user_id, target_id) {
    let conn;
    try {
        conn = await pool.getConnection();
        const query = `INSERT INTO aram (user_id, target_id, title, target_type) VALUES (?, ?, "내 게시물에 좋아요를 눌러줬습니다!", "my_post_like");`
        await conn.query(query, [user_id, target_id]);
        return true;
    } catch (err) {
        console.error(err);
        return false;
    } finally {
        if (conn) conn.release(); // 연결 해제
    }
}

async function addCommentLikeAram(user_id, target_id) {
    let conn;
    try {
        conn = await pool.getConnection();
        const query = `INSERT INTO aram (user_id, target_id, title, target_type) VALUES (?, ?, "내 댓글에 좋아요를 눌러줬습니다!", "my_comment_like");`
        await conn.query(query, [user_id, target_id]);
        return true;
    } catch (err) {
        console.error(err);
        return false;
    } finally {
        if (conn) conn.release(); // 연결 해제
    }
}

async function addRecommentLikeAram(user_id, target_id) {
    let conn;
    try {
        conn = await pool.getConnection();
        const query = `INSERT INTO aram (user_id, target_id, title, target_type) VALUES (?, ?, "내 대댓글에 좋아요를 눌러줬습니다!", "my_recomment_like");`
        await conn.query(query, [user_id, target_id]);
        return true;
    } catch (err) {
        console.error(err);
        return false;
    } finally {
        if (conn) conn.release(); // 연결 해제
    }
}

async function getAppAttendanceDate(user_id) {
    let conn;
    try {
        conn = await pool.getConnection();
        const query = (
            `SELECT * FROM app_attendance WHERE user_id = ?`
        );
        const rows = await conn.query(query, [user_id]);
        return rows;
    } catch (err) {
        throw err;
    } finally {
        if (conn) conn.release();
    }
}

async function addAppAttendanceDate(user_id, date) {
    let conn;
    try {
        conn = await pool.getConnection();
        const query = (
            `INSERT INTO app_attendance (user_id, date, attendance_check) VALUES (?, ?, 1);`
        );
        const rows = await conn.query(query, [user_id, date]);
        return rows;
    } catch (err) {
        throw err;
    } finally {
        if (conn) conn.release();
    }
}


async function update_user_point_2(user_id, point) {
    let conn;
    try {
        conn = await pool.getConnection();
        const query = 'UPDATE user SET point = point + ? WHERE user_id = ?'
        const result = await conn.query(query, [point, user_id]);
    } catch (err) {
        throw err;
    } finally {
        if (conn) conn.release();
    }
}

async function get_invite_num(friend_code) {
    let conn;
    try {
        conn = await pool.getConnection();
        const query = (
            `SELECT * FROM user_friend_code friend_code WHERE friend_code = ?`
        );
        const rows = await conn.query(query, [friend_code]);
        return rows;
    } catch (err) {
        throw err;
    } finally {
        if (conn) conn.release();
    }
}

async function allUser_friend_code(user_id) {
    let conn;
    try {
        conn = await pool.getConnection();
        const query = (
            'SELECT friend_code FROM user_friend_code WHERE user_id = ?'
        );
        const user_friend_code = await conn.query(query, [user_id]);
        return user_friend_code
    } catch (err) {
        console.error(err);
    } finally {
        if (conn) conn.release();
    }
}

async function addFriend_Code(user_id, friend_code, user_name) {
    let conn;
    try {
        conn = await pool.getConnection();
        const query = (
            `INSERT INTO user_friend_code (user_id, friend_code, my_name) VALUES (?, ?, ?);`
        );
        const rows = await conn.query(query, [user_id, friend_code, user_name]);
        return true;
    } catch (err) {
        throw err;
    } finally {
        if (conn) conn.release();
    }
}

async function Friend_code_User_id(friend_code) {
    let conn;
    try {
        conn = await pool.getConnection();
        const query = (
            `SELECT user_id FROM user WHERE friend_code = ?`
        );
        const rows = await conn.query(query, [friend_code]);
        return rows
    } catch (err) {
        throw err;
    } finally {
        if (conn) conn.release();
    }
}

async function allUser_Friend_code2() {
    let conn;
    try {
        conn = await pool.getConnection();
        const userallfriendcode = await conn.query('SELECT friend_code FROM user');
        return userallfriendcode
    } catch (err) {
        console.error(err);
    } finally {
        if (conn) conn.release();
    }
}

async function last_friendCode_Info(user_pk) {
    let conn;
    try {
        conn = await pool.getConnection();
        const query = (
            `SELECT * FROM user_friend_code WHERE user_id = ?`
        );
        const rows = await conn.query(query, [user_pk]);
        const lastRow = rows[rows.length - 1];
        return lastRow;
    } catch (err) {
        throw err;
    } finally {
        if (conn) conn.release();
    }
}

async function addFriendCodeAram(user_pk, friend_code_id, my_name) {
    let conn;
    try {
        conn = await pool.getConnection();
        const query = `INSERT INTO aram (user_id, target_id, title, target_type) VALUES (?, ?, "친구가 초대코드를 입력하셨니다!", "friend_code");`
        await conn.query(query, [user_pk, friend_code_id, my_name]);
        return true;
    } catch (err) {
        console.error(err);
        return false;
    } finally {
        if (conn) conn.release(); // 연결 해제
    }
}

async function user_update_point_3(user_id, point) {
    let conn;
    try {
        conn = await pool.getConnection();
        const query = 'UPDATE user SET point = point + ? WHERE user_id = ?'
        const result = await conn.query(query, [point, user_id]);
    } catch (err) {
        throw err;
    } finally {
        if (conn) conn.release();
    }
}

//메인화면에서 이벤트 데이터 전부 불러와
async function Get_Event_Data(campus_id) {
    let conn;
    try {
        conn = await pool.getConnection();
        const query = (
            `SELECT * FROM event WHERE EVENT.campus_id = ?`
        );
        const row = await conn.query(query, [campus_id]);
        return row;
    } catch (err) {
        throw err;
    } finally {
        if (conn) conn.release();
    }
}

//메인화면에서 이벤트 데이터 전부 불러와
async function Get_One_Event_Data(event_id) {
    let conn;
    try {
        conn = await pool.getConnection();
        const query = (
            `SELECT * FROM event WHERE event_id = ?`
        );
        const row = await conn.query(query, [event_id]);
        return row;
    } catch (err) {
        throw err;
    } finally {
        if (conn) conn.release();
    }
}

//메인화면에서 이벤트 사진
async function Get_Event_Photos(event_id) {
    let conn;
    try {
        conn = await pool.getConnection();
        const query = (
            `SELECT event_photo.event_photo FROM event_photo WHERE event_photo.event_id = ?`
        );
        const row = await conn.query(query, [event_id]);
        console.log(row);
        return row;
    } catch (err) {
        throw err;
    } finally {
        if (conn) conn.release();
    }
}

async function send_user_event_info(user_id, event_id, content) {
    let conn;
    try {
        conn = await pool.getConnection();
        const query = `INSERT INTO user_send_event (user_id, event_id, time, content, good_event) VALUES (?, ?, DEFAULT, ?, 0);`
        await conn.query(query, [user_id, event_id, content]);
        return true;
    } catch (err) {
        console.error(err);
        return false;
    } finally {
        if (conn) conn.release(); // 연결 해제
    }
}

async function select_user_event_info() {
    let conn;
    try {
        conn = await pool.getConnection();
        const query = `
            SELECT user_send_event.user_id, user_send_event.event_id, user_send_event.user_send_event FROM user_send_event
        `;
        const row = await conn.query(query);
        return row;
    } catch (err) {
        throw err;
    } finally {
        if (conn) conn.release();
    }
}

async function user_send_photo(user_id, event_id, fileNameWithoutExtension) {
    let conn;
    try {
        conn = await pool.getConnection();
        const query = `INSERT INTO user_send_event_photo (event_id, user_id, event_photo) VALUES (?, ?, ?);`
        await conn.query(query, [event_id, user_id, fileNameWithoutExtension]);
    } catch (err) {
        console.error('Error inserting data:', err);
    } finally {
        if (conn) conn.release(); // 연결 해제
    }
}

//스터디룸 삭제
async function delete_studyroom(student, study_room_name, study_room_date, study_room_time) {
    let conn;
    try {
        conn = await pool.getConnection();
        const query = `
            DELETE FROM study_room_have_object 
            WHERE student = ? 
            AND study_room = (
                SELECT study_room_id FROM study_room WHERE study_room_name = ? LIMIT 1
            )
            AND study_room_date = ? 
            AND study_room_time = ?;
        `;
        const result = await conn.query(query, [student, study_room_name, study_room_date, study_room_time]);
        return true;
    } catch (err) {
        console.error('Error deleting data:', err);
        return false;
    } finally {
        if (conn) conn.release(); // 연결 해제
    }
}

async function deleteMyPostData(post_id) {
    let conn;
    try {
        conn = await pool.getConnection();
        const query = "DELETE FROM post WHERE post_id = ?"
        const result = await conn.query(query, [post_id]);
        return true;
    } catch (err) {
        console.error('Error updating data:', err);
        return false;
    } finally {
        if (conn) conn.release(); // 연결 해제
    }
}

async function deleteMyaram(aram_id) {
    let conn;
    try {
        conn = await pool.getConnection();
        const query = "DELETE FROM aram WHERE aram_id = ?"
        const result = await conn.query(query, [aram_id]);
        return true;
    } catch (err) {
        console.error('Error updating data:', err);
        return false;
    } finally {
        if (conn) conn.release(); // 연결 해제
    }
}

//유저가 해당 포스터에 좋아요를 눌렀는지 확인
async function is_user_post_like(user_id, post_id) {
    let conn;
    try {
        conn = await pool.getConnection();
        const query = (
            `SELECT * FROM is_user_post_like WHERE post_id = ? AND user_id = ?`
        );
        const row = await conn.query(query, [post_id, user_id]);
        return row.length === 0; // row가 비어 있으면 true, 비어 있지 않으면 false
    } catch (err) {
        throw err;
    } finally {
        if (conn) conn.release();
    }
}

//유저가 해당 댓글에 좋아요를 눌렀는지 확인
async function is_user_comment_like(user_id, comment_id) {
    let conn;
    try {
        conn = await pool.getConnection();
        const query = (
            `SELECT * FROM is_user_comment_like WHERE comment_id = ? AND user_id = ?`
        );
        const row = await conn.query(query, [comment_id, user_id]);
        return row.length === 0; // row가 비어 있으면 true, 비어 있지 않으면 false
    } catch (err) {
        throw err;
    } finally {
        if (conn) conn.release();
    }
}

//유저가 해당 대댓글에 좋아요를 눌렀는지 확인
async function is_user_recomment_like(user_id, recomment_id) {
    let conn;
    try {
        conn = await pool.getConnection();
        const query = (
            `SELECT * FROM is_user_recomment_like WHERE recomment_id = ? AND user_id = ?`
        );
        const row = await conn.query(query, [recomment_id, user_id]);
        return row.length === 0; // row가 비어 있으면 true, 비어 있지 않으면 false
    } catch (err) {
        throw err;
    } finally {
        if (conn) conn.release();
    }
}


async function put_user_post_like(user_id, post_id) {
    let conn;
    try {
        conn = await pool.getConnection();
        const query = `INSERT INTO is_user_post_like (user_id, post_id) VALUES (?, ?);`
        await conn.query(query, [user_id, post_id]);
        //console.log("값 넣기 성공");
    } catch (err) {
        console.error('Error inserting data:', err);
    } finally {
        if (conn) conn.release(); // 연결 해제
    }
}

async function put_user_comment_like(user_id, comment_id) {
    let conn;
    try {
        conn = await pool.getConnection();
        const query = `INSERT INTO is_user_comment_like (user_id, comment_id) VALUES (?, ?);`
        await conn.query(query, [user_id, comment_id]);
    } catch (err) {
        console.error('Error inserting data:', err);
    } finally {
        if (conn) conn.release(); // 연결 해제
    }
}

async function put_user_recomment_like(user_id, recomment_id) {
    let conn;
    try {
        conn = await pool.getConnection();
        const query = `INSERT INTO is_user_recomment_like (user_id, recomment_id) VALUES (?, ?);`
        await conn.query(query, [user_id, recomment_id]);
    } catch (err) {
        console.error('Error inserting data:', err);
    } finally {
        if (conn) conn.release(); // 연결 해제
    }
}

async function put_user_report(post_id, report_name) {
    let conn;
    try {
        conn = await pool.getConnection();
        const query = `INSERT INTO report (post_id, report_name) VALUES (?, ?);`
        await conn.query(query, [post_id, report_name]);
    } catch (err) {
        console.error('Error inserting data:', err);
    } finally {
        if (conn) conn.release(); // 연결 해제
    }
}

async function get_user_report() {
    let conn;
    try {
        conn = await pool.getConnection();
        const query = `SELECT report.report_id, report.post_id, report.report_name, user.user_id
                        FROM report
                        JOIN post ON report.post_id = post.post_id
                        JOIN user ON post.user_id = user.user_id;`;
        const rows = await conn.query(query);
        return rows; // 쿼리 결과 반환

    } catch (err) {
        console.error('Error querying data:', err);
        throw err; // 에러 처리
    } finally {
        if (conn) conn.release(); // 연결 해제
    }
}

async function put_user_comment_report(comment_id, report_comment_name) {
    let conn;
    try {
        conn = await pool.getConnection();
        const query = `INSERT INTO report_comment (comment_id, report_comment_name) VALUES (?, ?);`
        await conn.query(query, [comment_id, report_comment_name]);
    } catch (err) {
        console.error('Error inserting data:', err);
    } finally {
        if (conn) conn.release(); // 연결 해제
    }
}

async function get_user_comment_report() {
    let conn;
    try {
        conn = await pool.getConnection();
        const query = `SELECT report_comment.report_comment_id, report_comment.comment_id, report_comment.report_comment_name
                        FROM report_comment
                        JOIN comment ON report_comment.comment_id = comment.comment_id`;
        const rows = await conn.query(query);
        return rows;
    } catch (err) {
        console.error('Error querying data:', err);
        throw err; // 에러 처리
    } finally {
        if (conn) conn.release(); // 연결 해제
    }
}

async function get_user_report_Info() {
    let conn;
    try {
        conn = await pool.getConnection();
        const query = `
            SELECT 
                r.report_id,
                r.report_name,
                p.post_id,
                p.user_id AS post_user_id,
                p.department_check,
                p.title AS post_title,
                p.contents,
                p.date,
                p.view,
                p.like,
                u.user_id AS user_user_id,
                u.student_id AS user_student_id,
                u.title AS user_title,
                u.profilePhoto,
                s.student_id AS student_student_id,
                s.campus_id AS student_campus_id,
                s.department_id AS student_department_id,
                s.name AS student_name,
                c.campus_id AS campus_campus_id,
                c.name AS campus_name,
                d.department_id AS department_department_id,
                d.name AS department_name
            FROM 
                report r
            JOIN 
                post p ON r.post_id = p.post_id
            JOIN 
                user u ON p.user_id = u.user_id
            JOIN 
                student s ON u.student_id = s.student_id
            JOIN 
                campus c ON s.campus_id = c.campus_id
            JOIN 
                department d ON s.department_id = d.department_id;
        `;
        const rows = await conn.query(query);
        return rows; // 쿼리 결과 반환
    } catch (err) {
        console.error('Error querying data:', err);
        throw err; // 에러 처리
    } finally {
        if (conn) conn.release(); // 연결 해제
    }
}

async function delete_post(post_id) {
    let conn;
    try {
        conn = await pool.getConnection();
        const query = "DELETE FROM post WHERE post_id=?;"
        const result = await conn.query(query, [post_id]);
        return true;
    } catch (err) {
        console.error('Error updating data:', err);
        return false;
    } finally {
        if (conn) conn.release(); // 연결 해제
    }
}


async function RegistorItem(campus_id, name, price, using_time, image_num, explian, count) {
    let conn;
    try {
        conn = await pool.getConnection();
        const query = `CALL example_while(?, ?, ?, ?, ?, ?, ?);`
        await conn.query(query, [campus_id, name, price, using_time, image_num, explian, count]);
    } catch (err) {
        console.error('Error inserting data:', err);
    } finally {
        if (conn) conn.release(); // 연결 해제
    }
}

//수량은 변화하지 않고 DB의 아이템 정보만 변경한다.
async function ChangeItemInfo(origin_name, name, price, using_time, image_num, explian) {
    let conn;
    try {
        conn = await pool.getConnection();
        const query =
            `UPDATE event_object
         SET name = ?, 
             price = ?,
             using_time = ?,
             image_num = ?,
             \`explain\` = ? 
         WHERE name = ? `
        await conn.query(query, [name, price, using_time, image_num, explian, origin_name]);
        console.log("값 넣기 성공");
    } catch (err) {
        console.error('Error inserting data:', err);
    } finally {
        if (conn) conn.release(); // 연결 해제
    }
}

async function ChangeItemInfoANDCountUp(origin_name, campus_id, name, price, using_time, image_num, explian, count) {
    let conn;
    try {
        conn = await pool.getConnection();
        const query = `CALL Change_AND_Insert_Item(?, ?, ?, ?, ?, ?, ?, ?);`
        await conn.query(query, [origin_name, campus_id, name, price, using_time, image_num, explian, count]);
    } catch (err) {
        console.error('Error inserting data:', err);
    } finally {
        if (conn) conn.release(); // 연결 해제
    }
}

//수량이 감소하고 DB의 아이템 정보를 변경한다.
async function ChangeItemInfoANDCountDown(origin_name, campus_id, name, price, using_time, image_num, explian, count) {
    let conn;
    try {
        conn = await pool.getConnection();
        const query = `CALL Change_And_Delete_Items(?, ?, ?, ?, ?, ?, ?, ?);`
        await conn.query(query, [origin_name, campus_id, name, price, using_time, image_num, explian, count]);
    } catch (err) {
        console.error('Error inserting data:', err);
    } finally {
        if (conn) conn.release(); // 연결 해제
    }
}

//현재 남은 제고의 아이템 수를 얻기위함
async function getRestItemCount(campus_id, name) {
    let conn;
    try {
        conn = await pool.getConnection();
        const rows = await conn.query(
            `SELECT * FROM event_object WHERE campus_id = ? AND name = ? AND sell_check = 0`
            , [campus_id, name]);
        return rows;

    } catch (err) {
        throw err;
    } finally {
        if (conn) conn.release();
    }
}

//현재 팔린 제고의 수량을 파악하기 위함
async function getSellItemCount(campus_id, name) {
    let conn;
    try {
        conn = await pool.getConnection();
        const rows = await conn.query(
            `SELECT * FROM event_object WHERE campus_id = ? AND name = ? AND sell_check = 1`
            , [campus_id, name]);
        return rows;

    } catch (err) {
        throw err;
    } finally {
        if (conn) conn.release();
    }
}

async function delete_comment(comment_id) {
    let conn;
    try {
        conn = await pool.getConnection();
        const query = "DELETE FROM comment WHERE comment_id=?;"
        const result = await conn.query(query, [comment_id]);
        return true;
    } catch (err) {
        console.error('Error updating data:', err);
        return false;
    } finally {
        if (conn) conn.release(); // 연결 해제
    }
}

async function delete_recomment(recomment_id) {
    let conn;
    try {
        conn = await pool.getConnection();
        const query = "DELETE FROM recomment WHERE recomment_id=?;"
        const result = await conn.query(query, [recomment_id]);
        return true;
    } catch (err) {
        console.error('Error updating data:', err);
        return false;
    } finally {
        if (conn) conn.release(); // 연결 해제
    }
}

async function get_user_comment_report_Info() {
    let conn;
    try {
        conn = await pool.getConnection();
        const query = `
            SELECT 
                rc.report_comment_id,
                rc.comment_id,
                rc.report_comment_name,
                c.contents,
                c.date AS comment_date,
                c.like AS comment_like,
                p.post_id,
                p.department_check,
                u.user_id,
                s.student_id,
                s.name AS student_name,
                d.department_id,
                d.name AS department_name
            FROM 
                report_comment rc
            JOIN 
                comment c ON rc.comment_id = c.comment_id
            JOIN 
                post p ON c.post_id = p.post_id
            JOIN 
                user u ON c.user_id = u.user_id
            JOIN 
                student s ON u.student_id = s.student_id
            JOIN
                department d ON s.department_id = d.department_id;
        `;
        const rows = await conn.query(query);
        return rows; // Return the query result
    } catch (err) {
        console.error('Error querying data:', err);
        throw err; // Handle the error
    } finally {
        if (conn) conn.release(); // Release the connection
    }
}


//이벤트 정보만 등록
async function RegistorEvent(campus_id, user_id, event_name, get_point, info, simple_info, start_date, close_date) {
    let conn;
    try {
        conn = await pool.getConnection();
        const query = `
        INSERT INTO event (
        campus_id,
        user_id,
        \`name\`,
        get_point,
        info,
        simple_info,
        start_date,
        close_date,
        is_event_close) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?);`
        const result = await conn.query(query, [campus_id, user_id, event_name, get_point, info, simple_info, start_date, close_date, 0]);
        const event_id = result.insertId.toString();
        return event_id;
    } catch (err) {
        console.error('Error inserting data:', err);
    } finally {
        if (conn) conn.release(); // 연결 해제
    }
}


//이벤트 테이블에 연결되어있는 투표 테이블에 행삽입
async function RegistorEventVotes(event_id, votes) {
    let conn;
    try {
        conn = await pool.getConnection();
        const votesJson = JSON.stringify(votes);
        const query = `CALL RegisterEventVotes(?, ?)`;
        await conn.query(query, [event_id, votesJson]);
    } catch (err) {
        console.error('Error inserting data:', err);
    } finally {
        if (conn) conn.release(); // 연결 해제
    }
}

//이벤트 테이블에 연결되어있는 투표 테이블에 행삽입
async function RegistorEventVotesAdmin(event_id, votes) {
    let conn;
    try {
        conn = await pool.getConnection();
        const votesJson = JSON.stringify(votes);
        const query = `CALL RegisterEventVotes(?, ?)`;
        await conn.query(query, [event_id, votesJson]);
    } catch (err) {
        console.error('Error inserting data:', err);
    } finally {
        if (conn) conn.release(); // 연결 해제
    }
}

//이벤트 테이블에 연결되어있는 이미지 테이블에 행삽입
async function RegistorEventPhoto(event_id, event_photo) {
    let conn;
    try {
        conn = await pool.getConnection();
        const photosJson = JSON.stringify(event_photo);
        const query = `CALL RegisterEventPhotos(?, ?)`;
        await conn.query(query, [event_id, photosJson]);
    } catch (err) {
        console.error('Error inserting data:', err);
    } finally {
        if (conn) conn.release(); // 연결 해제
    }
}

async function GetEventList(campus_id) {
    let conn;
    try {
        conn = await pool.getConnection();
        const rows = await conn.query(
            `SELECT
            e.event_id,
            e.name,
            e.info,
            e.campus_id,
            e.start_date,
            e.close_date,
            ep.event_photo
        FROM
            event e
        JOIN
            (
                SELECT
                    ep1.event_id,
                    MIN(ep1.event_photo) AS min_event_photo -- MIN 함수로 변경
                FROM
                    event_photo ep1
                GROUP BY
                    ep1.event_id
            ) ep_min ON e.event_id = ep_min.event_id
        JOIN
            event_photo ep ON ep.event_id = ep_min.event_id AND ep.event_photo = ep_min.min_event_photo
        WHERE
            e.campus_id = ?
        ORDER BY
            e.event_id DESC;`
            , [campus_id]);
        return rows;

    } catch (err) {
        throw err;
    } finally {
        if (conn) conn.release();
    }
}

//편집할 이벤트 정보 가져오기
async function GetEditEventInfo(event_id) {
    let conn;
    try {
        conn = await pool.getConnection();
        const rows = await conn.query(
            `SELECT * FROM event WHERE event_id = ?`
            , [event_id]);
        return rows;
    } catch (err) {
        throw err;
    } finally {
        if (conn) conn.release();
    }
}

//이벤트 편집할 이벤트 투표 가져오기
async function GetEditEventVote(event_id) {
    let conn;
    try {
        conn = await pool.getConnection();
        const rows = await conn.query(
            `SELECT * FROM event_vote WHERE event_id = ?`
            , [event_id]);
        return rows;
    } catch (err) {
        throw err;
    } finally {
        if (conn) conn.release();
    }
}

//이벤트 편집할 이벤트 이미지 가져오기
async function GetEditEventImage(event_id) {
    let conn;
    try {
        conn = await pool.getConnection();
        const rows = await conn.query(
            `SELECT * FROM event_photo WHERE event_id = ?`
            , [event_id]);
        return rows;
    } catch (err) {
        throw err;
    } finally {
        if (conn) conn.release();
    }
}

//해당 이벤트 초기화 후 다시 행삽입
async function DeleteEvent(event_id) {
    let conn;
    try {
        conn = await pool.getConnection();
        const rows = await conn.query(
            `DELETE FROM event WHERE event_id = ?`
            , [event_id]);
        return rows;
    } catch (err) {
        throw err;
    } finally {
        if (conn) conn.release();
    }
}

async function DeletePostPhoto(post_id) {
    let conn;
    try {
        conn = await pool.getConnection();
        const rows = await conn.query(
            `DELETE FROM post_photo WHERE post_id = ?`
            , [post_id]);
        return rows;
    } catch (err) {
        throw err;
    } finally {
        if (conn) conn.release();
    }
}

//유저의 이벤트 목록 가져오기
async function GetUserSendEvent(campus_id) {
    let conn;
    try {
        conn = await pool.getConnection();
        const rows = await conn.query(
            `SELECT 
                us.user_send_event,
                us.user_id,
                us.event_id,
                us.time,  
                us.content,
                us.good_event,
                e.campus_id,
                userdata.id,
                st.name,
                e.get_point
            FROM
                user_send_event us
            JOIN
                event e ON us.event_id = e.event_id
            JOIN
                \`user\` userdata ON userdata.user_id = us.user_id
            JOIN
                student st ON st.student_id = userdata.student_id
            WHERE 
                e.campus_id = ?
            ORDER BY 
                us.time DESC `
            , [campus_id]);
        return rows;
    } catch (err) {
        throw err;
    } finally {
        if (conn) conn.release();
    }
}


//유저의 이벤트 목록 중 사진 가져오기
async function GetUserEventPhoto(event_id, user_id) {
    let conn;
    try {
        conn = await pool.getConnection();
        const rows = await conn.query(
            `SELECT * FROM user_send_event_photo
             WHERE event_id = ? AND user_id = ?`
            , [event_id, user_id]);
        return rows;
    } catch (err) {
        throw err;
    } finally {
        if (conn) conn.release();
    }
}


async function getuserInfo(campus_id) {
    let conn;
    try {
        conn = await pool.getConnection();
        // 데이터 조회 쿼리 작성
        const rows = await conn.query(`
            SELECT 
                u.user_id, 
                u.id, 
                u.point, 
                u.profilePhoto, 
                u.title, 
                u.report_confirm,
                u.caution, 
                s.name AS student_name, 
                s.student_id, 
                s.department_id, 
                s.campus_id,
                d.name AS department_name
            FROM 
                user u
            JOIN 
                student s ON u.student_id = s.student_id
            JOIN 
                department d ON s.department_id = d.department_id
            WHERE 
                s.campus_id = ?
        `, [campus_id]);

        return rows;
    } catch (err) {
        console.error('Error fetching data:', err);
    } finally {
        if (conn) conn.release(); // 연결 해제
    }
}

async function update_user_caution(user_pk) {
    let conn;
    try {
        conn = await pool.getConnection();
        const query = 'UPDATE user SET caution = caution + 1 WHERE user_id = ?';
        const result = await conn.query(query, [user_pk]);
        return true;
    } catch (err) {
        console.error('Error updating data:', err);
        return false;
    } finally {
        if (conn) conn.release(); // 연결 해제
    }
}

async function update_user_title(user_pk, title) {
    let conn;
    try {
        conn = await pool.getConnection();
        const query = 'UPDATE user SET title = ? WHERE user_id = ?';
        const result = await conn.query(query, [title, user_pk]);
        return true;
    } catch (err) {
        console.error('Error updating data:', err);
        return false;
    } finally {
        if (conn) conn.release(); // Release the connection
    }
}

async function update_user_allpoint(user_pk, point) {
    let conn;
    try {
        conn = await pool.getConnection();
        const query = 'UPDATE user SET point = ? WHERE user_id = ?';
        const result = await conn.query(query, [point, user_pk]);
        return true;
    } catch (err) {
        console.error('Error updating data:', err);
        return false;
    } finally {
        if (conn) conn.release(); // Release connection
    }
}



//해당 이벤트의 모든 투표 정보 가져오기
async function GetEventVote(campus_id) {
    let conn;
    try {
        conn = await pool.getConnection();
        const rows = await conn.query(`SELECT * FROM event_vote`);
        return rows;
    } catch (err) {
        throw err;
    } finally {
        if (conn) conn.release();
    }
}

//해당 이벤트의 모든 투표 정보 가져오기
async function GetoneEventVote(event_id) {
    let conn;
    try {
        conn = await pool.getConnection();
        const rows = await conn.query(`SELECT * FROM event_vote WHERE event_id = ?`, [event_id]);
        return rows;
    } catch (err) {
        throw err;
    } finally {
        if (conn) conn.release();
    }
}

//이벤트 테이블에 연결되어있는 투표 테이블에 행삽입
async function SendUserEventVote(event_id, vote_name) {
    let conn;
    try {
        conn = await pool.getConnection();
        const query =
            `UPDATE event_vote
        SET vote_count = vote_count + 1
        WHERE event_id = ? AND vote_name = ?;`
        const result = await conn.query(query, [event_id, vote_name]);
    } catch (err) {
        console.error('Error inserting data:', err);
    } finally {
        if (conn) conn.release(); // 연결 해제
    }
}

//당첨
async function AdminSendPoint(user_id, event_point) {
    let conn;
    try {
        conn = await pool.getConnection();
        const query =
            `UPDATE user
        SET point = point + ?
        WHERE user_id = ?;`
        const result = await conn.query(query, [event_point, user_id]);
    } catch (err) {
        console.error('Error inserting data:', err);
    } finally {
        if (conn) conn.release(); // 연결 해제
    }
}

//출석 체크 시 포인트 상승
async function AttendanceCheck(user_id, event_point) {
    let conn;
    try {
        conn = await pool.getConnection();
        const query =
            `UPDATE user
        SET point = point + ?
        WHERE user_id = ?;`
        const result = await conn.query(query, [event_point, user_id]);
    } catch (err) {
        console.error('Error inserting data:', err);
    } finally {
        if (conn) conn.release(); // 연결 해제
    }
}

//출석 체크 시 포인트 상승
async function setUserSendtype(user_send_event) {
    let conn;
    try {
        conn = await pool.getConnection();
        const query =
            `UPDATE user_send_event
        SET good_event = 1
        WHERE user_send_event = ?;`
        const result = await conn.query(query, [user_send_event]);
    } catch (err) {
        console.error('Error inserting data:', err);
    } finally {
        if (conn) conn.release(); // 연결 해제
    }
}

async function addLectureInfo(student_id, lecture_id, weeknum, classnum, attendance_Info) {
    let conn;
    try {
        conn = await pool.getConnection();
        const query = `
            INSERT INTO lecture_week_info 
            (student_fk, lecture_fk, weeknum, classnum, attendance_Info) 
            VALUES (?, ?, ?, ?, ?);
        `;
        await conn.query(query, [student_id, lecture_id, weeknum, classnum, attendance_Info]);
        return true;
    } catch (err) {
        console.error(err);
        return false;
    } finally {
        if (conn) conn.release(); // 연결 해제
    }
}

async function GetLectureInfo(student_id, lecture_id) {
    let conn;
    try {
        conn = await pool.getConnection();
        const rows = await conn.query(
            `
            SELECT 
                weeknum, 
                classnum, 
                attendance_Info
            FROM 
                lecture_week_info
            WHERE 
                student_fk = ? AND lecture_fk = ?
            `,
            [student_id, lecture_id]
        );
        console.log('Query Result:', rows);  // 쿼리 결과 확인
        return rows;
    } catch (err) {
        console.error('Database Error:', err);  // 데이터베이스 에러 로그
        throw err;
    } finally {
        if (conn) conn.end();
    }
}

//해당 포스터 pk값 가져오기
async function get_recomment_post_pk(comment_id) {
    let conn;
    try {
        conn = await pool.getConnection();
        const rows = await conn.query(`SELECT post_id FROM comment WHERE comment.comment_id = ?`, [comment_id]);
        return rows;
    } catch (err) {
        throw err;
    } finally {
        if (conn) conn.release();
    }
}

//포스터 수정하기 위해 일단 포스터 정보 가져오기
async function get_post_info(post_id) {
    let conn;
    try {
        conn = await pool.getConnection();
        const rows = await conn.query(`
            SELECT
                post_id,
                user_id, 
                department_check,
                inform_check,
                title,
                contents,
                Club_check,
                contest_check,
                url,
                sources
            FROM 
                post
            WHERE post.post_id = ?`, [post_id]);
        return rows;
    } catch (err) {
        throw err;
    } finally {
        if (conn) conn.release();
    }
}

async function editcomment(comment_pk, contents) {
    let conn;
    try {
        conn = await pool.getConnection();
        const query = `
        UPDATE 
            comment
        SET 
            contents = ?
        WHERE
            comment_id = ?`
        await conn.query(query, [contents, comment_pk]);
    } catch (err) {
        console.error(err);
        return false;
    } finally {
        if (conn) conn.release(); // 연결 해제
    }
}

async function editrecomment(recomment_pk, contents) {
    let conn;
    try {
        conn = await pool.getConnection();
        const query = `
        UPDATE 
            recomment
        SET 
            contents = ?
        WHERE
            recomment_id = ?`
        await conn.query(query, [contents, recomment_pk]);
    } catch (err) {
        console.error(err);
        return false;
    } finally {
        if (conn) conn.release(); // 연결 해제
    }
}

async function cancel_post_like(user_id, post_id) {
    let conn;
    try {
        conn = await pool.getConnection();
        const query = `
        DELETE FROM is_user_post_like
        WHERE post_id = ? AND user_id = ?;`
        await conn.query(query, [post_id, user_id]);
    } catch (err) {
        console.error(err);
        return false;
    } finally {
        if (conn) conn.release(); // 연결 해제
    }
}

async function cancel_comment_like(user_id, comment_id) {
    let conn;
    try {
        conn = await pool.getConnection();
        const query = `
        DELETE FROM is_user_comment_like
        WHERE comment_id = ? AND user_id = ?;`
        await conn.query(query, [comment_id, user_id]);
    } catch (err) {
        console.error(err);
        return false;
    } finally {
        if (conn) conn.release(); // 연결 해제
    }
}

async function cancel_recomment_like(user_id, recomment_id) {
    let conn;
    try {
        conn = await pool.getConnection();
        const query = `
        DELETE FROM is_user_recomment_like
        WHERE recomment_id = ? AND user_id = ?;`
        await conn.query(query, [recomment_id, user_id]);
    } catch (err) {
        console.error(err);
        return false;
    } finally {
        if (conn) conn.release(); // 연결 해제
    }
}

async function getHistoryData(user_id) {
    let conn;
    try {
        conn = await pool.getConnection();
        const query = (
            `SELECT * FROM point_history WHERE user_id = ? ORDER BY point_time DESC`
        );
        const row = await conn.query(query, [user_id]);
        return row;
    } catch (err) {
        throw err;
    } finally {
        if (conn) conn.release();
    }
}

async function AddEventPointHistory(point_num, content, user_id) {
    let conn;
    try {
        conn = await pool.getConnection();
        const query = (
            `INSERT INTO point_history 
            (point_status, point_num, content, user_id) 
            VALUES (1, ?, ?, ?);`
        );
        const rows = await conn.query(query, [point_num, "[이벤트 당첨] " + content, user_id]);
        return rows;
    } catch (err) {
        throw err;
    } finally {
        if (conn) conn.release();
    }
}

async function AddAppAttendancePointHistory(user_id, today) {
    let conn;
    try {
        conn = await pool.getConnection();
        const query = (
            `INSERT INTO point_history 
            (point_status, point_num, content, user_id) 
            VALUES (1, 10, ?, ?);`
        );
        const rows = await conn.query(query, ["[앱 출석체크] " + today + " 정기 출석", user_id]);
        return rows;
    } catch (err) {
        throw err;
    } finally {
        if (conn) conn.release();
    }
}

async function AddFriendPointHistory(user_id, friendName) {
    let conn;
    try {
        conn = await pool.getConnection();
        const query = (
            `INSERT INTO point_history 
            (point_status, point_num, content, user_id) 
            VALUES (1, 100, ?, ?);`
        );
        const rows = await conn.query(query, ["[친구 코드] " + friendName + "님에게 친구코드 발송", user_id]);
        return rows;
    } catch (err) {
        throw err;
    } finally {
        if (conn) conn.release();
    }
}

async function AddBuyProductPointHistory(user_id, product, point) {
    let conn;
    try {
        conn = await pool.getConnection();
        const query = (
            `INSERT INTO point_history 
            (point_status, point_num, content, user_id) 
            VALUES (0, ?, ?, ?);`
        );
        const rows = await conn.query(query, [point, "[상품 사기] " + product + " 구매 완료", user_id]);
        return rows;
    } catch (err) {
        throw err;
    } finally {
        if (conn) conn.release();
    }
}

async function AddAdminPointHistory(user_id, point, status) {
    let conn;
    try {
        conn = await pool.getConnection();
        const query = (
            `INSERT INTO point_history 
            (point_status, point_num, content, user_id) 
            VALUES (?, ?, ?, ?);`
        );
        const rows = await conn.query(query, [status, point, "[관리자] 관리자에 의해 포인트 변경됨", user_id]);
        return rows;
    } catch (err) {
        throw err;
    } finally {
        if (conn) conn.release();
    }
}

async function getTimeTableData(user_id) {
    let conn;
    try {
        conn = await pool.getConnection();
        const query = (
            `SELECT * FROM timetable WHERE user_id = ?`
        );
        const row = await conn.query(query, [user_id]);
        return row;
    } catch (err) {
        throw err;
    } finally {
        if (conn) conn.release();
    }
}

async function insertTimeTable(user_id, lecture_grade, lecture_semester, lecture_name, lecture_room, lecture_time, professor_name, credit, week) {
    let conn;
    try {
        conn = await pool.getConnection();
        const query = (
            `INSERT INTO timetable 
            (user_id, lecture_grade, lecture_semester, lecture_name, lecture_room, lecture_time, professor_name, credit, week) 
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?);`
        );
        const rows = await conn.query(query, [user_id, lecture_grade, lecture_semester, lecture_name, lecture_room, lecture_time, professor_name, credit, week]);
        return rows;
    } catch (err) {
        throw err;
    } finally {
        if (conn) conn.release();
    }
}

//상품 삭제하기
async function deleteTimetable(user_id, lecture_name, lecture_room, week) {
    let conn;
    try {
        conn = await pool.getConnection();
        // 데이터 업데이트 쿼리 작성
        const query = `DELETE FROM timetable 
        WHERE 
        user_id = ? AND 
        lecture_name = ? AND
        lecture_room = ? AND
        week = ?`
        const result = await conn.query(query, [user_id, lecture_name, lecture_room, week]);
    } catch (err) {
        console.error('Error updating data:', err);
    } finally {
        if (conn) conn.release(); // 연결 해제
    }
}

//유저 목표 학점 가져오기
async function get_GoalGPA(user_id) {
    let conn;
    try {
        conn = await pool.getConnection();
        // 데이터 업데이트 쿼리 작성
        const query = `SELECT goal_gpa FROM user WHERE user_id = ?`
        const result = await conn.query(query, [user_id]);
        return result
    } catch (err) {
        console.error('Error updating data:', err);
    } finally {
        if (conn) conn.release(); // 연결 해제
    }
}

async function change_GoalGPA(user_id, goal_gpa) {
    let conn;
    try {
        conn = await pool.getConnection();
        // 데이터 업데이트 쿼리 작성
        const query = `
            UPDATE user 
            SET 
                goal_gpa = ?
            WHERE user_id = ?
        `;
        const result = await conn.query(query, [goal_gpa, user_id]);
    } catch (err) {
        console.error('Error updating data:', err);
    } finally {
        if (conn) conn.release();
    }
}

async function addClubInfo(post_id, name, birth, university, department, grade, phone, sex, residence, application, introduce) {
    let conn;
    try {
        conn = await pool.getConnection();
        const query = `
          INSERT INTO club_register 
          (Post_fk, Name, Birth, University, Department, Grade, Phone, Sex, Residence, Application, Introduce, comment) 
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, '');
        `;
        await conn.query(query, [post_id, name, birth, university, department, grade, phone, sex, residence, application, introduce]);

        return true;
    } catch (err) {
        console.error(err);
        return false;
    } finally {
        if (conn) conn.release(); // 연결 해제
    }
}

async function getClubInfo(post_id) {
    let conn;
    try {
        conn = await pool.getConnection();
        // 데이터 조회 쿼리 작성
        const query = `
            SELECT 
                club_register.Post_fk, 
                club_register.Name, 
                club_register.Birth, 
                club_register.University,
                club_register.Department,
                club_register.Grade,
                club_register.Phone,
                club_register.Sex,
                club_register.Residence,
                club_register.Application,
                club_register.Introduce
            FROM 
                club_register
                LEFT JOIN post ON post.post_id = club_register.Post_fk
            WHERE 
                post.post_id = ?`;

        const rows = await conn.query(query, [post_id]);
        console.log('Query result:', rows); // 쿼리 결과 확인
        return rows;

    } catch (err) {
        console.error('Error fetching data:', err);
        throw err; // 오류 발생 시 던짐
    } finally {
        if (conn) conn.release(); // 연결 해제
    }
}

async function fetchContestpostData(campus_id) {
    let conn;
    try {
        conn = await pool.getConnection();
        const query = (
            `
                SELECT 
                	post.post_id,
                	post.user_id,
                	post.department_check,
                	post.inform_check,
                	post.Club_check,
                	post.title,
                	post.date,
                	post.contest_check,
                	post.url,
                	post.sources,
                	post_photo.post_photo,
                	student.campus_id
                FROM 
                	post
                LEFT JOIN 
                	post_photo
                ON
                	post.post_id = post_photo.post_id
                LEFT JOIN
                	user
                ON 
                	post.user_id = user.user_id
                LEFT JOIN
                	student
                ON
                	user.student_id = student.student_id
                WHERE
                	post.inform_check = 1
                AND
                	post.contest_check = 1
                AND
                	student.campus_id = ?
                ORDER BY 
                    post.date DESC;
            `
        );
        const row = await conn.query(query, [campus_id]);
        return row;
    } catch (err) {
        throw err;
    } finally {
        if (conn) conn.release();
    }
}

async function delete_Club(post_id, name, phone) {
    let conn;
    try {
        conn = await pool.getConnection();
        const query = "DELETE FROM club_register WHERE Post_fk = ? AND Name = ? AND Phone = ?"
        const result = await conn.query(query, [post_id, name, phone]);
        return true;
    } catch (err) {
        console.error('Error updating data:', err);
        return false;
    } finally {
        if (conn) conn.release(); // 연결 해제
    }
}

async function GetClubPersonPK(user_name) {
    let conn;
    try {
        conn = await pool.getConnection();
        // 데이터 조회 쿼리 작성
        const query = `
SELECT 
	user.user_id
FROM 
	user
LEFT JOIN 
	student
ON
	user.student_id = student.student_id
WHERE student.name = ?`;

        const rows = await conn.query(query, [user_name]);
        console.log('Query result:', rows); // 쿼리 결과 확인
        return rows;

    } catch (err) {
        console.error('Error fetching data:', err);
        throw err; // 오류 발생 시 던짐
    } finally {
        if (conn) conn.release(); // 연결 해제
    }
}

async function SendAramData(user_id, target_id, title) {
    let conn;
    try {
        conn = await pool.getConnection();
        // 데이터 조회 쿼리 작성
        const query = `
        INSERT INTO aram (user_id, target_id, title, target_type, time)
VALUES 
(?, ?, '동아리 관련 쪽지가 도착했습니다', 'school_club', DEFAULT)
`;

        const rows = await conn.query(query, [user_id, target_id]);
        console.log('Query result:', rows); // 쿼리 결과 확인
    } catch (err) {
        console.error('Error fetching data:', err);
        throw err; // 오류 발생 시 던짐
    } finally {
        if (conn) conn.release(); // 연결 해제
    }
}

async function updateComment(comment, Phone) {
    let conn;
    try {
        conn = await pool.getConnection();
        // 데이터 조회 쿼리 작성
        const query = `
        UPDATE club_register
SET comment = ?
WHERE Phone = ?;
`;

        const rows = await conn.query(query, [comment, Phone]);
        console.log('Query result:', rows); // 쿼리 결과 확인
    } catch (err) {
        console.error('Error fetching data:', err);
        throw err; // 오류 발생 시 던짐
    } finally {
        if (conn) conn.release(); // 연결 해제
    }
}

//관리자 게시물 삭제 시 정보저장 테이블에 저장
async function addDeletePostInfo(post_id, title, reason) {
    let conn;
    try {
        conn = await pool.getConnection();
        const query = "INSERT INTO delete_post_info (post_id, title, reason) VALUES (?, ?, ?)"
        const result = await conn.query(query, [post_id, title, reason]);
    } catch (err) {
        console.error('Error updating data:', err);
        return false;
    } finally {
        if (conn) conn.release(); // 연결 해제
    }
}

// 관리자 삭제 알림 전송
async function SendReportPostAram(user_id, target_id, title) {
    let conn;
    try {
        conn = await pool.getConnection();
        
        // 데이터 조회 쿼리 작성
        const query = `
        INSERT INTO aram (user_id, target_id, title, target_type, time)
        VALUES 
        (?, ?, ?, 'report_delete', DEFAULT)
        `;

        // title 결합
        const modifiedTitle = `"${title}"에 의해 \n게시물이 삭제되었습니다`;
        
        const rows = await conn.query(query, [user_id, target_id, modifiedTitle]);
        console.log('Query result:', rows); // 쿼리 결과 확인
    } catch (err) {
        console.error('Error fetching data:', err);
        throw err; // 오류 발생 시 던짐
    } finally {
        if (conn) conn.release(); // 연결 해제
    }
}

//알람 카운트 업데이트
async function UpdateAramCount(user_id) {
    let conn;
    try {
        conn = await pool.getConnection();
        // 데이터 업데이트 쿼리 작성
        const query = `UPDATE user
                        SET aram_count = aram_count + 1
                        WHERE user_id = ? `
        const result = await conn.query(query, [user_id]);
        // 쿼리 실행
        console.log('Data updated successfully:', result);
    } catch (err) {
        console.error('Error updating data:', err);
        console.log("확인");
        console.log("확인2");
        console.log("확인3");
    } finally {
        if (conn) conn.release(); // 연결 해제
    }
}

//알람 카운트 초기화
async function initAramCount(user_id) {
    let conn;
    try {
        conn = await pool.getConnection();
        // 데이터 업데이트 쿼리 작성
        const query = `UPDATE user
                        SET aram_count = 0
                        WHERE user_id = ? `
        const result = await conn.query(query, [user_id]);
        // 쿼리 실행
        console.log('Data updated successfully:', result);
    } catch (err) {
        console.error('Error updating data:', err);
    } finally {
        if (conn) conn.release(); // 연결 해제
    }
}

async function get_aram_count(user_id) {
    let conn;
    try {
        conn = await pool.getConnection();
        const rows = await conn.query(
            `SELECT aram_count FROM user WHERE user_id = ? `, [user_id]);
        return rows;

    } catch (err) {
        throw err;
    } finally {
        if (conn) conn.release();
    }
}


//모듈화를 시키지 않으면, server.js 파일에서 함수를 가져오지 못함.
module.exports = {
    getGeneralPosts,
    getDepartmentPosts,
    gethotpostdata,
    getdeparmentpostdata,
    getschoolpostdata,
    insertDataIntoDB,
    getuserpk,
    getLectureList,
    get_event_objcet,
    getBarcordMaxNum,
    PostItem,
    UpdateItem,
    DeleteItem,
    get_department_name,
    get_university_name,
    DeleteUser,
    Updateaccount,
    UpdateImg,
    DeleteImg,
    get_user_have_posts,
    add_book_mark,
    delete_book_mark,
    get_post_detail,
    getComment,
    get_campus_Info,
    get_campus_building_Info,
    getReComment,
    updateUserImg,
    post_comment,
    post_recomment,
    post_like_up,
    comment_like_up,
    recomment_like_up,
    write_post,
    getHotPosts,
    getBookmarkPosts,
    getdepartmentHotPosts,
    getdepartmentBookmarkPosts,
    searchPost,
    view_count_up,
    getNoticePosts,
    getNoticeDepartmentPosts,
    getNoticeHotPosts,
    getNoticeDepartmentHotPosts,
    getNoticeBookmarkPosts,
    getNoticeDepartmentBookmarkPosts,
    update_user_point,
    Get_One_Event_Item,
    update_object,
    insert_user_have_object,
    getUserHaveCoupon,
    getyourpoint,
    Updatelecture,
    getCampus,
    insert_student_study_room,
    get_student_study_room,
    get_studyroom_date,
    get_aram_data,
    get_one_post,
    addCommentAram,
    addHotAram,
    allUser_id,
    addLikeAram,
    getAppAttendanceDate,
    addAppAttendanceDate,
    update_user_point_2,
    get_invite_num,
    allUser_friend_code,
    addFriend_Code,
    allUser_Friend_code2,
    Friend_code_User_id,
    last_friendCode_Info,
    addFriendCodeAram,
    user_update_point_3,
    Get_Event_Data,
    Get_Event_Photos,
    send_user_event_info,
    user_send_photo,
    delete_studyroom,
    select_user_event_info,
    getMyPostData,
    deleteMyPostData,
    deleteMyaram,
    is_user_post_like,
    put_user_post_like,
    put_user_report,
    get_user_report,
    get_user_report_Info,
    delete_post,
    admin_get_event_objcet,
    RegistorItem,
    ChangeItemInfo,
    ChangeItemInfoANDCountUp,
    ChangeItemInfoANDCountDown,
    getRestItemCount,
    getSellItemCount,
    get_department,
    delete_comment,
    delete_recomment,
    put_user_comment_report,
    get_user_comment_report,
    get_user_comment_report_Info,
    RegistorEvent,
    RegistorEventVotes,
    RegistorEventPhoto,
    GetEventList,
    GetEditEventInfo,
    GetEditEventVote,
    GetEditEventImage,
    DeleteEvent,
    RegistorEventVotesAdmin,
    GetUserSendEvent,
    GetUserEventPhoto,
    getuserInfo,
    update_user_caution,
    update_user_title,
    update_user_allpoint,
    GetEventVote,
    GetoneEventVote,
    SendUserEventVote,
    AdminSendPoint,
    addNewEventAram,
    addSchoolNoticeAram,
    addDepartmentNoticeAram,
    Get_One_Event_Data,
    reportPostAram,
    reportCommentAram,
    AttendanceCheck,
    addGoodEventAram,
    setUserSendtype,
    addCommentLikeAram,
    get_recomment_post_pk,
    addRecommentLikeAram,
    put_user_comment_like,
    is_user_comment_like,
    put_user_recomment_like,
    is_user_recomment_like,
    get_post_info,
    update_post,
    editcomment,
    editrecomment,
    post_like_down,
    cancel_post_like,
    comment_like_num_down,
    cancel_comment_like,
    recomment_like_num_down,
    cancel_recomment_like,
    addLectureInfo,
    GetLectureInfo,
    getHistoryData,
    AddEventPointHistory,
    AddFriendPointHistory,
    AddAppAttendancePointHistory,
    AddBuyProductPointHistory,
    AddAdminPointHistory,
    getTimeTableData,
    insertTimeTable,
    deleteTimetable,
    get_GoalGPA,
    change_GoalGPA,
    RegistorPostPhoto,
    DetailPostPhoto,
    DeletePostPhoto,
    ClubPosts,
    addClubInfo,
    getClubInfo,
    fetchContestpostData,
    delete_Club,
    getContestPosts,
    GetClubPersonPK,
    SendAramData,
    updateComment,
    addDeletePostInfo,
    SendReportPostAram,
    UpdateAramCount,
    initAramCount,
    get_aram_count
};