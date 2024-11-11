import React, { useState, useRef, useEffect } from 'react';
import { 
  StyleSheet, 
  View, 
  Text, 
  FlatList, 
  TouchableOpacity, 
  Alert, 
  Animated, 
  Easing, 
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import config from '../config';
import * as Animatable from 'react-native-animatable'; // react-native-animatable import
import Icon from 'react-native-vector-icons/MaterialIcons'; // icon import

// 사용자 포인트 타입 정의
export type UserPoint = {
  point: number,
};

// 포인트 내역 아이템 타입 정의
export type HistoryItem = {
  content: string,
  point_time: string,
  point_status: number, // 1: 적립, 2: 사용
  point_num: number,
};

const PointHistoryScreen = ({ route, navigation }: any) => {
  console.log("you are in PointHistoryScreen");
  const { userdata } = route.params;

  // 상태 변수 선언
  const [selectMenu, setSelectMenu] = useState<number>(1); // 선택된 메뉴: 1=전체, 2=적립, 3=사용
  const [historyData, setHistoryData] = useState<HistoryItem[]>([]); // 전체 내역
  const [plusPointData, setPlusPointData] = useState<HistoryItem[]>([]); // 적립 내역
  const [minusPointData, setMinusPointData] = useState<HistoryItem[]>([]); // 사용 내역
  const [userPoint, setUserPoint] = useState<UserPoint>({ point: 0 }); // 사용자 포인트

  // 애니메이션 값 초기화
  const animatedValue = useRef(new Animated.Value(0)).current;
  const [displayPoint, setDisplayPoint] = useState<number>(0); // 애니메이션된 포인트 표시용 상태

  // 화면이 포커스될 때 데이터 가져오기
  useFocusEffect(
    React.useCallback(() => {
      const fetchData = async () => {
        try {
          await getHistoryData();
          await getUserPoint();
        } catch (error) {
          console.error('데이터 가져오기 오류:', error);
        }
      };
      fetchData();
    }, [])
  );

  /**
   * 사용자 포인트를 서버에서 가져옵니다.
   */
  const getUserPoint = async () => {
    try {
      const response = await fetch(`${config.serverUrl}/get_user_point`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          user_id: userdata.user_pk,
        }),
      });
      const userPoint: UserPoint = await response.json();
      setUserPoint(userPoint);

      // 애니메이션 시작
      animatedValue.setValue(0); // 애니메이션 초기값 설정
      Animated.timing(animatedValue, {
        toValue: userPoint.point,
        duration: 2000, // 애니메이션 지속 시간 (밀리초)
        easing: Easing.out(Easing.ease),
        useNativeDriver: false, // 숫자 애니메이션이기 때문에 false로 설정
      }).start();

      // 애니메이션 값 변경 시 상태 업데이트
      animatedValue.addListener(({ value }) => {
        setDisplayPoint(Math.floor(value));
      });
    } catch (error) {
      console.error('유저 포인트 가져오기 실패:', error);
      showAlert('오류', '유저 포인트를 가져오는 데 실패했습니다.');
    }
  };

  /**
   * 사용자 포인트 내역을 서버에서 가져옵니다.
   */
  const getHistoryData = async () => {
    try {
      const response = await fetch(`${config.serverUrl}/getHistoryData`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          user_id: userdata.user_pk,
        }),
      });
      const historyData: HistoryItem[] = await response.json();

      // 적립과 사용 내역을 분류
      const plusData: HistoryItem[] = [];
      const minusData: HistoryItem[] = [];
      historyData.forEach(item => {
        if (item.point_status === 1) {
          plusData.push(item);
        } else {
          minusData.push(item);
        }
      });

      setHistoryData(historyData);
      setPlusPointData(plusData);
      setMinusPointData(minusData);
    } catch (error) {
      console.error('포인트 내역 가져오기 실패:', error);
      showAlert('오류', '포인트 내역을 가져오는 데 실패했습니다.');
    }
  };

  /**
   * 선택된 메뉴에 따라 데이터를 필터링합니다.
   */
  const FilterData = () => {
    if (selectMenu === 1) {
      return historyData;
    } else if (selectMenu === 2) {
      return plusPointData;
    } else if (selectMenu === 3) {
      return minusPointData;
    }
    return [];
  };

  /**
   * 시간을 보기 좋게 포맷하는 함수
   * @param {string} timeString - "2024-10-07-21-39"와 같은 시간 문자열
   * @returns {string} - "2024년 10월 7일 21:39"와 같은 포맷된 시간
   */
  const formatDateTime = (timeString: string) => {
    const [year, month, day, hour, minute] = timeString.split('-');
    return `${year}년 ${parseInt(month, 10)}월 ${parseInt(day, 10)}일 ${hour}:${minute}`;
  };

  /**
   * 각 포인트 내역 아이템을 렌더링합니다.
   */
  const renderItem = ({ item }: { item: HistoryItem }) => (
    <Animatable.View animation="fadeInUp" duration={800} style={styles.itemContainer}>
      {/* 포인트 내역 설명 */}
      <View style={styles.itemDescriptionContainer}>
        <Text style={styles.contentText}>{item.content}</Text>
        {/* 시간 포맷 적용 */}
        <Text style={styles.timeText}>{formatDateTime(item.point_time)}</Text>
      </View>
      {/* 포인트 내역 상세 */}
      <View style={styles.itemPointContainer}>
        <Text style={item.point_status === 1 ? styles.positivePointText : styles.negativePointText}>
          {item.point_status === 1 ? '+' : '-'}{item.point_num}P
        </Text>
        <Text style={styles.statusText}>
          {item.point_status === 1 ? '적립' : '사용'}
        </Text>
      </View>
    </Animatable.View>
  );

  /**
   * 사용자에게 알림을 보여줍니다.
   */
  const showAlert = (title: string, message: string) => {
    Alert.alert(
      title,
      message,
      [{ text: "확인" }]
    );
  };

  // 컴포넌트 언마운트 시 리스너 제거
  useEffect(() => {
    return () => {
      animatedValue.removeAllListeners();
    };
  }, [animatedValue]);

  return (
    <View style={styles.container}>
      {/* 포인트 섹션 */}
      <View style={styles.pointSection}>
        <View style={styles.descriptionBox}>
          <Text style={styles.descriptionText}>{userdata.name}님의 보유 포인트</Text>
        </View>
        <View style={styles.pointBox}>
          {/* Animated.Text를 사용하여 애니메이션된 포인트 표시 */}
          <Animated.Text style={styles.pointText}>
            {displayPoint}
          </Animated.Text>
          <Text style={styles.pointPText}>P</Text>
        </View>
      </View>

      {/* 히스토리 섹션 */}
      <Animatable.View animation="fadeIn" duration={1000} style={styles.historySection}>
        {/* 메뉴 선택 */}
        <Animatable.View animation="bounceIn" duration={1500} style={styles.menuBox}>
          <TouchableOpacity 
            onPress={() => setSelectMenu(1)} 
            style={selectMenu === 1 ? styles.selectedMenu : styles.menuButton}
          >
            <Text style={selectMenu === 1 ? styles.selectedMenuText : styles.menuText}>
              전체
            </Text>
          </TouchableOpacity>
          <TouchableOpacity 
            onPress={() => setSelectMenu(2)} 
            style={selectMenu === 2 ? styles.selectedMenu : styles.menuButton}
          >
            <Text style={selectMenu === 2 ? styles.selectedMenuText : styles.menuText}>
              적립
            </Text>
          </TouchableOpacity>
          <TouchableOpacity 
            onPress={() => setSelectMenu(3)} 
            style={selectMenu === 3 ? styles.selectedMenu : styles.menuButton}
          >
            <Text style={selectMenu === 3 ? styles.selectedMenuText : styles.menuText}>
              사용
            </Text>
          </TouchableOpacity>
        </Animatable.View>

        {/* 히스토리 설명 박스 */}
        <Animatable.View animation="fadeIn" delay={500} style={styles.descriptionBox2}>
          <Text style={styles.descriptionText2}>{userdata.name}님의 포인트 내역</Text>
        </Animatable.View>

        {/* 포인트 내역 리스트 */}
        <FlatList
          data={FilterData()}
          renderItem={renderItem}
          keyExtractor={(item, index) => index.toString()}
          ListEmptyComponent={() => (
            <Animatable.View animation="fadeIn" duration={800} style={styles.emptyContainer}>
              <Icon name="inbox" size={100} color="grey" style={styles.emptyIcon} />
              <Text style={styles.emptyText}>내역이 없습니다.</Text>
            </Animatable.View>
          )}
          contentContainerStyle={styles.flatListContent}
        />
      </Animatable.View>
    </View>
  );
};

