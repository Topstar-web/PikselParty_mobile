import React, { useState , useEffect} from 'react';
import { View,  Image, Text, StyleSheet, TouchableOpacity} from 'react-native';

import {
    useFonts,
    Montserrat_600SemiBold,
    Montserrat_700Bold,
    Montserrat_800ExtraBold,
    Montserrat_400Regular
  } from '@expo-google-fonts/montserrat';

import {API_URL, windowHeight,windowWidth,default_photo} from '../config/config';
import { ScrollView } from 'react-native-gesture-handler';

const ReactionHistoryScreen = (props) => {
    const user = props.navigation.state.params.user; //current user
    const [type , setType] = useState(props.navigation.state.params.type); //current user
    const [rCnt , setRCnt] = useState(props.navigation.state.params.rCnt); //current user
    const [historyList , setHistoryList] = useState([0,0]);
    const [value,setValue] = useState(0);
    let [fontsLoaded] = useFonts({
        Montserrat_600SemiBold,
        Montserrat_700Bold,
        Montserrat_800ExtraBold,
        Montserrat_400Regular
    });

    useEffect(() => {
        loadHistory();
    }, []);

    // load Reaction history
    const loadHistory = async () => {
        fetch(`${API_URL}/getReactionHistory`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(
                {
                    type:type,
                    email:user.email
                }
            ),
        })
        .then(async res => { 
            try {
                const jsonRes = await res.json();
                if (res.status !== 200) {
                } else {
                    setHistoryList(jsonRes.data);
                    console.log("history",historyList);
                    setValue(value + 1);
                }
                
            } catch (err) {
                console.log(err);
            };
        })
        .catch(err => {
            console.log(err);
        });
    };

    //set Active type and call loadHistory
    const loadReactionHistory = (rType)  => {
        setType(rType); //set Active type
        loadHistory();
    };

    const renderItem = (item,key) => {
        return (
            <View key={key} style={styles.historyItemContainer}>
                <Image style={styles.photo} 
                    source={{
                        uri: item.photo==''?default_photo:item.photo
                    }}>
                </Image>
            </View>
        )
    }

    return (
        <View style={styles.container}>
            <ScrollView showsHorizontalScrollIndicator={false} horizontal style={styles.reactBarContainer}>
                {rCnt[1] > 0 && <TouchableOpacity activeOpacity={0.6} style={styles.emojiContainer} onPress={()=>loadReactionHistory(1)}>
                        <Image style={styles.emojiImg} source={type==1?require('../assets/reactions/1.png'):require('../assets/reactions/1_0.png')} />
                        <Text style={type==1?styles.emojiCount:styles.emojiCount_disable}>{rCnt[1] > 0?rCnt[1]:''}</Text>
                </TouchableOpacity>}
            </ScrollView>
            <ScrollView style={styles.historyListContainer}>
                {historyList.map((item,key) => renderItem(item,key))}
            </ScrollView>
       </View>
    );
};

const styles = StyleSheet.create({
    historyListContainer:{
        marginHorizontal:15,
        width:windowWidth
    },
    historyItemContainer:{
        marginTop:10,
        height:70,
        width:windowWidth
    },
    photo:{
        width:40 * windowWidth / 375,
        height:40 * windowHeight / 375,
        borderRadius:50
    },
    reactBarContainer:{
        height:90,
        marginLeft:15,
        marginRight:15,
        paddingBottom:17,
        borderBottomColor:'#E5E5E5',
        borderBottomWidth:1
    },
    emojiContainer: {
        width: windowWidth * 0.33,
        alignItems:'center',
        justifyContent:'center'
    },
    emojiImg: {
        width: 36,
        height: 36
    },
    emojiCount:{
        marginTop:9,
        fontSize:14,
        height:16,
        color:'rgba(221, 46, 68, 1)',
        fontFamily:'Montserrat_700Bold'
    },
    emojiCount_disable:{
        marginTop:9,
        fontSize:14,
        height:16,
        color:'rgba(82, 82, 82, 1)',
        fontFamily:'Montserrat_700Bold'
    },
    container: {
        paddingTop:25,
        width: '100%',
        height:'100%',
        display: "flex", 
        flexDirection: "row", 
        flexWrap: "wrap",
        backgroundColor:'white',
        marginBottom:50,
        alignItems:'center'
    }
});

export default ReactionHistoryScreen;