// src/context/AuthContext.js - COMPLETE UPDATED VERSION
import React, { createContext, useContext, useEffect, useState } from 'react'
import { auth, db } from '../utils/supabase'

// Create and export AuthContext
export const AuthContext = createContext({})

// Custom hook to use auth context
export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

// Main AuthProvider component
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  // Initialize auth state on mount
  useEffect(() => {
    console.log('🔐 AuthProvider: Initializing auth state...')
    
    let mounted = true
    let initTimeout = null

    const initializeAuth = async () => {
      try {
        // Prevent infinite loading with timeout
        initTimeout = setTimeout(() => {
          if (mounted) {
            console.log('⚠️ AuthProvider: Initialization timeout - setting unauthenticated')
            setUser(null)
            setProfile(null)
            setLoading(false)
            setError(null) // Don't show error for timeout, just proceed
          }
        }, 8000) // 8 second timeout

        // Get current session
        console.log('🔐 AuthProvider: Checking for existing session...')
        const { session, error: sessionError } = await auth.getSession()
        
        // Clear timeout on response
        if (initTimeout) {
          clearTimeout(initTimeout)
          initTimeout = null
        }

        if (!mounted) return

        if (sessionError) {
          console.error('❌ AuthProvider: Session error:', sessionError.message)
          setUser(null)
          setProfile(null)
          setLoading(false)
          setError(null) // Don't block user for session errors
          return
        }

        if (session?.user) {
          console.log('✅ AuthProvider: Active session found, loading profile...')
          setUser(session.user)
          
          // Load profile with error handling
          try {
            await loadUserProfile(session.user.id)
          } catch (profileErr) {
            console.error('⚠️ AuthProvider: Profile load failed, but keeping user logged in:', profileErr)
            // Create minimal profile to prevent blocking
            setProfile({
              id: session.user.id,
              email: session.user.email,
              first_name: session.user.user_metadata?.firstName || 'User',
              roles: ['applicant'], // Safe default
              is_active: true
            })
          }
        } else {
          console.log('ℹ️ AuthProvider: No active session')
          setUser(null)
          setProfile(null)
        }

        setLoading(false)
        setError(null)

      } catch (err) {
        if (initTimeout) {
          clearTimeout(initTimeout)
        }
        
        if (mounted) {
          console.error('💥 AuthProvider: Init failed:', err.message)
          setUser(null)
          setProfile(null)
          setLoading(false)
          setError(null) // Don't block user
        }
      }
    }

    // Set up auth state listener
    console.log('🔐 AuthProvider: Setting up auth state listener...')
    const { data: { subscription } } = auth.onAuthStateChange(async (event, session) => {
      if (!mounted) return

      console.log('🔐 AuthProvider: Auth state changed:', event)

      if (event === 'SIGNED_OUT' || !session?.user) {
        console.log('🚪 AuthProvider: User signed out')
        setUser(null)
        setProfile(null)
        setError(null)
        setLoading(false)
      } else if (event === 'SIGNED_IN' && session.user) {
        console.log('👤 AuthProvider: User signed in')
        setUser(session.user)
        setLoading(true)
        
        try {
          await loadUserProfile(session.user.id)
        } catch (err) {
          console.error('⚠️ AuthProvider: Profile load failed after sign in:', err)
          // Create minimal profile to unblock user
          setProfile({
            id: session.user.id,
            email: session.user.email,
            first_name: session.user.user_metadata?.firstName || 'User',
            roles: ['applicant'],
            is_active: true
          })
        }
        
        setLoading(false)
      } else if (event === 'TOKEN_REFRESHED' && session.user) {
        console.log('🔄 AuthProvider: Token refreshed')
        setUser(session.user)
        // Don't reload profile on token refresh
      }
    })

    // Initialize
    initializeAuth()

    // Cleanup
    return () => {
      mounted = false
      if (initTimeout) {
        clearTimeout(initTimeout)
      }
      subscription?.unsubscribe()
    }
  }, [])

  // Load user profile with timeout protection
  const loadUserProfile = async (userId) => {
    console.log('👤 AuthProvider: Loading profile for user:', userId)
    
    return new Promise((resolve, reject) => {
      const profileTimeout = setTimeout(() => {
        reject(new Error('Profile loading timed out'))
      }, 6000) // 6 second timeout for profile loading

      db.profiles.getById(userId)
        .then(({ data: profileData, error: profileError }) => {
          clearTimeout(profileTimeout)
          
          if (profileError) {
            if (profileError.code === 'PGRST116') {
              console.log('ℹ️ AuthProvider: No profile found (new user)')
              setProfile(null)
              resolve()
            } else {
              console.error('❌ AuthProvider: Profile error:', profileError.message)
              reject(profileError)
            }
            return
          }

          if (profileData) {
            console.log('✅ AuthProvider: Profile loaded successfully')
            setProfile(profileData)
            setError(null)
            resolve()
          } else {
            console.log('ℹ️ AuthProvider: No profile data')
            setProfile(null)
            resolve()
          }
        })
        .catch(err => {
          clearTimeout(profileTimeout)
          reject(err)
        })
    })
  }

  // Sign up new user
  const signUp = async (email, password, userData) => {
    console.log('🔐 AuthProvider: Starting sign up for:', email)
    setLoading(true)
    setError(null)

    try {
      const { data, error } = await auth.signUp(email, password, userData)
      
      if (error) {
        console.error('❌ AuthProvider: Sign up error:', error.message)
        setError(error)
        setLoading(false)
        return { data: null, error }
      }

      console.log('✅ AuthProvider: Sign up successful')
      return { data, error: null }

    } catch (err) {
      console.error('💥 AuthProvider: Sign up failed:', err.message)
      setError(err)
      setLoading(false)
      return { data: null, error: err }
    }
  }

  // Sign in existing user
  const signIn = async (email, password) => {
    console.log('🔐 AuthProvider: Starting sign in for:', email)
    setLoading(true)
    setError(null)

    try {
      const { data, error } = await auth.signIn(email, password)
      
      if (error) {
        console.error('❌ AuthProvider: Sign in error:', error.message)
        setError(error)
        setLoading(false)
        return { data: null, error }
      }

      console.log('✅ AuthProvider: Sign in successful')
      return { data, error: null }

    } catch (err) {
      console.error('💥 AuthProvider: Sign in failed:', err.message)
      setError(err)
      setLoading(false)
      return { data: null, error: err }
    }
  }

  // Sign out user with aggressive timeout
  const signOut = async () => {
    console.log('🔐 AuthProvider: Starting sign out...')
    setLoading(true)

    try {
      // Race logout against aggressive timeout
      const logoutPromise = auth.signOut()
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Logout timed out')), 3000) // 3 second timeout
      )

      const { error } = await Promise.race([logoutPromise, timeoutPromise])

      if (error) {
        console.error('❌ AuthProvider: Sign out error:', error.message)
      }

      // Always clear local state regardless of server response
      console.log('✅ AuthProvider: Clearing local auth state')
      setUser(null)
      setProfile(null)
      setError(null)
      setLoading(false)

      return { error: null } // Always return success since we cleared local state

    } catch (err) {
      console.error('💥 AuthProvider: Sign out failed or timed out:', err.message)
      
      // Clear local state even on failure/timeout
      console.log('🔧 AuthProvider: Force clearing local state after timeout')
      setUser(null)
      setProfile(null)
      setError(null)
      setLoading(false)
      
      return { error: null } // Return success since local state is cleared
    }
  }

  // Refresh user profile
  const refreshProfile = async () => {
    if (!user?.id) {
      console.log('⚠️ AuthProvider: Cannot refresh profile - no user')
      return
    }
    
    console.log('🔄 AuthProvider: Refreshing profile...')
    try {
      await loadUserProfile(user.id)
    } catch (err) {
      console.error('💥 AuthProvider: Profile refresh failed:', err.message)
      setError(err)
    }
  }

  // Clear error state
  const clearError = () => {
    setError(null)
  }

  // Helper: Check if user has specific role
  const hasRole = (role) => {
    return profile?.roles?.includes(role) || false
  }

  // Helper: Check if user has any of the specified roles
  const hasAnyRole = (roles) => {
    if (!profile?.roles || !Array.isArray(profile.roles)) return false
    return roles.some(role => profile.roles.includes(role))
  }

  // Computed values
  const isAuthenticated = !!(user && profile)
  const isNewUser = !!(user && !profile)

  // Context value
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

// Default export
export default AuthProvider