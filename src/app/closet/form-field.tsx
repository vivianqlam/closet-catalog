// A labeled form field with its error message underneath. Shared by the
// item and trip forms.
export function Field({
  field,
  label,
  error,
  children,
}: {
  field: string;
  label: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label htmlFor={field} className="label block">
        {label}
      </label>
      {children}
      {error && (
        <p id={`${field}-error`} className="mt-1 text-sm text-accent">
          {error}
        </p>
      )}
    </div>
  );
}

// Props for an input: id, name, starting value, styling, and a link to its
// error message so screen readers announce it.
export function inputProps(field: string, value: string, error?: string) {
  return {
    id: field,
    name: field,
    defaultValue: value,
    "aria-invalid": error ? true : undefined,
    "aria-describedby": error ? `${field}-error` : undefined,
    className: `mt-1 w-full border bg-transparent px-3 py-2 focus:outline-none ${
      error ? "border-accent focus:border-accent" : "border-line focus:border-ink"
    }`,
  };
}
