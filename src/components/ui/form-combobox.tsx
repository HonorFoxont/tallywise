import * as React from 'react';

import {
  Combobox,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxInput,
  ComboboxItem,
  ComboboxList,
} from '@/components/ui/combobox';

export type ComboboxOption = {
  value: string;
  label: string;
};

interface FormComboboxProps {
  options: ComboboxOption[];
  /** The selected option's `value`. `null` means nothing is selected. */
  value: string | null;
  onChange: (value: string | null) => void;
  id?: string;
  placeholder?: string;
  emptyMessage?: string;
  disabled?: boolean;
  /** Shows a clear button that resets the value to `null`. */
  clearable?: boolean;
  className?: string;
  /**
   * Where to portal the popup. Inside a Dialog, pass a ref to the DialogContent,
   * otherwise Radix treats clicking an option as an outside interaction and closes the dialog.
   */
  portalContainer?: React.RefObject<HTMLElement | null>;
}

/**
 * A single-select combobox that works in plain `string` values, so callers can keep storing ids
 * the same way they did with `Select`. Base UI's Combobox selects whole item objects, and the
 * mapping between the two lives here rather than in every form.
 */
const FormCombobox: React.FC<FormComboboxProps> = ({
  options,
  value,
  onChange,
  id,
  placeholder,
  emptyMessage = 'No results found.',
  disabled = false,
  clearable = false,
  className,
  portalContainer,
}) => {
  const [open, setOpen] = React.useState(false);

  const selectedOption = React.useMemo(
    () => options.find((option) => option.value === value) ?? null,
    [options, value]
  );

  // The chevron is decorative (see combobox.tsx), so clicks landing anywhere in the field other
  // than the input itself have to open the list, otherwise the right-hand edge feels dead.
  const handleFieldMouseDown = (event: React.MouseEvent<HTMLDivElement>) => {
    const target = event.target as HTMLElement;
    if (target.closest('input') || target.closest('[data-slot="combobox-clear"]')) {
      return;
    }
    event.preventDefault();
    event.currentTarget.querySelector('input')?.focus();
    setOpen(true);
  };

  return (
    <Combobox
      items={options}
      value={selectedOption}
      onValueChange={(option) => onChange(option?.value ?? null)}
      open={open}
      onOpenChange={setOpen}
      // Options are rebuilt on every Firestore snapshot, so the default `Object.is` comparison
      // would drop the selection each time new object identities arrive.
      isItemEqualToValue={(a, b) => a?.value === b?.value}
      itemToStringLabel={(option) => option.label}
      itemToStringValue={(option) => option.value}
      disabled={disabled}
    >
      <div onMouseDown={handleFieldMouseDown} className={className ?? 'w-full'}>
        <ComboboxInput
          id={id}
          placeholder={placeholder}
          disabled={disabled}
          showClear={clearable}
          className="w-full"
        />
      </div>
      <ComboboxContent container={portalContainer}>
        <ComboboxEmpty>{emptyMessage}</ComboboxEmpty>
        <ComboboxList>
          {(option: ComboboxOption) => (
            <ComboboxItem key={option.value} value={option}>
              {option.label}
            </ComboboxItem>
          )}
        </ComboboxList>
      </ComboboxContent>
    </Combobox>
  );
};

export default FormCombobox;
