import React, { useState , useEffect} from 'react';
import { View, ScrollView,  Image, Text, StyleSheet, TouchableOpacity} from 'react-native';
// import {SingleImage} from "rn-instagram-image";
import {
    useFonts,
    Montserrat_600SemiBold,
    Montserrat_700Bold,
    Montserrat_800ExtraBold,
    Montserrat_400Regular
  } from '@expo-google-fonts/montserrat';

import {API_URL, default_photo} from '../config/config';

let user = null;
let owner = null;

const ProfileScreen = (props) => {
    user = props.navigation.state.params.user; //current user
    owner = props.navigation.state.params.owner; //profile owner
    const [showAlert , setShowAlert] = useState(true); //success alert
    let [fontsLoaded] = useFonts({
        Montserrat_600SemiBold,
        Montserrat_700Bold,
        Montserrat_800ExtraBold,
        Montserrat_400Regular
    });

    const [rCnt,setRCnt] = useState([0,0,0,0,0,0,0]);
    const [value,setValue] = useState(0);

    //get Reaction Data
    useEffect(() => {
        getReaction();
    }, []);

    const getReaction = () => {
        fetch(`${API_URL}/getReaction`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({email:owner.email}),
        })
        .then(async res => { 
            try {
                const jsonRes = await res.json();
                if (res.status !== 200) {
                } else {
                    const reactionList = jsonRes.data;
                    console.log(reactionList);
                    reactionList.map((item)=>{
                        rCnt[item.type] = rCnt[item.type] + 1;
                    });
                }
                
                setShowAlert(false);
            } catch (err) {
                console.log(err);
            };
        })
        .catch(err => {
            console.log(err);
        });
    }

    //render full name to first & last
    const renderName = (name) => {
        const fl_name = name.split(' ');
        const first_name = fl_name[0];
        const last_name = fl_name.length > 1 ? fl_name[1]:'';
        return (
            <View style={styles.nameContainer}>
                {fontsLoaded && <Text style={{textAlign:'center'}}><Text style={styles.first_name}>{first_name} </Text><Text style={styles.last_name}>{last_name}</Text></Text>}
            </View>
        )
    };

    // tap to view reaction history
    const goReactionHistory = (type) => {
        props.navigation.navigate('ReactionHistory', {
            user:user,
            type:type,
            rCnt:rCnt
        });
    };

    // tap to add reaction
    const addReaction = (type) => {
        if(owner.email == user.email)
        {
            goReactionHistory(type);
            return;
        }

        const payload ={
            type:type,
            email:owner.email,
            react_email:user.email,
            react_name:user.name
        }

        fetch(`${API_URL}/addReaction`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(payload),
        })
        .then(async res => { 
            try {
                const jsonRes = await res.json();
                if (res.status !== 200) {
                } else {
                    //add reaction success
                    rCnt[type] = rCnt[type] + 1;
                    setValue(value + 1);
                }
            } catch (err) {
                console.log(err);
            };
        })
        .catch(err => {
            console.log(err);
        });
    }

    return (
        <View style={styles.container}>
            {renderName(owner.name)}
            <View style={styles.photoContainer}>
                    {/* <SingleImage style={styles.photo} imageSource={{uri: owner.photo==''?default_photo:owner.photo}}></SingleImage> */}
            </View>
            <View style={styles.reactContainer}>
                <View style={styles.emojiLineContainer}>
                    <TouchableOpacity style={styles.emojiContainer} onPress={()=>addReaction(1)}>
                        {rCnt[1] > 0 && <Image style={styles.emojiImg} source={require('../assets/reactions/1.png')} />}
                        {rCnt[1] == 0 && <Image style={styles.emojiImg} source={require('../assets/reactions/1_0.png')} />}
                        <Text style={styles.emojiCount}>{rCnt[1] > 0?rCnt[1]:''}</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.emojiContainer} onPress={()=>addReaction(2)}>
                        {rCnt[2] > 0 && <Image style={styles.emojiImg} source={require('../assets/reactions/2.png')} />}
                        {rCnt[2] == 0 && <Image style={styles.emojiImg} source={require('../assets/reactions/2_0.png')} />}
                        <Text style={styles.emojiCount}>{rCnt[2] > 0?rCnt[2]:''}</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.emojiContainer} onPress={()=>addReaction(3)}>
                        {rCnt[3] > 0 && <Image style={styles.emojiImg} source={require('../assets/reactions/3.png')} />}
                        {rCnt[3] == 0 && <Image style={styles.emojiImg} source={require('../assets/reactions/3_0.png')} />}
                        <Text style={styles.emojiCount}>{rCnt[3] > 0?rCnt[3]:''}</Text>
                    </TouchableOpacity>
                </View>
                <View style={[styles.emojiLineContainer,{marginTop:26}]}>
                    <TouchableOpacity style={styles.emojiContainer} onPress={()=>addReaction(4)}>
                        {rCnt[4] > 0 && <Image style={styles.emojiImg} source={require('../assets/reactions/4.png')} />}
                        {rCnt[4] == 0 && <Image style={styles.emojiImg} source={require('../assets/reactions/4_0.png')} />}
                        <Text style={styles.emojiCount}>{rCnt[4] > 0?rCnt[4]:''}</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.emojiContainer} onPress={()=>addReaction(5)}>
                        {rCnt[5] > 0 && <Image style={styles.emojiImg} source={require('../assets/reactions/5.png')} />}
                        {rCnt[5] == 0 && <Image style={styles.emojiImg} source={require('../assets/reactions/5_0.png')} />}
                        <Text style={styles.emojiCount}>{rCnt[5] > 0?rCnt[5]:''}</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.emojiContainer} onPress={()=>addReaction(6)}>
                        {rCnt[6] > 0 && <Image style={styles.emojiImg} source={require('../assets/reactions/6.png')} />}
                        {rCnt[6] == 0 && <Image style={styles.emojiImg} source={require('../assets/reactions/6_0.png')} />}
                        <Text style={styles.emojiCount}>{rCnt[6] > 0?rCnt[6]:''}</Text>
                    </TouchableOpacity>
                </View>
            </View>
       </View>
    );
};

