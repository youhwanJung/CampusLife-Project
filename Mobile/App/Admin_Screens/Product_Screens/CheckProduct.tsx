import React, { useState } from 'react';
import { View, StyleSheet, Dimensions, Image, Text, TouchableOpacity, FlatList } from 'react-native';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import ModalBox from 'react-native-modalbox';
import { UserData, UserHaveCouponData } from '../../types/type'
import config from '../../config';

import IconD from 'react-native-vector-icons/AntDesign';

const width = Dimensions.get("window").width;

const CheckProduct = ({ navigation, route }: any) => {
  const { userdata } = route.params;
  const [isModalOpen, setIsModalOpen] = useState(false); // 모달의 열기/닫기 상태를 useState로 관리
  const [userData, setUserData] = useState<UserData>(userdata);
  const [AdminRegisterItem, setAdminRegisterItem] = useState<UserHaveCouponData[]>([]);
  //console.log(userdata);

  useFocusEffect(
    React.useCallback(() => {
        const fetchData = async () => {
            try {
              setUserData(userdata);
              await getItems();
            } catch (error) {
                console.error('Error fetching data:', error);
            }
        };
        fetchData();
    }, [])
);


  const closeModal = () => {
    setIsModalOpen(false);
  };


  //관리자에서 Item 목록 가져오기.
  const getItems = async () => {
    try {
      const response = await fetch(`${config.serverUrl}/admin_get_items`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          campus_id: userData.campus_pk
        })
      })
      const items = await response.json();
      setAdminRegisterItem(items);

    } catch (error) {
      console.error(error);
    }
  }

  //랜더링 할 아이템들
  const renderItem = ({ item }: { item: UserHaveCouponData }) => (
    <TouchableOpacity
      style={styles.itemcontainer}
      onPress={() => navigation.navigate("ModifyProduct", {userdata, ItemInfo : item })}>
      <View style={styles.photobox}>
        <View style={styles.photo}>
          <Image style={{ height: "100%", width: "100%", borderRadius: 15 }} source={{ uri: `${config.photoUrl}/${item.image_num}.png` }} />
        </View>
      </View>
      <View style={styles.infocontainer}>
        <View style={styles.nameANDiconbox}>
          <Text style={styles.itemexplainText}> {item.name} </Text>
          <IconD style={{ marginRight: 20, color: '#ED9E2B' }} name="form" size={30} color="white" />
        </View>
        <View style={styles.explainTextBox}>
          <Text numberOfLines={2} ellipsizeMode="tail" style={styles.explainText}> {item.explain} </Text>
        </View>
        <View style={styles.athorInfobox}>
          <Text style={styles.priceText}>[{item.price}P]</Text>
          <Text style={styles.usingTimeText}>[{item.using_time}]</Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <View style={styles.topbox}>
        <Text style={{ fontSize: 20, color: 'black', marginLeft: 10, fontWeight: 'bold' }}>현재 등록한 상품 수 : {AdminRegisterItem.length}</Text>
        <TouchableOpacity style={styles.registerButton}
          onPress={() => { navigation.navigate("RegisterProduct") }}>
          <Text style={{ fontSize: 18, color: 'white', fontWeight: 'bold' }}>상품등록</Text>
        </TouchableOpacity>
      </View>
      <FlatList
        data={AdminRegisterItem}
        renderItem={renderItem}
      />
      <ModalBox
        isOpen={isModalOpen} // 모달의 열기/닫기 상태를 prop으로 전달
        style={styles.modal}
        position="bottom"
        swipeToClose={false}
        onClosed={closeModal} // 모달이 닫힐 때 호출되는 콜백 함수
      >
      </ModalBox>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
  },
  topbox: {
    width: "100%",
    height: 60,
    backgroundColor: '#FFFADD',
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  registerButton: {
    width: "30%",
    height: 40,
    borderRadius: 10,
    marginRight: 6,
    backgroundColor: '#9A9EFF',
    justifyContent: 'center',
    alignItems: 'center',
  },

  itemcontainer: {
    width: '100%',
    height: 140,
    flexDirection: 'row',
    justifyContent: 'center',
    //alignItems : 'center',
    marginTop: 15,
    paddingHorizontal: 10,
    //backgroundColor : 'red'
  },
  photobox: {
    width: "30%",
    height: "100%",
    //backgroundColor : 'blue'
  },
  photo: {
    flex: 1,
    margin: 4,
    backgroundColor: '#F5F5F5',
    borderRadius: 15,
  },
  infocontainer: {
    width: "70%",
    height: 180,
    //backgroundColor : 'yellow'
  },
  itemexplainText: {
    fontSize: 18,
    color: 'grey'
  },
  explainTextBox: {
    width: "100%",
    height: 50,
    //backgroundColor : 'red',
    justifyContent: 'center',
    //alignItems : 'center'
  },
  explainText: {
    fontSize: 19,
    color: 'black'
  },
  athorInfobox: {
    width: "100%",
    height: 55.5,
    //backgroundColor : 'blue'
  },
  priceText: {
    color: "#ED9E2B",
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 5,
  },
  usingTimeText: {
    color: "grey",
    fontSize: 16,
    marginLeft: 5,
  },
  modifybox: {
    width: "100%",
    height: 40,
    backgroundColor: 'white'
  },
  nameANDiconbox: {
    width: "100%",
    height: 35,
    //justifyContent : 'center',
    alignItems: 'center',
    //backgroundColor : 'green',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  modal: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    height: '90%',
  },
});

export default CheckProduct;
