import React from "react";
import { Select, Option, FormLabel } from "@mui/joy";
import { Brand } from "@/interfaces";
import { HugeiconsIcon } from "@hugeicons/react";
import { Bookmark02Icon } from "@hugeicons/core-free-icons";
import { TextFieldError } from "@/components";

interface BrandSelectProps {
  brands: Brand[];
  value: string;
  onChange: (value: string) => void;
  touched?: boolean;
  error?: string;
  loading?: boolean;
}

export const BrandSelect: React.FC<BrandSelectProps> = ({
  brands,
  value,
  onChange,
  touched,
  error,
  loading = false,
}) => (
  <div>
    <FormLabel>
      <HugeiconsIcon icon={Bookmark02Icon} size={20} strokeWidth={1.5} />
      Brand
    </FormLabel>
    <Select
      value={value}
      onChange={(_, val) => onChange(val as string)}
      placeholder={loading ? "Loading brands..." : "Select a brand"}
      disabled={loading}
    >
      {brands.map((brand) => (
        <Option key={brand.id} value={brand.id}>
          {brand.name}
        </Option>
      ))}
    </Select>
    {touched && error && <TextFieldError label={error} />}
  </div>
);
