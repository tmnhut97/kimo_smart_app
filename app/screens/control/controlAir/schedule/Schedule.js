import React, {useEffect, useState} from 'react';
import {
    Text,
    View,
    StyleSheet,
    SectionList,
    TouchableOpacity,
    Animated,
    Dimensions, BackHandler, ActivityIndicator,
} from 'react-native';
import FontAwesome5 from 'react-native-vector-icons/FontAwesome5';
import ItemSchedule from './ItemSchedule';
import ModalSchedule from './ModalSchedule';
import {useDispatch, useSelector} from 'react-redux';
import {deleteFileFs, isJsonString, readFileFs, WriteFileFs} from '../../../../mFun';
import {fileSave, getFile, wsListenerMessage, wsRemoveListenerMessage} from "../../../../Socket";
import {useNavigation} from '@react-navigation/native'
import {NeuButton} from '../../../NeuView';
import useAnimatedCallback from "../../../../animated/useAnimatedCallback";
import {setToast} from "../../../../redux/reducer/toastReducer";
import Icon from 'react-native-vector-icons/dist/FontAwesome5';
const dayTitle = {
    mo: 'monday',
    tu: 'tuesday',
    we: 'wednesday',
    th: 'thursday',
    fr: 'friday',
    sa: 'saturday',
    su: 'sunday'
}
const files = [
    "mo.json",
    "tu.json",
    "we.json",
    "th.json",
    "fr.json",
    "sa.json",
    "su.json"
]
const {width} = Dimensions.get('screen')
const Schedule = () => {
    const dispatch = useDispatch()
    const navigation = useNavigation()
    const LG = useSelector((state) => state.languages.language)
    const theme = useSelector((state) => state.themes.theme)
    const styles = style(theme)
    const devId = useSelector(state => state.devices.idCurrent)
    const [processFile, setProcessFile] = useState(null);
    const [fCurrent, setFCurrent] = useState(null);
    const ani = useAnimatedCallback({value: width, listTo: [0, width], duration: 300});
    const left = ani.value;
    const [animStart, animStop] = ani.animates;
    useEffect(() => {
        animStart.start();
    }, []);
    const Out = () => {
        animStop.start(() => navigation.navigate('ControlAir'))
        return true
    }
    useEffect(() => {
        BackHandler.addEventListener('hardwareBackPress', Out);
        return () =>
            BackHandler.removeEventListener('hardwareBackPress', Out);
    }, []);
    const [action, setAction] = useState(null);
    const [ otherParams, setOtherParams] = useState([])
    const [ data, setData] = useState([
        { title: 'mo', data: [] },
        { title: 'tu', data: [] },
        { title: 'we', data: [] },
        { title: 'th', data: [] },
        { title: 'fr', data: [] },
        { title: 'sa', data: [] },
        { title: 'su', data: [] }
    ])
    const lisSaveFileSchedule = (evt) => {
        if (!isJsonString(evt.data)) return;
        const { cmd, devid, type, res, fname, ftype, data:info, msg } = JSON.parse(evt.data)   // userid,
        if (
            cmd==="res" &&
            res==='fget' &&
            devid===devId &&
            type==="ACC" &&
            ftype==='t' &&
            files.includes(fname) &&
            msg==='OK'
        ){
            if (!info) return ;
            let { rg, th, tl } = info
            const dCover = rg.map( ({ on, of, te}) => ({ alon: on, aloff: of, temp: te, on: true }))
            const cd = [...data]
            const d = cd.map( (e) => {
                if (fname.startsWith(e.title)) e.data = dCover
                return {...e}
            })
            setData(d)
            const findIndex = files.findIndex( (n) => n === fname)
            if (findIndex < (files.length-1)) setFCurrent(files[findIndex + 1])
            else setFCurrent(null)
            setOtherParams({ th, tl })
        }
        if (
            cmd==="res" &&
            res==='fsave' &&
            devid===devId &&
            type==="ACC"
        ){
            if ( msg==='OK') {
                const findIndex = files.findIndex( (n) => './'+n === fname)
                if (findIndex < (files.length-1)) setProcessFile((findIndex+1)+'/'+files.length + '..')
                else {
                    setProcessFile(null)
                    dispatch(setToast({ show: "SUCCESS", data:LG.success}))
                }
            } else {
                setProcessFile(null)
                dispatch(setToast({ show: "ERROR", data:LG.error}))
            }
        }
    }
    useEffect( () => {
        const filename = "scheduledevid" + devId + ".json"
        readFileFs(filename).then( r => {
            if (!r) return setFCurrent(files[0])
            const { data, otherParams } = r
            if (!data || !otherParams ) {
                deleteFileFs(filename).then( () => setFCurrent(files[0]))
            }
            setData(data)
            setOtherParams(otherParams )
        })
        wsListenerMessage(lisSaveFileSchedule)
        return () => { wsRemoveListenerMessage(lisSaveFileSchedule) }
    }, [])
    useEffect( () => {
        if (fCurrent === null) return setProcessFile(null);
        getFile(devId, fCurrent)
    }, [fCurrent])
    const save = () => {
        if (fCurrent !== null) return ;
        setProcessFile('Đang cập nhật ...')
        const filename = "scheduledevid" + devId + ".json"
        const dFile = { data,  otherParams }
        let schedule = {};
        data.forEach( e => {
            schedule[e.title] = e.data
                .filter( ({on}) => on)
                .map(({ alon, aloff, temp}) => ({ on:alon, of:aloff, te:temp}))
        })
        deleteFileFs(filename).then(r => {
            WriteFileFs(filename, dFile )
                .then( () => {
                    Object.keys(schedule).forEach( (key) => {
                        const d = {rg: schedule[key], ...otherParams}
                        fileSave(devId, key+'.json', d )
                    })
                })
                .catch( e => dispatch(setToast({ show: "ERROR", data:'Lỗi'})))
        }).catch( (e) => {
            console.log(e)
        })
    }
    return (
        <Animated.View style={[styles.frameSchedule, {left}]}>
            {
                (processFile!==null) && (
                    <View style={{
                        position: 'absolute',
                        width: '100%',
                        height: "100%",
                        backgroundColor: '#edf3f8',
                        opacity: 0.7,
                        justifyContent: 'center',
                        alignItems: 'center',
                        zIndex: 100
                    }}>
                        <ActivityIndicator size="large" color="blue"/>
                        <Text style={{fontFamily: 'Digital-7', fontSize: 20, margin: 15, color: 'blue'}}>{LG.success} {processFile}</Text>
                    </View>
                )
            }
            <View style={styles.header}>
                <NeuButton
                    onPress={Out}
                    color={theme.newButton}
                    width={45} height={45}
                    borderRadius={22.5}
                >
                    <Icon name={'arrow-left'} size={20} color={theme.color}/>
                </NeuButton>
                <Text style={styles.title}>{LG.schedule}</Text>
                <NeuButton
                    onPress={save}
                    color={theme.newButton}
                    width={45} height={45}
                    borderRadius={22.5}
                >
                    <Icon name={'check'} size={20} color={theme.color}/>
                </NeuButton>
            </View>
            <SectionList
                showsVerticalScrollIndicator={false}
                sections={data}
                stickySectionHeadersEnabled={true}
                keyExtractor={(item, index) => item + index}
                renderItem={({item, index, section}) =>
                    <ItemSchedule
                        setAction={(d) => setAction(d)}
                        setData={ (n) => {
                            let temp = data.map( e => {
                                if (e.title === n.title) e.data = n.data
                                return e
                            })
                            setData(temp)
                        }}
                        item={item} index={index}
                        section={section}/>
                }
                renderSectionHeader={({section}) => {
                    return(
                        <View style={{
                            width: '100%',
                            flexDirection: 'row',
                            justifyContent: 'space-between',
                            paddingHorizontal: 20,
                            paddingVertical: 15,
                            alignItems: 'center',
                            backgroundColor: theme.schedule.sectionHeader,
                            marginBottom:5
                        }}>
                            <Text style={styles.titleDayOfWeek}>{LG[dayTitle[section.title]]}</Text>
                            <TouchableOpacity
                                onPress={() => {
                                    setAction({ type: 'add', data: section })
                                }}
                                style={{right:10}}
                            >
                                <FontAwesome5 name={'plus'} size={25} color={'#0499ff'}/>
                            </TouchableOpacity>
                        </View>
                    )
                }}
            />
            {
                action &&
                <ModalSchedule
                    LG={LG}
                    setData={ (n) => {
                        let temp = data.map( e => {
                            if (e.title === n.title) e.data = n.data
                            return e
                        })
                        setData(temp)
                    }}
                    action={action}
                    close={ () => {
                        setAction(null)
                    }}
                />
            }
        </Animated.View>
    );
};

const style = (setTheme) => {
    const {color, backgroundColor, button, input} = setTheme
    return StyleSheet.create({
        frameSchedule: {
            backgroundColor,
            flex: 1,
        },
        header: {
            flexDirection: 'row',
            paddingTop: 25,
            paddingBottom: 10,
            justifyContent: 'space-between',
            alignItems: 'center',
            paddingHorizontal: 20,
            marginBottom:5,
        },
        title: {
            fontSize: 26,
            color,
            fontWeight:'700'
        },
        titleDayOfWeek: {
            fontSize: 30,
            color,
            fontWeight: 'bold'
        },
    });
}
export default Schedule;
