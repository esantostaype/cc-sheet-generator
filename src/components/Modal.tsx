/* eslint-disable @typescript-eslint/no-explicit-any */
// src/components/Modal.tsx - Versión con Framer Motion
'use client'

import React, { useEffect } from 'react'
import { useModalStore, ModalSize } from '@/stores/modalStore'
import { HugeiconsIcon } from '@hugeicons/react'
import { Cancel01Icon } from '@hugeicons/core-free-icons'
import { motion, AnimatePresence, Variants } from 'framer-motion'
import { IconButton } from '@mui/joy'

const sizeClasses: Record<ModalSize, string> = {
  sm: 'max-w-md',
  md: 'max-w-3xl',
  lg: 'max-w-5xl',
}

const customEase = [0.32, 0.72, 0, 1] as const

// Variantes de animación para el backdrop
const backdropVariants: Variants = {
  hidden: { 
    opacity: 0
  },
  visible: { 
    opacity: 1,
    transition: {
      duration: 0.4,
      ease: customEase as any
    }
  },
  exit: { 
    opacity: 0,
    transition: {
      duration: 0.4,
      ease: customEase
    }
  }
}

// Variantes de animación para el modal
const modalVariants: Variants = {
  hidden: { 
    opacity: 0,
    y: 200
  },
  visible: { 
    opacity: 1,
    y: 0,
    transition: {
      type: "spring" as const,
      stiffness: 300,
      damping: 30,
      mass: 0.8
    }
  },
  exit: { 
    opacity: 0,
    y: 200,
    transition: {
      duration: 0.4,
      ease: customEase
    }
  }
}

export const GlobalModal: React.FC = () => {
  const { isOpen, title, content, size, closeModal } = useModalStore()

  // Handle ESC key
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && isOpen) {
        closeModal()
      }
    }

    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown)
      document.body.style.overflow = 'hidden'
    }

    return () => {
      document.removeEventListener('keydown', handleKeyDown)
      document.body.style.overflow = 'unset'
    }
  }, [isOpen, closeModal])

  return (
    <AnimatePresence mode="wait">
      {isOpen && (
        <div className="fixed inset-0 z-[99] flex items-center justify-center">
          {/* Backdrop animado */}
          <motion.div
            className="absolute inset-0 bg-surface/90"
            variants={backdropVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            onClick={closeModal}
          />
          
          {/* Modal animado */}
          <motion.div
            className={`
              relative w-full mx-4 max-h-[90vh] overflow-hidden
              bg-background rounded-xl shadow-2xl
              ${sizeClasses[size]}
            `}
            variants={modalVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-8 py-4 pr-4 border-b border-white/10">
              <h2 className="text-xl font-semibold text-white">
                {title}
              </h2>
              <IconButton variant='plain' size='sm' onClick={closeModal}>
                <HugeiconsIcon icon={Cancel01Icon} size={20} />
              </IconButton>
            </div>
            
            {/* Content con animación de entrada */}
            <motion.div 
              className="overflow-y-auto max-h-[calc(90vh-88px)]"
              initial={{ opacity: 0, y: 20 }}
              animate={{ 
                opacity: 1, 
                y: 0,
                transition: { delay: 0.1, duration: 0.3 }
              }}
              exit={{ opacity: 0, y: 20 }}
            >
              {content}
            </motion.div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}

// Instalación requerida:
// npm install framer-motion