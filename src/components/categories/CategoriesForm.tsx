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
  Modal,
  ModalDialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Select,
  Option,
} from "@mui/joy";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  Add01Icon,
  Delete02Icon,
  LabelImportantIcon,
} from "@hugeicons/core-free-icons";
import { useTaskDataInvalidation } from "@/hooks/useTaskData";
import axios from "axios";
import { toast } from "react-toastify";
import { TableTd, TableTh } from "@/components";
import { useConfirmationStore } from "@/stores/confirmationStore";

interface Category {
  id: number;
  name: string;
  tierId: number;
  typeId: number;
  tierList: {
    id: number;
    name: string;
    duration: number;
  };
  type: {
    id: number;
    name: string;
  };
}

interface TaskType {
  id: number;
  name: string;
}

interface Tier {
  id: number;
  name: string;
  duration: number;
}

const CategorySkeleton: React.FC = () => (
  <tr className="border-t border-white/5 animate-pulse">
    <TableTd>
      <div className="h-3 bg-white/10 rounded w-64"></div>
    </TableTd>
    <TableTd>
      <div className="h-3 bg-white/5 rounded w-20"></div>
    </TableTd>
    <TableTd>
      <div className="h-3 bg-white/5 rounded w-24"></div>
    </TableTd>
    <TableTd>
      <div className="size-8 bg-white/10 rounded"></div>
    </TableTd>
  </tr>
);

