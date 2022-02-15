export const isJsonString = (str) => {
    try {
        JSON.parse(str);
    } catch (e) {
        return false;
    }
    return true;
}
import { Platform, PixelRatio } from "react-native";
import AsyncStorage from '@react-native-community/async-storage';
export const getItemLocalStore = async(item) => {
    try {
        const value = await AsyncStorage.getItem(item);
        return JSON.parse(value);
    } catch (error) {
        return null;
    }
};

export const setItemLocalStore = async(key,value)=>{
    try {
        await AsyncStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
        return null;
    }
}

export const removeItemLocalStore = async(key)=>{
    try {
        await AsyncStorage.removeItem(key);
    } catch (error) {
        return null;
    }
}

import RNFS from 'react-native-fs';
export const ALBUM = {
    BASE_PATH: () => {
        // let base_path = RNFS.ExternalStorageDirectoryPath + '/Pictures/Kimo';
        const platform = Platform.OS
        let base_path = RNFS.PicturesDirectoryPath + '/Kimo';
        if (platform === 'ios') base_path = RNFS.LibraryDirectoryPath
        return base_path
    },
    deleteImage: async (path) => {
        try {
            const checkFile = await RNFS.exists(path)
            if (checkFile) await RNFS.unlink(path)
        } catch (e) {
            console.log(e)
        }
    },
    readImage:  async (path) => {
        try {
            const check = await RNFS.exists(path)
            if (check) return await RNFS.readFile(path, 'base64')
            return null
        } catch (e) {
            console.log(e)
        }
    },
    getImagesAlbum: async () => {
        try {
            const platform = Platform.OS
            const base_path = ALBUM.BASE_PATH(platform)
            const check = await RNFS.exists(base_path)
            if (!check) return []
            const res = await RNFS.readDir(base_path)
            const images = res.filter( (e) => (e.isFile() && e.name.endsWith('.jpg') ))
            if (!images.length) return []
            return images
        }catch (e) {
            console.log(e)
        }

    },
    saveImage: async (filename, data) => {
        try {
            if (!filename || !data ) return ;
            const platform = Platform.OS
            const base_path = ALBUM.BASE_PATH(platform)
            const checkFolder = await RNFS.exists(base_path)
            if (!checkFolder) await RNFS.mkdir(base_path)
            const path = base_path +'/' + filename;
            const checkFile = await RNFS.exists(path)
            if (checkFile) await RNFS.unlink(path)
            const image_data = data.split('base64,')[1];
            await RNFS.writeFile(path, image_data, 'base64')
            return base_path
        } catch (error) {
            console.log(error)
        }
    }
}

export const WriteFileFs = async (filename, data) => {
    if (!filename || !data ) return ;
    const path = RNFS.DocumentDirectoryPath + '/' + filename;
    const jsonDataWrite = JSON.stringify(data)
    try {
        await RNFS.writeFile(path, jsonDataWrite, "utf8")
    } catch (error) {
        console.error(error)
    }
}

export const deleteFileFs = async (filename) => {
    if (!filename ) return false;
    const path = RNFS.DocumentDirectoryPath + '/' + filename;
    const check = await RNFS.exists(path)
    if (!check) return console.log("file nay khong ton tai hoac da bi xoa")
    await RNFS.unlink(path)
}
export const readFileFs = async (filename) => {
    try {
        const path = RNFS.DocumentDirectoryPath + '/' + filename;
        const check = await RNFS.exists(path)
        if (!check) console.log("file nay khong ton tai hoac da bi xoa")
        if (!check) return false
        const mdata = await RNFS.readFile(path, 'utf8');
        if (!isJsonString(mdata)) return false
        return JSON.parse(mdata)
    }
    catch (err) {
        console.error(err)
    }
}
export const getCertFs = async (filename) => {
    if (Platform.OS === 'android') return await RNFS.readFileRes(filename, 'utf8');
    if (Platform.OS === 'ios') return await RNFS.readFile(RNFS.MainBundlePath + '/' + filename)
    return null

}
export const calculateImageSize = (base64String) => {
    let padding;
    if(base64String.endsWith("==")) { padding = 2; }
    else if (base64String.endsWith("=")) { padding = 1; }
    else { padding = 0; }
    const base64StringLength = base64String.length;
    const bytes = (3 * base64StringLength / 4) - padding;
    const kBytes = bytes / 1000;
    return kBytes;
}

const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=';
export const Base64 = {
    btoa: (input:string = '')  => {
        let str = input;
        let output = '';

        for (let block = 0, charCode, i = 0, map = chars;
             str.charAt(i | 0) || (map = '=', i % 1);
             output += map.charAt(63 & block >> 8 - i % 1 * 8)) {

            charCode = str.charCodeAt(i += 3/4);

            if (charCode > 0xFF) {
                throw new Error("'btoa' failed: The string to be encoded contains characters outside of the Latin1 range.");
            }

            block = block << 8 | charCode;
        }

        return output;
    },
    atob: (input:string = '') => {
        let str = input.replace(/=+$/, '');
        let output = '';

        if (str.length % 4 == 1) {
            throw new Error("'atob' failed: The string to be decoded is not correctly encoded.");
        }
        for (let bc = 0, bs = 0, buffer, i = 0;
             buffer = str.charAt(i++);

             ~buffer && (bs = bc % 4 ? bs * 64 + buffer : buffer,
             bc++ % 4) ? output += String.fromCharCode(255 & bs >> (-2 * bc & 6)) : 0
        ) {
            buffer = chars.indexOf(buffer);
        }

        return output;
    }
};

