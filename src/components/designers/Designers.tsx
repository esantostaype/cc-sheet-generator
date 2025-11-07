/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
// src/components/designers/Designers.tsx - FIXED VERSION
'use client'

import React, { useState, useMemo } from 'react'
import { toast } from 'react-toastify'
import { DesignersHeader } from './DesignersHeader'
import { UsersList } from './UsersList'
import { UserEditModal } from './UserEditModal'
import { useModalStore } from '@/stores/modalStore'
import {
  useClickUpUsers,
  useSyncUsers,
  useAddUserRole,
  useDeleteUserRole,
  useAddUserVacation,
  useDeleteUserVacation,
} from '@/hooks/queries/useUsers'

export const ClickUpUsersSync: React.FC = () => {
  // State
  const [selectedUsers, setSelectedUsers] = useState<Set<string>>(new Set())
  const [searchFilter, setSearchFilter] = useState('')
  const [editingUserId, setEditingUserId] = useState<string | null>(null)

  // Modal store
  const { openModal, closeModal } = useModalStore()

  // Queries
  const { 
    data: usersData, 
    isLoading, 
    refetch: refreshUsers 
  } = useClickUpUsers()

  // Mutations
  const { mutate: syncUsers, isPending: syncing } = useSyncUsers({
    onSuccess: (data) => {
      const { statistics, notFoundUsers, errors } = data

      let successMessage = `${statistics.created} users synced successfully`

      if (notFoundUsers && notFoundUsers.length > 0) {
        successMessage += ` (${notFoundUsers.length} not found in teams)`
      }

      if (errors && errors.length > 0) {
        successMessage += ` (${errors.length} errors)`
      }

      toast.success(successMessage)

      if (notFoundUsers && notFoundUsers.length > 0) {
        toast.warning(`Users not found in teams: ${notFoundUsers.join(', ')}`)
      }

      if (errors && errors.length > 0) {
        console.warn('Errors during sync:', errors)
        toast.warning('Some users had errors. Check console for details.')
      }

      setSelectedUsers(new Set())
    },
    onError: (error: any) => {
      console.error('❌ Sync error:', error)
      const message = error.response?.data?.error || error.message
      toast.error(`Sync error: ${message}`)
    },
  })

  const { mutate: addRole, isPending: addingRole } = useAddUserRole({
    onSuccess: () => {
      toast.success('Role added successfully')
    },
    onError: () => {
      toast.error('Error adding role')
    },
  })

  const { mutate: addVacation, isPending: addingVacation } = useAddUserVacation({
    onSuccess: () => {
      toast.success('Vacation added successfully')
    }
  })

  // Computed values
  const clickupUsers = usersData?.clickupUsers || []
  
  const filteredUsers = useMemo(() => {
    return clickupUsers.filter((user) => {
      const matchesSearch =
        user.name.toLowerCase().includes(searchFilter.toLowerCase()) ||
        user.email.toLowerCase().includes(searchFilter.toLowerCase())
      return matchesSearch
    })
  }, [clickupUsers, searchFilter])

  const availableUsers = useMemo(() => {
    return filteredUsers.filter((user) => user.canSync)
  }, [filteredUsers])

  const allAvailableSelected = useMemo(() => {
    return availableUsers.length > 0 &&
      availableUsers.every((user) => selectedUsers.has(user.clickupId))
  }, [availableUsers, selectedUsers])

  // Event handlers
  const handleUserSelection = (userId: string, checked: boolean) => {
    const newSelection = new Set(selectedUsers)

    if (checked) {
      newSelection.add(userId)
    } else {
      newSelection.delete(userId)
    }

    setSelectedUsers(newSelection)
    console.log(`${checked ? 'Selected' : 'Deselected'} user: ${userId}`)
  }

  const handleSelectAll = () => {
    if (allAvailableSelected) {
      const newSelection = new Set(selectedUsers)
      availableUsers.forEach((user) => newSelection.delete(user.clickupId))
      setSelectedUsers(newSelection)
    } else {
      const newSelection = new Set(selectedUsers)
      availableUsers.forEach((user) => newSelection.add(user.clickupId))
      setSelectedUsers(newSelection)
    }
  }

  const handleSync = () => {
    if (selectedUsers.size === 0) {
      toast.warning('Select at least one user to sync')
      return
    }

    syncUsers(Array.from(selectedUsers))
  }

  const handleRefresh = () => {
    refreshUsers()
  }

  const handleEditUser = (userId: string) => {
    setEditingUserId(userId)
    
    openModal({
      title: `Edit User: ${clickupUsers.find(u => u.clickupId === userId)?.name}`,
      content: (
        <UserEditModalWrapper
          userId={userId}
          onAddRole={(typeId, brandId) => {
            addRole({ 
              userId, 
              typeId, 
              brandId: brandId || null 
            })
          }}
          onAddVacation={(startDate, endDate) => {
            addVacation({ userId, startDate, endDate })
          }}
          loadingStates={{
            addingRole,
            addingVacation,
          }}
        />
      ),
      onClose: () => setEditingUserId(null),
    })
  }

  return (
    <>
      <DesignersHeader
        searchValue={searchFilter}
        onSearchChange={setSearchFilter}
        selectedCount={selectedUsers.size}
        availableCount={availableUsers.length}
        allAvailableSelected={allAvailableSelected}
        onSelectAll={handleSelectAll}
        onSync={handleSync}
        onRefresh={handleRefresh}
        loading={isLoading}
        syncing={syncing}
      />

      <div className="p-6 flex-1">
        <UsersList
          users={filteredUsers}
          selectedUsers={selectedUsers}
          onUserSelect={handleUserSelection}
          onUserEdit={handleEditUser}
          loading={isLoading}
        />
      </div>
    </>
  )
}

// ✅ Wrapper component to handle mutations properly within modal context
interface UserEditModalWrapperProps {
  userId: string
  onAddRole: (typeId: number, brandId?: string) => void
  onAddVacation: (startDate: string, endDate: string) => void
  loadingStates: {
    addingRole?: boolean
    addingVacation?: boolean
  }
}

const UserEditModalWrapper: React.FC<UserEditModalWrapperProps> = ({
  userId,
  onAddRole,
  onAddVacation,
  loadingStates
}) => {
  // ✅ Create deletion mutations with proper userId context
  const { mutate: deleteRole } = useDeleteUserRole(userId, {
    onSuccess: () => {
      toast.success('Role removed successfully')
    },
    onError: () => {
      toast.error('Error removing role')
    },
  })

  const { mutate: deleteVacation } = useDeleteUserVacation(userId, {
    onSuccess: () => {
      toast.success('Vacation removed successfully')
    },
    onError: () => {
      toast.error('Error removing vacation')
    },
  })

  return (
    <UserEditModal
      userId={userId}
      onAddRole={onAddRole}
      onDeleteRole={(roleId) => deleteRole(roleId)}
      onAddVacation={onAddVacation}
      onDeleteVacation={(vacationId) => deleteVacation(vacationId)}
      loadingStates={loadingStates}
    />
  )
}