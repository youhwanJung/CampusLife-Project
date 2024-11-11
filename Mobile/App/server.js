const express = require("express");
const multer = require('multer');
const app = express();
const PORT = 3000;
const mariadb = require('mariadb');
const { getGeneralPosts,
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
  get_department_name,
  get_university_name,
  DeleteUser,
  Updateaccount,
  UpdateItem,
  DeleteItem,
  UpdateImg,
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
  Get_One_Event_Item,
  update_object,
  insert_user_have_object,
  getUserHaveCoupon,
  getyourpoint,
  update_user_point,
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
  RegistorEvent,
  addGoodEventAram,
  addLectureInfo,
  GetLectureInfo,
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
} = require('./db.js'); // db 파일에서 함수 가져오기
app.use(express.json());
app.use(express.static('./App/images/'));



function formatDate(dateString) {
  const date = new Date(dateString);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function formatDate2(dateString) {
  const date = new Date(dateString);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  return `${year}-${month}-${day}-${hours}-${minutes}`;
}


const pool = mariadb.createPool({
  host: '127.0.0.1',
  port: 3306,
  user: 'dohyun',
  password: '0000',
  connectionLimit: 10,
  database: 'campuslife',
});

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, './App/images/');
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  }
});

const upload = multer({ storage });


//메인페이지에 핫 게시글 데이터를 가져온다.
app.post('/MainPagehotPost', async (req, res) => {
  const { campus_id } = req.body;

  try {
    const rows = await gethotpostdata(campus_id);
    const processedData = rows.map(item => ({
      post_id: item.post_id,
      title: item.title,
      contents: item.contents,
      date: formatDate(item.date),
      view: item.view,
      like: item.like,
      name: item.name,
      admin_check: item.admin_check,
    }));
    res.json(processedData);
    console.log("[MainScreen or AdminMain] : 핫 게시물 가져오기 성공");
  } catch (error) {
    console.log("[MainScreen or AdminMain] : 핫 게시물 가져오기 실패")
  }
});



//메인페이지에 학과 게시글 데이터를 가져온다.
app.post('/MainPagedepartmentPost', async (req, res) => {
  const { department_id } = req.body;
  try {
    const rows = await getdeparmentpostdata(department_id);
    const processedData = rows.map(item => ({
      post_id: item.post_id,
      title: item.title,
      contents: item.contents,
      date: formatDate(item.date),
      view: item.view,
      like: item.like,
      name: item.name,
      admin_check: item.admin_check,
    }));
    res.json(processedData);
    console.log("[MainScreen or AdminMain] : 학과 공지사항 가져오기 성공");
  } catch (error) {
    console.log("[MainScreen or AdminMain] : 학과 공지사항 가져오기 실패")
  }
});



//메인페이지에 전체 게시글 데이터를 가져온다.
app.post('/MainPageSchoolPost', async (req, res) => {
  const { campus_id } = req.body;
  try {
    const rows = await getschoolpostdata(campus_id);
    const processedData = rows.map(item => ({
      post_id: item.post_id,
      title: item.title,
      contents: item.contents,
      date: formatDate(item.date),
      view: item.view,
      like: item.like,
      name: item.name,
      admin_check: item.admin_check,
    }));
    res.json(processedData);
    console.log("[MainScreen or AdminMain] : 학교 공지사항 가져오기 성공");
  } catch (error) {
    console.log("[MainScreen or AdminMain] : 학교 공지사항 가져오기 실패")
  }
});

//바코드 최댓값 가져오기
app.get('/getMaxBarcordNum', async (req, res) => {
  try {
    const rows = await getBarcordMaxNum();
    const BarcordMaxNum = {
      barcordMaxNum: rows[0].max_code_num
    }

    res.json(BarcordMaxNum);
  } catch (error) {
    console.error("바코드 맥스넘 잘 못가져옴")
  }
})

//게시글을 작성하여 데이터베이스에 넣는다.
app.post('/post', async (req, res) => {
  const { post_id, user_id, department_check, inform_check, title, contents, data, view, like } = req.body;
  insertDataIntoDB(post_id, user_id, department_check, inform_check, title, contents, view, like);
  res.json({ message: 'Data received successfully', receivedData: { post_id, user_id, department_check, inform_check, title, contents, data, view, like } });
});

