interface Props {
  icon: React.ReactNode
}

export default function TextFieldLayout({ children, icon }: { children: React.ReactNode } & Props) {
  return (
    <div className="flex gap-3">
      <div>
        { icon }
      </div>
      <div className='flex-1'>
        { children }
      </div>
    </div>
  )
}