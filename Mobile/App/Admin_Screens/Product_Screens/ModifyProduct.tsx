import React, { useState } from 'react';
import { View, StyleSheet, Dimensions, Image, Text, TouchableOpacity, Alert, TextInput } from 'react-native';
import ImageCropPicker from 'react-native-image-crop-picker';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { UserData, UserHaveCouponData } from '../../types/type'
import config from '../../config';
import { endOfMonth } from 'date-fns';
import DateTimePicker from '@react-native-community/datetimepicker';
import { ScrollView } from 'react-native-gesture-handler';
import IconC from 'react-native-vector-icons/Ionicons';
import IconD from 'react-native-vector-icons/AntDesign';
import { format } from 'date-fns';

const width = Dimensions.get("window").width;

//처음에 가져온 Date문자열을 Date()객체 타입으로 변환하여 Default값으로 넣어준다.
const parseDateString = (dateString: string) => {
  const [start, end] = dateString.split(' ~ ').map(date => {
    const [year, month, day] = date.split('.').map(Number);
    return new Date(year, month - 1, day);
  });
  return { start, end };
};

const ModifyProduct = ({ route, navigation }: any) => {
  const { userdata, ItemInfo } = route.params;
  //console.log(ItemInfo);
  const [userData, setUserData] = useState<UserData>(userdata); //유저 데이터
  const [itemName, setItemName] = useState(ItemInfo.name);  //상품 이름
  const [itemExplain, setItemExplain] = useState(ItemInfo.explain); //상품 설명
  const [itemPoint, setItemPoint] = useState(ItemInfo.price.toString()); //상품 포인트
  //const [itemCount, setItemCount] = useState(ItemInfo.count.toString()); //상품 수량
  const [changeitemCount, setChangeitemCount] = useState<number>(0);
  const [selectedImagePath, setSelectedImagePath]: any = useState();
  const [selectedImageFormData, setSelectedImageFormData] = useState<FormData | null>(null);
  //const [ImageNum, setImageNum] = useState(ItemInfo.image_num);
  const [showStartDatePicker, setShowStartDatePicker]: any = useState(false);
  const [showStartEndPicker, setShowEndDatePicker]: any = useState(false);
  const { start, end } = parseDateString(ItemInfo.using_time);
  const [selectedStartDate, setSelectedStartDate]: any = useState(start);
  const [selectedEndDate, setSelectedEndDate]: any = useState(end);
  const [deadlineDate, setDeadlineDate] = useState<string>(ItemInfo.using_time);
  const [ItemInformation, setItemInformation] = useState<UserHaveCouponData>(ItemInfo);
  const [ItemRestCount, setItemRestCount] : any = useState();
  const [ItemSellCount, setItemSellCount] : any = useState();

  useFocusEffect(
    React.useCallback(() => {
        const fetchData = async () => {
            try {
              setUserData(userdata);
              setItemInformation(ItemInfo);
              await getRestItemCount();
              await getSellItemCount();
            } catch (error) {
                console.error('Error fetching data:', error);
            }
        };
        fetchData();
    }, [])
);

  //상품의 수량 증가와 감소를 계산해서 나중에 수량을 증가시킬건지, 감소시킬건지 확인할때 사용
  const calculator_ItemCount = (before_count: number, after_count: number) => {
    const validBeforeCount = isNaN(before_count) ? 0 : before_count;
    const validAfterCount = isNaN(after_count) ? 0 : after_count;
    const validRestBeforeCount = validBeforeCount - ItemSellCount;
    const rest_count = validAfterCount - validRestBeforeCount;
    return rest_count
  }

  //상품 사용 시작 기간설정
  const onStartDateChange = (event: any, date?: Date) => {
    const currentDate = date || new Date();
    setShowStartDatePicker(false);
    setSelectedStartDate(currentDate);
  };

  //상품 사용 종료 기간설정
  const onEndDateChange = (event: any, date?: Date) => {
    const currentDate = date || new Date();
    setShowEndDatePicker(false);
    setSelectedEndDate(currentDate); 0
    Change_Date(selectedStartDate, currentDate);
  };

  //시작과 종료 Date()타입의 객체를 문자열로 저장
  const Change_Date = (startDate: Date, endDate: Date) => {
    const start_day = format(startDate, "yyyy.M.d");
    const end_day = format(endDate, "yyyy.M.d");
    const using_time = `${start_day} ~ ${end_day}`;
    //console.log(using_time);
    setDeadlineDate(using_time);
  }

  //상품 이름 변경
  const handleNameTextChange = (inputText: string) => {
    setItemName(inputText);
  };
  //상품 설명 변경
  const handleExplainTextChange = (inputText: string) => {
    setItemExplain(inputText);
  };
  //상품 가격 변경
  const handlePointTextChange = (inputText: string) => {
    setItemPoint(inputText);
  };

  //상품 수량 증가
  const handleCountUpTextChange = () => {
    const changeText = parseInt(ItemRestCount) + 1
    const validValue = isNaN(changeText) ? 0 : changeText;
    const rest_count = calculator_ItemCount(ItemInformation.count, validValue);
    setChangeitemCount(rest_count);
    setItemRestCount(changeText);
  }

  //상품 수량 감소
  const handleCountDownTextChange = () => {
    if (parseInt(ItemRestCount) >= 1) {
      const changeText = parseInt(ItemRestCount) - 1
      const validValue = isNaN(changeText) ? 0 : changeText;
      const rest_count = calculator_ItemCount(ItemInformation.count, validValue);
      setChangeitemCount(rest_count);
      setItemRestCount(changeText);
    }
  }

  //사진 선택
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
    } catch (error) {
      console.error(error);
    }
  };

  
  const ADDItemAlert = () => {
    Alert.alert(
        "상품을 이대로 편집 하시겠습니까??",
        `--상품편집정보--
등록 상품 이름 : ${itemName}
상품 사용기간 : ${deadlineDate}
상품가격 : ${itemPoint}
추가수량 : ${changeitemCount}` ,
        [
            {
                text: "취소",
                onPress: () => console.log("취소 클릭"),
                style: "cancel"
            },
            { text: "확인", onPress: async () => {
              const imageData = await RegistorItemImage();
              await ChangeItemInfoANDCountUp(imageData);
              successEditItemAlert();
            }}
        ]
    );
};


