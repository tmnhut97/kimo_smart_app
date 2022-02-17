import {getCertFs, getItemLocalStore, isJsonString} from './mFun';
import {setToast} from "./redux/reducer/toastReducer";
import {setListDevice, updateDevice} from "./redux/reducer/deviceReducer";
import {setIsUserShare, setUserIdCurrent} from "./redux/reducer/reducer";
export let ws = null;
let timeOutWS = null;
let userid = null;
let username = null;
let cameraid = null;

export let reConnectSocketData = null
export const server = async () => {
    let server = { ip: 'kimovn.com', port: 53101, wss:false }
    const serverLocal = await getItemLocalStore('server')
    if (serverLocal) server = serverLocal
    const ca = await getCertFs('test.crt')
    server.ca = ca
    return server
}
export const initSocket = async (account=null, pass=null, navigation, dispatch, LG, devIdAdd=null) => {
    const { ip, port , wss, ca } = await server()
    if (!ip || !port) return;
    let h = 'ws://'
    if (wss) h = 'wss://'
    const url = `${h}${ip}:${port}`
    ws = new WebSocket(url);
    // ws = new WebSocket(url, [], { ca });
    ws.onopen = function (evt) {
        try {
            username = account
            if (timeOutWS) { clearTimeout(timeOutWS) }
            if (account && pass) {
                emitLogin(account, pass)
            } else {
                getItemLocalStore('user').then( (user) => {
                    if (user) {
                        const { account, pass } = user
                        emitLogin(account, pass)
                    }
                })
            }
            if (account && devIdAdd) {
                emitAddDevToUser(account, devIdAdd, 'admin' )
                const lisDevs = (evt) => {
                    if (!isJsonString(evt.data)) return;
                    const { cmd, res, msg, userid:uid, devids } = JSON.parse(evt.data)
                    if (cmd==='res' && res === 'adddev' && userid===uid) {
                        if (devids) {
                            if (devids.length) {
                                dispatch(setListDevice([...devids]));
                                devids.forEach(({id, type}) => { getDevLogin(id, type) })
                            } else dispatch(setListDevice([]));
                            navigation.navigate("Device")
                            wsRemoveListenerMessage(lisDevs)
                        }
                    }
                }
                wsListenerMessage(lisDevs)
            }
        } catch (e) {
            console.log(e)
        }
        // Notifications.registerRemoteNotifications();
        // Notifications.events().registerRemoteNotificationsRegistered((event: Registered) => {
        //     // TODO: Send the token to my server so it could send back push notifications...
        //     console.log("Device Token Received", event.deviceToken);
        //     registerTokenFCM(event.deviceToken)
        // });
        // Notifications.events().registerRemoteNotificationsRegistrationFailed((event: RegistrationError) => {
        //     console.error(event);
        // });
    };
    ws.onclose = (evt) => {
        reConnectSocketData = { account, pass, navigation, dispatch }
        if (ws === null) return;
        if (ws) ws.close();
        timeOutWS = setTimeout(function() {
            initSocket(account, pass, navigation, dispatch, LG)
        }, 2500);
    };
    ws.onerror = (evt) => {
        if (ws) ws.close();
        // return dispatch(setToast({ show:'CONNECTION', data:LG.connectionFailedCheckAgain+ ' . . .'}))
    }
    ws.onmessage = async (evt) => {
        try {
            if (!isJsonString(evt.data)) return;
            console.log("onmess: " ,evt.data)
            const { cmd, res, msg, userid:uid, devids, type, typeuser, typeshare } = JSON.parse(evt.data)
            if (cmd === 'res' && res === 'reguser') {
                if (msg === "OK") {
                    dispatch(setToast({show:'SUCCESS', data:LG.accountRegistrationIsSuccessful}))
                }
                if (msg==="ERROR") {
                    if (type === 'fullname') dispatch(setToast({show:'ERROR', data:LG.validate.fullname}))
                    if (type === 'username') dispatch(setToast({show:'ERROR', data:LG.validate.username}))
                    if (type === 'pass') dispatch(setToast({show:'ERROR', data:LG.validate.pass}))
                    if (type === 'email') dispatch(setToast({show:'ERROR', data:LG.validate.email}))
                    if (type === 'email_exits') dispatch(setToast({show:'ERROR', data:LG.validate.email_exits}))
                    if (type === 'username_exits') dispatch(setToast({show:'ERROR', data:LG.validate.username_exits}))
                    if (type === 'phone') dispatch(setToast({show:'ERROR', data:LG.validate.phone}))
                    else dispatch(setToast({show:'ERROR',  data:LG.validate.errorOccurred}))
                }

            }
            if (cmd === 'res' && res==='login' ) {
                if (msg === "ERROR") return dispatch(setToast({show:'ERROR', data:LG.validate.errorOccurred}))
                if (msg === "USER_UNKNOWN") return dispatch(setToast({show:'ERROR', data:LG.validate.USER_UNKNOWN}))
                if (msg === "USER_DELETED") return dispatch(setToast({show:'ERROR', data:LG.validate.USER_DELETED}))
                if (msg === "USER_DISABLED") return dispatch(setToast({show:'ERROR', data:LG.validate.USER_DISABLED}))
                if (msg === "USER_USE_DATE") return dispatch(setToast({show:'ERROR', data:LG.validate.USER_USE_DATE}))
                if(msg === "OK") {
                    userid = uid
                    if (uid) { dispatch(setUserIdCurrent(uid)); }
                    if (devids) {
                        if (devids.length) {
                            dispatch(setListDevice(devids));
                            devids.forEach(({id, type}) => { getDevLogin(id, type) })
                        } else dispatch(setListDevice([]));
                    }
                    if (typeuser==="share") dispatch(setIsUserShare(true))
                    else dispatch(setIsUserShare(false))
                }
            }
            if (cmd === 'ping') sendPong()
            if (cmd === 'res' && res === 'login' && msg === 'user logined') {
                closeSocket()
                timeOutWS = setTimeout(function() { initSocket(account, pass, navigation, dispatch, LG) }, 20000);
            }
            if (
                cmd==='res' && ['getdevst', 'control'].includes(res)
                // && userid===uid
            ) {
                const { usermode, acmode, tctrl, devid, name, status, devtype:type, troom, rssi,pirmode  } = JSON.parse(evt.data)
                if (!devid) return ;
                const temp = {}
                devid && (temp.id = devid)
                name && (temp.name = name)
                status && (temp.status = status)
                type && (temp.type = type)
                troom && (temp.troom = troom)
                rssi && (temp.rssi = rssi)
                tctrl && (temp.tctrl = tctrl)
                acmode && (temp.acmode = acmode)
                usermode && (temp.usermode = usermode)
                temp.pirmode = (pirmode && pirmode===1) ? 1 : 0
                dispatch(updateDevice(temp))
            }
            if (cmd === "status"){
                const {usermode, acmode, tctrl, devid, name, status, type, troom, rssi, pirmode } = JSON.parse(evt.data)
                if (!devid) return ;
                let dName = LG.device
                if (name ) dName = name
                if (status === 'logout') {
                    // dispatch(setToast({type: 'connected', show:'CONNECTION', data: dName +' ' + LG.logOut}))
                    const temp = {}
                    devid && (temp.id = devid)
                    status && (temp.status = status)
                    name && (temp.name = name)
                    dispatch(updateDevice(temp))
                }
                else {
                    // dispatch(setToast({type: 'connected', show:'CONNECTION', data: dName +' ' + LG.reconnect}))
                    const temp = {}
                    devid && (temp.id = devid)
                    name && (temp.name = name)
                    status && (temp.status = status)
                    type && (temp.type = type)
                    troom && (temp.troom = troom)
                    rssi && (temp.rssi = rssi)
                    tctrl && (temp.tctrl = tctrl)
                    acmode && (temp.acmode = acmode)
                    usermode && (temp.usermode = usermode)
                    temp.pirmode = (pirmode && pirmode===1) ? 1 : 0
                    dispatch(updateDevice(temp))
                }
            }
            if (cmd==='res' && ['adddev', 'deletedev'].includes(res) && userid===uid ) {
                if (devids) {
                    if (devids.length) {
                        dispatch(setListDevice([...devids]));
                        devids.forEach(({id, type}) => { getDevLogin(id, type) })
                    } else dispatch(setListDevice([]));
                }
            }

            if (cmd==='res' && res==="sharedevtouser" &&
                typeshare === "sendlist" && userid===uid ) {
                if (devids) {
                    if (devids.length) {
                        dispatch(setListDevice([...devids]));
                        devids.forEach(({id, type}) => { getDevLogin(id, type) })
                    } else dispatch(setListDevice([]));
                }
            }

        } catch (e) {
            console.log(e)
        }
    }
}
export const reConnectSocket = (LG, devIdAdd=null ) => {
    if (ws === null && reConnectSocketData) {
        const { account, pass, navigation, dispatch } = reConnectSocketData
        // dispatch(setToast({show:'CONNECTION', data:LG.reconnectingTheServer}))
        timeOutWS = setTimeout(function() {
            dispatch(setListDevice([]));
            initSocket(account, pass, navigation, dispatch, LG, devIdAdd)
        }, 5000);
    }
}
export const wsListenerMessage = (func) => {
    ws && ws.addEventListener('message', func);
}
export const wsRemoveListenerMessage = (func) => {
    ws && ws.removeEventListener('message', func);
}

