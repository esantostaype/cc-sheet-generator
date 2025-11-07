/* eslint-disable react/no-unescaped-entities */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import React, { useState, useEffect } from "react";
import { Button, Input, IconButton, LinearProgress, Alert } from "@mui/joy";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  Download04Icon,
  Alert01Icon,
  Layers01Icon,
} from "@hugeicons/core-free-icons";
import { useTaskDataInvalidation } from "@/hooks/useTaskData";
import axios from "axios";
import { toast } from "react-toastify";
import { TableTd, TableTh } from "@/components";

interface TierData {
  id: number;
  name: string;
  duration: number;
  categoryCount: number;
}

// Agregar este componente dentro del archivo, antes del componente principal:
const TierSkeleton: React.FC = () => {
  // Crear 4 columnas de skeleton para simular los tiers
  const skeletonColumns = Array.from({ length: 6 }, (_, index) => (
    <TableTh key={index}>
      <div className="flex items-center gap-2 justify-center animate-pulse">
        <div className="h-4 bg-white/10 rounded w-16"></div>
      </div>
    </TableTh>
  ));

  const skeletonInputs = Array.from({ length: 6 }, (_, index) => (
    <TableTd key={index}>
      <div className="pt-2 w-full flex justify-center animate-pulse">
        <div className="flex flex-col items-center gap-1">
          <div className="h-10 bg-white/10 rounded w-24"></div>
          <div className="h-3 bg-white/5 rounded w-8"></div>
        </div>
      </div>
    </TableTd>
  ));

  return (
    <>
      <thead className="bg-white/5">
        <tr>{skeletonColumns}</tr>
      </thead>
      <tbody>
        <tr>{skeletonInputs}</tr>
      </tbody>
    </>
  );
};

export const TierListForm: React.FC = () => {
  const { invalidateTiers } = useTaskDataInvalidation();

  const [tiers, setTiers] = useState<TierData[]>([]);
  const [tierChanges, setTierChanges] = useState<Record<number, number>>({});
  const [loadingTiers, setLoadingTiers] = useState(true);
  const [savingTiers, setSavingTiers] = useState(false);

  // Cargar tiers
  useEffect(() => {
    const fetchTiers = async () => {
      try {
        setLoadingTiers(true);
        const response = await axios.get("/api/tiers");
        setTiers(response.data);
      } catch (error) {
        console.error("Error loading tiers:", error);
        toast.error("Error loading tier settings");
      } finally {
        setLoadingTiers(false);
      }
    };
    fetchTiers();
  }, []);

  // Handle tier duration changes
  const handleTierDurationChange = (tierId: number, newDuration: number) => {
    const originalTier = tiers.find((t) => t.id === tierId);
    if (!originalTier) return;

    if (originalTier.duration === newDuration) {
      // Si vuelve al valor original, remover del registro de cambios
      const newTierChanges = { ...tierChanges };
      delete newTierChanges[tierId];
      setTierChanges(newTierChanges);
    } else {
      // Registrar el cambio
      setTierChanges((prev) => ({
        ...prev,
        [tierId]: newDuration,
      }));
    }
  };

  // Check if there are changes
  const hasChanges = Object.keys(tierChanges).length > 0;

  // Handle form submission
  const handleSave = async () => {
    try {
      if (Object.keys(tierChanges).length > 0) {
        setSavingTiers(true);

        const updatePromises = Object.entries(tierChanges).map(
          ([tierId, duration]) =>
            axios.patch(`/api/tiers/${tierId}`, { duration })
        );

        await Promise.all(updatePromises);

        // Recargar tiers localmente
        const response = await axios.get("/api/tiers");
        setTiers(response.data);
        setTierChanges({});

        // Invalidar cache de task data para que otros componentes se actualicen
        console.log("🔄 Invalidating task data cache after tier changes...");
        invalidateTiers();

        toast.success("Tier durations updated successfully");
      }
    } catch (error) {
      console.error("Error saving:", error);
      toast.error("Error saving tier durations");
    } finally {
      setSavingTiers(false);
    }
  };

  return (
    <div className="p-8">
      {!loadingTiers && hasChanges && (
        <Alert color="warning" variant="soft" className="mb-4">
          <div className="flex items-center gap-2">
            <HugeiconsIcon icon={Alert01Icon} size={16} />
            <span className="text-sm">
              You have unsaved changes. Don't forget to save your settings.
            </span>
          </div>
        </Alert>
      )}

      <div className="border border-white/10 rounded-lg overflow-y-hidden overflow-x-auto">
        <table className="w-full">
          {loadingTiers ? (
            // Skeleton mientras carga
            <TierSkeleton />
          ) : (
            // Contenido real
            <>
              <thead className="bg-white/5">
                <tr>
                  {tiers.map((tier) => {
                    const hasChanged = tierChanges[tier.id] !== undefined;

                    return (
                      <TableTh key={tier.id}>
                        <div className="flex items-center gap-2 justify-center">
                          <span>Tier {tier.name}</span>
                          {hasChanged && (
                            <div
                              className="w-2 h-2 bg-orange-500 rounded-full"
                              title="Changed"
                            />
                          )}
                        </div>
                      </TableTh>
                    );
                  })}
                </tr>
              </thead>
              <tbody>
                <tr>
                  {tiers.map((tier) => {
                    const hasChanged = tierChanges[tier.id] !== undefined;
                    const currentDuration =
                      tierChanges[tier.id] ?? tier.duration;

                    return (
                      <TableTd key={tier.id}>
                        <div className="pt-2 w-full flex justify-center">
                          <div className="flex flex-col items-center gap-1">
                            <Input
                              type="number"
                              value={currentDuration.toString()}
                              onChange={(e) => {
                                const value = parseFloat(e.target.value);
                                if (!isNaN(value) && value > 0) {
                                  handleTierDurationChange(tier.id, value);
                                }
                              }}
                              sx={{
                                "& input": {
                                  textAlign: "center",
                                },
                              }}
                              slotProps={{
                                input: {
                                  min: 0.1,
                                  step: 0.1,
                                },
                              }}
                              color={hasChanged ? "warning" : "neutral"}
                              size="md"
                              className="w-24"
                            />
                            <span className="text-xs text-gray-500">days</span>
                          </div>
                        </div>
                      </TableTd>
                    );
                  })}
                </tr>
              </tbody>
            </>
          )}
        </table>
      </div>
      <div className="flex items-center justify-end mt-4">
        <Button
          startDecorator={<HugeiconsIcon icon={Download04Icon} size={16} />}
          onClick={handleSave}
          disabled={loadingTiers || !hasChanges} // ✅ Agregar loadingTiers
          loading={savingTiers}
          color={hasChanges ? "warning" : "primary"}
        >
          {loadingTiers
            ? "Loading..."
            : hasChanges
            ? "Save Changes"
            : "No Changes"}
        </Button>
      </div>
    </div>
  );
};
