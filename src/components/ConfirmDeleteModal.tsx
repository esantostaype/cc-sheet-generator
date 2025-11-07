// src/components/ConfirmDeleteModal.tsx
import React from 'react';
import { Button } from '@mui/joy';
import { HugeiconsIcon } from '@hugeicons/react';
import { Delete02Icon, Cancel01Icon } from '@hugeicons/core-free-icons';

interface ConfirmDeleteModalProps {
  title: string;
  description: string;
  onConfirm: () => void;
  onCancel: () => void;
  loading?: boolean;
}

export const ConfirmDeleteModal: React.FC<ConfirmDeleteModalProps> = ({
  title,
  description,
  onConfirm,
  onCancel,
  loading = false
}) => {
  return (
    <div className="p-6 space-y-4">
      <div className="space-y-2">
        <h3 className="text-lg font-medium text-white">{title}</h3>
        <p className="text-gray-300">{description}</p>
      </div>
      
      <div className="flex justify-end gap-3 pt-4">
        <Button
          variant="soft"
          color="neutral"
          onClick={onCancel}
          disabled={loading}
          startDecorator={<HugeiconsIcon icon={Cancel01Icon} size={16} />}
        >
          Cancel
        </Button>
        <Button
          variant="solid"
          color="danger"
          onClick={onConfirm}
          loading={loading}
          disabled={loading}
          startDecorator={<HugeiconsIcon icon={Delete02Icon} size={16} />}
        >
          Delete
        </Button>
      </div>
    </div>
  );
};