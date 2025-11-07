/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import React, { useState, useMemo } from "react";
import {
  Button,
  Select,
  Option,
  FormControl,
  Checkbox,
  IconButton,
  Tooltip,
} from "@mui/joy";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  RefreshIcon,
  DatabaseSync01Icon,
  TaskIcon,
} from "@hugeicons/core-free-icons";
import { TasksList } from "./TaskList";
import { useTaskDataInvalidation } from "@/hooks/useTaskData";
import { toast } from "react-toastify";
import {
  useClickUpTasks,
  useCategories,
  useTaskBrands,
  useSyncTasks,
  useRefreshTasks,
} from "@/hooks/queries/useTasks";

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
  startDate?: string | null; // ✅ AGREGADA: fecha de inicio
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

interface SyncStatistics {
  totalClickUpTasks: number;
  existingInLocal: number;
  availableToSync: number;
  totalLocalTasks: number;
}

export const TasksSync: React.FC = () => {
  const { invalidateAll } = useTaskDataInvalidation();

  // State
  const [selectedTasks, setSelectedTasks] = useState<Set<string>>(new Set());
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null);
  const [selectedBrand, setSelectedBrand] = useState<string | null>(null);

  // Filtros
  const [filters, setFilters] = useState({
    status: "",
    priority: "",
    space: "",
    assignee: "",
    syncStatus: "all" as "all" | "synced" | "available",
    search: "",
  });

  // Queries
  const {
    data: tasksData,
    isLoading: loadingTasks,
    error: tasksError,
  } = useClickUpTasks();

  const {
    data: categories = [],
    isLoading: loadingCategories,
    error: categoriesError,
  } = useCategories();

  const {
    data: brands = [],
    isLoading: loadingBrands,
    error: brandsError,
  } = useTaskBrands();

  // Mutations
  const { mutate: syncTasks, isPending: syncing } = useSyncTasks({
    onSuccess: (data) => {
      const createdCount = data.createdTasks?.length || 0;
      toast.success(`${createdCount} tasks synced successfully`);

      if (data.errors?.length > 0) {
        console.warn("Sync errors:", data.errors);
        toast.warning("Some tasks had errors. Check console for details.");
      }

      setSelectedTasks(new Set());
      invalidateAll();
    },
    onError: (error: any) => {
      console.error("Error syncing tasks:", error);
      const errorMessage = error.response?.data?.error || "Error syncing tasks";
      toast.error(errorMessage);
    },
  });

  const { mutate: refreshTasks, isPending: refreshing } = useRefreshTasks({
    onSuccess: () => {
      toast.success("Tasks refreshed successfully");
    },
    onError: () => {
      toast.error("Error refreshing tasks");
    },
  });

  // Computed values
  const tasks = tasksData?.clickupTasks || [];
  const statistics = tasksData?.statistics;
  const loading = loadingTasks || loadingCategories || loadingBrands;

  // Filtrar tareas
  const filteredTasks = useMemo(() => {
    return tasks.filter((task) => {
      // Filtro de búsqueda
      if (
        filters.search &&
        !task.name.toLowerCase().includes(filters.search.toLowerCase())
      ) {
        return false;
      }

      // Otros filtros
      if (filters.status && task.status !== filters.status) return false;
      if (filters.priority && task.priority !== filters.priority) return false;
      if (filters.space && task.space.id !== filters.space) return false;
      if (
        filters.assignee &&
        !task.assignees.some((a) => a.id === filters.assignee)
      )
        return false;
      if (filters.syncStatus === "synced" && !task.existsInLocal) return false;
      if (filters.syncStatus === "available" && task.existsInLocal) return false;

      return true;
    });
  }, [tasks, filters]);

  // Extraer valores únicos para filtros
  const uniqueStatuses = useMemo(
    () => [...new Set(tasks.map((t) => t.status))],
    [tasks]
  );
  const uniquePriorities = useMemo(
    () => [...new Set(tasks.map((t) => t.priority))],
    [tasks]
  );
  const uniqueSpaces = useMemo(
    () => [
      ...new Set(tasks.map((t) => ({ id: t.space.id, name: t.space.name }))),
    ],
    [tasks]
  );

  const availableTasksCount = useMemo(
    () => filteredTasks.filter((t) => t.canSync).length,
    [filteredTasks]
  );

  const selectedAvailableCount = useMemo(
    () =>
      Array.from(selectedTasks).filter(
        (id) => filteredTasks.find((t) => t.clickupId === id)?.canSync
      ).length,
    [selectedTasks, filteredTasks]
  );

  // Event handlers
  const handleTaskSelect = (taskId: string, selected: boolean) => {
    const newSelection = new Set(selectedTasks);
    if (selected) {
      newSelection.add(taskId);
    } else {
      newSelection.delete(taskId);
    }
    setSelectedTasks(newSelection);
  };

  const handleSelectAll = (selectAll: boolean) => {
    if (selectAll) {
      const availableTasks = filteredTasks.filter((task) => task.canSync);
      setSelectedTasks(new Set(availableTasks.map((task) => task.clickupId)));
    } else {
      setSelectedTasks(new Set());
    }
  };

  const handleSyncSelected = () => {
    if (selectedTasks.size === 0) {
      toast.warning("Please select tasks to sync");
      return;
    }

    if (!selectedBrand) {
      toast.warning("Please select a brand for the tasks");
      return;
    }

    syncTasks({
      taskIds: Array.from(selectedTasks),
      categoryId: selectedCategory,
      brandId: selectedBrand,
    });
  };

  const handleRefresh = () => {
    refreshTasks();
  };

  const handleTaskEdit = (taskId: string) => {
    const task = tasks.find((t) => t.clickupId === taskId);
    if (task?.url) {
      window.open(task.url, "_blank");
    }
  };

  // Error handling
  if (tasksError || categoriesError || brandsError) {
    return (
      <div className="flex flex-col h-full items-center justify-center">
        <div className="text-center">
          <HugeiconsIcon
            icon={TaskIcon}
            size={48}
            className="mx-auto mb-4 text-red-400"
          />
          <h3 className="text-2xl font-medium mb-2 text-red-400">
            Error Loading Data
          </h3>
          <p className="text-gray-400 mb-4">
            {tasksError?.message ||
              categoriesError?.message ||
              brandsError?.message ||
              "Unknown error occurred"}
          </p>
          <Button
            variant="soft"
            color="primary"
            onClick={handleRefresh}
            startDecorator={<HugeiconsIcon icon={RefreshIcon} size={16} />}
          >
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      <div className="sticky top-16 bg-background/70 backdrop-blur-lg z-50">
        <div className="p-4 flex items-center justify-between border-b border-b-white/10">
          <h1 className="flex items-center gap-2 text-2xl font-medium">
            <HugeiconsIcon icon={TaskIcon} size={32} strokeWidth={1} />
            ClickUp Tasks Sync
          </h1>
          <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
            <div className="flex items-center gap-4">
              <Checkbox
                checked={
                  selectedAvailableCount === availableTasksCount &&
                  availableTasksCount > 0
                }
                indeterminate={
                  selectedAvailableCount > 0 &&
                  selectedAvailableCount < availableTasksCount
                }
                onChange={(e) => handleSelectAll(e.target.checked)}
                label="Select Available"
                size="sm"
                sx={{ alignItems: "center" }}
                disabled={loading}
              />
            </div>
            
            <FormControl className="flex-1 max-w-xs">
              <Select
                placeholder="Select brand..."
                value={selectedBrand}
                onChange={(_, value) => setSelectedBrand(value)}
                required
                size="sm"
                sx={{ width: 200 }}
                disabled={loadingBrands}
              >
                <Option value={null}>Select Brand</Option>
                {brands.map((brand) => (
                  <Option key={brand.id} value={brand.id}>
                    {brand.name}
                  </Option>
                ))}
              </Select>
            </FormControl>

            <FormControl className="flex-1 max-w-xs">
              <Select
                placeholder="Select category..."
                value={selectedCategory}
                onChange={(_, value) => setSelectedCategory(value)}
                size="sm"
                sx={{ width: 200 }}
                disabled={loadingCategories}
              >
                <Option value={null}>Select Category</Option>
                {categories.map((category) => (
                  <Option key={category.id} value={category.id}>
                    {category.name} ({category.type.name} - Tier{" "}
                    {category.tierList.name})
                  </Option>
                ))}
              </Select>
            </FormControl>

            <Button
              startDecorator={
                <HugeiconsIcon icon={DatabaseSync01Icon} size={16} />
              }
              onClick={handleSyncSelected}
              disabled={!selectedBrand || selectedTasks.size === 0 || syncing}
              loading={syncing}
              color="primary"
              size="sm"
            >
              Sync ({selectedTasks.size})
            </Button>
            
            <Tooltip title="Refresh tasks from ClickUp">
              <IconButton
                size="sm"
                variant="soft"
                onClick={handleRefresh}
                loading={refreshing}
                disabled={refreshing}
              >
                <HugeiconsIcon icon={RefreshIcon} size={16} />
              </IconButton>
            </Tooltip>
          </div>
        </div>
      </div>
      
      <div className="p-6 flex-1 flex flex-col">

        {/* Tasks List */}
        <TasksList
          tasks={filteredTasks}
          selectedTasks={selectedTasks}
          onTaskSelect={handleTaskSelect}
          onTaskEdit={handleTaskEdit}
          loading={loading}
          filters={filters}
        />
      </div>
    </div>
  );
};