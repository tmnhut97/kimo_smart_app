// import React, {useEffect, useRef, useState} from "react";
// import {Animated, BackHandler, Dimensions, FlatList, StyleSheet, Text, View} from "react-native";
// import {NeuButton, NeuView} from "../NeuView";
// import Icon from "react-native-vector-icons/dist/FontAwesome5";
// import {useNavigation} from "@react-navigation/native";
// import {useDispatch, useSelector} from "react-redux";
// import useAnimatedCallback from "../../animated/useAnimatedCallback";
// import {NoDevices} from "../../assets/imageSVG";
// import CheckBox from "@react-native-community/checkbox";
// import { server } from "../../Socket";
// import BackgroundService from "../../BackgroundService";
// import {getItemLocalStore, LOCATION, parseDate, setItemLocalStore} from "../../mFun";
// import {setToast} from "../../redux/reducer/toastReducer";
// import NetInfo from "@react-native-community/netinfo";
//
// const { width} = Dimensions.get('screen')
// const BackgroundLocation = () => {
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
//         BackgroundService.requestTrackingPermissionIOS().then( (req) => {
//             if (!req) return navigation.goBack()
//         })
//         BackgroundService.checkPermissionsBackgroundLocation().then( async (e) => {
//             if (e === 'granted') {
//                 LOCATION.getCurrentPosition( (info) => {
//                     const { latitude: lat, longitude: lng} = info.coords
//                     const temp = devices.map( e => ({ ...e, lconnect: false, dislconnect: false, location: { lat, lng } }))
//                     getItemLocalStore('bg'+userId).then( (bg) => {
//                         if (!bg || !bg.length) return setData( temp )
//                         const t = temp.map( (m) => {
//                             const f = bg.find(e => (m.id === e.id && m.type === e.type))
//                             if (!f) return m;
//                             return { ...m, ...f}
//                         })
//                         setData(t)
//                     })
//                     setData(temp)
//                 })
//             }
//         })
//     }, [])
//
//     const wsBg = useRef(null)
//     const watchID = useRef(null)
//     // const unsubscribeWifi = useRef(null)
//     const statusAction = useRef({})
//     const userId = useSelector(state => state.userIdCurrent)
//
//     const actionLocation = async (bg) => {
//         statusAction.current = {}
//         BackgroundService.checkPermissionsBackgroundLocation().then( async (e) => {
//                 if (e === 'granted') {
//                     if (BackgroundService.isRunning()) {
//                         await BackgroundService.stop()
//                         if (watchID.current) LOCATION.clearWatch(watchID.current)
//                         // if (unsubscribeWifi.current) unsubscribeWifi.current
//                     }
//                     function distance(lat1, lon1, lat2, lon2) {
//                         let radlat1 = Math.PI * lat1/180
//                         let radlat2 = Math.PI * lat2/180
//                         let theta = lon1-lon2
//                         let radtheta = Math.PI * theta/180
//                         let dist = Math.sin(radlat1) * Math.sin(radlat2) + Math.cos(radlat1) * Math.cos(radlat2) * Math.cos(radtheta);
//                         dist = Math.acos(dist)
//                         dist = dist * 180/Math.PI
//                         dist = dist * 60 * 1.1515
//                         dist = dist * 1.609344 * 1000
//                         return dist
//                     }
//                     const fun = async (taskDataArguments) => {
//                         try {
//                             if (!taskDataArguments) return ;
//                             const { action, bg, delay } = taskDataArguments;
//                             // const locationCty = { lat: 10.800600309644858, lng: 106.64418017536082 }
//                             const success = async (info) => {
//                                 try {
//                                     console.log(info)
//                                     const { latitude, longitude } = info.coords
//                                     for (const e of bg) {
//                                         const { lconnect, dislconnect, id, type, location } = e
//                                         const distant = distance(location.lat, location.lng, latitude,longitude );
//                                         console.log(distant)
//                                         if (distant <= 15) {
//                                             const actionO = type === "ACC" ? "pon" : "open"
//                                             if (lconnect) action(id, type, actionO)
//                                         }
//                                         else {
//                                             const actionF = type === "ACC" ? "poff" : "close"
//                                             if (dislconnect) action(id, type, actionF)
//                                         }
//                                         console.log(distant)
//                                         // await BackgroundService.updateNotification({
//                                         //     taskTitle: "Lắng nghe vị trí của bạn " + distant +' | ' + id ,
//                                         //     taskDesc: "Có thể tắt thông báo trong cài đặt thông báo của bạn",
//                                         // })
//                                     }
//                                 }catch (e) {
//                                     console.log(e)
//                                 }
//                             }
//                             const sleep = (time) => new Promise((resolve) => setTimeout(() => resolve(), time));
//                             return new Promise( async (resolve) => {
//                                 watchID.current = LOCATION.watchPosition(success)
//                                 // unsubscribeWifi.current = NetInfo.addEventListener( async state => {
//                                 //     const {isConnected, isInternetReachable, type, details} = state
//                                 //     if (isConnected && isInternetReachable) {
//                                 //         console.log(11114, JSON.stringify(details))
//                                 //         if ((type === 'wifi' && !details.ssid) || (type === 'cellular' && !details.cellularGeneration )) {
//                                 //             // await BackgroundService.updateNotification({
//                                 //             //     taskTitle: "Bật vị trí để lắng nghe kết nối mạng của bạn",
//                                 //             //     taskDesc: "Có thể tắt thông báo trong cài đặt thông báo của bạn",
//                                 //             // })
//                                 //         } else {
//                                 //             if (type === 'wifi' && details.ssid ){
//                                 //                 console.log(11114, type, details.ssid)
//                                 //                 bg.forEach( e => {
//                                 //                     const { connect, disconnect, id, type, wifiName } = e
//                                 //                     if ([wifiName].includes(details.ssid)) {
//                                 //                         const actionO = type === "ACC" ? "pon" : "open"
//                                 //                         if (connect) action(id, type, actionO)
//                                 //                     } else {
//                                 //                         const actionF = type === "ACC" ? "poff" : "close"
//                                 //                         if (disconnect) action(id, type, actionF)
//                                 //                     }
//                                 //                 })
//                                 //                 // await BackgroundService.updateNotification({
//                                 //                 //     taskTitle: "Lắng nghe kết nối mạng của bạn " + '"'+details.ssid+'"',
//                                 //                 //     taskDesc: "Có thể tắt thông báo trong cài đặt thông báo của bạn",
//                                 //                 // })
//                                 //             } else {
//                                 //                 console.log(11114, type, details)
//                                 //                 bg.forEach( e => {
//                                 //                     const { disconnect, id, type } = e
//                                 //                     const actionF = type === "ACC" ? "poff" : "close"
//                                 //                     if (disconnect) action(id, type, actionF)
//                                 //                 })
//                                 //                 if (type === 'cellular') {
//                                 //                     // await BackgroundService.updateNotification({
//                                 //                     //     taskTitle: "Lắng nghe kết nối mạng của bạn " + '"'+details.carrier + ' ' + details.cellularGeneration+'"',
//                                 //                     //     taskDesc: "Có thể tắt thông báo trong cài đặt thông báo của bạn",
//                                 //                     // })
//                                 //                 }
//                                 //             }
//                                 //         }
//                                 //
//                                 //     }
//                                 // })
//                             })
//                         } catch (e) {
//                             console.log(e)
//                         }
//                     };
//                     return BackgroundService.start(fun, {
//                         taskName: 'location',
//                         taskTitle: LG.taskTitle,
//                         taskDesc: LG.taskDesc,
//                         taskIcon: {
//                             name: 'logo',
//                             type: 'mipmap',
//                         },
//                         color: '#e5d1e5',
//                         linkingURI: null,
//                         parameters: {
//                             delay: 30000,
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
//                                     console.log(11114,"send " + action)
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
//         if (!data.length) return;
//         try {
//             const dw = data.filter( e => ( e.lconnect || e.dislconnect || e.location || e.connect || e.disconnect || e.wifiName.length ))
//                 .map(({ id, name, type, status, location, lconnect, dislconnect, wifiName, connect, disconnect  }) => ({ id, name, type, status, location, lconnect, dislconnect, wifiName, connect, disconnect  }))
//             const d = dw.filter( e => ( e.lconnect || e.dislconnect || e.connect || e.disconnect ))
//             if (!d.length) {
//                 setItemLocalStore('bg'+userId, dw).then(async () => {
//                     if (BackgroundService.isRunning()) {
//                         await BackgroundService.stop()
//                         if (watchID.current) LOCATION.clearWatch(watchID.current)
//                         // if (unsubscribeWifi.current) unsubscribeWifi.current
//                     }
//                 })
//             }else {
//                 setItemLocalStore('bg'+userId, d).then(() => actionLocation(d))
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
//                     fontWeight: 'bold'}}>{"Vị trí"}</Text>
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
//     const { name, lconnect, dislconnect, location, type } = item
//     let title = { on: '', off: ''};
//     if (type === "ACC") title = { on: `${LG.openAirConditioner} ${LG.whenNear}`, off: `${LG.closeAirConditioner} ${LG.whenNotNear}` }
//     else title = { on: `${LG.openDoor} ${LG.whenNear}`, off: `${LG.closeDoor} ${LG.whenNotNear}` }
//     const locationDisplay = location ? `${parseFloat(location.lat).toFixed(4)}, ${parseFloat(location.lng).toFixed(4)}` : `${LG.location} ${LG.unknown}`
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
//                     <Text style={{ fontWeight:'700'}}>{LG.location}: {locationDisplay}</Text>
//                     <NeuButton
//                         onPress={() => {
//                             LOCATION.getCurrentPosition(info => {
//                                 const { latitude: lat, longitude: lng } = info.coords
//                                 setDataItem( { ...item, ...{ location: { lat, lng }}})
//                             })
//                         }}
//                         color={theme.newButton}
//                         width={30} height={30}
//                         borderRadius={22.5}
//                     >
//                         <Icon name={'map-marker'} color={theme.color} size={20}/>
//                     </NeuButton>
//                 </View>
//                 <View style={{ flexDirection: "row", justifyContent: 'space-between'}}>
//                     <Text style={{ fontWeight:'700'}}>{ title.on }</Text>
//                     <CheckBox
//                         value={lconnect}
//                         onValueChange={ (e) => {
//                             setDataItem({...item, ...{ lconnect: e }})
//                         }}
//                         tintColors={{true: '#F15927', false: theme.color}}
//                     />
//                 </View>
//                 <View style={{ flexDirection: "row", justifyContent: 'space-between'}}>
//                     <Text style={{ fontWeight:'700'}}>{ title.off }</Text>
//                     <CheckBox
//                         value={dislconnect}
//                         onValueChange={ (e) => {
//                             setDataItem({...item, ...{ dislconnect: e }})
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
// export  default BackgroundLocation
