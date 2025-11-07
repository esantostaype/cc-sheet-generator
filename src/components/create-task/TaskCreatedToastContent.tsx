import React from 'react'
interface TaskCreatedToastContentProps {
  assignedUserNames: string
  startDate: string
  endDate: string
}

export const TaskCreatedToastContent: React.FC<TaskCreatedToastContentProps> = ({
  assignedUserNames,
  startDate,
  endDate,
}) => {
  return (
    <div className="flex flex-col gap-y-1 pb-2">
      <h3 className="font-bold text-lg">Task created</h3>
      <p className="text-sm">
        <strong>Assigne(s):</strong> {assignedUserNames}<br />
        <strong>Start Date:</strong> {startDate}<br />
        <strong>Deadline:</strong> {endDate}
      </p>
    </div>
  )
}