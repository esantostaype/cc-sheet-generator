/* eslint-disable react/no-unescaped-entities */
/* eslint-disable @typescript-eslint/no-explicit-any */
import React from "react";
import {
  Autocomplete,
  FormLabel,
  RadioGroup,
  Radio,
  Box,
} from "@mui/joy";
import { TaskCategory } from "@/interfaces";
import { HugeiconsIcon } from "@hugeicons/react";
import { LabelImportantIcon, Layers01Icon } from "@hugeicons/core-free-icons";
import { TextFieldError } from "@/components";
import { Tier } from "@prisma/client";

// ✅ Tipo unificado para todas las opciones
interface CategoryOption {
  label: string;
  value: string;
  isExisting: boolean;
  category?: TaskCategory & { typeName: string };
}

interface CategorySelectProps {
  categories: (TaskCategory & { typeName: string })[];
  value: string | null;
  onChange: (
    value: string | null,
    isNew?: boolean,
    newCategoryName?: string
  ) => void;
  onCategoryChange: () => void;
  touched?: boolean;
  error?: string;
  loading?: boolean;
  selectedTier: Tier | null;
  onTierChange: (tier: Tier | null) => void;
  showTierSelection?: boolean;
  // ✅ Nueva prop para notificar cuando se está escribiendo
  onTypingNewCategory?: (isTyping: boolean) => void;
  // ✅ NUEVO: Props para validación de tier
  tierTouched?: boolean;
  tierError?: string;
}

