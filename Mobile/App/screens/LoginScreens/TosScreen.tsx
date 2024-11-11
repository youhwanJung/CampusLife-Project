import React, { useState } from 'react';
import { StyleSheet, View, Text, Modal, TouchableOpacity, ScrollView, TouchableOpacityBase } from 'react-native';
import BouncyCheckbox from "react-native-bouncy-checkbox";
import IconA from 'react-native-vector-icons/FontAwesome';

const TosScreen = ({ navigation }: any) => {
  const [isModalVisible, setModalVisible] = useState(false);
  const [isModalVisible2, setModalVisible2] = useState(false);
  const [isChecked, setIsChecked] = useState(false); // 체크박스 상태 관리
  const [isChecked2, setIsChecked2] = useState(false); // 체크박스 상태 관리

  const toggleModal = () => {
    setModalVisible(!isModalVisible);
  };

  const toggleModal2 = () => {
    setModalVisible2(!isModalVisible2);
  };

  const isAgreeEnabled = isChecked && isChecked2;

  return (
    <View style={styles.container}>
      <View style={{ marginLeft: 30, marginTop: 50 }}>
        <Text style={{ fontSize: 25, fontWeight: "bold", color: "black" }}>
          캠퍼스 라이프의 서비스 이용을 위해
          {'\n'}약관에 동의해 주세요.
        </Text>
        <Text style={{ fontSize: 18, fontWeight: "bold", marginTop: 20 }}>
          캠퍼스 라이프의 다양한 서비스 및 혜택을 위해서는
          {'\n'}약관에 동의가 필요해요!
        </Text>
        <BouncyCheckbox
          style={styles.Checkbox}
          size={40}
          fillColor="black"
          unfillColor="#FFFFFF"
          text="[필수] 개인정보처리동의서 "
          iconStyle={{ borderColor: "black" }}
          textStyle={{ fontFamily: "JosefinSans-Regular", textDecorationLine: "none" }}
          isChecked={isChecked} // 체크박스 상태 설정
          disableBuiltInState={true} // 체크박스 자체 상태 변경 방지
          onPress={() => {
            toggleModal(); // 체크박스 대신 모달만 열리게 처리
          }}
        />
        <BouncyCheckbox
          style={styles.Checkbox}
          size={40}
          fillColor="black"
          unfillColor="#FFFFFF"
          text="[필수] 개인정보처리방침 "
          iconStyle={{ borderColor: "black" }}
          textStyle={{ fontFamily: "JosefinSans-Regular", textDecorationLine: "none" }}
          isChecked={isChecked2} // 체크박스 상태 설정
          disableBuiltInState={true} // 체크박스 자체 상태 변경 방지
          onPress={() => {
            toggleModal2(); // 체크박스 대신 모달만 열리게 처리
          }}
        />
        <TouchableOpacity style={styles.disagree}>
          <Text style={{ fontSize: 18, color: "black" }}>아니요, 동의하지 않습니다.</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.agree2, { backgroundColor: isAgreeEnabled ? '#6bd65a' : '#d3d3d3' }]}
          disabled={!isAgreeEnabled} // 활성화 여부에 따라 버튼 비활성화
          onPress={() => {
            if (isAgreeEnabled) {
              navigation.navigate("RegisterScreen");
            }
          }}
        >
          <Text style={{ fontSize: 18, color: "black" }}>네, 동의합니다.</Text>
        </TouchableOpacity>
      </View>

      <Modal
        animationType="slide"
        transparent={true}
        visible={isModalVisible}
        onRequestClose={toggleModal} // Android 백버튼 누를 때 모달 닫기
      >
        <View style={styles.modalContainer}>
          {/* 아이콘을 오른쪽 상단에 배치 */}
          <TouchableOpacity style={styles.closeIcon} onPress={() => {
            setIsChecked(false);
            toggleModal()
          }}>
            <IconA name="close" size={40} color="black" />
          </TouchableOpacity>
          <View style={styles.modalView}>
            <Text style={styles.modalTitle}>개인정보처리동의서</Text>
            <ScrollView contentContainerStyle={styles.scrollContainer}>
              <Text style={styles.modalText}>
                캠퍼스라이프(이하 '회사'라고 합니다)는 개인정보보호법 등 관련 법령상의 개인정보보호 규정을 준수하며 귀하의 개인정보보호에 최선을 다하고 있습니다.{'\n'}{'\n'} 
                회사는 개인정보보호법에 근거하여 다음과 같은 내용으로 개인정보를 수집 및 처리하고자 합니다.{'\n'}{'\n'} 
                다음의 내용을 자세히 읽어보시고 모든 내용을 이해하신 후에 동의 여부를 결정해주시기 바랍니다.{'\n'}{'\n'} 
                제1조(개인정보 수집 및 이용 목적){'\n'}{'\n'} 
                이용자가 제공한 모든 정보는 다음의 목적을 위해 활용하며, 목적 이외의 용도로는 사용되지 않습니다.{'\n'} 
                - 본인확인 {'\n'}{'\n'} 
                제2조(개인정보 수집 및 이용 항목){'\n'}{'\n'} 
                회사는 개인정보 수집 목적을 위하여 다음과 같은 정보를 수집합니다. {'\n'} 
                - 성명, 주소, 전화번호, 이메일, 성별, 나이 및 생년월일{'\n'}{'\n'} 
                제3조(개인정보 보유 및 이용 기간){'\n'}{'\n'} 
                수집한 개인정보는 수집·이용 동의일로부터 개인정보 수집·이용 목적을 달성할 때까지 보관 및 이용합니다.{'\n'} 
                개인정보 보유기간의 경과, 처리목적의 달성 등 개인정보가 불필요하게 되었을 때에는 지체없이 해당 개인정보를 파기합니다.{'\n'}{'\n'} 
                제4조(동의 거부 관리){'\n'}{'\n'} 
                귀하는 본 안내에 따른 개인정보 수집·이용에 대하여 동의를 거부할 권리가 있습니다. 다만, 귀하가 개인정보 동의를 거부하시는 경우에 회원가입, 서비스 이용의 불이익이 발생할 수 있음을 알려드립니다.{'\n'}{'\n'} 
                본인은 위의 동의서 내용을 충분히 숙지하였으며, 위와 같이 개인정보를 수집·이용하는데 동의합니다.
              </Text>
            </ScrollView>
              <TouchableOpacity 
                style={styles.agree} 
                onPress={() => {
                  setIsChecked(true); // 동의할 때 체크박스 상태를 체크로 변경
                  toggleModal(); // 모달 닫기
                }}
              >
                <Text style={{ fontSize: 18, color: "black" }}>동의합니다</Text>
              </TouchableOpacity>
          </View>
        </View>
      </Modal>
      <Modal
        animationType="slide"
        transparent={true}
        visible={isModalVisible2}
        onRequestClose={toggleModal2} // Android 백버튼 누를 때 모달 닫기
      >
        <View style={styles.modalContainer}>
          {/* 아이콘을 오른쪽 상단에 배치 */}
          <TouchableOpacity style={styles.closeIcon} onPress={() => {
            setIsChecked2(false);
            toggleModal2()
          }}>
            <IconA name="close" size={40} color="black" />
          </TouchableOpacity>
          <View style={styles.modalView}>
            <Text style={styles.modalTitle}>개인정보처리방침</Text>
            <ScrollView contentContainerStyle={styles.scrollContainer}>
              <Text style={styles.modalText}>
                제1조(회원 가입을 위한 정보){"\n"}
                {"\n"}
                회사는 이용자의 회사 서비스에 대한 회원가입을 위하여 다음과 같은 정보를 수집합니다.{"\n"}
                필수 수집 정보: 이메일 주소, 비밀번호, 이름, 닉네임, 생년월일 및 휴대폰 번호{"\n"}
                {"\n"}

                제2조(본인 인증을 위한 정보){"\n"}
                {"\n"}
                회사는 이용자의 본인인증을 위하여 다음과 같은 정보를 수집합니다.{"\n"}
                필수 수집 정보: 휴대폰 번호, 이름, 이동통신사, 아이핀 정보(아이핀 확인 시) 및 내/외국인 여부{"\n"}
                {"\n"}

                제3조(서비스 이용 및 부정 이용 확인을 위한 정보){"\n"}
                {"\n"}
                회사는 이용자의 서비스 이용에 따른 통계∙분석 및 부정이용의 확인∙분석을 위하여 다음과 같은 정보를 수집합니다.{"\n"}
                필수 수집 정보: 서비스 이용기록, 쿠키, 접속지 정보 및 기기정보{"\n"}
                {"\n"}
                - 신규 서비스 개발을 위한 경우{"\n"}
                - 이벤트 및 행사 안내 등 마케팅을 위한 경우{"\n"}
                - 인구통계학적 분석, 서비스 방문 및 이용기록의 분석을 위한 경우{"\n"}
                {"\n"}

                제4조(광고성 정보의 전송 조치){"\n"}
                {"\n"}
                회사는 전자적 전송매체를 이용하여 영리목적의 광고성 정보를 전송하는 경우 이용자의 명시적인 사전동의를 받습니다.{"\n"}
                {"\n"}
                회사가 재화 등의 거래관계를 통하여 수신자로부터 직접 연락처를 수집한 경우, 거래가 종료된 날로부터 6개월 이내에 회사가 처리하고 수신자와 거래한 것과 동종의 재화 등에 대한 영리목적의 광고성 정보를 전송하려는 경우{"\n"}
                {"\n"}

                제5조(이용자의 의무){"\n"}
                {"\n"}
                이용자는 자신의 개인정보를 최신의 상태로 유지해야 하며, 이용자의 부정확한 정보 입력으로 발생하는 문제의 책임은 이용자 자신에게 있습니다.{"\n"}
                {"\n"}
                타인의 개인정보를 도용한 회원가입의 경우 이용자 자격을 상실하거나 관련 법령에 의해 처벌받을 수 있습니다.{"\n"}
                {"\n"}

                제6조(개인정보 유출 등에 대한 조치){"\n"}
                {"\n"}
                회사는 개인정보의 유출 사실을 알게 된 때에는 지체 없이 이용자에게 알리고, 방송통신위원회 또는 한국인터넷진흥원에 신고합니다.{"\n"}
                {"\n"}

                제7조(권익침해에 대한 구제방법){"\n"}
                {"\n"}
                정보주체는 개인정보침해로 인한 구제를 받기 위하여 개인정보분쟁조정위원회, 개인정보침해신고센터 등에 분쟁해결이나 상담을 신청할 수 있습니다.{"\n"}
                개인정보분쟁조정위원회: (국번없이) 1833-6972 (www.kopico.go.kr){"\n"}
                개인정보침해신고센터: (국번없이) 118 (privacy.kisa.or.kr)
              </Text>
            </ScrollView>
              <TouchableOpacity 
                style={styles.agree} 
                onPress={() => {
                  setIsChecked2(true); // 동의할 때 체크박스 상태를 체크로 변경
                  toggleModal2(); // 모달 닫기
                }}
              >
                <Text style={{ fontSize: 18, color: "black" }}>동의합니다</Text>
              </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'column',
    justifyContent: 'flex-start',
  },
  Checkbox: {
    marginTop: 35,
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'flex-end', // 화면의 아래쪽에서 나오도록 설정
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)', // 배경 어둡게 처리
  },
  modalView: {
    width: '100%', // 너비를 100%로 설정
    height: '100%', // 모달 높이를 설정
    backgroundColor: 'white',
    padding: 35,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  scrollContainer: {
    paddingBottom: 20, // 스크롤뷰의 여유 공간
  },
  modalTitle: {
    marginTop: 30,
    marginBottom: 20,
    fontSize: 25,
    color: "black",
  },
  modalText: {
    marginBottom: 15,
    fontSize: 16,
  },
  closeIcon: {
    position: 'absolute',
    top: 10, // 화면의 상단에서 10px 떨어지도록 설정
    left: 15,
    zIndex: 1, // 다른 요소들 위에 배치되도록 설정
  },
  agree: {
    justifyContent: 'center',
    alignItems : 'center',
    width : '100%',
    height : '6%',
    elevation : 5,
    borderRadius : 20,
    backgroundColor : "#6bd65a"
  },
  disagree: {
    justifyContent: 'center',
    alignItems : 'center',
    width : '90%',
    height : '8%',
    borderRadius : 20,
    marginTop : 400,
  },

  agree2: {
    justifyContent: 'center',
    alignItems : 'center',
    width : '90%',
    height : '8%',
    elevation : 5,
    borderRadius : 20,
    backgroundColor : "#6bd65a"
  }
});

export default TosScreen;
