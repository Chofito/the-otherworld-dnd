type CatalogOption = {
  id: string;
  name: string;
  description?: string | null;
};

type Props = {
  name: string;
  label: string;
  options: CatalogOption[];
  defaultValue?: string | null;
  required?: boolean;
  emptyLabel?: string;
};

export function CatalogSelect({
  name,
  label,
  options,
  defaultValue,
  required = true,
  emptyLabel = 'Select…',
}: Props) {
  return (
    <label className="field">
      <span>{label}</span>
      <select
        name={name}
        required={required}
        defaultValue={defaultValue ?? ''}
        disabled={options.length === 0}
      >
        <option value="" disabled>
          {options.length === 0 ? 'No options configured' : emptyLabel}
        </option>
        {options.map((option) => (
          <option key={option.id} value={option.id}>
            {option.name}
          </option>
        ))}
      </select>
    </label>
  );
}