const wsSendData = (data, opp=null) => {
    try {
        if (ws === null) return;
        const readyState = ws.readyState;
        if (readyState !== 1) return ;
        if (!['reguser', 'login', 'adddev', 'deletedev'].includes(data.cmd)) data.username = username
        return ws.send(JSON.stringify(data), opp);
    } catch (e) {
        console.log(e)
    }
}
export const closeSocket = () => {
    if (ws) ws.close();
    ws=null;
    // userid=null;
    if (timeOutWS) clearTimeout(timeOutWS)
};

export const sendPong = () =>
{
    try {
        let cmdSend = {};
        cmdSend.cmd = 'pong';
        cmdSend.userid = userid;
        cmdSend.devid = 0;
        wsSendData(cmdSend);
    } catch (e) {
        console.log(e)
    }
}


export function emitSendVerifyCode() {
    const cmdSend = {};
    cmdSend.cmd = 'getverifycode';
    cmdSend.type = 'CLIENT';
    wsSendData(cmdSend)
}

export function emitEditAccount(info) {
    const cmdSend = {};
    cmdSend.cmd = 'edituser';
    cmdSend.userid = userid;
    cmdSend.type = 'CLIENT';
    cmdSend.info = info
    wsSendData(cmdSend)
}

export function emitGetAccountsShare() {
    const cmdSend = {};
    cmdSend.cmd = 'getaccshare';
    cmdSend.userid = userid;
    cmdSend.type = 'CLIENT';
    wsSendData(cmdSend)
}
export function emitRegister(data) {
    const cmdSend = data;
    cmdSend.cmd = 'reguser';
    cmdSend.type = 'CLIENT';
    wsSendData(cmdSend)
}
export function getIrSup()
{
    // ircmd -= 15;
    // if(ircmd <0 || ircmd > 19) {console.log('IR command out of range'); return;}
    let cmdSend = {};
    cmdSend.cmd = 'getirsup';
    cmdSend.devtype = "ACC";
    cmdSend.type = 'CLIENT';
    cmdSend.userid = userid;
    wsSendData(cmdSend)
}

