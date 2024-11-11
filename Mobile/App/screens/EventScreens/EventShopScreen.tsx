import React, { useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Image, Alert } from 'react-native';
import ModalBox from 'react-native-modalbox';
import { useFocusEffect } from '@react-navigation/native';
import IconB from 'react-native-vector-icons/Entypo';
import config from '../../config';
import { UserData, ShopItemData } from '../../types/type'

const renderEmptyItem = () => {
  return (
    <View style={{ height: 85 }}>
    </View>
  )
}
const EventShopScreen = ({ navigation, route }: any) => {
  const { userdata, userPoint } = route.params;
  const [userPointBalance, setUserPointBalance] = useState(userPoint.point); // Initialize state for user point balance
  const [isModalOpen, setIsModalOpen] = useState(false); // 모달의 열기/닫기 상태를 useState로 관리
  const [items, setItemData]: any = useState([]);
  const [SelectItem, SetSelectItem] = useState<ShopItemData | undefined>(undefined);
  const [refreshing, setRefreshing] = useState(false);

  //console.log(userdata);

  useFocusEffect(
    React.useCallback(() => {
        const fetchData = async () => {
            try {
              await getItems();
            } catch (error) {
                console.error('Error fetching data:', error);
            }
        };
        fetchData();
    }, [userdata])
);


  const groupData = (data: any) => {
    const groupedData = [];

    for (let i = 0; i < data.length; i += 2) {
      const firstItem = data[i];
      const secondItem = data[i + 1] || {}; // 두 번째 아이템이 없을 경우 빈 객체 사용

      groupedData.push({
        firstCode_Num: firstItem.code_num || 0,
        firstCount: firstItem.count || 0,
        firstExplain: firstItem.explain || "",
        firstImage_Num: firstItem.image_num || "",
        firstName: firstItem.name || "",
        firstObject_id: firstItem.objec_id || 0,
        firstprice: firstItem.price || 0,
        firstSellCheck: firstItem.sell_check !== undefined ? firstItem.sell_check : false,
        firstUsing_Time: firstItem.using_time || "",

        secondCode_Num: secondItem.code_num || "",
        secondCount: secondItem.count || "",
        secondExplain: secondItem.explain || "",
        secondImage_Num: secondItem.image_num || "",
        secondName: secondItem.name || "",
        secondObject_id: secondItem.objec_id || "",
        secondprice: secondItem.price || "",
        secondSellCheck: secondItem.sell_check !== undefined ? secondItem.sell_check : false,
        secondUsing_Time: secondItem.using_time || "",
      });
    }

    //console.log(groupedData);
    setItemData(groupedData);
  };


  //이벤트 상점 물품 가져오기
  const getItems = async () => {
    try {
      const response = await fetch(`${config.serverUrl}/get_items`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          campus_id: userdata.campus_pk
        })
      })
      const items = await response.json();
      groupData(items);
      //console.log(items);
    } catch (error) {
      console.error(error);
    }
  }

  //이벤트 상점 물품 가져오기
  const getOneItem = async (selectItemName: string) => {
    try {
      const response = await fetch(`${config.serverUrl}/get_one_Item`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          item_name: selectItemName
        })
      })
      const item = await response.json();
      SetSelectItem(item);
    } catch (error) {
      console.error(error);
    }
  }

  //상점 상태 업데이트하기
  const update_object_state = async (object_pk : any) => {
    try {
      const response = await fetch(`${config.serverUrl}/update_object`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          object_pk: object_pk
        })
      })
      const result = await response.json();
      await getItems();
      //console.log("상점 업데이트 성공")
    } catch (error) {
      console.error('상점 업데이트 실패', error);
    }
  }

  //유저의 쿠폰함에 아이템을 넣음
  const insert_user_have_object = async () => {
    try {
      const response = await fetch(`${config.serverUrl}/insert_user_have_object`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          user_id: userdata.user_pk,
          object_id : SelectItem?.object_id
        })
      });
      const value = await response.json();

    } catch (error) {
      console.error('상점 사기 실패!', error);
    }
  }

  const user_buy_action = async () => {
    try {
      const response = await fetch(`${config.serverUrl}/user_buy_action`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          user_pk : userdata.user_pk,
          price : SelectItem?.price
        })
      })
      //console.log("포인트 차감 성공")
      setUserPointBalance((prevBalance: number) => prevBalance - (SelectItem ? SelectItem.price : 0));
    } catch (error) {
      console.error('포인트 차감 실패', error);
    }
  }

  const your_point_row = () => {
    Alert.alert(
      "잔액부족!!",
      "상품을 사기에 잔액이 부족합니다.",
      [
        { text: "확인" }
      ]
    );
  };

  const ok_5_Dollar = () => {
    Alert.alert(
      "정말로 구매하시겠습니까?",
      "정말로 구매를 확정 하십니까?",
      [
        {
          text: "확인",
          onPress: async () => {
            await update_object_state(SelectItem?.object_id);
            await insert_user_have_object();
            await user_buy_action();
            await AddBuyProductPointHistory(SelectItem?.name, SelectItem?.price);
            // 추가 알림창 띄우기
            Alert.alert(
              "알림",
              "상품 구매가 완료되었습니다.",
              [{ text: "확인" }]
            );
            onRefresh();
            closeModal(); // Close the modal after refreshing
          }
        },
        { text: "취소" }
      ]
    );
  };

  const AddBuyProductPointHistory = async (item : any, point : any) => {
    try {
      const response = await fetch(`${config.serverUrl}/AddBuyProductPointHistory`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          user_id : userdata.user_pk,
          product : item,
          point : point
        })
      });
    } catch (error) {
    }
  }

  const closeModal = () => {
    setIsModalOpen(false);
  };

  const selectItem = async (selectItem: any) => {
    await getOneItem(selectItem);
    setIsModalOpen(true);
  };

  const onRefresh = async () => {
    setRefreshing(true); // 새로고침 시작
    await getItems(); // 데이터 다시 불러오기 (또는 원하는 다른 작업 수행)
    setRefreshing(false); // 새로고침 완료
  };


  const renderItem = ({ item }: any) => (
    <View style={styles.itemrowcontainer}>
      <TouchableOpacity style={styles.itemonebox} onPress={async () => {
        selectItem(item.firstName);
      }}>
        <View style={styles.square}>
          <View style={styles.picturebox}>
            <Image style={{ flex: 1, width: '100%', borderTopLeftRadius: 20, borderTopRightRadius: 20, }} source={{ uri: `${config.photoUrl}/${item.firstImage_Num}.png` }} />
          </View>
          <View style={styles.iteminfo}>
            <Text style={{ fontSize: 20, color: 'black', }} numberOfLines={1} ellipsizeMode='tail'>{item.firstName}</Text>
            <Text style={{ fontSize: 16, color: 'grey', }} numberOfLines={1} ellipsizeMode='tail'>
              {item.firstExplain}
            </Text>
            <View style={{ flexDirection: 'row', backgroundColor: 'white', borderBottomLeftRadius: 20, borderBottomRightRadius: 20 }}>
              <View style={{ width: '70%' }}>
                <Text style={{ fontSize: 27, color: '#ED9E2B', fontWeight: 'bold', }}>
                  {item.firstprice}p
                </Text>
              </View>
              <View style={{ width: '30%' }}>
                <Text style={{ color: '#EB8A90', }}> <IconB name="circle-with-plus" size={40} style={{ elevation: 5 }} /></Text>
              </View>
            </View>
          </View>
        </View>
      </TouchableOpacity>

      {item.secondName && (
        <TouchableOpacity style={styles.itemonebox} onPress={async () => {
          selectItem(item.secondName);
        }}>
          <View style={styles.square}>
            <View style={styles.picturebox}>
              <Image style={{ flex: 1, width: '100%', borderTopLeftRadius: 20, borderTopRightRadius: 20, }} source={{ uri: `${config.photoUrl}/${item.secondImage_Num}.png` }} />
            </View>
            <View style={styles.iteminfo}>
              <Text style={{ fontSize: 20, color: 'black', }} numberOfLines={1} ellipsizeMode='tail'>{item.secondName}</Text>
              <Text style={{ fontSize: 16, color: 'grey', }} numberOfLines={1} ellipsizeMode='tail'>
                {item.secondExplain}
              </Text>
              <View style={{ flexDirection: 'row', backgroundColor: 'white', borderBottomLeftRadius: 20, borderBottomRightRadius: 20 }}>
                <View style={{ width: '70%' }}>
                  <Text style={{ fontSize: 27, color: '#ED9E2B', fontWeight: 'bold', }}>
                    {item.secondprice}p
                  </Text>
                </View>
                <View style={{ width: '30%' }}>
                  <Text style={{ color: '#EB8A90' }}> <IconB name="circle-with-plus" size={40} style={{ elevation: 5 }} /></Text>
                </View>
              </View>
            </View>
          </View>
        </TouchableOpacity>
      )}
    </View>
  );

  return (
    <View style={styles.container}>
      <View style = {{height : 50, alignItems : 'center', flexDirection : 'row'}}>
        <Text style = {{fontSize : 23, color : "black", marginLeft : 30}}>
          보유 포인트 : 
        </Text>
        <Text style = {{fontSize : 25, fontWeight : 'bold', color : "#ED9E2B", marginLeft : 3, marginBottom : 2}}>
           {userPointBalance}P
        </Text>
      </View>
      <FlatList
        data={items}
        renderItem={renderItem}
        ListFooterComponent={renderEmptyItem}
        refreshing={refreshing}
        onRefresh={onRefresh}
      />
      <ModalBox
        isOpen={isModalOpen} // 모달의 열기/닫기 상태를 prop으로 전달
        style={styles.modal}
        position="bottom"
        swipeToClose={false}
        onClosed={closeModal} // 모달이 닫힐 때 호출되는 콜백 함수
      >
        <View style={styles.modalContent}>
          <View style={styles.itemDetailPictureBox}>
            <Image style={{ flex: 1, width: '100%', resizeMode: 'contain' }} source={{ uri: `${config.photoUrl}/${SelectItem?.image_num}.png` }} />
          </View>
          <View style={styles.itemInfo}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: 15 }}>
              <View style={{
                width : '60%'
              }}>
                <Text style={{
                  fontSize: 30,
                  color: 'black',
                  fontWeight: 'bold',
                }}>{SelectItem?.name}</Text>
              </View>
              <View style={{
                justifyContent: 'center',
                width : '40%'
              }}>
                <Text style={{
                  fontSize: 16,
                  color: 'gray',
                }}>{SelectItem?.using_time}</Text>
              </View>
            </View>
            <Text style={{
              fontSize: 20,
              color: 'black',
              marginLeft: 15,
            }}>{SelectItem?.explain}</Text>
            <Text style={{
              fontSize: 35,
              color: '#ED9E2B',
              marginLeft: 15,
              fontWeight: 'bold'
            }}>
              {SelectItem?.price}P
            </Text>
          </View>
          <View style={{ height: '15%', padding: 15 }}>
            <Text style={{ color: 'black', fontSize: 20, }}>현재 보유 포인트 : {userPointBalance}P</Text>
            <Text style={{ color: 'black', fontSize: 20, }}>상품 포인트 : {SelectItem?.price}P</Text>
            <View style={{ flexDirection: 'row', paddingVertical: 5 }}>
              <Text style={{ color: 'black', fontSize: 20,}}>잔액 : {userPointBalance} - {SelectItem?.price} :</Text>
              <Text style={{ fontSize: 20, color: 'black', marginLeft: 6, fontWeight: 'bold' }}>{userPointBalance - (SelectItem ? SelectItem.price : 0)}P</Text>
            </View>
          </View>
          <TouchableOpacity
            style={styles.buyButtonBox}
            onPress={() => {
              if (userPointBalance - (SelectItem ? SelectItem.price : 0) >= 0) {
                ok_5_Dollar();
              } else {
                your_point_row();
              }
            }}>
            <View style={{
              width: '60%',
              height: 50,
              backgroundColor: '#EB8A90',
              borderRadius: 5,
              justifyContent: 'center',
              alignItems: 'center',
            }}>
              <Text style={{ fontSize: 24, color: 'white', fontWeight: 'bold' }}>
                구매하기
              </Text>
            </View>
          </TouchableOpacity>
        </View>
      </ModalBox>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9F9F9',
  },
  pointcontainer: {
    height: 50,
    //backgroundColor : 'blue',
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,

  },
  itemrowcontainer: {
    width: '90%',
    height: 300,
    //backgroundColor : 'green',
    //marginTop: ,
    //marginBottom : 2,
    flexDirection: 'row',
    alignSelf: 'center',
  },
  itemonebox: {
    height: '100%',
    width: '50%',
    //backgroundColor : 'red',
    padding: 10,
  },
  square: {
    width: '100%',
    height: '90%',
    borderRadius: 20,
    //margin: 10,
    elevation: 5,
    backgroundColor: 'white',
  },

  modal: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    height: '90%',
  },

  modalContent: {
    flex: 1,
    backgroundColor: 'white',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 15
  },

  textbox: {
    flex: 0.8,
    //backgroundColor: 'green',
    alignItems: 'center',
    flexDirection: 'row',
  },
  picturebox: {
    height: '60%',
    backgroundColor : 'gray',
    justifyContent: 'center',
    alignItems: 'center',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  iteminfo: {
    height: '40%',
    //backgroundColor : 'green',
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    padding: 10
  },

  itemDetailPictureBox: {
    height: '55%',
    width: '100%',
    //backgroundColor: 'gray',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderColor: 'lightgrey',
  },
  itemInfo: {
    height: '20%',
    //backgroundColor: 'green',
  },
  buyButtonBox: {
    height: '10%',
    //backgroundColor : 'blue',
    justifyContent: 'flex-end',
    alignItems: 'center'
  }
});

export default EventShopScreen;
