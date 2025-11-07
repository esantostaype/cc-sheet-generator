import React from 'react'
import { Field } from 'formik'
import { FormLabel, Input } from '@mui/joy'
import { HugeiconsIcon } from '@hugeicons/react'
import { Note01Icon } from '@hugeicons/core-free-icons'
import { TextFieldError } from '@/components'

interface TaskNameFieldProps {
  touched?: boolean
  error?: string
}

export const TaskNameField: React.FC<TaskNameFieldProps> = ({ touched, error }) => (
  <div>
    <FormLabel>
      <HugeiconsIcon
        icon={ Note01Icon }
        size={ 20 }
        strokeWidth={ 1.5 }
      />
      Task Name
    </FormLabel>
    <Field
      as={Input}
      name="name"
      error={touched && !!error}
      placeholder="Enter a Task Name"
    />
    { touched && error && ( <TextFieldError label={ error } /> )}
  </div>
)