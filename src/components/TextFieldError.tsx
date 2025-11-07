interface Props {
  label: string
}

export const TextFieldError = ({ label }: Props) => {
  return (
    <div className="text-sm text-red-400 mt-[0.375rem]">{ label }</div>
  )
}