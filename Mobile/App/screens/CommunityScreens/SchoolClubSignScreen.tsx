import React, { useState, useEffect } from 'react';
import {
  Text,
  View,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Alert,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import Icon from 'react-native-vector-icons/AntDesign';
import { RadioButton } from 'react-native-paper';
import config from '../../config';
import { useFocusEffect } from '@react-navigation/native';

// 질문 타입 정의
type Question = {
  id: string;
  type: 'text'; // 모든 질문은 'text' 타입으로 정의
  label: string;
};

/**
 * 두 개의 텍스트 입력 질문을 같은 행에 배치하는 컴포넌트
 */
const RowTextQuestions: React.FC<{
  question1: Question;
  question2: Question;
  value1: string;
  value2: string;
  onChange: (id: string, value: string) => void;
}> = ({ question1, question2, value1, value2, onChange }) => (
  <View style={rowTextStyles.rowContainer}>
    <View style={rowTextStyles.inputContainer}>
      <Text style={rowTextStyles.label}>{question1.label}</Text>
      <TextInput
        style={rowTextStyles.input}
        placeholder={`${question1.label}을 입력하세요`}
        value={value1}
        onChangeText={(text) => onChange(question1.id, text)}
      />
    </View>
    <View style={rowTextStyles.inputContainer}>
      <Text style={rowTextStyles.label}>{question2.label}</Text>
      <TextInput
        style={rowTextStyles.input}
        placeholder={`${question2.label}을 입력하세요`}
        value={value2}
        onChangeText={(text) => onChange(question2.id, text)}
      />
    </View>
  </View>
);

/**
 * 거주지 입력 칸 (하나의 긴 텍스트 입력칸)
 */
const SingleTextQuestion: React.FC<{
  question: Question;
  value: string;
  onChange: (id: string, value: string) => void;
}> = ({ question, value, onChange }) => (
  <View style={singleTextStyles.container}>
    <Text style={singleTextStyles.label}>{question.label}</Text>
    <TextInput
      style={singleTextStyles.input}
      placeholder={`${question.label}을 입력하세요`}
      value={value}
      onChangeText={(text) => onChange(question.id, text)}
    />
  </View>
);

/**
 * 성별 선택 라디오 버튼 컴포넌트
 */
const GenderRadioButton: React.FC<{
  value: string;
  onChange: (newValue: string) => void;
}> = ({ value, onChange }) => (
  <View style={radioStyles.container}>
    <Text style={radioStyles.label}>성별</Text>
    <RadioButton.Group onValueChange={onChange} value={value}>
      <View style={radioStyles.radioItem}>
        <RadioButton value="남자" />
        <Text style={radioStyles.radioLabel}>남자</Text>
      </View>
      <View style={radioStyles.radioItem}>
        <RadioButton value="여자" />
        <Text style={radioStyles.radioLabel}>여자</Text>
      </View>
    </RadioButton.Group>
  </View>
);

/**
 * 긴 텍스트 입력 칸 컴포넌트 (지원동기/자기소개)
 */
const LongTextQuestion: React.FC<{
  question: Question;
  value: string;
  onChange: (id: string, value: string) => void;
}> = ({ question, value, onChange }) => (
  <View style={longTextStyles.container}>
    <Text style={longTextStyles.label}>{question.label}</Text>
    <TextInput
      style={longTextStyles.input}
      placeholder={`${question.label}을 입력하세요`}
      value={value}
      onChangeText={(text) => onChange(question.id, text)}
      multiline
      numberOfLines={6}
      textAlignVertical="top"
    />
  </View>
);

/**
 * 동아리 신청서 작성 화면 컴포넌트
 */
const SchoolClubSignScreen = ({ route, navigation }: any) => {
  const { item, userData } = route.params;

  // 상태 변수 정의
  const [userDepartment, setUserDepartment] = useState<string>('');
  const [userUniversity, setUserUniversity] = useState<string | undefined>('');

  // 질문 데이터 정의
  const questions: Question[] = [
    { id: 'name', type: 'text', label: '이름' },
    { id: 'birthDate', type: 'text', label: '생년월일' },
    { id: 'school', type: 'text', label: '학교' },
    { id: 'department', type: 'text', label: '학과' },
    { id: 'year', type: 'text', label: '학년' },
    { id: 'contact', type: 'text', label: '연락처' },
    { id: 'address', type: 'text', label: '거주지' },
    { id: 'motivation', type: 'text', label: '지원동기' },
    { id: 'introduction', type: 'text', label: '자기소개' },
  ];

  // 각 질문에 대한 응답 상태 관리
  const [answers, setAnswers] = useState<{ [key: string]: string }>({});
  const [gender, setGender] = useState<string>(''); // 성별 상태 관리

  /**
   * 유저의 학과 이름을 서버로부터 가져오는 함수
   */
  const getUserDepartment = async () => {
    try {
      const response = await fetch(`${config.serverUrl}/get_department_name`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ department_name: userData.department_pk }),
      });
      const userDepartmentData = await response.json();
      const departmentName = userDepartmentData.userdepartment;
      setUserDepartment(departmentName);
    } catch (error) {
      console.error('유저 학과 이름 가져오기 실패:', error);
    }
  };

  /**
   * 유저의 대학 이름을 서버로부터 가져오는 함수
   */
  const getUserUniversity = async () => {
    try {
      const response = await fetch(`${config.serverUrl}/get_university_name`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          university_name: userData.campus_pk,
        }),
      });
      const result = await response.json();
      setUserUniversity(result.useruniversity);
    } catch (error) {
      console.error('유저 학교 이름 가져오기 실패:', error);
    }
  };

  useFocusEffect(
    React.useCallback(() => {
      const fetchData = async () => {
        await getUserUniversity(); // 비동기 함수 호출
        await getUserDepartment();
      };

      fetchData(); // 비동기 함수를 호출하여 실행

    }, [])
  );

  useEffect(() => {
    setAnswers({
      name: userData.name || '',
      birthDate: userData.birth || '',
      school: userUniversity || '', // 학교 정보를 채워넣음
      department: userDepartment || '', // 학과 정보를 채워넣음
      year: userData.grade ? String(userData.grade) : '',
      contact: userData.phone || '',
      address: '', // 거주지 정보가 없으므로 빈 값으로 시작
      motivation: '',
      introduction: '',
    });
  }, [userDepartment, userUniversity, userData]);

  /**
   * 입력 값 변경 핸들러
   * @param id 질문의 id
   * @param value 입력된 값
   */
  const handleInputChange = (id: string, value: string) => {
    setAnswers((prevAnswers) => ({
      ...prevAnswers,
      [id]: value,
    }));
  };

  /**
   * 제출 버튼 핸들러
   * 모든 입력란이 채워졌는지 확인하고 서버로 데이터 전송
   */
  const handleSubmit = async () => {
    if (!gender) {
      Alert.alert('성별을 선택해주세요.');
      return;
    }

    for (let question of questions) {
      if (!answers[question.id]) {
        Alert.alert('모든 입력란에 입력해주세요.');
        return;
      }
    }

    const applicant = {
      post_id: item.post_id, // 동아리 게시글 ID
      name: answers.name,
      birth: answers.birthDate,
      university: answers.school,
      department: answers.department,
      grade: answers.year,
      phone: answers.contact,
      sex: gender,
      residence: answers.address,
      application: answers.motivation,
      introduce: answers.introduction,
    };

    try {
      // 서버로 데이터 전송
      const response = await fetch(`${config.serverUrl}/ClubInsert`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(applicant),
      });

      const result = await response.json();
      if (result.message === 'Data received successfully') {
        Alert.alert('동아리 신청이 완료되었습니다.');
        navigation.goBack();
      } else {
        Alert.alert('신청에 실패했습니다.');
      }
    } catch (error) {
      console.error('Error submitting form:', error);
      Alert.alert('서버와 통신 중 오류가 발생했습니다.');
    }
  };

  return (
    <KeyboardAvoidingView
      style={mainScreenStyles.container}
      behavior={Platform.select({ ios: 'padding', android: undefined })}
    >
      <ScrollView contentContainerStyle={mainScreenStyles.contentContainer}>
        <Text style={mainScreenStyles.title}>동아리 신청서</Text>

        {/* 이름/생년월일 입력 */}
        <RowTextQuestions
          question1={questions[0]}
          question2={questions[1]}
          value1={answers['name']}
          value2={answers['birthDate']}
          onChange={handleInputChange}
        />

        {/* 학교/학과 입력 */}
        <RowTextQuestions
          question1={questions[2]}
          question2={questions[3]}
          value1={answers['school']}
          value2={answers['department']}
          onChange={handleInputChange}
        />

        {/* 학년/연락처 입력 */}
        <RowTextQuestions
          question1={questions[4]}
          question2={questions[5]}
          value1={answers['year']}
          value2={answers['contact']}
          onChange={handleInputChange}
        />

        {/* 성별 선택 라디오 버튼 */}
        <GenderRadioButton value={gender} onChange={setGender} />

        {/* 거주지 입력 */}
        <SingleTextQuestion
          question={questions[6]}
          value={answers['address']}
          onChange={handleInputChange}
        />

        {/* 지원동기 긴 텍스트 입력 */}
        <LongTextQuestion
          question={questions[7]}
          value={answers['motivation']}
          onChange={handleInputChange}
        />

        {/* 자기소개 긴 텍스트 입력 */}
        <LongTextQuestion
          question={questions[8]}
          value={answers['introduction']}
          onChange={handleInputChange}
        />

        {/* 제출 버튼 */}
        <TouchableOpacity style={mainScreenStyles.submitButton} onPress={handleSubmit}>
          <Icon name="checkcircle" size={24} color="#fff" />
          <Text style={mainScreenStyles.submitButtonText}>신청하기</Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

/**
 * 메인 스타일 정의
 */
const mainScreenStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f6fa',
  },
  contentContainer: {
    padding: 20,
    paddingBottom: 40,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#2c3e50',
    alignSelf: 'center',
    marginVertical: 20,
  },
  submitButton: {
    flexDirection: 'row',
    backgroundColor: '#3498db',
    borderRadius: 30,
    paddingVertical: 15,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 30,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 20,
    marginLeft: 10,
    fontWeight: 'bold',
  },
});

