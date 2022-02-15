// import BackgroundService from 'react-native-background-actions';
// import {check, PERMISSIONS, request} from "react-native-permissions";
// import {Platform} from "react-native";
// import {getTrackingStatus, requestTrackingPermission} from "react-native-tracking-transparency";
//
//
// const sleep = (time) => new Promise((resolve) => setTimeout(() => resolve(), time));
// const veryIntensiveTask = async (taskDataArguments) => {
//     const { delay } = taskDataArguments;
//     await new Promise( async (resolve) => {
//         for (let i = 0; BackgroundService.isRunning(); i++) {
//             console.log(i);
//             await sleep(delay);
//         }
//     });
// };
//
// const options = {
//     taskName: 'Example',
//     taskTitle: 'ExampleTask title',
//     taskDesc: 'ExampleTask description',
//     taskIcon: {
//         name: 'ic_launcher',
//         type: 'mipmap',
//     },
//     color: '#ff00ff',
//     linkingURI: null, // See Deep Linking for more info
//     parameters: {
//         delay: 1000,
//     },
// };
//
// export default {
//     start: (fun, options) => BackgroundService.start(fun, options),
//     stop: () => BackgroundService.stop(),
//     updateNotification: (options) => BackgroundService.updateNotification(options),
//     isRunning: () => BackgroundService.isRunning(),
//     checkPermissionsBackgroundLocation: async () => {
//         const PERMISSION_ACCESS_FINE_LOCATION = Platform.OS === 'android' ? PERMISSIONS.ANDROID.ACCESS_FINE_LOCATION : PERMISSIONS.IOS.LOCATION_WHEN_IN_USE
//         const PERMISSION_ACCESS_BACKGROUND_LOCATION = Platform.OS === 'android' ? PERMISSIONS.ANDROID.ACCESS_BACKGROUND_LOCATION : PERMISSIONS.IOS.LOCATION_ALWAYS
//         const res0 = await check(PERMISSION_ACCESS_FINE_LOCATION);
//         const res1 = await check(PERMISSION_ACCESS_BACKGROUND_LOCATION);
//         if (res1 === 'granted') { return res1;}
//         if (res0 !== 'granted') {
//             const res0 = await request(PERMISSION_ACCESS_FINE_LOCATION, {
//                 title: "Always use your location?",
//                 message: "This app collects location data to enable location.",
//                 buttonNegative: "Cancel",
//                 buttonPositive: "OK"
//             })
//             const res1 = await request(PERMISSION_ACCESS_BACKGROUND_LOCATION, {
//                 title: "Always use your location always?",
//                 message: "This app collects location data to enable location even when the app is closed or not in use.",
//                 buttonNegative: "Cancel",
//                 buttonPositive: "OK"
//             })
//             if (res0 === "granted" && res1 === "granted" ) {
//                 return "granted"
//             } else return "denied"
//         } else {
//             return await request(PERMISSION_ACCESS_BACKGROUND_LOCATION, {
//                 title: "Always use your location ?",
//                 message: "This app collects location data to enable location even when the app is closed or not in use.",
//                 buttonNegative: "Cancel",
//                 buttonPositive: "OK"
//             })
//         }
//     },
//     requestTrackingPermissionIOS: async () => {
//         const trackingStatus = await getTrackingStatus();
//         if (trackingStatus === 'authorized' || trackingStatus === 'unavailable') return true
//         const request = await requestTrackingPermission();
//         if (request === 'authorized' || request === 'unavailable') return true
//         return false
//     }
// }
