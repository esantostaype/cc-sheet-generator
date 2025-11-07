/* eslint-disable @typescript-eslint/no-explicit-any */

import React from 'react'
import { useFormikContext } from 'formik'
import { FormLabel, Input } from '@mui/joy'
import { HugeiconsIcon } from '@hugeicons/react'
import { DateTimeIcon } from '@hugeicons/core-free-icons'
import { FormValues } from '@/interfaces'
import { formatDaysToReadable } from '@/utils/duration-utils'
import { TextFieldError, TextFieldHelp } from '@/components'

interface ExtendedFormValues extends FormValues {
  isNewCategory: boolean
}

interface DurationFieldProps {
  fetchingSuggestion: boolean
  touched?: boolean
  error?: string
  isTypingNewCategory?: boolean
  onDurationComplete?: (duration: string) => void
  allCategories?: any[]
  // ✅ NUEVO: Props para mejor integración con sugerencias
  onDurationChange?: (duration: string) => void
  suggestionChanged?: boolean
  suggestedUser?: { name: string } | null
}

export const DurationField: React.FC<DurationFieldProps> = ({
  fetchingSuggestion,
  touched, 
  error,
  isTypingNewCategory = false,
  onDurationComplete,
  allCategories = [],
  onDurationChange, // ✅ NUEVO
}) => {
  const { values, setFieldValue } = useFormikContext<ExtendedFormValues>()
  
  const [localInputValue, setLocalInputValue] = React.useState('')
  const [hasManualEdit, setHasManualEdit] = React.useState(false)
  // ✅ NUEVO: Estado para detectar si estamos aplicando automáticamente
  const [isApplyingAutomatic, setIsApplyingAutomatic] = React.useState(false)
  
  const numberOfAssignees = values.assignedUserIds.length
  const originalDuration = parseFloat(localInputValue) || 0
  const effectiveDuration = numberOfAssignees > 0 ? originalDuration / numberOfAssignees : originalDuration

  // Sincronizar con Formik cuando cambia el valor externamente (ej. cambio de categoría)
  React.useEffect(() => {
    const currentFormikValue = values.durationDays as string || '';
    
    if (currentFormikValue !== localInputValue && !hasManualEdit) {
      console.log(`🔄 Syncing duration from Formik: "${currentFormikValue}"`);
      setIsApplyingAutomatic(true);
      setLocalInputValue(currentFormikValue);
      
      // Reset flag después de un corto delay
      setTimeout(() => {
        setIsApplyingAutomatic(false);
      }, 100);
    }
  }, [values.durationDays, hasManualEdit, localInputValue]);

  // Determinar la fuente de la duración
  const getDurationSource = () => {
    if (isApplyingAutomatic) {
      return 'applying'
    }
    
    if (isTypingNewCategory || values.isNewCategory) {
      return 'manual'
    }
    
    if (hasManualEdit) {
      return 'manual'
    }
    
    if (fetchingSuggestion) {
      return 'calculating'
    }
    
    if (localInputValue && !values.isNewCategory && values.categoryId) {
      const selectedCategory = allCategories.find(cat => cat.id.toString() === values.categoryId)
      if (selectedCategory && selectedCategory.tierList?.duration.toString() === localInputValue) {
        return 'category'
      }
    }
    
    if (localInputValue && !fetchingSuggestion) {
      return 'suggested'
    }
    
    return null
  }

  // Determinar si mostrar indicador y su texto/color
  const getStatusIndicator = () => {
    const source = getDurationSource()
    
    switch (source) {
      case 'applying':
        return { text: "(Applying...)", color: 'var(--joy-palette-primary-400)' }
      case 'manual':
        return { text: "(Manual)", color: 'var(--joy-palette-warning-500)' }
      case 'calculating':
        return { text: "(Calculating...)", color: 'var(--joy-palette-primary-500)' }
      case 'category':
        return { text: "(From Category)", color: 'var(--joy-palette-success-500)' }
      case 'suggested':
        return { text: "(Suggested)", color: 'var(--joy-palette-info-500)' }
      default:
        return null
    }
  }

  const statusIndicator = getStatusIndicator()

  const getPlaceholder = () => {
    if (fetchingSuggestion) {
      return "Calculating suggested duration..."
    }
    if (values.isNewCategory) {
      return "Enter duration in days"
    }
    return "Duration in days"
  }

  // ✅ MEJORADO: Manejar cambios del usuario con detección mejorada
  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = event.target.value
    setLocalInputValue(newValue)
    setFieldValue('durationDays', newValue)
    
    // ✅ MEJORADO: Detectar cambio manual solo si no estamos aplicando automáticamente
    if (!isApplyingAutomatic) {
      // Verificar si el usuario realmente cambió algo manualmente
      if (newValue.trim() !== '') {
        if (!values.isNewCategory && values.categoryId) {
          // Para categorías existentes, verificar si es diferente a la duración por defecto
          const selectedCategory = allCategories.find(cat => cat.id.toString() === values.categoryId)
          if (selectedCategory?.tierList?.duration) {
            const categoryDuration = selectedCategory.tierList.duration.toString()
            if (newValue !== categoryDuration) {
              console.log(`🔧 Manual edit detected: ${newValue} vs category default: ${categoryDuration}`)
              setHasManualEdit(true)
            }
          }
        } else {
          // Para nuevas categorías, cualquier input es manual
          console.log(`🔧 Manual input for new category: ${newValue}`)
          setHasManualEdit(true)
        }
      }
    }

    // ✅ NUEVO: Notificar cambio inmediatamente para recálculo de sugerencias
    if (onDurationChange && newValue.trim() && !isApplyingAutomatic) {
      const duration = parseFloat(newValue)
      if (duration > 0) {
        console.log('⏰ Duration changed in real-time:', newValue)
        onDurationChange(newValue)
      }
    }
  }

  const handleBlur = (event: React.FocusEvent<HTMLInputElement>) => {
    if (!event || !event.target) {
      console.error('❌ handleBlur: event or event.target is undefined', { event });
      return;
    }

    const value = event.target.value.trim()
    
    if (onDurationComplete && value && !isApplyingAutomatic) {
      const durationValue = parseFloat(value)
      if (durationValue > 0) {
        console.log('⏰ Duration completed by user:', value)
        onDurationComplete(value)
      }
    }
  }

  // ✅ CORREGIDO: Resetear estado manual cuando cambia la categoría
  React.useEffect(() => {
    console.log(`🔄 Category changed, resetting manual edit state`)
    setHasManualEdit(false)
  }, [values.categoryId, values.isNewCategory])

  return (
    <div>
      <FormLabel>
        <HugeiconsIcon
          icon={DateTimeIcon}
          size={20}
          strokeWidth={1.5}
        />
        Duration
        {/* Mostrar indicador de estado dinámico */}
        {statusIndicator && (
          <span style={{ color: statusIndicator.color, marginLeft: '4px' }}>
            {statusIndicator.text}
          </span>
        )}
      </FormLabel>
      
      <Input
        name="durationDays"
        type="number"
        value={localInputValue}
        onChange={handleInputChange}
        onBlur={handleBlur}
        placeholder={getPlaceholder()}
        error={touched && !!error}
        disabled={fetchingSuggestion && !hasManualEdit}
        slotProps={{
          input: {
            step: 0.1,
          },
        }}
      />

      {/* Mostrar información de duración efectiva */}
      {numberOfAssignees > 1 && originalDuration > 0 && (
        <TextFieldHelp>
          Effective duration per user: <strong>{formatDaysToReadable(effectiveDuration)}</strong>
          <br />
          ({numberOfAssignees} users working in parallel)
        </TextFieldHelp>
      )}
      
      {numberOfAssignees === 1 && originalDuration > 0 && (
        <TextFieldHelp>
          Total duration: {formatDaysToReadable(originalDuration)}
        </TextFieldHelp>
      )}
      
      {touched && error && <TextFieldError label={error} />}
    </div>
  )
}