export function getExIp(devid, devtype="DOORCAM")
{
    let cmdSend = {};
    cmdSend.cmd = 'getexip';
    cmdSend.devtype = devtype;
    cmdSend.type = 'CLIENT';
    cmdSend.userid = userid;
    cmdSend.devid = devid;
    wsSendData(cmdSend)
}
export function emitSendIr(devid, filename='MITSUBISHICTY_0001.dat', ircmd=15)
{
    // ircmd -= 15;
    // if(ircmd <0 || ircmd > 19) {console.log('IR command out of range'); return;}
    let cmdSend = {};
    cmdSend.cmd = 'irtx';
    cmdSend.ircmd = ircmd;
    cmdSend.filename = filename;
    cmdSend.devid = devid;
    cmdSend.devtype = "ACC";
    cmdSend.type = 'CLIENT';
    cmdSend.userid = userid;
    wsSendData(cmdSend)
}

export function emitShareDevToUser(account, devid, role, typeshare ) {
    try {
        const cmdSend = {};
        cmdSend.cmd = 'sharedevtouser';
        cmdSend.account = account ? account : username;
        cmdSend.devid = devid;
        cmdSend.role = role;
        cmdSend.type = 'CLIENT';
        cmdSend.userid = userid;
        cmdSend.typeshare = typeshare;
        wsSendData(cmdSend)
    } catch (e) {
        console.log(e)
    }
}

export function emitAddDevToUser( username, devid, role ) {
    try {
        const cmdSend = {};
        cmdSend.cmd = 'adddev';
        cmdSend.username = username;
        cmdSend.devid = devid;
        cmdSend.role = role;
        cmdSend.type = 'CLIENT';
        wsSendData(cmdSend)
    } catch (e) {
        console.log(e)
    }
}

export function emitDeleteUser(userId) {
    try {
        const cmdSend = {};
        cmdSend.cmd = 'deleteuser';
        cmdSend.userid = userId;
        cmdSend.type = 'CLIENT';
        wsSendData(cmdSend)
    } catch (e) {
        console.log(e)
    }
}

export function emitDeleteDev( devid, userId=null ) {
    try {
        const cmdSend = {};
        if (!userId) cmdSend.userid = userid;
        else cmdSend.userid = userId;
        cmdSend.cmd = 'deletedev';
        cmdSend.devid = devid;
        cmdSend.type = 'CLIENT';
        wsSendData(cmdSend)
    } catch (e) {
        console.log(e)
    }
}
/// _____ //////
export function emitLogin(name, pass) {
    try {
        const cmdSend = {};
        cmdSend.cmd = 'login';
        cmdSend.name = name;
        cmdSend.pass = pass;
        cmdSend.type = 'CLIENT';
        wsSendData(cmdSend)
    } catch (e) {
        console.log(e)
    }
}