export const clearString = (str) => {
    if (!str) return ''
    str = str.trim()
    str = str.toLowerCase()
    str = str.replace(/Ã |Ã¡|áº¡|áº£|Ã£|Ã¢|áº§|áº¥|áº­|áº©|áº«|Äƒ|áº±|áº¯|áº·|áº³|áºµ/g, "a");
    str = str.replace(/Ã¨|Ã©|áº¹|áº»|áº½|Ãª|á»|áº¿|á»‡|á»ƒ|á»…/g, "e");
    str = str.replace(/Ã¬|Ã­|á»‹|á»‰|Ä©/g, "i");
    str = str.replace(/Ã²|Ã³|á»|á»|Ãµ|Ã´|á»“|á»‘|á»™|á»•|á»—|Æ¡|á»|á»›|á»£|á»Ÿ|á»¡/g, "o");
    str = str.replace(/Ã¹|Ãº|á»¥|á»§|Å©|Æ°|á»«|á»©|á»±|á»­|á»¯/g, "u");
    str = str.replace(/á»³|Ã½|á»µ|á»·|á»¹/g, "y");
    str = str.replace(/Ä‘/g, "d");
    return str;
}
export const removeAccents = (str) => {
    str = str.trim()
    const AccentsMap = [
        "aàảãáạăằẳẵắặâầẩẫấậ",
        "AÀẢÃÁẠĂẰẲẴẮẶÂẦẨẪẤẬ",
        "dđ", "DĐ",
        "eèẻẽéẹêềểễếệ",
        "EÈẺẼÉẸÊỀỂỄẾỆ",
        "iìỉĩíị",
        "IÌỈĨÍỊ",
        "oòỏõóọôồổỗốộơờởỡớợ",
        "OÒỎÕÓỌÔỒỔỖỐỘƠỜỞỠỚỢ",
        "uùủũúụưừửữứự",
        "UÙỦŨÚỤƯỪỬỮỨỰ",
        "yỳỷỹýỵ",
        "YỲỶỸÝỴ"
    ];
    for (let i=0; i<AccentsMap.length; i++) {
        const re = new RegExp('[' + AccentsMap[i].substr(1) + ']', 'g');
        const char = AccentsMap[i][0];
        str = str.replace(re, char);
    }
    return str;
}
export const parseDate = (date) => {
    const day = ('0' + date.getDate()).slice(-2)
    const month = ('0' + (date.getMonth() + 1)).slice(-2)
    const year = date.getFullYear()
    const h = ('0' + date.getHours()).slice(-2)
    const m = ('0' + (date.getMinutes())).slice(-2)
    const s = ('0' + (date.getSeconds())).slice(-2)
    const dateString = day + '/' + month + '/' + year
    const timeString = h + ':' + m + ''
    return { day, month, year, h, m, s, dateString, timeString }
}

export const convertToPx = (value) => {
    const px = PixelRatio.getPixelSizeForLayoutSize(value)
    return px
}

/// network //
import WifiManager from "react-native-wifi-reborn";
export const getFrequency = async () => {
    try {
        if (Platform.OS === 'android') return await WifiManager.getCurrentSignalStrength() + ' dBm'
        else return false
    } catch (e) {
        console.log(e)
    }
}

import VersionNumber from 'react-native-version-number';

export const getVersion = {
    appVersion: VersionNumber.appVersion,
    buildVersion: VersionNumber.buildVersion,
    bundleIdentifier: VersionNumber.bundleIdentifier
}

// import Geolocation from "react-native-geolocation-service";
// import {getDistance, getPreciseDistance} from 'geolib';
//
// export const LOCATION = {
//     getDistance: (lat1, lng1, lat2, lng2) => {
//         return getDistance(
//             { latitude: lat1, longitude: lng1 },
//             { latitude: lat2, longitude: lng2 },
//         );
//     },
//     watchPosition: (success) => {
//         return Geolocation.watchPosition(success, (e) => console.log(e), {
//             distanceFilter: 5, // Meters
//             accuracy: {
//                 ios: 'best',
//                 android: 'balanced',
//             },
//             // Android only
//             androidProvider: 'auto',
//             interval: 5000, // Milliseconds
//             fastestInterval: 10000, // Milliseconds
//             maxWaitTime: 5000, // Milliseconds
//             // iOS Only
//             activityType: 'other',
//             allowsBackgroundLocationUpdates: true,
//             headingFilter: 1, // Degrees
//             headingOrientation: 'portrait',
//             pausesLocationUpdatesAutomatically: false,
//             showsBackgroundLocationIndicator: false,
//         });
//     },
//     getCurrentPosition: (fun) => Geolocation.getCurrentPosition(fun, (e) => console.log(e), {
//         enableHighAccuracy: false,
//         timeout: 5000,
//         maximumAge: 10000,
//     }),
//     clearWatch: (watchID) => Geolocation.clearWatch(watchID),
//     stopObserving: () => Geolocation.stopObserving()
// }
