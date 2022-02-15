import React from 'react';
import {ActivityIndicator, Text, TouchableOpacity, View, StyleSheet} from 'react-native';
import {useSelector} from 'react-redux';
import {useNavigation} from '@react-navigation/native'
const LoadingData = () => {
    const navigation = useNavigation()
    const LG = useSelector((state) => state.languages.language);
    const theme = useSelector((state) => state.themes.theme);
    const styles = style(theme);
    return (
        <View style={styles.frameLoadingData}>
            <ActivityIndicator size="large" color="green"/>
            <Text style={styles.txtPleaseWait}>{LG.pleaseWait} ...</Text>
            <TouchableOpacity onPress={() => navigation.goBack()}>
                <Text style={{fontFamily: 'Digital-7', fontSize: 20, color: 'blue'}}>{LG.cancel}</Text>
            </TouchableOpacity>
        </View>
    )
}
const style =(setThem) => {
    const  { backgroundColor, color } = setThem
    return  StyleSheet.create({
        frameLoadingData:{
            position: 'absolute',
            width: '100%',
            height: '100%',
            backgroundColor,
            opacity: 0.9,
            justifyContent: 'center',
            alignItems: 'center',
            zIndex: 100,
        },
        txtPleaseWait:{
            fontFamily: 'Digital-7',
            fontSize: 20,
            marginVertical: 40,
            color
        }
    })
}

export default LoadingData
