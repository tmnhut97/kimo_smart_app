import React from 'react';
import { Dimensions, TouchableOpacity} from 'react-native';
import {useDispatch, useSelector} from 'react-redux';
import ToastSuccess from './toast/ToastSuccess';
import ToastWarning from './toast/ToastWarning';
import ToastInfo from './toast/ToastInfo';
import ToastError from './toast/ToastError';
import ToastConnectionBar from './toast/ToastConnectionBar';
import {setToast} from "../redux/reducer/toastReducer";
const {height, width} = Dimensions.get('screen')
const ToastCustom = () => {
    const dispatch = useDispatch();
    const toast = useSelector(state => state.toast);
    const close = () => { dispatch(setToast({show: null, data: null, type: null })) }
    if (!toast.show) {
        return <></>
    }
    const {data, show, type} = toast;
    return (
        <TouchableOpacity
            onPress={close}
            style={{
                position: "absolute",
                top:0,
                width,
                height,
                zIndex: 10
            }}
        >
            {
                show === 'SUCCESS' &&
                <ToastSuccess close={close} data={data}/>
            }
            {
                show === "WARNING" &&
                <ToastWarning close={close} data={data}/>
            }
            {
                show === "ERROR" &&
                <ToastError close={close} data={data}/>
            }
            {
                show === "INFO" &&
                <ToastInfo close={close} data={data}/>
            }
            {
                show === "CONNECTION" &&
                <ToastConnectionBar close={close} data={data} type={type}/>
            }
        </TouchableOpacity>
    );
};


export default ToastCustom;
