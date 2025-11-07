
import React, { useState } from 'react';
import { Button, Select, Option, FormControl, FormLabel } from '@mui/joy';
import { HugeiconsIcon } from '@hugeicons/react';
import { PlusSignIcon } from '@hugeicons/core-free-icons';

interface AddRoleFormProps {
  taskTypes: Array<{ id: number; name: string }>;
  brands: Array<{ id: string; name: string }>;
  onAdd: (typeId: number, brandId?: string) => void;
  loading?: boolean;
  loadingTypes?: boolean;
  loadingBrands?: boolean;
}

export const AddRoleForm: React.FC<AddRoleFormProps> = ({
  taskTypes,
  brands,
  onAdd,
  loading = false,
  loadingTypes = false,
  loadingBrands = false
}) => {
  const [typeId, setTypeId] = useState<string>('');
  const [brandId, setBrandId] = useState<string>('');

  const handleAdd = () => {
    if (typeId) {
      onAdd(parseInt(typeId), brandId || undefined);
      setTypeId('');
      setBrandId('');
    }
  };

  return (
    <div className="flex gap-2 mt-3">
      <FormControl sx={{ flex: 1 }}>
        <FormLabel>Role Type</FormLabel>
        <Select
          value={typeId}
          onChange={(_, value) => setTypeId(value as string)}
          placeholder="Select role type"
          disabled={loadingTypes}
          size='sm'
        >
          {loadingTypes && taskTypes.length === 0 ? (
            <Option value="" disabled>Loading types...</Option>
          ) : (
            taskTypes.map((type) => (
              <Option key={type.id} value={type.id.toString()}>
                {type.name}
              </Option>
            ))
          )}
        </Select>
      </FormControl>
      
      <FormControl sx={{ flex: 1 }}>
        <FormLabel>Brand (Optional)</FormLabel>
        <Select
          value={brandId}
          onChange={(_, value) => setBrandId(value as string)}
          placeholder="Select brand (optional)"
          disabled={loadingBrands}
          size='sm'
        >
          {loadingBrands && brands.length === 0 ? (
            <Option value="" disabled>Loading brands...</Option>
          ) : (
            <>
              <Option value="">Global (All brands)</Option>
              {brands.map((brand) => (
                <Option key={brand.id} value={brand.id}>
                  {brand.name}
                </Option>
              ))}
            </>
          )}
        </Select>
      </FormControl>
      
      <Button
        variant="solid"
        color="primary"
        startDecorator={<HugeiconsIcon icon={PlusSignIcon} size={16} />}
        onClick={handleAdd}
        disabled={!typeId || loadingTypes || loadingBrands}
        loading={loading}
        sx={{ mt: 'auto' }}
        size='sm'
      >
        Add Role
      </Button>
    </div>
  );
};