const styles = StyleSheet.create({
    reactContainer:{
        width:'100%',
        marginTop:60,
        paddingHorizontal:'10%'
    },
    emojiLineContainer:{
        flexDirection:'row',
        justifyContent:'center',
        alignItems:'center'
    },
    emojiContainer: {
        justifyContent:'center',
        alignItems:'center',
        width:'33%'
    },
    emojiImg: {
        width: 36,
        height: 36
    },
    emojiCount:{
        marginTop:9,
        fontSize:13,
        height:16,
        color:'rgba(0, 0, 0, 0.8)',
        fontFamily:'Montserrat_700Bold'
    },
    nameContainer:{
        width:'100%'
    },
    first_name:{
        textAlign:'center',
        fontSize:22,
        fontFamily:'Montserrat_700Bold',
    },
    last_name:{
        textAlign:'center',
        fontSize:22,
        fontFamily:'Montserrat_400Regular'
    },
    container: {
        paddingTop:25,
        width: '100%',
        height:'100%',
        display: "flex", 
        flexDirection: "row", 
        flexWrap: "wrap",
        backgroundColor:'white',
        fontFamily:'Montserrat',
        fontStyle:'normal',
        marginBottom:50,
        alignItems:'center'
    },
    header: {
        flexDirection:'row',
        marginRight:24
    },
    menu:{
        height:70,
        justifyContent:'center',
        alignItems:'flex-end'
    },
    menu_img:{
        width:24,
        height:24,
        justifyContent:'center',
        alignItems:'center'
    },
    photo:{
        width:'100%',
        height:'100%'
    },
    photoContainer:{
        width:'100%',
        height:'55%',
        marginTop:16
    },
    headerLeftContainer:{
        marginLeft:25
    }
});

export default ProfileScreen;

const goBack = (screenProps) => {
    screenProps.navigation.goBack();
}

const goUserProfile = (screenProps) => {
    screenProps.navigation.navigate('Account', {
        user: user
    });
}

ProfileScreen['navigationOptions'] = props => ({
    headerLeft: () => <View style={styles.headerLeftContainer}>
                            <TouchableOpacity style={styles.menu} onPress={() => goBack(props)}>
                                <Image style={styles.menu_img} source={require('../assets/feed.png')} />
                            </TouchableOpacity>
                        </View>,
    headerRight: () => <View style={styles.header}>
                            {user.email == owner.email && <TouchableOpacity style={styles.menu} onPress={() => goUserProfile(props)}>
                                <Image style={styles.menu_img} source={require('../assets/menu.png')} />
                            </TouchableOpacity>}
                            {user.email != owner.email && <TouchableOpacity style={styles.menu}>
                                <Image style={styles.menu_img} source={require('../assets/menu2.png')} />
                            </TouchableOpacity>}
                        </View>
})
