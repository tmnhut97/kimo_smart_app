import React, { useState} from 'react';
import {View, StyleSheet, TouchableWithoutFeedback, Animated, Easing} from 'react-native';
import Svg, {
    Defs,
    LinearGradient,
    Path,
    RadialGradient,
    Rect,
    Stop,
} from 'react-native-svg';
import useAnimatedShowView from "../animated/useAnimatedShowView";
function hexToRgb(hex) {
    var shorthandRegex = /^#?([a-f\d])([a-f\d])([a-f\d])$/i;
    hex = hex.replace(shorthandRegex, function(m, r, g, b) {
        return r + r + g + g + b + b;
    });
    var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result
        ? {
            r: parseInt(result[1], 16),
            g: parseInt(result[2], 16),
            b: parseInt(result[3], 16),
        }
        : null;
}
const Shadow = props => {
    const {
        width = 0,
        height = 0,
        color = '#000',
        offsetX = 0,
        offsetY = 0,
        blur = 3,
        spread = 0,
        borderRadius: _borderRadius = 0,
        opacity = '1',
        style = {},
        children,
    } = props.setting;

    const borderRadius =
        _borderRadius > Math.min(width, height) / 2
            ? Math.min(width, height) / 2
            : _borderRadius;

    const rectInnerWidth = width + spread * 2 - blur;
    const rectInnerHeight = height + spread * 2 - blur;
    const rectOuterWidth = width + spread * 2 + blur;
    const rectOuterHeight = height + spread * 2 + blur;
    const innerRadius =
        borderRadius > 0 ? Math.max(0, borderRadius + spread - blur / 2) : 0;
    const outerRadius =
        borderRadius > 0 ? Math.max(0, borderRadius + spread + blur / 2) : blur;
    const borderWidth = (rectOuterWidth - rectInnerWidth) / 2;

    const rgb = hexToRgb(color);

    const linear = key => {
        return [
            <Stop
                offset="0"
                stopColor={color}
                stopOpacity={opacity}
                key={key + 'Linear0'}
            />,
            <Stop
                offset="1"
                stopColor={color}
                stopOpacity="0"
                key={key + 'Linear1'}
            />,
        ];
    };

    const radial = key => {
        return [
            <Stop
                offset="0"
                stopColor={color}
                stopOpacity={opacity}
                key={key + 'Radial0'}
            />,
            <Stop
                offset={Math.max(0, innerRadius / outerRadius).toString()}
                stopColor={color}
                stopOpacity={opacity}
                key={key + 'Radial1'}
            />,
            <Stop
                offset="1"
                stopColor={color}
                stopOpacity="0"
                key={key + 'Radial2'}
            />,
        ];
    };

    const styles = StyleSheet.create({
        viewContainer: {
            width: rectOuterWidth,
            height: rectOuterHeight,
            position: 'absolute',
            left: -blur / 2 - spread + offsetX,
            top: -blur / 2 - spread + offsetY,
            ...style,
        },
    });
    return (
        <Animated.View style={styles.viewContainer}>
            <Svg width={rectOuterWidth} height={rectOuterHeight}>
                <Defs>
                    <LinearGradient id="top" x1="0%" x2="0%" y1="100%" y2="0%">
                        {linear('BoxTop')}
                    </LinearGradient>
                    <LinearGradient id="bottom" x1="0%" x2="0%" y1="0%" y2="100%">
                        {linear('BoxBottom')}
                    </LinearGradient>
                    <LinearGradient id="left" x1="100%" x2="0%" y1="0%" y2="0%">
                        {linear('BoxLeft')}
                    </LinearGradient>
                    <LinearGradient id="right" x1="0%" x2="100%" y1="0%" y2="0%">
                        {linear('BoxRight')}
                    </LinearGradient>

                    <RadialGradient
                        id="border-left-top"
                        rx="100%"
                        ry="100%"
                        cx="100%"
                        cy="100%"
                        fx="100%"
                        fy="100%">
                        {radial('BoxLeftTop')}
                    </RadialGradient>
                    <RadialGradient
                        id="border-left-bottom"
                        rx="100%"
                        ry="100%"
                        cx="100%"
                        cy="0%"
                        fx="100%"
                        fy="0%">
                        {radial('BoxLeftBottom')}
                    </RadialGradient>
                    <RadialGradient
                        id="border-right-top"
                        rx="100%"
                        ry="100%"
                        cx="0%"
                        cy="100%"
                        fx="0%"
                        fy="100%">
                        {radial('BoxRightTop')}
                    </RadialGradient>
                    <RadialGradient
                        id="border-right-bottom"
                        rx="100%"
                        ry="100%"
                        cx="0%"
                        cy="0%"
                        fx="0%"
                        fy="0%">
                        {radial('BoxRightBottom')}
                    </RadialGradient>
                </Defs>

                <Path
                    d={`
            M 0 ${outerRadius},
            a ${outerRadius} ${outerRadius} 0 0 1 ${outerRadius} ${-outerRadius}
            v ${blur}
            a ${innerRadius} ${innerRadius} 0 0 0 ${-innerRadius} ${innerRadius}
            z
          `}
                    fill="url(#border-left-top)"
                />
                <Path
                    d={`
            M ${rectOuterWidth - outerRadius} 0,
            a ${outerRadius} ${outerRadius} 0 0 1 ${outerRadius} ${outerRadius}
            h ${-blur}
            a ${innerRadius} ${innerRadius} 0 0 0 ${-innerRadius} ${-innerRadius}
            z
          `}
                    fill="url(#border-right-top)"
                />
                <Path
                    d={`
            M ${rectOuterWidth} ${rectOuterHeight - outerRadius},
            a ${outerRadius} ${outerRadius} 0 0 1 ${-outerRadius} ${outerRadius}
            v ${-blur}
            a ${innerRadius} ${innerRadius} 0 0 0 ${innerRadius} ${-innerRadius}
            z
          `}
                    fill="url(#border-right-bottom)"
                />
                <Path
                    d={`
            M ${outerRadius} ${rectOuterHeight},
            a ${outerRadius} ${outerRadius} 0 0 1 ${-outerRadius} ${-outerRadius}
            h ${blur}
            a ${innerRadius} ${innerRadius} 0 0 0 ${innerRadius} ${innerRadius}
            z
          `}
                    fill="url(#border-left-bottom)"
                />
                <Rect
                    x={outerRadius}
                    y={0}
                    width={rectInnerWidth - innerRadius * 2}
                    height={blur}
                    fill="url(#top)"
                />

                <Rect
                    x={rectOuterWidth - blur}
                    y={outerRadius}
                    width={blur}
                    height={rectInnerHeight - innerRadius * 2}
                    fill="url(#right)"
                />
                <Rect
                    x={outerRadius}
                    y={rectOuterHeight - blur}
                    width={rectInnerWidth - innerRadius * 2}
                    height={blur}
                    fill="url(#bottom)"
                />
                <Rect
                    x={0}
                    y={outerRadius}
                    width={blur}
                    height={rectInnerHeight - innerRadius * 2}
                    fill="url(#left)"
                />
                <Path
                    d={`
            M ${borderWidth} ${borderWidth + innerRadius},
            a ${innerRadius} ${innerRadius} 0 0 1 ${innerRadius} ${-innerRadius}
            h ${rectInnerWidth - innerRadius * 2}
            a ${innerRadius} ${innerRadius} 0 0 1 ${innerRadius} ${innerRadius}
            v ${rectInnerHeight - innerRadius * 2}
            a ${innerRadius} ${innerRadius} 0 0 1 ${-innerRadius} ${innerRadius}
            h ${-rectInnerWidth + innerRadius * 2}
            a ${innerRadius} ${innerRadius} 0 0 1 ${-innerRadius} ${-innerRadius}
            z
          `}
                    fill={`rgba(${rgb.r},${rgb.g},${rgb.b},${opacity || 1})`}
                />
                {children}
            </Svg>
        </Animated.View>
    );
};
const NeuView = (props) => {
    const {
        color = '#444444',
        width = 100,
        height = 100,
        radius = 0,
        children,
        customLightShadow = {},
        customDarkShadow = {},
        customInsetLightShadow = {},
        customInsetDarkShadow = {},
        customGradient,
        borderRadius = 0,
        inset,
        convex,
        concave,
        style = {},
        containerStyle,
        noShadow,
        animatedDisabled,
    } = props;

    const hexToHsl = hex => {
        const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);

        let r = parseInt(result[1], 16);
        let g = parseInt(result[2], 16);
        let b = parseInt(result[3], 16);

        (r /= 255), (g /= 255), (b /= 255);
        const max = Math.max(r, g, b),
            min = Math.min(r, g, b);
        let h,
            s,
            l = (max + min) / 2;
        if (max === min) {
            h = s = 0;
        } else {
            const d = max - min;
            s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
            switch (max) {
                case r:
                    h = (g - b) / d + (g < b ? 6 : 0);
                    break;
                case g:
                    h = (b - r) / d + 2;
                    break;
                case b:
                    h = (r - g) / d + 4;
                    break;
            }
            h /= 6;
        }

        s = s * 100;
        s = Math.round(s);
        l = l * 100;
        l = Math.round(l);
        h = Math.round(360 * h);

        return {
            h,
            s,
            l,
        };
    };
    const hslToHex = (h, s, l) => {
        s /= 100;
        l /= 100;

        let c = (1 - Math.abs(2 * l - 1)) * s,
            x = c * (1 - Math.abs(((h / 60) % 2) - 1)),
            m = l - c / 2,
            r = 0,
            g = 0,
            b = 0;

        if (0 <= h && h < 60) {
            r = c;
            g = x;
            b = 0;
        } else if (60 <= h && h < 120) {
            r = x;
            g = c;
            b = 0;
        } else if (120 <= h && h < 180) {
            r = 0;
            g = c;
            b = x;
        } else if (180 <= h && h < 240) {
            r = 0;
            g = x;
            b = c;
        } else if (240 <= h && h < 300) {
            r = x;
            g = 0;
            b = c;
        } else if (300 <= h && h < 360) {
            r = c;
            g = 0;
            b = x;
        }
        r = Math.round((r + m) * 255).toString(16);
        g = Math.round((g + m) * 255).toString(16);
        b = Math.round((b + m) * 255).toString(16);

        if (r.length == 1) r = '0' + r;
        if (g.length == 1) g = '0' + g;
        if (b.length == 1) b = '0' + b;

        return '#' + r + g + b;
    };
    const { h, s, l } = hexToHsl(color);
    const light = hslToHex(h - 2 < 0 ? 0 : h - 2, s, l + 5 > 100 ? 100 : l + 5);
    const dark = hslToHex(h, s, l - 8 < 0 ? 0 : l - 20);
    const mid = hslToHex(h, s, l - 5 < 0 ? 0 : l - 5);

    const lightSetting = {
        width,
        height,
        blur: 10,
        spread: 0,
        borderRadius,
        radius,
        color: inset ? dark : light,
        offsetX: inset ? -2 : -4,
        offsetY: inset ? -2 : -4,
        opacity: 1,
        ...customLightShadow
    };

    const darkSetting = {
        width,
        height,
        blur: 10,
        spread: 0,
        radius,
        color: inset ? light : dark,
        borderRadius,
        offsetX: inset ? 2 : 3,
        offsetY: inset ? 2 : 3,
        opacity: 1,
        ...customDarkShadow
    };

    const insetLightSetting = {
        width,
        height,
        blur: 5,
        spread: 0,
        borderRadius,
        radius,
        color: dark,
        offsetX: -3,
        offsetY: -3,
        opacity: 1,
        ...customInsetDarkShadow
    };

    const insetDarkSetting = {
        width: width + 2,
        height: height + 2,
        blur: 5,
        spread: 1,
        radius,
        color: light,
        borderRadius,
        offsetX: 0,
        offsetY: 0,
        opacity: 1,
        ...customInsetLightShadow
    };

    const styles = StyleSheet.create({
        container: {
            position: 'relative'
        },
        view: {
            width,
            height,
            borderRadius,
            backgroundColor: color,
            alignItems: 'center',
            justifyContent: 'center'
        }
    });
    const settingAni = animatedDisabled ? null : useAnimatedShowView( 200, Easing.linear , 400)
    const renderComposed = children => {
        if (concave) {
            return (
                <>
                    <LinearGradient
                        colors={customGradient ? customGradient : [mid, light]}
                        useAngle={true}
                        angle={145}
                        angleCenter={{ x: 0.5, y: 0.5 }}
                        style={{
                            borderRadius
                        }}
                    >
                        <View
                            style={{
                                ...styles.view,
                                ...containerStyle,
                                backgroundColor: 'transparent',
                            }}
                        >
                            {children}
                        </View>
                    </LinearGradient>
                </>
            );
        }
        if (convex) {
            return (
                <>
                    <LinearGradient
                        colors={customGradient ? customGradient.reverse() : [light, mid]}
                        useAngle={true}
                        angle={145}
                        angleCenter={{ x: 0.5, y: 0.5 }}
                        style={{
                            borderRadius
                        }}
                    >
                        <View
                            style={{
                                ...styles.view,
                                ...containerStyle,
                                backgroundColor: 'transparent',
                                ...settingAni,
                            }}
                        >
                            {children}
                        </View>
                    </LinearGradient>
                </>
            );
        }
        return (
            <>
                <Animated.View
                    style={{
                        ...styles.view,
                        ...containerStyle,
                    }}
                >
                    {children}
                </Animated.View>
            </>
        );
    };
    return (
        <Animated.View
            style={{
                ...styles.container,
                ...style,
                ...settingAni,
            }}
        >
            {!noShadow && (
                <>
                    <Shadow setting={inset ? insetDarkSetting : lightSetting} />
                    <Shadow setting={inset ? insetLightSetting : darkSetting} />
                </>
            )}
            {renderComposed(children)}
        </Animated.View>
    );
};
const NeuButton = props => {
    const [toggleEffect, setToggleEffect] = useState(false);
    const {
        children,
        isConvex,
        active,
        noPressEffect,
        onPressIn,
        onPressOut,
        onPress,
        onLongPress,
        accessibilityRole,
        accessibilityStates,
        accessibilityLabel,
        testID,
        animatedDisabled
    } = props;

    const pressOut = () => {
        if (noPressEffect) {
            return;
        }
        if (active) {
            return setToggleEffect(true);
        }
        if (onPressOut) {
            onPressOut();
        }
        setToggleEffect(false);
    };

    const pressIn = () => {
        if (noPressEffect) {
            return;
        }
        if (active) {
            return setToggleEffect(false);
        }
        if (onPressIn) {
            onPressIn();
        }
        setToggleEffect(true);
    };

    if (isConvex) {
        return (
            <TouchableWithoutFeedback
                onPressOut={pressOut}
                onPressIn={pressIn}
                onPress={onPress}
                onLongPress={onLongPress}
                accessibilityRole={accessibilityRole}
                accessibilityStates={accessibilityStates}
                accessibilityLabel={accessibilityLabel}
                testID={testID}
            >
                <View>
                    <NeuView
                        {...props}
                        concave={noPressEffect ? false : active ? true : toggleEffect}
                        convex={noPressEffect ? false : active ? false : !toggleEffect}
                    >
                        {children}
                    </NeuView>
                </View>
            </TouchableWithoutFeedback>
        );
    }

    return (
        <TouchableWithoutFeedback
            onPressOut={pressOut}
            onPressIn={pressIn}
            onPress={onPress}
            onLongPress={onLongPress}
            accessibilityRole={accessibilityRole}
            accessibilityStates={accessibilityStates}
            accessibilityLabel={accessibilityLabel}
            testID={testID}
        >
            <View>
                <NeuView
                    {...props}
                    inset={noPressEffect ? false : active ? active : toggleEffect}
                >
                    {children}
                </NeuView>
            </View>
        </TouchableWithoutFeedback>
    );
};
export {
    NeuView,
    NeuButton,
}
