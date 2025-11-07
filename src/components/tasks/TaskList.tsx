/* eslint-disable @typescript-eslint/no-unused-vars */
import React from "react";
import { TaskCard } from "./TaskCard";
import { HugeiconsIcon } from "@hugeicons/react";
import { TaskIcon } from "@hugeicons/core-free-icons";
import { TaskCardSkeleton } from "./TaskCardSkeleton";
import { mapClickUpStatusToLocal, mapLocalStatusToColumn, getColumnOrder } from "@/utils/clickup-status-mapping-utils";

interface Task {
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
  startDate?: string | null;
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
}

interface TasksListProps {
  tasks: Task[];
  selectedTasks: Set<string>;
  onTaskSelect: (taskId: string, selected: boolean) => void;
  onTaskEdit: (taskId: string) => void;
  loading?: boolean;
  filters?: {
    status?: string;
    priority?: string;
    space?: string;
    assignee?: string;
    syncStatus?: 'all' | 'synced' | 'available';
  };
}

export const TasksList: React.FC<TasksListProps> = ({
  tasks,
  selectedTasks,
  onTaskSelect,
  onTaskEdit,
  loading = false,
  filters = {},
}) => {
  // ✅ MEJORADO: Usar utilidades centralizadas para mapeo de estados
  const mapStatusToColumn = (status: string): string | null => {
    const localStatus = mapClickUpStatusToLocal(status);
    if (localStatus === null) {
      return null; // Task is completed, exclude it
    }
    return mapLocalStatusToColumn(localStatus);
  };

  // Función para ordenar tareas por fecha de vencimiento
  const sortTasksByDueDate = (tasks: Task[]): Task[] => {
    return tasks.sort((a, b) => {
      // Las tareas sin fecha van al final
      if (!a.dueDate && !b.dueDate) return 0;
      if (!a.dueDate) return 1;
      if (!b.dueDate) return -1;
      
      // Ordenar por fecha (más próximas primero)
      return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
    });
  };

  // ✅ ACTUALIZADO: Renderizar skeletons para 3 columnas
  if (loading) {
    const columnOrder = getColumnOrder();
    
    return (
      <div className="space-y-6">
        <div className="flex align-baseline gap-6 h-[calc(100dvh-11.375rem)]">
          {columnOrder.map((column, index) => (
            <div key={column} className="flex flex-[0_0_360px] flex-col overflow-y-auto relative pr-2">
              {/* Column Header */}
              <div className="sticky top-0 pb-2 bg-background flex items-center justify-between z-20">
                <h2 className="font-semibold text-lg">{column}</h2>
                <div className="bg-accent/20 text-accent text-xs size-6 rounded-full animate-pulse">
                </div>
              </div>
              
              {/* Skeleton Tasks - Diferentes cantidades por columna para variedad */}
              <div className="flex-1 space-y-4">
                <TaskCardSkeleton />
                <TaskCardSkeleton />
                {index === 0 && <TaskCardSkeleton />} {/* TO DO tiene una tarea extra */}
                {index === 1 && <TaskCardSkeleton />} {/* IN PROGRESS tiene una tarea extra */}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // ✅ ACTUALIZADO: Filtrar tareas según los filtros aplicados Y excluir completadas
  const filteredTasks = tasks.filter(task => {
    // ✅ NUEVO: Primero filtrar por mapeo de columna (excluye DONE/COMPLETE)
    const column = mapStatusToColumn(task.status);
    if (column === null) return false; // Excluir tareas completadas
    
    // Aplicar otros filtros
    if (filters.status && task.status !== filters.status) return false;
    if (filters.priority && task.priority !== filters.priority) return false;
    if (filters.space && task.space.id !== filters.space) return false;
    if (filters.assignee && !task.assignees.some(a => a.id === filters.assignee)) return false;
    if (filters.syncStatus) {
      if (filters.syncStatus === 'synced' && !task.existsInLocal) return false;
      if (filters.syncStatus === 'available' && task.existsInLocal) return false;
    }
    return true;
  });

  // ✅ ACTUALIZADO: Agrupar tareas por las 3 columnas específicas
  const groupedTasks = filteredTasks.reduce((acc, task) => {
    const column = mapStatusToColumn(task.status);
    if (column) { // Solo procesar si column no es null
      if (!acc[column]) {
        acc[column] = [];
      }
      acc[column].push(task);
    }
    return acc;
  }, {} as Record<string, Task[]>);

  // Ordenar tareas dentro de cada columna
  Object.keys(groupedTasks).forEach(column => {
    groupedTasks[column] = sortTasksByDueDate(groupedTasks[column]);
  });

  // ✅ ACTUALIZADO: Definir el orden de las 3 columnas usando utilidades
  const columnOrder = getColumnOrder();
  const orderedColumns = columnOrder.filter((column: string | number) => groupedTasks[column]?.length > 0);

  if (tasks.length === 0) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-center">
          <HugeiconsIcon
            icon={TaskIcon}
            size={48}
            className="mx-auto mb-4 text-gray-400"
          />
          <h3 className="text-2xl font-medium mb-2">No tasks found</h3>
          <p className="text-gray-400">
            Check ClickUp API configuration or try refreshing
          </p>
        </div>
      </div>
    );
  }

  if (filteredTasks.length === 0) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-center">
          <HugeiconsIcon
            icon={TaskIcon}
            size={48}
            className="mx-auto mb-4 text-gray-400"
          />
          <h3 className="text-2xl font-medium mb-2">No active tasks match your filters</h3>
          <p className="text-gray-400">
            Try adjusting your search criteria or check if tasks are completed
          </p>
        </div>
      </div>
    );
  }

  // ✅ ACTUALIZADO: Siempre mostrar las 3 columnas usando utilidades
  const displayColumns = columnOrder;

  return (
    <div className="space-y-6">
      {/* ✅ ACTUALIZADO: Kanban Board con 3 columnas */}
      <div className="flex align-baseline gap-6 h-[calc(100dvh-11.375rem)]">
        {displayColumns.map((column) => (
          <div key={column} className="flex flex-[0_0_360px] flex-col overflow-y-auto relative pr-2">
            {/* Column Header */}
            <div className="sticky top-0 pb-2 bg-background flex items-center justify-between z-20">
              <h2 className="font-semibold text-lg">{column}</h2>
              <span className="bg-accent/20 text-accent text-xs px-2 py-1 rounded-full">
                {groupedTasks[column]?.length || 0}
              </span>
            </div>
            
            {/* Tasks Column */}
            <div className="flex-1 space-y-4">
              {groupedTasks[column]?.map((task) => (
                <TaskCard
                  key={task.clickupId}
                  task={task}
                  isSelected={selectedTasks.has(task.clickupId)}
                  onSelect={(selected: boolean) => onTaskSelect(task.clickupId, selected)}
                  onEdit={() => onTaskEdit(task.clickupId)}
                  showSelection={!task.existsInLocal}
                />
              )) || (
                // Mostrar mensaje cuando no hay tareas en esta columna
                <div className="text-center text-gray-500 text-sm py-8">
                  No {column.toLowerCase()} tasks
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Summary */}
      {filteredTasks.length !== tasks.length && (
        <div className="text-center text-sm text-gray-500 pt-4 border-t border-white/10">
          Showing {filteredTasks.length} of {tasks.length} active tasks (completed tasks hidden)
        </div>
      )}
    </div>
  );
};