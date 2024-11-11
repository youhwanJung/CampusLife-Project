import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  Dimensions,
  Image,
  Text,
  TouchableOpacity,
  Alert,
  ScrollView,
  Modal,
} from 'react-native';
import Icon_event from 'react-native-vector-icons/MaterialCommunityIcons';
import { useFocusEffect } from '@react-navigation/native';
import {
  UserData,
  AdminEventList,
  VoteEvnetData,
  VoteInfoItem,
  VoteDataItem,
} from '../../types/type';
import config from '../../config';
import Ionicons from 'react-native-vector-icons/Ionicons';

const width = Dimensions.get('window').width;

/**
 * 현재 등록되어 있는 이벤트들을 확인하는 컴포넌트입니다.
 */
const CheckEvent = ({ route, navigation }: any) => {
  const { userdata } = route.params;

  const [userData, setUserData] = useState<UserData>(userdata);
  const [eventList, setEventList] = useState<AdminEventList[]>([]);
  const [voteData, setVoteData] = useState<VoteDataItem[]>([]);
  const [voteInfo, setVoteInfo] = useState<VoteInfoItem[]>([]);
  const [deleteModalVisible, setDeleteModalVisible] = useState(false); // 삭제 모달 표시 여부
  const [selectedEventId, setSelectedEventId] = useState<number | null>(null); // 선택된 이벤트 ID

  useFocusEffect(
    React.useCallback(() => {
      const fetchData = async () => {
        try {
          setUserData(userdata);
          await GetEventList();
          await GetEventVote();
        } catch (error) {
          console.error('Error fetching data:', error);
        }
      };
      fetchData();
    }, [])
  );

  const GetEventList = async () => {
    try {
      const response = await fetch(`${config.serverUrl}/GetEventList`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ campus_id: userData.campus_pk }),
      });
      const data = await response.json();
      setEventList(data);
    } catch (error) {
      console.error(error);
    }
  };

  const GetEventVote = async () => {
    try {
      const response = await fetch(`${config.serverUrl}/GetEventVote`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ campus_id: userData.campus_pk }),
      });
      const data: VoteEvnetData[] = await response.json();
      const groupedData: any = {};

      data.forEach((item) => {
        if (!groupedData[item.event_id]) {
          groupedData[item.event_id] = {
            votes: [],
            results: [],
          };
        }
        groupedData[item.event_id].votes[item.vote_index - 1] = item.vote_name;
        groupedData[item.event_id].results[item.vote_index - 1] = item.vote_count;
      });

      const voteInfoArray: VoteInfoItem[] = [];
      const voteDataArray: VoteDataItem[] = [];

      Object.keys(groupedData).forEach((event_id) => {
        const { votes, results } = groupedData[event_id];

        for (let i = 0; i < votes.length; i++) {
          if (!votes[i]) {
            votes[i] = `투표 항목${i + 1}`;
          }
        }

        voteInfoArray.push({
          id: parseInt(event_id, 10),
          votes: votes,
        });

        voteDataArray.push({
          id: parseInt(event_id, 10),
          results: results,
        });
      });

      setVoteInfo(voteInfoArray);
      setVoteData(voteDataArray);
    } catch (error) {
      console.error(error);
    }
  };

  const DeleteEvent = async (eventId: number) => {
    try {
      await fetch(`${config.serverUrl}/DeleteEvent`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ event_id: eventId }),
      });
      await GetEventList();
      await GetEventVote();
    } catch (error) {
      console.error(error);
    }
  };

  const handleEditEvent = (eventId: number) => {
    navigation.navigate('ModifyEvent', { userdata, eventId });
  };

  const handleDeleteEvent = (eventId: number) => {
    setSelectedEventId(eventId);
    setDeleteModalVisible(true);
  };

  const calculatePercentages = (votes: any[], results: any[]) => {
    const totalVotes = results.reduce((acc, count) => acc + count, 0);
    return votes.map((vote, index) => ({
      vote,
      count: results[index],
      percentage: totalVotes === 0 ? 0 : (results[index] / totalVotes) * 100,
    }));
  };

  return (
    <View style={styles.container}>
      {/* 상단 버튼 영역 */}
      <View style={styles.btnArea}>
        {/* 이벤트 등록 버튼 */}
        <TouchableOpacity
          style={styles.eventBtn}
          onPress={() => navigation.navigate('RegisterEvent', userdata)}
        >
          <Icon_event style={styles.eventRegistIcon} name="note-plus-outline" />
          <Text style={styles.eventRegistText}>이벤트 등록</Text>
        </TouchableOpacity>
        {/* 참여 확인 버튼 */}
        <TouchableOpacity
          style={styles.eventBtn}
          onPress={() => navigation.navigate('ParticipantEvent', userdata)}
        >
          <Icon_event style={styles.eventRegistIcon} name="note-text-outline" />
          <Text style={styles.eventCheckText}>참여 확인</Text>
        </TouchableOpacity>
      </View>
      {/* 이벤트 목록 */}
      <ScrollView>
        {eventList?.map((event) => {
          const votes = voteInfo.find((vote) => vote.id === event.event_id)?.votes || [];
          const results = voteData.find((vote) => vote.id === event.event_id)?.results || [];
          const percentages = calculatePercentages(votes, results);

          return (
            <View key={event.event_id} style={styles.eventCard}>
              {/* 이벤트 이미지 영역 */}
              <Image
                style={styles.eventImage}
                source={{ uri: `${config.photoUrl}/${event?.event_photo}.png` }}
              />
              {/* 이벤트 정보 영역 */}
              <View style={styles.eventContentArea}>
                <Text style={styles.eventTitle}>{event.name}</Text>
                <Text style={styles.eventInfo}>{event.info}</Text>
                {/* 투표 결과 표시 */}
                {percentages.map(
                  (vote, index) =>
                    vote.vote !== 'null' && (
                      <View key={index} style={styles.voteResult}>
                        <Text style={styles.voteText}>{vote.vote}</Text>
                        <View style={styles.voteTextArea}>
                          <Text style={styles.voteCount}>{vote.count}표</Text>
                          <Text style={styles.votePercentage}>
                            ({vote.percentage.toFixed(1)}%)
                          </Text>
                        </View>
                      </View>
                    )
                )}
                {/* 이벤트 기간 표시 */}
                <Text style={styles.eventDate}>
                  {event.start_date} ~ {event.close_date}
                </Text>
                {/* 이벤트 수정 및 삭제 버튼 영역 */}
                <View style={styles.eventButtonArea}>
                  <TouchableOpacity
                    style={styles.actionButton}
                    onPress={() => handleEditEvent(event.event_id)}
                  >
                    <Ionicons name="pencil-outline" size={16} color="#fff" />
                    <Text style={styles.actionButtonText}>수정</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.actionButton}
                    onPress={() => handleDeleteEvent(event.event_id)}
                  >
                    <Ionicons name="trash-outline" size={16} color="#fff" />
                    <Text style={styles.actionButtonText}>삭제</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          );
        })}
        {/* 하단 여백 */}
        <View style={{ height: 100 }} />
      </ScrollView>

      {/* 삭제 확인 모달 */}
      <Modal
        visible={deleteModalVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setDeleteModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <Text style={styles.modalTitle}>이벤트 삭제</Text>
            <Text style={styles.modalMessage}>해당 이벤트를 정말 삭제하시겠습니까?</Text>
            <View style={styles.modalButtonContainer}>
              <TouchableOpacity
                style={styles.modalButton}
                onPress={() => {
                  setDeleteModalVisible(false);
                }}
              >
                <Text style={styles.modalButtonText}>취소</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.modalButton}
                onPress={async () => {
                  if (selectedEventId !== null) {
                    await DeleteEvent(selectedEventId);
                    setDeleteModalVisible(false);
                  }
                }}
              >
                <Text style={styles.modalButtonText}>확인</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

