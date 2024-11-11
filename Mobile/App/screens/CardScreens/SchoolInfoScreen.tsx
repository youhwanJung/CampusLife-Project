import React, { useState, useEffect, useRef } from 'react';
import { 
  Dimensions, 
  Text, 
  View, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity, 
  ActivityIndicator 
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { Table, Row, Rows } from "react-native-table-component";
import { Picker } from '@react-native-picker/picker';
import { 
  NaverMapView, 
  Camera, 
  NaverMapMarkerOverlay 
} from "@mj-studio/react-native-naver-map";
import IconA from 'react-native-vector-icons/FontAwesome6';
import config from '../../config';

// 기기 너비를 기준으로 동적인 너비 계산
const DEVICE_WIDTH = Dimensions.get("window").width * 0.9;

// 학교 데이터와 건물 데이터의 타입 정의
export type SchoolData = {
  department_name: string;
  campus_name: string;
  department_phone: string;
  department_floor: string;
  department_building: string;
};

export type SchoolBuildingData = {
  building_name: string;
  campus_place: string;
  latitude: string;
  longitude: string;
};

// 테이블 헤더와 열 너비 정의
const TABLE_HEADERS = ["층", "학과", "학과 사무실 전화번호"];
const COLUMN_WIDTHS = [DEVICE_WIDTH * 0.2, DEVICE_WIDTH * 0.4, DEVICE_WIDTH * 0.4];
const TABLE_BORDER_COLOR = 'lightgray';

// 다른 캠퍼스의 카메라 위치 사전 정의
const CAMERAS = {
  campus: {
    latitude: 37.48943025,
    longitude: 126.77881105,
    zoom: 16.5,
  },
  sosaCampus: {
    latitude: 37.4635299631291,
    longitude: 126.8038623428179,
    zoom: 16.5,
  },
};

const SchoolInfoScreen = () => {
  // 상태 변수 선언
  const [visibleBuilding, setVisibleBuilding] = useState<string | null>(null);
  const [schoolData, setSchoolData] = useState<SchoolData[]>([]);
  const [schoolBuildingData, setSchoolBuildingData] = useState<SchoolBuildingData[]>([]);
  const [selectedCampus, setSelectedCampus] = useState('본캠퍼스');
  const [filteredBuildings, setFilteredBuildings] = useState<SchoolBuildingData[]>([]);
  const [camera, setCamera] = useState<Camera>(CAMERAS.campus);
  const [isLoading, setIsLoading] = useState<boolean>(true); // 로딩 상태

  // 레퍼런스 선언
  const scrollViewRef = useRef<ScrollView>(null);
  const buildingRefs = useRef<{ [key: string]: View | null }>({});

  /**
   * 건물 정보의 가시성을 토글합니다.
   * 정보가 표시되고 있다면 숨기고, 숨겨져 있다면 표시합니다.
   * 또한 선택된 건물로 스크롤합니다.
   * 
   * @param buildingName - 토글할 건물의 이름
   */
  const toggleInfoDataVisibility = (buildingName: string) => {
    setVisibleBuilding(prev => (prev === buildingName ? null : buildingName));

    if (buildingRefs.current[buildingName]) {
      buildingRefs.current[buildingName]?.measureLayout(
        scrollViewRef.current as unknown as number,
        (x, y, width, height) => {
          (scrollViewRef.current as unknown as ScrollView)?.scrollTo({ y: y - 10, animated: true });
        },
      );
    }
  };

  /**
   * 서버에서 학교 학과 데이터를 가져옵니다.
   */
  const fetchSchoolData = async () => {
    try {
      const response = await fetch(`${config.serverUrl}/getSchoolInfo`);
      if (!response.ok) throw new Error('서버 응답 실패');
      const data = await response.json();
      setSchoolData(data);
    } catch (error) {
      console.error('학교 정보를 가져오는 중 오류 발생:', error);
    }
  };

  /**
   * 서버에서 학교 건물 데이터를 가져옵니다.
   */
  const fetchSchoolBuildingData = async () => {
    try {
      const response = await fetch(`${config.serverUrl}/getSchoolBuildingInfo`);
      if (!response.ok) throw new Error('서버 응답 실패');
      const data = await response.json();
      setSchoolBuildingData(data);
    } catch (error) {
      console.error('학교 건물 정보를 가져오는 중 오류 발생:', error);
    }
  };

  /**
   * 주어진 건물 이름에 해당하는 학과 목록을 렌더링합니다.
   * 학과는 층 번호 기준으로 정렬됩니다.
   * 
   * @param buildingName - 건물의 이름
   * @returns JSX.Element 배열
   */
  const renderDepartmentList = (buildingName: string) => (
    schoolData
      .filter(item => item.department_building === buildingName)
      .sort((a, b) => parseInt(a.department_floor) - parseInt(b.department_floor))
      .map((item, idx) => (
        <Rows
          key={idx}
          data={[[item.department_floor, item.department_name, item.department_phone]]}
          style={styles.tableRow}
          textStyle={styles.tableText}
          widthArr={COLUMN_WIDTHS}
        />
      ))
  );

  /**
   * 화면이 포커스될 때 데이터를 가져옵니다.
   */
  useFocusEffect(
    React.useCallback(() => {
      const fetchData = async () => {
        try {
          await fetchSchoolData();
          await fetchSchoolBuildingData();
          setIsLoading(false); // 데이터 로딩 완료
        } catch (error) {
          console.error('데이터를 가져오는 중 오류 발생:', error);
          setIsLoading(false); // 오류 발생 시에도 로딩 종료
        }
      };
      fetchData();
    }, [])
  );

  /**
   * 선택된 캠퍼스에 따라 건물 목록을 필터링합니다.
   * schoolBuildingData 또는 selectedCampus가 변경될 때 실행됩니다.
   */
  useEffect(() => {
    const filtered = schoolBuildingData.filter(
      building => 
        building.campus_place === selectedCampus && 
        building.building_name !== building.campus_place
    );
    setFilteredBuildings(filtered);
  }, [schoolBuildingData, selectedCampus]);

  /**
   * 캠퍼스 선택이 변경될 때 처리합니다.
   * 선택된 캠퍼스를 업데이트하고 카메라 위치를 변경합니다.
   * 
   * @param itemValue - 선택된 캠퍼스 값
   */
  const handleCampusChange = (itemValue: string) => {
    setSelectedCampus(itemValue);
    setCamera(itemValue === '본캠퍼스' ? CAMERAS.campus : CAMERAS.sosaCampus);
  };

  return (
    <View style={styles.container}>
      {/* 데이터 로딩 중일 때 로딩 스피너 표시 */}
      {isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#4CAF50" />
          <Text style={styles.loadingText}>데이터를 로딩 중입니다...</Text>
        </View>
      ) : (
        <ScrollView ref={scrollViewRef} contentContainerStyle={styles.scrollContainer}>
          {/* 네이버 지도 뷰 */}
          <View style={styles.mapContainer}>
            <NaverMapView style={styles.map} camera={camera}>
              {filteredBuildings.map((building, index) => (
                <NaverMapMarkerOverlay
                  key={index}
                  latitude={parseFloat(building.latitude)}
                  longitude={parseFloat(building.longitude)}
                  onTap={() => toggleInfoDataVisibility(building.building_name)}
                  anchor={{ x: 0.3, y: 0.5 }}
                  caption={{ text: building.building_name, textSize: 14, haloColor: 'white' }}
                  subCaption={{ text: building.campus_place }}
                  width={32}
                  height={32}
                >
                  <IconA name="location-dot" size={32} color="#4CAF50" />
                </NaverMapMarkerOverlay>
              ))}
            </NaverMapView>
          </View>

          {/* 캠퍼스 선택 피커 */}
          <View style={styles.pickerContainer}>
            <Picker
              selectedValue={selectedCampus}
              style={styles.picker}
              onValueChange={handleCampusChange}
              dropdownIconColor={'#4CAF50'}
              mode="dropdown"
            >
              <Picker.Item label="본캠퍼스" value="본캠퍼스" />
              <Picker.Item label="소사캠퍼스" value="소사캠퍼스" />
            </Picker>
          </View>

          {/* 건물 목록과 해당 건물의 학과 정보 */}
          {filteredBuildings.map((building, index) => (
            <View
              key={index}
              ref={(el) => { buildingRefs.current[building.building_name] = el; }}
              style={styles.card}
            >
              {/* 건물 헤더 */}
              <TouchableOpacity 
                style={styles.infoArea} 
                onPress={() => toggleInfoDataVisibility(building.building_name)}
              >
                <Text style={styles.infoText}>{building.building_name}</Text>
                <IconA 
                  name={visibleBuilding === building.building_name ? "chevron-up" : "chevron-down"} 
                  size={20} 
                  color="#4CAF50" 
                />
              </TouchableOpacity>

              {/* 학과 정보 테이블 */}
              {visibleBuilding === building.building_name && (
                <View style={styles.infodata}>
                  <Table borderStyle={{ borderWidth: 1, borderColor: TABLE_BORDER_COLOR }}>
                    {/* 테이블 헤더 */}
                    <Row
                      data={TABLE_HEADERS}
                      style={styles.tableHeader}
                      textStyle={styles.tableHeaderText}
                      widthArr={COLUMN_WIDTHS}
                    />
                    {/* 테이블 행들 */}
                    {renderDepartmentList(building.building_name)}
                  </Table>
                </View>
              )}
            </View>
          ))}
        </ScrollView>
      )}
    </View>
  );
};

