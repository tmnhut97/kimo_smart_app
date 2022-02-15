import React, {useEffect, useState} from 'react';
import {Animated, Dimensions, Image, Text, TouchableOpacity, View} from 'react-native';
import {ALBUM, parseDate} from '../../mFun';
import {useNavigation} from '@react-navigation/native';
import CheckBox from '@react-native-community/checkbox';
import useAnimatedShowView from '../../animated/useAnimatedShowView';

const {width} = Dimensions.get('screen');
const ItemImage = ({item, selects, setSelects, theme}) => {
    const navigation = useNavigation();
    const {path} = item;
    const [src, setSrc] = useState(null);
    useEffect(() => {
        ALBUM.readImage(path).then((e) => setSrc('data:image/jpg;base64,' + e));
    }, []);
    const selectMode = selects.mode;
    const select = selects.list.includes(path);
    const onLongPress = () => {
        if (!selectMode) {
            setSelects({mode: true, list: [path]});
        }
    };
    const onPress = () => {
        if (!selectMode) {
            return navigation.navigate('ReviewImage', {path});
        }
        if (selects.list.includes(path)) {
            const list = selects.list.filter(p => p !== path);
            setSelects({...selects, ...{list}});
        } else {
            const list = [...selects.list, path];
            setSelects({...selects, ...{list}});
        }
    };
    const aniSetting = useAnimatedShowView();
    return (
        <TouchableOpacity
            activeOpacity={1}
            onPress={onPress}
            onLongPress={onLongPress}
        >
            <Animated.View
                style={{width: width / 4, height: width / 4, paddingVertical: '10%', paddingHorizontal: 1, ...aniSetting}}>
                {
                    selectMode &&
                    <View style={{position: 'absolute', bottom: 15, right: 5, zIndex: 10}}>
                        <CheckBox
                            color={'#f00'}
                            disabled={true}
                            value={select}
                            tintColors={{true: '#F15927', false: '#fff'}}
                        />
                    </View>
                }
                <Image
                    defaultSource={require('../../assets/images/logo.png')}
                    source={{uri: src}}
                    resizeMode={'cover'}
                    style={{width: '100%', height: '100%'}}
                />
            </Animated.View>
        </TouchableOpacity>
    )
}
export default ItemImage
