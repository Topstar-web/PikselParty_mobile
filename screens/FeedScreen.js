import React, { useState ,useRef, useEffect} from 'react';
import { View, RefreshControl, ScrollView,  Image, Text, StyleSheet, TouchableOpacity} from 'react-native';

import * as ImagePicker from 'expo-image-picker';
import AwesomeAlert from 'react-native-awesome-alerts';
import SvgUri from 'react-native-svg-uri';
import Toast from './MyToast';
import { useSelector , useDispatch } from 'react-redux';
import { setUser } from '../store/actions/index'
import { LinearGradient } from 'expo-linear-gradient';
import io from "socket.io-client";
import {
    useFonts,
    Montserrat_600SemiBold,
    Montserrat_700Bold,
    Montserrat_800ExtraBold,
    Montserrat_900Black,
    Montserrat_400Regular
  } from '@expo-google-fonts/montserrat';
  
import {API_URL,SOCKET_URL , default_photo, upload_url, upload_preset, windowWidth} from '../config/config';

let user = null;

const FeedScreen = (props) => {
    user = useSelector((state) => state.user.user);
    const dispatch = useDispatch();
    const [feed , setFeed] = useState([]); //followed user list
    const [loadingAlert,setLoadingAlert] = useState(false);
    const defaultToast = useRef(null);
    const updateToast = useRef(null);
    const [refreshing, setRefreshing] = useState(true);

    let socket = null;

    const [newMsg , setNewMsg] = useState(user.noti_status);

    let [fontsLoaded] = useFonts({
        Montserrat_600SemiBold,
        Montserrat_700Bold,
        Montserrat_800ExtraBold,
        Montserrat_900Black,
        Montserrat_400Regular
    });

    const onRefresh = () => {
        setRefreshing(true);
        loadFollowList();
    }

    const loadFollowList = async () => {
        fetch(`${API_URL}/getUserFollowList`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({email:user.email}),
        })
        .then(async res => { 
            try {
                const jsonRes = await res.json();
                if (res.status !== 200) {
                    console.log(res);
                } else {
                    user.follow_list = jsonRes.data[0].follow_list;
                    dispatch(setUser(user));
                    loadFeedList();
                }
            }
            catch (err) {
                console.log(err);
            };
        })
        .catch(err => {
            console.log(err);
        });
    }

    const loadFeedList = async () => {
        let loadList = [];
        user.follow_list.map((item)=>{
                loadList.push(item.name);
        })

        fetch(`${API_URL}/get_users`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({follow_list:loadList}),
        })
        .then(async res => { 
            try {
                const jsonRes = await res.json();
                if (res.status !== 200) {
                    console.log(res);
                } else {
                    const retData = jsonRes.data;
                    console.log("feedlist")
                    let tmp_list = [];
                    user.follow_list.map((elem)=>{
                        if(elem.type == 0) return;
                        const tmp_item = retData.find(element => element.email == elem.name);
                        let tmp_react_count = [0,0,0,0,0,0,0];
                        tmp_item.reaction.map((item)=>{
                            tmp_react_count[item.type] ++;
                        });
                        let max_react_count = 0;
                        let max_type = 0;
                        tmp_react_count.map((item,key)=>{
                            if(max_react_count < item)
                            {
                                max_react_count = item;
                                max_type = key;
                            }
                        })

                        tmp_list.push({
                            name:tmp_item.name,
                            email:tmp_item.email,
                            photo:tmp_item.photo,
                            is_public:tmp_item.is_public,
                            follow_list:tmp_item.follow_list,
                            block_list:tmp_item.block_list,
                            new:elem.new,
                            reactType:max_type
                        });
                    })
                
                    setFeed(tmp_list);
                    setRefreshing(false);
                }
            } catch (err) {
                console.log(err);
            };
        })
        .catch(err => {
            console.log(err);
        });
    }

    //get followed user list
    useEffect(() => {
        socket = io(SOCKET_URL);
        socket.on("socket_follow_user", msg => {
            console.log("socket on");
            if(msg == user.email)
                setNewMsg(true);
       });
        
       loadFeedList();;

        const unsubscribe = props.navigation.addListener('didFocus', () => {
            setRefreshing(true);
            loadFollowList();
        });
        return () => {
            unsubscribe;
        }
    }, []);

    // on update my photo
    const updateMyPhoto = (secure_url) => {
        const payload = {
            name:user.email,
            url:secure_url
        }
        fetch(`${API_URL}/update_photo`, {
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
                    //reload feed lit
                    user.photo = secure_url;
                    dispatch(setUser(user));
                    loadFollowList();
                    updateToast.current.hideToast(10);
                    defaultToast.current.showToast('Your picture has been updated with success');
                    
                }
            } catch (err) {
                console.log(err);
            };
        })
        .catch(err => {
            console.log(err);
        });
    }

    //open image file
    const pickImage = async () => {
        let result = await ImagePicker.launchImageLibraryAsync({
          mediaTypes: ImagePicker.MediaTypeOptions.Images,
          allowsEditing: true,
          aspect: [4, 5], 
          quality: 1,
          base64:true,
        });
    
        if (!result.cancelled) {
            let base64Img = `data:image/jpg;base64,${result.base64}`
            let data = {
                "file": base64Img,
                "upload_preset": upload_preset,
            }
            
            updateToast.current.showToast("wait...","UPDATING",1000000);
            fetch(upload_url, {
                body: JSON.stringify(data),
                headers: {
                  'content-type': 'application/json'
                },
                method: 'POST',
              }).then(async r => {
                  let data = await r.json();
                  updateMyPhoto(data.secure_url);
            }).catch(err=>console.log(err))
        }
      };

    //render full name to first & last
    const renderName = (name) => {
        const fl_name = name.split(' ');
        const first_name = fl_name[0];
        const last_name = fl_name.length > 1 ? fl_name[1]:'';
        return (
            <View>
                <Text style={styles.first_name}>{first_name}</Text>
                <Text style={styles.last_name}>{last_name}</Text>
            </View>
        )
    }

    //go to profile page
    const selectPerson = (item) => {
        if(item.is_public)
        {
            props.navigation.navigate('Profile', {
                owner: item,
                profile_type : 1
            });
        }
        else{
            // check accepted
            user.follow_list.map((fitem) => {
                if(fitem.name == item.email)
                {
                    props.navigation.navigate('Profile', {
                        owner: item,
                        profile_type : fitem.type
                    });
                }           
            });
        }
    }

    //render each profile
    const renderProfile = (item,key) => {
        let curImgUrl = '';
        switch(item.reactType){
            case 1:
                curImgUrl = require('../assets/reactions/1.png');
                break;
            case 2:
                curImgUrl = require('../assets/reactions/2.png');
                break;
            case 3:
                curImgUrl = require('../assets/reactions/3.png');
                break;
            case 4:
                curImgUrl = require('../assets/reactions/4.png');
                break;
            case 5:
                curImgUrl = require('../assets/reactions/5.png');
                break;
            case 6:
                curImgUrl = require('../assets/reactions/6.png');
                break;
        }
        return(
            <TouchableOpacity key={key} style={key%3==1?styles.gallery_item_middle:styles.gallery_item} onPress={()=>selectPerson(item)}>
                {(item.new && key > 0) && 
                    <LinearGradient
                        start={[0,1]}
                        start={[0,0]}
                        colors={['rgba(255, 204, 77, 1)', 'rgba(242, 20, 73, 0.2)']}
                        style={styles.newPhotoContainer}>
                            <View style={styles.photoBlackOverlay}>
                                <Image style={[styles.photo,{opacity:0.25}]} 
                                    source={{
                                    uri: item.photo==''?default_photo:item.photo
                                    }}>
                                </Image>
                                {item.reactType > 0 && <Image style={styles.emojiImg} source={curImgUrl}></Image>}
                            </View>
                        
                    </LinearGradient>
                }
                {(!item.new || key ==0) && <Image style={styles.photo} 
                    source={{
                    uri: item.photo==''?default_photo:item.photo
                    }}>
                </Image>}
                
                {(item.new && key > 0) && <View style={styles.indicator_new}>
                    <Text style={styles.indicator_new_text}>NEW</Text>
                </View>}
                {key == 0 && <TouchableOpacity style={styles.indicator_update} onPress={pickImage}>
                    <Text style={styles.indicator_update_text}>UPDATE</Text>
                </TouchableOpacity>}
                {renderName(item.name)}
                
            </TouchableOpacity>
            
        )
    };

    const goProfile = () => {
        props.navigation.navigate('Account',{title:user.name});
    }
    
    const goSearch = () => {
        props.navigation.navigate('Search');
    }

    const goNotification = () => {
        setNewMsg(false);
        user.noti_status = false;
        dispatch(setUser(user));
        props.navigation.navigate('Notification');
    }

    return (
        <View style={styles.feedContainer}>
            <View style={styles.header}>
                {fontsLoaded && <Text style={styles.headerTitle}>
                    Mirrer
                </Text>}
                <View style={styles.hrContainer}>
                    
                    <TouchableOpacity style={styles.menu} onPress={()=>goNotification()}>
                        <SvgUri
                            style={styles.menu_img}
                            source={require('../assets/notification.svg')}
                        />
                        {newMsg && <View style={styles.newMsgCircle}>
                            </View>}
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.menu} onPress={()=>goSearch()}>
                        <SvgUri
                            style={styles.menu_img}
                            source={require('../assets/search.svg')}
                        />
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.menu} onPress={()=>goProfile()}>
                        <SvgUri
                            style={styles.menu_img}
                            source={require('../assets/profile.svg')}
                        />
                    </TouchableOpacity>
                </View>
            </View>
            <ScrollView style={styles.scrollContainer} refreshControl = {<RefreshControl refreshing={refreshing} onRefresh={()=>onRefresh()}/>}>
                {fontsLoaded && 
                    <View style={styles.container}>
                        {
                            feed.map((item,key) => 
                                renderProfile(item,key)
                            )
                        }
                        
                    </View> 
                }
                
                <AwesomeAlert
                    show={loadingAlert}
                    showProgress={true}
                    title="Processing"
                    message="Wait a moment..."
                    closeOnTouchOutside={false}
                    closeOnHardwareBackPress={false}
                />
        </ScrollView>
        <Toast ref = {defaultToast} backgroundColor = "#57D172" style={styles.myToast}/>
        <Toast ref = {updateToast} textColor="#000000" backgroundColor = "#E5E5E5" style={styles.myToast}/>
       </View>
    );
};