// 컴포넌트 스타일 정의
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5', // 연한 회색 배경
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#555555',
  },
  scrollContainer: {
    padding: 10,
    paddingBottom: 20,
  },
  mapContainer: {
    width: '100%',
    height: 500, // 지도 높이 증가
    borderRadius: 15,
    overflow: 'hidden',
    marginBottom: 20,
    elevation: 3,
    shadowColor: '#000', // iOS 그림자
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
  },
  map: {
    width: '100%',
    height: '100%',
  },
  pickerContainer: {
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#4CAF50',
    borderRadius: 10,
    overflow: 'hidden',
    backgroundColor: '#ffffff',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
  },
  picker: {
    height: 50,
    width: '100%',
    color: '#4CAF50',
    backgroundColor: '#ffffff',
  },
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 15,
    marginBottom: 5,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    overflow: 'hidden',
  },
  infoArea: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 15,
    backgroundColor: '#4CAF50',
  },
  infoText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: 'white',
  },
  infodata: {
    padding: 10,
    backgroundColor: '#FAFAFA',
  },
  tableHeader: {
    height: 40,
    backgroundColor: "#E0E0E0",
  },
  tableHeaderText: {
    textAlign: "center",
    fontWeight: "bold",
    color: '#333333',
    fontSize: 14,
  },
  tableRow: {
    width: DEVICE_WIDTH,
    height: 40,
    backgroundColor: '#FFFFFF',
  },
  tableText: {
    textAlign: "center",
    fontWeight: '500',
    color: '#555555',
    fontSize: 14,
  },
});

export default SchoolInfoScreen;
