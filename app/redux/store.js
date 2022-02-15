import reducer from './reducer/reducer.js';
import { configureStore } from '@reduxjs/toolkit'
const store = configureStore(
    {  reducer }
)
export default store;

