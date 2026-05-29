export function VscodeIcon({ size = 16 }: { size?: number }) {
  return (
    <span
      aria-hidden="true"
      className="vscode-icon"
      style={{ width: size, height: size }}
    />
  );
}
