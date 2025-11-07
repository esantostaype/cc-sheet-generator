import Image from 'next/image'

export const Sidebar = () => {
  return (
    <aside className="top-0 left-0 h-dvh w-64 bg-surface z-50 overflow-y-auto">
      <div><Image src="/images/logo.svg" alt="Assignify" width={ 148 } height={ 26 }></Image></div>
    </aside>
  )
}