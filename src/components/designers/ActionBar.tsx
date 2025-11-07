/* eslint-disable @typescript-eslint/no-unused-vars */
import React from 'react';
import { Button } from '@mui/joy';
import { SearchBar } from './SearchBar';
import { HugeiconsIcon } from '@hugeicons/react';
import { 
  CheckmarkSquare02Icon, 
  DatabaseSync01Icon, 
  RefreshIcon 
} from '@hugeicons/core-free-icons';

interface ActionBarProps {
  searchValue: string;
  onSearchChange: (value: string) => void;
  selectedCount: number;
  availableCount: number;
  allAvailableSelected: boolean;
  onSelectAll: () => void;
  onSync: () => void;
  onRefresh: () => void;
  loading?: boolean;
  syncing?: boolean;
}

export const ActionBar: React.FC<ActionBarProps> = ({
  searchValue,
  onSearchChange,
  selectedCount,
  availableCount,
  allAvailableSelected,
  onSelectAll,
  onSync,
  onRefresh,
  loading = false,
  syncing = false
}) => {
  return (
    <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
      <SearchBar
        value={searchValue}
        onChange={onSearchChange}
        className="flex-1 w-full md:w-sm"
      />
      
      <div className="flex gap-2">
        <Button
          variant="soft"
          size="sm"
          startDecorator={<HugeiconsIcon icon={CheckmarkSquare02Icon} size={16} />}
          onClick={onSelectAll}
          disabled={availableCount === 0}
        >
          {allAvailableSelected ? "Deselect" : "Select"} Available
        </Button>

        <Button
          variant="solid"
          color="primary"
          size="sm"
          startDecorator={<HugeiconsIcon icon={DatabaseSync01Icon} size={16} />}
          onClick={onSync}
          disabled={selectedCount === 0}
          loading={syncing}
        >
          Sync ({selectedCount})
        </Button>

        {/* <Button
          variant="soft"
          size="sm"
          startDecorator={<HugeiconsIcon icon={RefreshIcon} size={16} />}
          onClick={onRefresh}
          disabled={loading}
          loading={loading}
        >
          Refresh
        </Button> */}
      </div>
    </div>
  );
};