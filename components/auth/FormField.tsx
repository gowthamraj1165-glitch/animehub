type FormFieldProps = {
  id: string;
  name: string;
  label: string;
  type?: "text" | "email" | "password";
  autoComplete?: string;
  placeholder?: string;
  hint?: string;
  error?: string;
  required?: boolean;
  minLength?: number;
  defaultValue?: string;
};

export function FormField({
  id,
  name,
  label,
  type = "text",
  autoComplete,
  placeholder,
  hint,
  error,
  required = true,
  minLength,
  defaultValue,
}: FormFieldProps) {
  const describedBy = error ? `${id}-error` : hint ? `${id}-hint` : undefined;

  return (
    <div>
      <label htmlFor={id} className="mb-1.5 block text-sm font-medium text-ink">
        {label}
      </label>
      <input
        id={id}
        name={name}
        type={type}
        required={required}
        minLength={minLength}
        defaultValue={defaultValue}
        placeholder={placeholder}
        autoComplete={autoComplete}
        aria-invalid={error ? true : undefined}
        aria-describedby={describedBy}
        className={`h-11 w-full rounded-xl border bg-canvas px-3 text-sm text-ink transition-colors placeholder:text-muted/60 focus-visible:ring-2 focus-visible:ring-accent/40 focus-visible:outline-none ${
          error
            ? "border-red-500/60 focus-visible:border-red-500/60"
            : "border-line hover:border-line/60 focus-visible:border-accent/60"
        }`}
      />
      {error ? (
        <p id={`${id}-error`} role="alert" className="mt-1.5 text-xs text-red-300">
          {error}
        </p>
      ) : hint ? (
        <p id={`${id}-hint`} className="mt-1.5 text-xs text-muted">
          {hint}
        </p>
      ) : null}
    </div>
  );
}
