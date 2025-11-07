// src/components/ProtectedRoute.tsx - VERSIÓN OPTIMIZADA
'use client'

import React from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { Box, CircularProgress, Typography } from '@mui/joy'

interface ProtectedRouteProps {
  children: React.ReactNode
  fallback?: React.ReactNode
}

export function ProtectedRoute({ children, fallback }: ProtectedRouteProps) {
  const { user, loading } = useAuth()

  // Mostrar loading mientras se verifica la autenticación
  if (loading) {
    return (
      fallback || (
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            minHeight: '100vh',
            gap: 2,
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          }}
        >
          <CircularProgress size="lg" />
          <Typography level="body-md" color="neutral">
            Verifying authentication...
          </Typography>
        </Box>
      )
    )
  }

  // Si no está autenticado, el middleware se encargará de la redirección
  // Pero mostramos un mensaje por si acaso
  if (!user) {
    return (
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '100vh',
          gap: 2,
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        }}
      >
        <Typography level="h4" color="neutral">
          Access Denied
        </Typography>
        <Typography level="body-md" color="neutral">
          Redirecting to login...
        </Typography>
        <CircularProgress size="sm" />
      </Box>
    )
  }

  // Usuario autenticado, mostrar contenido
  return <>{children}</>
}

// Hook personalizado optimizado
export function useRequireAuth() {
  const { user, loading } = useAuth()
  
  return {
    user,
    loading,
    isAuthenticated: !!user && !loading,
    isUnauthenticated: !user && !loading
  }
}