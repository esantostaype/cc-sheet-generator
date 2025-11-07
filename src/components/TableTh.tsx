interface Props {
  children: React.ReactNode
  actions?: boolean
}

export const TableTh = ({ children, actions= false }: Props ) => {
  return <th className={`p-2 first:pl-4 last:pr-4 text-left text-sm font-medium text-gray-300 ${ actions ? "w-[5rem]" : "" }`}>{ children }</th>
}