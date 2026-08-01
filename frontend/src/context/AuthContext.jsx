import { createContext, useContext, useReducer, useEffect } from 'react'
import api from '../services/api'

const AuthContext = createContext(null)

const initialState = { user: null, token: null, loading: true }

function authReducer(state, action) {
  switch (action.type) {
    case 'SET_USER':
      return { ...state, user: action.payload.user, token: action.payload.token, loading: false }
    case 'LOGOUT':
      return { user: null, token: null, loading: false }
    case 'SET_LOADING':
      return { ...state, loading: action.payload }
    default:
      return state
  }
}

export function AuthProvider({ children }) {
  const [state, dispatch] = useReducer(authReducer, initialState)

  useEffect(() => {
    const token = localStorage.getItem('cc_token')
    const userStr = localStorage.getItem('cc_user')
    if (token && userStr) {
      try {
        const user = JSON.parse(userStr)
        dispatch({ type: 'SET_USER', payload: { user, token } })
        api.defaults.headers.common['Authorization'] = `Bearer ${token}`
      } catch {
        localStorage.removeItem('cc_token')
        localStorage.removeItem('cc_user')
        dispatch({ type: 'SET_LOADING', payload: false })
      }
    } else {
      dispatch({ type: 'SET_LOADING', payload: false })
    }
  }, [])

  const login = (token, user) => {
    localStorage.setItem('cc_token', token)
    localStorage.setItem('cc_user', JSON.stringify(user))
    api.defaults.headers.common['Authorization'] = `Bearer ${token}`
    dispatch({ type: 'SET_USER', payload: { user, token } })
  }

  const logout = () => {
    localStorage.removeItem('cc_token')
    localStorage.removeItem('cc_user')
    delete api.defaults.headers.common['Authorization']
    dispatch({ type: 'LOGOUT' })
  }

  return (
    <AuthContext.Provider value={{ ...state, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
