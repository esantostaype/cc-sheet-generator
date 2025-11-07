export const TaskCardSkeleton: React.FC = () => {
  return (
    <div className="p-4 rounded-lg bg-accent/10 border-2 border-transparent animate-pulse">
      {/* Header with checkbox and status */}
      <div className="flex justify-between items-center mb-4">
        <div className="size-6 bg-white/20 rounded"></div>
        <div className="flex items-center gap-1">
          <div className="w-4 h-4 bg-white/20 rounded"></div>
          <div className="w-16 h-3 bg-white/20 rounded"></div>
        </div>
      </div>

      {/* Task title */}
      <div className="space-y-2 mb-4">
        <div className="h-4 bg-white/20 rounded w-3/4"></div>
        <div className="h-3 bg-white/10 rounded w-1/2"></div>
      </div>

      {/* Space/List info */}
      <div className="h-3 bg-white/10 rounded w-2/3 mb-4"></div>

      {/* Assignees */}
      <div className="flex items-center gap-2 mb-4">
        <div className="w-4 h-4 bg-white/20 rounded"></div>
        <div className="flex -space-x-2">
          <div className="w-6 h-6 bg-white/20 rounded-full"></div>
        </div>
      </div>

      {/* Due date */}
      <div className="flex items-center gap-2 mb-6">
        <div className="w-4 h-4 bg-white/20 rounded"></div>
        <div className="h-3 bg-white/15 rounded w-20"></div>
      </div>

      {/* Priority */}
      <div className="flex items-center gap-1">
        <div className="w-4 h-4 bg-white/20 rounded"></div>
        <div className="h-3 bg-white/15 rounded w-16"></div>
      </div>
    </div>
  );
};