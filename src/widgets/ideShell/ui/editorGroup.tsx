import { TabbedEditor } from "./tabbedEditor";
import { WelcomePage } from "./welcomePage";

interface EditorGroupProps {
  view?: "welcome" | "editor";
  onAllTabsClosed?: () => void;
}

export function EditorGroup({
  view = "welcome",
  onAllTabsClosed,
}: EditorGroupProps) {
  return (
    <section
      className="flex flex-1 overflow-hidden bg-vscode-editor text-vscode-fg"
      aria-label="Editor"
    >
      {view === "welcome" ? (
        <WelcomePage />
      ) : (
        <TabbedEditor onAllTabsClosed={onAllTabsClosed} />
      )}
    </section>
  );
}
