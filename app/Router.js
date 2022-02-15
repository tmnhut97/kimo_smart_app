import React from 'react';
import Device from './screens/device';
import SettingServer from './screens/login/SettingServer';
import SetNameAir from './screens/control/controlAir/SetNameAir';
import Login from './screens/login/login';
import AddDevice from './screens/device/AddDevice';
import Forget from './screens/login/ForgetPassword';
import ChooseIRAir from './screens/control/controlAir/setting/chooseConfigAir/ChooseConfigAir';
import Config from './screens/config/Config';
import Register from './screens/login/register';
import ControlAir from './screens/control/controlAir/ControlAir';
import AlbumCamera from './screens/albumCamera/AlbumCamera';
import ReviewImage from './screens/albumCamera/ReviewImage';
import ScheduleNew from './screens/control/controlAir/schedule/Schedule';
const Stack = createStackNavigator();
import {createStackNavigator} from '@react-navigation/stack';
import Language from './screens/startApp/Language';
import Theme from './screens/startApp/Theme';
import {Platform, StatusBar} from 'react-native';
import {useSelector} from 'react-redux';
import ChooseSupplierIR from "./screens/control/controlAir/setting/scanSupplierIR/ChooseSupplierIR";
import SettingWifiAir from './screens/control/controlAir/setting/SettingWifiAir';
import ShareDevice from "./screens/shareDevice/ShareDevice";
import ListShareDevice from "./screens/shareDevice/ListShareDevice";
import EditDevices from "./screens/shareDevice/EditDevices";
import EditShareInfo from "./screens/shareDevice/EditShareInfo";
import Welcome from './screens/login/welcome';
import ViewShareDevice from "./screens/shareDevice/ViewShareDevice";
import AddDeviceWithCode from "./screens/device/AddDeviceWithCode";
import LoginHasAccount from "./screens/login/LoginHasAccount";
import Profile from './screens/device/Profile';
import DoorCamera from './screens/control/controlCameraDoor/DoorCamera';
import SettingWifiDoor from './screens/control/controlCameraDoor/setting/SettingWifiDoor';
import SetNameDoorCamera from './screens/control/controlCameraDoor/SetNameDoorCamera';
import ShareDeviceWithEmail from "./screens/control/controlAir/setting/ShareDeviceWithEmail";
import ListSharedDevice from "./screens/device/ListSharedDevice";
import VoiceSetup from "./screens/control/controlAir/setting/VoiceSetup";
import VoiceSetupDoorCam from "./screens/control/controlCameraDoor/setting/VoiceSetupDoorCam";
import ShareDeviceWithEmailCD from "./screens/control/controlCameraDoor/ShareDeviceWithEmailCD";
import SettingCameraExternal from "./screens/control/controlCameraDoor/setting/SettingCameraExternal";
// import BackgroundControl from "./screens/device/BackgroundControl";
// import BackgroundLocation from "./screens/device/BackgroundLocation";
const Router = () => {
    const theme = useSelector((state) => state.themes.theme);

    return (
        <>
            <StatusBar
                animated={true}
                backgroundColor={theme.barStyle}
                StatusBarAnimation={'slide'}
                barStyle={
                    Platform.OS === 'ios' ? 'dark-content' :
                    theme.name === 'dark' ? "light-content" : 'dark-content'
                }
            />
            <Stack.Navigator
                mode="modal"
                headerMode={'none'}
                initialRouteName={"Welcome"}
                screenOptions={{animationEnabled: false}}>
                <Stack.Screen name="ShareDeviceWithEmailCD" component={ShareDeviceWithEmailCD}/>
                <Stack.Screen name="DoorCamera" component={DoorCamera}/>
                <Stack.Screen name="Welcome" component={Welcome}/>
                <Stack.Screen name="Login" component={Login}/>
                <Stack.Screen name="LoginHasAccount" component={LoginHasAccount}/>
                <Stack.Screen name="Device" component={Device}/>
                <Stack.Screen name="Profile" component={Profile}/>
                <Stack.Screen name="Theme" component={Theme}/>
                <Stack.Screen name="VoiceSetup" component={VoiceSetup}/>
                <Stack.Screen name="VoiceSetupDoorCam" component={VoiceSetupDoorCam}/>

                <Stack.Screen name="ListSharedDevice" component={ListSharedDevice}/>
                <Stack.Screen name="AddDeviceWithCode" component={AddDeviceWithCode}/>
                <Stack.Screen name="ListShareDevice" component={ListShareDevice}/>
                <Stack.Screen name="ShareDevice" component={ShareDevice}/>
                <Stack.Screen name="ViewShareDevice" component={ViewShareDevice}/>
                <Stack.Screen name="EditDevices" component={EditDevices}/>
                <Stack.Screen name="EditShareInfo" component={EditShareInfo}/>

                <Stack.Screen name="Language" component={Language}/>
                <Stack.Screen name="SettingServer" component={SettingServer}/>
                <Stack.Screen name="AddDevice" component={AddDevice}/>
                <Stack.Screen name="Forget" component={Forget}/>
                <Stack.Screen name="ChooseSupplierIR" component={ChooseSupplierIR}/>

                <Stack.Screen name="ChooseIRAir" component={ChooseIRAir}/>
                <Stack.Screen name="Config" component={Config}/>
                <Stack.Screen name="Register" component={Register}/>
                <Stack.Screen name="ControlAir" component={ControlAir}/>
                <Stack.Screen name="SetNameAir" component={SetNameAir}/>
                <Stack.Screen name="ScheduleNew" component={ScheduleNew}/>
                <Stack.Screen name="SettingWifiAir" component={SettingWifiAir}/>
                <Stack.Screen name="ShareDeviceWithEmail" component={ShareDeviceWithEmail}/>

                <Stack.Screen name="SetNameDoorCamera" component={SetNameDoorCamera}/>
                <Stack.Screen name="SettingCameraExternal" component={SettingCameraExternal}/>
                <Stack.Screen name="AlbumCamera" component={AlbumCamera}/>
                <Stack.Screen name="ReviewImage" component={ReviewImage}/>
                <Stack.Screen name="SettingWifiDoor" component={SettingWifiDoor}/>

                {/*<Stack.Screen name="BackgroundControl" component={BackgroundControl}/>*/}
                {/*<Stack.Screen name="BackgroundLocation" component={BackgroundLocation}/>*/}
            </Stack.Navigator>
        </>
    );
};
export default Router;
