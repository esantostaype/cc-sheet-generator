/* eslint-disable react/no-unescaped-entities */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import React, { useState, useEffect } from "react";
import {
  Button,
  Input,
  IconButton,
  LinearProgress,
  Alert,
  FormLabel,
} from "@mui/joy";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  Add01Icon,
  Delete02Icon,
  SwatchIcon,
} from "@hugeicons/core-free-icons";
import { useTaskDataInvalidation } from "@/hooks/useTaskData";
import axios from "axios";
import { toast } from "react-toastify";
import { TableTd, TableTh } from "@/components";
import { useConfirmationStore } from "@/stores/confirmationStore";

interface TaskType {
  id: number;
  name: string;
  description?: string;
  color?: string;
  categories: any[];
}

// Agregar este componente dentro del archivo, antes del componente principal:
const TaskTypeSkeleton: React.FC = () => (
  <tr className="border-t border-white/5 animate-pulse">
    <TableTd>
      <div className="h-3 bg-white/10 rounded w-32"></div>
    </TableTd>
    <TableTd>
      <div className="h-3 bg-white/5 rounded w-20"></div>
    </TableTd>
    <TableTd>
      <div className="size-8 bg-white/10 rounded"></div>
    </TableTd>
  </tr>
);

export const TaskTypesForm: React.FC = () => {
  const { invalidateAll } = useTaskDataInvalidation();

  const [types, setTypes] = useState<TaskType[]>([]);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editingName, setEditingName] = useState("");
  const [newTypeName, setNewTypeName] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState<number | null>(null);
  const { openConfirmation } = useConfirmationStore();

  // Cargar types
  useEffect(() => {
    const fetchTypes = async () => {
      try {
        setLoading(true);
        const response = await axios.get("/api/types");
        setTypes(response.data);
      } catch (error) {
        console.error("Error loading types:", error);
        toast.error("Error loading task types");
      } finally {
        setLoading(false);
      }
    };
    fetchTypes();
  }, []);

  // Iniciar edición
  const startEditing = (type: TaskType) => {
    setEditingId(type.id);
    setEditingName(type.name);
  };

  // Cancelar edición
  const cancelEditing = () => {
    setEditingId(null);
    setEditingName("");
  };

  // Guardar edición
  const saveEdit = async () => {
    if (!editingId || !editingName.trim()) return;

    try {
      setSaving(true);
      await axios.patch(`/api/types/${editingId}`, {
        name: editingName.trim(),
      });

      // Actualizar localmente
      setTypes((prev) =>
        prev.map((type) =>
          type.id === editingId ? { ...type, name: editingName.trim() } : type
        )
      );

      setEditingId(null);
      setEditingName("");
      invalidateAll();
      toast.success("Task type updated successfully");
    } catch (error) {
      console.error("Error updating type:", error);
      toast.error("Error updating task type");
    } finally {
      setSaving(false);
    }
  };

  // Agregar nuevo type
  const addNewType = async () => {
    if (!newTypeName.trim()) return;

    try {
      setSaving(true);
      const response = await axios.post("/api/types", {
        name: newTypeName.trim(),
      });

      setTypes((prev) => [...prev, response.data]);
      setNewTypeName("");
      invalidateAll();
      toast.success("Task type created successfully");
    } catch (error: any) {
      console.error("Error creating type:", error);
      const errorMessage =
        error.response?.data?.error || "Error creating task type";
      toast.error(errorMessage);
    } finally {
      setSaving(false);
    }
  };

  // Eliminar type
  const deleteType = async (typeId: number, typeName: string) => {
    try {
      setDeleting(typeId);
      await axios.delete(`/api/types/${typeId}`);

      setTypes((prev) => prev.filter((type) => type.id !== typeId));
      invalidateAll();
      toast.success("Task type deleted successfully");
    } catch (error: any) {
      console.error("Error deleting type:", error);
      const errorMessage =
        error.response?.data?.error || "Error deleting task type";
      toast.error(errorMessage);
    } finally {
      setDeleting(null);
    }
  };

  // Nueva función para confirmar eliminación:
  const confirmDelete = (type: TaskType) => {
    const categoriesCount = type.categories?.length || 0;
    const hasCategories = categoriesCount > 0;

    openConfirmation({
      title: "Delete Task Type",
      description: `Are you sure you want to delete the task type "${
        type.name
      }"?${
        hasCategories
          ? ` This will also delete ${categoriesCount} categories and may affect existing tasks.`
          : " This action cannot be undone."
      }`,
      type: "danger",
      confirmText: "Delete Task Type",
      cancelText: "Cancel",
      onConfirm: () => deleteType(type.id, type.name),
    });
  };

  // Handle key press
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      if (editingId) {
        saveEdit();
      } else {
        addNewType();
      }
    } else if (e.key === "Escape") {
      cancelEditing();
    }
  };

  return (
    <div className="p-8">
      {/* Existing Types Table */}
      {loading || types.length > 0 ? (
        <div className="mb-6">
          <div className="border border-white/10 rounded-lg overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-white/5">
                <tr>
                  <TableTh>
                    <span>Name</span>
                  </TableTh>
                  <TableTh>
                    <span>Categories</span>
                  </TableTh>
                  <TableTh actions>
                    <span>Actions</span>
                  </TableTh>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <>
                    <TaskTypeSkeleton />
                    <TaskTypeSkeleton />
                  </>
                ) : (
                  // Datos reales
                  types.map((type) => (
                    <tr key={type.id} className="border-t border-white/5">
                      <TableTd>
                        {editingId === type.id ? (
                          <Input
                            value={editingName}
                            onChange={(e) => setEditingName(e.target.value)}
                            onKeyDown={handleKeyPress}
                            onBlur={saveEdit}
                            autoFocus
                            size="sm"
                            className="w-full"
                          />
                        ) : (
                          <span
                            onClick={() => startEditing(type)}
                            className="cursor-pointer hover:text-accent transition-colors w-[10rem]"
                            title="Click to edit"
                          >
                            {type.name}
                          </span>
                        )}
                      </TableTd>
                      <TableTd>
                        <div>
                          <span className="text-sm text-gray-500">
                            {type.categories?.length || 0} categories
                          </span>
                        </div>
                      </TableTd>
                      <TableTd>
                        <div>
                          <IconButton
                            size="sm"
                            color="danger"
                            variant="soft"
                            onClick={() => confirmDelete(type)}
                            loading={deleting === type.id}
                            disabled={editingId === type.id}
                          >
                            <HugeiconsIcon icon={Delete02Icon} size={16} />
                          </IconButton>
                        </div>
                      </TableTd>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      ) : null}

      {/* Add New Type */}
      <div>
        <FormLabel>Add New Task Type</FormLabel>
        <div className="flex gap-2">
          <Input
            placeholder="Enter task type name..."
            value={newTypeName}
            onChange={(e) => setNewTypeName(e.target.value)}
            onKeyDown={handleKeyPress}
            size="md"
            className="flex-1"
            disabled={loading || saving || editingId !== null} // ✅ Agregar loading
          />
          <Button
            startDecorator={<HugeiconsIcon icon={Add01Icon} size={16} />}
            onClick={addNewType}
            disabled={
              loading || !newTypeName.trim() || saving || editingId !== null
            } // ✅ Agregar loading
            loading={saving && !editingId}
            color="primary"
          >
            Add Type
          </Button>
        </div>
      </div>

      {/* Instructions */}
      <div className="mt-6 pt-4 border-t border-white/10">
        <p className="text-sm text-gray-500 text-center">
          Click on a task type name to edit it • Press Enter to save • Press
          Escape to cancel
        </p>
      </div>
    </div>
  );
};
