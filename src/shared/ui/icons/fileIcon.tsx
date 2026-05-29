function FileDocSvg({ size, color }: { size: number; color: string }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 12 16"
      aria-hidden="true"
      fill={color}
      className="shrink-0"
    >
      <path fillRule="evenodd" d="M0 0h8l4 4v12H0V0zm8 0v4h4z" />
    </svg>
  );
}

const EXT_COLORS: Record<string, string> = {
  ts: "#519aba",
  tsx: "#519aba",
  js: "#cbcb41",
  jsx: "#cbcb41",
  json: "#cbcb41",
  css: "#519aba",
  scss: "#a074c4",
  html: "#e37933",
  md: "#519aba",
  txt: "#c5c5c5",
  svg: "#a074c4",
  yml: "#a074c4",
  yaml: "#a074c4",
};

const DEFAULT_COLOR = "#c5c5c5";

export function FileIcon({
  filename,
  size = 16,
  color: colorOverride,
}: {
  filename: string;
  size?: number;
  color?: string;
}) {
  // dotindex > 0 excludes dotfiles (e.g. .gitignore → ext="")
  const dotIndex = filename.lastIndexOf(".");
  const ext = dotIndex > 0 ? filename.slice(dotIndex + 1).toLowerCase() : "";
  const color = colorOverride ?? EXT_COLORS[ext] ?? DEFAULT_COLOR;
  return <FileDocSvg size={size} color={color} />;
}
