import React, { useState } from 'react';
import { View, StyleSheet, Dimensions, Image, Text, TouchableOpacity, Alert, TextInput } from 'react-native';
import ImageCropPicker from 'react-native-image-crop-picker';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { UserData } from '../../types/type'
import config from '../../config';
import { endOfMonth } from 'date-fns';
import DateTimePicker from '@react-native-community/datetimepicker';
import { ScrollView } from 'react-native-gesture-handler';
import IconC from 'react-native-vector-icons/Ionicons';
import { format } from 'date-fns';

const width = Dimensions.get("window").width;

const RegisterProduct = ({ route, navigation }: any) => {
  const { userdata } = route.params;
  const [userData, setUserData] = useState<UserData>(userdata);
  const [itemName, setItemName] = useState("");
  const [itemExplain, setItemExplain] = useState("");
  const [itemPoint, setItemPoint] = useState("");
  const [itemCount, setItemCount] = useState("");
  const [selectedImagePath, setSelectedImagePath]: any = useState();
  const [selectedImageFormData, setSelectedImageFormData] = useState<FormData | null>(null);
  //const [ImageNum, setImageNum] = useState();
  const [showStartDatePicker, setShowStartDatePicker]: any = useState(false);
  const [showStartEndPicker, setShowEndDatePicker]: any = useState(false);
  const [selectedStartDate, setSelectedStartDate]: any = useState(new Date());
  const [selectedEndDate, setSelectedEndDate]: any = useState(new Date());
  const [deadlineDate, setDeadlineDate] = useState<string>("");
  //const [selectedFormImages, setSelectedFormImages] = useState<FormData>(); // 선택된 이미지를 폼데이터에 저장

  useFocusEffect(
    React.useCallback(() => {
      setUserData(userdata);
    }, [])
  );

  const onStartDateChange = (event: any, date?: Date) => {
    const currentDate = date || new Date();
    setShowStartDatePicker(false);
    setSelectedStartDate(currentDate);
  };

  const onEndDateChange = (event: any, date?: Date) => {
    const currentDate = date || new Date();
    setShowEndDatePicker(false);
    setSelectedEndDate(currentDate);
    Change_Date(selectedStartDate, currentDate);
  };

  const Change_Date = (startDate: Date, endDate: Date) => {
    const start_day = format(startDate, "yyyy.M.d");
    const end_day = format(endDate, "yyyy.M.d");
    const using_time = `${start_day} ~ ${end_day}`;
    //console.log(using_time);
    setDeadlineDate(using_time);
  }

  const handleNameTextChange = (inputText: string) => {
    setItemName(inputText);
  };
  const handleExplainTextChange = (inputText: string) => {
    setItemExplain(inputText);
  };
  const handlePointTextChange = (inputText: string) => {
    setItemPoint(inputText);
  };
  const handleCountTextChange = (inputText: string) => {
    setItemCount(inputText);
  };

  // 사진 선택 후 서버에 저장
  const getPhotos = async () => {
    try {
      const res = await ImageCropPicker.openPicker({
        multiple: false, // 단일 이미지 선택을 위해 multiple을 false로 설정
        mediaType: 'photo',
        includeBase64: true,
        includeExif: true,
      });
      const formData = new FormData();
      formData.append('images', {
        uri: res.path,
        type: 'image/jpeg',
        name: `${Date.now()}_${res.filename || userData.user_pk}.png`,
      });

      const newPath = res.path;
      setSelectedImagePath(newPath);
      setSelectedImageFormData(formData);
      //const imageData = await RegistorItemImage(formData);
      //setImageNum(imageData);
    } catch (error) {
      console.error(error);
    }
  };

  const RegisterItemAlert = () => {
    Alert.alert(
        "상품을 등록 하시겠습니까??",
        `--상품등록정보--
등록 상품 이름 : ${itemName}
상품 사용기간 : ${deadlineDate}
상품가격 : ${itemPoint}
수량 : ${itemCount}` ,
        [
            {
                text: "취소",
                onPress: () => console.log("취소 클릭"),
                style: "cancel"
            },
            { text: "확인", onPress: async () => { 
              const ImageName = await RegistorItemImage();
              await RegistorItem(ImageName);
              successAlert();
            }}
        ]
    );
};

const successAlert = () => {
  Alert.alert(
      "상품등록완료",
      `상품 등록을 성공적으로 완료했습니다!` ,
      [
          { text: "확인", onPress: () => {navigation.navigate("CheckProduct", userData)}}
      ]
  );
};

  const RegistorItemImage = async () => {
    try {
      const response = await fetch(`${config.serverUrl}/RegistorItemImage`, {
        method: 'POST',
        body: selectedImageFormData,
      });
      const imageData = await response.json();
      //console.log(imageData.fileName);
      return imageData.fileName;
    } catch (error) {
      console.error(error);
    }
  };

  const RegistorItem = async (ImageNum : string) => {
    try {
        const response = await fetch(`${config.serverUrl}/RegistorItem`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                campus_id : userData.campus_pk,
                name : itemName,
                price : itemPoint,
                using_time : deadlineDate,
                image_num : ImageNum,
                explian : itemExplain,
                count : itemCount,
            }),
        })
    } catch (error) {
        console.error(error);
    } finally {
  }
}

  return (
    <View style={styles.container}>
      <View style={styles.ItemImagecontainer}>
        <View style={styles.ImageBox}>
          <View style={styles.Image}>
            <Image style={{ height: "100%", width: "100%", borderRadius: 20 }}
              source={{ uri: selectedImagePath ? selectedImagePath : `${config.photoUrl}/1718215425110-1718215424055_21.png` }} />
          </View>
        </View>
        <View style={styles.imageChangeButtonBox}>
          <TouchableOpacity
            style={styles.imageChangeButton}
            onPress={() => getPhotos()}>
            <Text style={{ fontSize: 18, fontWeight: 'bold', color: 'black' }}>변경</Text>
          </TouchableOpacity>
        </View>
      </View>
      <ScrollView style={styles.ItemRegisterInfoBox}>
        <View style={styles.NameTextbox}>
          <Text style={styles.NameText}>상품이름 :</Text>
          <TextInput
            style={styles.TextBoxText}
            onChangeText={handleNameTextChange}
            value={itemName}
            placeholder="상품 이름을 적어주세요"
            placeholderTextColor={'gray'}
          />
        </View>
        <View style={styles.ExplainTextbox}>
          <Text style={styles.ExplainText}>상품설명 :</Text>
          <TextInput
            style={styles.ExplainTextBoxText}
            onChangeText={handleExplainTextChange}
            value={itemExplain}
            multiline={true}
            placeholder="상품 설명을 작성해주세요(3줄이내)"
            placeholderTextColor={'gray'}
            textAlignVertical="top"
          />
        </View>
        <View style={styles.ItemDeadLine}>
          <View style={styles.DayBox}>
            <Text style={styles.ExplainText}>시작날짜 : {format(selectedStartDate, "yyyy.M.d")}</Text>
            <TouchableOpacity onPress={async () => {
              setShowStartDatePicker(true);
            }}>
              <IconC style={styles.calendarIcon} name="calendar" size={30} />
            </TouchableOpacity>
          </View>
          <View style={styles.DayBox}>
            <Text style={styles.ExplainText}>종료날짜 : {format(selectedEndDate, "yyyy.M.d")}</Text>
            <TouchableOpacity onPress={async () => {
              setShowEndDatePicker(true);
            }}>
              <IconC style={styles.calendarIcon} name="calendar" size={30} />
            </TouchableOpacity>
          </View>
          {showStartDatePicker && (
            <DateTimePicker
              value={selectedStartDate}
              mode="date"
              display="compact"
              minimumDate={new Date()}
              maximumDate={endOfMonth(new Date())}
              onChange={onStartDateChange}
            />
          )}
          {showStartEndPicker && (
            <DateTimePicker
              value={selectedEndDate}
              mode="date"
              display="compact"
              minimumDate={new Date()}
              maximumDate={endOfMonth(new Date())}
              onChange={onEndDateChange}
            />
          )}
        </View>
        <View style={styles.PointTextbox}>
          <Text style={styles.NameText}>포인트 입력 :</Text>
          <TextInput
            style={styles.TextBoxText}
            onChangeText={handlePointTextChange}
            value={itemPoint}
            placeholder="가격을 입력해주세요(숫자만)"
            placeholderTextColor={'gray'}
          />
        </View>
        <View style={styles.PointTextbox}>
          <Text style={styles.NameText}>수량 :</Text>
          <TextInput
            style={styles.TextBoxText}
            onChangeText={handleCountTextChange}
            value={itemCount}
            placeholder="상품의 수량을 입력해주세요(숫자만)"
            placeholderTextColor={'gray'}
          />
        </View>
        <View style={styles.CompleteButtonBox}>
          <TouchableOpacity
            onPress={async () => {
              RegisterItemAlert();
            }}
            style={styles.CompleteButton}>
            <Text style={styles.CompleteText}>작성완료</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFE5B4"
  },
  ItemImagecontainer: {
    width: "100%",
    height: "40%",
    //backgroundColor : 'red'
  },
  ImageBox: {
    width: "100%",
    height: "87%",
    //backgroundColor : 'yellow',
    justifyContent: 'center',
    alignItems: 'center'
  },
  Image: {
    width: "60%",
    height: "90%",
    backgroundColor: 'white',
    borderRadius: 20,
    marginTop: 20,
    elevation: 5
  },
  imageChangeButtonBox: {
    width: "100%",
    height: "13%",
    //backgroundColor : 'green',
    justifyContent: 'center',
    alignItems: 'center'
  },
  imageChangeButton: {
    width: "25%",
    height: "70%",
    backgroundColor: '#FFFADD',
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center'
  },
  ItemRegisterInfoBox: {
    width: "100%",
    height: "60%",
    backgroundColor: 'white',
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
  },
  NameTextbox: {
    width: width,
    minHeight: 70,
    flexDirection: 'row',
    //backgroundColor : 'red',
    alignItems: 'center',
    marginTop: 20,
    borderBottomWidth: 2,
    borderColor: 'lightgrey'
  },

  ExplainTextbox: {
    width: width,
    minHeight: 70,
    flexDirection: 'row',
    borderBottomWidth: 2,
    borderColor: 'lightgrey'
  },

  NameText: {
    fontSize: 20,
    fontWeight: 'bold',
    paddingLeft: 20,
    color: 'black'
  },

  ExplainText: {
    fontSize: 20,
    fontWeight: 'bold',
    paddingLeft: 20,
    paddingTop: 20,
    color: 'black'
  },

  TextBoxText: {
    fontSize: 20,
    fontWeight: 'bold',
    marginLeft: 5,
    width: "70%"
  },
  ExplainTextBoxText: {
    fontSize: 20,
    fontWeight: 'bold',
    marginLeft: 5,
    width: "70%",
    paddingTop: 20,
  },
  ItemDeadLine: {
    width: width,
    minHeight: 120,
    borderBottomWidth: 2,
    borderColor: 'lightgrey'
  },

  DayBox: {
    flexDirection: 'row',
    alignItems: 'center',
    width: "100%",
    //backgroundColor : 'red'
  },

  calendarIcon: {
    paddingLeft: 20,
    paddingTop: 20,
    color: "#ED9E2B"
  },

  PointTextbox: {
    width: width,
    minHeight: 70,
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth: 2,
    borderColor: 'lightgrey'
  },
  CompleteButtonBox: {
    width: "100%",
    height: 100,
    //backgroundColor : 'yellow',
    justifyContent: 'center',
    alignItems: 'center',
  },

  CompleteButton: {
    width: "50%",
    height: "50%",
    backgroundColor: "#ED9E2B",
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },

  CompleteText: {
    fontSize: 23,
    fontWeight: "bold",
    color: 'white'
  }
});

export default RegisterProduct;
