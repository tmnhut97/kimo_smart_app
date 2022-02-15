import {useEffect, useState} from 'react';
import {Keyboard} from 'react-native';


const useHeightKeyBoard = () => {
    const [ keyBoardHeight, setKeyBoardHeight ] = useState(0)
    useEffect(() => {
        Keyboard.addListener("keyboardDidShow", _keyboardDidShow);
        Keyboard.addListener("keyboardDidHide", _keyboardDidHide);
        // cleanup function
        return () => {
            Keyboard.removeListener("keyboardDidShow", _keyboardDidShow);
            Keyboard.removeListener("keyboardDidHide", _keyboardDidHide);
        };
    }, []);

    const _keyboardDidShow = (e) => {
        setKeyBoardHeight(e.endCoordinates.height);
    };
    const _keyboardDidHide = () => {
        setKeyBoardHeight(0);
    };
    return keyBoardHeight
}

export default useHeightKeyBoard
