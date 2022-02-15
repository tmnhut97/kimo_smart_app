import React from 'react';
import PropTypes from 'prop-types';
import {
    Animated,
    Easing,
    Text,
    TextInput,
    View,
    StyleSheet,
} from 'react-native';

import BaseInput from './BaseInput';

export default class Kohana extends BaseInput {
    static propTypes = {
        iconClass: PropTypes.func.isRequired,
        iconName: PropTypes.string.isRequired,
        iconColor: PropTypes.string,
        iconSize: PropTypes.number,
        inputPadding: PropTypes.number,
    };

    static defaultProps = {
        easing: Easing.bezier(0.2, 1, 0.3, 1),
        iconSize: 25,
        inputPadding: 16,
        useNativeDriver: false,
    };

    render() {
        const {
            iconClass: Icon,
            iconColor,
            iconSize,
            iconName,
            label,
            style: containerStyle,
            inputPadding,
            inputStyle,
            labelStyle,
            iconContainerStyle,
            labelContainerStyle,
        } = this.props;
        const {focusedAnim, value} = this.state;

        return (
            <View style={[styles.container, containerStyle]} onLayout={this._onLayout} onPress={this.focus} >
                <Animated.View
                    style={{
                        justifyContent: 'center',
                        padding: inputPadding,
                        transform: [
                            {
                                translateX: focusedAnim.interpolate({
                                    inputRange: [0, 1],
                                    outputRange: [-16 - iconSize, 0],
                                }),
                            },
                        ],
                        ...iconContainerStyle,
                    }}
                >
                    <Icon name={iconName} color={iconColor} size={iconSize}/>
                </Animated.View>
                <Animated.View
                    style={{
                        position: 'absolute',
                        justifyContent:'center',
                        alignItems:'center',
                        left: 0,
                        height:55,
                        minWidth:50,
                        transform: [
                            {
                                translateX: focusedAnim.interpolate({
                                    inputRange: [0, 1],
                                    outputRange: [inputPadding, 80],
                                }),
                            },
                        ],
                        opacity: focusedAnim.interpolate({
                            inputRange: [0, 1],
                            outputRange: [1, 0],
                        }),
                        ...labelContainerStyle,
                    }}
                >
                    <Text style={[styles.label, labelStyle]}>
                        {label}
                    </Text>
                </Animated.View>
                <TextInput
                    ref={this.input}
                    {...this.props}
                    style={[styles.textInput, inputStyle, {
                        paddingHorizontal: inputPadding,
                    }]}
                    value={value}
                    onBlur={this._onBlur}
                    onFocus={this._onFocus}
                    onChange={this._onChange}
                    underlineColorAndroid={'transparent'}
                />
            </View>
        );
    }
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        flexDirection: 'row',
        backgroundColor: 'transparent',
        overflow: 'hidden',
    },
    label: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#D2D2D2',
    },
    textInput: {
        flex: 1,
        paddingVertical: 0,
        color: 'black',
        fontSize: 18,
    },
});
