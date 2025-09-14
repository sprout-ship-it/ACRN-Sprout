// src/context/AuthContext.js - SIMPLIFIED VERSION
import React, { createContext, useContext, useEffect, useState } from 'react'
import { auth, db } from '../utils/supabase'

const AuthContext = createContext({})

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  // ✅ SIMPLIFIED: Initialize auth state with timeout protection
  useEffect(() => {
    console.log('🔐 AuthProvider: Initializing...')
    
    let mounted = true
    let timeoutId = null

    const initializeAuth = async () => {
      try {
        // Set a timeout to prevent infinite loading
        timeoutId = setTimeout(() => {
          if (mounted) {
            console.log('⚠️ AuthProvider: Session check timed out, setting not authenticated')
            setUser(null)
            setProfile(null)
            setLoading(false)
            setError({ message: 'Session check timed out' })
          }
        }, 10000) // 10 second timeout

        // Get initial session
        console.log('🔐 AuthProvider: Getting initial session...')
        const { session, error: sessionError } = await auth.getSession()
        
        // Clear timeout if we got a response
        if (timeoutId) {
          clearTimeout(timeoutId)
          timeoutId = null
        }

        if (!mounted) return

        if (sessionError) {
          console.error('❌ AuthProvider: Session error:', sessionError)
          setError(sessionError)
          setUser(null)
          setProfile(null)
          setLoading(false)
          return
        }

        if (session?.user) {
          console.log('✅ AuthProvider: Found user session, loading profile...')
          setUser(session.user)
          await loadUserProfile(session.user.id)
        } else {
          console.log('ℹ️ AuthProvider: No user session found')
          setUser(null)
          setProfile(null)
        }

        setLoading(false)

      } catch (err) {
        if (timeoutId) {
          clearTimeout(timeoutId)
        }
        
        if (mounted) {
          console.error('💥 AuthProvider: Initialization failed:', err)
          setError(err)
          setUser(null)
          setProfile(null)
          setLoading(false)
        }
      }
    }

    initializeAuth()

    // ✅ SIMPLIFIED: Clean auth state change listener
    const { data: { subscription } } = auth.onAuthStateChange(async (event, session) => {
      if (!mounted) return

      console.log('🔐 AuthProvider: Auth state changed:', event)

      try {
        if (event === 'SIGNED_OUT' || !session?.user) {
          console.log('🚪 AuthProvider: User signed out')
          setUser(null)
          setProfile(null)
          setError(null)
        } else if (session.user) {
          console.log('👤 AuthProvider: User signed in, loading profile...')
          setUser(session.user)
          await loadUserProfile(session.user.id)
        }
      } catch (err) {
        console.error('💥 AuthProvider: Error handling auth state change:', err)
        setError(err)
      }

      setLoading(false)
    })

    return () => {
      mounted = false
      if (timeoutId) {
        clearTimeout(timeoutId)
      }
      subscription?.unsubscribe()
    }
  }, [])

  // ✅ SIMPLIFIED: Load user profile with timeout protection
  const loadUserProfile = async (userId) => {
    console.log('👤 AuthProvider: Loading profile for user:', userId)
    
    try {
      // Set a timeout for profile loading
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Profile loading timed out')), 8000)
      )

      const profilePromise = db.profiles.getById(userId)

      // Race the profile load against timeout
      const { data: profileData, error: profileError } = await Promise.race([
        profilePromise,
        timeoutPromise
      ])

      if (profileError) {
        // If profile doesn't exist, that's OK - user might be new
        if (profileError.code === 'PGRST116') {
          console.log('ℹ️ AuthProvider: No profile found (new user)')
          setProfile(null)
          return
        }
        
        console.error('❌ AuthProvider: Profile loading error:', profileError)
        setError(profileError)
        setProfile(null)
        return
      }

      if (profileData) {
        console.log('✅ AuthProvider: Profile loaded successfully')
        setProfile(profileData)
        setError(null)
      } else {
        console.log('ℹ️ AuthProvider: No profile data returned')
        setProfile(null)
      }

    } catch (err) {
      console.error('💥 AuthProvider: Profile loading failed:', err)
      
      // If it's a timeout, create a minimal profile to prevent blocking
      if (err.message.includes('timed out')) {
        console.log('⚠️ AuthProvider: Profile load timed out, creating fallback')
        setProfile({
          id: userId,
          roles: ['applicant'], // Safe default
          first_name: 'User',
          loading_error: true
        })
        setError({ message: 'Profile loading timed out' })
      } else {
        setError(err)
        setProfile(null)
      }
    }
  }

  // ✅ SIMPLIFIED: Sign up function
  const signUp = async (email, password, userData) => {
    console.log('🔐 AuthProvider: signUp called')
    setLoading(true)
    setError(null)

    try {
      const { data, error } = await auth.signUp(email, password, userData)
      
      if (error) {
        setError(error)
        setLoading(false)
        return { data: null, error }
      }

      // Don't set loading to false here - let the auth state change handler do it
      return { data, error: null }

    } catch (err) {
      console.error('💥 AuthProvider: signUp failed:', err)
      setError(err)
      setLoading(false)
      return { data: null, error: err }
    }
  }

  // ✅ SIMPLIFIED: Sign in function
  const signIn = async (email, password) => {
    console.log('🔐 AuthProvider: signIn called')
    setLoading(true)
    setError(null)

    try {
      const { data, error } = await auth.signIn(email, password)
      
      if (error) {
        setError(error)
        setLoading(false)
        return { data: null, error }
      }

      // Don't set loading to false here - let the auth state change handler do it
      return { data, error: null }

    } catch (err) {
      console.error('💥 AuthProvider: signIn failed:', err)
      setError(err)
      setLoading(false)
      return { data: null, error: err }
    }
  }

  // ✅ SIMPLIFIED: Sign out function with timeout protection
  const signOut = async () => {
    console.log('🔐 AuthProvider: signOut called')
    setLoading(true)
    setError(null)

    try {
      // Set a timeout for logout to prevent hanging
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Logout timed out')), 5000)
      )

      const logoutPromise = auth.signOut()

      // Race logout against timeout
      const { error } = await Promise.race([logoutPromise, timeoutPromise])

      if (error) {
        console.error('❌ AuthProvider: signOut error:', error)
        setError(error)
        setLoading(false)
        return { error }
      }

      // Clear state immediately on successful logout
      console.log('✅ AuthProvider: signOut successful')
      setUser(null)
      setProfile(null)
      setError(null)
      setLoading(false)

      return { error: null }

    } catch (err) {
      console.error('💥 AuthProvider: signOut failed:', err)
      
      // Even if logout fails, clear local state
      if (err.message.includes('timed out')) {
        console.log('⚠️ AuthProvider: Logout timed out, clearing local state anyway')
        setUser(null)
        setProfile(null)
        setError(null)
        setLoading(false)
        return { error: { message: 'Logout timed out but local session cleared' } }
      }

      setError(err)
      setLoading(false)
      return { error: err }
    }
  }

  // ✅ ADDED: Helper function to refresh profile
  const refreshProfile = async () => {
    if (!user?.id) return
    
    console.log('🔄 AuthProvider: Refreshing profile...')
    await loadUserProfile(user.id)
  }

  // ✅ ADDED: Helper function to clear error
  const clearError = () => {
    setError(null)
  }

  // ✅ ADDED: Helper functions for role checking
  const hasRole = (role) => {
    return profile?.roles?.includes(role) || false
  }

  const hasAnyRole = (roles) => {
    if (!profile?.roles) return false
    return roles.some(role => profile.roles.includes(role))
  }

  // ✅ ADDED: Computed properties
  const isAuthenticated = !!user && !!profile
  const isNewUser = !!user && !profile

  const value = {
    // State
    user,
    profile,
    loading,
    error,
    isAuthenticated,
    isNewUser,

    // Methods
    signUp,
    signIn,
    signOut,
    refreshProfile,
    clearError,

    // Helpers
    hasRole,
    hasAnyRole
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}