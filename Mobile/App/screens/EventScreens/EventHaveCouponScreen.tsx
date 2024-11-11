import React, { useState, } from 'react';
import { View, Text, FlatList, StyleSheet, Image, Dimensions } from 'react-native';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import IconD from 'react-native-vector-icons/FontAwesome6';
import IconC from 'react-native-vector-icons/FontAwesome';
import { TouchableOpacity } from 'react-native-gesture-handler';
import ModalBox from 'react-native-modalbox';
import Barcode from '@kichiyaki/react-native-barcode-generator';
import { UserData, UserHaveCouponData } from '../../types/type'
import config from '../../config';
const width = Dimensions.get("window").width;

const EventHaveCouponScreen = ({ route }: any) => {
  const { userdata } = route.params;
  //console.log(userdata);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [userData, setUserData] = useState<UserData>(userdata);
  const [userHaveCoupon, setUserHaveCoupon] = useState<UserHaveCouponData[]>([]);
  const [SelectItem, SetSelectItem] = useState<UserHaveCouponData>();


useFocusEffect(
  React.useCallback(() => {
      const fetchData = async () => {
          try {
            setUserData(userdata);
            await getUserHaveCoupon();
          } catch (error) {
              console.error('Error fetching data:', error);
          }
      };
      fetchData();
  }, [])
);

  const openmodal = (selectItem: UserHaveCouponData) => {
    //console.log(selectItem.code_num);
    SetSelectItem(selectItem);
    setIsModalOpen(true);
  }
  const closemodal = () => {
    setIsModalOpen(false);
  }

  const getUserHaveCoupon = async () => {
    try {
        const response = await fetch(`${config.serverUrl}/getUserHaveCoupon`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                user_id: userData.user_pk
            }),
        })
        const data = await response.json();
        setUserHaveCoupon(data);
    } catch (error) {
        console.error(error);
    } finally {
    }
}

  //랜더링 할 아이템들
  const renderItem = ({ item }: any) => (
    <TouchableOpacity
      style={styles.itemcontainer}
      onPress={() => {openmodal(item)}}>
      <View style={{
        height: 150, width: '95%', borderWidth: 2, borderColor: "#F27405", flexDirection: 'row',
        alignItems: 'center'
      }}>
        <View style={{ width: '30%', height: '100%', alignItems: 'center', justifyContent: 'center' }}>
          <View style={{ width: '100%', height: '100%'}}>
            <Image style={{ flex: 1, width: '100%', resizeMode: 'contain' }} source={{ uri: `${config.photoUrl}/${item.image_num}.png` }} />
          </View>
        </View>
        <View style={{ height: '100%', width: '50%', padding: 5 }}>
          <View style={{ flexDirection: 'row' }}>
            <View style={{ width: '50%' }}>
              <Text style={{ fontSize: 20, fontWeight: 'bold', color: 'black', marginTop: 20 }} numberOfLines={1} ellipsizeMode='tail'>[ {item.name} ]</Text>
            </View>
            <View>
              <Text style={{ fontSize: 20, fontWeight: 'bold', color: '#ED9E2B', marginTop: 20 }} numberOfLines={1} ellipsizeMode='tail'>[ {item.price}P ]</Text>
            </View>
          </View>
          <Text style={{ marginTop: 5, fontSize: 16, color: 'black' }} numberOfLines={1} ellipsizeMode='tail'>{item.explain}</Text>
          <Text style={{ marginTop: 5, fontSize: 16, color: 'black' }} numberOfLines={1} ellipsizeMode='tail'>{item.using_time}</Text>
        </View>
        <View style={{ width: '20%', height: '100%', justifyContent: 'center', alignItems: 'center' }}>
          <View style={{ width: '90%', height: '95%', backgroundColor: '#F7B02E', justifyContent: 'center', alignItems: 'center' }}>
            <Text style={{ color: 'white' }}> <IconC name="mail-forward" size={40} /></Text>
            <Text style={{ fontSize: 18, color: 'white' }}>사용하기</Text>
          </View>
        </View>
      </View>

    </TouchableOpacity>
  );

  //전체 뷰
  return (
    <View style={styles.container}>
      <View style={styles.toptitlebox}>
        <Text style={styles.toptitletext}>보유 쿠폰 : </Text>
        <Text style={{ fontSize: 20, color: '#F27405', marginLeft: 5, }}>{userHaveCoupon.length}장</Text>
      </View>
      <FlatList
        data={userHaveCoupon}
        renderItem={renderItem}
      />
      <ModalBox
        isOpen={isModalOpen}
        style={modalstyles.modalcontainer}
        position='center'
        swipeToClose={false}
        onClosed={closemodal}>
          <View style = {{ height : '35%', justifyContent : 'center', alignItems : 'center', borderBottomWidth : 1 }}>
            <Text style ={{ fontSize : 20, fontWeight : 'bold', color : 'black'}}>상품명 : {SelectItem?.name}</Text>
            <Text style ={{ fontSize : 18, color : 'black' }}>구매 날짜 : {SelectItem?.buy_date}</Text>
            <Text style ={{ fontSize : 18, color : 'black' }}>사용 기한 : {SelectItem?.using_time}</Text>
          </View>
          <View style = {{height : '65%', justifyContent : 'center', alignItems : 'center'}}>
            <Barcode
            maxWidth={width*0.9}
                style = {{marginBottom : 20}}
                value = {
                  (SelectItem ? SelectItem.code_num : 0).toString().replace(/(.{4})/g, '$1 ').toString()
                }
                text= {
                  (SelectItem ? SelectItem.code_num : 0).toString().replace(/(.{4})/g, '$1 ').toString()
                }
                textStyle={{color: 'black'}}
              />
            <Text style ={{fontSize : 18, marginBottom : 30, color : 'black'}}>사용기한이 넘으시면 쿠폰은 자동으로 폐기 됩니다!</Text>
          </View>
      </ModalBox>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
  },
  toptitlebox: {
    padding: 15,
    //backgroundColor : 'red',
    flexDirection: 'row',
    alignItems : 'center'
  },
  toptitletext: {
    fontSize: 20,
    color: 'black',
  },
  dividingline: {
    flex: 0.93,
    borderWidth: 1,
    borderTopLeftRadius: 6,
    borderTopRightRadius: 6,
    //backgroundColor : 'blue',
  },
  itemcontainer: {
    width: '100%',
    height: 150,
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 10,
  },
  itempicturecontainer: {
    flex: 0.25,
    //backgroundColor : 'blue'
  },
  itempicture: {
    width: 100,
    height: 100,
    backgroundColor: '#FFDECF',
    borderRadius: 8,
    margin: 6,
    marginLeft: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  iteminfobox: {
    flex: 0.75,
    //backgroundColor : 'yellow',
  },
  toptextbox: {
    flex: 0.5,
    //backgroundColor : 'blue',
    flexDirection: 'row',
  },
  bottomtextbox: {
    flex: 0.5,
    //backgroundColor : 'green',
    justifyContent: 'center'
  },
  itemnamebox: {
    flex: 0.68,
    //backgroundColor : 'yellow',
    justifyContent: 'center',
  },
  itemisusedbox: {
    flex: 0.32,
    //backgroundColor : 'red',
    justifyContent: 'center',
    alignItems: 'center'
  },
  itemnamefont: {
    fontSize: 18,
    color: 'black',
    marginLeft: 10,
    marginTop: 7,
  },
  itemisusedfont: {
    fontSize: 18,
    color: 'black',
    marginTop: 7,
  },
  ticketusagedatefont: {
    fontSize: 18,
    color: 'black',
    marginLeft: 10,
    marginBottom: 7,
  },
})

