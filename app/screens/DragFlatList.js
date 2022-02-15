import React, {useEffect, useRef, useState} from 'react'
import {Animated, Dimensions, Easing, PanResponder, StyleSheet, TouchableOpacity, View} from 'react-native'

const PropTypes = require('prop-types')
const {width} = Dimensions.get('window')

const defaultZIndex = 8
const touchZIndex = 99

const DragFlatList = (props) => {
    const pDataSource = [...props.dataSource]
    const sortRefs = useRef(new Map())
    const isMovePanResponder = useRef(true)
    const [itemWidth, setItemWidth ] = useState(props.childrenWidth+props.marginChildrenLeft+props.marginChildrenRight)
    const [itemHeight, setItemHeight ] = useState(props.childrenHeight+props.marginChildrenTop+props.marginChildrenBottom)
    const [rowNum, setRowNum ] = useState(props.parentWidth/itemWidth)
    const [height, setHeight ] = useState(Math.ceil(pDataSource.length / rowNum) * itemHeight)
    const [dataSource, setDataSource ] = useState(pDataSource.map((item,index) => {
        const newData = {}
        const left = (index%rowNum)*itemWidth
        const top = parseInt((index/rowNum))*itemHeight
        newData.data = item
        newData.originIndex = index
        newData.originLeft = left
        newData.originTop = top
        newData.position = new Animated.ValueXY({
            x: parseInt(left+0.5),
            y: parseInt(top+0.5),
        })
        newData.scaleValue = new Animated.Value(1)
        return newData
    }))

    const _panResponder = PanResponder.create({
        onStartShouldSetPanResponder: (evt, gestureState) => true,
        onStartShouldSetPanResponderCapture: (evt, gestureState) => {
            isMovePanResponder.current = false
            return false
        },
        onMoveShouldSetPanResponder: (evt, gestureState) => isMovePanResponder.current,
        onMoveShouldSetPanResponderCapture: (evt, gestureState) => isMovePanResponder.current,

        onPanResponderGrant: (evt, gestureState) => {},
        onPanResponderMove: (evt, gestureState) => moveTouch(evt,gestureState),
        onPanResponderRelease: (evt, gestureState) => endTouch(evt),

        onPanResponderTerminationRequest: (evt, gestureState) => false,
        onShouldBlockNativeResponder: (evt, gestureState) => false,
    })
    const _getKey = (index) => {
        const item = dataSource[index];
        return props.keyExtractor ? props.keyExtractor(item.data, index) : item.originIndex;
    }
    const isHasMove = useRef(true)
    const touchCurItem = useRef(null)
    const startTouch = (touchIndex) => {
        const fixedItems = props.fixedItems;
        if (fixedItems.length > 0 && fixedItems.includes(touchIndex)) return;
        isHasMove.current = false
        if (!props.sortable) return

        const key = _getKey(touchIndex);
        if (sortRefs.current.has(key)) {
            if (props.onDragStart) {
                props.onDragStart(touchIndex)
            }
            Animated.timing(
                dataSource[touchIndex].scaleValue,
                {
                    toValue: props.maxScale,
                    duration: props.scaleDuration,
                    useNativeDriver: false,
                }
            ).start(()=>{
                touchCurItem.current = {
                    ref: sortRefs.current.get(key),
                    index: touchIndex,
                    originLeft: dataSource[touchIndex].originLeft,
                    originTop: dataSource[touchIndex].originTop,
                    moveToIndex: touchIndex,
                }
                isMovePanResponder.current = true
            })
        }
    }
    const moveTouch = (nativeEvent,gestureState) => {
        isHasMove.current = true
        if (touchCurItem.current) {
            let dx = gestureState.dx
            let dy = gestureState.dy
            const itemWidth = itemWidth;
            const itemHeight = itemHeight;

            const rowNum = parseInt(props.parentWidth/itemWidth);
            const maxWidth = props.parentWidth-itemWidth
            const maxHeight = itemHeight*Math.ceil(dataSource.length/rowNum) - itemHeight

            if (!props.isDragFreely) {
                // Maximum or minimum after out of bounds
                if (touchCurItem.current.originLeft + dx < 0) {
                    dx = -touchCurItem.current.originLeft
                } else if (touchCurItem.current.originLeft + dx > maxWidth) {
                    dx = maxWidth - touchCurItem.current.originLeft
                }
                if (touchCurItem.current.originTop + dy < 0) {
                    dy = -touchCurItem.current.originTop
                } else if (touchCurItem.current.originTop + dy > maxHeight) {
                    dy = maxHeight - touchCurItem.current.originTop
                }
            }

            let left = touchCurItem.current.originLeft + dx
            let top = touchCurItem.current.originTop + dy

            touchCurItem.current.ref.setNativeProps({
                style: {
                    zIndex: touchZIndex,
                }
            })

            dataSource[touchCurItem.current.index].position.setValue({
                x: left,
                y: top,
            })

            let moveToIndex = 0
            let moveXNum = dx/itemWidth
            let moveYNum = dy/itemHeight
            if (moveXNum > 0) {
                moveXNum = parseInt(moveXNum+0.5)
            } else if (moveXNum < 0) {
                moveXNum = parseInt(moveXNum-0.5)
            }
            if (moveYNum > 0) {
                moveYNum = parseInt(moveYNum+0.5)
            } else if (moveYNum < 0) {
                moveYNum = parseInt(moveYNum-0.5)
            }

            moveToIndex = touchCurItem.current.index+moveXNum+moveYNum*rowNum

            if (moveToIndex > dataSource.length-1) {
                moveToIndex = dataSource.length-1
            } else if (moveToIndex < 0) {
                moveToIndex = 0;
            }

            if (props.onDragging) {
                props.onDragging(gestureState, left, top, moveToIndex)
            }

            if (touchCurItem.current.moveToIndex !== moveToIndex ) {
                const fixedItems = props.fixedItems;
                if (fixedItems.length > 0 && fixedItems.includes(moveToIndex)) return;
                touchCurItem.current.moveToIndex = moveToIndex
                dataSource.forEach((item,index)=>{
                    let nextItem = null
                    if (index > touchCurItem.current.index && index <= moveToIndex) {
                        nextItem = dataSource[index-1]

                    } else if (index >= moveToIndex && index < touchCurItem.current.index) {
                        nextItem = dataSource[index+1]

                    } else if (index !== touchCurItem.current.index &&
                        (item.position.x._value !== item.originLeft ||
                            item.position.y._value !== item.originTop)) {
                        nextItem = dataSource[index]

                    } else if ((touchCurItem.current.index-moveToIndex > 0 && moveToIndex === index+1) ||
                        (touchCurItem.current.index-moveToIndex < 0 && moveToIndex === index-1)) {
                        nextItem = dataSource[index]
                    }

                    if (nextItem != null) {
                        Animated.timing(
                            item.position,
                            {
                                toValue: {x: parseInt(nextItem.originLeft+0.5),y: parseInt(nextItem.originTop+0.5)},
                                duration: props.slideDuration,
                                easing: Easing.out(Easing.quad),
                                useNativeDriver: false,
                            }
                        ).start()
                    }

                })
            }

        }
    }
    const endTouch = (nativeEvent) => {
        if (touchCurItem.current) {
            if (props.onDragEnd) {
                props.onDragEnd(touchCurItem.current.index,touchCurItem.current.moveToIndex)
            }
            Animated.timing(
                dataSource[touchCurItem.current.index].scaleValue,
                {
                    toValue: 1,
                    duration: props.scaleDuration,
                    useNativeDriver: false,
                }
            ).start(()=>{
                touchCurItem.current.ref.setNativeProps({
                    style: {
                        zIndex: defaultZIndex,
                    }
                })
                changePosition(touchCurItem.current.index,touchCurItem.current.moveToIndex)
                touchCurItem.current = null
            })

        }
    }
    const changePosition = (startIndex, endIndex) => {
        if (startIndex === endIndex) {
            const curItem = dataSource[startIndex]
            if (curItem != null) {
                curItem.position.setValue({
                    x: parseInt(curItem.originLeft + 0.5),
                    y: parseInt(curItem.originTop + 0.5),
                })
            }
            return;
        }

        let isCommon = true
        if (startIndex > endIndex) {
            isCommon = false
            let tempIndex = startIndex
            startIndex = endIndex
            endIndex = tempIndex
        }

        const newDataSource = [...dataSource].map((item,index)=>{
            let newIndex = null
            if (isCommon) {
                if (endIndex > index && index >= startIndex) {
                    newIndex = index+1
                } else if (endIndex == index) {
                    newIndex = startIndex
                }
            } else {
                if (endIndex >= index && index > startIndex) {
                    newIndex = index-1
                } else if (startIndex === index) {
                    newIndex = endIndex
                }
            }

            if (newIndex != null) {
                const newItem = {...dataSource[newIndex]}
                newItem.originLeft = item.originLeft
                newItem.originTop = item.originTop
                newItem.position = new Animated.ValueXY({
                    x: parseInt(item.originLeft+0.5),
                    y: parseInt(item.originTop+0.5),
                })
                item = newItem
            }
            return item
        })
        setDataSource(newDataSource)
        if (props.onDataChange) props.onDataChange(newDataSource.map((item,index)=> item.data))
        // Prevent RN from drawing the beginning and end
        const startItem = newDataSource[startIndex]
        newDataSource[startIndex].position.setValue({
            x: parseInt(startItem.originLeft+0.5),
            y: parseInt(startItem.originTop+0.5),
        })
        const endItem = newDataSource[endIndex]
        newDataSource[endIndex].position.setValue({
            x: parseInt(endItem.originLeft+0.5),
            y: parseInt(endItem.originTop+0.5),
        })

    }

    const isScaleRecovery = useRef(null)
    const onPressOut = () => {
        isScaleRecovery.current = setTimeout(()=> {
            if (isMovePanResponder.current && !isHasMove.current) {
                endTouch()
            }
        },220)
    }
    useEffect( () => {
        if (isScaleRecovery.current) clearTimeout(isScaleRecovery.current)
    }, [])
    const _renderItemView = (dataSource) => {
        const {maxScale, minOpacity} = props
        const inputRange = maxScale >= 1 ? [1, maxScale] : [maxScale, 1]
        const outputRange = maxScale >= 1 ? [1, minOpacity] : [minOpacity, 1]
        return dataSource.map((item,index)=>{
            const transformObj = {}
            transformObj[props.scaleStatus] = item.scaleValue
            const key = _getKey(index);
            return (
                <Animated.View
                    key={key}
                    ref={(ref) => sortRefs.current.set(key,ref)}
                    {..._panResponder.panHandlers}
                    style={[styles.item,{
                        marginTop: props.marginChildrenTop,
                        marginBottom: props.marginChildrenBottom,
                        marginLeft: props.marginChildrenLeft,
                        marginRight: props.marginChildrenRight,
                        left: item.position.x,
                        top: item.position.y,
                        opacity: item.scaleValue.interpolate({inputRange,outputRange}),
                        transform: [transformObj]
                    }]}>
                    <TouchableOpacity
                        activeOpacity = {1}
                        delayLongPress={props.delayLongPress}
                        onPressOut={()=> onPressOut()}
                        onLongPress={()=> startTouch(index)}
                        onPress={()=>{
                            if (props.onClickItem) {
                                props.onClickItem(dataSource.map((item,index)=> item.data),item.data,index)
                            }
                        }}>
                        {props.renderItem(item.data,index)}
                    </TouchableOpacity>
                </Animated.View>
            )
        })
    }
    return (
        <View
            style={{
                width: props.parentWidth, height: height,
                flexDirection: "row", flexWrap: "wrap",
            }}
        >
            {_renderItemView(dataSource)}
        </View>
    )
}
DragFlatList.propTypes = {
    dataSource: PropTypes.array.isRequired,
    parentWidth: PropTypes.number,
    childrenHeight: PropTypes.number.isRequired,
    childrenWidth: PropTypes.number.isRequired,

    marginChildrenTop: PropTypes.number,
    marginChildrenBottom: PropTypes.number,
    marginChildrenLeft: PropTypes.number,
    marginChildrenRight: PropTypes.number,

    sortable: PropTypes.bool,

    onClickItem: PropTypes.func,
    onDragStart: PropTypes.func,
    onDragEnd: PropTypes.func,
    onDataChange: PropTypes.func,
    renderItem: PropTypes.func.isRequired,
    scaleStatus: PropTypes.oneOf(['scale','scaleX','scaleY']),
    fixedItems: PropTypes.array,
    keyExtractor: PropTypes.func,
    delayLongPress: PropTypes.number,
    isDragFreely: PropTypes.bool,
    onDragging: PropTypes.func,
    maxScale: PropTypes.number,
    minOpacity: PropTypes.number,
    scaleDuration: PropTypes.number,
    slideDuration: PropTypes.number
}

DragFlatList.defaultProps = {
    marginChildrenTop: 0,
    marginChildrenBottom: 0,
    marginChildrenLeft: 0,
    marginChildrenRight: 0,
    parentWidth: width,
    sortable: true,
    scaleStatus: 'scale',
    fixedItems: [],
    isDragFreely: false,
    maxScale: 1.1,
    minOpacity: 0.8,
    scaleDuration: 100,
    slideDuration: 300,
}

const styles = StyleSheet.create({
    container: {
        flexWrap: 'wrap',
        flexDirection: 'row',
    },
    item: {
        position: 'absolute',
        zIndex: defaultZIndex,
    },
})

export default DragFlatList