const styles = StyleSheet.create({
    feedContainer:{
        flex:1,
        paddingTop:25,
        justifyContent:'space-between',
        backgroundColor:'white'
    },
    emojiImg:{
        width:30,
        height:30,
        marginTop:-90
    },
    newMsgCircle:{
        width:6,
        height:6,
        marginTop:6,
        borderRadius:50,
        backgroundColor:'rgba(242, 20, 73, 1)'
    },
    menu_img:{
        width:24,
        height:24,
        justifyContent:'center',
        alignItems:'center'
    },
    header: {
        flexDirection:'row',
        justifyContent:'space-between',
        alignItems:'center',
        width:windowWidth-48,
        marginRight:24,
        height:50,
        marginLeft:24,
    },
    myToast:{
        width:'100%',
        position:'absolute',
        bottom:0,
        backgroundColor:'#57D172'
    },
    container: {
        paddingTop:10,
        paddingLeft:17,
        paddingRight:17,
        backgroundColor:'white',
        marginBottom:50,
        flexDirection:'row',
        flexWrap:'wrap'
    },
    scrollContainer:{
        marginLeft:1,
        flex:1
    },
    menu:{
        height:50,
        marginLeft:24,
        justifyContent:'center',
        alignItems:'center'
    },
    first_name:{
        textAlign:'center',
        fontFamily:'Montserrat_800ExtraBold',
        lineHeight:18,
    },
    last_name:{
        textAlign:'center',
        lineHeight:15,
        fontFamily:'Montserrat_400Regular'
    },
    indicator_update:{
        width:"100%",
        height:40,
        marginTop:-40,
        backgroundColor:'rgba(255, 255, 255, 0.5)',
        justifyContent:'center',
        alignItems:'center'
    },
    indicator_new:{
        // width:"100%",
        height:40,
        marginTop:-40,
        backgroundColor:'rgba(0,0,0,0)',
        justifyContent:'center',
        alignItems:'center'
    },
    indicator_update_text:{
        color:'black',
        fontFamily:'Montserrat_700Bold',
    },
    indicator_new_text:{
        color:'rgba(255, 204, 77, 1)',
        fontFamily:'Montserrat_900Black',
        fontSize:13
    },
    photo:{
        width:'100%',
        height:'100%',
        // resizeMode:'stretch'
    },
    photoBlackOverlay:{
        width:'100%',
        height:'100%',
        backgroundColor:'rgba(0, 0, 0, 1)',
        alignItems:'center'
    },
    newPhotoContainer:{
        width:'100%',
        padding:3,
        alignItems:'center',
        justifyContent:'center'
    },
    gallery_item:{
        width:"30%",
        height:164,
        marginTop:-10
    },
    gallery_item_middle:{
        width:"30%",
        marginLeft:'5%',
        marginRight:'5%',
        height:164,
        marginTop:76
    },
    hrContainer:{
        flexDirection:'row',
        alignItems:'center'
    },
    headerTitle:{
        fontFamily:'Montserrat_800ExtraBold',
        fontSize:20,
        lineHeight:24,
        color:'black'
    }
});

export default FeedScreen;
