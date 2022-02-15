import {createSlice} from '@reduxjs/toolkit';

const initState = {
    show: null,
    data: null,
    type: null,
}
const toastSlice = createSlice({
    name: 'toast',
    initialState: initState,
    reducers: {
        setToast(state, action) {
            const { show, data, type } = action.payload
            if (show || show===null) state = {...state, ...{show}}
            if (data) state = {...state, ...{data}}
            if (type) state = {...state, ...{type}}
            return state
        },
    }
})
const { actions, reducer } = toastSlice
export const { setToast } = actions
export default reducer
