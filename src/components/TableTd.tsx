interface Props {
  children: React.ReactNode
}

export const TableTd = ({ children }: Props ) => {
  return <td className="p-2 first:pl-4 last:pr-4">{ children }</td>
}