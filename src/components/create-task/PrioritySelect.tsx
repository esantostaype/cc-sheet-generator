import React from 'react'
import { Select, Option, FormLabel } from '@mui/joy'
import { HugeiconsIcon } from '@hugeicons/react'
import { Flag02Icon } from '@hugeicons/core-free-icons'
import { TextFieldError } from '@/components'

interface PrioritySelectProps {
  value: string
  onChange: (value: string) => void
  touched?: boolean
  error?: string
}

export const PrioritySelect: React.FC<PrioritySelectProps> = ({ 
  value, 
  onChange, 
  touched, 
  error 
}) => (
  <div>
    <FormLabel>
      <HugeiconsIcon
        icon={ Flag02Icon }
        size={ 20 }
        strokeWidth={ 1.5 }
      />
      Priority
    </FormLabel>
    <Select
      value={value}
      onChange={(_, val) => onChange(val as string)}
      placeholder="Normal"
    >
      <Option value="LOW">Low</Option>
      <Option value="NORMAL">Normal</Option>
      <Option value="HIGH">High</Option>
      <Option value="URGENT">Urgent</Option>
    </Select>
    { touched && error && ( <TextFieldError label={ error } /> )}
</div>
)