// src/context/AuthContext.js - FIXED VERSION - Prevents infinite re-renders
import React, { createContext, useContext, useEffect, useState, useMemo, useCallback } from 'react'
import { supabase } from '../utils/supabase'

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

  // ✅ FIXED: Memoized loadUserProfile function to prevent re-creates
  const loadUserProfile = useCallback(async (authUserId) => {
    console.log('👤 AuthProvider: Loading profile for auth user:', authUserId)
    
    try {
      const { data, error } = await supabase
        .from('registrant_profiles')
        .select('*')
        .eq('user_id', authUserId)
        .single()

      if (error) {
        if (error.code === 'PGRST116') {
          console.log('ℹ️ AuthProvider: No profile found (may still be creating via trigger)')
          setProfile(null)
          return
        }
        console.error('❌ AuthProvider: Profile query error:', error.message)
        throw error
      }

      if (data) {
        console.log('✅ AuthProvider: Profile loaded successfully:', {
          registrant_id: data.id,
          auth_user_id: authUserId
        })
        setProfile(data)
        setError(null)
      } else {
        console.log('ℹ️ AuthProvider: No profile data returned')
        setProfile(null)
      }
    } catch (err) {
      console.error('💥 AuthProvider: Profile loading failed:', err.message)
      throw err
    }
  }, [])

  // Initialize auth state on mount
  useEffect(() => {
    console.log('🔐 AuthProvider: Initializing auth state...')
    
    let mounted = true

    const initializeAuth = async () => {
      try {
        // Get current session
        console.log('🔐 AuthProvider: Checking for existing session...')
        const { data: { session }, error: sessionError } = await supabase.auth.getSession()
        
        if (!mounted) return

        if (sessionError) {
          console.error('❌ AuthProvider: Session error:', sessionError.message)
          setUser(null)
          setProfile(null)
          setLoading(false)
          setError(null)
          return
        }

        if (session?.user) {
          console.log('✅ AuthProvider: Active session found, loading profile...')
          setUser(session.user)
          
          // Load profile - simplified since trigger should have created it
          try {
            await loadUserProfile(session.user.id)
          } catch (profileErr) {
            console.error('⚠️ AuthProvider: Profile load failed:', profileErr)
            setProfile(null)
          }
        } else {
          console.log('ℹ️ AuthProvider: No active session')
          setUser(null)
          setProfile(null)
        }

        setLoading(false)
        setError(null)

      } catch (err) {
        if (mounted) {
          console.error('💥 AuthProvider: Init failed:', err.message)
          setUser(null)
          setProfile(null)
          setLoading(false)
          setError(null)
        }
      }
    }

    // Set up auth state listener
    console.log('🔐 AuthProvider: Setting up auth state listener...')
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
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
        
        // Profile should be created by database trigger, so just load it
        // Add small delay to allow trigger to complete
        setTimeout(async () => {
          try {
            await loadUserProfile(session.user.id)
          } catch (err) {
            console.error('❌ AuthProvider: Profile load after sign in failed:', err)
            setProfile(null)
          }
          setLoading(false)
        }, 1000) // 1 second delay for trigger to complete
        
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
      subscription?.unsubscribe()
    }
  }, [loadUserProfile])

  // ✅ FIXED: Memoized auth methods to prevent re-creates
  const signUp = useCallback(async (email, password, userData) => {
    console.log('🔐 AuthProvider: Starting sign up for:', email)
    setLoading(true)
    setError(null)

    try {
      const { data, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            first_name: userData.first_name || '',
            last_name: userData.last_name || '',
            roles: userData.roles || [userData.role || 'applicant']  // ✅ Pass array!
          }
        }
      })

      if (signUpError) {
        console.error('❌ AuthProvider: Sign up error:', signUpError.message)
        setError(signUpError)
        setLoading(false)
        return { data: null, error: signUpError }
      }

      console.log('✅ AuthProvider: Sign up successful - database trigger will create profile')
      setLoading(false)
      return { data, error: null }

    } catch (err) {
      console.error('💥 AuthProvider: Sign up failed:', err.message)
      const error = { message: err.message, code: 'signup_exception' }
      setError(error)
      setLoading(false)
      return { data: null, error }
    }
  }, [])

  const signIn = useCallback(async (email, password) => {
    console.log('🔐 AuthProvider: Starting sign in for:', email)
    setLoading(true)
    setError(null)

    try {
      const { data, error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password
      })

      if (signInError) {
        console.error('❌ AuthProvider: Sign in error:', signInError.message)
        setError(signInError)
        setLoading(false)
        return { data: null, error: signInError }
      }

      console.log('✅ AuthProvider: Sign in successful')
      setLoading(false)
      return { data, error: null }

    } catch (err) {
      console.error('💥 AuthProvider: Sign in failed:', err.message)
      const error = { message: err.message, code: 'signin_exception' }
      setError(error)
      setLoading(false)
      return { data: null, error }
    }
  }, [])

  const signOut = useCallback(async () => {
    console.log('🔐 AuthProvider: Starting sign out...')
    setLoading(true)

    try {
      const { error: signOutError } = await supabase.auth.signOut()

      if (signOutError) {
        console.error('❌ AuthProvider: Sign out error:', signOutError.message)
      }

      // Always clear local state
      console.log('✅ AuthProvider: Clearing local auth state')
      setUser(null)
      setProfile(null)
      setError(null)
      setLoading(false)

      return { error: null }

    } catch (err) {
      console.error('💥 AuthProvider: Sign out failed:', err.message)
      
      // Clear local state even on failure
      console.log('🔧 AuthProvider: Force clearing local state')
      setUser(null)
      setProfile(null)
      setError(null)
      setLoading(false)
      
      return { error: null }
    }
  }, [])

  const refreshProfile = useCallback(async () => {
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
  }, [user?.id, loadUserProfile])

  const clearError = useCallback(() => {
    setError(null)
  }, [])

  // ✅ FIXED: Memoized helper functions
  const hasRole = useCallback((role) => {
    return profile?.roles?.includes(role) || false
  }, [profile?.roles])

  const hasAnyRole = useCallback((roles) => {
    if (!profile?.roles || !Array.isArray(profile.roles)) return false
    return roles.some(role => profile.roles.includes(role))
  }, [profile?.roles])

  // ✅ FIXED: Memoized computed values
  const isAuthenticated = useMemo(() => !!(user && profile), [user, profile])
  const isNewUser = useMemo(() => !!(user && !profile), [user, profile])

  // ✅ FIXED: Memoized context value to prevent unnecessary re-renders
  const value = useMemo(() => ({
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
  }), [
    user, 
    profile, 
    loading, 
    error, 
    isAuthenticated, 
    isNewUser,
    signUp,
    signIn,
    signOut,
    refreshProfile,
    clearError,
    hasRole,
    hasAnyRole
  ])

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

// Default export
export default AuthProvider