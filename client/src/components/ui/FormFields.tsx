import {
  forwardRef, useId,
  type InputHTMLAttributes, type ReactNode, type SelectHTMLAttributes, type TextareaHTMLAttributes,
} from "react";

type Shell = { label: string; hint?: string; error?: string };

// A thicker border on error, but the words carry the meaning
const control = "mt-1 w-full bg-ivory px-3 text-espresso";
const border = (error?: string) => (error ? "border-[3px] border-gold-deep" : "border-2 border-cocoa");

function describedBy(id: string, hint?: string, error?: string): string | undefined {
  const ids = [hint ? `${id}-hint` : null, error ? `${id}-error` : null].filter(Boolean);
  return ids.length > 0 ? ids.join(" ") : undefined;
}

function Field({ id, label, hint, error, children }: Shell & { id: string; children: ReactNode }) {
  return (
    <div>
      <label htmlFor={id} className="block font-medium">
        {label}
      </label>
      {hint && (
        <p id={`${id}-hint`} className="text-sm">
          {hint}
        </p>
      )}
      {children}
      {error && (
        <p id={`${id}-error`} className="mt-1 font-medium">
          <span className="sr-only">Error: </span>
          {error}
        </p>
      )}
    </div>
  );
}

export const TextField = forwardRef<HTMLInputElement, Shell & InputHTMLAttributes<HTMLInputElement>>(function TextField(
  { label, hint, error, ...rest },
  ref,
) {
  const id = useId();
  return (
    <Field id={id} label={label} hint={hint} error={error}>
      <input
        ref={ref}
        id={id}
        aria-invalid={error ? true : undefined}
        aria-describedby={describedBy(id, hint, error)}
        className={`${control} ${border(error)} min-h-[2.75rem]`}
        {...rest}
      />
    </Field>
  );
});

export const TextAreaField = forwardRef<HTMLTextAreaElement, Shell & TextareaHTMLAttributes<HTMLTextAreaElement>>(
  function TextAreaField({ label, hint, error, ...rest }, ref) {
    const id = useId();
    return (
      <Field id={id} label={label} hint={hint} error={error}>
        <textarea
          ref={ref}
          id={id}
          rows={3}
          aria-invalid={error ? true : undefined}
          aria-describedby={describedBy(id, hint, error)}
          className={`${control} ${border(error)} py-2`}
          {...rest}
        />
      </Field>
    );
  },
);

type SelectFieldProps = Shell &
  SelectHTMLAttributes<HTMLSelectElement> & { options: { value: string; label: string }[]; placeholder: string };

export const SelectField = forwardRef<HTMLSelectElement, SelectFieldProps>(function SelectField(
  { label, hint, error, options, placeholder, ...rest },
  ref,
) {
  const id = useId();
  return (
    <Field id={id} label={label} hint={hint} error={error}>
      <select
        ref={ref}
        id={id}
        aria-invalid={error ? true : undefined}
        aria-describedby={describedBy(id, hint, error)}
        className={`${control} ${border(error)} min-h-[2.75rem]`}
        {...rest}
      >
        <option value="">{placeholder}</option>
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </Field>
  );
});