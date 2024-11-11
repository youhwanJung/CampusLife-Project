import React, { useState, useEffect } from 'react';
import { Text, View, Button, StyleSheet, TextInput, ScrollView } from 'react-native';
import { useNavigation } from '@react-navigation/native';

type Item = {
    id: number;
    name: string;
}

const LoginScreen: React.FC = ({ navigation }: any, { route }: any) => {
    const [data, setData] = useState<Item[]>([]);
    useEffect(() => {
        const fetchData = async () => {
            try {
                // 데이터를 가져오는 비동기 작업을 수행합니다.
                // 여기서는 임시로 가짜 데이터를 사용합니다.
                const fakeData: Item[] = [
                    { id: 1, name: 'Item 1' },
                    { id: 2, name: 'Item 2' },
                    { id: 3, name: 'Item 3' },
                    { id: 1, name: 'Item 1' },
                    { id: 2, name: 'Item 2' },
                    { id: 3, name: 'Item 3' },
                    { id: 1, name: 'Item 1' },
                    { id: 2, name: 'Item 2' },
                    { id: 3, name: 'Item 3' },
                    { id: 1, name: 'Item 1' },
                    { id: 2, name: 'Item 2' },
                    { id: 3, name: 'Item 3' },
                    { id: 1, name: 'Item 1' },
                    { id: 2, name: 'Item 2' },
                    { id: 3, name: 'Item 3' },
                    { id: 1, name: 'Item 1' },
                    { id: 2, name: 'Item 2' },
                    { id: 3, name: 'Item 3' },
                    
                    // 더 많은 데이터를 추가할 수 있습니다.
                ];
                // 가져온 데이터를 상태에 업데이트합니다.
                setData(fakeData);
            } catch (error) {
                console.error('Error fetching data:', error);
            }
        };

        // 컴포넌트가 마운트될 때 데이터를 가져오도록 합니다.
        fetchData();
    }, []);

    return (
        <View style={styles.container}>
            <ScrollView>
                {/* 데이터를 매핑하여 표시합니다. */}
                {data.map(item => (
                    <View key={item.id}>
                        <Text>{item.name}</Text>
                    </View>
                ))}
            </ScrollView>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: 'red',
    },
    inputTextcontainer: {
        height: 60,
        backgroundColor: 'green',
    }
}
)

export default LoginScreen;