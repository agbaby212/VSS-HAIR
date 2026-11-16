import type { ButtonHTMLAttributes } from "react";
import { buttonClasses, type ButtonSize, type ButtonVariant } from "./buttonClasses";

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean; // true while a request is running
  loadingText?: string; // says what is happening, like "Sending order"
};

export function Button({
  variant = "primary",
  size = "md",
  loading = false,
  loadingText = "Please wait",
  className = "",
  disabled,
  type = "button", // safe default: a button never submits a form by accident. Pass type="submit" when you want that
  children,
  ...rest
}: ButtonProps) {
  return (
    <button
      type={type}
      className={`${buttonClasses({ variant, size })} ${className}`}
      disabled={disabled || loading} // blocks double clicks while loading
      aria-busy={loading}
      {...rest}
    >
      {loading ? (
        <>
          <span
            aria-hidden="true"
            className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent"
          />
          {loadingText}
        </>
      ) : (
        children
      )}
    </button>
  );
}