//아이디와 비밀번호를 받고 유저 pk값을 가져온다.
app.post('/get_user_data', async (req, res) => {
  const { user_id, user_pass } = req.body;
  try {
    // 데이터베이스에서 유저 정보 조회
    const rows = await getuserpk(user_id, user_pass);

    // 조회된 결과가 없는 경우
    if (rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    // 유저 데이터를 가공하여 전송
    const userData = {
      user_pk: rows[0].user_id,
      student_pk: rows[0].student_id,
      friend_code: rows[0].friend_code,
      admin_check: rows[0].admin_check,
      profile_photo: rows[0].profilePhoto,
      id: rows[0].id,
      name: rows[0].name,
      campus_pk: rows[0].campus_id,
      department_pk: rows[0].department_id,
      email: rows[0].email,
      grade: rows[0].grade,
      birth: formatDate(rows[0].birth),
      phone: rows[0].phone,
      point: rows[0].point,
      currentstatus: rows[0].currentstatus,
      student_semester: rows[0].student_semester,
      college: rows[0].college,
      title: rows[0].title,
      report_confirm: rows[0].report_confirm,
      aram_count : rows[0].aram_count
    };
    res.json(userData);

  } catch (error) {
    // 오류 발생 시 처리
    console.error('학생 정보 가져오기 오류:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

//해당 학교의 이벤트 상품 싹 가져오기
app.post('/get_items', async (req, res) => {
  const { campus_id } = req.body;
  try {
    const rows = await get_event_objcet(campus_id);
    const event_object_datas = rows.reduce((accumulator, item) => {
      const itemName = item.name;
      const existingItemIndex = accumulator.findIndex(obj => obj.name === itemName);
      if (existingItemIndex !== -1) {
        accumulator[existingItemIndex].count++;
      } else {
        accumulator.push({
          objec_id: item.object_id,
          name: itemName,
          price: item.price,
          code_num: item.code_num,
          using_time: item.using_time,
          image_num: item.image_num,
          sell_check: item.sell_check,
          explain: item.explain,
          count: 1 // 초기 카운트는 1로 설정
        });
      }
      return accumulator;
    }, []);
    console.log("[EventShopScreen] : 포인트 상점 물품 전부 가져오기 성공");
    res.json(event_object_datas);

  } catch (error) {
    console.log("[EventShopScreen] : 포인트 상점 물품 전부 가져오기 성공");
    res.status(500).json({ message: '서버가 잘 마무리되지않았습니다.' });
  }
});

//관리자에서 이벤트 상품 싹 가져오기
app.post('/admin_get_items', async (req, res) => {
  const { campus_id } = req.body;
  try {
    const rows = await admin_get_event_objcet(campus_id);
    const event_object_datas = rows.reduce((accumulator, item) => {
      const itemName = item.name;
      const existingItemIndex = accumulator.findIndex(obj => obj.name === itemName);
      if (existingItemIndex !== -1) {
        accumulator[existingItemIndex].count++;
      } else {
        // 해당 아이템이 처음 발견된 경우 새로운 객체로 추가
        accumulator.push({
          objec_id: item.object_id,
          name: itemName,
          price: item.price,
          code_num: item.code_num,
          using_time: item.using_time,
          image_num: item.image_num,
          sell_check: item.sell_check,
          explain: item.explain,
          count: 1 // 초기 카운트는 1로 설정
        });
      }
      return accumulator;
    }, []);
    console.log("[CheckProduct] : 등록한 상품 정보 가져오기 성공");
    res.json(event_object_datas);
  } catch (error) {
    console.log("[CheckProduct] : 등록한 상품 정보 가져오기 실패");
    res.status(500).json({ message: '서버가 잘 마무리되지않았습니다.' });
  }
});

//학교 전체 공지사항
app.post('/noticeschoolpost', async (req, res) => {
  const { campus_id } = req.body;
  try {
    const rows = await getNoticePosts(campus_id);
    const processedData = rows.map(item => ({
      post_id: item.post_id,
      title: item.title,
      contents: item.contents,
      date: formatDate(item.date),
      view: item.view,
      like: item.like,
      name: item.name,
      user_title: item.user_title
    }));
    console.log("[NoticeSchoolPostsScreen] : 전체 공지사항 전체 공지사항 가져오기 성공");
    res.json(processedData);
  } catch (error) {
    console.log("[NoticeSchoolPostsScreen] : 전체 공지사항 전체 공지사항 가져오기 실패");
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

//학교 학과 공지사항
app.post('/noticedepartmentpost', async (req, res) => {
  const { department_id } = req.body;
  try {
    const rows = await getNoticeDepartmentPosts(department_id);
    const processedData = rows.map(item => ({
      post_id: item.post_id,
      title: item.title,
      contents: item.contents,
      date: formatDate(item.date),
      view: item.view,
      like: item.like,
      name: item.name,
      user_title: item.user_title
    }));
    console.log("[NoticeSchoolPostsScreen] : 학과 공지사항 전체 공지사항 가져오기 성공");
    res.json(processedData);
  } catch (error) {
    console.log("[NoticeSchoolPostsScreen] : 학과 공지사항 전체 공지사항 가져오기 실패");
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

//학교 핫 공지사항
app.post('/NoticeHotpost', async (req, res) => {
  const { campus_id } = req.body;
  try {
    const rows = await getNoticeHotPosts(campus_id);
    const processedData = rows.map(item => ({
      post_id: item.post_id,
      title: item.title,
      contents: item.contents,
      date: formatDate(item.date),
      view: item.view,
      like: item.like,
      name: item.name,
      user_title: item.user_title,
    }));
    console.log("[NoticeHotPostsScreen] : 학교 공지사항 HOT 공지사항 가져오기 성공");
    res.json(processedData);
  } catch (error) {
    console.log("[NoticeHotPostsScreen] : 학교 공지사항 HOT 공지사항 가져오기 실패");
    res.status(500).json({ error: 'Internal Server Error' });
  }
});


//학과 핫 공지사항
app.post('/NoticeDepartmentHotpost', async (req, res) => {
  const { department_id } = req.body;
  try {
    const rows = await getNoticeDepartmentHotPosts(department_id);
    const processedData = rows.map(item => ({
      post_id: item.post_id,
      title: item.title,
      contents: item.contents,
      date: formatDate(item.date),
      view: item.view,
      like: item.like,
      name: item.name,
      user_title: item.user_title,
    }));
    console.log("[NoticeHotPostsScreen] : 학과 공지사항 HOT 공지사항 가져오기 성공");
    res.json(processedData);
  } catch (error) {
    console.log("[NoticeHotPostsScreen] : 학과 공지사항 HOT 공지사항 가져오기 실패");
    res.status(500).json({ error: 'Internal Server Error' });
  }
});


//공지사항에서 학교 북마크 게시글 가져오기
app.post('/Noticebookmark', async (req, res) => {
  const { user_id } = req.body;
  try {
    const rows = await getNoticeBookmarkPosts(user_id);
    const processedData = rows.map(item => ({
      post_id: item.post_id,
      title: item.title,
      contents: item.contents,
      date: formatDate(item.date),
      view: item.view,
      like: item.like,
      name: item.name,
      user_title: item.user_title,
    }));
    console.log("[NoticeBookmarkScreen] : 학교 공지사항 북마크 공지사항 가져오기 성공");
    res.json(processedData);
  } catch (error) {
    console.log("[NoticeBookmarkScreen] : 학교 공지사항 북마크 공지사항 가져오기 실패");
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

//공지사항에서 학과 북마크 게시글 가져오기
app.post('/NoticeDepartmentbookmark', async (req, res) => {
  const { user_id, department_id } = req.body;
  try {
    const rows = await getNoticeDepartmentBookmarkPosts(user_id, department_id);
    const processedData = rows.map(item => ({
      post_id: item.post_id,
      title: item.title,
      contents: item.contents,
      date: formatDate(item.date),
      view: item.view,
      like: item.like,
      name: item.name,
      user_title: item.user_title,
    }));
    console.log("[NoticeBookmarkScreen] : 학과 공지사항 북마크 공지사항 가져오기 성공");
    res.json(processedData);
  } catch (error) {
    console.log("[NoticeBookmarkScreen] : 학과 공지사항 북마크 공지사항 가져오기 실패");
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

//내가 쓴 게시글 보기
app.post('/getMyPostData', async (req, res) => {
  try {
    const { user_id } = req.body;
    const rows = await getMyPostData(user_id);
    const processedData = rows.map(item => ({
      post_id: item.post_id,
      title: item.title,
      contents: item.contents,
      date: formatDate(item.date),
      view: item.view,
      like: item.like,
      name: item.name,
      user_title: item.user_title,
      inform_check : item.inform_check,
      department_check : item.department_check,
      contest_check : item.contest_check,
      Club_check : item.Club_check
    }));
    res.json(processedData);
    console.log("[MyPostScreen] : 내가쓴 게시물 가져오기 성공");
  } catch (error) {
    console.log("[MyPostScreen] : 내가쓴 게시물 가져오기 실패");
    console.log(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});


//게시글화면에서 전체 전체 게시글을 가져온다.
app.post('/generalpost', async (req, res) => {
  try {
    const { campus_id } = req.body;
    const rows = await getGeneralPosts(campus_id);
    const processedData = rows.map(item => ({
      post_id: item.post_id,
      title: item.title,
      contents: item.contents,
      date: formatDate(item.date),
      view: item.view,
      like: item.like,
      name: item.name,
      user_title: item.user_title
    }));
    res.json(processedData);
    console.log("[GeneralPostsScreen] : 전체 게시판 전체 게시물 가져오기 성공");
  } catch (error) {
    res.status(500).json({ error: 'Internal Server Error' });
    console.log("[GeneralPostsScreen] : 전체 게시판 전체 게시물 가져오기 실패");
  }
});

//게시글화면에서 공모전 게시글을 가져온다.
app.post('/getContestPosts', async (req, res) => {
  try {
    const { campus_id } = req.body;
    const rows = await getContestPosts(campus_id);
    const processedData = rows.map(item => ({
      post_id: item.post_id,
      title: item.title,
      contents: item.contents,
      date: formatDate(item.date),
      view: item.view,
      like: item.like,
      name: item.name,
      user_title: item.user_title,
      url : item.url,
      sources : item.sources,
      contest_check : item.contest_check
    }));
    res.json(processedData);
    console.log("[GeneralPostsScreen] : 공모전 게시물 가져오기 성공");
  } catch (error) {
    res.status(500).json({ error: 'Internal Server Error' });
    console.log("[GeneralPostsScreen] : 공모전 게시물 가져오기 실패");
  }
});


//게시글화면에서 전체 핫 게시글을 가져온다.
app.post('/Hotpost', async (req, res) => {
  try {
    const { campus_id } = req.body;
    const rows = await getHotPosts(campus_id);
    const processedData = rows.map(item => ({
      post_id: item.post_id,
      title: item.title,
      contents: item.contents,
      date: formatDate(item.date),
      view: item.view,
      like: item.like,
      name: item.name,
      user_title: item.user_title,
    }));
    res.json(processedData);
    console.log("[HotPostsScreen] : 전체 게시판 HOT 게시물 가져오기 성공");
  } catch (error) {
    console.log("[HotPostsScreen] : 전체 게시판 HOT 게시물 가져오기 실패");
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

//게시글화면에서 전체 북마크 게시글을 가져온다.
app.post('/bookmark', async (req, res) => {
  const { user_id } = req.body;
  try {
    const rows = await getBookmarkPosts(user_id);
    const processedData = rows.map(item => ({
      post_id: item.post_id,
      title: item.title,
      contents: item.contents,
      date: formatDate(item.date),
      view: item.view,
      like: item.like,
      name: item.name,
      user_title: item.user_title,
    }));
    res.json(processedData);
    console.log("[BookmarkScreen] : 전체 게시판 북마크 게시물 가져오기 성공");
  } catch (error) {
    console.log("[BookmarkScreen] : 전체 게시판 북마크 게시물 가져오기 실패");
    res.status(500).json({ error: 'Internal Server Error' });
  }
});


//게시글화면에서 학과 전체 게시글을 가져온다
app.post('/departmentpost', async (req, res) => {
  const { department_id } = req.body;
  //console.log(department_id);
  try {
    const rows = await getDepartmentPosts(department_id);
    const processedData = rows.map(item => ({
      post_id: item.post_id,
      title: item.title,
      contents: item.contents,
      date: formatDate(item.date),
      view: item.view,
      like: item.like,
      name: item.name,
      user_title: item.user_title
    }));
    res.json(processedData);
    console.log("[GeneralPostsScreen] : 학과 게시판 전체 게시물 가져오기 성공");
  } catch (error) {
    res.status(500).json({ error: 'Internal Server Error' });
    console.log("[GeneralPostsScreen] : 학과 게시판 전체 게시물 가져오기 실패");
  }
});

//게시글화면에서 전체 전체 게시글을 가져온다.
app.post('/Clubpost', async (req, res) => {
  try {
    const rows = await ClubPosts();
    const processedData = rows.map(item => ({
      post_id: item.post_id,
      title: item.title,
      contents: item.contents,
      date: formatDate(item.date),
      view: item.view,
      like: item.like,
      name: item.name,
      image : item.image,
      user_title: item.user_title,
    }));
    console.log(processedData)
    res.json(processedData);
    console.log("[GeneralPostsScreen] : 동아리 게시판 전체 게시물 가져오기 성공");
  } catch (error) {
    res.status(500).json({ error: 'Internal Server Error' });
    console.log("[GeneralPostsScreen] : 동아리 게시판 전체 게시물 가져오기 실패");
  }
});


app.post('/departmentHotpost', async (req, res) => {
  const { department_id } = req.body;
  try {
    const rows = await getdepartmentHotPosts(department_id);
    const processedData = rows.map(item => ({
      post_id: item.post_id,
      title: item.title,
      contents: item.contents,
      date: formatDate(item.date),
      view: item.view,
      like: item.like,
      name: item.name,
      user_title: item.user_title,
    }));
    res.json(processedData);
    console.log("[HotPostsScreen] : 학과 게시판 HOT 게시물 가져오기 성공");
  } catch (error) {
    console.log("[HotPostsScreen] : 학과 게시판 HOT 게시물 가져오기 실패");
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

//게시글화면에서 학과 책갈피 게시글을 가져온다
app.post('/departmentbookmark', async (req, res) => {
  const { user_id, department_id } = req.body;
  try {
    const rows = await getdepartmentBookmarkPosts(user_id, department_id);
    const processedData = rows.map(item => ({
      post_id: item.post_id,
      title: item.title,
      contents: item.contents,
      date: formatDate(item.date),
      view: item.view,
      like: item.like,
      name: item.name,
      user_title: item.user_title,
    }));
    res.json(processedData);
    console.log("[BookmarkScreen] : 학과 게시판 북마크 게시물 가져오기 성공");
  } catch (error) {
    res.status(500).json({ error: 'Internal Server Error' });
    console.error(error);
    console.log("[BookmarkScreen] : 학과 게시판 북마크 게시물 가져오기 실패");
  }
});


//회원가입
app.post('/register', async (req, res) => {
  const { studentId, username, userpass, friendCode } = req.body;

  const conn = await pool.getConnection();
  try {
    await conn.query('INSERT INTO user (student_id, id, passwd, friend_code, point, admin_check) VALUES (?, ?, ?, ?, 0, 0)', [studentId, username, userpass, friendCode]);
    res.send('User registered successfully');
  } catch (error) {
    console.error('Error registering user:', error);
    res.status(500).send('Error registering user');
  } finally {
    if (conn) conn.release();
  }
});

//로그인
app.post('/login', async (req, res) => {
  const { username, password } = req.body;
  const conn = await pool.getConnection();
  try {
    const result = await conn.query('SELECT * FROM user WHERE id = ? AND passwd = ?', [username, password]);
    if (result.length > 0) {
      res.send('success');
    } else {
      res.send('failure');
    }
  } catch (error) {
    console.error('로그인 오류:', error);
    res.status(500).send('로그인 오류');
  } finally {
    if (conn) conn.release();
  }
});

// 과목 가져오기
app.post('/getlecture', async (req, res) => {
  const studentId = req.body.student_pk; // POST 요청에서 student_id를 가져옴
  if (!studentId) {
    return res.status(400).json({ error: 'student_id is required' });
  }
  try {
    const rows = await getLectureList(studentId);
    const processedData = rows.map(item => ({
      lecture_id: item.lecture_id,
      professor_name: item.name,
      credit: item.credit,
      lecture_name: item.lecture_name,
      lecture_room: item.lecture_room,
      lecture_time: item.lecture_time,
      week: item.week,
      lecture_have_week: item.lecture_have_week,
      division: item.division,
      nonattendance: item.nonattendance,
      attendance: item.attendance,
      tardy: item.tardy,
      absent: item.absent,
      lecture_grade: item.lecture_grade,
      lecture_semester: item.lecture_semester,
      lecture_credit: item.lecture_credit,
      lecture_grades: item.lecture_grades
    }));
    res.json({ data: processedData });
    console.log("[LoginScreen -> MainScreen] : 해당 학생 과목정보 가져오기 성공");
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

app.post('/updatelecture', async (req, res) => {
  const { nonattendance, attendance, tardy, absent, weeknum, student_id, lecture_id } = req.body;
  console.log("성공적으로 값 넣음");
  try {
    await Updatelecture(student_id, lecture_id, nonattendance, attendance, tardy, absent, weeknum); // await 추가
    console.log("성공적으로 업데이트 됨");
    res.status(200).send({ message: "과목 업데이트가 완료되었습니다." });
  } catch (error) {
    console.error("계정 업데이트 실패", error);
    res.status(500).send({ message: "과목 업데이트 실패" });
  }
});

//상품 등록하기
app.post('/postItem', async (req, res) => {
  const { campus_id, name, price, code_num, using_time, image_num, sell_check, explain } = req.body;
  
  try {
    await PostItem(campus_id, name, price, code_num, using_time, image_num, sell_check, explain); // 비동기 함수 호출
    console.log("성공적으로 상품 등록");
    
    // 클라이언트에 응답을 보내기
    res.json({ message: '성공적으로 상품이 등록되었습니다.' });
  } catch (error) {
    console.error("상품 등록 중 오류 발생:", error);
    
    // 에러 발생 시 클라이언트에 오류 응답 보내기
    res.status(500).json({ message: '상품 등록에 실패했습니다.' });
  }
});

//상품 편집하기
app.post('/updateItem', async (req, res) => {
  const { name, newname, price, using_time, image_num, sell_check, explain } = req.body;

  try {
    await UpdateItem(name, newname, price, using_time, image_num, sell_check, explain);
    console.log("성공적으로 상품 편집");

    // 클라이언트에게 응답 반환
    res.json({ message: '성공적으로 상품이 편집되었습니다.' });
  } catch (error) {
    console.error("상품 편집 중 오류 발생:", error);

    // 오류 발생 시 클라이언트에게 오류 응답 반환
    res.status(500).json({ message: '상품 편집에 실패했습니다.' });
  }
});

// 상품 삭제하기
app.post('/deleteItem', async (req, res) => {
  const { name, deletenum } = req.body;

  try {
    await DeleteItem(name, deletenum);
    console.log("성공적으로 상품 삭제");

    // 클라이언트에게 응답 반환
    res.json({ message: '성공적으로 상품이 삭제되었습니다.' });
  } catch (error) {
    console.error("상품 삭제 중 오류 발생:", error);

    // 오류 발생 시 클라이언트에게 오류 응답 반환
    res.status(500).json({ message: '상품 삭제에 실패했습니다.' });
  }
});

// 유저 삭제하기
app.post('/delete_user', async (req, res) => {
  const { user_pk } = req.body;

  try {
    await DeleteUser(user_pk);
    console.log("성공적으로 유저 삭제");

    // 클라이언트에게 응답 반환
    res.json({ message: '성공적으로 유저가 삭제되었습니다.' });
  } catch (error) {
    console.error("유저 삭제 중 오류 발생:", error);

    // 오류 발생 시 클라이언트에게 오류 응답 반환
    res.status(500).json({ message: '유저 삭제에 실패했습니다.' });
  }
});

//학과 이름 가져오기
app.post('/get_department_name', async (req, res) => {
  try {
    const { department_name } = req.body; //데이터 가져올때 무조건 awit
    const rows = await get_department_name(department_name);
    const Department = {
      userdepartment: rows[0].name
    };
    res.json(Department);
    console.log("[MainScreen or AdminMain] : 학과 이름 가져오기 성공");
  } catch {
    console.log("[MainScreen or AdminMain] : 학과 이름 가져오기 실패");
    res.status(500).json({ error: 'Internal Server Error' });
  }

});

// 학교 정보 가져오기
app.post('/get_department', async (req, res) => {
  const { campus_id } = req.body;
  try {
    const rows = await get_department(campus_id);
    const processedData = rows.map(item => ({
      department_name: item.name
    }));
    console.log("[UserManagement or CheckReportPost] : 전체 학과 이름 가져오기 성공");
    res.json(processedData);
  } catch (error) {
    console.log("[UserManagement or CheckReportPost] : 전체 학과 이름 가져오기 실패");
    res.status(500).json({ error: 'Internal Server Error' });
  }
});



//학교 이름 가져오기
app.post('/get_university_name', async (req, res) => {
  try {
    const { university_name } = req.body; //데이터 가져올때 무조건 awit
    const rows = await get_university_name(university_name);
    const University = {
      useruniversity: rows[0].name
    };
    res.json(University);
    console.log("[StudentInfoScreen] : 학교 이름 가져오기 성공");
  } catch (error) {
    console.log("[StudentInfoScreen] : 학교 이름 가져오기 실패");
    res.status(500).json({ error: 'Internal Server Error' });
  }

});

//계정 삭제
app.post('/delete_user', async (req, res) => {
  const { user_pk } = req.body;
  try {
    await DeleteUser(user_pk);
    console.log("계정 삭제 완료");
    res.status(200).send({ message: "계정 삭제가 완료되었습니다." }); // 클라이언트에 응답 전송
  } catch (error) {
    console.error("계정 삭제 실패:", error);
    res.status(500).send({ message: "계정 삭제 실패" }); // 클라이언트에 응답 전송
  }
});

//계정 업데이트
app.post('/updateAccount', async (req, res) => {
  const { email, grade, currentstatus, student_id } = req.body;
  try {
    Updateaccount(email, grade, currentstatus, student_id);
    console.log("[StudentInfoScreen] : 계정 정보 업데이트 성공");
    res.status(200).send({ message: "계정 업데이트가 완료되었습니다." }); // 클라이언트에 응답 전송
  } catch (error) {
    console.log("[StudentInfoScreen] : 계정 정보 업데이트 실패");
    res.status(500).send({ message: "계정 업데이트 실패" }); // 클라이언트에 응답 전송
  }
});

//이미지 업데이트
app.post('/updateImg', async (req, res) => {
  const { profilePhoto, user_id } = req.body;
  try {
    UpdateImg(profilePhoto, user_id);
    console.log("[StudentInfoScreen] : 계정 이미지 업데이트 성공");
    res.status(200).send({ message: "이미지 업데이트가 완료되었습니다." }); // 클라이언트에 응답 전송
  } catch (error) {
    console.log("[StudentInfoScreen] : 계정 이미지 업데이트 실패");
    res.status(500).send({ message: "이미지 업데이트 실패" }); // 클라이언트에 응답 전송
  }
});

//사용자의 현제 책갈피 정보를 가져옴
app.post('/get_user_have_post', async (req, res) => {
  try {
    const { user_id } = req.body; //데이터 가져올때 무조건 awit
    const rows = await get_user_have_posts(user_id);
    const user_have_posts = rows.map(item => ({
      user_id: item.user_id,
      post_id: item.post_id
    }));
    console.log("[All Post Screen] : 사용자의 책갈피 정보 가져오기 성공");
    res.json(user_have_posts);
  } catch (error) {
    console.log("[All Post Screen] : 사용자의 책갈피 정보 가져오기 실패");
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

//책갈피 추가 삭제
app.post('/add_book_mark', async (req, res) => {
  try {
    const { user_id, post_id } = req.body; //1번 body에서 값 추출

    const result = await add_book_mark(user_id, post_id); //2번 db실행
    if (result === true) {
      console.log("[All Post Screen] : 포스터 책갈피 등록 성공");
      res.status(200).send({ message: "북마크 추가 완료" });
    }
  } catch (error) {
    console.log("[All Post Screen] : 포스터 책갈피 등록 실패");
    res.status(500).send({ message: "서버 오류" });
  }
});

//책갈피 삭제
app.post('/delete_book_mark', async (req, res) => {
  try {
    const { user_id, post_id } = req.body; //1번 body에서 값 추출

    const deleteResult = await delete_book_mark(user_id, post_id);
    if (deleteResult === true) {
      console.log("[All Post Screen] : 포스터 책갈피 삭제 성공");
      res.status(200).send({ message: "북마크 삭제 완료" });
    }
  } catch (error) {
    console.log("[All Post Screen] : 포스터 책갈피 삭제 성공");
    res.status(500).send({ message: "서버 오류" });
  }
})

//포스트 댓글 리스트 불러오기
app.post('/get_comment', async (req, res) => {
  const { post_ida } = req.body; //데이터 가져올때 무조건 awit
  try {
    const rows = await getComment(post_ida);
    const commentdata = rows.map(item => ({
      comment_id: item.comment_id,
      content: item.contents,
      date: formatDate(item.date),
      like: item.like,
      student_name: item.student_name,
      department_name: item.department_name,
      user_id: item.user_id,
      post_id: item.post_id,
      user_profile: item.profilePhoto
    }));
    console.log("[PostDetailScreen] : 댓글 내용 및 정보 가져오기 성공");
    res.json(commentdata);
  } catch (error) {
    console.log("[PostDetailScreen] : 댓글 내용 및 정보 가져오기 실패");
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// 학교 건물 정보 가져오기
app.get('/getSchoolBuildingInfo', async (req, res) => {
  try {
    const rows = await get_campus_building_Info();
    const processedData = rows.map(item => ({
      campus_id: item.campus_id,
      building_name: item.building_name,
      campus_place: item.campus_place,
      latitude: item.latitude,
      longitude: item.longitude
    }));
    console.log("[SchoolInfoScreen] : 학교 건물 정보 가져오기 성공");
    res.json(processedData);
  } catch (error) {
    console.log("[SchoolInfoScreen] : 학교 건물 정보 가져오기 성공");
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// 학교 정보 가져오기
app.get('/getSchoolInfo', async (req, res) => {
  try {
    const rows = await get_campus_Info();
    const processedData = rows.map(item => ({
      department_id: item.department_id,
      department_name: item.department_name,
      campus_id: item.campus_id,
      campus_name: item.campus_name,
      department_phone: item.department_phone,
      department_floor: item.department_floor,
      department_building: item.department_building
    }));
    console.log("[SchoolInfoScreen] : 학교 정보 가져오기 성공");
    res.json(processedData);
  } catch (error) {
    console.log("[SchoolInfoScreen] : 학교 정보가져오기 실패");
    res.status(500).json({ error: 'Internal Server Error' });
  }
});


//포스터 대댓글 하나 가져오기
app.post('/get_recomment', async (req, res) => {
  const { comment_id } = req.body; //데이터 가져올때 무조건 awit
  try {
    const rows = await getReComment(comment_id);
    const recommentdata = rows.map(item => ({
      recomment_id: item.recomment_id,
      comment_id: item.comment_id,
      student_name: item.student_name,
      department_name: item.department_name,
      content: item.contents,
      user_id: item.user_id,
      date: formatDate(item.date),
      like: item.like,
      user_profile: item.profilePhoto,
    }));
    console.log("[PostDetailScreen] : 대댓글 내용 및 정보 가져오기 성공");
    res.json(recommentdata);
  } catch (error) {
    console.log("[PostDetailScreen] : 대댓글 내용 및 정보 가져오기 실패");
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

//이미지 업로드 및 DB저장
app.post('/upload', upload.array('images'), async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).send('No files uploaded');
    }
    const fileNamesString = req.files.map(file => file.filename).join(', ');
    console.log(`[StudentInfoScreen] : 서버에 사진 저장 성공(${fileNamesString})`);
    res.send(fileNamesString);
  } catch (error) {
    console.log(`[StudentInfoScreen] : 서버에 사진 저장 실패`);
    res.status(500).send({ message: 'Internal Server Error' });
  }
});

//게시물 댓글 달기
app.post('/writecomment', async (req, res) => {
  try {

    const { post_id, user_id, contents } = req.body;
    const result = await post_comment(post_id, user_id, contents);
    if (result == true) {
      console.log("[PostDetailScreen] : 댓글 달기 성공");
      res.json(result);
    } else if (result == false) {
      console.log("댓글 안달림");
      res.json(result);
    }
  } catch (error) {
    console.log("[PostDetailScreen] : 댓글 달기 실패");
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

//게시물 대댓글 달기
app.post('/rewritecomment', async (req, res) => {
  try {
    const { comment_id, user_id, contents } = req.body;
    const result = await post_recomment(comment_id, user_id, contents);
    if (result == true) {
      console.log("[PostDetailScreen] : 대댓글 달기 성공");
      res.json(result);
    } else if (result == false) {
      console.log("대댓글 안달림");
      res.json(result);
    }
  } catch (error) {
    console.log("[PostDetailScreen] : 대댓글 달기 실패");
    res.status(500).json({ error: 'Internal Server Error' });
  }
});


app.post('/post_like_up', async (req, res) => {
  try {
    const { post_id } = req.body; //1번 body에서 값 추출
    const result = await post_like_up(post_id);

    if (result === true) {
      console.log("[PostDetailScreen or NoticePostDetailScreen] : 포스터 좋아요 누르기 성공");
      res.status(200).send({ message: "포스터 좋아요 누르기 성공" });
    }
  } catch (error) {
    console.log("[PostDetailScreen or NoticePostDetailScreen] : 포스터 좋아요 누르기 실패");
    res.status(500).send({ message: "서버 오류" });
  }
});

app.post('/post_like_down', async (req, res) => {
  try {
    const { post_id } = req.body; //1번 body에서 값 추출
    const result = await post_like_down(post_id);

    if (result === true) {
      console.log("[PostDetailScreen or NoticePostDetailScreen] : 포스터 좋아요 취소 누르기 성공");
      res.status(200).send({ message: "포스터 좋아요 취소누르기 성공" });
    }
  } catch (error) {
    console.log("[PostDetailScreen or NoticePostDetailScreen] : 포스터 좋아요 취소 누르기 실패");
    res.status(500).send({ message: "서버 오류" });
  }
});


app.post('/comment_like_up', async (req, res) => {
  try {
    const { comment_id } = req.body; //1번 body에서 값 추출
    const result = await comment_like_up(comment_id);

    if (result === true) {
      console.log("[PostDetailScreen] : 댓글 좋아요 누르기 성공");
      res.status(200).send({ message: "댓글 좋아요 누르기 성공" });
    }
  } catch (error) {
    console.log("[PostDetailScreen] : 댓글 좋아요 누르기 실패");
    res.status(500).send({ message: "서버 오류" });
  }
});

app.post('/comment_like_num_down', async (req, res) => {
  try {
    const { comment_id } = req.body; //1번 body에서 값 추출
    const result = await comment_like_num_down(comment_id);

    if (result === true) {
      console.log("[PostDetailScreen] : 댓글 좋아요 누르기 성공");
      res.status(200).send({ message: "댓글 좋아요 누르기 성공" });
    }
  } catch (error) {
    console.log("[PostDetailScreen] : 댓글 좋아요 누르기 실패");
    res.status(500).send({ message: "서버 오류" });
  }
});

app.post('/recomment_like_up', async (req, res) => {
  try {
    const { recomment_id } = req.body; //1번 body에서 값 추출
    const result = await recomment_like_up(recomment_id);

    if (result === true) {
      console.log("[PostDetailScreen] : 대댓글 좋아요 누르기 성공");
      res.status(200).send({ message: "대댓글 좋아요 누르기 성공" });
    }
  } catch (error) {
    console.log("[PostDetailScreen] : 대댓글 좋아요 누르기 실패");
    res.status(500).send({ message: "서버 오류" });
  }
});

app.post('/recomment_like_num_down', async (req, res) => {
  try {
    const { recomment_id } = req.body; //1번 body에서 값 추출
    const result = await recomment_like_num_down(recomment_id);

    if (result === true) {
      console.log("[PostDetailScreen] : 대댓글 좋아요 내리기 성공");
      res.status(200).send({ message: "대댓글 좋아요 내리기 성공" });
    }
  } catch (error) {
    console.log("[PostDetailScreen] : 대댓글 좋아요 내리기 실패");
    res.status(500).send({ message: "서버 오류" });
  }
});

//게시물 쓰기
app.post('/write_post', async (req, res) => {
  try {
    const { user_id, department_check, inform_check, contest_check, Club_check, title, contents, url, sources } = req.body;
    console.log(url);
    console.log(sources);
    const postId = await write_post(user_id, department_check, inform_check, contest_check, title, contents,  url, sources, Club_check);

    if (postId) {
      console.log("[WritePostScreen or NoticeWritePostScreen] : 게시물 작성 성공");
      res.status(200).json({ postId });
    } else {
      res.json({ success: false });
    }
  } catch (error) {
    console.log("[WritePostScreen or NoticeWritePostScreen] : 게시물 작성 실패");
    res.json({ success: false, error: error.message });
  }
});

//게시물 사진 등록
app.post('/RegistorPostPhoto', async (req, res) => {
  const { post_id, post_photo } = req.body;
  try {
    await RegistorPostPhoto(post_id, post_photo);
    console.log("[WritePostScreen or NoticeWritePostScreen] : 게시물 사진등록 성공");
    res.status(200).json({ message: '서버가 잘 마무리되었습니다.' });
  } catch (error) {
    console.log("[WritePostScreen or NoticeWritePostScreen] : 게시물 사진등록 실패");
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

//게시물 수정
app.post('/update_post', async (req, res) => {
  try {
    const { post_id, department_check, inform_check, contest_check, Club_check, url, sources, title, contents } = req.body;
    const postId = await update_post(post_id, department_check, contest_check, Club_check, url, sources, inform_check, title, contents);

    if (postId) {
      console.log("[WritePostScreen or NoticeWritePostScreen] : 게시물 수정 성공");
      res.status(200).json({ postId });
    } else {
      res.json({ success: false });
    }
  } catch (error) {
    console.log("[WritePostScreen or NoticeWritePostScreen] : 게시물 수정 실패");
    res.json({ success: false, error: error.message });
  }
});



//게시물 찾기
app.post('/search_post', async (req, res) => {
  const { search_text } = req.body;
  try {
    const rows = await searchPost(search_text);
    const processedData = rows.map(item => ({
      post_id: item.post_id,
      title: item.title,
      contents: item.contents,
      date: formatDate(item.date),
      view: item.view,
      like: item.like,
      name: item.name,
      user_title: item.user_title,
      department_check: item.department_check,
      inform_check: item.inform_check,
      contest_check : item.contest_check,
      Club_check : item.Club_check,
      sources : item.sources,
      url : item.url
    }));
    console.log("[SearchPostScreen] : 찾는 게시물 정보 가져오기 성공");
    res.json(processedData);
  } catch (error) {
    console.log("[SearchPostScreen] : 찾는 게시물 정보 가져오기 성공");
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

//View count up!
app.post('/view_count_up', async (req, res) => {
  try {
    const { post_id } = req.body; //1번 body에서 값 추출
    const result = await view_count_up(post_id);

    if (result === true) {
      console.log("[GeneralPostsScreen -> PostDetailScreen or NoticePostDetailScreen] : 해당 포스터 View 횟수 증가 성공");
      res.status(200).send({ message: "view 횟수 증가!" });
    }
  } catch (error) {
    console.log("[GeneralPostsScreen -> PostDetailScreen or NoticePostDetailScreen] : 해당 포스터 View 횟수 증가 실패");
    res.status(500).send({ message: "서버 오류" });
  }
});

//아이템 하나 가져오기!
app.post('/get_one_Item', async (req, res) => {
  const { item_name } = req.body;
  try {
    const rows = await Get_One_Event_Item(item_name);
    const processedData = {
      object_id: rows[0].object_id,
      campus_id: rows[0].campus_id,
      name: rows[0].name,
      price: rows[0].price,
      code_num: rows[0].code_num,
      using_time: rows[0].using_time,
      image_num: rows[0].image_num,
      sell_check: rows[0].sell_check,
      explain: rows[0].explain,
    };
    console.log("[EventShopScreen] : 하나의 상품 정보 가져오기 성공");
    res.json(processedData);
  } catch (error) {
    console.log("[EventShopScreen] : 하나의 상품 정보 가져오기 실패");
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

app.post('/get_post_detail', async (req, res) => {
  const { post_id } = req.body; //데이터 가져올때 무조건 awit
  try {
    const row = await get_post_detail(post_id);
    const userData = {
      post_writer: row[0].student_name,
      writer_department: row[0].department_name,
      write_date: formatDate2(row[0].date),
      title: row[0].title,
      contents: row[0].contents,
      like: row[0].like,
      view: row[0].view,
      writer_propile: row[0].profilePhoto,
      post_id: row[0].post_id,
      user_id: row[0].user_id,
      url : row[0].url,
      source : row[0].source,
      contest_check : row[0].contest_check
    };
    console.log("[PostDetailScreen or NoticePostDetailScreen] : 자세한 포스터 내용 가져오기 성공");
    res.json(userData);
  } catch (error) {
    console.log("[PostDetailScreen or NoticePostDetailScreen] : 자세한 포스터 내용 가져오기 실패");
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

//유저가 보유하고있는 쿠폰 목록
app.post('/DetailPostPhoto', async (req, res) => {
  const { post_id } = req.body;
  try {
    const rows = await DetailPostPhoto(post_id);
    const processedData = rows.map(item => ({
      post_id : item.post_id,
      post_photo : item.post_photo
    }));
    console.log("[PostDetailScreen or NoticePostDetailScreen] : 자세한 포스터 내용 사진 가져오기 성공");
    res.json(processedData);
  } catch (error) {
    console.log("[PostDetailScreen or NoticePostDetailScreen] : 자세한 포스터 내용 사진 가져오기 실패");
    res.status(500).json({ error: 'Internal Server Error' });
  }
});


app.post('/update_object', async (req, res) => {
  try {
    const { object_pk } = req.body; //1번 body에서 값 추출
    const result = await update_object(object_pk);

    if (result === true) {
      console.log("[EventShopScreen] : 상점 업데이트 성공");
      res.status(200).send({ message: "구매 성공" });
    }
  } catch (error) {
    console.log("[EventShopScreen] : 상점 업데이트 실패");
    res.status(500).send({ message: "서버 오류" });
  }
});

app.post('/insert_user_have_object', async (req, res) => {
  try {
    const { user_id, object_id } = req.body;
    const result = await insert_user_have_object(user_id, object_id);
    if (result == true) {
      console.log("[EventShopScreen] : 물품 사기 성공");
      res.json(result);
    } else if (result == false) {
      console.log("[EventShopScreen] : 물품 사기 실패");
      res.json(result);
    }
  } catch (error) {
    console.log("[EventShopScreen] : 물품 사기 실패");
    res.json(result);
  }
});


//유저가 보유하고있는 쿠폰 목록
app.post('/getUserHaveCoupon', async (req, res) => {
  const { user_id } = req.body;
  try {
    const rows = await getUserHaveCoupon(user_id);
    const processedData = rows.map(item => ({
      code_num: item.code_num,
      explain: item.explain,
      image_num: item.image_num,
      name: item.name,
      object_id: item.object_id,
      price: item.price,
      sell_check: item.sell_check,
      using_time: item.using_time,
      buy_date: item.buy_date,
      using_check: item.using_check,
      using_date: item.using_date

    }));
    console.log("[EventHaveCouponScreen] : 유저 쿠폰 정보 전부 가져오기 성공");
    res.json(processedData);
  } catch (error) {
    console.log("[EventHaveCouponScreen] : 유저 쿠폰 정보 전부 가져오기 실패");
    res.status(500).json({ error: 'Internal Server Error' });
  }
});


app.post('/get_user_point', async (req, res) => {
  const { user_id } = req.body;
  try {
    const rows = await getyourpoint(user_id);
    console.log("[MainScreen] : 유저 포인트 가져오기 성공")
    res.json(rows[0]);
  } catch (error) {
    console.log("[MainScreen] : 유저 포인트 가져오기 실패")
    res.status(500).json({ error: 'Internal Server Error' });
  }

})

app.post('/user_buy_action', async (req, res) => {
  try {
    const { user_pk, price } = req.body; //1번 body에서 값 추출
    const result = await update_user_point(user_pk, price);

    if (result === true) {
      console.log("[EventShopScreen] : 포인트 차감 성공");
      res.status(200).send({ message: "포인트 차감 성공" });
    }
  } catch (error) {
    console.log("[EventShopScreen] : 포인트 차감 실패");
    res.status(500).send({ message: "서버 오류" });
  }
});


app.post('/studyroomReservation', async (req, res) => {
  const { student, study_room, study_room_date, study_room_time } = req.body;
  try {
    const result = await insert_student_study_room(student, study_room, study_room_date, study_room_time);
    if (result) {
      console.log("[StudyRoomScreen] : 스터디룸 예약 성공");
      res.json({ message: 'Data received successfully', receivedData: { student, study_room, study_room_date, study_room_time } });
    } else {
      console.log("[StudyRoomScreen] : 스터디룸 예약 실패");
      res.status(500).json({ message: 'Failed to insert data' });
    }
  } catch (error) {
  }
});


app.post('/get_study_date_time', async (req, res) => {
  try {
    const rows = await get_studyroom_date();
    const processedData = rows.map(item => ({
      study_room_name: item.study_room_name,
      study_room_date: item.study_room_date,
      study_room_time: item.study_room_time
    }));
    console.log("[StudyRoomScreen] : 학교 스터디룸 정보[2] 가져오기 성공");
    res.json(processedData);
  } catch (error) {
    console.log("[StudyRoomScreen] : 학교 스터디룸 정보[2] 가져오기 실패");
    res.status(500).json({ error: 'Internal Server Error' });
  }
})

//유저의 알람 정보를 가져온다.
app.post('/get_aram_data', async (req, res) => {
  const { user_id } = req.body;
  try {
    const rows = await get_aram_data(user_id);
    const processedData = rows.map(item => ({
      aram_id: item.aram_id,
      user_id: item.user_id,
      target_id: item.target_id,
      title: item.title,
      target_type: item.target_type,
      time: formatDate(item.time),
      post_comment_id: item.post_comment_id,
      post_comment_title: item.post_comment_title,
      hot_post_id: item.hot_post_id,
      hot_post_title: item.hot_post_title,
      school_notice_id: item.school_notice_id,
      school_notice_title: item.school_notice_title,
      department_notice_id: item.department_notice_id,
      department_notice_title: item.department_notice_title,
      my_post_like_id: item.my_post_like_id,
      my_post_like_title: item.my_post_like_title,
      new_event_id: item.new_event_id,
      new_event_name: item.new_event_name,
      friend_code_id: item.friend_code_id,
      friend_code_my_name: item.friend_code_my_name,
      report_post_id: item.report_post_id,
      report_post_title: item.report_post_title,
      report_comment_id: item.report_comment_id,
      report_comment_title: item.report_comment_title,
      good_event_id: item.good_event_id,
      good_event_name: item.good_event_name,
      comment_post_id: item.comment_post_id,
      comment_contents: item.comment_contents,
      comment_comment_id: item.comment_comment_id,
      recomment_recomment_id: item.recomment_recomment_id,
      recomment_comment_id: item.recomment_comment_id,
      recomment_contents: item.recomment_contents,
      my_club_register_post_id : item.my_club_register_post_id,
      my_club_register_comment : item.my_club_register_comment,
      delete_post_id : item.delete_post_id,
      delete_post_reason : item.delete_post_reason,
      delete_post_title : item.delete_post_title
    }));
    console.log("[AlarmDialogScreen] : 해당 유저의 모든 알람 데이터 가져오기 성공");
    res.json(processedData);
  } catch (error) {
    console.log("[AlarmDialogScreen] : 해당 유저의 모든 알람 데이터 가져오기 실패");
    console.log(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

app.post('/go_post_detail', async (req, res) => {
  const { post_id } = req.body;
  try {
    const rows = await get_one_post(post_id);
    const processedData = rows.map(item => ({
      post_id: item.post_id,
      title: item.title,
      contents: item.contents,
      date: formatDate(item.date),
      view: item.view,
      like: item.like,
      name: item.name,
      admin_check: item.admin_check,
    }));
    console.log("[AlarmDialogScreen] : 해당 알람 포스터 데이터 가져오기 성공");
    res.json(processedData);
  } catch (error) {
    console.log("[AlarmDialogScreen] : 해당 알람 포스터 데이터 가져오기 실패");
    res.status(500).json({ error: 'Internal Server Error' });
  }
});


//댓글 알람 전송
app.post('/addCommentAram', async (req, res) => {
  try {
    const { user_id, target_id } = req.body;
    const result = await addCommentAram(user_id, target_id);
    if (result == true) {
      console.log("[PostDetailScreen] : 댓글 알람 보내기 성공");
      res.json(result);
    } else if (result == false) {
      console.log("알람 안보냄");
      res.json(result);
    }
  } catch (error) {
    console.log("[PostDetailScreen] : 댓글 알람 보내기 실패");
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

//댓글 알람 전송
app.post('/addGoodEventAram', async (req, res) => {
  try {
    const { user_id, target_id } = req.body;
    const result = await addGoodEventAram(user_id, target_id);
    if (result == true) {
      console.log("[ParticipantEvnet] : 이벤트 당첨 알람보내기 성공");
      res.json(result);
    } else if (result == false) {
      console.log("[ParticipantEvnet] : 이벤트 당첨 알람보내기 실패");
      res.json(result);
    }
  } catch (error) {
    console.error("알람 보내기 실패:", error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

//핫 포스터 알람 전송
app.post('/addHotAram', async (req, res) => {
  try {
    const { target_id } = req.body;
    await addHotAram(target_id);
    console.log("[PostDetailScreen] : 포스터 좋아요 30개 알람 전송 성공");
    res.status(200).json({ message: '서버 성공' })
  } catch (error) {
    console.log("[PostDetailScreen] : 포스터 좋아요 30개 알람 전송 실패");
    res.status(500).json({ error: '서버 오류' });
  }
});
app.post('/reportPostAram', async (req, res) => {
  try {
    const { target_id } = req.body;
    await reportPostAram(target_id);
    console.log("[PostDetailScreen] : 포스터 신고 접수 알람 전송 성공");
    res.status(200).json({ message: '서버가 잘 마무리되었습니다.' });

  } catch (error) {
    console.log("[PostDetailScreen] : 포스터 신고 접수 알람 전송 실패");
    res.status(500).json({ message: '서버가 잘 마무리되지않았습니다.' });

  }
});

app.post('/reportCommentAram', async (req, res) => {
  try {
    const { target_id } = req.body;
    await reportCommentAram(target_id);
    console.log("[PostDetailScreen] : 댓글 및 대댓글 신고 접수 알람 전송 성공");
    res.status(200).json({ message: '서버가 잘 마무리되었습니다.' })
  } catch (error) {
    console.log("[PostDetailScreen] : 댓글 및 대댓글 신고 접수 알람 전송 실패");
    res.status(200).json({ message: '서버가 잘 마무리되지않았습니다.' })
  }
});

app.post('/addSchoolNoticeAram', async (req, res) => {
  try {
    const { target_id } = req.body;
    await addSchoolNoticeAram(target_id);
    console.log("[NoiceWritePostScreen] : 학교 공지사항 알람 전송 성공");
    res.status(200).json({ message: '서버가 잘 마무리되었습니다.' });


  } catch (error) {
    console.error("알람 보내기 실패:", error);
    console.log("[NoiceWritePostScreen] : 학교 공지사항 알람 전송 실패");
    res.status(500).json({ message: '서버가 잘 마무리되지않았습니다.' });
  }
});

app.post('/addDepartmentNoticeAram', async (req, res) => {
  try {
    const { target_id } = req.body;
    await addDepartmentNoticeAram(target_id);
    console.log("[NoiceWritePostScreen] : 학과 공지사항 알람 전송 성공");
    res.status(200).json({ message: '서버가 잘 마무리되었습니다.' });

  } catch (error) {
    console.log("[NoiceWritePostScreen] : 학과 공지사항 알람 전송 성공");
    res.status(500).json({ message: '서버가 잘 마무리되지않았습니다.' });
  }
});

//새로운 이벤트 등록 알람
app.post('/addNewEventAram', async (req, res) => {
  try {
    const { target_id } = req.body;
    await addNewEventAram(target_id);
    console.log("[RegisterEvent] : 이벤트 등록 알람 전송 성공");
    res.status(200).json({ message: '서버가 잘 마무리되었습니다.' });

  } catch (error) {
    console.log("[RegisterEvent] : 이벤트 등록 알람 전송 실패");
    res.status(500).json({ message: '서버가 잘 마무리되지않았습니다.' });
  }
});

//좋아요 눌러주면 해당 당사자에게 알람이 쑝숑쑝~
app.post('/addLikeAram', async (req, res) => {
  try {
    const { user_id, target_id } = req.body;
    const result = await addLikeAram(user_id, target_id);
    if (result == true) {
      console.log("[PostDetailScreen] : 포스트 좋아요 알람 보내기 성공");
      res.json(result);
    } else if (result == false) {
      console.log("알람 안보냄");
      res.json(result);
    }
  } catch (error) {
    console.log("[PostDetailScreen] : 포스터를 좋아요 알람 보내기 실패");
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

app.post('/addCommentLikeAram', async (req, res) => {
  try {
    const { user_id, target_id } = req.body;
    const result = await addCommentLikeAram(user_id, target_id);
    if (result == true) {
      console.log("[PostDetailScreen] : 댓글 좋아요 알람 보내기 성공");
      res.json(result);
    } else if (result == false) {
      console.log("알람 안보냄");
      res.json(result);
    }
  } catch (error) {
    console.log("[PostDetailScreen] : 댓글 좋아요 알람 보내기 실패");
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

app.post('/addRecommentLikeAram', async (req, res) => {
  try {
    const { user_id, target_id } = req.body;
    const result = await addRecommentLikeAram(user_id, target_id);
    if (result == true) {
      console.log("[PostDetailScreen] : 대댓글 좋아요 알람 보내기 성공");
      res.json(result);
    } else if (result == false) {
      console.log("알람 안보냄");
      res.json(result);
    }
  } catch (error) {
    console.log("[PostDetailScreen] : 대댓글 좋아요 알람 보내기 실패");
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

app.post('/getAppAttendanceDate', async (req, res) => {
  const { user_id } = req.body;
  try {
    const rows = await getAppAttendanceDate(user_id);
    const processedData = rows.map(item => ({
      user_id: item.user_id,
      date: item.date,
      attendance_check: item.attendance_check
    }));
    console.log("[AttendanceCheckEventScreen] : 유저의 앱 출석체크 데이터 가져오기 성공");
    res.json(processedData);
  } catch (error) {
    console.log("[AttendanceCheckEventScreen] : 유저의 앱 출석체크 데이터 가져오기 실패");
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

app.post('/addAppAttendanceDate', async (req, res) => {
  const { user_id, date } = req.body;
  try {
    await addAppAttendanceDate(user_id, date);
    console.log("[AttendanceCheckEventScreen] : 유저의 앱 출석체크 성공");
    res.status(200).json({ message: '서버가 잘 마무리되었습니다.' });

  } catch (error) {
    console.log("[AttendanceCheckEventScreen] : 유저의 앱 출석체크 실패");
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

app.post('/user_update_point2', async (req, res) => {
  const { user_id, point } = req.body;
  try {
    await update_user_point_2(user_id, point);
    console.log("[AttendanceCheckEventScreen] : 유저의 포인트 증가 성공");
    res.status(200).json({ message: '서버가 잘 마무리되었습니다.' });
  } catch (error) {
    console.log("[AttendanceCheckEventScreen] : 유저의 포인트 증가 실패");
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

app.post('/get_invite_num', async (req, res) => {
  const { friend_code } = req.body;
  try {
    const rows = await get_invite_num(friend_code);
    const processedData = rows.map(item => ({
      friend_code_ID: item.friend_code_id,
      user_id: item.user_id,
      friend_code: item.friend_code,
      my_name: item.my_name
    }));
    console.log("[FriendCodeEventScreen] : 해당 유저의 친구 코드 정보 가져오기 성공");
    res.json(processedData);
  } catch (error) {
    console.log("[FriendCodeEventScreen] : 해당 유저의 친구 코드 정보 가져오기 실패");
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

app.post('/check_end_send', async (req, res) => {
  try {
    const { user_id, friend_code, user_name } = req.body;
    const AlluserCode = await allUser_Friend_code2();
    const isFriendCodehave = AlluserCode.some(item => item.friend_code === friend_code);
    if (isFriendCodehave == true) {
      const allFriendCode = await allUser_friend_code(user_id);
      const isFriendCodeExists = allFriendCode.some(item => item.friend_code === friend_code);
      if (isFriendCodeExists == true) {
        console.log("[FriendCodeEventScreen] : 친구 코드 중복 검사 성공");
        res.json({ success: "중복코드" });
      } else if (isFriendCodeExists == false) {
        const result = await addFriend_Code(user_id, friend_code, user_name);
        if (result == true) {
          console.log("[FriendCodeEventScreen] : 친구 코드 중복 검사 성공");
          res.json({ success: "성공" });
        }
      }
    } else {
      console.log("[FriendCodeEventScreen] : 친구 코드 중복 검사 성공");
      res.json({ success: "코드없음" });
    }
  } catch (error) {
    console.log("[FriendCodeEventScreen] : 친구 코드 중복 검사 실패");
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

app.post('/Friend_code_User_id', async (req, res) => {
  const { friend_code } = req.body;
  try {
    const rows = await Friend_code_User_id(friend_code);
    const user_pk = { user_pk: rows[0].user_id }
    res.json(user_pk);
    console.log("성공적으로 데이터 보냄");
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

app.post('/last_friendCode_Info', async (req, res) => {
  const { user_pk } = req.body;
  try {
    const rows = await last_friendCode_Info(user_pk);
    const processedData = {
      friend_code_id: rows.friend_code_id,
      user_id: rows.user_id,
      friend_code: rows.friend_code,
      my_name: rows.my_name
    };
    console.log("[FriendCodeEventScreen] : 친구 코드 입력 성공");
    res.json(processedData);
  } catch (error) {
    console.log("[FriendCodeEventScreen] : 친구 코드 입력 실패");
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

//친구코드 알람이 쇽쇽쇽!
app.post('/addFriendCodeAram', async (req, res) => {
  try {
    const { friend_code, friend_code_id, my_name } = req.body;
    const rows = await Friend_code_User_id(friend_code);
    const user_pk = rows[0].user_id
    await addFriendCodeAram(user_pk, friend_code_id, my_name);
    console.log("[FriendCodeEventScreen] : 친구 코드 알람 전송 성공");
    res.status(200).json({ message: '서버가 잘 마무리되었습니다.' });
  } catch (error) {
    console.log("[FriendCodeEventScreen] : 친구 코드 알람 전송 실패");
    res.status(500).json({ message: '서버가 잘 마무리되지않았습니다.' });
    console.error("알람 보내기 실패:", error);
  }
});

app.post('/user_update_point_3', async (req, res) => {
  const { user_id, point } = req.body;
  try {
    await user_update_point_3(user_id, point);
    console.log("[FriendCodeEventScreen] : 유저 포인트 증가 성공");
    res.status(200).json({ message: '서버가 잘 마무리되었습니다.' });
  } catch (error) {
    console.log("[FriendCodeEventScreen] : 유저 포인트 증가 실패");
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

app.post('/get_campus_place', async (req, res) => {
  const { campus_id } = req.body;
  try {
    const rows = await getCampus(campus_id);
    const processedData = rows.map(item => ({
      study_room_id: item.study_room_id,
      campus_place: item.campus_place,
      study_room_name: item.study_room_name,
      image: item.image
    }));
    console.log("[StudyRoomScreen] : 학교 스터디룸 정보[1] 가져오기 성공");
    res.json(processedData);
  } catch (error) {
    console.log("[StudyRoomScreen] : 학교 스터디룸 정보[1] 가져오기 실패");
    res.status(500).json({ error: 'Internal Server Error' });
  }
})

app.post('/get_study_room', async (req, res) => {
  const { student } = req.body;
  try {
    const rows = await get_student_study_room(student);
    const processedData = rows.map(item => ({
      student: item.student,
      study_room_name: item.study_room_name,
      study_room_date: item.study_room_date,
      study_room_time: item.study_room_time,
      image: item.image,
    }));
    console.log("[StudyRoomDetailScreen] : 해당 유저의 스터디룸 예약현황 가져오기 성공");
    res.json(processedData);
  } catch (error) {
    console.log("[StudyRoomDetailScreen] : 해당 유저의 스터디룸 예약현황 가져오기 실패");
    res.status(500).json({ error: 'Internal Server Error' });
  }
});


//메인페이지 이벤트 데이터 전부 가져와
app.post('/Get_Event_Data', async (req, res) => {
  const { campus_id } = req.body;
  try {
    const rows = await Get_Event_Data(campus_id);
    const processedData = rows.map(item => ({
      event_id: item.event_id,
      campus_id: item.campus_id,
      user_id: item.user_id,
      name: item.name,
      get_point: item.get_point,
      info: item.info,
      simple_info: item.simple_info,
      event_photo: item.event_photo,
      start_date: formatDate(item.start_date),
      close_date: formatDate(item.close_date),
      is_event_close: item.is_event_close,
    }));
    res.json(processedData);
    console.log("[MainScreen or AdminMain] : 이벤트 정보 전부 가져오기 성공");
  } catch (error) {
    console.error("[MainScreen or AdminMain] : 이벤트 정보 전부 가져오기 실패");
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

//메인페이지 이벤트 데이터 전부 가져와
app.post('/Get_One_Event_Data', async (req, res) => {
  const { event_id } = req.body;
  try {
    const rows = await Get_One_Event_Data(event_id);
    const processedData = {
      event_id: rows[0].event_id,
      campus_id: rows[0].campus_id,
      user_id: rows[0].user_id,
      name: rows[0].name,
      get_point: rows[0].get_point,
      info: rows[0].info,
      simple_info: rows[0].simple_info,
      event_photo: rows[0].event_photo,
      start_date: formatDate(rows[0].start_date),
      close_date: formatDate(rows[0].close_date),
      is_event_close: rows[0].is_event_close,
    }
    console.log("[AlarmDialogScreen] : 해당 알람 이벤트 데이터 가져오기 성공");
    res.json(processedData);
  } catch (error) {
    console.log("[AlarmDialogScreen] : 해당 알람 이벤트 데이터 가져오기 실패");
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

//스터디룸 삭제하기
app.post('/deletestudyroom', async (req, res) => {
  const { student, study_room_name, study_room_date, study_room_time } = req.body;
  try {
    const success = await delete_studyroom(student, study_room_name, study_room_date, study_room_time);
    if (success) {
      console.log("[StudyRoomDetailScreen] : 스터디룸 예약 삭제 성공");
      res.json({ message: "성공적으로 값 삭제" });
    } else {
      console.log("[StudyRoomDetailScreen] : 스터디룸 예약 삭제 실패");
      res.status(500).json({ error: "삭제 실패" });
    }
  } catch (error) {
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

//메인페이지 이벤트 사진 데이터 가져오기
app.post('/Get_Event_Photos', async (req, res) => {
  const { event_id } = req.body;
  try {
    const rows = await Get_Event_Photos(event_id);
    const processedData = rows.map(item => ({
      photo_data: item.event_photo
    }));
    console.log(processedData);
    res.json(processedData);
    console.log("성공적으로 데이터 보냄");
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});


app.post('/send_user_event_info', async (req, res) => {
  const { user_id, event_id, content } = req.body;
  try {
    await send_user_event_info(user_id, event_id, content);
    console.log("[DeadlineEventScreen] : 이벤트 전송 성공[1] (이벤트 내용)")
    res.status(200).json({ message: '서버가 잘 마무리되었습니다.' });
  } catch (error) {
    console.log("[DeadlineEventScreen] : 이벤트 전송 실패[1] (이벤트 내용)")
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

//이미지 업로드 및 DB저장
app.post('/send_user_event_photo', upload.array('images'), async (req, res) => {
  if (!req.files || req.files.length === 0) {
    return res.status(400).send('No files uploaded');
  }
  const fileNames = req.files.map(file => file.filename); // 파일 이름 추출
  try {
    for (const fileName of fileNames) {
      const regex = /_(\d+)_(\d+)\.png$/;
      const match = fileName.match(regex);

      if (match) {
        const fileNameWithoutExtension = fileName.replace('.png', '');
        const user_id = parseInt(match[1], 10);
        const event_id = parseInt(match[2], 10);
        await user_send_photo(user_id, event_id, fileNameWithoutExtension);
      } else {
        console.error('The filename format is incorrect.');
      }
    }
    console.log("[DeadlineEventScreen] : 이벤트 전송 성공[3] (이벤트 사진들)");
    res.send('Files processed and saved successfully to the database');
  } catch (error) {
    console.log("[DeadlineEventScreen] : 이벤트 전송 성공[3] (이벤트 사진들)");
    res.status(500).send('Internal Server Error');
  }
});


app.post('/deleteMyPostData', async (req, res) => {
  try {
    const { post_id } = req.body; //1번 body에서 값 추출
    const deleteResult = await deleteMyPostData(post_id);
    if (deleteResult === true) {
      console.log("[MyPostScreen] : 내가 쓴 게시글 삭제 성공");
      res.status(200).send({ message: "게시글 삭제 완료" });
    }
  } catch (error) {
    console.log("[MyPostScreen] : 내가 쓴 게시글 삭제 성공");
    res.status(500).send({ message: "서버 오류" });
  }
})

app.post('/deleteMyaram', async (req, res) => {
  try {
    const { aram_id } = req.body; //1번 body에서 값 추출
    const deleteResult = await deleteMyaram(aram_id);
    if (deleteResult === true) {
      console.log("[AlarmDialogScreen] : 알람 삭제 성공");
      res.status(200).send({ message: "게시글 삭제 완료" });
    }
  } catch (error) {
    console.log("[AlarmDialogScreen] : 알람 삭제 실패");
    res.status(500).send({ message: "서버 오류" });
  }
})


//유저가 좋아요를 눌렀는지확인
app.post('/is_user_post_like', async (req, res) => {
  try {
    const { user_id, post_id } = req.body;
    const result = await is_user_post_like(user_id, post_id);
    console.log("[PostDetailScreen] : 포스터 좋아요 중복 방지 성공");
    res.json({ isLiked: result });
  } catch (error) {
    console.log("[PostDetailScreen] : 포스터 좋아요 중복 방지 실패");
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

//유저가 댓글 좋아요를 눌렀는지확인
app.post('/is_user_comment_like', async (req, res) => {
  try {
    const { user_id, comment_id } = req.body;
    const result = await is_user_comment_like(user_id, comment_id);
    console.log("[PostDetailScreen] : 댓글 좋아요 중복 방지 성공");
    res.json({ isLiked: result });
  } catch (error) {
    console.log("[PostDetailScreen] : 댓글 좋아요 중복 방지 실패");
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

//유저가 대댓글 좋아요를 눌렀는지확인
app.post('/is_user_recomment_like', async (req, res) => {
  try {
    const { user_id, recomment_id } = req.body;
    const result = await is_user_recomment_like(user_id, recomment_id);
    console.log("[PostDetailScreen] : 대댓글 좋아요 중복 방지 성공");
    res.json({ isLiked: result });
  } catch (error) {
    console.log("[PostDetailScreen] : 대댓글 좋아요 중복 방지 실패");
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

app.post('/put_user_post_like', async (req, res) => {
  const { user_id, post_id } = req.body;
  try {
    await put_user_post_like(user_id, post_id);
    console.log("[PostDetailScreen or NoticePostDetailScreen] : 해당 유저의 좋아요 기록 저장 성공");
    res.status(200).json({ message: '좋아요 기록이 성공적으로 저장되었습니다.' })
  } catch (error) {
    console.log("[PostDetailScreen or NoticePostDetailScreen] : 해당 유저의 좋아요 기록 저장 실패");
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

//해당 유저의 댓글 좋아요 기록을 저장
app.post('/put_user_comment_like', async (req, res) => {
  const { user_id, comment_id } = req.body;
  try {
    await put_user_comment_like(user_id, comment_id);
    console.log("[PostDetailScreen] : 해당 유저의 댓글 좋아요 기록 저장 성공");
    res.status(200).json({ message: '댓글 좋아요 기록이 성공적으로 저장되었습니다.' })
  } catch (error) {
    console.log("[PostDetailScreen] : 해당 유저의 댓글 좋아요 기록 저장 실패" + error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

//해당 유저의 대댓글 좋아요 기록을 저장
app.post('/put_user_recomment_like', async (req, res) => {
  const { user_id, recomment_id } = req.body;
  try {
    await put_user_recomment_like(user_id, recomment_id);
    console.log("[PostDetailScreen] : 해당 유저의 대댓글 좋아요 기록 저장 성공");
    res.status(200).json({ message: '댓글 좋아요 기록이 성공적으로 저장되었습니다.' })
  } catch (error) {
    console.log("[PostDetailScreen] : 해당 유저의 대댓글 좋아요 기록 저장 실패" + error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// 이벤트 정보 선택
app.post('/select_user_event_info', async (req, res) => {
  const { user_id } = req.body;
  try {
    const rows = await select_user_event_info(user_id);
    const processedData = rows.map(item => ({
      user_id: item.user_id,
      user_send_event: item.user_send_event,
      event_id: item.event_id
    }));
    console.log("[DeadlineEventScreen] : 해당 이벤트 중복검사 정보 가져오기 성공");
    res.json(processedData);
  } catch (error) {
    console.log("[DeadlineEventScreen] : 해당 이벤트 중복검사 정보 가져오기 실패");
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

//신고 등록하기
app.post('/putuserreport', async (req, res) => {
  const { post_id, report_name } = req.body;
  try {
    const rows = put_user_report(post_id, report_name);
    console.log("[PostDetailScreen] : 포스터 신고 접수 성공");
    res.status(200).json({ success: true, message: "신고가 성공적으로 제출되었습니다." });
  } catch (error) {
    console.log("[PostDetailScreen] : 포스터 신고 접수 실패");
    res.status(400).json({ success: false, message: "신고 제출에 실패했습니다." });
  }
});

app.get('/getuserreport', async (req, res) => {
  try {
    const rows = await get_user_report();
    console.log("[PostDetailScreen] : 신고당한 포스터 가져오기 성공");
    res.json(rows); // 쿼리 결과를 JSON으로 클라이언트로 전송
  } catch (error) {
    console.log("[PostDetailScreen] : 신고당한 포스터 가져오기 실패");
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

app.post('/putusercommentreport', async (req, res) => {
  const { comment_id, report_comment_name } = req.body;
  try {
    const rows = put_user_comment_report(comment_id, report_comment_name);
    console.log("[PostDetailScreen] : 댓글 및 대댓글 신고 접수 성공");
    res.status(200).json({ success: true, message: "신고가 성공적으로 제출되었습니다." });
  } catch (error) {
    console.log("[PostDetailScreen] : 댓글 및 대댓글 신고 접수 실패");
    res.status(400).json({ success: false, message: "신고 제출에 실패했습니다." });
  }
});

app.get('/getusercommentreport', async (req, res) => {
  try {
    const rows = await get_user_comment_report();
    console.log("[PostDetailScreen] : 신고당한 댓글 가져오기 성공");
    res.json(rows); // 쿼리 결과를 JSON으로 클라이언트로 전송
  } catch (error) {
    console.log("[PostDetailScreen] : 신고당한 댓글 가져오기 실패");
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

app.post('/getUserReportInfo', async (req, res) => {
  try {
    const rows = await get_user_report_Info();
    const processedData = rows.map(item => ({
      reportId: item.report_id,
      report_name: item.report_name,
      post_id: item.post_id,
      department_check: item.department_check,
      user_id: item.post_user_id,
      title: item.post_title,
      contents: item.contents,
      write_date: formatDate(item.date),
      view: item.view,
      like: item.like,
      userStudentId: item.user_student_id,
      userTitle: item.user_title,
      post_writer: item.student_name,
      campusId: item.student_campus_id,
      campusName: item.campus_name,
      departmentId: item.student_department_id,
      writer_department: item.department_name,
      writer_profile: item.profilePhoto
    }));
    console.log("[CheckReportPosts] : 신고당한 게시물 가져오기 성공");
    res.json(processedData);
  } catch (error) {
    console.log("[CheckReportPosts] : 신고당한 게시물 가져오기 실패");
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

app.post('/deletepost', async (req, res) => {
  const { post_id } = req.body;
  const success = await delete_post(post_id);
  if (success) {
    res.json({ message: "성공적으로 값 삭제" });
  } else {
    res.status(500).json({ error: "삭제 실패" });
  }
});


//상품시에 사진 저장
app.post('/RegistorItemImage', upload.single('images'), (req, res) => {
  try {
    const fileName = req.file ? req.file.filename : null;
    const baseName = fileName ? fileName.substring(0, fileName.lastIndexOf('.')) : null; // 파일 이름에서 확장자 제거
    console.log("[RegisterProduct or ModifyProduct] : 상품 이미지 등록 성공");
    res.json({ fileName: baseName }); // 확장자를 제거한 파일 이름을 JSON 형식으로 클라이언트로 반환
  } catch {
    console.log("[RegisterProduct or ModifyProduct] : 상품 이미지 등록 실패")
    res.status(500).json({ message: '서버가 잘 마무리되지않았습니다.' });
  }
});

//상품등록
app.post('/RegistorItem', async (req, res) => {
  const { campus_id, name, price, using_time, image_num, explian, count } = req.body;
  try {
    const rows = await RegistorItem(campus_id, name, price, using_time, image_num, explian, count);
    console.log("[RegisterProduct] : 상품 정보 등록 성공");
    res.status(200).json({ message: '서버가 잘 마무리되었습니다.' });
  } catch (error) {
    console.log("[RegisterProduct] : 상품 정보 등록 성공");
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

//수량은 변화하지 않고 DB의 아이템 정보만 변경한다.
app.post('/ChangeItemInfo', async (req, res) => {
  const { origin_name, name, price, using_time, image_num, explian } = req.body;
  try {
    const rows = await ChangeItemInfo(origin_name, name, price, using_time, image_num, explian);
    console.log("[ModifyProduct] : 아이템 정보 변경 성공");
    res.status(200).json({ message: '서버가 잘 마무리되었습니다.' });
  } catch (error) {
    console.log("[ModifyProduct] : 아이템 정보 변경 실패");
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

//수량이 증가하고 DB의 아이템 정보를 변경한다.
app.post('/ChangeItemInfoANDCountUp', async (req, res) => {
  const { origin_name, campus_id, name, price, using_time, image_num, explian, count } = req.body;
  try {
    const rows = await ChangeItemInfoANDCountUp(origin_name, campus_id, name, price, using_time, image_num, explian, count);
    console.log("[ModifyProduct] : 아이템 수량 증가 및 정보 변경 성공");
    res.status(200).json({ message: '서버가 잘 마무리되었습니다.' });
  } catch (error) {
    console.log("[ModifyProduct] : 아이템 수량 증가 및 정보 변경 실패");
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

//수량이 감소하고 DB의 아이템 정보를 변경한다.
app.post('/ChangeItemInfoANDCountDown', async (req, res) => {
  const { origin_name, campus_id, name, price, using_time, image_num, explian, count } = req.body;
  try {
    const rows = await ChangeItemInfoANDCountDown(origin_name, campus_id, name, price, using_time, image_num, explian, count);
    console.log("[ModifyProduct] : 아이템 수량 감소 및 정보 변경 성공");
    res.status(200).json({ message: '서버가 잘 마무리되었습니다.' });
  } catch (error) {
    console.log("[ModifyProduct] : 아이템 수량 감소 및 정보 변경 실패");
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

//현재 남은 제고의 아이템 수를 얻기위함
app.post('/getRestItemCount', async (req, res) => {
  const { campus_id, name } = req.body;
  try {
    const rows = await getRestItemCount(campus_id, name);
    const processedData = rows.map(item => ({
      object_id: item.object_id
    }));
    console.log("[ModifyProduct] : 해당 상품 남은 갯수 가져오기 성공");
    res.json(processedData);
  } catch (error) {
    console.log("[ModifyProduct] : 해당 상품 남은 갯수 가져오기 실패");
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

//현재 팔린 제고의 수량을 파악하기 위함
app.post('/getSellItemCount', async (req, res) => {
  const { campus_id, name } = req.body;
  try {
    const rows = await getSellItemCount(campus_id, name);
    const processedData = rows.map(item => ({
      object_id: item.object_id
    }));
    console.log("[ModifyProduct] : 해당 상품 팔린 갯수 가져오기 성공");
    res.json(processedData);
  } catch (error) {
    console.log("[ModifyProduct] : 해당 상품 팔린 갯수 가져오기 실패");
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

app.post('/deletecomment', async (req, res) => {
  const { comment_id } = req.body;
  const success = await delete_comment(comment_id);
  if (success) {
    console.log("[PostDetailScreen] : 댓글 삭제 성공");
    res.json({ message: "성공적으로 값 삭제" });
  } else {
    console.log("[PostDetailScreen] : 댓글 삭제 실패");
    res.status(500).json({ error: "삭제 실패" });
  }
});

app.post('/deleterecomment', async (req, res) => {
  const { recomment_id } = req.body;
  const success = await delete_recomment(recomment_id);
  if (success) {
    console.log("[PostDetailScreen] : 대댓글 삭제 성공");
    res.json({ message: "성공적으로 값 삭제" });
  } else {
    console.log("[PostDetailScreen] : 대댓글 삭제 실패");
    res.status(500).json({ error: "삭제 실패" });
  }
});

app.post('/getUserCommentReportInfo', async (req, res) => {
  try {
    const rows = await get_user_comment_report_Info();
    const processedData = rows.map(item => ({
      report_comment_id: item.report_comment_id,
      comment_id: item.comment_id,
      report_comment_name: item.report_comment_name,
      contents: item.contents,
      comment_date: formatDate(item.comment_date),
      comment_like: item.comment_like,
      post_id: item.post_id,
      department_check: item.department_check,
      user_id: item.user_id,
      student_id: item.student_id,
      student_name: item.student_name,
      department_id: item.department_id,
      department_name: item.department_name
    }));
    console.log("[CheckReportPost] : 신고당한 댓글 가져오기 성공");
    res.json(processedData);
  } catch (error) {
    console.log("[CheckReportPost] : 신고당한 댓글 가져오기 실패");
    res.status(500).json({ error: 'Internal Server Error', message: error.message });
  }
});

//이벤트 정보만 등록
app.post('/RegistorEvent', async (req, res) => {
  const { campus_id, user_id, event_name, get_point, info, simple_info, start_date, close_date } = req.body;
  try {
    const eventPk = await RegistorEvent(campus_id, user_id, event_name, get_point, info, simple_info, start_date, close_date);
    console.log("[RegisterEvent or ModifyEvent] : 이벤트 등록[1] (이벤트 내용) 성공");
    res.status(200).json({ eventPk });
  } catch (error) {
    console.log("[RegisterEvent or ModifyEvent] : 이벤트 등록[2] (이벤트 내용) 성공");
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

//이벤트 테이블에 연결되어있는 투표 테이블에 행삽입
app.post('/RegistorEventVotesEdit', async (req, res) => {
  const { event_id, votes } = req.body;
  try {
    await RegistorEventVotes(event_id, votes);
    console.log("[ModifyEvent] : 이벤트 등록[3] (표 내용) 성공");
    res.status(200).json({ message: '서버가 잘 마무리되었습니다.' });
  } catch (error) {
    console.log("[ModifyEvent] : 이벤트 등록[3] (표 내용) 실패");
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

//이벤트 테이블에 연결되어있는 투표 테이블에 행삽입
app.post('/RegistorEventVotesRegistor', async (req, res) => {
  const { event_id, votes } = req.body;
  console.log(votes);
  try {
    await RegistorEventVotesAdmin(event_id, votes);
    console.log("[RegisterEvent] : 이벤트 등록[3] (이벤트 투표) 성공");
    res.status(200).json({ message: '서버가 잘 마무리되었습니다.' });
  } catch (error) {
    console.log("[RegisterEvent] : 이벤트 등록[3] (이벤트 투표) 성공");
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

//이벤트 테이블에 연결되어있는 이미지 테이블에 행삽입
app.post('/RegistorEventPhoto', async (req, res) => {
  const { event_id, event_photo } = req.body;
  try {
    await RegistorEventPhoto(event_id, event_photo);
    console.log("[RegisterEvent or ModifyEvent] : 이벤트 등록[2] (이벤트 사진) 성공");
    res.status(200).json({ message: '서버가 잘 마무리되었습니다.' });
  } catch (error) {
    console.log("[RegisterEvent or ModifyEvent] : 이벤트 등록[2] (이벤트 사진) 실패");
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

//이벤트 등록 이미지 함수.
app.post('/uploadImages', upload.array('images', 10), (req, res) => {
  try {
    const fileNames = req.files.map(file => {
      const fileName = file.filename;
      const baseName = fileName.substring(0, fileName.lastIndexOf('.')); // 파일 이름에서 확장자 제거
      return baseName;
    });
    res.json({ fileNames: fileNames }); // 확장자를 제거한 파일 이름들을 JSON 형식으로 클라이언트로 반환
  } catch (error) {
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

//이벤트 리스트 가져오기
app.post('/GetEventList', async (req, res) => {
  const { campus_id } = req.body;
  try {
    const rows = await GetEventList(campus_id);
    const processedData = rows.map(item => ({
      event_id: item.event_id,
      name: item.name,
      info: item.info,
      start_date: formatDate(item.start_date),
      close_date: formatDate(item.close_date),
      event_photo: item.event_photo
    }));
    console.log("[CheckEvent or ParticipantEvnet] : 등록한 이벤트 정보[1] (이벤트 내용) 가져오기 성공");
    res.json(processedData);
  } catch (error) {
    console.log("[CheckEvent or ParticipantEvnet] : 등록한 이벤트 정보[1] (이벤트 내용) 가져오기 실패");
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

//편집할 이벤트 정보 가져오기
app.post('/GetEditEventInfo', async (req, res) => {
  const { event_id } = req.body;
  try {
    const rows = await GetEditEventInfo(event_id);
    const processedData = {
      event_id: rows[0].event_id,
      campus_id: rows[0].campus_id,
      name: rows[0].name,
      get_point: rows[0].get_point,
      info: rows[0].info,
      simple_info: rows[0].simple_info,
      start_date: rows[0].start_date,
      close_date: rows[0].close_date
    };
    console.log("[ModifyEvent] : 편집할 이벤트 정보[1] (이벤트 내용) 가져오기 성공");
    res.json(processedData);
  } catch (error) {
    console.log("[ModifyEvent] : 편집할 이벤트 정보[1] (이벤트 내용) 가져오기 실패");
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

//이벤트 편집할 이벤트 투표 가져오기
app.post('/GetEditEventVote', async (req, res) => {
  const { event_id } = req.body;
  try {
    const rows = await GetEditEventVote(event_id);
    const processedData = rows.map(item => ({
      event_id: item.event_id,
      text: item.vote_name,
      vote_count: item.vote_count,
      id: item.vote_index,
    }));
    console.log("[ModifyEvent] : 편집할 이벤트 정보[2] (표 내용) 가져오기 성공");
    res.json(processedData);
  } catch (error) {
    console.log("[ModifyEvent] : 편집할 이벤트 정보[2] (표 내용) 가져오기 실패");
    res.status(500).json({ error: 'Internal Server Error' });
  }
});


//해당 학교 이벤트 이미지 전부 가져오기
app.post('/GetEditEventImage', async (req, res) => {
  const { event_id } = req.body;
  try {
    const rows = await GetEditEventImage(event_id);
    const processedData = rows.map(item => ({
      event_id: item.event_id,
      event_photo: item.event_photo,
    }));
    res.json(processedData);
    console.log("[MainScreen or AdminMain or ModifyEvent[3]] : (편집할) 이벤트 이미지 가져오기 성공");
  } catch (error) {
    console.log("[MainScreen or AdminMain] : (편집할[3]) 이벤트 이미지 가져오기 실패");
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

//해당 이벤트 초기화 후 다시 행삽입
app.post('/DeleteEvent', async (req, res) => {
  const { event_id } = req.body;
  try {
    await DeleteEvent(event_id);
    console.log("[CheckEvent] : 이벤트 삭제 성공");
    res.status(200).json({ message: '서버가 잘 마무리되었습니다.' });
  } catch (error) {
    console.log("[CheckEvent] : 이벤트 삭제 실패");
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

//해당 포스터 사진 초기화
app.post('/DeletePostPhoto', async (req, res) => {
  const { post_id } = req.body;
  try {
    await DeletePostPhoto(post_id);
    console.log("[EditPostScreen] : 기존 포스터 사진 목록 초기화 성공");
    res.status(200).json({ message: '서버가 잘 마무리되었습니다.' });
  } catch (error) {
    console.log("[EditPostScreen] : 기존 포스터 사진 목록 초기화 실패");
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

//유저의 이벤트 목록 가져오기
app.post('/GetUserSendEvent', async (req, res) => {
  const { campus_id } = req.body;
  try {
    const rows = await GetUserSendEvent(campus_id);
    const processedData = rows.map(item => ({
      user_send_event: item.user_send_event,
      user_id: item.user_id,
      event_id: item.event_id,
      time: item.time,
      content: item.content,
      campus_id: item.campus_id,
      user_login_id: item.id,
      user_name: item.name,
      event_point: item.get_point,
      good_event: item.good_event
    }));
    console.log("[ParticipantEvent] : 유저가 보낸 이벤트 목록[1] 가져오기 성공 (이벤트 내용)");
    res.json(processedData);
  } catch (error) {
    console.log("[ParticipantEvent] : 유저가 보낸 이벤트 목록[1] 가져오기 성공");
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

//유저의 이벤트 목록 중 사진 가져오기
app.post('/GetUserEventPhoto', async (req, res) => {
  const { event_id, user_id } = req.body;
  try {
    const rows = await GetUserEventPhoto(event_id, user_id);
    const processedData = rows.map(item => ({
      event_id: item.event_id,
      user_id: item.user_id,
      event_photo: item.event_photo,
    }));
    console.log("[ParticipantEvent] : 유저가 보낸 이벤트 목록[2] 가져오기 성공 (이벤트 사진)");
    res.json(processedData);
  } catch (error) {
    console.log("[ParticipantEvent] : 유저가 보낸 이벤트 목록[2] 가져오기 성공 (이벤트 사진)");
    res.status(500).json({ error: 'Internal Server Error' });
  }
});


app.post('/get_user_Info', async (req, res) => {
  const { campus_id } = req.body;

  try {
    const rows = await getuserInfo(campus_id);
    const userData = rows.map(row => ({
      user_id: row.user_id,
      id: row.id,
      point: row.point,
      profilePhoto: row.profilePhoto,
      title: row.title,
      report_confirm: row.report_confirm,
      student_name: row.student_name,
      student_id: row.student_id,
      department_id: row.department_id,
      department_name: row.department_name,
      campus_id: row.campus_id,
      caution: row.caution,
    }));
    console.log("[UserManagement] : 관리할 게시물 전체 가져오기 성공")
    res.json(userData);
  } catch (error) {
    console.log("[UserManagement] : 관리할 게시물 전체 가져오기 실패")
    res.status(500).json({ error: 'Failed to fetch user info' });
  }
});

app.post('/update_user_caution', async (req, res) => {
  const { user_pk } = req.body;
  try {
    await update_user_caution(user_pk); // await 추가
    console.log("[UserManagement] : 유저 경고 주기 성공");
    res.status(200).send({ message: "경고 업데이트 성공." });
  } catch (error) {
    console.log("[UserManagement] : 유저 경고 주기 실패");
    res.status(500).send({ message: "경고 업데이트 실패" });
  }
});

app.post('/update_user_title', async (req, res) => {
  const { user_pk, title } = req.body;
  try {
    await update_user_title(user_pk, title); // await 추가
    console.log("[UserManagement] : 유저 권한 변경 성공");
    res.status(200).send({ message: "경고 업데이트 성공." });
  } catch (error) {
    console.log("[UserManagement] : 유저 권한 변경 실패");
    res.status(500).send({ message: "경고 업데이트 실패" });
  }
});

app.post('/update_user_allpoint', async (req, res) => {
  const { user_pk, point } = req.body;
  try {
    await update_user_allpoint(user_pk, point); // await 추가
    console.log("[UserManagement] : 유저 포인트 변경 성공");
    res.status(200).send({ message: "포인트 업데이트 성공." });
  } catch (error) {
    console.log("[UserManagement] : 유저 포인트 변경 실패");
    res.status(500).send({ message: "포인트 업데이트 실패" });
  }
});



//해당 이벤트의 모든 투표 정보 가져오기
app.post('/GetEventVote', async (req, res) => {
  const { campus_id } = req.body;
  try {
    const rows = await GetEventVote(campus_id);
    const processedData = rows.map(item => ({
      event_id: item.event_id,
      vote_name: item.vote_name,
      vote_count: item.vote_count,
      vote_index: item.vote_index
    }));
    console.log("[CheckEvent] : 등록한 이벤트 정보[2] (표 내용) 가져오기 성공");
    res.json(processedData);
  } catch (error) {
    console.log("[CheckEvent] : 등록한 이벤트 정보[2] (표 내용) 가져오기 성공");
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

//이벤트 하나 표 가져오기
app.post('/GetoneEventVote', async (req, res) => {
  const { event_id } = req.body;
  try {
    const rows = await GetoneEventVote(event_id);
    const processedData = rows.map(item => ({
      event_id: item.event_id,
      vote_name: item.vote_name,
      vote_count: item.vote_count,
      vote_index: item.vote_index
    }));
    console.log("[DeadlineEventScreen] : 해당 이벤트 표 정보 가져오기 성공")
    res.json(processedData);
  } catch (error) {
    console.log("[DeadlineEventScreen] : 해당 이벤트 표 정보 가져오기 실패")
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

//이벤트 테이블에 연결되어있는 이미지 테이블에 행삽입
app.post('/SendUserEventVote', async (req, res) => {
  const { event_id, vote_name } = req.body;
  try {
    await SendUserEventVote(event_id, vote_name);
    console.log("[DeadlineEventScreen] : 이벤트 전송 성공[2] (표)");
    res.status(200).json({ message: '서버가 잘 마무리되었습니다.' });
  } catch (error) {
    console.log("[DeadlineEventScreen] : 이벤트 전송 실패[2] (표)");
    res.status(500).json({ error: 'Internal Server Error' });
  }
});


//이벤트 당첨
app.post('/AdminSendPoint', async (req, res) => {
  const { user_id, event_point } = req.body;
  try {
    await AdminSendPoint(user_id, event_point);
    console.log("[ParticipantEvnet] : 유저에게 포인트 전송 성공");
    res.status(200).json({ message: '서버가 잘 마무리되었습니다.' });
  } catch (error) {
    console.log("[ParticipantEvnet] : 유저에게 포인트 전송 성공");
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

//출석 체크 시 포인트 상승
app.post('/AttendanceCheck', async (req, res) => {
  const { user_id, event_point } = req.body;
  try {
    await AttendanceCheck(user_id, event_point);
    res.status(200).json({ message: '서버가 잘 마무리되었습니다.' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

app.post('/addLectureInfo', async (req, res) => {
  const { student_id, lecture_id, weeknum, classnum, attendance_Info } = req.body;

  try {
    const success = await addLectureInfo(student_id, lecture_id, weeknum, classnum, attendance_Info);
    if (success) {
      res.json({ message: 'Data added successfully', receivedData: { student_id, lecture_id, weeknum, classnum, attendance_Info } });
    } else {
      res.status(500).json({ message: 'Failed to add data' });
    }
  } catch (error) {
    console.error('Error while adding lecture info:', error);
    res.status(500).json({ message: 'An error occurred while adding lecture info', error: error.message });
  }
});

app.post('/GetLectureInfo', async (req, res) => {
  const { student_id, lecture_id } = req.body;
  try {
    const rows = await GetLectureInfo(student_id, lecture_id);
    const processedData = rows.map(item => ({
      weeknum: item.weeknum,
      classnum: item.classnum,
      attendance_Info: item.attendance_Info
    }));
    res.json(processedData);
    //console.log("성공적으로 데이터 보냄");
  } catch (error) {
    console.error('API Error:', error);  // API 에러 로그
    res.status(500).json({ error: 'Internal Server Error' });
  }
});


app.post('/get_recomment_post_pk', async (req, res) => {
  const { comment_id } = req.body;
  try {
    const rows = await get_recomment_post_pk(comment_id);
    const post_id = rows[0].post_id;
    console.log("[AlarmDialogScreen] : 해당 대댓글의 포스터 pk 가져오기 성공");
    res.json(post_id);
  } catch (error) {
    console.log("[AlarmDialogScreen] : 해당 대댓글의 포스터 pk 가져오기 실패");
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

//포스터 수정하기 위해 일단 포스터 정보 가져오기
app.post('/get_post_info', async (req, res) => {
  const { post_id } = req.body;
  try {
    const rows = await get_post_info(post_id);
    const processedData = {
      post_id: rows[0].post_id,
      user_id: rows[0].user_id,
      department_check: rows[0].department_check,
      inform_check: rows[0].inform_check,
      title: rows[0].title,
      contents: rows[0].contents,
      Club_check : rows[0].Club_check,
      contest_check : rows[0].contest_check,
      url : rows[0].url,
      sources : rows[0].sources
    };
    console.log("[CheckReportPost] : 포스터 수정 정보 가져오기 성공");
    res.json(processedData);
  } catch (error) {
    console.log("[CheckReportPost] : 포스터 수정 정보 가져오기 실패");
    console.log(error);
    res.status(500).json({ error: 'Internal Server Error', message: error.message });
  }
});

//댓글 수정
app.post('/editcomment', async (req, res) => {
  try {
    const { comment_pk, contents } = req.body;
    await editcomment(comment_pk, contents);
    console.log("[PostDetailScreen] : 댓글 수정 성공");
    res.status(200).json({ message: '서버가 잘 마무리되었습니다.' });
  } catch (error) {
    console.log("[PostDetailScreen] : 댓글 수정 실패");
    res.json({ success: false, error: error.message });
  }
});

//대댓글 수정
app.post('/editrecomment', async (req, res) => {
  try {
    const { recomment_pk, contents } = req.body;
    await editrecomment(recomment_pk, contents);
    console.log("[PostDetailScreen] : 대댓글 수정 성공");
    res.status(200).json({ message: '서버가 잘 마무리되었습니다.' });
  } catch (error) {
    console.log("[PostDetailScreen] : 대댓글 수정 실패");
    res.json({ success: false, error: error.message });
  }
});

//좋아요 취소
app.post('/cancel_post_like', async (req, res) => {
  try {
    const { user_id, post_id } = req.body;
    await cancel_post_like(user_id, post_id);
    console.log("[PostDetailScreen] : 포스터 좋아요 목록에서 삭제 성공");
    res.status(200).json({ message: '서버가 잘 마무리되었습니다.' });
  } catch (error) {
    console.log("[PostDetailScreen] : 포스터 좋아요 목록에서 삭제 실패");
    res.json({ success: false, error: error.message });
  }
});

//댓글 좋아요 취소
app.post('/cancel_comment_like', async (req, res) => {
  try {
    const { user_id, comment_id } = req.body;
    await cancel_comment_like(user_id, comment_id);
    console.log("[PostDetailScreen] : 포스터 댓글 좋아요 목록에서 삭제 성공");
    res.status(200).json({ message: '서버가 잘 마무리되었습니다.' });
  } catch (error) {
    console.log("[PostDetailScreen] : 포스터 댓글 좋아요 목록에서 삭제 실패");
    res.json({ success: false, error: error.message });
  }
});

//댓글 좋아요 취소
app.post('/cancel_recomment_like', async (req, res) => {
  try {
    const { user_id, recomment_id } = req.body;
    await cancel_recomment_like(user_id, recomment_id);
    console.log("[PostDetailScreen] : 포스터 대댓글 좋아요 목록에서 삭제 성공");
    res.status(200).json({ message: '서버가 잘 마무리되었습니다.' });
  } catch (error) {
    console.log("[PostDetailScreen] : 포스터 대댓글 좋아요 목록에서 삭제 실패");
    res.json({ success: false, error: error.message });
  }
});

//유저 포인트 기록 가져오기
app.post('/getHistoryData', async (req, res) => {
  const { user_id } = req.body;
  try {
    const rows = await getHistoryData(user_id);
    const processedData = rows.map(item => ({
      history_id: item.history_id,
      point_status: item.point_status,
      point_num: item.point_num,
      point_time: formatDate2(item.point_time),
      content: item.content,
      user_id: item.user_id
    }));
    console.log("[PointHistoryScreen] : 유저 포인트 기록 가져오기 성공");
    res.json(processedData);
  } catch (error) {
    console.log("[PointHistoryScreen] : 유저 포인트 기록 가져오기 실패");
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

app.post('/AddEventPointHistory', async (req, res) => {
  const { point_num, content, user_id } = req.body;
  try {
    await AddEventPointHistory(point_num, content, user_id);
    console.log("[ParticipantEvent] : 유저 포인트 적립 기록 성공");
    res.status(200).json({ message: '서버가 잘 마무리되었습니다.' });

  } catch (error) {
    console.log("[ParticipantEvent] : 유저 포인트 적립 기록 실패");
    console.log(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

app.post('/AddFriendPointHistory', async (req, res) => {
  const { user_id, friendName } = req.body;
  try {
    await AddFriendPointHistory(user_id, friendName);
    console.log("[FriendCodeEventScreen] : 유저 포인트 적립 기록 성공");
    res.status(200).json({ message: '서버가 잘 마무리되었습니다.' });

  } catch (error) {
    console.log("[FriendCodeEventScreen] : 유저 포인트 적립 기록 실패");
    console.log(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

app.post('/AddAppAttendancePointHistory', async (req, res) => {
  const { user_id, today } = req.body;
  try {
    await AddAppAttendancePointHistory(user_id, today);
    console.log("[AttendanceCheckEventScreen] : 유저 포인트 적립 기록 성공");
    res.status(200).json({ message: '서버가 잘 마무리되었습니다.' });

  } catch (error) {
    console.log("[AttendanceCheckEventScreen] : 유저 포인트 적립 기록 실패");
    console.log(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

app.post('/AddBuyProductPointHistory', async (req, res) => {
  const { user_id, product, point } = req.body;
  try {
    await AddBuyProductPointHistory(user_id, product, point);
    console.log("[EventShopScreen] : 유저 포인트 사용 기록 성공");
    res.status(200).json({ message: '서버가 잘 마무리되었습니다.' });

  } catch (error) {
    console.log("[EventShopScreen] : 유저 포인트 사용 기록 실패");
    console.log(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

app.post('/AddAdminPointHistory', async (req, res) => {
  const { user_id, point, status } = req.body;
  try {
    await AddAdminPointHistory(user_id, point, status);
    console.log("[UserManagement] : 유저 포인트 사용 기록 성공");
    res.status(200).json({ message: '서버가 잘 마무리되었습니다.' });

  } catch (error) {
    console.log("[UserManagement] : 유저 포인트 사용 기록 실패");
    console.log(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

app.post('/setUserSendtype', async (req, res) => {
  const { user_send_event } = req.body;
  try {
    await setUserSendtype(user_send_event);
    console.log("[ParticipantEvent] : 유저 이벤트 당첨 기록 성공");
    res.status(200).json({ message: '서버가 잘 마무리되었습니다.' });

  } catch (error) {
    console.log("[ParticipantEvent] : 유저 이벤트 당첨 기록 실패");
    console.log(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

app.post('/getTimeTableData', async (req, res) => {
  const { user_id } = req.body;
  try {
    const rows = await getTimeTableData(user_id);
    const processedData = rows.map(item => ({
      professor_name: item.professor_name,
      lecture_name: item.lecture_name,
      lecture_room: item.lecture_room,
      lecture_time: item.lecture_time,
      week: item.week,
      lecture_grade: item.lecture_grade,
      lecture_semester: item.lecture_semester,
      credit: item.credit
    }));
    console.log("[TimetableScreen] : 시간표 데이터 가져오기 성공");
    res.json(processedData);
  } catch (error) {
    console.log("[TimetableScreen] : 시간표 데이터 가져오기 실패");
    console.error('API Error:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

app.post('/insertTimeTable', async (req, res) => {
  const { user_id, lecture_grade, lecture_semester, lecture_name, lecture_room, lecture_time, professor_name, credit, week } = req.body;
  try {
    await insertTimeTable(user_id, lecture_grade, lecture_semester, lecture_name, lecture_room, lecture_time, professor_name, credit, week);
    console.log("[TimetableScreen] : 시간표 추가 성공");
    res.status(200).json({ message: '서버가 잘 마무리되었습니다.' });

  } catch (error) {
    console.log("[TimetableScreen] : 시간표 추가 실패");
    console.log(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

app.post('/deleteTimetable', async (req, res) => {
  const { user_id, lecture_name, lecture_room, week } = req.body;
  try {
    await deleteTimetable(user_id, lecture_name, lecture_room, week);
    console.log("[TimetableScreen] : 시간표 삭제 성공");
    res.status(200).json({ message: '서버가 잘 마무리되었습니다.' });

  } catch (error) {
    console.log("[TimetableScreen] : 시간표 삭제 실패");
    console.log(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

app.post('/get_GoalGPA', async (req, res) => {
  const { user_id } = req.body;
  const rows = await get_GoalGPA(user_id);

  const goal_GPA = {
    goal_gpa: rows[0].goal_gpa,
  };
  console.log("[AcademiclnfoScreen] : 목표 평점(학점) 가져오기 성공");
  res.json(goal_GPA);
})

app.post('/change_GoalGPA', async (req, res) => {
  const { user_id, goal_gpa } = req.body;
  try {
    await change_GoalGPA(user_id, goal_gpa);
    console.log("[AcademiclnfoScreen] : 목표 평점(학점) 변경 성공");
    res.status(200).json({ message: '서버가 잘 마무리되었습니다.' });
  } catch {
    res.status(500).json({ message: '서버가 잘 마무리되지않았습니다.'});
  }
})

app.post('/fetchContestpostData', async (req, res) => {
  const { campus_id } = req.body;
  try {
    const rows = await fetchContestpostData(campus_id);
    const processedData = rows.map(item => ({
      post_id  : item.post_id,
      user_id : item.user_id,
      department_check : item.department_check,
      inform_check : item.inform_check,
      Club_check : item.Club_check,
      title : item.title,
      date : item.date,
      contest_check : item.datecontest_check,
      url : item.url,
      sources : item.sources,
      post_photo : item.post_photo
    }));
    console.log("[AdminMain or MainScreen] : 공모전 데이터 가져오기 성공");
    res.json(processedData);
  } catch (error) {
    console.log("[AdminMain or MainScreen] : 공모전 데이터 가져오기 실패");
    console.error('API Error:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

app.post('/ClubInsert', async (req, res) => {
  const { post_id, name, birth, university, department, grade, phone, sex, residence, application, introduce } = req.body;

  const success = await addClubInfo(post_id, name, birth, university, department, grade, phone, sex, residence, application, introduce);

  if (success) {
    res.json({ message: 'Data received successfully', receivedData: req.body });
  } else {
    res.status(500).json({ message: 'Error inserting data' });
  }
});

app.post('/fetchClubData', async (req, res) => {
  const { post_id } = req.body;
  
  if (!post_id) {
    return res.status(400).json({ error: 'Missing post_id' });
  }
  
  try {
    const rows = await getClubInfo(post_id);
    
    if (rows.length === 0) {
      return res.status(404).json({ error: 'No data found for the given post_id' });
    }

    const processedData = rows.map(item => ({
      Post_fk: item.Post_fk,
      Name: item.Name,
      Birth: item.Birth,
      University: item.University,
      Department: item.Department,
      Grade: item.Grade,
      Phone: item.Phone,
      Sex: item.Sex,
      Residence: item.Residence,
      Application: item.Application,
      Introduce: item.Introduce
    }));

    console.log("[AdminMain or MainScreen] : 동아리 데이터 가져오기 성공");
    console.log(processedData);
    res.json(processedData);
  } catch (error) {
    console.log("[AdminMain or MainScreen] : 동아리 데이터 가져오기 실패");
    console.error('API Error:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

app.post('/deleteclub', async (req, res) => {
  const { post_id, name, phone } = req.body;
  const success = await delete_Club(post_id, name, phone);
  if (success) {
    res.json({ message: "삭제되었습니다." });
  } else {
    res.status(500).json({ error: "삭제에 실패했습니다(오류발생)" });
  }
});

//메인페이지에 전체 게시글 데이터를 가져온다.
app.post('/GetClubPersonPK', async (req, res) => {
  const { user_name } = req.body;
  try {
    const rows = await GetClubPersonPK(user_name);
    res.json(rows[0]);
  } catch (error) {
    res.status(500).json({ error: "삭제에 실패했습니다(오류발생)" });
    console.log(error)
  }
});

//메인페이지에 전체 게시글 데이터를 가져온다.
app.post('/SendAramData', async (req, res) => {
  const { user_id, target_id, title } = req.body;
  try {
    const rows = await SendAramData(user_id, target_id, title);
    res.status(200).json({ message: '서버가 잘 마무리되었습니다.' });
  } catch (error) {
    res.status(500).json({ error: "삭제에 실패했습니다(오류발생)" });
    console.log(error)
  }
});

//메인페이지에 전체 게시글 데이터를 가져온다.
app.post('/updateComment', async (req, res) => {
  const { comment, Phone } = req.body;
  try {
    await updateComment(comment, Phone);
    res.status(200).json({ message: '서버가 잘 마무리되었습니다.' });
  } catch (error) {
    res.status(500).json({ error: "삭제에 실패했습니다(오류발생)" });
    console.log(error)
  }
});

//관리자 게시물 삭제 시 정보저장 테이블에 저장
app.post('/addDeletePostInfo', async (req, res) => {
  const { post_id, title, reason } = req.body;
  try {
    await addDeletePostInfo(post_id, title, reason);
    console.log("[PostDetailScreen] : 관리자 요청 신고 게시물 정보저장 성공");
    res.status(200).json({ message: '서버가 잘 마무리되었습니다.' });
  } catch (error) {
    res.status(500).json({ error: "삭제에 실패했습니다(오류발생)" });
    console.log("[PostDetailScreen] : 관리자 요청 신고 게시물 정보저장 실패");
  }
});


//관리자 게시물 삭제 시 해당 유저에게 알림 전송
app.post('/SendReportPostAram', async (req, res) => {
  const { user_id, target_id, title } = req.body;
  try {
    const rows = await SendReportPostAram(user_id, target_id, title);
    res.status(200).json({ message: '서버가 잘 마무리되었습니다.' });
  } catch (error) {
    res.status(500).json({ error: "삭제에 실패했습니다(오류발생)" });
    console.log(error)
  }
});

app.post('/update_aram_count', async (req, res) => {
  const { user_id } = req.body;
  try {
    await UpdateAramCount(user_id);
    console.log("[PostDetailScreen] : 유저의 알람 카운트 업데이트 성공");
    res.status(200).json({ message: '서버가 잘 마무리되었습니다.' });
  } catch (error) {
    console.log("[PostDetailScreen] : 유저의 알람 카운트 업데이트 실패");
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

app.post('/init_aram_count', async (req, res) => {
  const { user_id } = req.body;
  try {
    await initAramCount(user_id);
    console.log("[PostDetailScreen] : 유저의 알람 카운트 초기화 성공");
    res.status(200).json({ message: '서버가 잘 마무리되었습니다.' });
  } catch (error) {
    console.log("[PostDetailScreen] : 유저의 알람 카운트 초기화 실패");
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

app.post('/getUserAramCount', async (req, res) => {
  const { user_id } = req.body;
  try {
    const rows = await get_aram_count(user_id);
    console.log("[PostDetailScreen] : 알람 카운트 가져오기 성공");
    res.json(rows[0].aram_count); // 쿼리 결과를 JSON으로 클라이언트로 전송
  } catch (error) {
    console.log("[PostDetailScreen] : 알람 카운트 가져오기 실패");
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

//모든 학생의 pk값 가져오기
app.get('/getAllUserIds', async (req, res) => {
  try {
    const userIds = await allUser_id();
    res.json(userIds); // 조회 결과를 JSON 형식으로 반환
  } catch (err) {
    res.status(500).json({ error: 'Internal Server Error' });
  }
});


//서버 시작
app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}/`);
});
