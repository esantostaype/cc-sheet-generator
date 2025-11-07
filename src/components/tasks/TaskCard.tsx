import React from "react";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  Calendar03Icon,
  UserIcon,
  Edit02Icon,
  DatabaseSync01Icon,
  CheckmarkSquare02Icon,
  Flag02Icon
} from "@hugeicons/core-free-icons";
import { Avatar, Checkbox, IconButton } from "@mui/joy";

interface TaskCardProps {
  task: {
    clickupId: string;
    customId?: string | null;
    name: string;
    description: string;
    status: string;
    statusColor: string;
    priority: string;
    priorityColor: string;
    assignees: Array<{
      id: string;
      name: string;
      email: string;
      initials: string;
      color: string;
    }>;
    dueDate?: string | null;
    startDate?: string | null; // ✅ NUEVO: Agregada fecha de inicio
    timeEstimate?: number | null;
    tags: string[];
    list: {
      id: string;
      name: string;
    };
    space: {
      id: string;
      name: string;
    };
    url: string;
    existsInLocal: boolean;
    canSync: boolean;
  };
  isSelected?: boolean;
  onSelect?: (selected: boolean) => void;
  onEdit?: () => void;
  showSelection?: boolean;
}

export const TaskCard: React.FC<TaskCardProps> = ({
  task,
  isSelected = false,
  onSelect,
  onEdit,
  showSelection = true,
}) => {
  // ✅ NUEVA FUNCIÓN: Formatear fecha y hora
  const formatDateTime = (dateString: string) => {
    const date = new Date(dateString);
    
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
      'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    
    const month = monthNames[date.getMonth()];
    const day = date.getDate();
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    
    return `${month} ${day}, ${hours}:${minutes}`;
  };

  // ✅ NUEVA FUNCIÓN: Crear el rango de fechas
  const formatDateRange = () => {
    if (!task.dueDate) return null;

    const dueDateTime = formatDateTime(task.dueDate);
    
    // Si tenemos fecha de inicio, mostrar rango
    if (task.startDate) {
      const startDateTime = formatDateTime(task.startDate);
      return `${startDateTime} - ${dueDateTime}`;
    }
    
    // Si no tenemos fecha de inicio, solo mostrar fecha de vencimiento
    return `Due: ${dueDateTime}`;
  };

  // ✅ NUEVA FUNCIÓN: Determinar color según urgencia
  const getDateColor = () => {
    if (!task.dueDate) return "text-gray-400";
    
    const dueDate = new Date(task.dueDate);
    const now = new Date();
    const diffTime = dueDate.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays < 0 && task.status !== 'in_progress') {
      return "text-red-400"; // Overdue
    } else if (diffDays === 0) {
      return "text-orange-400"; // Due today  
    } else if (diffDays <= 1) {
      return "text-yellow-400"; // Due soon
    } else {
      return "text-gray-300"; // Normal
    }
  };

  const dateRange = formatDateRange();
  const dateColor = getDateColor();

  return (
    <div
      className={`
      p-4 rounded-lg relative
      transition-all border-2
      flex flex-col justify-between
      ${
        task.existsInLocal
          ? "bg-white/4 border-transparent"
          : isSelected
          ? "bg-accent/10 border-accent/30"
          : "bg-accent/10 border-transparent hover:bg-accent/20"
      }
    `}
    >
      <div className="flex justify-between items-center">
        {showSelection && !task.existsInLocal && onSelect && (
          <Checkbox
            checked={isSelected}
            onChange={(event) => onSelect(event.target.checked)}
          />
        )}

        {/* Edit button for existing tasks */}
        {task.existsInLocal && onEdit && (
          <IconButton
            size="sm"
            variant="soft"
            color="primary"
            onClick={onEdit}
          >
            <HugeiconsIcon icon={Edit02Icon} size={16} />
          </IconButton>
        )}
        {task.existsInLocal ? (
          <div className="flex items-center gap-1 text-xs uppercase text-accent-400">
            <HugeiconsIcon icon={DatabaseSync01Icon} size={16} />
            Synced
          </div>
        ) : (
          <div className="flex items-center gap-1 text-xs uppercase text-green-400">
            <HugeiconsIcon icon={CheckmarkSquare02Icon} size={16} />
            Available
          </div>
        )}
      </div>

      {/* Task Info */}
      <h3 className="font-semibold leading-tight line-clamp-2 mt-4 mb-2">{task.name}</h3>

      {/* Space and List */}
      <div className="text-xs text-gray-500">
        <div>In {task.list.name}</div>
      </div>

      {/* Assignees */}
      {task.assignees.length > 0 && (
        <div className="flex items-center gap-2 my-4">
          <HugeiconsIcon icon={UserIcon} size={16} className="text-gray-400" />
          <div className="flex -space-x-2">
            {task.assignees.slice(0, 3).map((assignee, index) => (
              <Avatar
                key={assignee.id}
                size="sm"
                sx={{
                  width: 24,
                  height: 24,
                  bgcolor: assignee.color,
                  fontSize: "0.7rem",
                  zIndex: task.assignees.length - index,
                }}
                title={`${assignee.name} (${assignee.email})`}
              >
                <span className="mt-[2px]">{assignee.initials}</span>
              </Avatar>
            ))}
            {task.assignees.length > 3 && (
              <div className="flex items-center justify-center w-6 h-6 bg-gray-600 rounded-full text-xs text-white">
                +{task.assignees.length - 3}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Task Details */}
      <div className="space-y-2 text-sm">
        {/* ✅ NUEVA SECCIÓN: Date Range con formato mejorado */}
        {dateRange && (
          <div className="flex items-center gap-1">
            <HugeiconsIcon
              icon={Calendar03Icon}
              size={16}
              className="text-gray-300 flex-shrink-0"
            />
            <div 
              className={`${dateColor} text-sm font-medium mt-[2px]`}
              style={{
                fontSize: '11px',
                lineHeight: '1.2'
              }}
            >
              {dateRange}
            </div>
          </div>
        )}
      </div>

      {/* Status and Priority Header */}
      <div className="flex items-center justify-between mt-6 capitalize">
        <div className="flex items-center gap-1 text-sm" style={{ color: task.priorityColor }}>
          <span>
            <HugeiconsIcon
              icon={Flag02Icon}
              size={16}
            />
          </span>
          <span>{task.priority}</span>
        </div>
      </div>
    </div>
  );
};