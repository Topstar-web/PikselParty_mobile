import React, { useState ,useRef, useEffect} from 'react';
import { View, RefreshControl, ScrollView,  Image, Text, StyleSheet, TouchableOpacity} from 'react-native';

import * as ImagePicker from 'expo-image-picker';
import AwesomeAlert from 'react-native-awesome-alerts';
import SvgUri from 'react-native-svg-uri';
import Toast from './MyToast';

import {
    useFonts,
    Montserrat_600SemiBold,
    Montserrat_700Bold,
    Montserrat_800ExtraBold,
    Montserrat_400Regular
  } from '@expo-google-fonts/montserrat';
  
import {API_URL , default_photo, upload_url, upload_preset} from '../config/config';

let user = null;

const FeedScreen = (props) => {
    user = props.navigation.state.params.user; //current user
    
    const [feed , setFeed] = useState([]); //followed user list
    const [loadingAlert,setLoadingAlert] = useState(false);
    const defaultToast = useRef(null);
    const updateToast = useRef(null);
    const [refreshing, setRefreshing] = useState(false);
    let [fontsLoaded] = useFonts({
        Montserrat_600SemiBold,
        Montserrat_700Bold,
        Montserrat_800ExtraBold,
        Montserrat_400Regular
    });

    const onRefresh = () => {
        setRefreshing(true);
        loadFeedList();
    }

    const loadFeedList = async () => {
        fetch(`${API_URL}/get_users`, {
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
                    setFeed(jsonRes.feed_list);
                    user = jsonRes.user;
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
    
    
    const unsubscribe = props.navigation.addListener('didFocus', () => {
        // loadFeedList();
        unsubscribe;
    });
    
    //get followed user list
    useEffect(() => {
        loadFeedList();
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
                    loadFeedList();
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
        props.navigation.navigate('Profile', {
            owner: item,
            user:user,
            type:1
        });
    }

    //render each profile
    const renderProfile = (item,key) => {
        return(
            <TouchableOpacity key={key} style={key%3==1?styles.gallery_item_middle:styles.gallery_item} onPress={()=>selectPerson(item)}>
                
                <Image style={styles.photo} 
                    source={{
                    uri: item.photo==''?default_photo:item.photo
                    }}>
                </Image>
                {(item.new && key > 0) && <View style={styles.indicator_new}>
                    <Text style={styles.indicator_new_text}>NEW</Text>
                </View>}
                {key == 0 && <TouchableOpacity style={styles.indicator_update} onPress={pickImage}>
                    <Text style={styles.indicator_update_text}>UPDATE</Text>
                </TouchableOpacity>}
                {renderName(item.name)}
                
            </TouchableOpacity>
            
        )
    }

    return (
        <View style={styles.feedContainer}>
            <ScrollView refreshControl = {<RefreshControl refreshing={refreshing} onRefresh={()=>onRefresh()}/>}>
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
        height:'100%',
        backgroundColor:'white'
    },
    menu:{
        height:70,
        justifyContent:'center',
        alignItems:'flex-end'
    },
    menu_img:{
        width:24,
        height:24,
        marginRight:17,
        justifyContent:'center',
        alignItems:'center'
    },
    header: {
        width:'100%',
        height:70,
        paddingHorizontal:17
    },
    myToast:{
        width:'100%',
        position:'absolute',
        bottom:0,
        backgroundColor:'#57D172'
    },
    container: {
        paddingTop:25,
        width: '100%', 
        display: "flex", 
        flexDirection: "row", 
        flexWrap: "wrap",
        paddingLeft:17,
        paddingRight:17,
        backgroundColor:'white',
        fontFamily:'Montserrat',
        fontStyle:'normal',
        marginBottom:50
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
        backgroundColor:'#DD2E44',
        justifyContent:'center',
        alignItems:'center'
    },
    indicator_update_text:{
        color:'black',
        fontFamily:'Montserrat_700Bold',
    },
    indicator_new_text:{
        color:'white',
        fontFamily:'Montserrat_700Bold',
        fontSize:13
    },
    photo:{
        width:'100%',
        height:164,
        // resizeMode:'stretch'
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
        flexDirection:'row'
    }
});

export default FeedScreen;

const goProfile = (screenProps) => {
    screenProps.navigation.navigate('Account', {
        user: user
    });
}

const goSearch = (screenProps) => {
    screenProps.navigation.navigate('Search', {
        user: user
    });
}

FeedScreen['navigationOptions'] = props => ({
    headerRight: () => <View style={styles.hrContainer}>
                            <TouchableOpacity onPress={()=>goSearch(props)}>
                                <SvgUri
                                    style={styles.menu_img}
                                    source={require('../assets/search.svg')}
                                />
                            </TouchableOpacity>
                            <TouchableOpacity onPress={()=>goProfile(props)}>
                                <SvgUri
                                    style={styles.menu_img}
                                    source={require('../assets/profile.svg')}
                                />
                            </TouchableOpacity>
                        </View>
})