const modalstyles = StyleSheet.create({
  modalcontainer: {
    height: '45%',
    width : '95%',
    borderRadius : 10,
  },
  modalbox: {
    flex: 1,
    //backgroundColor : 'red',
    borderTopRightRadius: 10,
    borderTopLeftRadius: 10,
  },
  itempicturebox: {
    flex: 0.35,
    //backgroundColor : 'yellow',
    borderTopRightRadius: 10,
    borderTopLeftRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  itempicture: {
    height: 165,
    width: 165,
    backgroundColor: '#FFDECF',
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 40,
  },
  itemnamebox: {
    flex: 0.1,
    //backgroundColor : 'red',
    justifyContent: 'center',
    alignItems: 'center',
  },
  itemnamepont: {
    fontSize: 25,
    color: 'black',
  },
  itemticketusagedatebox: {
    flex: 0.05,
    //backgroundColor : 'yellow',
    justifyContent: 'center',
    alignItems: 'center',
  },
  itemticketusagedatefont: {
    fontSize: 20,
    color: 'black',
  },
  barcordbox: {
    flex: 0.25,
    //backgroundColor : 'green',
    justifyContent: 'center',
    alignItems: 'center'
  },
  comentbox: {
    flex: 0.25,
    //backgroundColor : 'yellow',
    justifyContent: 'center',
    alignItems: 'center'
  },
  comentfont: {
    margin: 20,
    fontSize: 20,
    color: 'black',
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 70,
  }
})
export default EventHaveCouponScreen;