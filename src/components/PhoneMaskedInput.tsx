"use client";

import { useCallback } from "react";

function formatPhone(value: string): string {
  const digits = value.replace(/\D/g, "");
  const d = digits.startsWith("7") ? digits : digits.startsWith("8") ? "7" + digits.slice(1) : "7" + digits;
  let result = "+7";
  if (d.length > 1) result += " (" + d.slice(1, 4);
  if (d.length >= 4) result += ")";
  if (d.length > 4) result += " " + d.slice(4, 7);
  if (d.length > 7) result += "-" + d.slice(7, 9);
  if (d.length > 9) result += "-" + d.slice(9, 11);
  return result;
}

export function PhoneMaskedInput({
  value,
  onChange,
  className = "input-field",
  placeholder = "+7 (___) ___-__-__",
  style,
}: {
  value: string;
  onChange: (val: string) => void;
  className?: string;
  placeholder?: string;
  style?: React.CSSProperties;
}) {
  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const raw = e.target.value;
      if (raw.length < 3) {
        onChange("+7");
        return;
      }
      const formatted = formatPhone(raw);
      onChange(formatted);
    },
    [onChange]
  );

  return (
    <input
      type="tel"
      className={className}
      placeholder={placeholder}
      value={value || "+7"}
      onChange={handleChange}
      maxLength={18}
      style={style}
    />
  );
}
