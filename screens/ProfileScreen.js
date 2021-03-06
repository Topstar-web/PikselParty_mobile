import React, { useState , useRef,useEffect} from 'react';
import { View, Image, Text, RefreshControl, StyleSheet, TouchableOpacity, ScrollView} from 'react-native';
import {SingleImage} from "rn-instagram-image";
import AwesomeAlert from 'react-native-awesome-alerts';
import SvgUri from 'react-native-svg-uri';
import SwipeDownModal from 'react-native-swipe-down';
import Toast from './MyToast';

import { useSelector , useDispatch } from 'react-redux';
import { setUser } from '../store/actions/index';
import io from "socket.io-client";
import {
    useFonts,
    Montserrat_600SemiBold,
    Montserrat_700Bold,
    Montserrat_800ExtraBold, 
    Montserrat_400Regular
  } from '@expo-google-fonts/montserrat';

import {API_URL, SOCKET_URL,default_photo, windowHeight, windowWidth} from '../config/config';

const ProfileScreen = (props) => {
    let user = useSelector((state) => state.user.user);
    const dispatch = useDispatch();
    
    let owner = props.navigation.state.params.owner; //profile owner

    const defaultToast = useRef(null);
    const [showModal,setShowModal] = useState(false);

    const [refreshing, setRefreshing] = useState(true);

    const [loadingAlert,setLoadingAlert] = useState(false);

    const [fStatus,setFStatus] = useState(false);

    const [ptype,setPtype] = useState(props.navigation.state.params.profile_type);

    const [acceptStatus,setAcceptStatus] = useState(false);

    let socket = null;

    const [flagStatus,setFlagStatus] = useState({
        fUser:0,
        fCont:0,
        fBlock:0
    })

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
        setFollowFlow(user.follow_list);
    }, []);

    const onRefresh = () => {
        setRefreshing(true);
        loadFollowList();
    }

    const setFollowFlow = (f_list) => {
        setFStatus(false);
        setPtype(owner.is_public);
        f_list.map((item) => {
            if(item.name == owner.email)
            {
                console.log("flow match");
                setFStatus(true);
                setPtype(item.type);
                
                if(item.new)
                {
                    item.new = false;
                    removeNewStatus()
                }
                return;
            }           
        });
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
                    setFollowFlow(jsonRes.data[0].follow_list);
                    getReaction();
                }
            }
            catch (err) {
                console.log(err);
            }
        })
        .catch(err => {
            console.log(err);
        });
    }

    // set new status false
    const removeNewStatus = () => {
        fetch(`${API_URL}/removeNewStatus`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({email:user.email,follower:owner.email}),
        })
        .then(async res => { 
            try {
                const jsonRes = await res.json();
                if (res.status !== 200) {
                } else {
                }
                
            } catch (err) {
                console.log(err);
            };
        })
        .catch(err => {
            console.log(err);
        });
    }

    const getReaction = () => {
        
        fetch(`${API_URL}/getReaction`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({email:owner.email,action_email:user.email}),
        })
        .then(async res => { 
            try {
                const jsonRes = await res.json();
                if (res.status !== 200) {
                } else {
                    const reactionList = jsonRes.data;
                    flagStatus.fUser = jsonRes.fUser;
                    flagStatus.fCont = jsonRes.fCont;
                    for (let index = 1; index < 7; index++) {
                        rCnt[index] = 0;
                    }
                    reactionList.map((item)=>{
                        rCnt[item.type] = rCnt[item.type] + 1;
                    });
                    setValue(value + 1);
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

    //render full name to first & last in swipe modal
    const renderName_modal = (name) => {
        const fl_name = name.split(' ');
        const first_name = fl_name[0];
        const last_name = fl_name.length > 1 ? fl_name[1]:'';
        return (
            <TouchableOpacity activeOpacity={1} style={[styles.nameContainer,{marginTop:27}]}>
                {fontsLoaded && <Text><Text style={styles.first_name_modal}>{first_name} </Text><Text style={styles.last_name_modal}>{last_name}</Text></Text>}
            </TouchableOpacity>
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
    const addReaction = async (type) => {
        if(owner.email == user.email)
        {
            if(rCnt[type] == 0) return;
            
            goReactionHistory(type);
            return;
        }

        const payload ={
            type:type,
            email:owner.email,
            react_email:user.email
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
    };

    const goBack = () => {
        props.navigation.navigate('Feed');
    };
    
    const goUserProfile = () => {
        props.navigation.navigate('Account', {
            title: user.name
        });
    };

    const addFollow = () => {
        fetch(`${API_URL}/addFollowUser`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                email:user.email,
                add_email:owner.email,
                name:user.name,
                add_type:owner.is_public
            }),
        })
        .then(async res => { 
            try {
                const jsonRes = await res.json();
                if (res.status !== 200) {
                } else {
                    setShowModal(false);
                    user.follow_list.push({name:owner.email,new:false,fdate:new Date(),type:owner.is_public?1:0});

                    dispatch(setUser(user));
                    setFStatus(true);

                    //send notification socket
                    socket = io(SOCKET_URL);
                    socket.emit('socket_follow_user',owner.email);
                    
                    if(owner.is_public)
                        defaultToast.current.showToast('You have followed '+owner.name);
                    else 
                        defaultToast.current.showToast('You have sent request to '+owner.name);
                }
            } catch (err) {
                console.log(err);
            };
        })
        .catch(err => {
            console.log(err);
        });
    }
    
    const removeFollow = () => {

        fetch(`${API_URL}/removeFollowUser`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                email:user.email,
                remove_email:owner.email
            }),
        })
        .then(async res => { 
            try {
                const jsonRes = await res.json();
                if (res.status !== 200) {
                } else {
                    setShowModal(false);
                    defaultToast.current.showToast('You have unfollowed '+owner.name);
                    const tIndex = user.follow_list.findIndex(element => element.name == owner.email);
                    user.follow_list.splice(tIndex,1);
                    dispatch(setUser(user));
                    setFStatus(false);

                    setTimeout(() => {
                        goBack();
                    }, 1500);  
                }
            } catch (err) {
                console.log(err);
            };
        })
        .catch(err => {
            console.log(err);
        });
    };

    const blockUser = () => {
        fetch(`${API_URL}/blockUser`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                email:user.email,
                blocked_email:owner.email,
                fStatus:fStatus
            }),
        })
        .then(async res => { 
            try {
                const jsonRes = await res.json();
                if (res.status !== 200) {
                } else {
                    
                    setShowModal(false);
                    user.block_list.push(owner.email);
                    dispatch(setUser(user));
                    flagStatus.fBlock = 1;
                    defaultToast.current.showToast('You have Blocked '+owner.name);
                    setFStatus(false);
                    setTimeout(() => {
                        goBack();
                    }, 1500);  
                }
            } catch (err) {
                console.log(err);
            };
        })
        .catch(err => {
            console.log(err);
        });
    };

    const flagUser = () => {
        fetch(`${API_URL}/flagUser`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                email:owner.email,
                action_email:user.email,
                flag_type:1
            }),
        })
        .then(async res => { 
            try {
                const jsonRes = await res.json();
                if (res.status !== 200) {
                } else {
                    flagStatus.flagUser = 1;
                    setShowModal(false);
                    defaultToast.current.showToast('You have Flagged '+owner.name);
                    setTimeout(() => {
                        goBack();
                    }, 1500);  
                    // setFStatus(false);
                }
            } catch (err) {
                console.log(err);
            };
        })
        .catch(err => {
            console.log(err);
        });
    };

    const flagContent = () => {
        fetch(`${API_URL}/flagUser`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                email:owner.email,
                action_email:user.email,
                flag_type:2
            }),
        })
        .then(async res => { 
            try {
                const jsonRes = await res.json();
                if (res.status !== 200) {
                } else {
                    flagStatus.flagContent = 1;
                    setShowModal(false);
                    defaultToast.current.showToast('You have Flagged '+owner.name+'\'s content');
                    setTimeout(() => {
                        goBack();
                    }, 1500);  
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
        <ScrollView style={styles.container} refreshControl = {<RefreshControl refreshing={refreshing} onRefresh={()=>onRefresh()}/>}>
            <View style={styles.header}>
                <TouchableOpacity style={styles.menu} onPress={() => goBack()}>
                    <SvgUri
                        style={styles.menu_img}
                        source={require('../assets/feed.svg')}
                    />
                </TouchableOpacity>
                    {user.email == owner.email && <TouchableOpacity style={styles.menu} onPress={() => goUserProfile()}>
                    <SvgUri
                        style={styles.menu_img}
                        source={require('../assets/menu.svg')}
                    />
                </TouchableOpacity>}
                {user.email != owner.email && <TouchableOpacity style={styles.menu} onPress={() => setShowModal(true)}>
                    <SvgUri
                        style={styles.menu_img}
                        source={require('../assets/menu2.svg')}
                    />
                </TouchableOpacity>}
            </View>
            {renderName(owner.name)}
            <View style={styles.photoContainer}>
                    {ptype == 1 && <SingleImage imageSource={{uri: owner.photo==''?default_photo:owner.photo}}></SingleImage>}
                    {ptype == 0 && <Image style={[styles.photo,{opacity:0.05}]} source ={{uri: owner.photo==''?default_photo:owner.photo}}/>}
                    {/* <ImageViewer style={styles.photo} imageUrls={[{url:owner.photo==''?default_photo:owner.photo}]}/> */}
                    {ptype == 0 && <Text style={styles.blockedText}>THIS PROFILE IS PRIVATE</Text>}
            </View>
            {ptype == 1 && <View style={styles.reactContainer}>
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
            }
            {ptype == 0 && <View style={styles.buttonContainer}>
                {fStatus && <View style={styles.followButton_sr}>
                    <Text style={styles.followButtonText_sr}>SENT REQUEST...</Text>
                </View>}
                {!fStatus && <TouchableOpacity style={styles.followButton} onPress={()=>fStatus?removeFollow():addFollow()}>
                    <Text style={styles.followButtonText}>Follow</Text>
                </TouchableOpacity>}
            </View>}
            <SwipeDownModal
                modalVisible={showModal}
                //if you don't pass HeaderContent you should pass marginTop in view of ContentModel to Make modal swipeable
                ContentModal={
                    <View style={styles.containerContent}>
                        <TouchableOpacity activeOpacity={1}  style={styles.swipeHandler}></TouchableOpacity>
                        {renderName_modal(owner.name)}
                        <View style={styles.swipeModalList}>
                            {fStatus && <TouchableOpacity style={styles.swipeModalItem} onPress={()=>removeFollow()}>
                                <Text style={styles.ModalItemText_grey}>Unfollow</Text>
                            </TouchableOpacity>}
                            {!fStatus && <TouchableOpacity style={styles.swipeModalItem} onPress={()=>addFollow()}>
                                <Text style={styles.ModalItemText}>Follow</Text>
                            </TouchableOpacity>}
                            {flagStatus.fBlock == 0 && <TouchableOpacity style={styles.swipeModalItem} onPress={()=>blockUser()}>
                                <Text style={styles.ModalItemText_black}>Block user</Text>
                            </TouchableOpacity>}
                            {flagStatus.fUser == 0 && <TouchableOpacity style={styles.swipeModalItem} onPress={()=>flagUser()}>
                                <Text style={styles.ModalItemText_black}>Flag user</Text>
                            </TouchableOpacity>}
                            {flagStatus.fCont == 0 && <TouchableOpacity style={styles.swipeModalItem} onPress={()=>flagContent()}>
                                <Text style={styles.ModalItemText_black}>Flag content</Text>
                            </TouchableOpacity>}
                        </View>
                        
                    </View>
                }
                ContentModalStyle={styles.Modal}
                onRequestClose={() => {setShowModal(false)}}
                onClose={() => {
                    setShowModal(false);
                }}
                />
            <Toast ref = {defaultToast} backgroundColor = "#57D172" style={styles.myToast}/>
            <AwesomeAlert
                show={loadingAlert}
                showProgress={true}
                title="Processing"
                message="Wait a moment..."
                closeOnTouchOutside={false}
                closeOnHardwareBackPress={false}
            />
       </ScrollView>
    );
};

const styles = StyleSheet.create({
    blockedText:{
        fontSize:16,
        fontFamily:'Montserrat_700Bold',
        position:'absolute',
    },
    buttonContainer:{
        width:windowWidth,
        alignItems:'center',
        justifyContent:'center',
        flex:1
    },
    followButtonText:{
        color:'white',
        fontSize:18,
        fontFamily:'Montserrat_700Bold'
    },
    followButton:{
        alignItems:'center',
        justifyContent:'center',
        backgroundColor:'rgba(221, 46, 68, 1)',
        width:213,
        height:45
    },
    followButtonText_sr:{
        color:'black',
        fontSize:18,
        fontFamily:'Montserrat_700Bold'
    },
    followButton_sr:{
        alignItems:'center',
        justifyContent:'center',
        backgroundColor:'white',
        borderWidth:1,
        borderColor:'rgba(196, 196, 196, 1)',
        width:213,
        height:45
    },
    ModalItemText:{
        color:'rgba(221, 46, 68, 1)',
        fontFamily:'Montserrat_400Regular',
        fontSize:16
    },
    ModalItemText_black:{
        color:'rgba(0,0,0,0.8)',
        fontFamily:'Montserrat_400Regular',
        fontSize:16
    },
    ModalItemText_grey:{
        color:'rgba(82, 82, 82, 1)',
        fontFamily:'Montserrat_700Bold',
        fontSize:16
    },
    swipeModalItem:{
        marginTop:15
    },
    myToast:{
        width:'100%',
        position:'absolute',
        bottom:0,
        backgroundColor:'#57D172'
    },
    swipeModalList:{
        marginTop:15
    },
    swipeHandler:{
        height:0,
        width:66,
        alignSelf:'center',
        borderRadius:24,
        borderBottomColor:'#C4C4C4',
        borderBottomWidth:5
    },
    containerContent: {
        flex: 1, 
        marginTop: 15,
        marginHorizontal: 17
    },
    containerHeader: {
      flex: 1,
      marginTop:windowHeight - 350,
      alignItems: 'center',
      justifyContent: 'center',
      height: 40,
    //   width:66
    },
    headerContent:{
      marginTop: 0,
    },
    Modal: {
      backgroundColor: 'white',
      height:280,
      borderWidth:1,
      borderColor:'rgba(0,0,0,0.2)',
      marginTop:windowHeight - 280,
      borderTopLeftRadius:20,
      borderTopRightRadius:20
    },
    reactContainer:{
        width:'100%',
        marginTop:50,
        flex:1,
        paddingHorizontal:'10%',
        backgroundColor:'white'
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
    first_name_modal:{
        fontSize:16,
        fontFamily:'Montserrat_700Bold',
    },
    last_name_modal:{
        fontSize:16,
        fontFamily:'Montserrat_400Regular'
    },
    container: {
        paddingTop:20,
        display: "flex", 
        flexDirection: "row", 
        flexWrap: "wrap",
        flex:1,
        backgroundColor:'white'
    },
    header: {
        flexDirection:'row',
        justifyContent:'space-between',
        width:windowWidth-48,
        marginRight:24,
        height:50,
        marginLeft:24
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
        height:windowHeight - 300
    },
    photoContainer:{
        width:'100%',
        height:windowHeight - 360,
        marginTop:40,
        alignItems:'center',
        justifyContent:'center'
    }
});

export default ProfileScreen;