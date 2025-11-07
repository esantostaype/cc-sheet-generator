'use client'
import { HugeiconsIcon } from '@hugeicons/react'
import { LabelImportantIcon, Layers01Icon, Queue01Icon, Logout02Icon, SwatchIcon, UserIcon, UserGroup03Icon } from '@hugeicons/core-free-icons'
import Image from 'next/image'
import { CategoriesForm, NavItem, TaskTypesForm, TierListForm } from '@/components'
import { Button } from '@mui/joy'
import { useModalStore } from '@/stores/modalStore'
import { useConfirmationStore } from '@/stores/confirmationStore'
import { useAuth } from '@/contexts/AuthContext'

export const Header = () => {
  const { openModal } = useModalStore()
  const { openConfirmation } = useConfirmationStore()
  const { logout, user } = useAuth()

  const handleTiersClick = () => {
    openModal({
      title: 'Tier List',
      content: <TierListForm />
    })
  }

  const handleTypesClick = () => {
    openModal({
      title: 'Task Types',
      content: <TaskTypesForm />
    })
  }

  const handleCategoriesClick = () => {
    openModal({
      title: 'Categories',
      content: <CategoriesForm />
    })
  }

  const handleLogoutClick = () => {
    openConfirmation({
      title: 'Sign Out',
      description: `Are you sure you want to sign out${user?.email ? ` from ${user.email}` : ''}? You'll need to log in again to access your account.`,
      type: 'warning',
      confirmText: 'Sign Out',
      cancelText: 'Cancel',
      onConfirm: async () => {
        try {
          await logout()
        } catch (error) {
          console.error('Logout failed:', error)
          throw error // Esto mantendrá el loading si hay error
        }
      }
    })
  }

  const navItems = [
    { href: '/tasks', label: 'Tasks', icon: Queue01Icon },
    { href: '/designers', label: 'Designers', icon: UserGroup03Icon },
    { onClick: handleTypesClick, label: 'Types', icon: SwatchIcon },
    { onClick: handleTiersClick, label: 'Tiers', icon: Layers01Icon },
    { onClick: handleCategoriesClick, label: 'Categories', icon: LabelImportantIcon }
  ]

  return (
    <header className="sticky top-0 bg-background/70 backdrop-blur-lg z-50 flex items-center justify-between px-4 border-b border-b-white/10">
      <div className='flex items-center gap-4'>
        <Image src="/images/logo.svg" alt="Assignify" width={132} height={38} />
        <ul className="flex items-center gap-3 text-sm mb-[-1px]">
          {navItems.map((item, index) => (
            <NavItem key={item.href || index} {...item} />
          ))}
        </ul>
      </div>
      
      <div className="flex items-center gap-3">
        {/* User info - opcional */}
        {user && (
          <span className="text-sm text-gray-300 hidden sm:flex sm:items-center sm:gap-1">
            <HugeiconsIcon icon={UserIcon} size={20} />  
            {user.email}
          </span>
        )}
        
        {/* Logout button */}
        <Button 
          size='sm' 
          variant='plain'
          onClick={handleLogoutClick}
          color='danger'
          startDecorator={<HugeiconsIcon icon={Logout02Icon} size={20} strokeWidth={1.5} />}
        >
          Logout
        </Button>
      </div>
    </header>
  )
}