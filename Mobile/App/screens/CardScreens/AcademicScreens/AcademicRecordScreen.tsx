import React, { useState, useEffect } from 'react';
import { 
    Text, 
    View, 
    StyleSheet, 
    ScrollView, 
    Dimensions, 
    TouchableOpacity,
    Platform,
} from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { Table, Row, Rows } from 'react-native-table-component';
import { UserData, Lecture } from '../../../types/type';
import IconH from 'react-native-vector-icons/FontAwesome';
import FontAwesome5 from 'react-native-vector-icons/FontAwesome5'; // 아이콘 추가를 위해 FontAwesome5 사용

const { width } = Dimensions.get("window");

const AcademicRecord = ({ route }: any) => {
    const { userdata, LectureData } = route.params;
    const [userData, setUserData] = useState<UserData>(userdata);
    const [userLecture, setUserLecture] = useState<Lecture[]>(LectureData);

    const [visibleSemesters, setVisibleSemesters] = useState<number[]>([]);
    const [selectedSemester, setSelectedSemester] = useState<number | null>(null);

    useEffect(() => {
        const semesters: number[] = [];
        for (let year = 1; year <= userData.college; year++) {
            semesters.push(year * 2 - 1); // Odd semester
            semesters.push(year * 2);     // Even semester
        }
        setVisibleSemesters(semesters);
    
        // 3학년 1학기에 해당하는 값을 기본값으로 설정
        if (semesters.includes(5)) {
            setSelectedSemester(5);
        } else if (semesters.length > 0) {
            setSelectedSemester(semesters[0]);
        }
    }, [userData.college]);
        

    const semesterLabels: Record<number, string> = {
        1: '1학년 1학기',
        2: '1학년 2학기',
        3: '2학년 1학기',
        4: '2학년 2학기',
        5: '3학년 1학기',
        6: '3학년 2학기',
        7: '4학년 1학기',
        8: '4학년 2학기',
    };

    const semesterData: Record<number, Lecture[]> = {
        1: userLecture.filter(lecture => lecture.lecture_grade === 1 && lecture.lecture_semester === 1),
        2: userLecture.filter(lecture => lecture.lecture_grade === 1 && lecture.lecture_semester === 2),
        3: userLecture.filter(lecture => lecture.lecture_grade === 2 && lecture.lecture_semester === 1),
        4: userLecture.filter(lecture => lecture.lecture_grade === 2 && lecture.lecture_semester === 2),
        5: userLecture.filter(lecture => lecture.lecture_grade === 3 && lecture.lecture_semester === 1),
        6: userLecture.filter(lecture => lecture.lecture_grade === 3 && lecture.lecture_semester === 2),
        7: userLecture.filter(lecture => lecture.lecture_grade === 4 && lecture.lecture_semester === 1),
        8: userLecture.filter(lecture => lecture.lecture_grade === 4 && lecture.lecture_semester === 2),
    };

    // 학기별 학점 요약 계산 함수
    const calculateCredits = (lectures: Lecture[]) => {
        let totalCredits = 0;
        let majorCredits = 0;
        let electiveCredits = 0;

        lectures.forEach(lecture => {
            totalCredits += lecture.credit;
            if (lecture.division === '전공') {
                majorCredits += lecture.credit;
            } else if (lecture.division === '교양') {
                electiveCredits += lecture.credit;
            }
        });

        return { totalCredits, majorCredits, electiveCredits };
    };

    const { totalCredits, majorCredits, electiveCredits } = selectedSemester && semesterData[selectedSemester]
        ? calculateCredits(semesterData[selectedSemester])
        : { totalCredits: 0, majorCredits: 0, electiveCredits: 0 };

    return (
        <View style={styles.container}>
            {/* 학기 선택기 */}
            <View style={styles.pickerContainer}>
                <IconH name="calendar" size={24} color="#1E90FF" style={styles.pickerIcon} />
                <Picker
                    selectedValue={selectedSemester}
                    style={styles.picker}
                    dropdownIconColor='#1E90FF'
                    onValueChange={(itemValue) => setSelectedSemester(itemValue)}
                >
                    {visibleSemesters.map((semester) => (
                        <Picker.Item 
                            key={semester} 
                            label={semesterLabels[semester]} 
                            value={semester} 
                        />
                    ))}
                </Picker>
            </View>

            {/* 학기별 강의 데이터 테이블 */}
            {selectedSemester && (
                <View style={styles.tableContainer}>
                    {semesterData[selectedSemester].length === 0 ? (
                        <Text style={styles.noDataText}>데이터가 없습니다.</Text>
                    ) : (
                        <ScrollView horizontal={true} showsHorizontalScrollIndicator={false}>
                            <Table borderStyle={styles.tableBorder}>
                                <Row
                                    data={["과목명", "구분", "담당교수", "학점", "수업시간", "강의실"]}
                                    style={styles.tableHeader}
                                    textStyle={styles.tableHeaderText}
                                    widthArr={[180, 60, 80, 60, 120, 70]}
                                />
                                <Rows
                                    data={semesterData[selectedSemester].map(lecture => [
                                        lecture.lecture_name,
                                        lecture.division,
                                        lecture.professor_name,
                                        lecture.credit.toString(),
                                        lecture.lecture_time,
                                        lecture.lecture_room
                                    ])}
                                    style={styles.tableRows}
                                    textStyle={styles.tableText}
                                    widthArr={[180, 60, 80, 60, 120, 70]}
                                />
                            </Table>
                        </ScrollView>
                    )}

                    {/* 학점 요약 정보 */}
                    {semesterData[selectedSemester].length > 0 && (
                        <View style={styles.summaryContainer}>
                            <View style={styles.summaryBox}>
                                <FontAwesome5 name="balance-scale" size={20} color="#1E90FF" style={styles.summaryIcon} />
                                <View>
                                    <Text style={styles.summaryLabel}>총 학점</Text>
                                    <Text style={styles.summaryValue}>{totalCredits} 학점</Text>
                                </View>
                            </View>
                            <View style={styles.summaryBox}>
                                <FontAwesome5 name="graduation-cap" size={20} color="#FFD700" style={styles.summaryIcon} />
                                <View>
                                    <Text style={styles.summaryLabel}>전공 학점</Text>
                                    <Text style={styles.summaryValue}>{majorCredits} 학점</Text>
                                </View>
                            </View>
                            <View style={styles.summaryBox}>
                                <FontAwesome5 name="book" size={20} color="#32CD32" style={styles.summaryIcon} />
                                <View>
                                    <Text style={styles.summaryLabel}>교양 학점</Text>
                                    <Text style={styles.summaryValue}>{electiveCredits} 학점</Text>
                                </View>
                            </View>
                        </View>
                    )}
                </View>
            )}
        </View>
    );

};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F5F5F5',
        paddingTop: 20,
        paddingBottom: 20,
        paddingHorizontal: 15,
    },
    pickerContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#fff',
        borderRadius: 10,
        paddingHorizontal: 10,
        paddingVertical: 5,
        elevation: 3,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
        marginBottom: 20,
    },
    pickerIcon: {
        marginRight: 10,
    },
    picker: { 
        flex: 1,
        height: 50,
        color: '#333',
        fontSize: 16,
    },
    tableContainer: {
        flex: 1,
        backgroundColor: '#fff',
        borderRadius: 10,
        elevation: 3,
        padding: 10,
    },
    noDataText: {
        textAlign: 'center',
        marginTop: 20,
        fontSize: 18,
        fontWeight: 'bold',
        color: 'gray',
    },
    tableBorder: {
        borderWidth: 1,
        borderColor: '#E0E0E0',
    },
    tableHeader: {
        height: 50,
        backgroundColor: '#1E90FF',
        borderTopLeftRadius: 10,
        borderTopRightRadius: 10,
        borderBottomWidth: 2,
        borderBottomColor: '#E0E0E0',
    },
    tableHeaderText: {
        textAlign: 'center',
        fontWeight: '700',
        color: '#fff',
        fontSize: 16,
    },
    tableRows: {
        height: 50,
        backgroundColor: '#FAFAFA',
        borderBottomWidth: 1,
        borderBottomColor: '#E0E0E0',
    },
    tableText: {
        textAlign: 'center',
        fontWeight: '500',
        color: '#333',
        fontSize: 14,
    },
    summaryContainer: {
        marginTop: 20,
        flexDirection: 'row',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
    },
    summaryBox: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#f0f8ff',
        padding: 15,
        borderRadius: 10,
        width: (width - 60) / 3, // 3개가 한 줄에 들어가도록 너비 설정 (padding 및 margin 고려)
        marginBottom: 15,
        elevation: 5,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.2,
        shadowRadius: 2,
    },
    summaryIcon: {
        marginRight: 10,
    },
    summaryLabel: {
        fontSize: 14,
        fontWeight: '600',
        color: '#333',
    },
    summaryValue: {
        fontSize: 16,
        fontWeight: '700',
        color: '#333',
    },
});

export default AcademicRecord;
