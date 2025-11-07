import React from 'react';
import { Input } from '@mui/joy';
import { HugeiconsIcon } from '@hugeicons/react';
import { SearchListIcon } from '@hugeicons/core-free-icons';

interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
}

export const SearchBar: React.FC<SearchBarProps> = ({
  value,
  onChange,
  placeholder = "Search by Name or Email...",
  className = ''
}) => {
  return (
    <div className={`relative ${className}`}>
      <Input
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        startDecorator={<HugeiconsIcon icon={SearchListIcon} size={16} />}
        size="sm"
        fullWidth
      />
    </div>
  );
};