export const CategoriesForm: React.FC = () => {
  const { invalidateAll } = useTaskDataInvalidation();

  const [categories, setCategories] = useState<Category[]>([]);
  const [types, setTypes] = useState<TaskType[]>([]);
  const [tiers, setTiers] = useState<Tier[]>([]);

  const [editingId, setEditingId] = useState<number | null>(null);
  const [editingName, setEditingName] = useState("");
  const [originalName, setOriginalName] = useState("");

  const [newCategoryName, setNewCategoryName] = useState("");
  const [newCategoryTypeId, setNewCategoryTypeId] = useState<number | null>(
    null
  );
  const [newCategoryTierId, setNewCategoryTierId] = useState<number | null>(
    null
  );

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState<number | null>(null);
  const [filterTypeId, setFilterTypeId] = useState<number | null>(null);

  const filteredCategories = React.useMemo(() => {
    if (!filterTypeId) return categories;
    return categories.filter((category) => category.typeId === filterTypeId);
  }, [categories, filterTypeId]);

  // También agregar un contador para mostrar cuántas categorías se están mostrando:
  const getCategoryCountText = () => {
    const total = categories.length;
    const filtered = filteredCategories.length;

    if (!filterTypeId) {
      return `${total} categories`;
    }

    const selectedType = types.find((t) => t.id === filterTypeId);
    return `${filtered} of ${total} categories (${
      selectedType?.name || "Unknown"
    })`;
  };

  const { openConfirmation } = useConfirmationStore();

  useEffect(() => {
    // Auto-seleccionar el tipo filtrado al crear nueva categoría
    if (filterTypeId && !newCategoryTypeId) {
      setNewCategoryTypeId(filterTypeId);
    }
  }, [filterTypeId, newCategoryTypeId]);

  // Cargar datos iniciales
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [categoriesRes, typesRes, tiersRes] = await Promise.all([
          axios.get("/api/categories"),
          axios.get("/api/types"),
          axios.get("/api/tiers"),
        ]);

        setCategories(categoriesRes.data);
        setTypes(typesRes.data);
        setTiers(tiersRes.data);
      } catch (error) {
        console.error("Error loading data:", error);
        toast.error("Error loading categories data");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // Iniciar edición
  const startEditing = (category: Category) => {
    setEditingId(category.id);
    setEditingName(category.name);
    setOriginalName(category.name);
  };

  // Cancelar edición
  const cancelEditing = () => {
    setEditingId(null);
    setEditingName("");
    setOriginalName("");
  };

  // Guardar edición
  const saveEdit = async () => {
    if (!editingId || !editingName.trim()) return;

    // Si no cambió nada, solo cancelar sin toast
    if (editingName.trim() === originalName) {
      cancelEditing();
      return;
    }

    try {
      setSaving(true);
      await axios.patch(`/api/categories/${editingId}`, {
        name: editingName.trim(),
      });

      // Actualizar localmente
      setCategories((prev) =>
        prev.map((category) =>
          category.id === editingId
            ? { ...category, name: editingName.trim() }
            : category
        )
      );

      cancelEditing();
      invalidateAll();
      toast.success("Category updated successfully");
    } catch (error) {
      console.error("Error updating category:", error);
      toast.error("Error updating category");
    } finally {
      setSaving(false);
    }
  };

  // Agregar nueva categoría
  const addNewCategory = async () => {
    if (!newCategoryName.trim() || !newCategoryTypeId || !newCategoryTierId) {
      toast.error("Please fill all fields");
      return;
    }

    try {
      setSaving(true);
      const response = await axios.post("/api/categories", {
        name: newCategoryName.trim(),
        typeId: newCategoryTypeId,
        tierId: newCategoryTierId,
      });

      setCategories((prev) => [...prev, response.data]);
      setNewCategoryName("");
      setNewCategoryTypeId(null);
      setNewCategoryTierId(null);
      invalidateAll();
      toast.success("Category created successfully");
    } catch (error: any) {
      console.error("Error creating category:", error);
      const errorMessage =
        error.response?.data?.error || "Error creating category";
      toast.error(errorMessage);
    } finally {
      setSaving(false);
    }
  };

  // Eliminar categoría
  const deleteCategory = async (categoryId: number) => {
    try {
      setDeleting(categoryId);
      await axios.delete(`/api/categories/${categoryId}`);

      setCategories((prev) =>
        prev.filter((category) => category.id !== categoryId)
      );
      invalidateAll();
      toast.success("Category deleted successfully");
    } catch (error: any) {
      console.error("Error deleting category:", error);
      const errorMessage =
        error.response?.data?.error || "Error deleting category";
      toast.error(errorMessage);
    } finally {
      setDeleting(null);
    }
  };

  // Nueva función para confirmar eliminación:
  const confirmDelete = (category: Category) => {
    openConfirmation({
      title: "Delete Category",
      description: `Are you sure you want to delete the category "${category.name}"? This action cannot be undone and may affect existing tasks.`,
      type: "danger",
      confirmText: "Delete Category",
      cancelText: "Cancel",
      onConfirm: () => deleteCategory(category.id),
    });
  };

  // Handle key press
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      if (editingId) {
        saveEdit();
      } else {
        addNewCategory();
      }
    } else if (e.key === "Escape") {
      cancelEditing();
    }
  };
  return (
    <div>
      {/* Existing Categories Table */}
      {/* Filter and Categories Section */}
      {(categories.length > 0 || loading) && (
        <div className="p-8">
          {!loading && (
          <div className="mb-2 flex items-center gap-4 justify-between">
            <div className="flex items-center gap-4">
              <Select
                placeholder="All Types"
                value={filterTypeId}
                onChange={(_, value) => setFilterTypeId(value)}
                size="sm"
                sx={{ minWidth: 200 }}
              >
                <Option value={null}>All Types</Option>
                {types.map((type) => (
                  <Option key={type.id} value={type.id}>
                    {type.name}
                  </Option>
                ))}
              </Select>
            </div>

            {/* Category Count */}
            <div className="text-sm text-gray-400">
              {getCategoryCountText()}
            </div>
          </div>)}

          {/* Categories Table */}
          {loading ? (
            // Skeleton mientras carga
            <div className="border border-white/10 rounded-lg overflow-hidden">
              <table className="w-full text-sm">
                <thead className="bg-white/5">
                  <tr>
                    <TableTh>
                      <span>Name</span>
                    </TableTh>
                    <TableTh>
                      <span>Type</span>
                    </TableTh>
                    <TableTh>
                      <span>Tier</span>
                    </TableTh>
                    <TableTh>
                      <span>Actions</span>
                    </TableTh>
                  </tr>
                </thead>
                <tbody>
                  {/* 3 filas de skeleton */}
                  <CategorySkeleton />
                  <CategorySkeleton />
                  <CategorySkeleton />
                </tbody>
              </table>
            </div>
          ) : filteredCategories.length > 0 ? (
            // Tabla real con datos
            <div className="border border-white/10 rounded-lg overflow-hidden">
              <table className="w-full text-sm">
                <thead className="bg-white/5">
                  <tr>
                    <TableTh>
                      <span>Name</span>
                    </TableTh>
                    <TableTh>
                      <span>Type</span>
                    </TableTh>
                    <TableTh>
                      <span>Tier</span>
                    </TableTh>
                    <TableTh>
                      <span>Actions</span>
                    </TableTh>
                  </tr>
                </thead>
                <tbody>
                  {filteredCategories.map((category) => (
                    <tr key={category.id} className="border-t border-white/5">
                      <TableTd>
                        {editingId === category.id ? (
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
                            onClick={() => startEditing(category)}
                            className="cursor-pointer hover:text-accent transition-colors"
                            title="Click to edit"
                          >
                            {category.name}
                          </span>
                        )}
                      </TableTd>
                      <TableTd>
                        <span className="text-sm text-gray-400">
                          {category.type.name}
                        </span>
                      </TableTd>
                      <TableTd>
                        <span className="text-sm text-gray-400">
                          Tier {category.tierList.name} (
                          {category.tierList.duration}h)
                        </span>
                      </TableTd>
                      <TableTd>
                        <IconButton
                          size="sm"
                          color="danger"
                          variant="soft"
                          onClick={() => confirmDelete(category)}
                          loading={deleting === category.id}
                          disabled={editingId === category.id}
                        >
                          <HugeiconsIcon icon={Delete02Icon} size={16} />
                        </IconButton>
                      </TableTd>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            // Empty state cuando el filtro no tiene resultados
            <div className="border border-white/10 rounded-lg p-12 text-center">
              <div className="text-gray-400">
                <HugeiconsIcon
                  icon={LabelImportantIcon}
                  size={48}
                  className="mx-auto mb-2 opacity-50"
                />
                <h3 className="text-lg font-medium">No categories found</h3>
                <p className="text-sm mb-4">
                  {filterTypeId
                    ? `No categories found for the selected task type.`
                    : "No categories available."}
                </p>
                {filterTypeId && (
                  <Button
                    variant="soft"
                    size="sm"
                    onClick={() => setFilterTypeId(null)}
                    className="mt-3"
                  >
                    Show All Categories
                  </Button>
                )}
              </div>
            </div>
          )}
        </div>
      )}
      {/* Add New Category */}
      <div className="sticky bottom-0 z-50 bg-background p-8 border-t border-t-white/10">
        <FormLabel>Add New Category</FormLabel>
        <div className="space-y-3">
          <Input
            placeholder="Enter category name..."
            value={newCategoryName}
            onChange={(e) => setNewCategoryName(e.target.value)}
            onKeyDown={handleKeyPress}
            size="md"
            className="w-full"
            disabled={saving || editingId !== null}
          />

          <div className="grid grid-cols-2 gap-2">
            <Select
              placeholder="Select task type"
              value={newCategoryTypeId}
              onChange={(_, value) => setNewCategoryTypeId(value)}
              disabled={saving || editingId !== null}
            >
              {types.map((type) => (
                <Option key={type.id} value={type.id}>
                  {type.name}
                </Option>
              ))}
            </Select>

            <Select
              placeholder="Select tier"
              value={newCategoryTierId}
              onChange={(_, value) => setNewCategoryTierId(value)}
              disabled={saving || editingId !== null}
            >
              {tiers.map((tier) => (
                <Option key={tier.id} value={tier.id}>
                  Tier {tier.name} (
                  {tier.duration + `${tier.duration > 1 ? " days" : " day"}`})
                </Option>
              ))}
            </Select>
          </div>

          <Button
            startDecorator={<HugeiconsIcon icon={Add01Icon} size={16} />}
            onClick={addNewCategory}
            disabled={
              !newCategoryName.trim() ||
              !newCategoryTypeId ||
              !newCategoryTierId ||
              saving ||
              editingId !== null
            }
            loading={saving && !editingId}
            color="primary"
            className="w-full"
          >
            Add Category
          </Button>
        </div>

        {/* Instructions */}
        <div className="mt-6 pt-4 border-t border-white/10">
          <p className="text-sm text-gray-500 text-center">
            Click on a category name to edit it • Press Enter to save • Press
            Escape to cancel
          </p>
        </div>
      </div>
    </div>
  );
};
