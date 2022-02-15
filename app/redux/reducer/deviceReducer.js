import {createSlice} from '@reduxjs/toolkit';
import {getItemLocalStore} from "../../mFun";
import React from "react";

const initState = {
    list: [],
    shared: [],
    idCurrent: null,
}
const devicesSlice = createSlice({
    name: 'devices',
    initialState: initState,
    reducers: {
        setListDevice(state, action) {
            const d = action.payload
            const list = d.filter( (e) => (!["share","share_cam","share_cam_door"].includes(e.role) ));
            const shared = d.filter( (e) => (["share","share_cam","share_cam_door"].includes(e.role)) );
            state = {...state, ...{ list, shared }}
            return state
        },
        setDeviceIdCurrent(state, action) { state.idCurrent = action.payload },
        addDevice(state, action) { state = [ ...[action.payload], ...state ] },
        updateDevice(state, action) {
            const { id, name, status, type, troom, tctrl, acmode, usermode, rssi, pirmode } = action.payload
            let list = state.list.map( (dev) => {
                if( dev.id === id ) {
                    if (name) dev.name = name
                    if (status) dev.status = status
                    if (type) dev.type = type
                    if (troom) dev.troom = troom
                    if (acmode) dev.acmode = acmode
                    if (usermode) dev.usermode = usermode
                    if (tctrl) dev.tctrl = tctrl
                    if (rssi) dev.rssi = rssi
                    dev.pirmode = (pirmode && pirmode===1) ? 1 : 0
                }
                return dev
            })
            state.list = list
            return state
        },
    }
})
const { actions, reducer } = devicesSlice
export const { setListDevice, setDeviceIdCurrent , addDevice, updateDevice } = actions
export default reducer
