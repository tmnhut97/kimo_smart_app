// import React, {useEffect, useRef, useState} from "react";
// import {Animated, BackHandler, Dimensions, FlatList, Platform, StyleSheet, Text, View} from "react-native";
// import {NeuButton, NeuView} from "../NeuView";
// import Icon from "react-native-vector-icons/dist/FontAwesome5";
// import {useNavigation} from "@react-navigation/native";
// import {useDispatch, useSelector} from "react-redux";
// import useAnimatedCallback from "../../animated/useAnimatedCallback";
// import {NoDevices} from "../../assets/imageSVG";
// import CheckBox from "@react-native-community/checkbox";
// import { server } from "../../Socket";
// import BackgroundService from "../../BackgroundService";
// import NetInfo from "@react-native-community/netinfo";
// import {getItemLocalStore, LOCATION, setItemLocalStore} from "../../mFun";
// import {setToast} from "../../redux/reducer/toastReducer";
// import Kohana from "../InputCustom/Kohana";
// import MaterialCommunityIcons from "react-native-vector-icons/dist/MaterialCommunityIcons";
//
// const { width} = Dimensions.get('screen')
// const BackgroundControl = () => {
//     const navigation = useNavigation();
//     const dispatch = useDispatch()
//     const LG = useSelector((state) => state.languages.language);
//     const theme = useSelector((state) => state.themes.theme);
//     const styles = style(theme);
//     const ani = useAnimatedCallback({value: width, listTo: [0, width], duration: 300});
//     const left = ani.value;
//     const [animStart, animStop] = ani.animates;
//     useEffect(() => {
//         animStart.start();
//     }, []);
//     const Out = () => {
//         animStop.start(() => navigation.goBack());
//         return true;
//     };
//     useEffect(() => {
//         BackHandler.addEventListener('hardwareBackPress', Out);
//         return () =>
//             BackHandler.removeEventListener('hardwareBackPress', Out);
//     }, []);
//     const devices = useSelector( state => state.devices.list.filter(e => e.status !== 'logout'))
//
//     const [data, setData ] = useState([])
//
//     useEffect( () => {
//         if (Platform.OS === 'ios') {
//             BackgroundService.requestTrackingPermissionIOS().then( (req) => {
//                 if (!req) return navigation.goBack()
//             })
//         }
//
//         BackgroundService.checkPermissionsBackgroundLocation().then( async (e) => {
//             if (e === 'granted') {
//                 getItemLocalStore('bg'+userId).then( (bg) => {
//                     const temp = devices.map( e => ({ ...e, connect: false, disconnect: false, wifiName: '' }))
//                     if (!bg || !bg.length) return setData( temp )
//                     console.log(11114, bg)
//                     const t = temp.map( (m) => {
//                         const f = bg.find(e => (m.id === e.id && m.type === e.type))
//                         if (!f) return m;
//                         return { ...m, ...f}
//                     })
//                     setData(t)
//                 })
//             }
//         })
//     }, [])
//     const wsBg = useRef(null)
//     const watchID = useRef(null)
//     const unsubscribeWifi = useRef(null)
//     const statusAction = useRef({})
//     const userId = useSelector(state => state.userIdCurrent)
//
//     const actionWifi = async (bg) => {
//         statusAction.current = {}
//         if (BackgroundService.isRunning()) {
//             await BackgroundService.stop()
//             if (watchID.current) LOCATION.clearWatch(watchID.current)
//             if (unsubscribeWifi.current) unsubscribeWifi.current
//         }
//         const fun = async (taskDataArguments) => {
//             try {
//                 const sleep = (time) => new Promise((resolve) => setTimeout(() => resolve(), time));
//                 const { action, bg, delay } = taskDataArguments;
//                 const success = async (info) => {
//                     try {
//                         const { latitude, longitude } = info.coords
//                         for (const e of bg) {
//                             const { lconnect, dislconnect, id, type, location } = e
//                             const distant = distance(location.lat, location.lng, latitude,longitude );
//                             console.log(distant)
//                             if (distant <= 15) {
//                                 const actionO = type === "ACC" ? "pon" : "open"
//                                 if (lconnect) action(id, type, actionO)
//                             }
//                             else {
//                                 const actionF = type === "ACC" ? "poff" : "close"
//                                 if (dislconnect) action(id, type, actionF)
//                             }
//                             console.log(distant)
//                         }
//                     }catch (e) {
//                         console.log(e)
//                     }
//                 }
//                 await new Promise( async (resolve) => {
//                     watchID.current = LOCATION.watchPosition(success)
//                     unsubscribeWifi.current = NetInfo.addEventListener( async state => {
//                         const {isConnected, isInternetReachable, type, details} = state
//                         if (isConnected && isInternetReachable) {
//                             console.log(11114, JSON.stringify(details))
//                             if ((type === 'wifi' && !details.ssid) || (type === 'cellular' && !details.cellularGeneration )) {
//                                 // await BackgroundService.updateNotification({
//                                 //     taskTitle: "Bật vị trí để lắng nghe kết nối mạng của bạn",
//                                 //     taskDesc: "Có thể tắt thông báo trong cài đặt thông báo của bạn",
//                                 // })
//                             } else {
//                                 if (type === 'wifi' && details.ssid ){
//                                     console.log(11114, type, details.ssid)
//                                     bg.forEach( e => {
//                                         const { connect, disconnect, id, type, wifiName } = e
//                                         if ([wifiName].includes(details.ssid)) {
//                                             const actionO = type === "ACC" ? "pon" : "open"
//                                             if (connect) action(id, type, actionO)
//                                         } else {
//                                             const actionF = type === "ACC" ? "poff" : "close"
//                                             if (disconnect) action(id, type, actionF)
//                                         }
//                                     })
//                                     // await BackgroundService.updateNotification({
//                                     //     taskTitle: "Lắng nghe kết nối mạng của bạn " + '"'+details.ssid+'"',
//                                     //     taskDesc: "Có thể tắt thông báo trong cài đặt thông báo của bạn",
//                                     // })
//                                 } else {
//                                     console.log(11114, type, details)
//                                     bg.forEach( e => {
//                                         const { disconnect, id, type } = e
//                                         const actionF = type === "ACC" ? "poff" : "close"
//                                         if (disconnect) action(id, type, actionF)
//                                     })
//                                     if (type === 'cellular') {
//                                         // await BackgroundService.updateNotification({
//                                         //     taskTitle: "Lắng nghe kết nối mạng của bạn " + '"'+details.carrier + ' ' + details.cellularGeneration+'"',
//                                         //     taskDesc: "Có thể tắt thông báo trong cài đặt thông báo của bạn",
//                                         // })
//                                     }
//                                 }
//                             }
//
//                         }
//                     })
//                         // for (let i = 0; BackgroundService.isRunning(); i++) {
//                         //     // if (unsubscribeWifi.current) unsubscribeWifi.current;
//                         //     await sleep(delay)
//                         // }
//                 });
//             } catch (e) {
//                 console.log(e)
//             }
//         };
//         BackgroundService.checkPermissionsBackgroundLocation().then( async (e) => {
//                 if (e === 'granted') {
//                     await BackgroundService.start(fun, {
//                         taskName: 'wifi',
//                         taskTitle: LG.taskTitle,
//                         taskDesc: LG.taskDesc,
//                         taskIcon: {
//                             name: 'logo',
//                             type: 'mipmap',
//                         },
//                         color: '#e5d1e5',
//                         linkingURI: null,
//                         parameters: {
//                             delay: 15000,
//                             bg: bg,
//                             action: async (devid, devtype, action) => {
//                                 if (statusAction.current[devid] === action) return;
//                                 if (wsBg.current) {
//                                     wsBg.current.close();
//                                     wsBg.current = null
//                                 }
//                                 const { ip, port , wss, ca } = await server()
//                                 if (!ip || !port) return;
//                                 let h = 'ws://'
//                                 if (wss) h = 'wss://'
//                                 const url = `${h}${ip}:${port}`
//                                 wsBg.current = new WebSocket(url, [], { ca });
//                                 wsBg.current.onopen = () => {
//                                     if (statusAction.current[devid] === action) return;
//                                     if (!wsBg.current) return;
//                                     const readyState = wsBg.current.readyState;
//                                     if (readyState !== 1) return ;
//                                     let cmdSend = {};
//                                     cmdSend.cmd = 'control';
//                                     cmdSend.type = 'CLIENT';
//                                     cmdSend.userid = 0;
//                                     cmdSend.devid = parseInt(devid);
//                                     cmdSend.action = action;
//                                     cmdSend.devtype = devtype;
//                                     if ( devtype === "DOORCAM") wsBg.current.send(JSON.stringify({...cmdSend, ...{ action: 'pause'}}));
//                                     wsBg.current.send(JSON.stringify(cmdSend));
//                                     statusAction.current[devid] = action
//                                     wsBg.current.close();
//                                 }
//                             }
//                         },
//                     })
//                 } else {
//                     dispatch(setToast({ show: 'ERROR', data: LG.pleaseAllowTheAppToUseYourLocation}))
//                     navigation.goBack()
//                 }
//             });
//     }
//     useEffect( () => {
//         if (data.length) return;
//         try {
//             const dw = data.filter( e => ( e.lconnect || e.dislconnect || e.location || e.connect || e.disconnect || e.wifiName.length ))
//                 .map(({ id, name, type, status, location, lconnect, dislconnect, wifiName, connect, disconnect  }) => ({ id, name, type, status, location, lconnect, dislconnect, wifiName, connect, disconnect  }))
//             const d = dw.filter( e => ( e.lconnect || e.dislconnect || e.connect || e.disconnect ))
//             if (!d.length) {
//                 setItemLocalStore('bg'+userId, dw).then(() => {
//                     if (BackgroundService.isRunning()) {
//                         if (unsubscribeWifi.current) unsubscribeWifi.current
//                         BackgroundService.stop()
//                     }
//                 })
//             }else {
//                 setItemLocalStore('bg'+userId, d).then(() => actionWifi(d))
//             }
//         } catch (e) {
//             console.log(e)
//         }
//     }, [data])
//     return (
//         <Animated.View style={[styles.frameTheme, {left}]}>
//             <View style={styles.header}>
//                 <NeuButton
//                     onPress={Out}
//                     color={theme.newButton}
//                     width={45} height={45}
//                     borderRadius={22.5}
//                 >
//                     <Icon name={'arrow-left'} size={20} color={theme.color}/>
//                 </NeuButton>
//                 <Text style={{fontSize: 24,
//                     color: theme.color,
//                     fontWeight: 'bold'}}>{LG.connectWifi}</Text>
//                 <View style={{width:45}}/>
//             </View>
//             <View style={{ flex: 1, marginTop: 20, paddingBottom: 20}}>
//                 <FlatList
//                     ListEmptyComponent={
//                         <View style={{width: '100%', paddingTop: '30%', justifyContent: 'center', alignItems: 'center'}}>
//                             <View style={{marginLeft: 25}}>
//                                 { NoDevices }
//                             </View>
//                             <Text style={{marginVertical: 30, fontSize: 18, color: theme.color}}>{LG.noDevice}</Text>
//                         </View>
//                     }
//                     data={data}
//                     renderItem={({item, index}) =>
//                         <Item
//                             LG={LG}
//                             item={item}
//                             theme={theme}
//                             setDataItem={(d) => {
//                                 let temp = [...data]
//                                 temp[index] = d
//                                 setData(temp)
//                             }}
//                         />
//                     }
//                     keyExtractor={(item, index) => index.toString()}
//                 />
//             </View>
//         </Animated.View>
//     )
// }
//
// const Item = ({ item, theme, LG, setDataItem }) => {
//     const { name, connect, disconnect, wifiName, type } = item
//     const [edit, setEdit ] = useState(false)
//     const [wifi, setWifi ] = useState(wifiName)
//     let title = { on: '', off: ''};
//
//     if (type === "ACC") title = { on: `${LG.openAirConditioner} ${LG.whenConnection}`, off: `${LG.closeAirConditioner} ${LG.whenNotConnection}` }
//     else title = { on: `${LG.openDoor} ${LG.whenConnection}`, off: `${LG.closeDoor} ${LG.whenNotConnection}` }
//     const wifiDisplay = wifiName.length ? wifiName : "wifi " + LG.unknown
//     return (
//         <NeuView
//             animatedDisabled={true}
//             customLightShadow={'#FFFFFF'}
//             customDarkShadow={'#E3E3E3'}
//             borderRadius={10}
//             width={width}
//             height={180}
//             color={theme.itemDevice.backgroundItem}
//             style={{ paddingVertical: 10}}
//         >
//             <View
//                 style={{
//                     height: '100%',
//                     width, backgroundColor: theme.backgroundColor,marginTop: 10,
//                     paddingVertical: 5, paddingHorizontal: 20,
//                     justifyContent: "space-between",
//                 }}
//             >
//
//                 <View style={{
//                     flexDirection: 'row',
//                     alignItems: 'center',
//                     marginTop: 20
//                 }}>
//                     <View style={{
//                         borderTopLeftRadius: 3,
//                         borderBottomLeftRadius: 3,
//                         height: 30,
//                         width: 6,
//                         backgroundColor: theme.color,
//                         marginRight: 10 }}/>
//                     <Text style={{
//                         fontWeight: 'bold',
//                         fontSize: 16,
//                         color: theme.color,
//                     }}>{LG.device}: { name }</Text>
//                 </View>
//
//                 <View style={{ flexDirection: "row", justifyContent: 'space-between', paddingVertical: 10}}>
//                     <Text style={{ fontWeight:'700'}}>Tên wifi: {wifiDisplay}</Text>
//                     {   edit ?
//                         <View style={{ flexDirection: "row", justifyContent: "flex-end", alignItems: "center"}}>
//                             <NeuButton
//                                 onPress={() => {
//                                     setDataItem({...item, ...{ wifiName: wifi}})
//                                     setEdit(false)
//                                 }}
//                                 color={theme.newButton}
//                                 width={30} height={30}
//                                 borderRadius={22.5}
//                                 style={{ marginRight: 20}}
//                             >
//                                 <Icon name={'check'} color={theme.color} size={20}/>
//                             </NeuButton>
//                             <NeuButton
//                                 onPress={() => setEdit(false)}
//                                 color={theme.newButton}
//                                 width={30} height={30}
//                                 borderRadius={22.5}
//                             >
//                                 <Icon name={'times'} color={theme.color} size={20}/>
//                             </NeuButton>
//                         </View> :
//                         <NeuButton
//                             onPress={() => setEdit(true)}
//                             color={theme.newButton}
//                             width={30} height={30}
//                             borderRadius={22.5}
//                         >
//                             <Icon name={'edit'} color={theme.color} size={20}/>
//                         </NeuButton>
//                     }
//                 </View>
//                 {
//                     edit &&
//                     <View style={{ padding: 15 }}>
//                         <NeuButton
//                             active={true}
//                             color={theme.newButton}
//                             width={width - 60} height={55}
//                             borderRadius={15}
//                         >
//                             <Kohana
//                                 style={{
//                                     backgroundColor: theme.newButton,
//                                     width: '100%',
//                                     borderRadius: 15,
//                                 }}
//                                 label={LG.wifiName}
//                                 iconClass={MaterialCommunityIcons}
//                                 iconName={'wifi'}
//                                 iconColor={theme.iconInput}
//                                 labelStyle={{color: theme.iconInput, fontWeight:'normal'}}
//                                 useNativeDriver
//                                 inputStyle={{color: theme.color}}
//                                 value={wifi}
//                                 onChangeText={wifi => {
//                                     setWifi(wifi)
//                                     if (!wifi.length) {
//                                         setDataItem({...item, ...{ disconnect: false, connect: false }})
//                                     }
//                                 }}
//                             />
//                         </NeuButton>
//                     </View>
//                 }
//                 <View style={{ flexDirection: "row", justifyContent: 'space-between'}}>
//                     <Text style={{ fontWeight:'700'}}>{ title.on }</Text>
//                     <CheckBox
//                         value={connect}
//                         onValueChange={ (e) => {
//                             setDataItem({...item, ...{ connect: e }})
//                         }}
//                         tintColors={{true: '#F15927', false: theme.color}}
//                     />
//                 </View>
//                 <View style={{ flexDirection: "row", justifyContent: 'space-between'}}>
//                     <Text style={{ fontWeight:'700'}}>{ title.off }</Text>
//                     <CheckBox
//                         value={disconnect}
//                         onValueChange={ (e) => {
//                             setDataItem({...item, ...{ disconnect: e }})
//                         }}
//                         tintColors={{true: '#F15927', false: theme.color}}
//                     />
//                 </View>
//             </View>
//         </NeuView>
//     )
// }
//
//
// const style = (setTheme) => {
//     const {backgroundColor} = setTheme;
//     return StyleSheet.create({
//         frameTheme: {
//             flex: 1,
//             backgroundColor,
//         },
//         header: {
//             flexDirection: 'row',
//             alignItems: 'center',
//             justifyContent: 'space-between',
//             height: 70,
//             width: width - 30,
//             paddingHorizontal: 15,
//         },
//     });
// };
//
// export  default BackgroundControl