export const CategorySelect: React.FC<CategorySelectProps> = ({
  categories,
  value,
  onChange,
  onCategoryChange,
  touched,
  error,
  loading = false,
  selectedTier,
  onTierChange,
  showTierSelection = false,
  onTypingNewCategory, // ✅ Nueva prop
  tierTouched, // ✅ NUEVO
  tierError, // ✅ NUEVO
}) => {
  // ✅ Estado para el texto actual del input
  const [inputValue, setInputValue] = React.useState('');

  // Determinar si la categoría actual es nueva
  const isNewCategory = value
    ? !categories.find((cat) => cat.id.toString() === value)
    : false;

  // ✅ Determinar si el input actual es una nueva categoría
  const isInputNewCategory = React.useMemo(() => {
    if (!inputValue.trim()) return false;
    
    // Verificar si el input coincide exactamente con alguna categoría existente
    const existingCategory = categories.find(
      (cat) => cat.name.toLowerCase() === inputValue.toLowerCase()
    );
    
    return !existingCategory;
  }, [inputValue, categories]);

  // ✅ Efecto para sincronizar inputValue con value
  React.useEffect(() => {
    if (value && isNewCategory) {
      setInputValue(value);
    } else if (!value) {
      setInputValue('');
    }
  }, [value, isNewCategory]);

  // ✅ Efecto para notificar al padre cuando se está escribiendo nueva categoría
  React.useEffect(() => {
    if (onTypingNewCategory) {
      onTypingNewCategory(isInputNewCategory);
    }
  }, [isInputNewCategory, onTypingNewCategory]);

  // ✅ Crear opciones del autocomplete (solo CategoryOption[])
  const autocompleteOptions = React.useMemo((): CategoryOption[] => {
    return categories.map((cat) => ({
      label: cat.name,
      value: cat.id.toString(),
      isExisting: true,
      category: cat,
    }));
  }, [categories]);

  // ✅ Encontrar la opción seleccionada - siempre CategoryOption o null
  const selectedOption = React.useMemo((): CategoryOption | null => {
    if (!value) return null;

    // Buscar en categorías existentes
    const existingCategory = categories.find(
      (cat) => cat.id.toString() === value
    );
    if (existingCategory) {
      return {
        label: existingCategory.name,
        value: existingCategory.id.toString(),
        isExisting: true,
        category: existingCategory,
      };
    }

    // ✅ Para nuevas categorías, crear un CategoryOption temporal
    return {
      label: value,
      value: value,
      isExisting: false,
      // category es undefined para nuevas categorías
    };
  }, [value, categories]);

  const handleAutocompleteChange = (event: any, newValue: CategoryOption | string | null) => {
    if (!newValue) {
      onChange(null);
      onCategoryChange();
      return;
    }

    // Si es string (texto libre desde freeSolo), es nueva categoría
    if (typeof newValue === "string") {
      const trimmedValue = newValue.trim();
      if (trimmedValue) {
        onChange(trimmedValue, true, trimmedValue);
        onCategoryChange();
      }
      return;
    }

    // Si es CategoryOption
    if (newValue.isExisting && newValue.category) {
      // Categoría existente
      onChange(newValue.value, false);
      onCategoryChange();
    } else {
      // Nueva categoría (CategoryOption sin category)
      const trimmedLabel = newValue.label.trim();
      if (trimmedLabel) {
        onChange(trimmedLabel, true, trimmedLabel);
        onCategoryChange();
      }
    }
  };

  const getPlaceholder = () => {
    if (loading) return "Loading categories...";
    return "Search or type new category";
  };

  // ✅ Función para obtener el label (ahora solo maneja CategoryOption)
  const getOptionLabel = (option: CategoryOption | string) => {
    if (typeof option === "string") return option;
    return option.label;
  };

  // ✅ Función para comparar opciones
  const isOptionEqualToValue = (option: CategoryOption, value: CategoryOption) => {
    return option.value === value.value && option.isExisting === value.isExisting;
  };

  return (
    <div>
      <FormLabel>
        <HugeiconsIcon icon={LabelImportantIcon} size={20} strokeWidth={1.5} />
        Category
        {isNewCategory && (
          <span
            style={{
              color: "var(--joy-palette-warning-500)",
              marginLeft: "4px",
            }}
          >
            (New)
          </span>
        )}
      </FormLabel>

      <Autocomplete
        placeholder={getPlaceholder()}
        value={selectedOption}
        onChange={handleAutocompleteChange}
        onInputChange={(event, newInputValue) => {
          // ✅ Actualizar el estado del input en tiempo real
          setInputValue(newInputValue);
          
          // ✅ NUEVO: Actualizar el valor del formulario en tiempo real para nuevas categorías
          if (newInputValue.trim()) {
            // Verificar si es una categoría existente
            const existingCategory = categories.find(
              (cat) => cat.name.toLowerCase() === newInputValue.toLowerCase()
            );
            
            if (!existingCategory) {
              // Es una nueva categoría, actualizar el valor
              onChange(newInputValue.trim(), true, newInputValue.trim());
            }
          } else {
            // Si está vacío, limpiar
            onChange(null);
          }
        }}
        inputValue={inputValue}
        options={autocompleteOptions}
        freeSolo
        clearOnBlur={false}
        selectOnFocus
        handleHomeEndKeys
        disabled={loading}
        getOptionLabel={getOptionLabel}
        isOptionEqualToValue={isOptionEqualToValue}
        filterOptions={(options, { inputValue }) => {
          // ✅ Ahora options es siempre CategoryOption[]
          const filtered = options.filter((option) =>
            option.label.toLowerCase().includes(inputValue.toLowerCase())
          );
          return filtered;
        }}
        renderOption={(props, option, { selected }) => (
          <li
            {...props}
            className={`px-3 py-2 cursor-pointer transition-colors ${
              selected ? "bg-[var(--soft-bg-success)]" : ""
            } hover:bg-[var(--soft-bg-hover)] active:bg-[var(--soft-bg-active)]`}
          >
            {option.label}
          </li>
        )}
        noOptionsText={loading ? "Loading..." : "Type to create a new category"}
      />

      {/* ✅ ERROR DE CATEGORÍA */}
      {touched && error && <TextFieldError label={error} />}

      {/* ✅ Mostrar selección de Tier cuando el input es una nueva categoría O cuando showTierSelection es true */}
      {(isInputNewCategory || showTierSelection) && (
        <Box sx={{ mt: 2 }}>
          <FormLabel sx={{ mt: 2 }}>
            <HugeiconsIcon icon={Layers01Icon} size={20} strokeWidth={1.5} />
            New Category Tier
            {isInputNewCategory && (
              <span
                style={{
                  color: "var(--joy-palette-success-500)",
                  marginLeft: "4px",
                  fontSize: "0.75rem",
                }}
              >
                for "{inputValue}"
              </span>
            )}
          </FormLabel>
          <RadioGroup
            orientation="horizontal"
            value={selectedTier}
            onChange={(event) => onTierChange(event.target.value as Tier)}
            sx={{ mb: 2 }}
          >
            {Object.values(Tier).map((tierValue) => (
              <Radio
                key={tierValue}
                value={tierValue}
                label={tierValue}
                size="sm"
                sx={{ display: 'flex', alignItems: 'center' }}
              />
            ))}
          </RadioGroup>
          
          {/* ✅ NUEVO: ERROR DE TIER */}
          {tierTouched && tierError && <TextFieldError label={tierError} />}
        </Box>
      )}
    </div>
  );
};