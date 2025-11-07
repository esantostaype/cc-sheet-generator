'use client'
import { HugeiconsIcon, IconSvgElement } from '@hugeicons/react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

interface NavItemProps {
  label: string
  icon: IconSvgElement
  href?: string
  onClick?: () => void
  isActive?: boolean
}

export const NavItem = ({ label, icon, href, onClick, isActive: providedIsActive }: NavItemProps) => {
  const pathname = usePathname()
  
  const isActive = href ? pathname === href : (providedIsActive || false)

  const commonClasses = `
    cursor-pointer flex gap-1 items-center rounded-md py-2 px-3 group-active:bg-accent/24 group-hover:bg-accent/12 transition-all
    ${isActive ? 'text-white' : 'text-gray-500 group-hover:text-white'}
  `

  const liClasses = `group h-full py-3 border-t-2 ${
    isActive 
      ? 'border-b-2 border-b-accent border-t-transparent' 
      : 'border-b-2 border-b-transparent border-t-transparent'
  }`

  const content = (
    <>
      <HugeiconsIcon icon={icon} size={20} strokeWidth={1.5} />
      {label}
    </>
  )

  return (
    <li className={liClasses}>
      {href ? (
        <Link href={href} className={commonClasses}>
          {content}
        </Link>
      ) : (
        <button onClick={onClick} className={commonClasses}>
          {content}
        </button>
      )}
    </li>
  )
}