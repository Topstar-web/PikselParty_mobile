import React, { useState , useEffect} from 'react';
import { View, ScrollView, TextInput,FlatList, Image, Text, StyleSheet, TouchableOpacity} from 'react-native';
import AwesomeAlert from 'react-native-awesome-alerts';
import SvgUri from 'react-native-svg-uri';
import {
    useFonts,
    Montserrat_600SemiBold,
    Montserrat_700Bold,
    Montserrat_800ExtraBold,
    Montserrat_400Regular,
    Montserrat_500Medium
  } from '@expo-google-fonts/montserrat';

import {API_URL, default_photo, windowHeight, windowWidth} from '../config/config';

let user = null;

const SearchScreen = (props) => {
    user = props.navigation.state.params.user; //current user
    const [data,setData] = useState({
        search:'',
        userList:[]
    });

    const [blockList,setBlockList] = useState([]);

    const [loadingAlert,setLoadingAlert] = useState(false);

    let [fontsLoaded] = useFonts({
        Montserrat_600SemiBold,
        Montserrat_700Bold,
        Montserrat_800ExtraBold,
        Montserrat_400Regular,
        Montserrat_500Medium
    });

    //load whole user list at first
    useEffect(() => {
        setLoadingAlert(true);
        getBlockList();
        fetch(`${API_URL}/getUserList`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            }
        })
        .then(async res => { 
            try {
                const jsonRes = await res.json();
                if (res.status !== 200) {
                } else {
                    data.userList = jsonRes.data;
                    setLoadingAlert(false);
                }
                
            } catch (err) {
                console.log(err);
            };
        })
        .catch(err => {
            console.log(err);
        });
    }, []);  
    
    //load block list
    const getBlockList = () =>{
        fetch(`${API_URL}/getUser`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({email:user.email})
        })
        .then(async res => { 
            try {
                const jsonRes = await res.json();
                if (res.status !== 200) {
                } else {
                    setBlockList(jsonRes.data[0].block_list);
                }
                
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
                <Text style={styles.first_name}>{first_name} </Text>
                <Text style={styles.first_name}>{last_name}</Text>
            </View>
        )
    };

    // on tap on list
    const onTapUser = (email) => {
        setLoadingAlert(true);
        fetch(`${API_URL}/getUser`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({email:email})
        })
        .then(async res => { 
            try {
                const jsonRes = await res.json();
                if (res.status !== 200) {
                } else {
                    const tapUser = jsonRes.data;
                    setLoadingAlert(false);

                    props.navigation.navigate('Profile', {
                        owner: tapUser[0],
                        user:user
                    });
                }
                
            } catch (err) {
                console.log(err);
            };
        })
        .catch(err => {
            console.log(err);
        });
    };

    return (
        <View style={styles.container}>
            <View style={styles.searchContainer}>
                <TextInput style={styles.searchInput} onChangeText={text=>{setData({...data,search:text})}} placeholder="Search a user" value={data.search}/>
            </View>

            <FlatList
                style={styles.searchUserListContainer}
                data={data.userList}
                renderItem={({ item }) => {
                    if(item.name && item.name.toLowerCase().includes(data.search.toLowerCase()) && item.email != user.email && !blockList.includes(item.email))
                    {
                        return (
                            <TouchableOpacity style={styles.historyItemContainer} onPress={()=>onTapUser(item.email)}>
                                <Image style={styles.photo} 
                                    source={{
                                        uri: item.photo==''?default_photo:item.photo
                                    }}>
                                </Image>
                                {renderName(item.name)}
                            </TouchableOpacity>
                        )
                    }
                    
                }}
                keyExtractor={(item) => "" + item.email}
            />
            <AwesomeAlert
                show={loadingAlert}
                showProgress={true}
                title="Processing"
                message="Wait a moment..."
                closeOnTouchOutside={false}
                closeOnHardwareBackPress={false}
            />
       </View>
    );
};

const styles = StyleSheet.create({
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
    },
    searchUserListContainer:{
        marginTop:30,
        marginLeft:21,
        height:windowHeight - 180
    },
    nameContainer:{
        flexDirection:'row',
        alignItems:'center',
        marginLeft:14
    },
    historyItemContainer:{
        marginTop:12,
        width:windowWidth,
        flexDirection:'row',
        alignItems:'center'
    },
    first_name:{
        fontFamily:'Montserrat_500Medium',
        fontSize:16
    },
    photo:{
        width:35 * windowWidth / 375,
        height:35 * windowWidth / 375,
        borderRadius:50
    },
    searchContainer:{
        width:windowWidth,
        alignItems:'center',
        height:44
    },
    searchInput:{
        fontSize:14,
        paddingLeft:20,
        width:windowWidth - 40,
        justifyContent:'center',
        borderWidth:1,
        height:'100%',
        borderRadius:4,
        borderColor:'#E5E5E5',
        fontFamily:'Montserrat_400Regular'
    },
    headerLeftContainer:{
        marginLeft:25
    },
    headerRightContainer:{
        marginRight:25
    }
});

export default SearchScreen;

const goFeed = (screenProps) => {
    screenProps.navigation.navigate('Feed', {
        user: user
    });
}

const goUserProfile = (screenProps) => {
    screenProps.navigation.navigate('Account', {
        user: user
    });
}

SearchScreen['navigationOptions'] = props => ({
    headerLeft: () => <View style={styles.headerLeftContainer}>
                            <TouchableOpacity style={styles.menu} onPress={() => goFeed(props)}>
                                <SvgUri
                                    style={styles.menu_img}
                                    source={require('../assets/feed.svg')}
                                />
                            </TouchableOpacity>
                        </View>,
    headerRight: () => <View style={styles.headerRightContainer}>
                            <TouchableOpacity onPress={()=>goUserProfile(props)}>
                                <SvgUri
                                    style={styles.menu_img}
                                    source={require('../assets/profile.svg')}
                                />
                            </TouchableOpacity>
                        </View>
})
