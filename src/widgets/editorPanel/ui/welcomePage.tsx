import { Codicon } from "@/shared/ui";

// 실제로 동작하는 핵심 액션 3가지 (빠른 시작).
const quickStart = [
  {
    icon: "codicon-account",
    label: "로그인 — 왼쪽 막대 맨 아래 사람 아이콘을 클릭하세요",
  },
  {
    icon: "codicon-search",
    label: "종목 찾기 — 돋보기 아이콘에서 검색 후 + 버튼으로 추가",
  },
  {
    icon: "codicon-layout-sidebar-right",
    label: "실시간 채팅 — 오른쪽 위 보조 사이드바 토글 버튼으로 열기",
  },
];

// 서비스 한 줄 소개와 핵심 기능 하이라이트.
const aboutText =
  "VS Code처럼 보이지만, 실제로는 주식 시세를 살피고 다른 투자자들과 이야기하는 공간이에요. 사무실이나 사람 많은 곳에서도 코딩하는 것처럼 자연스럽게 쓸 수 있도록 화면 전체를 개발 도구로 위장했어요.";

const highlights = [
  {
    icon: "codicon-eye-closed",
    label: "VS Code로 위장 — ESC 두 번이면 즉시 작업 화면으로 가려요",
  },
  {
    icon: "codicon-pulse",
    label: "시세·가격 알림과 관심종목·보유 포지션 관리",
  },
  {
    icon: "codicon-comment-discussion",
    label: "다른 투자자들과 실시간 채팅 (오른쪽 패널)",
  },
];

// 우측 안내 카드 — 동작하는 기능과 위장 요소 구분.
const guideCards = [
  {
    title: "동작하는 버튼만 정리했어요",
    description:
      "메뉴 바와 툴팁의 단축키(Ctrl+B 등), 상태 표시줄의 브랜치·오류 숫자는 VS Code 느낌을 살린 장식이에요. 실제 기능은 아래 버튼으로 사용하세요.",
    icon: "codicon-info",
    variant: "featured",
  },
  {
    title: "급할 땐 ESC 두 번",
    description:
      "ESC 를 빠르게 두 번 누르면 화면이 곧바로 Git 작업 화면으로 바뀌어 트레이딩 화면을 가려요. 다시 ESC 를 누르면 원래대로 돌아옵니다.",
    icon: "codicon-eye-closed",
  },
  {
    title: "실시간 채팅 패널",
    description:
      "오른쪽 패널은 AI 에이전트처럼 보이지만 사실 다른 투자자들과의 실시간 채팅이에요. 토글 버튼으로 열고 헤더의 X 로 닫습니다.",
    badge: "CHAT",
    variant: "claude",
  },
  {
    title: "종목 검색하고 추가하기",
    description:
      "왼쪽 돋보기 아이콘에서 종목을 검색한 뒤, 결과의 + 버튼으로 관심종목·포지션에 담습니다.",
    icon: "codicon-search",
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
            시작하기
          </h2>
          <div className="vscode-start__actions">
            {quickStart.map((step) => (
              <div key={step.label} className="vscode-link-row">
                <Codicon icon={step.icon} size={22} />
                <span style={{ whiteSpace: "normal" }}>{step.label}</span>
              </div>
            ))}
          </div>
        </section>

        <section className="vscode-recent" aria-labelledby="about-title">
          <h2 id="about-title" className="vscode-section-title">
            이런 서비스예요
          </h2>
          <p
            style={{
              maxWidth: 560,
              marginTop: 14,
              color: "#c5c5c5",
              fontSize: 15,
              lineHeight: "23px",
            }}
          >
            {aboutText}
          </p>
          <div className="vscode-start__actions">
            {highlights.map((item) => (
              <div key={item.label} className="vscode-link-row">
                <Codicon icon={item.icon} size={22} />
                <span style={{ whiteSpace: "normal", color: "#c8c8c8" }}>
                  {item.label}
                </span>
              </div>
            ))}
          </div>
        </section>
      </section>

      <section className="vscode-walkthroughs" aria-labelledby="guide-title">
        <h2 id="guide-title" className="vscode-section-title">
          사용 안내
        </h2>
        <div className="vscode-walkthroughs__list">
          {guideCards.map((item) => (
            <div
              key={item.title}
              className="vscode-walkthrough-card"
              data-variant={item.variant}
            >
              <span className="vscode-walkthrough-card__icon">
                {item.variant === "claude" ? (
                  <span className="vscode-brand-icon vscode-brand-icon--claude">
                    ✳
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
                  <span
                    className="vscode-walkthrough-card__description"
                    style={{ whiteSpace: "normal", overflow: "visible" }}
                  >
                    {item.description}
                  </span>
                )}
              </span>
            </div>
          ))}
        </div>
      </section>

      <label className="vscode-welcome__startup">
        <input type="checkbox" defaultChecked />
        <span>시작할 때 이 가이드 표시</span>
      </label>
    </main>
  );
}