// 스타일 정의
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F3F4F9', // 밝은 회색 배경
  },
  
  // 포인트 섹션 스타일
  pointSection: {
    height: '20%',
    paddingTop: 20,
    alignItems: 'center',
    backgroundColor: '#F9F9F9', // 진한 파란색 배경
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
  },
  
  descriptionBox: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  
  descriptionText: {
    fontSize: 22,
    color: 'grey', // 흰색 텍스트
    fontWeight: 'bold',
  },
  
  pointBox: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    marginTop: 10,
  },
  
  pointText: {
    fontSize: 60,
    fontWeight: '900',
    color: '#F27400', // 금색 포인트 텍스트
  },
  
  pointPText: {
    fontSize: 55, // P 텍스트 크기 조정
    color: '#FFD700',
    marginLeft: 5,
    fontWeight: 'bold',
  },
  
  // 히스토리 섹션 스타일
  historySection: {
    flex: 1,
    backgroundColor: '#F2F2F2', // 연한 회색 배경
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  
  // 메뉴 박스 스타일
  menuBox: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  
  menuButton: {
    width: '30%',
    height: 45,
    backgroundColor: 'white',
    borderRadius: 25,
    borderWidth: 1,
    borderColor: 'grey',
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 3,
  },
  
  selectedMenu: {
    width: '30%',
    height: 45,
    backgroundColor: '#F27400', // 선택된 메뉴 금색
    borderRadius: 25,
    borderWidth: 1,
    borderColor: '#F27400',
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
    elevation: 3,
  },
  
  menuText: {
    fontSize: 18,
    color: '#404040',
  },
  
  selectedMenuText: {
    fontSize: 18,
    color: 'white',
    fontWeight: 'bold',
  },
  
  // 히스토리 설명 박스
  descriptionBox2: {
    marginBottom: 15,
  },
  
  descriptionText2: {
    fontSize: 19,
    color: '#333333',
    fontWeight: 'bold',
  },
  
  // FlatList 스타일
  flatListContent: {
    paddingBottom: 20,
  },
  
  // 빈 리스트 스타일
  emptyContainer: {
    alignItems: 'center',
    marginTop: 50,
  },
  
  emptyIcon: {
    marginBottom: 10,
  },
  
  emptyText: {
    fontSize: 18,
    color: 'grey',
  },
  
  // 포인트 내역 아이템 스타일
  itemContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 20,
    borderBottomWidth: 0.5,
    borderColor: 'darkgrey',
    backgroundColor: '#FFFFFF',
    borderRadius: 15,
    marginBottom: 15,
    padding: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  
  itemDescriptionContainer: {
    width: '60%',
    paddingLeft: 15,
    justifyContent: 'center',
  },
  
  contentText: {
    fontSize: 18,
    color: '#333333',
    fontWeight: 'bold',
  },
  
  timeText: {
    fontSize: 15,
    color: '#666666',
    marginTop: 5,
  },
  
  itemPointContainer: {
    width: '40%',
    paddingRight: 15,
    justifyContent: 'center',
    alignItems: 'flex-end',
  },
  
  positivePointText: {
    fontSize: 25,
    fontWeight: '900',
    color: '#F27400', // 양수 포인트: 녹색
    textAlign: 'right',
  },
  
  negativePointText: {
    fontSize: 25,
    fontWeight: '900',
    color: 'red', // 음수 포인트: 빨간색
    textAlign: 'right',
  },
  
  statusText: {
    fontSize: 17,
    color: '#333333',
    textAlign: 'right',
    fontWeight: 'bold',
    marginTop: 5,
  },
});

export default PointHistoryScreen;