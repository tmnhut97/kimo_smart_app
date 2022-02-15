import {createSlice} from '@reduxjs/toolkit';

const initState = {
    data: [],
    dayCurrent: null,
}
const scheduleSlice = createSlice({
    name: 'devices',
    initialState: initState,
    reducers: {
        setDataSchedule(state, action) { state.data = action.payload },
        setDayCurrentSchedule(state, action) { state.dayCurrent = action.payload },
    }
})
const { actions, reducer } = scheduleSlice
export const { setDataSchedule, setDayCurrentSchedule } = actions
export default reducer