export function wsGetIR(devtype= 'ACC') {
    try {
        let cmdSend = {};
        cmdSend.cmd = 'getir';
        cmdSend.devtype = devtype;
        cmdSend.type = 'CLIENT';
        cmdSend.userid = userid;
        // cmdSend.devid = parseInt(devid);
        wsSendData(cmdSend)
    } catch (e) {
        console.log(e)
    }
}
export function getDevLogin(devid, devtype= 'ACC') {
    try {
        let cmdSend = {};
        cmdSend.cmd = 'getdevst';
        cmdSend.devtype = devtype;
        cmdSend.type = 'CLIENT';
        cmdSend.userid = userid;
        cmdSend.devid = parseInt(devid);
        wsSendData(cmdSend)
    } catch (e) {
        console.log(e)
    }
}



export function emitTimer(devid, typetimer, timer=null, devtype='ACC') {
    try {
        let cmdSend = {};
        cmdSend.type = 'CLIENT';
        cmdSend.userid = userid;
        cmdSend.devid = parseInt(devid);
        cmdSend.cmd = 'timerdev';
        cmdSend.devtype = devtype;
        cmdSend.typetimer = typetimer;
        if (timer) cmdSend.timer = timer;
        wsSendData(cmdSend)
    } catch (e) {
        console.log(e)
    }
}
export function sendControl(devid, action, devtype='ACC') {
    try {
        let cmdSend = {};
        cmdSend.type = 'CLIENT';
        cmdSend.userid = userid;
        cmdSend.devid = parseInt(devid);
        cmdSend.cmd = 'control';
        cmdSend.action = action;
        cmdSend.devtype = devtype;
        wsSendData(cmdSend)
        console.log(cmdSend)
    } catch (e) {
        console.log(e)
    }
}
export const fileSave = (devid, fname, info, devtype='ACC', filetype='t' ) => {
    try {
        const cmdSend = {};
        cmdSend.cmd = 'fsave';
        cmdSend.fname = './' + fname;
        cmdSend.devid = parseInt(devid);
        cmdSend.userid = userid;
        cmdSend.devtype = devtype;
        cmdSend.type = 'CLIENT';
        cmdSend.ftype = filetype;
        if(filetype == 't') cmdSend.info = JSON.stringify(info);
        else cmdSend.info = info;
        wsSendData(cmdSend)
    } catch (e) {
        console.log(e)
    }
}

export function getFile(devid,fname, devtype='ACC', ftype='t') {
    try {
        const cmdSend = {};
        cmdSend.cmd = 'fget';
        cmdSend.devid = parseInt(devid);
        cmdSend.userid = userid;
        cmdSend.devtype = devtype;
        cmdSend.type = 'CLIENT';
        cmdSend.fname = fname;
        cmdSend.ftype = ftype;
        wsSendData(cmdSend)
    } catch (e) {
        console.log(e)
    }
}


export function setNameDev(devid, devname, devtype='ACC' ) {
    try {
        const cmdSend = {};
        cmdSend.cmd = 'setname';
        cmdSend.devname = devname;
        cmdSend.devtype = devtype;
        cmdSend.type = 'CLIENT';
        cmdSend.userid = userid;
        cmdSend.devid = parseInt(devid);
        wsSendData(cmdSend)
    } catch (e) {
        console.log(e)
    }
}

const registerTokenFCM = (data) => {
    const cmdSend = {
        cmd: 'registerTokenFCM', data
    }

    ws.send(JSON.stringify(cmdSend));
}

// /***************camera door*********************/

export const wsControlDoor = (devid, action) => {
    try {
        let cmdSend = {};
        cmdSend.userid = userid;
        cmdSend.devtype = 'DOORCAM';
        cmdSend.devid = devid;
        cmdSend.type = 'CLIENT';
        cmdSend.cmd = 'control';
        cmdSend.action = action;  // 'open' 'close'  'pause'
        wsSendData(cmdSend, { binary: false })
    } catch (e) {
        console.log(e)
    }
}
export function wsControlCamera(devid, action) {
    try {
        cameraid=devid
        let cmdSend = {};
        cmdSend.userid = userid;
        cmdSend.devtype = 'DOORCAM';
        cmdSend.devid = devid;
        cmdSend.type = 'CLIENT';
        cmdSend.cmd = 'control';
        cmdSend.action = action;    // 'stopcam' startcam' 'takepic'
        wsSendData(cmdSend, { binary: false })
    } catch (e) {
        console.log(e)
    }
}
