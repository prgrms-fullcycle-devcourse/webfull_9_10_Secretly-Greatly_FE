interface AuthFieldProps {
  label: string;
  type?: "email" | "password" | "text";
  placeholder?: string;
  value?: string;
  onChange?: (value: string) => void;
  error?: string;
  autoComplete?: string;
  maxLength?: number;
}

/** auth 패널 공통 입력 필드 — 라벨 + 인풋 + (선택) 에러 메시지. */
export function AuthField({
  label,
  type = "text",
  placeholder,
  value,
  onChange,
  error,
  autoComplete,
  maxLength,
}: AuthFieldProps) {
  return (
    <label className="auth-panel__field">
      <span>{label}</span>
      <input
        type={type}
        placeholder={placeholder}
        value={value}
        maxLength={maxLength}
        onChange={onChange ? (e) => onChange(e.target.value) : undefined}
        autoComplete={autoComplete}
        aria-invalid={error ? true : undefined}
      />
      {error && (
        <span className="text-[11px] text-(--vscode-errorForeground)">
          {error}
        </span>
      )}
    </label>
  );
}
