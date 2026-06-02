import { Codicon } from "@/shared/ui";

const startActions = [
  { icon: "codicon-new-file", label: "New File..." },
  { icon: "codicon-folder-opened", label: "Open..." },
  { icon: "codicon-source-control", label: "Clone Git Repository..." },
  { icon: "codicon-remote", label: "Connect to..." },
];

const recentProjects = [
  {
    name: "webfull_9_10_nullnull_FE",
    path: "~/Documents/프로그래머스",
  },
  {
    name: "프로그래머스",
    path: "~/Documents",
  },
  {
    name: "Desktop",
    path: "~",
  },
  {
    name: "a2485",
    path: "/Users",
  },
];

const walkthroughs = [
  {
    title: "Get started with VS Code",
    description: "Customize your editor, learn the basics, and start coding",
    icon: "codicon-star-full",
    variant: "featured",
  },
  {
    title: "Learn the Fundamentals",
    icon: "codicon-lightbulb",
  },
  {
    title: "Get started with Claude Code",
    badge: "Updated",
    variant: "claude",
    progress: 25,
  },
  {
    title: "Get Started With GitLens",
    badge: "Updated",
    variant: "gitlens",
  },
];

export function WelcomePage() {
  return (
    <main className="vscode-welcome" aria-label="welcome">
      <section className="vscode-welcome__left" aria-labelledby="welcome-title">
        <div>
          <h1 id="welcome-title" className="vscode-welcome__title">
            Secretly Greatly Code
          </h1>
          <p className="vscode-welcome__subtitle">Editing evolved</p>
        </div>

        <section className="vscode-start" aria-labelledby="start-title">
          <h2 id="start-title" className="vscode-section-title">
            Start
          </h2>
          <div className="vscode-start__actions">
            {startActions.map((action) => (
              <button
                key={action.label}
                type="button"
                className="vscode-link-row"
              >
                <Codicon icon={action.icon} size={22} />
                <span>{action.label}</span>
              </button>
            ))}
          </div>
        </section>

        <section className="vscode-recent" aria-labelledby="recent-title">
          <h2 id="recent-title" className="vscode-section-title">
            Recent
          </h2>
          <ul className="vscode-recent__list">
            {recentProjects.map((project) => (
              <li key={`${project.name}-${project.path}`}>
                <button type="button" className="vscode-recent__item">
                  <span className="vscode-recent__name">{project.name}</span>
                  <span className="vscode-recent__path">{project.path}</span>
                </button>
              </li>
            ))}
          </ul>
        </section>
      </section>

      <section
        className="vscode-walkthroughs"
        aria-labelledby="walkthrough-title"
      >
        <h2 id="walkthrough-title" className="vscode-section-title">
          Walkthroughs
        </h2>
        <div className="vscode-walkthroughs__list">
          {walkthroughs.map((item) => (
            <button
              key={item.title}
              type="button"
              className="vscode-walkthrough-card"
              data-variant={item.variant}
            >
              <span className="vscode-walkthrough-card__icon">
                {item.variant === "claude" ? (
                  <span className="vscode-brand-icon vscode-brand-icon--claude">
                    ✳
                  </span>
                ) : item.variant === "gitlens" ? (
                  <span className="vscode-brand-icon vscode-brand-icon--gitlens">
                    <Codicon icon="codicon-source-control" size={14} />
                  </span>
                ) : (
                  <Codicon
                    icon={item.icon ?? "codicon-circle-large"}
                    size={item.variant === "featured" ? 18 : 20}
                  />
                )}
              </span>
              <span className="vscode-walkthrough-card__content">
                <span className="vscode-walkthrough-card__title">
                  {item.title}
                  {item.badge && (
                    <span className="vscode-walkthrough-card__badge">
                      {item.badge}
                    </span>
                  )}
                </span>
                {item.description && (
                  <span className="vscode-walkthrough-card__description">
                    {item.description}
                  </span>
                )}
              </span>
              {item.progress && (
                <span
                  className="vscode-walkthrough-card__progress"
                  style={{ width: `${item.progress}%` }}
                />
              )}
            </button>
          ))}
        </div>
      </section>

      <label className="vscode-welcome__startup">
        <input type="checkbox" defaultChecked />
        <span>Show welcome page on startup</span>
      </label>
    </main>
  );
}
