import React, { createContext, useReducer } from 'react'

const NotificationContext = createContext()

const notificationReducer = (state, action) => {
  switch (action.type) {
    case 'SET':
      return action.payload
    case 'CLEAR':
      return null
    default:
      return state
  }
}

export const NotificationProvider = ({ children }) => {
  const [notification, dispatch] = useReducer(notificationReducer, null)

  const setNotification = (message, seconds = 5) => {
    dispatch({ type: 'SET', payload: message })
    setTimeout(() => dispatch({ type: 'CLEAR' }), seconds * 1000)
  }

  const clearNotification = () => dispatch({ type: 'CLEAR' })

  return (
    <NotificationContext.Provider value={{ notification, setNotification, clearNotification }}>
      {children}
    </NotificationContext.Provider>
  )
}

export default NotificationContext
