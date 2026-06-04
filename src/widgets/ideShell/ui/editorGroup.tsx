import { TabbedEditor } from "./tabbedEditor";
import { WelcomePage } from "./welcomePage";
import type { MockTab } from "./mockData";

interface EditorGroupProps {
  tabs: MockTab[];
  activeTabKey: string | null;
  onActiveTabChange: (id: string) => void;
  onCloseTab: (id: string) => void;
}

export function EditorGroup({
  tabs,
  activeTabKey,
  onActiveTabChange,
  onCloseTab,
}: EditorGroupProps) {
  return (
    <section
      className="flex flex-1 overflow-hidden bg-vscode-editor text-vscode-fg"
      aria-label="Editor"
    >
      {tabs.length === 0 || activeTabKey === null ? (
        <WelcomePage />
      ) : (
        <TabbedEditor
          tabs={tabs}
          activeTabKey={activeTabKey}
          onActiveTabChange={onActiveTabChange}
          onCloseTab={onCloseTab}
        />
      )}
    </section>
  );
}
