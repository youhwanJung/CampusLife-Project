import React, { useState, useEffect } from 'react';
import { View, TouchableOpacity, Text, Alert, StyleSheet, Dimensions } from 'react-native';
import { Camera, useCameraDevice, useCodeScanner } from 'react-native-vision-camera';

const FullScreenCamera: React.FC<any> = ({ navigation, route }) => {
  const [isCameraActive, setIsCameraActive] = useState(true);
  const [hasScanned, setHasScanned] = useState(false);
  const [isDelayActive, setIsDelayActive] = useState(false); // 인식 지연 상태 관리
  const device = useCameraDevice('back');
  const selectedLecture = route.params?.selectedLecture;
  const width = Dimensions.get("window").width;

  const isValidQRCode = (code: string): boolean => {
    const prefix = "CampusLife_" + selectedLecture.lecture_name + "_";

    if (!code.startsWith(prefix)) {
      return false;
    }

    const qrTimestamp = code.replace(prefix, "");
    const qrTime = new Date(qrTimestamp);
    const currentTime = new Date();

    const timeDifference = Math.abs(currentTime.getTime() - qrTime.getTime());
    const timeLimit = 5000; // 1초 허용

    return timeDifference <= timeLimit;
  };

  const codeScanner = useCodeScanner({
    codeTypes: ['qr', 'ean-13'],
    onCodeScanned: (codes) => {
      if (isCameraActive && !hasScanned && !isDelayActive) {
        // 1.5초 지연 후에 QR 코드 처리
        setIsDelayActive(true);  // 인식 지연 상태 활성화
        setTimeout(() => {
          const validQRCode = codes.find(code => code.value && isValidQRCode(code.value));
          if (validQRCode) {
            setHasScanned(true);
            setIsCameraActive(false); // 카메라 비활성화
            navigation.navigate('AttendanceScreen', { scannedCode: validQRCode.value });
          } else {
            // Alert가 한 번만 호출되고, 네비게이션이 한 번만 실행되도록 함
            if (!hasScanned) {
              setHasScanned(true); // 스캔 완료 상태 업데이트
              Alert.alert(
                "허용되지 않은 QR 코드입니다.",
                "", // 서브메시지가 없을 경우 빈 문자열
                [
                  {
                    text: "확인",
                    onPress: () => {
                      // 여기서만 네비게이션 트리거
                      setIsCameraActive(false); // 카메라 비활성화
                      navigation.navigate('AttendanceScreen', { scannedCode: null });
                    }
                  }
                ]
              );
            }
          }
          setIsDelayActive(false);  // 지연 상태 초기화
        }, 1500);  // 1500ms = 1.5초 지연
      }
    },
  });

  // 컴포넌트가 마운트될 때 스캔 상태 초기화
  useEffect(() => {
    setHasScanned(false); // 마운트 시 스캔 초기화
    return () => {
      setIsCameraActive(false); // 컴포넌트 언마운트 시 카메라 비활성화
    };
  }, []);

  useEffect(() => {
    if (hasScanned) {
      setIsCameraActive(false); // 스캔 완료 시 카메라 비활성화
    }
  }, [hasScanned]);

  return (
    <View style={{ flex: 1, backgroundColor: 'black' }}>
      <View style={{ backgroundColor: 'black', width: '100%', height: 40, flexDirection: 'row', alignItems: 'center' }}>
        <View style={{ width: '15%', alignItems: 'center',  }}></View>
        <View style={{ width: '70%', alignItems: 'center',  }}>
          <Text style={{ color: 'white', fontSize: 20 }}>출석체크</Text>
        </View>
        <TouchableOpacity
          style={{ width: '15%', alignItems: 'center' }}
          onPress={() => {
            setIsCameraActive(false); // 카메라 비활성화
            navigation.navigate('AttendanceScreen', { scannedCode: null });
          }}
        >
          <Text style={{ color: 'white', fontSize: 20 }}>닫기</Text>
        </TouchableOpacity>
      </View>
      {isCameraActive && device && (
        <Camera
          style={{ width: width, height: width * 2 }}
          device={device}
          photo={true}
          video={false}
          audio={false}
          isActive={true}
          codeScanner={codeScanner}
        />
      )}

      <View style={styles.scannerFrame}>
        <View style={styles.scannerBox} />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  scannerFrame: {
    position: 'absolute',
    top: '30%', // 화면 중앙에 위치시키기 위해 조정
    left: '20%',
    right: '20%',
    height: '40%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  scannerBox: {
    width: '100%',
    height: '100%',
    borderWidth: 3,
    borderColor: 'white',
    borderRadius: 10,
  }
});

export default FullScreenCamera;
