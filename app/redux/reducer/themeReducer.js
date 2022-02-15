import {createSlice} from '@reduxjs/toolkit';

const theme = {
    default:{
        name:'default',
        barStyle:'#EDF3F8',
        color:'#1F2C58',
        backgroundColor:'#EDF3F8',
        button:'#ffffff',
        input:'#ffffff',
        newButton:'#EDF3F8',
        iconInput:'#54747D',
        itemDevice:{
            backgroundItem:"#EDF3F8"
        },
        controlAir:{
            displayWP:'#EDF3F8'
        },
        schedule:{
            sectionHeader:'#EDF3F8'
        },
        controlCameraDoor:{
            backgroundReviewCamera:'#134064'
        }
    },
    light:{
        name:'light',
        barStyle:'#f1f2f4',
        color:'#000000',
        backgroundColor:'#f1f2f4',
        button:'#ffffff',
        input:'#ffffff',
        newButton:'#f1f2f4',
        iconInput:'#6E6E6E',
        itemDevice:{
            backgroundItem:"#f1f2f4"
        },
        controlAir:{
            displayWP:'#EDF3F8'
        },
        schedule:{
            sectionHeader:'#EDF3F8'
        },
        controlCameraDoor:{
            backgroundReviewCamera:'#FFF'
        }
    },
    dark:{
        name:'dark',
        barStyle:'#202125',
        color:'#ffffff',
        backgroundColor:'#202125',
        button:'#303135',
        input:'#303135',
        newButton:'#303135',
        iconInput:'#999999',
        itemDevice:{
            backgroundItem:"#303135",
            txtTime:'#1F2C58'
        },
        controlAir:{
            displayWP:'#303135'
        },
        schedule:{
            sectionHeader:'#151617',
            txtTime:'green'
        },
        controlCameraDoor:{
            backgroundReviewCamera:'#1d1f1f'
        }
    }
}

const initState = {
    theme:theme.default
}

const themeSlice = createSlice({
    name:'themes',
    initialState:initState,
    reducers:{
        setTheme(state, action) {
            state.theme = {...theme[action.payload]}
        }
    }
})
const {actions, reducer} = themeSlice

export const {setTheme} = actions

export default reducer;