/**
 * 두 개의 텍스트 질문이 같은 줄에 배치되는 스타일 정의
 */
const rowTextStyles = StyleSheet.create({
  rowContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 15,
  },
  inputContainer: {
    flex: 1,
    marginHorizontal: 5,
  },
  label: {
    fontSize: 16,
    color: '#34495e',
    marginBottom: 5,
  },
  input: {
    borderWidth: 1,
    borderColor: '#bdc3c7',
    borderRadius: 5,
    padding: 10,
    fontSize: 16,
    backgroundColor: '#ecf0f1',
    textAlignVertical: 'center',
  },
});

/**
 * 단일 텍스트 질문 스타일 정의 (거주지 입력용)
 */
const singleTextStyles = StyleSheet.create({
  container: {
    marginBottom: 15,
    backgroundColor: '#fff',
    borderRadius: 10,
    paddingHorizontal: 15,
    paddingVertical: 10,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  label: {
    fontSize: 16,
    color: '#34495e',
    marginBottom: 5,
  },
  input: {
    borderWidth: 1,
    borderColor: '#bdc3c7',
    borderRadius: 5,
    padding: 10,
    fontSize: 16,
    backgroundColor: '#ecf0f1',
    textAlignVertical: 'center',
  },
});

/**
 * 긴 텍스트 질문 스타일 정의 (지원동기/자기소개 입력용)
 */
const longTextStyles = StyleSheet.create({
  container: {
    marginBottom: 15,
    backgroundColor: '#fff',
    borderRadius: 10,
    paddingHorizontal: 15,
    paddingVertical: 10,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  label: {
    fontSize: 16,
    color: '#34495e',
    marginBottom: 5,
  },
  input: {
    borderWidth: 1,
    borderColor: '#bdc3c7',
    borderRadius: 5,
    padding: 10,
    fontSize: 16,
    backgroundColor: '#ecf0f1',
    textAlignVertical: 'top',
  },
});

/**
 * 성별 라디오 버튼 스타일 정의
 */
const radioStyles = StyleSheet.create({
  container: {
    marginBottom: 15,
    backgroundColor: '#fff',
    borderRadius: 10,
    paddingHorizontal: 15,
    paddingVertical: 10,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  label: {
    fontSize: 16,
    color: '#34495e',
    marginBottom: 10,
  },
  radioItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 5,
  },
  radioLabel: {
    fontSize: 16,
    color: '#34495e',
  },
});

export default SchoolClubSignScreen;
