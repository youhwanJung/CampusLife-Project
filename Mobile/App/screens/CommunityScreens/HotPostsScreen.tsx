import React, { useState, useRef, useCallback } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import { Text, View, StyleSheet, FlatList, TouchableWithoutFeedback, TouchableOpacity, RefreshControl } from 'react-native';
import IconB from 'react-native-vector-icons/AntDesign';
import IconC from 'react-native-vector-icons/FontAwesome';
import { UserData } from '../../types/type'
import { Swipeable, GestureHandlerRootView } from 'react-native-gesture-handler';
import config from '../../config';

type PostData = {
    post_id: number,
    title: string,
    contents: string,
    date: string,
    view: number,
    like: number,
    name: string,
    user_title: string
}

const renderEmptyItem = () => { 
    return (
        <View style={styles.footerSpacing} />
    );
}

const HotPostsScreen = ({ route, navigation }: any) => {
    const swipeableRefs = useRef<(Swipeable | null)[]>(new Array().fill(null));
    const { department_check, userdata } = route.params;
    const [communityData, setCommunityData] = useState<PostData[]>([]);
    const [userData, setUserData] = useState<UserData>(userdata);
    const [userHavePost, setUserHavePost] = useState<any[]>([]);
    const [refreshing, setRefreshing] = useState(false);

    const closeBookmark = useCallback((index: any) => {
        swipeableRefs.current[index]?.close();
    }, []);

    const onRefresh = async () => {
        setRefreshing(true);
        await AreYouHavePost();
        setTimeout(() => setRefreshing(false), 500); 
    };

    const viewCountUp = async (post_id: any) => {
        try {
            await fetch(`${config.serverUrl}/view_count_up`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ post_id })
            });
        } catch (error) {
            console.error('View count increase failed', error);
        }
    }

    const addBookmark = async (user_pk: number, post_pk: number) => {
        try {
            const response = await fetch(`${config.serverUrl}/add_book_mark`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ user_id: user_pk, post_id: post_pk }),
            });

            if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        } catch (error: any) {
            console.error('Bookmark add failed:', error);
        }
    };

    const removeBookmark = async (user_pk: number, post_pk: number) => {
        try {
            const response = await fetch(`${config.serverUrl}/delete_book_mark`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ user_id: user_pk, post_id: post_pk }),
            });

            if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        } catch (error: any) {
            console.error('Bookmark remove failed:', error);
        }
    };

    const handleBookmark = async (item: PostData, index: number) => {
        try {
            if (userHavePost.some(posts => item.post_id === posts.post_id)) {
                await removeBookmark(userData.user_pk, item.post_id);
                setUserHavePost(prev => prev.filter(post => post.post_id !== item.post_id));
                closeBookmark(index);
            } else {
                await addBookmark(userData.user_pk, item.post_id);
                setUserHavePost(prev => [...prev, item]);
                closeBookmark(index);
            }
        } catch (error) {
            console.error('Bookmark handle failed:', error);
        }
    };

    const renderRightActions = (item: PostData, index: number) => (
        <TouchableOpacity onPress={() => handleBookmark(item, index)} style={styles.bookmarkButton}>
            {userHavePost.some(posts => item.post_id === posts.post_id) ? (
                <Text style={styles.bookmarkedIcon}><IconC name="bookmark" size={40} /></Text>
            ) : (
                <Text style={styles.bookmarkIcon}><IconC name="bookmark-o" size={40} /></Text>
            )}
        </TouchableOpacity>
    );

    const getHotposts = async () => {
        try {
            const response = await fetch(`${config.serverUrl}/Hotpost`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    campus_id: userData.campus_pk,
                    department_id: userData.department_pk
                }),
            });
            const postsData = await response.json();
            setCommunityData(postsData);
        } catch (error) {
            console.error(error);
        }
    }

    const getDepartmentHotposts = async () => {
        try {
            const response = await fetch(`${config.serverUrl}/departmentHotpost`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    department_id: userData.department_pk
                }),
            });
            const postsData = await response.json();
            setCommunityData(postsData);
        } catch (error) {
            console.error(error);
        }
    }

    const AreYouHavePost = async () => {
        try {
            const response = await fetch(`${config.serverUrl}/get_user_have_post`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ user_id: userData.user_pk })
            });
            const userHavePosts = await response.json();
            setUserHavePost(userHavePosts);

            if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        } catch (error) {
            console.error('Failed to fetch user bookmarks:', error);
        }
    }

    useFocusEffect(
        React.useCallback(() => {
            const fetchData = async () => {
                try {
                    if (department_check === 0) {
                        await getHotposts();
                    } else if (department_check === 1) {
                        await getDepartmentHotposts();
                    }
                    setUserData(userdata);
                    await AreYouHavePost();
                } catch (error) {
                    console.error('Error fetching data:', error);
                }
            };
            fetchData();
        }, [])
    );

    const renderItem = ({ item, index }: { item: PostData, index: number }) => (
        <GestureHandlerRootView style={{ flex: 1 }}>
            <Swipeable ref={(instance) => (swipeableRefs.current[index] = instance)} renderRightActions={() => renderRightActions(item, index)}>
                <TouchableWithoutFeedback onPress={async () => {
                    await viewCountUp(item.post_id);
                    navigation.navigate("PostDetailScreen", { item, userData })
                }}>
                    <View style={styles.postItem}>
                        <View style={styles.postHeader}>
                            <View style={styles.postTitleSection}>
                                <Text style={styles.postTitle} numberOfLines={1}>{item.title}</Text>
                            </View>
                            <View style={styles.viewCountSection}>
                                <Text style={styles.viewIcon}><IconB name="eyeo" size={26} /></Text>
                                <Text style={styles.viewCountText}>{item.view}</Text>
                            </View>
                        </View>
                        <View style={styles.postFooter}>
                            <View style={styles.authorSection}>
                                <Text style={[styles.authorName, 
                                    item.user_title === "학교" && styles.schoolRole, 
                                    item.user_title === "반장" && styles.leaderRole, 
                                    item.user_title === "학우회장" && styles.presidentRole]}>
                                    {item.name}
                                </Text>
                                <Text> | {item.date}</Text>
                            </View>
                            <View style={styles.likeCountSection}>
                                <Text style={styles.likeIcon}><IconB name="like1" size={21} /></Text>
                                <Text style={styles.likeCountText}>{item.like}</Text>
                            </View>
                        </View>
                    </View>
                </TouchableWithoutFeedback>
            </Swipeable>
        </GestureHandlerRootView>
    );

    return (
        <View style={styles.container}>
            <View style={styles.headerSpacing} />
            <FlatList
                data={communityData}
                renderItem={renderItem}
                ListFooterComponent={renderEmptyItem}
                refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
            />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: 'white',
    },
    postItem: {
        paddingHorizontal: 10,
        borderBottomWidth: 1,
        borderBottomColor: '#CCCCCC',
        backgroundColor: 'white',
        flex: 1,
        height: 70,
    },
    postHeader: {
        flex: 1,
        height: '60%',
        flexDirection: 'row',
    },
    postFooter: {
        width: '100%',
        height: '40%',
        flexDirection: 'row',
    },
    postTitleSection: {
        width: '87%',
        justifyContent: 'center',
        paddingRight: 10,
    },
    viewCountSection: {
        width: '13%',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'flex-start',
    },
    authorSection: {
        width: '87%',
        flexDirection: 'row',
    },
    likeCountSection: {
        width: '13%',
        flexDirection: 'row',
        bottom: 5,
        left: 2,
        alignItems: 'center',
        justifyContent: 'flex-start',
    },
    bookmarkButton: {
        backgroundColor: '#FFDFC1',
        justifyContent: 'center',
        alignItems: 'center',
        width: 70,
    },
    bookmarkedIcon: {
        color: '#F29F05',
    },
    bookmarkIcon: {
        color: '#F29F05',
    },
    postTitle: {
        fontSize: 19,
        margin: 5,
        marginLeft: 10,
        color: 'black',
    },
    viewIcon: {
        color: '#F29F05',
    },
    viewCountText: {
        color: 'black',
        marginLeft: 4,
    },
    authorName: {
        fontSize: 13,
        marginLeft: 10,
    },
    schoolRole: {
        color: 'red',
    },
    leaderRole: {
        color: 'green',
    },
    presidentRole: {
        color: 'blue',
    },
    headerSpacing: {
        height: 120,
        backgroundColor: 'white',
    },
    footerSpacing: {
        height: 85,
    },
    likeIcon: {
        color: '#F29F05',
    },
    likeCountText: {
        color: 'black',
        marginLeft: 7,
        top: 1
    },
});

export default HotPostsScreen;
