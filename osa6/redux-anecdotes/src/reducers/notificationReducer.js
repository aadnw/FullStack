import { createSlice, createAction } from '@reduxjs/toolkit'

let timeoutId

export const clearNotification = createAction('notification/clear')

const notificationSlice = createSlice({
    name: 'notification',
    initialState: '',
    reducers: {
        setNotification(state, action) {
            return action.payload
        }
    },
    extraReducers: builder => {
        builder.addCase(clearNotification, () => '')
    }
})

export const { setNotification } = notificationSlice.actions

export const showNotification = (message, seconds = 5) => {
    return dispatch => {
        dispatch(setNotification(message))

        if (timeoutId) {
            clearTimeout(timeoutId)
        }

        timeoutId = setTimeout(() => {
            dispatch(clearNotification())
            timeoutId = undefined
        }, seconds * 1000)
    }
}

export default notificationSlice.reducer