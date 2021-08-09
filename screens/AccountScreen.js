import React, { useState , useEffect} from 'react';
import { View,  Image, Text, StyleSheet, TouchableOpacity} from 'react-native';

import AsyncStorage from '@react-native-async-storage/async-storage';
import { NavigationActions, StackActions } from 'react-navigation';

import {
    useFonts,
    Montserrat_600SemiBold,
    Montserrat_700Bold,
    Montserrat_800ExtraBold,
    Montserrat_400Regular
  } from '@expo-google-fonts/montserrat';

import {API_URL, STORAGE_KEY} from '../config/config';


const AccountScreen = (props) => {
    const user = props.navigation.state.params.user; //current user
    let [fontsLoaded] = useFonts({
        Montserrat_600SemiBold,
        Montserrat_700Bold,
        Montserrat_800ExtraBold,
        Montserrat_400Regular
    });
    //get Profile Data
    useEffect(() => {

    }, []);

    const onLogout = async () => {
        try {
          await AsyncStorage.removeItem(
            STORAGE_KEY
          );

            const resetAction = StackActions.reset({
                index: 0,
                actions: [NavigationActions.navigate({ routeName: 'Auth' })],
            });

            props.navigation.dispatch(resetAction); 

        } catch (error) {
          // Error saving data
        }
    };

    return (
        <View style={styles.container}>
            <TouchableOpacity style={styles.logoutContainer} onPress={onLogout}>
                <Text style={styles.logoutText}>LOGOUT</Text>
            </TouchableOpacity>
       </View>
    );
};

const styles = StyleSheet.create({
    logoutContainer:{
        position:'absolute',
        bottom: 15,
        marginHorizontal:15,
        width:'100%',
        height:54,
        backgroundColor:'white',
        justifyContent:'center',
        alignItems:'center',
    },
    logoutText:{
       fontSize:16,
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
    }
});

export default AccountScreen;