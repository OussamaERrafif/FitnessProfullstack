/**
 * Redux Provider Component
 * Wraps the app with Redux store
 */

'use client'

import { ReactNode } from 'react'
import { Provider } from 'react-redux'
import { store } from './index'

interface ReduxProviderProps {
  children: ReactNode
}

export function ReduxProvider({ children }: ReduxProviderProps) {
  return <Provider store={store}>{children}</Provider>
}