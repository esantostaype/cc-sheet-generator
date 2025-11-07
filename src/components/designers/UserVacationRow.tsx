// src/components/designers/UserVacationRow.tsx - FIXED VERSION
import React from "react";
import { IconButton } from "@mui/joy";
import { HugeiconsIcon } from "@hugeicons/react";
import { Delete02Icon } from "@hugeicons/core-free-icons";
import { TableTd } from "@/components";
import { useConfirmationStore } from "@/stores/confirmationStore";

interface UserVacationRowProps {
  vacation: {
    id: number;
    startDate: string;
    endDate: string;
  };
  onDelete: (vacationId: number) => void;
  deleting?: boolean;
  loading?: boolean;
}

export const UserVacationRow: React.FC<UserVacationRowProps> = ({
  vacation,
  onDelete,
  deleting = false,
  loading = false,
}) => {
  const startDate = new Date(vacation.startDate);
  const endDate = new Date(vacation.endDate);
  const durationDays = Math.ceil(
    (endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)
  );

  const { openConfirmation } = useConfirmationStore()

  return (
    <tr className="border-b border-white/10 text-sm">
      <TableTd>
        {loading ? "Loading..." : startDate.toLocaleDateString()}
      </TableTd>
      <TableTd>{loading ? "Loading..." : endDate.toLocaleDateString()}</TableTd>
      <TableTd>{loading ? "Loading..." : `${durationDays} days`}</TableTd>
      <TableTd>
        {loading ? (
          "Loading..."
        ) : (
          <IconButton
            size="sm"
            color="danger"
            variant="soft"
            onClick={() => {
              openConfirmation({
                title: "Delete Vacation",
                description: `Are you sure you want to delete the vacation from ${startDate.toLocaleDateString()} to ${endDate.toLocaleDateString()} (${durationDays} days)? This action cannot be undone.`,
                type: "danger",
                confirmText: "Delete Vacation",
                cancelText: "Cancel",
                onConfirm: () => onDelete(vacation.id),
              });
            }}
            loading={deleting}
            disabled={deleting}
          >
            <HugeiconsIcon icon={Delete02Icon} size={16} />
          </IconButton>
        )}
      </TableTd>
    </tr>
  );
};
