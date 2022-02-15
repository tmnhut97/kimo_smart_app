import React, {useEffect, useState} from "react";
import {wsListenerMessage, wsRemoveListenerMessage} from "./Socket";
import {isJsonString } from "./mFun";

const HOOK_SOCKET = {};

HOOK_SOCKET.useLogin = () => {
    const [data, setData ] = useState(null)
    const lis = async (evt) => {
        if (!isJsonString(evt.data)) {
            return;
        }
        const {cmd, res, msg, fullname, userid} = JSON.parse(evt.data);
        if (cmd === 'res' && res === 'login') {
            setData({ msg, fullname, userid })
        }
    };
    useEffect( () => {
        wsListenerMessage(lis)
        return () => wsRemoveListenerMessage(lis);
    }, [])

    return {...data}
}


export default HOOK_SOCKET
