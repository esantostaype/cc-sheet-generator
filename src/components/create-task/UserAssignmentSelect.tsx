/* eslint-disable react/no-unescaped-entities */
"use client";

import React, { useState, useEffect, useRef } from "react";
import { Select, Option, Chip, FormLabel, Button, Alert } from "@mui/joy";
import { User } from "@/interfaces";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  UserCheck01Icon,
  RefreshIcon,
  SparklesIcon,
  Calendar04Icon,
  Clock03Icon,
  Brain02Icon,
} from "@hugeicons/core-free-icons";
import { TextFieldError } from "@/components";
import { useEnhancedUsers } from "@/hooks";

interface UserAssignmentSelectProps {
  users: User[]; // Fallback users
  values: string[];
  info?: { categoryId: string; brandId: string }
  onChange: (value: string[]) => void;
  suggestedUser?: User | null;
  fetchingSuggestion: boolean;
  touched: boolean | undefined;
  error: string | undefined;
  loading?: boolean;
  userHasManuallyChanged?: boolean;
  onApplySuggestion?: () => void;
  // Props for enhanced analysis
  typeId?: number;
  brandId?: string;
  durationDays?: number;
}

export const UserAssignmentSelect: React.FC<UserAssignmentSelectProps> = ({
  users,
  values,
  info,
  onChange,
  suggestedUser,
  fetchingSuggestion,
  touched,
  error,
  loading = false,
  userHasManuallyChanged = false,
  onApplySuggestion,
  typeId,
  brandId,
  durationDays,
}) => {
  // State for vacation warnings
  const [vacationWarnings, setVacationWarnings] = useState<string[]>([]);
  
  // ✅ NUEVO: Ref para trackear la última sugerencia aplicada
  const lastAppliedSuggestionRef = useRef<string | null>(null);
  
  // ✅ NUEVO: Ref para trackear si estamos en proceso de cambio de categoría
  const categoryChangeInProgressRef = useRef(false);

  // Enhanced users hook
  const {
    allUsers,
    smartSuggestion,
    totalAvailable,
    loading: loadingEnhanced,
    hasRequiredParams,
    getUserById,
    getVacationWarning,
  } = useEnhancedUsers({
    typeId,
    brandId,
    durationDays: durationDays ? parseFloat(durationDays.toString()) : undefined,
    enabled: Boolean(typeId && durationDays),
  });

  // Determine which users to show
  const usersToShow = hasRequiredParams ? allUsers : users;
  const isUsingEnhancedUsers = hasRequiredParams && !loadingEnhanced;
  
  // Determine loading state
  const isLoading = loading || loadingEnhanced || fetchingSuggestion;

  // ✅ NUEVO: Detectar cuando se limpia la selección (indicativo de cambio de categoría)
  useEffect(() => {
    if (values.length === 0 && !fetchingSuggestion) {
      console.log('🔄 Detected category change - selection cleared');
      categoryChangeInProgressRef.current = true;
      lastAppliedSuggestionRef.current = null;
      
      // Reset flag after a short delay to allow new suggestions to be applied
      const timeout = setTimeout(() => {
        categoryChangeInProgressRef.current = false;
      }, 200);
      
      return () => clearTimeout(timeout);
    }
  }, [values.length, fetchingSuggestion]);

  // ✅ MEJORADO: Auto-select suggested user cuando aparece sugerencia
  useEffect(() => {
    // No aplicar si estamos en proceso de búsqueda
    if (fetchingSuggestion) {
      return;
    }

    // No aplicar si no hay sugerencia
    if (!suggestedUser?.id) {
      return;
    }

    // No aplicar si ya está seleccionado
    if (values.includes(suggestedUser.id)) {
      lastAppliedSuggestionRef.current = suggestedUser.id;
      return;
    }

    // No aplicar si ya aplicamos esta misma sugerencia antes
    if (lastAppliedSuggestionRef.current === suggestedUser.id) {
      return;
    }

    // ✅ CONDICIÓN PRINCIPAL: Solo aplicar automáticamente si:
    // 1. No hay selección actual (values.length === 0) O
    // 2. Estamos en proceso de cambio de categoría Y no hay cambios manuales
    const shouldAutoApply = (
      values.length === 0 || 
      (categoryChangeInProgressRef.current && !userHasManuallyChanged)
    );

    if (!shouldAutoApply) {
      return;
    }

    // ✅ APLICAR CON PROTECCIÓN CONTRA LOOPS
    console.log(`🤖 Auto-selecting suggested user: ${suggestedUser.name}`);
    
    // Usar requestAnimationFrame para evitar loops sincrónicos
    requestAnimationFrame(() => {
      onChange([suggestedUser.id]);
      lastAppliedSuggestionRef.current = suggestedUser.id;
      categoryChangeInProgressRef.current = false;
    });
    
  }, [
    suggestedUser?.id, // ✅ Solo el ID para evitar re-renders innecesarios
    fetchingSuggestion, 
    userHasManuallyChanged, 
    values.length, // ✅ Solo la longitud, no el array completo
    onChange
  ]);

  // Update vacation warnings when selected users change
  useEffect(() => {
    if (!isUsingEnhancedUsers || values.length === 0) {
      setVacationWarnings([]);
      return;
    }

    const warnings: string[] = [];
    values.forEach(userId => {
      const warning = getVacationWarning(userId);
      if (warning) {
        warnings.push(warning);
      }
    });

    setVacationWarnings(warnings);
  }, [values, isUsingEnhancedUsers, getVacationWarning]);

  const getPlaceholder = () => {
    if (fetchingSuggestion) return "Searching for suggestion..";
    if (loadingEnhanced) return "Analyzing availability...";
    if (loading) return "Loading designers...";
    return "Assign Designer(s)";
  };

  // Smart suggestion info
  const shouldShowSmartSuggestion = () => {
    return (
      smartSuggestion && 
      !fetchingSuggestion && 
      !values.includes(smartSuggestion.userId) &&
      totalAvailable === 0 // Only show when no immediately available users
    );
  };

  // Regular suggestion info - only show if user has manually selected someone different
  const shouldShowRegularSuggestion = () => {
    return (
      suggestedUser && 
      !fetchingSuggestion && 
      values.length > 0 && // User has selected someone
      !values.includes(suggestedUser.id) && // But not the suggested user
      userHasManuallyChanged && // ✅ NUEVO: Solo mostrar si usuario ha hecho cambios manuales
      (!smartSuggestion || totalAvailable > 0) // Don't show if smart suggestion is more relevant
    );
  };

  // Check if user is suggested
  const isUserSuggested = (userId: string) => {
    const isRegularSuggested = suggestedUser?.id === userId;
    const isSmartSuggested = smartSuggestion?.userId === userId;
    return isRegularSuggested || isSmartSuggested;
  };

  // Get user status info for display
  const getUserStatusInfo = (userId: string) => {
    if (!isUsingEnhancedUsers) {
      // For fallback users, check if suggested
      return isUserSuggested(userId) ? { status: 'suggested' } : null;
    }
    
    const userInfo = getUserById(userId);
    
    // If user is suggested, override status
    if (isUserSuggested(userId)) {
      return { ...userInfo, status: 'suggested' };
    }
    
    return userInfo;
  };

  // Get status color for chips and options
  const getStatusColor = (status?: string) => {
    switch (status) {
      case 'available': return 'primary';
      case 'suggested': return 'success';
      case 'on_vacation': return 'warning';
      case 'overloaded': return 'danger';
      default: return 'neutral';
    }
  };

  // Get status icon
  const getStatusIcon = (status?: string) => {
    switch (status) {
      case 'suggested': return SparklesIcon;
      case 'on_vacation': return Calendar04Icon;
      case 'overloaded': return Clock03Icon;
      default: return UserCheck01Icon;
    }
  };

  return (
    <div>
      <FormLabel>
        <HugeiconsIcon icon={UserCheck01Icon} size={20} strokeWidth={1.5} />
        Assignee
      </FormLabel>

      {/* Smart Suggestion Alert */}
      {shouldShowSmartSuggestion() && smartSuggestion && (
        <Alert 
          variant="soft" 
          color="primary" 
          className="mb-3"
          startDecorator={<HugeiconsIcon icon={Brain02Icon} size={20} />}
        >
          <div>
            <div className="font-medium">💡 Smart Suggestion</div>
            <div className="text-sm mt-1">
              {smartSuggestion.reason}
              <br />
              <strong>Alternative start date:</strong> {smartSuggestion.alternativeStartDate}
            </div>
            <Button
              size="sm"
              variant="outlined"
              color="primary"
              className="mt-2"
              onClick={() => {
                onChange([smartSuggestion.userId]);
                lastAppliedSuggestionRef.current = smartSuggestion.userId;
                if (onApplySuggestion) onApplySuggestion();
              }}
              startDecorator={<HugeiconsIcon icon={Brain02Icon} size={16} />}
            >
              Use Smart Suggestion
            </Button>
          </div>
        </Alert>
      )}

      {/* Regular Suggestion */}
      {shouldShowRegularSuggestion() && suggestedUser && (
        <div className="mb-3 p-3 bg-green-500/10 rounded-lg">
          <div>
            <div className="flex items-center gap-2 justify-between">
              <span className="text-sm text-accent-200">
                Suggested: <strong>{suggestedUser.name}</strong>
              </span>

              {onApplySuggestion && (
                <Button
                  size="sm"
                  variant="soft"
                  color="success"
                  onClick={() => {
                    onChange([suggestedUser.id]);
                    lastAppliedSuggestionRef.current = suggestedUser.id;
                    if (onApplySuggestion) onApplySuggestion();
                  }}
                  startDecorator={
                    <HugeiconsIcon
                      icon={RefreshIcon}
                      size={16}
                      strokeWidth={2}
                    />
                  }
                >
                  Apply
                </Button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Vacation Warnings */}
      {vacationWarnings.length > 0 && (
        <div className="mb-3 space-y-2">
          {vacationWarnings.map((warning, index) => (
            <Alert 
              key={index}
              variant="soft" 
              color="warning" 
              startDecorator={<HugeiconsIcon icon={Calendar04Icon} size={20} />}
              sx={{ alignItems: 'flex-start' }}
            >
              <div className="text-xs">{warning}</div>
            </Alert>
          ))}
        </div>
      )}
      <Select
        name="assignedUserIds"
        multiple
        value={values}
        key={values.join(",")}
        onChange={(_, val) => onChange(val as string[])}
        placeholder={getPlaceholder()}
        disabled={isLoading || !info?.categoryId || !info?.brandId}
        color={touched && error ? "danger" : "neutral"}
        renderValue={(selected) => {
          if (selected.length === 0) {
            return (
              <span style={{ color: 'var(--joy-palette-text-tertiary)' }}>
                {getPlaceholder()}
              </span>
            );
          }

          const orderedSelected = [...selected].sort((a, b) => {
            if (a.value === suggestedUser?.id) return -1;
            if (b.value === suggestedUser?.id) return 1;
            return 0;
          });

          return (
            <div style={{ display: "flex", gap: "0.25rem", flexWrap: "wrap" }}>
              {orderedSelected.map((selectedId) => {
                const user = usersToShow.find((u) => u.id === selectedId.value);
                const userStatus = getUserStatusInfo(user?.id || '');
                const isSuggested = isUserSuggested(user?.id || '');

                return user ? (
                  <Chip
                    key={user.id}
                    color={isSuggested ? "success" : getStatusColor(userStatus?.status)}
                    variant="soft"
                  >
                    {user.name}
                  </Chip>
                ) : null;
              })}
            </div>
          );
        }}
      >
        {isLoading ? (
          <Option value="" disabled>
            {getPlaceholder()}
          </Option>
        ) : usersToShow.length === 0 ? (
          <Option value="" disabled>
            No compatible designers found
          </Option>
        ) : (
          usersToShow.map((user) => {
            const userStatus = getUserStatusInfo(user.id);
            const StatusIcon = getStatusIcon(userStatus?.status);

            return (
              <Option key={user.id} value={user.id}>
                <div className="flex items-center justify-between w-full">
                  <div className="flex items-center gap-2">
                    <HugeiconsIcon icon={StatusIcon} size={16} />
                    <span>{user.name}</span>
                  </div>
                  
                  <div className="flex items-center gap-1 text-xs">
                    {/* Status badge */}
                    <span className={`px-2 py-1 rounded text-xs ${
                      userStatus?.status === 'suggested' ? 'bg-green-900 text-green-300' :
                      userStatus?.status === 'available' ? 'bg-accent-900 text-accent-300' :
                      userStatus?.status === 'on_vacation' ? 'bg-yellow-900 text-yellow-300' :
                      userStatus?.status === 'overloaded' ? 'bg-red-900 text-red-300' :
                      'bg-gray-900 text-gray-300'
                    }`}>
                      {userStatus?.status === 'suggested' ? 'Suggested' :
                       userStatus?.status === 'available' ? 'Available' :
                       userStatus?.status === 'on_vacation' ? 'On Vacation' :
                       userStatus?.status === 'overloaded' ? 'Overloaded' :
                       'Unknown'}
                    </span>
                  </div>
                </div>
              </Option>
            );
          })
        )}
      </Select>

      {/* Error display */}
      {touched && error && <TextFieldError label={error} />}
    </div>
  );
};