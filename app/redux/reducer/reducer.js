import { combineReducers } from 'redux';
import {createSlice} from '@reduxjs/toolkit';
const userIdCurrentSlice = createSlice({
    name: 'userIdCurrent',
    initialState: null,
    reducers: { setUserIdCurrent(state, action) { return state = action.payload } }
})
const isUserShareSlice = createSlice({
    name: 'isUserShare',
    initialState: false,
    reducers: { setIsUserShare(state, action) { return state = action.payload } }
})
export const { setUserIdCurrent } = userIdCurrentSlice.actions
export const { setIsUserShare } = isUserShareSlice.actions


import devices from './deviceReducer';
import schedule from './scheduleReducer';
import toast from './toastReducer';
import languages from './languageReducer';
import themes from './themeReducer';
const reducer = combineReducers({
    userIdCurrent: userIdCurrentSlice.reducer,
    isUserShare: isUserShareSlice.reducer,
    devices: devices,
    schedule: schedule,
    toast: toast,
    languages: languages,
    themes: themes,
});

export default reducer;