// 스타일 시트 정의
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  btnArea: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginVertical: 10,
    marginHorizontal: 10,
  },
  eventBtn: {
    backgroundColor: '#f27400',
    flexDirection: 'row',
    alignItems: 'center',
    padding: 8,
    marginLeft: 10,
    borderRadius: 5,
  },
  eventRegistIcon: {
    color: '#fff',
    fontSize: 20,
    marginRight: 5,
  },
  eventRegistText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  eventCheckText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  eventCard: {
    backgroundColor: '#fff',
    borderRadius: 10,
    marginVertical: 8,
    marginHorizontal: 10,
    overflow: 'hidden',
    elevation: 3,
  },
  eventImage: {
    width: '100%',
    height: 200,
  },
  eventContentArea: {
    padding: 15,
  },
  eventTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#333',
  },
  eventInfo: {
    fontSize: 16,
    color: '#666',
    marginVertical: 8,
    lineHeight: 22,
  },
  eventDate: {
    fontSize: 14,
    color: '#999',
    marginTop: 5,
  },
  voteResult: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginVertical: 4,
  },
  voteText: {
    fontSize: 16,
    color: '#333',
  },
  voteTextArea: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  voteCount: {
    fontSize: 16,
    color: '#333',
    marginRight: 10,
  },
  votePercentage: {
    fontSize: 14,
    color: '#999',
  },
  eventButtonArea: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 10,
  },
  actionButton: {
    flexDirection: 'row',
    backgroundColor: '#f27400',
    padding: 8,
    borderRadius: 5,
    alignItems: 'center',
    marginLeft: 10,
  },
  actionButtonText: {
    color: '#fff',
    fontSize: 14,
    marginLeft: 5,
  },
  // 모달 스타일 추가
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    width: '80%',
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 25,
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 15,
    color: '#333',
  },
  modalMessage: {
    fontSize: 16,
    color: '#555',
    textAlign: 'center',
    marginBottom: 25,
  },
  modalButtonContainer: {
    flexDirection: 'row',
  },
  modalButton: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 12,
    marginHorizontal: 5,
    backgroundColor: '#f27400',
    borderRadius: 5,
  },
  modalButtonText: {
    color: '#fff',
    fontSize: 16,
  },
});

export default CheckEvent;