const DeleteItemAlert = () => {
  Alert.alert(
      "상품을 이대로 편집 하시겠습니까?",
      `--상품편집정보--
등록 상품 이름 : ${itemName}
상품 사용기간 : ${deadlineDate}
상품가격 : ${itemPoint}
삭제수량 : ${changeitemCount}` ,
      [
          {
              text: "취소",
              onPress: () => console.log("취소 클릭"),
              style: "cancel"
          },
          { text: "확인", onPress: async () => {
            const imageData = await RegistorItemImage();
            await ChangeItemInfoANDCountDown(imageData);
            successEditItemAlert();
          }}
      ]
  );
};

const EditItemAlert = () => {
  Alert.alert(
      "상품을 이대로 편집 하시겠습니까?",
      `--상품편집정보--
등록 상품 이름 : ${itemName}
상품 사용기간 : ${deadlineDate}
상품가격 : ${itemPoint}` ,
      [
          {
              text: "취소",
              onPress: () => console.log("취소 클릭"),
              style: "cancel"
          },
          { text: "확인", onPress: async () => {
            const imageData = await RegistorItemImage();
            await ChangeItemInfo(imageData);
            successEditItemAlert();
          }}
      ]
  );
};

const successEditItemAlert = () => {
Alert.alert(
    "상품이 편집되었습니다.",
    `상품이 성공적으로 편집되었습니다!!` ,
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
      return imageData.fileName;
    } catch (error) {
      console.error(error);
    }
  };

  //수량은 변화하지 않고 DB의 아이템 정보만 변경한다.
  const ChangeItemInfo = async (ImageNum : string) => {
    const imageUrl = ImageNum || ItemInformation.image_num // ImageNum이 null이면 ItemInformation.image_num을 사용
    try {
      const response = await fetch(`${config.serverUrl}/ChangeItemInfo`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          origin_name: ItemInformation.name,
          name: itemName,
          price: itemPoint,
          using_time: deadlineDate,
          image_num: imageUrl,
          explian: itemExplain,
        }),
      })
    } catch (error) {
      console.error(error);
    } finally {
    }
  }

  //수량이 증가하고 DB의 아이템 정보를 변경한다.
  const ChangeItemInfoANDCountUp = async (ImageNum : string) => {
    const imageUrl = ImageNum || ItemInformation.image_num // ImageNum이 null이면 ItemInformation.image_num을 사용
    try {
      const response = await fetch(`${config.serverUrl}/ChangeItemInfoANDCountUp`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          origin_name: ItemInformation.name,
          campus_id: userData.campus_pk,
          name: itemName,
          price: itemPoint,
          using_time: deadlineDate,
          image_num: imageUrl,
          explian: itemExplain,
          count: changeitemCount,
        }),
      })
    } catch (error) {
      console.error(error);
    } finally {
    }
  }

  //수량이 감소하고 DB의 아이템 정보를 변경한다.
  const ChangeItemInfoANDCountDown = async (ImageNum : string) => {
    const imageUrl = ImageNum || ItemInformation.image_num // ImageNum이 null이면 ItemInformation.image_num을 사용
    try {
      const response = await fetch(`${config.serverUrl}/ChangeItemInfoANDCountDown`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          origin_name: ItemInformation.name,
          campus_id: userData.campus_pk,
          name: itemName,
          price: itemPoint,
          using_time: deadlineDate,
          image_num: imageUrl,
          explian: itemExplain,
          count: Math.abs(changeitemCount),
        }),
      })
    } catch (error) {
      console.error(error);
    } finally {
    }
  }

  //현재 남은 제고의 아이템 수를 얻기위함
  const getRestItemCount = async () => {
    try {
      const response = await fetch(`${config.serverUrl}/getRestItemCount`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          campus_id: userdata.campus_pk,
          name: ItemInfo.name,
        }),
      })
      const rest_item_pks = await response.json();
      setItemRestCount(rest_item_pks.length);
    } catch (error) {
      console.error(error);
    } finally {
    }
  }

    //현재 팔린 제고의 수량을 파악하기 위함
    const getSellItemCount = async () => {
      try {
        const response = await fetch(`${config.serverUrl}/getSellItemCount`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            campus_id: userdata.campus_pk,
            name: ItemInfo.name,
          }),
        })
        const sell_item_pks = await response.json();
        setItemSellCount(sell_item_pks.length)
      } catch (error) {
        console.error(error);
      } finally {
      }
    }

  // 상품의 증가, 감소, 0에 대한 구분을 해준다.
  const choice_item_action = () => {
    if (typeof changeitemCount === 'undefined' || changeitemCount === null) {
      //console.log("changeitemCount is undefined or null");
    } else if (changeitemCount > 0) {
      //console.log("추가")
      ADDItemAlert();
    } else if (changeitemCount < 0) {
      //console.log("삭제")
      DeleteItemAlert();
    } else if (changeitemCount === 0) {
      //console.log("변경")
      EditItemAlert();
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.ItemImagecontainer}>
        <View style={styles.ImageBox}>
          <View style={styles.Image}>
            <Image style={{ height: "100%", width: "100%", borderRadius: 20 }}
              source={{ uri: selectedImagePath ? selectedImagePath : `${config.photoUrl}/${ItemInfo.image_num}.png` }} />
          </View>
        </View>
        <View style={styles.imageChangeButtonBox}>
          <TouchableOpacity
            style={styles.imageChangeButton}
            onPress={async () => await getPhotos()}>
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
        <View style={styles.ChangePointTextbox}>
          <Text style={styles.NameText}>현재 수량 :</Text>
          <Text style={styles.beforeCountText}>{ItemRestCount}</Text>
          <View style={styles.ChangeIconBox}>
            <TouchableOpacity
              onPress={() => {
                handleCountUpTextChange();
              }}>
              <IconD style={styles.upIcon} name="upsquare" size={30} />
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => {
                handleCountDownTextChange();
              }}>
              <IconD style={styles.downIcon} name="downsquare" size={30} />
            </TouchableOpacity>
          </View>
          <Text style={{fontSize: 20,fontWeight: 'bold',paddingLeft: 20,color: 'grey'}}>팔린 수량 :</Text>
          <Text style={{ fontSize: 20,fontWeight: 'bold',marginLeft: 5,width: "10%",color: 'grey'}}>{ItemSellCount}</Text>
        </View>
        <View>
        </View>
        <View style={styles.CompleteButtonBox}>
          <TouchableOpacity
            onPress={async () => {
              choice_item_action();
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
  beforeCountText: {
    fontSize: 20,
    fontWeight: 'bold',
    marginLeft: 5,
    width: "10%",
    color: 'black'
    //backgroundColor : 'red'
  },
  ChangeIconBox: {
    width: "10%",
    //backgroundColor : 'blue',
    justifyContent: 'center'
  },
  changeCountTextBoxText: {
    fontSize: 20,
    fontWeight: 'bold',
    marginLeft: 5,
    width: "6%"
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

  upIcon: {
    color: "#ED9E2B"
  },

  downIcon: {
    color: "#ED9E2B"
  },
  PointTextbox: {
    width: width,
    minHeight: 70,
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth: 2,
    borderColor: 'lightgrey',
    //backgroundColor : 'yellow'
  },
  ChangePointTextbox: {
    width: width,
    minHeight: 70,
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth: 2,
    borderColor: 'lightgrey',
    //backgroundColor : 'yellow'
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

export default ModifyProduct;
