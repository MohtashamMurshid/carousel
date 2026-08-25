import { useEffect, useRef } from "react";

interface EditableProps {
  value: string;
  enabled: boolean;
  className?: string;
  placeholder?: string;
  multiline?: boolean;
  maxLength?: number;
  onChange: (value: string) => void;
}

export function Editable({
  value,
  enabled,
  className,
  placeholder,
  multiline,
  maxLength,
  onChange,
}: EditableProps) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;
    if (document.activeElement === node) return;
    if (node.innerText !== value) node.innerText = value;
  }, [value]);

  return (
    <div
      ref={ref}
      className={`${className ?? ""}${!value ? " is-empty" : ""}`}
      contentEditable={enabled}
      suppressContentEditableWarning
      data-placeholder={placeholder}
      role={enabled ? "textbox" : undefined}
      aria-multiline={multiline || undefined}
      spellCheck={false}
      onClick={(event) => event.stopPropagation()}
      onKeyDown={(event) => {
        if (!multiline && event.key === "Enter") {
          event.preventDefault();
          event.currentTarget.blur();
        }
      }}
      onInput={(event) => {
        let next = event.currentTarget.innerText.replace(/\u00a0/g, " ");
        if (!multiline) next = next.replace(/\n/g, "");
        if (maxLength) next = next.slice(0, maxLength);
        onChange(next);
      }}
    />
  );
}
