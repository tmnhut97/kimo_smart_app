import React, {useEffect, useState} from 'react';
import {
    Text,
    View,
    StyleSheet,
    Animated,
    Dimensions,
    TouchableOpacity,
    PanResponder,
    Easing, Image,
} from 'react-native';

const {width} = Dimensions.get('screen');
import {useNavigation} from '@react-navigation/native';
import useAnimatedCallback from '../../animated/useAnimatedCallback';
import {getItemLocalStore, removeAccents} from '../../mFun';
import {useSelector} from 'react-redux';
import {NeuButton} from '../NeuView';

const Profile = () => {
    const LG = useSelector((state) => state.languages.language);
    const theme = useSelector((state) => state.themes.theme);
    const styles = style(theme);
    const navigation = useNavigation();
    const ani = useAnimatedCallback({value: -width + 90, listTo: [0, -width + 90], duration: 200});
    const bottom = ani.value;
    const [aniStart, aniStop] = ani.animates;
    useEffect(() => {
        aniStart.start();
    }, []);
    const Out = () => {
        aniStop.start(() => navigation.goBack());
        return true;
    };
    const panResponder = React.useRef(
        PanResponder.create({
            onMoveShouldSetPanResponder: (evt, {dx, dy}) => (-1 < dx < 1 && -1 < dx < 1),
            onPanResponderMove: (evt, {dy}) => {
                if (dy >= 0) {
                    Animated.timing(bottom, {
                        toValue: -dy,
                        duration: 0,
                        easing: Easing.linear,
                        useNativeDriver: false,
                    }).start();
                }
            },
            onPanResponderRelease: (evt, {dy}) => {
                if (dy >= 60) {
                    Out();
                } else {
                    Animated.timing(bottom, {
                        toValue: 0,
                        duration: 300,
                        easing: Easing.linear,
                        useNativeDriver: false,
                    }).start();
                }
            },
        }),
    ).current;
    const [name, setName] = useState('');
    const [phone, setPhone] = useState('');
    useEffect(() => {
        getItemLocalStore('user').then((user) => {
            if (!user) {
                return;
            }
            setName(user.fullname);
            setPhone(user.account);
            console.log(user)
        }).catch((e) => console.log(e));
    });
    return (
        <>
            <TouchableOpacity
                activeOpacity={0.5}
                onPress={Out}
                style={{
                    flex: 1, opacity: 0.2,
                    backgroundColor: '#000',
                }}
            >
            </TouchableOpacity>
            <Animated.View
                {...panResponder.panHandlers}
                style={[styles.frameMenuBar, {bottom}]}>
                <View  {...panResponder.panHandlers} style={styles.contentModal}>
                    <View style={[{
                        paddingTop: 10,
                        paddingBottom: 15,
                        width: '100%',
                        justifyContent: 'center',
                        flexDirection: 'row',
                        backgroundColor: 'transparent',
                    }]}>
                        <NeuButton
                            animatedDisabled={true}
                            active={true}
                            color={theme.newButton}
                            width={70} height={5}
                            borderRadius={20}
                        />
                    </View>
                    <TouchableOpacity style={{paddingTop: 20}}>
                        <Image style={{height: 100, width: 100}} source={require('../../assets/Avatar.png')}/>
                    </TouchableOpacity>
                    <Text style={{
                        marginTop: 20,
                        color: theme.color,
                        fontSize: 16,
                        fontWeight: '700',
                    }}>
                        {LG.nameLanguage === 'VN' ? name : removeAccents(name)} !
                    </Text>
                    <View style={{width: '100%', paddingHorizontal: 25, marginTop: 15}}>
                        <Text>email: {phone}</Text>
                        <Text>Số điện thoại: {phone}</Text>
                    </View>
                </View>
            </Animated.View>
        </>

    );
};

const style = (setTheme) => {
    const {color, backgroundColor, button} = setTheme;
    return StyleSheet.create({
        frameMenuBar: {
            position: 'absolute',
            maxHeight: 620,
            width: width - 30,
            borderTopLeftRadius: 5,
            borderTopRightRadius: 5,
            margin: 15,
            zIndex: 100,
        },
        contentModal: {
            width: '100%',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
            borderWidth: 5,
            borderColor: button,
            backgroundColor,
            borderRadius: 10,
            paddingVertical: 15,
        },
    });
};
export default Profile;
