export type RootStackParam = {
  CommunityPage: undefined;
  CommunityDetailPage: {
    name: string,
    age: number,
  };
  WritePostPage: undefined;
  TimetablePage: undefined;
  CommunityTopNavigation: undefined;
}


export type UserData = {
  admin_check: boolean,
  campus_pk: number,
  department_pk: number, //얘 학과 pk값 가져오기.
  email: string,
  friend_code: string,
  grade: number, //grade
  name: string,
  student_pk: number,
  user_pk: number,
  point: number,
  birth: string,
  phone: string,
  currentstatus: string,
  profile_photo: string | null,
  id: string,
  student_semester : number, 
  college : number,
  title : string,
  report_confirm : number, 
  aram_count : number
}

export type PostDeatilData = {
  post_writer: string,
  writer_department: string,
  write_date: string,
  title: string,
  contents: string,
  like: number,
  view: number,
  writer_propile: string,
  post_id : number,
  user_id : number,
  url : any,
  source : string,
  contest_check : boolean
}

export type PostCommentData = {
  comment_id: number,
  content: string,
  date: string,
  like: number
  student_name: string,
  department_name: string,
  user_id: number,
  post_id: number,
  user_profile : string,
}

export type ShopItemData = {
  code_num : string,
  count : number,
  explain : string,
  image_num : number,
  name : string,
  object_id : number,
  price : number,
  sell_check : boolean,
  using_time : string,
}

export type UserHaveCouponData = {
  code_num : string,
  explain : string,
  image_num : number,
  name : string,
  object_id : number,
  price : number,
  sell_check : boolean,
  using_time : string,
  buy_date : string,
  using_check : boolean,
  using_date : boolean,
  count : number,
}

export type CommentsWithRecomments = {
  comment_id: number,
  content: string,
  date: string,
  like: number
  student_name: string,
  department_name: string,
  user_id: number,
  post_id: number,
  user_profile : string,
  recomments: {
    comment_id: number;
    content: string;
    date: string;
    like: number;
    department_name: string;
    recomment_id: number;
    student_name: string; // 대댓글에도 student_name이 포함될 것으로 예상되어 추가했습니다.
    user_id: number; // 대댓글에도 user_id가 포함될 것으로 예상되어 추가했습니다.
    user_profile : string,
  }[];
}

export type Lecture = {
  forEach: any;
  lecture_id: number;
  credit: number;
  professor_name: string;
  lecture_name: string;
  lecture_room: string;
  lecture_time: string;
  week: string;
  division : string;
  nonattendance: number;
  attendance: number;
  tardy: number;
  absent: number;
  weeknum : number;
  lecture_have_week : number;
  lecture_grade : number;
  lecture_semester : number;
  lecture_credit : number;
  lecture_grades : string;
  session_duration: number;
  today_lecture_state : boolean;
  isScanned?: boolean; // 과목별 출석 여부
}

export type aramData = {
  aram_id : number,
  user_id : number,
  target_id : number,
  title : string,
  target_type : string,
  time : string,
  post_comment_id : number,
  post_comment_title : string,
  hot_post_id : number,
  hot_post_title : string,
  school_notice_id : number,
  school_notice_title : string,
  department_notice_id : number,
  department_notice_title : string,
  my_post_like_id : number,
  my_post_like_title : string,
  new_event_id : number,
  new_event_name : string,
  friend_code_id : number,
  friend_code_my_name : string,
  report_post_id : number,
  report_post_title : string,
  report_comment_id : number,
  report_comment_title : string,
  good_event_id : number,
  good_event_name : string,
  comment_post_id : number,
  comment_contents : string,
  comment_comment_id : number,
  recomment_recomment_id : number,
  recomment_comment_id : number,
  recomment_contents : string
  my_club_register_post_id : number,
  my_club_register_comment : string,
  delete_post_id : number,
  delete_post_reason : string,
  delete_post_title : string,
}

export type EventData = {
  event_id : number,
  campus_id : number,
  user_id : number,
  name : string,
  get_point : number,
  info : string,
  simple_info : string,
  start_date : string,
  close_date : string,
  is_event_close : boolean,
  event_photo : {
    event_id : number,
    event_photo : string,
  }[];
}

export type AdminEventList = {
  event_id : number,
  name : string,
  info : string,
  campus_id : number,
  event_photo : string,
  start_date : string,
  close_date  : string
};

export type EditEventInfo = {
  event_id : number,
  campus_id : number,
  name : string,
  get_point : number,
  info : string,
  simple_info : string,
  start_date : string,
  close_date : string,
}

export type EditEventVote = {
  id : number,
  text : string,
}

export type UserSendEventWithPhoto = {
  user_send_event : number,
  user_id : number,
  event_id : number,
  time : string,
  content : string,
  campus_id : number,
  user_login_id : number,
  user_name : string,
  event_point : number,
  good_event : number,
  photodata: {
    event_id : number,
    user_id : number,
    event_photo : string,
  }[];
}

export type UserSendEventPhotoData = {
  event_id : number,
  user_id : number,
  event_photo : string,
}

export type VoteEvnetData = {
  event_id : number,
  vote_count : number,
  vote_index : number,
  vote_name : string,
}

export type VoteInfoItem = {
  id: number;
  votes: string[];
}

export type VoteDataItem = {
  id: number;
  results: number[];
}

export type PostPhoto = {
  post_id: number;
  post_photo: string;
}

export type Edit_Post_Info = {
  post_id : number,
  user_id : number,
  title : string,
  contents : string,
  department_check : boolean,
  inform_check : boolean
}

export type TimeTableLecture = 
    {
    professor_name: string;
    lecture_name: string;
    lecture_room: string;
    lecture_time: string;
    week : string;
    lecture_grade : number,
    lecture_semester : number
    credit : number
  }


