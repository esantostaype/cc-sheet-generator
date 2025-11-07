import React from 'react'
import { HugeiconsIcon } from '@hugeicons/react'
import { PaintBoardIcon, WebDesign01Icon } from '@hugeicons/core-free-icons'

interface TaskKindSwitchProps {
  selectedKind: 'UX/UI' | 'Graphic'
  onKindChange: (kind: 'UX/UI' | 'Graphic') => void
}

export const TaskKindSwitch: React.FC<TaskKindSwitchProps> = ({
  selectedKind,
  onKindChange
}) => {
  const baseStyle = `cursor-pointer flex items-center justify-center gap-2 py-[0.8rem] px-4 text-sm font-semibold transition-colors w-full`;

  const activeStyle = `bg-accent/20 text-white`;
  const inactiveStyle = `bg-transparent border-gray-300 text-gray-400 hover:text-white`;

  return (
    <div className="flex w-full rounded-md overflow-hidden bg-accent/10">
      <button
        type="button"
        className={`${baseStyle} ${selectedKind === 'UX/UI' ? activeStyle : inactiveStyle}`}
        onClick={() => onKindChange('UX/UI')}
      >
        <HugeiconsIcon icon={WebDesign01Icon} size={24} strokeWidth={1.5} />
        UX/UI
      </button>
      <button
        type="button"
        className={`${baseStyle} ${selectedKind === 'Graphic' ? activeStyle : inactiveStyle}`}
        onClick={() => onKindChange('Graphic')}
      >
        <HugeiconsIcon icon={PaintBoardIcon} size={24} strokeWidth={1.5} />
        Graphic
      </button>
    </div>
  )
}
