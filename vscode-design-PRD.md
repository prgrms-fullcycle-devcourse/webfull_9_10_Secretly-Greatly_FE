# PRD: VS Code 스타일 웹 디자인 시스템

## 1. 제품 개요

### 목표

웹 기반 에디터/개발 도구 UI에서 Visual Studio Code의 기본적인 사용감, 정보 구조, 컬러 체계, 레이아웃 밀도, 인터랙션 패턴을 재현할 수 있는 디자인 시스템을 구축한다.

### 핵심 방향

- VS Code 기본 Dark 테마를 우선 지원한다.
- 이후 Light 테마, High Contrast 테마로 확장 가능해야 한다.
- 색상은 단순 팔레트가 아니라 **역할 기반 토큰**으로 관리한다.
- 레이아웃은 실제 VS Code와 동일한 다음 구조를 기준으로 한다.

```txt
Title Bar: App Icon | Menu Bar | Navigation + Command Center | Layout + Window Controls
Activity Bar | Side Bar | Editor Area
                          Panel
Status Bar
```

> Panel은 Editor Area 아래에 위치한다. Activity Bar / Side Bar와 같은 행이 아니다.
> Activity Bar는 Title Bar 아래에서 시작한다. 앱 아이콘과 메뉴는 최신 VS Code처럼 Title Bar 안에 배치한다.

### 주요 사용자

- 웹 IDE 개발자
- 코드 리뷰 도구 개발자
- 개발자용 SaaS 대시보드 제작자
- VS Code 스타일 UI를 원하는 내부 툴 개발팀

---

## 2. 디자인 원칙

### 2.1 Functional First

장식보다 정보 밀도, 빠른 탐색, 명확한 상태 표현을 우선한다.

### 2.2 Low Contrast Surface

전체 배경은 어두운 톤을 사용하되, 패널 간 구분은 강한 카드 UI가 아니라 미세한 명도 차이와 보더로 처리한다.

### 2.3 Token Driven

모든 색상, 간격, 폰트, 상태값은 디자인 토큰으로 정의한다.

예:

```css
--vscode-editor-background
--vscode-sidebar-background
--vscode-list-hoverBackground
--vscode-focusBorder
```

### 2.4 Compact Density

VS Code UI처럼 여백을 과하게 쓰지 않는다. 버튼, 탭, 리스트 아이템은 작고 정밀해야 한다.

---

## 3. 지원 테마

### 3.1 MVP 테마 — Dark 2026 (현재 VS Code 기본값)

기준 테마는 **Dark 2026**이다. VS Code의 기본 다크 테마 설정값이 `Dark 2026`으로 바뀌었다 (`ThemeSettingDefaults.COLOR_THEME_DARK = 'Dark 2026'`). Dark Modern / Dark+ 가 아니다.

- 크롬(사이드바 / 액티비티바 / 타이틀바 / 패널 / 탭바 / 상태바)은 모두 `#191a1b`
- 에디터 배경은 **`#121314`** — 크롬보다 더 어둡다 (Dark Modern은 반대로 에디터가 더 밝았음)
- 보더는 `#2a2b2c` (매우 미세)
- 액센트는 **틸/시안 `#3994bc`** (탭 상단 보더, 패널 활성 보더, 포커스, 뱃지). 버튼은 `#297aa0`
- 액티비티바 활성 항목 좌측 막대는 **연회색 `#bfbfbf`** (`activityBar.activeBorder`)
- 기본 텍스트 `#bfbfbf`, 비활성/상태바/타이틀 텍스트 `#8c8c8c`
- 구문 강조는 GitHub Dark 계열 (`#ff7b72` 키워드, `#a5d6ff` 문자열, `#79c0ff` 숫자 등)

> 테마 변천: Dark+(`#1e1e1e`/파란 상태바) → Dark Modern(크롬 `#181818`/에디터 `#1f1f1f`/파란 액센트 `#0078d4`) → **Dark 2026**(크롬 `#191a1b`/에디터 `#121314`/틸 액센트 `#3994bc`/활성 막대 `#bfbfbf`). 핵심 변화: 에디터가 크롬보다 어두워졌고, 액센트가 파랑에서 틸로, 회색이 약간 따뜻한 `#191a1b` 계열로 이동.

### 3.2 추후 확장

- Light Modern
- High Contrast Dark
- Custom Theme Import
- 사용자 테마 JSON 연동

---

## 4. 디자인 토큰 구조

### 4.1 컬러 토큰

#### Base

```css
--color-black: #000000;
--color-white: #ffffff;
--color-transparent: transparent;
```

#### App Surface (Dark 2026)

```css
--vscode-window-background: #191a1b;

--vscode-titlebar-background: #191a1b;
--vscode-titlebar-foreground: #8c8c8c;
--vscode-titlebar-border: #2a2b2c;

--vscode-activitybar-background: #191a1b;
--vscode-activitybar-foreground: #bfbfbf;
--vscode-activitybar-inactiveForeground: #8c8c8c;
--vscode-activitybar-activeBorder: #bfbfbf; /* 활성 항목 좌측 막대 — 연회색 */
--vscode-activitybar-border: #2a2b2c;

--vscode-sidebar-background: #191a1b;
--vscode-sidebar-foreground: #bfbfbf;
--vscode-sidebar-border: #2a2b2c;

--vscode-sidebarSectionHeader-background: #191a1b;
--vscode-sidebarSectionHeader-foreground: #bfbfbf;
--vscode-sidebarSectionHeader-border: #2a2b2c;

--vscode-editor-background: #121314; /* 크롬보다 어두움 */
--vscode-editor-foreground: #bbbebf;

--vscode-panel-background: #191a1b;
--vscode-panel-border: #2a2b2c;

--vscode-statusbar-background: #191a1b;
--vscode-statusbar-foreground: #8c8c8c;
--vscode-statusbar-border: #2a2b2c;
```

#### List / Tree

```css
--vscode-list-activeSelectionBackground: #3994bc26;
--vscode-list-activeSelectionForeground: #ededed;
--vscode-list-inactiveSelectionBackground: #2c2d2e;
--vscode-list-hoverBackground: #ffffff0d;
--vscode-list-focusBackground: #3994bc26;
```

#### Tabs (Dark 2026)

```css
--vscode-tab-activeBackground: #121314;
--vscode-tab-activeForeground: #bfbfbf;
--vscode-tab-inactiveBackground: #191a1b;
--vscode-tab-inactiveForeground: #8c8c8c;
--vscode-tab-selectedBackground: #121314;
--vscode-tab-selectedForeground: #bfbfbfa0;
--vscode-tab-border: #2a2b2c;
--vscode-tab-activeBorderTop: #3994bc;
--vscode-editorGroupHeader-tabsBackground: #191a1b;
--vscode-editorGroupHeader-border: #2a2b2c;
```

#### Input (Dark 2026)

```css
--vscode-input-background: #191a1b;
--vscode-input-foreground: #bfbfbf;
--vscode-input-border: #333536;
--vscode-input-placeholderForeground: #555555;
```

#### Button (Dark 2026)

```css
--vscode-button-background: #297aa0;
--vscode-button-foreground: #ffffff;
--vscode-button-hoverBackground: #2b7da3;

--vscode-button-secondaryBackground: #3a3d41;
--vscode-button-secondaryForeground: #ffffff;
--vscode-button-secondaryHoverBackground: #45494e;
```

#### Scrollbar

```css
--vscode-scrollbarSlider-background: #83848533;
--vscode-scrollbarSlider-hoverBackground: #83848566;
--vscode-scrollbarSlider-activeBackground: #83848599;
```

#### Focus / Border (Dark 2026)

```css
--vscode-focusBorder: #3994bcb3;
--vscode-widget-border: #2a2b2c;
--vscode-contrastBorder: transparent;
```

#### Text

```css
--vscode-foreground: #bfbfbf;
--vscode-descriptionForeground: #8c8c8c;
--vscode-disabledForeground: #555555;
--vscode-errorForeground: #f48771;
```

#### Notification

```css
--vscode-notifications-background: #202122;
--vscode-notifications-foreground: #bfbfbf;
--vscode-notifications-border: #2a2b2c;
--vscode-notificationToast-border: #2a2b2c;
--vscode-notificationsInfoIcon-foreground: #75beff;
--vscode-notificationsWarningIcon-foreground: #cca700;
--vscode-notificationsErrorIcon-foreground: #f48771;
```

#### Editor Syntax 기본값

```css
--syntax-comment: #8b949e;
--syntax-keyword: #ff7b72;
--syntax-string: #a5d6ff;
--syntax-number: #79c0ff;
--syntax-function: #d2a8ff;
--syntax-variable: #ffa657;
--syntax-type: #7ee787;
--syntax-class: #7ee787;
--syntax-operator: #c9d1d9;
```

#### Tab Dirty

```css
--vscode-tab-unfocusedActiveForeground: #ffffff80;
--vscode-tab-dirtyIndicator: #e8a735;
--vscode-tab-lastPinnedBorder: #2b2b2b;
```

#### Editor Gutter

```css
--vscode-editorLineNumber-foreground: #858889;
--vscode-editorLineNumber-activeForeground: #bbbebf;
--vscode-editorGutter-background: #121314;
--vscode-editorGutter-addedBackground: #2ea043;
--vscode-editorGutter-modifiedBackground: #1b81a8;
--vscode-editorGutter-deletedBackground: #f85149;
--vscode-editorIndentGuide-background: #2a2b2c;
--vscode-editorIndentGuide-activeBackground: #707070;
```

#### Shadow

```css
--vscode-widget-shadow: rgba(0, 0, 0, 0.36);
--shadow-dropdown: 0 2px 8px rgba(0, 0, 0, 0.36);
--shadow-overlay: 0 8px 24px rgba(0, 0, 0, 0.45);
--shadow-notification: 0 4px 12px rgba(0, 0, 0, 0.40);
```

#### Title Bar Icons

```css
--vscode-titlebar-inactiveIconForeground: rgba(255, 255, 255, 0.58);
--vscode-titlebar-activeIconForeground: #ffffff;
--vscode-titlebar-closeButton-hoverBackground: #c42b1c;
```

#### Panel Title

```css
--vscode-panelTitle-activeForeground: #bfbfbf;
--vscode-panelTitle-inactiveForeground: #8c8c8c;
--vscode-panelTitle-activeBorder: #3994bc;
--vscode-icon-foreground: #8c8c8c;
```

#### Menu / Quick Input

```css
--vscode-menu-background: #202122;
--vscode-menu-foreground: #bfbfbf;
--vscode-quickInput-background: #252526;
--vscode-menu-selectionBackground: #3994bc26;
--vscode-menu-selectionForeground: #ededed;
--vscode-menu-separatorBackground: #2a2b2c;
--vscode-menu-border: #2a2b2c;
```

#### Editor Extras

```css
--vscode-editor-selectionBackground: #264f78;
```

#### Toolbar

```css
--vscode-toolbar-separator: rgba(255, 255, 255, 0.15);
```

#### Keyboard Labels

```css
--vscode-keybindingLabel-background: #3c3c3c;
--vscode-keybindingLabel-border: #555555;
--vscode-keybindingLabel-foreground: #cccccc;
```

#### Terminal ANSI (기본)

```css
--terminal-ansiBlue: #569cd6;
--terminal-ansiCyan: #4ec9b0;
```

#### Status Bar Item Variants

```css
--vscode-statusBarItem-remoteBackground: #3994bc;  /* Dark 2026 — 틸 */
--vscode-statusBarItem-remoteForeground: #ffffff;
--vscode-statusBarItem-warningBackground: #cc6633;
--vscode-statusBarItem-warningForeground: #ffffff;
--vscode-statusBarItem-errorBackground: #c72e0f;
--vscode-statusBarItem-errorForeground: #ffffff;
```

### 4.2 Z-index 토큰

UI 레이어 순서. 값이 클수록 위에 렌더링된다.

```css
--z-base: 0;
--z-sidebar: 10;
--z-panel: 10;
--z-statusbar: 20;
--z-titlebar: 30;
--z-drag-overlay: 50;
--z-tooltip: 100;
--z-dropdown: 200;
--z-context-menu: 300;
--z-overlay: 400;        /* command palette / quick pick 뒤 backdrop */
--z-command-palette: 500;
--z-notification: 600;
```

---

## 5. Typography

### 기본 폰트

UI:

```css
font-family:
  var(--font-geist-sans),   /* Next.js @next/font/google 로드 후 CSS 변수로 주입 */
  -apple-system,
  BlinkMacSystemFont,
  "Segoe UI",
  sans-serif;
```

Editor:

```css
font-family:
  "Cascadia Code",
  "Consolas",
  "Courier New",
  monospace;
```

### Font Sizes

```css
--font-size-xs: 10px;
--font-size-sm: 11px;
--font-size-md: 12px;   /* 상태바, 브레드크럼, 타이틀바 */
--font-size-lg: 13px;   /* UI 기본 텍스트 */
--font-size-editor: 14px;
```

### Line Heights

```css
--line-height-tight: 16px;
--line-height-normal: 20px;
--line-height-editor: 22px;
```

### 규칙

- **UI 기본 텍스트는 `13px`.**
- 에디터 텍스트는 `14px`.
- 타이틀바, 상태바, 브레드크럼 텍스트는 `12px`.
- 사이드바 리스트는 `13px`.
- letter-spacing은 기본 `0`.

---

## 6. Spacing

```css
--space-0: 0;
--space-1: 2px;
--space-2: 4px;
--space-3: 6px;
--space-4: 8px;
--space-5: 12px;
--space-6: 16px;
--space-7: 20px;
--space-8: 24px;
```

### 사용 기준

- 아이콘 버튼 내부 여백: `4px`
- 리스트 아이템 좌우 여백: `8px`
- 패널 헤더 높이: `35px`
- 탭 높이: `35px`
- 상태바 높이: `22px`
- 타이틀바 높이: `34px`
- 액티비티바 너비: `48px`
- 사이드바 기본 너비: `300px`
- 패널 기본 높이: `220px`

---

## 7. Radius

VS Code는 둥근 느낌이 강하지 않다.

```css
--radius-none: 0;
--radius-xs: 2px;
--radius-sm: 3px;
--radius-md: 4px;
```

### 규칙

- 대부분의 패널, 탭, 사이드바는 radius `0`.
- 입력창, 버튼은 `2px`.
- 모달이나 컨텍스트 메뉴는 최대 `4px`.

---

## 8. Border

```css
--border-width-default: 1px;
--border-color-default: #2a2b2c;
--border-color-subtle: #2a2b2c;
```

### 규칙

- 패널 구분은 `1px solid`.
- 카드형 UI는 지양한다.
- 그림자보다 보더와 배경 차이로 레이어를 표현한다.

---

## 9. Layout System

### 9.1 전체 앱 구조

```txt
.app
 ├─ .titlebar
 ├─ .workbench                  ← flex row
 │   ├─ .activitybar
 │   ├─ .sidebar
 │   └─ .main-area              ← flex column (editor + panel을 수직으로 나눔)
 │       ├─ .editor-group
 │       └─ .panel
 └─ .statusbar
```

> `.panel`은 `.editor-group`과 같은 레벨의 형제가 아니라,
> `.main-area` 안에서 수직으로 쌓인다.
> `.titlebar`는 최신 VS Code 상단처럼 앱 아이콘, 메뉴바, 네비게이션, Command Center, 레이아웃 컨트롤, 윈도우 컨트롤을 한 줄에 포함한다.

### 9.2 기본 크기

```css
--titlebar-height: 34px;
--activitybar-width: 48px;
--sidebar-width: 300px;
--panel-height: 220px;
--statusbar-height: 22px;
--tabbar-height: 35px;
--panel-tabbar-height: 30px;
```

### 9.3 반응형 정책

#### Desktop

- Activity Bar 고정
- Side Bar 리사이즈 가능
- Editor Area 유동
- Bottom Panel 열고 닫기 가능

#### Tablet

- Side Bar overlay 모드 지원
- Panel은 bottom drawer처럼 동작

#### Mobile

- Activity Bar는 하단 탭바로 변경 가능
- Editor Area 단일 화면 중심
- Side Bar와 Panel은 full-screen drawer로 표시

---

## 10. 핵심 컴포넌트

## 10.1 Title Bar

### 역할

앱 이름, 현재 프로젝트, 명령 팔레트, 윈도우 액션을 표시한다.

### 구성

- 왼쪽: 앱 아이콘 + Menu Bar (File, Edit, Selection, View, Go, Run, Terminal, Help)
- 중앙: ← → 네비게이션 + command center (현재 프로젝트명)
- 오른쪽: layout controls, account, settings, 윈도우 액션 (최소화/최대화/닫기)

### 상태

- default
- focused
- inactive window

### 스타일

```css
height: 34px;
background: var(--vscode-titlebar-background);
color: var(--vscode-titlebar-foreground);
font-size: 12px;
```

---

## 10.2 Menu Bar

### 역할

VS Code와 동일한 메뉴 항목을 제공한다. Title Bar 좌측에 위치하며, 각 항목 클릭 시 드롭다운 메뉴가 열린다.

### 메뉴 항목 및 하위 구성

#### File

- New Text File `Ctrl+N`
- New Window `Ctrl+Shift+N`
- Open File… `Ctrl+O`
- Open Folder… `Ctrl+K Ctrl+O`
- Open Recent ▶
- Save `Ctrl+S`
- Save As… `Ctrl+Shift+S`
- Save All `Ctrl+K S`
- ─────
- Close Editor `Ctrl+W`
- Close Folder
- ─────
- Exit

#### Edit

- Undo `Ctrl+Z`
- Redo `Ctrl+Y`
- ─────
- Cut `Ctrl+X`
- Copy `Ctrl+C`
- Paste `Ctrl+V`
- ─────
- Find `Ctrl+F`
- Replace `Ctrl+H`
- Find in Files `Ctrl+Shift+F`
- Replace in Files `Ctrl+Shift+H`

#### Selection

- Select All `Ctrl+A`
- Expand Selection `Shift+Alt+→`
- Shrink Selection `Shift+Alt+←`
- ─────
- Copy Line Up `Shift+Alt+↑`
- Copy Line Down `Shift+Alt+↓`
- Move Line Up `Alt+↑`
- Move Line Down `Alt+↓`
- ─────
- Add Cursor Above `Ctrl+Alt+↑`
- Add Cursor Below `Ctrl+Alt+↓`
- Add Cursors to Line Ends `Shift+Alt+I`

#### View

- Command Palette… `Ctrl+Shift+P`
- Open View…
- ─────
- Appearance ▶
  - Fullscreen `F11`
  - Zen Mode `Ctrl+K Z`
  - ─────
  - Activity Bar
  - Side Bar `Ctrl+B`
  - Panel `Ctrl+J`
  - Status Bar
- Editor Layout ▶
  - Split Up / Down / Left / Right
  - Single / Two / Three Columns
- ─────
- Explorer `Ctrl+Shift+E`
- Search `Ctrl+Shift+F`
- Source Control `Ctrl+Shift+G`
- Run `Ctrl+Shift+D`
- Extensions `Ctrl+Shift+X`
- ─────
- Problems `Ctrl+Shift+M`
- Output `Ctrl+Shift+U`
- Debug Console `Ctrl+Shift+Y`
- Terminal `` Ctrl+` ``
- ─────
- Word Wrap `Alt+Z`

#### Go

- Back `Alt+←`
- Forward `Alt+→`
- ─────
- Go to File… `Ctrl+P`
- Go to Symbol in Workspace… `Ctrl+T`
- Go to Symbol in Editor… `Ctrl+Shift+O`
- Go to Definition `F12`
- Go to Declaration
- Go to Type Definition
- Go to References `Shift+F12`
- ─────
- Go to Line/Column… `Ctrl+G`
- Go to Bracket `Ctrl+Shift+\`
- ─────
- Next Problem `F8`
- Previous Problem `Shift+F8`

#### Run

- Start Debugging `F5`
- Run Without Debugging `Ctrl+F5`
- Stop Debugging `Shift+F5`
- Restart Debugging `Ctrl+Shift+F5`
- ─────
- Open Configurations
- Add Configuration…
- ─────
- Step Over `F10`
- Step Into `F11`
- Step Out `Shift+F11`
- Continue `F5`
- ─────
- Toggle Breakpoint `F9`
- New Breakpoint ▶
- Enable All Breakpoints
- Disable All Breakpoints
- Remove All Breakpoints

#### Terminal

- New Terminal `` Ctrl+` ``
- Split Terminal `Ctrl+Shift+5`
- ─────
- Run Task…
- Run Build Task… `Ctrl+Shift+B`
- Run Active File
- Run Selected Text
- ─────
- Show Running Tasks…
- Restart Running Task…
- Terminate Task…

#### Help

- Welcome
- Show All Commands `Ctrl+Shift+P`
- Documentation
- ─────
- Keyboard Shortcuts Reference `Ctrl+K Ctrl+R`
- Video Tutorials
- Tips and Tricks
- ─────
- Join Us on X (Twitter)
- Search Feature Requests
- Report Issue
- ─────
- View License
- Privacy Statement
- ─────
- Check for Updates…
- About

### 상태

- default
- hover
- active (드롭다운 열림)
- focused (키보드 네비게이션)
- disabled

### 드롭다운 스타일

메뉴 항목의 드롭다운은 Context Menu(10.15)와 동일한 스타일을 공유한다.

```css
.menu-bar {
  display: flex;
  align-items: center;
  height: 34px;
  padding: 0 4px;
  font-size: 12px;
  color: var(--vscode-titlebar-foreground);
}

.menu-bar-item {
  padding: 0 8px;
  height: 100%;
  display: flex;
  align-items: center;
  border-radius: var(--radius-xs);
}

.menu-bar-item:hover,
.menu-bar-item[data-active="true"] {
  background: rgba(255, 255, 255, 0.1);
}
```

### 키보드 접근

- `Alt` 키로 메뉴바 포커스 진입
- 방향키로 메뉴 간 이동 및 하위 메뉴 열기
- `Esc`로 닫기
- 각 항목 첫 글자(F, E, S, V, G, R, T, H)로 빠른 접근

---

## 10.3 Activity Bar

### 역할

주요 작업 영역 전환.

### 기본 아이템

- Explorer
- Search
- Source Control
- Run and Debug
- Extensions
- Account
- Settings

### 상태

- idle
- hover
- active
- badge
- disabled

### 스타일

```css
width: 48px;
background: var(--vscode-activitybar-background);
```

### 인터랙션

- 클릭 시 Side Bar View 변경
- active item은 좌측 또는 우측에 indicator 표시
- hover 시 foreground opacity 증가
- badge는 작은 원형 또는 rounded label 사용

---

## 10.4 Side Bar

### 역할

파일 탐색기, 검색, Git 변경 사항 등 보조 작업 패널.

### 구성

- Sidebar Header
- Section Header (`EXPLORER`, `OPEN EDITORS` 등)
- Tree View
- Action Buttons

### Section Header 스타일

```css
.sidebar-section-header {
  background: var(--vscode-sidebarSectionHeader-background);
  color: var(--vscode-sidebarSectionHeader-foreground);
  border-bottom: 1px solid var(--vscode-sidebarSectionHeader-border);
  font-size: 11px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  padding: 0 8px;
  height: 22px;
}
```

### Explorer 섹션 예시

```txt
EXPLORER
PROJECT
  src
    components
    pages
    App.tsx
  package.json
```

### 스타일

```css
width: 300px;
background: var(--vscode-sidebar-background);
color: var(--vscode-sidebar-foreground);
border-right: 1px solid var(--vscode-sidebar-border);
font-size: 13px;
```

---

## 10.4b Search View

### 역할

Side Bar의 Search 탭(`Ctrl+Shift+F`)에서 전체 프로젝트 파일을 검색·치환한다.

### 레이아웃 구조

```txt
┌─ Header ──────────────────────────────────────────┐
│ SEARCH         [↺] [✕] [📄+] [≡] [─]             │
├───────────────────────────────────────────────────┤
│ [›] [ Search...          ] [Aa] [ab] [.*]         │
│ [ ] [ Replace...         ] [↺] [↺↺]              │
│                                           [···]   │
├───────────────────────────────────────────────────┤
│ Results                                           │
└───────────────────────────────────────────────────┘
```

### 구성

#### Header 액션 버튼 (우측)

| 아이콘 | 기능 | 단축키 |
| --- | --- | --- |
| RefreshCw | Refresh | — |
| X | Clear Search Results | — |
| FilePlus2 | Open New Search Editor | — |
| AlignJustify | Toggle Replace | — |
| Minus | Collapse All | — |

#### Search Input

- placeholder: `Search`
- 우측 토글 버튼 3개

| 버튼 | 기능 | 단축키 |
| --- | --- | --- |
| `Aa` | Match Case | `Alt+C` |
| `ab` | Match Whole Word | `Alt+W` |
| `.*` | Use Regular Expression | `Alt+R` |

#### Replace 토글

- Search 입력 좌측의 chevron(`›` / `˅`)으로 Replace 영역 열고 닫기

#### Replace Input

- placeholder: `Replace`
- 우측 액션 버튼 2개

| 버튼 | 기능 | 단축키 |
| --- | --- | --- |
| Replace icon | Replace (현재 항목) | `Enter` |
| ReplaceAll icon | Replace All | `Ctrl+Alt+Enter` |

#### More Options

- `···` 버튼으로 include/exclude 파일 패턴 필드 표시 (Phase 3)

### Toggle 버튼 상태

```css
.search-toggle-btn {
  width: 20px;
  height: 20px;
  border-radius: var(--radius-xs);
  font-size: 11px;
  font-weight: 600;
  font-family: var(--font-editor);
}

.search-toggle-btn[data-active="false"] {
  background: transparent;
  color: var(--vscode-foreground);
}

.search-toggle-btn[data-active="true"] {
  background: var(--vscode-list-activeSelectionBackground);
  color: var(--vscode-list-activeSelectionForeground);
}
```

### Input 스타일

```css
.search-input-wrapper {
  display: flex;
  align-items: center;
  background: var(--vscode-input-background);
  border: 1px solid transparent;
  border-radius: var(--radius-xs);
  height: 28px;
  padding-left: 6px;
  padding-right: 4px;
}

.search-input-wrapper:focus-within {
  border-color: var(--vscode-focusBorder);
}

.search-input {
  flex: 1;
  background: transparent;
  border: none;
  outline: none;
  color: var(--vscode-input-foreground);
  font-size: var(--font-size-lg);
}

.search-input::placeholder {
  color: var(--vscode-input-placeholderForeground);
}
```

### Results 영역

- 검색 전: "Type to search" (중앙 정렬, muted 색상)
- 검색 결과 없음: `No results for "query"`
- 검색 결과 있음 (Phase 3): 파일명 + 매칭 라인 트리 형태

---

## 10.5 Tree Item

### 높이

```css
height: 22px;
```

### 구성

- chevron icon
- file/folder icon
- label
- optional badge/status

### 상태

- default
- hover
- selected
- focused
- disabled
- dirty
- added
- modified
- deleted

### 스타일

```css
.tree-item:hover {
  background: var(--vscode-list-hoverBackground);
}

.tree-item[data-selected="true"] {
  background: var(--vscode-list-activeSelectionBackground);
  color: var(--vscode-list-activeSelectionForeground);
}
```

---

## 10.6 Editor Area

### 역할

코드 편집, 탭 관리, 문서 표시.

### 구성

- Tab Bar
- Breadcrumb
- Editor Content
- Scrollbar (커스텀 스타일 적용)

### 배경

```css
background: var(--vscode-editor-background);
color: var(--vscode-editor-foreground);
```

---

## 10.7 Tab Bar

### Tab 구성

- file icon
- filename
- dirty dot
- close button

### 상태

- active
- inactive
- hover
- dirty
- pinned
- preview

### 스타일

```css
.tab {
  height: 35px;
  background: var(--vscode-tab-inactiveBackground);
  color: var(--vscode-tab-inactiveForeground);
  font-size: 13px;
}

.tab[data-active="true"] {
  background: var(--vscode-tab-activeBackground);
  color: var(--vscode-tab-activeForeground);
  border-top: 1px solid var(--vscode-tab-activeBorderTop);
}
```

---

## 10.8 Breadcrumb

### 역할

현재 파일 경로와 심볼 위치 표시.

### 예시

```txt
src > components > Button.tsx > Button
```

### 스타일

- 높이: `22px`
- 텍스트: `12px`
- hover 시 path segment 강조

---

## 10.9 Panel

### 역할

터미널, 문제, 출력, 디버그 콘솔 표시.

### 탭바 구조 (중요)

패널 탭바는 **좌우 두 영역**으로 나뉜다.

```txt
[PROBLEMS][OUTPUT][DEBUG CONSOLE][TERMINAL]     [● webfull_9_10_Secretly-Greatly_FE ×] | [+][˅][Split][Maximize][×]
└── 섹션 선택 탭 (왼쪽)                           └── 인스턴스 탭 + 액션 버튼 (오른쪽, TERMINAL 활성 시만)
```

#### 왼쪽 — 섹션 탭

| 탭 | 내용 |
| --- | --- |
| PROBLEMS | 타입/린트 오류 목록 |
| OUTPUT | 빌드·태스크 출력 |
| DEBUG CONSOLE | 디버거 콘솔 |
| TERMINAL | 터미널 인스턴스 |

#### 오른쪽 — 터미널 인스턴스 탭 (TERMINAL 활성 시)

- `● 프로젝트명 ×` 형태. 브라우저 탭처럼 여러 개 가능
- `●` 색상: 실행 중 `#4ec9b0` / 종료 gray
- 활성 인스턴스 탭은 별도 카드처럼 튀지 않고, 배경은 거의 투명하게 유지한다.

#### 오른쪽 — 액션 버튼

| 버튼 | 기능 |
| --- | --- |
| `+` | New Terminal |
| `˅` | Select Default Profile |
| Split | Split Terminal |
| Maximize | Maximize Panel |
| `✕` | Close Panel |

### 상태

- open / closed / maximized / resized

### 스타일

```css
height: 220px;
background: var(--vscode-panel-background);
border-top: 1px solid var(--vscode-panel-border);
```

---

## 10.10 Terminal

### 역할

패널 내 터미널 인스턴스. 섹션 탭이 아니라 **인스턴스 탭** 단위로 관리된다.

### 폰트

```css
font-family: "Cascadia Code", Consolas, monospace;
font-size: 13px;
line-height: 18px;
```

### 기본 색상

```css
--terminal-background: #191a1b;
--terminal-foreground: #bfbfbf;
--terminal-cursor: #ffffff;
--terminal-selectionBackground: #ffffff40;
```

---

## 10.11 Scrollbar

### 역할

에디터, 사이드바, 패널 등 스크롤 가능한 모든 영역에 VS Code 스타일 커스텀 스크롤바 적용.

### 스타일

```css
::-webkit-scrollbar {
  width: 10px;
  height: 10px;
}

::-webkit-scrollbar-track {
  background: transparent;
}

::-webkit-scrollbar-thumb {
  background: var(--vscode-scrollbarSlider-background);
}

::-webkit-scrollbar-thumb:hover {
  background: var(--vscode-scrollbarSlider-hoverBackground);
}

::-webkit-scrollbar-thumb:active {
  background: var(--vscode-scrollbarSlider-activeBackground);
}
```

### 규칙

- 스크롤바 너비는 `10px` (hover 시 표시)
- track 배경은 투명
- thumb는 반투명 gray 계열
- 에디터 내부는 overlay scrollbar 방식 권장

---

## 10.12 Status Bar

### 역할

브랜치, 에러 수, 경고 수, 포맷, 인코딩, 언어 모드 등을 표시.

### 구성

왼쪽:

- Remote (`><`) — 좌측 맨 끝. 로컬 창에서도 항상 표시되며 배경은 `--vscode-statusBarItem-remoteBackground`(`#3994bc`, Dark 2026 틸). 클릭 시 "Open a Remote Window".
- Git branch
- Sync status
- Error count
- Warning count

오른쪽:

- Line / Column
- Spaces
- Encoding
- EOL
- Language Mode
- Notifications

### 스타일

```css
height: 22px;
background: var(--vscode-statusbar-background);
color: var(--vscode-statusbar-foreground);
font-size: 12px;
```

---

## 10.13 Command Palette

### 역할

명령 검색 및 실행.

### 호출

- `Ctrl + Shift + P` / `Cmd + Shift + P`

### 구성

- 검색 입력창
- 명령 리스트
- 최근 사용 명령
- 카테고리 라벨

### 스타일

```css
.command-palette {
  width: min(720px, calc(100vw - 32px));
  background: var(--vscode-quickInput-background);
  border: 1px solid var(--vscode-widget-border);
  box-shadow: var(--shadow-overlay);
  border-radius: var(--radius-sm);
}
```

---

## 10.14 Quick Pick (Quick Open)

### 역할

파일 열기, 심볼 이동, 최근 작업 탐색 등 빠른 탐색.

### 호출

- `Ctrl + P` / `Cmd + P` → 파일 열기
- `Ctrl + P` 후 `@` → 심볼 이동
- `Ctrl + P` 후 `:` → 특정 줄 이동

### Command Palette와의 차이

| | Command Palette | Quick Pick |
|---|---|---|
| 단축키 | `Ctrl+Shift+P` | `Ctrl+P` |
| 용도 | 명령 실행 | 파일/심볼 탐색 |
| prefix | `>` 포함 | 없음 |

### 구성

- 검색 입력창 (prefix 표시 포함)
- 파일/항목 리스트
- 파일 아이콘
- 경로 표시 (우측 보조 텍스트)
- 키보드 hint

### 스타일

Command Palette와 동일한 컨테이너를 공유하되 placeholder와 리스트 항목 구조가 다르다.

```css
.quick-pick {
  width: min(680px, calc(100vw - 32px));
  background: var(--vscode-quickInput-background);
  border: 1px solid var(--vscode-border-widget);
  box-shadow: var(--shadow-overlay);
  border-radius: var(--radius-sm);
}

.quick-pick-item {
  height: 22px;
  padding: 0 8px;
  font-size: 13px;
  display: flex;
  align-items: center;
  gap: 6px;
}

.quick-pick-item-description {
  color: var(--vscode-descriptionForeground);
  font-size: 12px;
  margin-left: auto;
}
```

---

## 10.15 Context Menu

### 역할

우클릭 메뉴.

### 상태

- default
- hover
- disabled
- separator
- submenu

### 스타일

```css
.context-menu {
  background: var(--vscode-menu-background);
  color: var(--vscode-menu-foreground);
  border: 1px solid var(--vscode-menu-border);
  min-width: 180px;
  font-size: 13px;
  border-radius: var(--radius-sm);
}

.context-menu-item {
  height: 24px;
  padding: 0 24px;
}
```

---

## 10.16 Notification / Toast

### 역할

정보, 경고, 에러 메시지를 화면 우하단에 표시.

### 유형

- info
- warning
- error

### 구성

- 아이콘 (유형별)
- 메시지 텍스트
- 보조 액션 버튼 (선택)
- 닫기 버튼

### 위치

화면 우하단, Status Bar 바로 위.

### 상태

- appearing
- visible
- dismissing
- stacked (여러 개일 때)

### 스타일

```css
.notification-toast {
  width: 320px;
  background: var(--vscode-notifications-background);
  color: var(--vscode-notifications-foreground);
  border: 1px solid var(--vscode-notificationToast-border);
  border-radius: var(--radius-sm);
  padding: 12px;
  font-size: 13px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.4);
}

.notification-icon[data-type="info"]    { color: var(--vscode-notificationsInfoIcon-foreground); }
.notification-icon[data-type="warning"] { color: var(--vscode-notificationsWarningIcon-foreground); }
.notification-icon[data-type="error"]   { color: var(--vscode-notificationsErrorIcon-foreground); }
```

---

## 10.17 Tooltip

### 역할

Activity Bar 아이콘, 버튼, 탭 등 hover 시 간단한 설명 또는 단축키를 표시한다.

### 구성

- 텍스트 라벨
- 단축키 (선택, 우측에 muted 색상으로 표시)

### 위치 규칙

- Activity Bar 아이콘 → 우측에 표시
- 상단 버튼 → 하단에 표시
- 탭 → 하단에 표시

### 상태

- hidden (기본)
- visible (hover 200ms 후)

### 스타일

```css
.tooltip {
  background: var(--vscode-menu-background);
  color: var(--vscode-foreground);
  border: 1px solid var(--vscode-widget-border);
  border-radius: var(--radius-xs);
  padding: 4px 8px;
  font-size: 12px;
  white-space: nowrap;
  box-shadow: var(--shadow-dropdown);
  z-index: var(--z-tooltip);
  pointer-events: none;
}

.tooltip-shortcut {
  color: var(--vscode-descriptionForeground);
  margin-left: 8px;
}
```

### 딜레이

```css
--tooltip-delay: 500ms;
```

---

## 10.18 Editor Gutter

### 역할

에디터 좌측 라인 번호, 폴딩 화살표, Git diff 표시, 브레이크포인트 영역.

### 구성

- 라인 번호 (현재 커서 라인은 밝게)
- 폴딩 화살표 (hover 시 표시)
- Git diff 인디케이터 (added/modified/deleted)
- 브레이크포인트 영역 (클릭으로 토글)

### 스타일

```css
.editor-gutter {
  background: var(--vscode-editorGutter-background);
  min-width: 50px;
  user-select: none;
}

.line-number {
  color: var(--vscode-editorLineNumber-foreground);
  font-size: 14px;
  text-align: right;
  padding-right: 10px;
}

.line-number[data-active="true"] {
  color: var(--vscode-editorLineNumber-activeForeground);
}

.gutter-diff[data-type="added"]    { background: var(--vscode-editorGutter-addedBackground); width: 3px; }
.gutter-diff[data-type="modified"] { background: var(--vscode-editorGutter-modifiedBackground); width: 3px; }
.gutter-diff[data-type="deleted"]  { background: var(--vscode-editorGutter-deletedBackground); width: 3px; }
```

### 인덴트 가이드

```css
.indent-guide {
  border-left: 1px solid var(--vscode-editorIndentGuide-background);
}

.indent-guide[data-active="true"] {
  border-left-color: var(--vscode-editorIndentGuide-activeBackground);
}
```

---

## 10.19 Panel Tab Bar

### 역할

하단 패널(Problems, Output, Debug Console, Terminal) 전환 탭.
Editor Tab Bar(10.7)와 시각적으로 구별된다.

### Editor Tab과의 차이

| | Editor Tab | Panel Tab |
| --- | --- | --- |
| 높이 | 35px | 30px |
| active border | 상단 `#3994bc` | 하단 `#3994bc` |
| 배경 | `#191a1b` / `#121314` | 모두 투명 |
| 폰트 크기 | 13px | 12px |

### 스타일

```css
.panel-tab-bar {
  height: 30px;
  display: flex;
  align-items: center;
  border-bottom: 1px solid var(--vscode-panel-border);
}

.panel-tab {
  height: 100%;
  padding: 0 12px;
  font-size: 12px;
  color: var(--vscode-tab-inactiveForeground);
  background: transparent;
  border: 0;
  cursor: default;
  position: relative;
  white-space: nowrap; /* "DEBUG CONSOLE" 같은 두 단어 라벨이 줄바꿈되지 않도록 */
}

.panel-tab[data-active="true"] {
  color: var(--vscode-tab-activeForeground);
  font-weight: 400; /* VS Code 패널 탭은 활성 시에도 굵어지지 않고 하단 밑줄로만 구분 */
}

.panel-tab[data-active="true"]::after {
  content: "";
  position: absolute;
  left: 10px;
  right: 10px;
  bottom: 0;
  height: 1px;
  background: var(--vscode-tab-activeBorderTop);
}

.panel-tab:hover {
  color: var(--vscode-foreground);
}
```

---

## 10.20 Empty State (No Editor Open)

### 역할

열린 파일이 없을 때 Editor Area에 표시하는 화면.

### 구성

- 앱 로고 또는 아이콘 (중앙)
- 앱 이름
- 빠른 시작 링크 목록
- 최근 열기 목록 (선택)

### VS Code 기준 빠른 시작 항목

- New File `Ctrl+N`
- Open File `Ctrl+O`
- Open Folder `Ctrl+K Ctrl+O`
- Clone Git Repository

### 스타일

```css
.empty-editor {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  background: var(--vscode-editor-background);
  color: var(--vscode-descriptionForeground);
  font-size: 13px;
  user-select: none;
}

.empty-editor-title {
  font-size: 24px;
  font-weight: 300;
  color: var(--vscode-foreground);
  margin-bottom: 24px;
}

.empty-editor-action {
  color: var(--vscode-foreground);
  text-decoration: none;
  padding: 4px 8px;
  border-radius: var(--radius-xs);
}

.empty-editor-action:hover {
  background: var(--vscode-list-hoverBackground);
}

.empty-editor-action-shortcut {
  color: var(--vscode-descriptionForeground);
  margin-left: 16px;
  font-size: 12px;
}
```

---

## 11. Interaction Requirements

### 11.1 Focus

모든 키보드 조작 가능한 요소는 focus state를 가져야 한다.

```css
:focus-visible {
  outline: 1px solid var(--vscode-focusBorder);
  outline-offset: -1px;
}
```

### 11.2 Hover

- hover 배경은 강하지 않게 처리한다.
- 리스트, 탭, 버튼, 메뉴는 hover 상태 필수.

### 11.3 Selection

- 활성 패널의 선택과 비활성 패널의 선택 색상을 분리한다.
- focus가 빠진 리스트는 inactive selection background 사용.

### 11.4 Resize

다음 영역은 드래그 리사이즈 가능해야 한다.

- Side Bar width
- Panel height
- Editor split width
- Editor split height

### 11.5 Drag Handle

리사이즈 핸들은 기본적으로 투명하며, hover 시에만 색상이 나타난다.

```css
.drag-handle {
  background: transparent;
  transition: background var(--duration-fast) var(--easing-default);
  z-index: var(--z-drag-overlay);
}

/* 수직 핸들 (Side Bar 우측) */
.drag-handle-vertical {
  width: 4px;
  cursor: ew-resize;
}

/* 수평 핸들 (Panel 상단) */
.drag-handle-horizontal {
  height: 4px;
  cursor: ns-resize;
}

.drag-handle:hover,
.drag-handle[data-dragging="true"] {
  background: var(--vscode-focusBorder);
}
```

---

## 12. Accessibility

### 필수 요구사항

- 키보드 네비게이션 지원
- focus-visible 명확히 표시
- 메뉴와 트리는 ARIA role 사용
- 아이콘 버튼은 aria-label 필수
- 색상만으로 상태를 전달하지 않음
- 최소 텍스트 대비 WCAG AA 권장

### ARIA 예시

```html
<nav aria-label="Activity Bar">
<ul role="tree">
<li role="treeitem" aria-expanded="true">
<button aria-label="Close editor">
```

---

## 13. Icon System

### 13.1 UI 아이콘 (Codicons)

Activity Bar, 버튼, 상태바 등 UI 전반에 사용하는 아이콘.

- VS Code 공식 아이콘셋: `@vscode/codicons`
- 대안: `lucide-react` (Codicon과 유사한 스타일)

```bash
npm install @vscode/codicons
# 또는
npm install lucide-react
```

### 아이콘 크기

```css
--icon-size-sm: 14px;
--icon-size-md: 16px;
--icon-size-lg: 20px;
```

### 크기 적용 규칙

- Activity Bar 아이콘: `24px` 영역 안에 `20px`
- Tree 아이콘: `16px`
- Status Bar 아이콘: `14px`
- Button 아이콘: `16px`

---

### 13.2 파일 타입 아이콘 (File Icons)

Explorer 파일 트리에서 `.tsx`, `.json`, `.css` 등 확장자별 컬러 아이콘.

#### 소스 옵션

| 옵션 | 특징 | 설치 |
| --- | --- | --- |
| **seti-ui** | VS Code 기본 아이콘 테마, SVG 원본 제공 | `npm install seti-ui` |
| **vscode-icons** | 가장 많이 쓰는 확장, MIT 라이선스 | GitHub SVG 직접 사용 |
| **react-file-icon** | React 컴포넌트로 바로 사용 가능 | `npm install react-file-icon` |
| **vscode-icons-js** | 확장자 → 아이콘 이름 매핑 테이블만 제공 | `npm install vscode-icons-js` |

#### 권장

MVP에서는 `react-file-icon`으로 빠르게 구현하고, 이후 `seti-ui` SVG로 교체한다.

```bash
npm install react-file-icon
```

```tsx
import { FileIcon, defaultStyles } from 'react-file-icon';

// 사용 예시
<FileIcon extension="tsx" {...defaultStyles.tsx} />
<FileIcon extension="json" {...defaultStyles.json} />
```

#### vscode-icons-js 사용 예시 (아이콘 이름만 필요할 때)

```ts
import { getIconForFile, getIconForFolder } from 'vscode-icons-js';

getIconForFile('index.tsx')    // → "file_type_reactts.svg"
getIconForFile('package.json') // → "file_type_npm.svg"
getIconForFolder('src')        // → "folder_type_src.svg"
```

#### 파일 아이콘 크기

```css
--file-icon-size: 16px;   /* Tree View 기본 */
--file-icon-size-lg: 20px; /* 탭 등 */
```

---

## 14. Motion

VS Code 스타일에서는 모션을 최소화한다.

```css
--duration-fast: 80ms;
--duration-normal: 120ms;
--easing-default: ease-out;
```

### 적용

- hover color transition
- panel open/close
- sidebar collapse
- command palette / quick pick appear
- notification toast appear/dismiss

### 금지

- 과한 bounce
- 큰 scale animation
- decorative animation

---

## 15. 구현 산출물

### 15.1 디자인 토큰

필수 파일:

```txt
tokens/
  colors.dark.css
  colors.light.css
  typography.css
  spacing.css
  radius.css
  shadow.css
  scrollbar.css
```

### 15.2 컴포넌트

MVP 컴포넌트:

```txt
components/
  AppShell
  TitleBar
  ActivityBar
  SideBar
  SidebarSectionHeader
  TreeView
  EditorTabs
  EditorPane
  Panel
  StatusBar
  CommandPalette
  QuickPick
  ContextMenu
  Notification
  Button
  IconButton
  Input
  SplitView
```

### 15.3 Storybook

각 컴포넌트는 다음 상태를 Storybook에 포함한다.

- default
- hover
- active
- focused
- disabled
- selected
- dense
- with icon
- with badge

---

## 16. MVP 범위

### 포함

- Dark theme token
- 기본 AppShell (레이아웃 올바른 구조)
- Activity Bar
- Side Bar Explorer (Section Header 포함)
- Editor Tabs
- Editor Pane mock
- Bottom Panel
- Status Bar
- Command Palette (`Ctrl+Shift+P`)
- Quick Pick (`Ctrl+P`)
- Context Menu
- Notification Toast
- Button / Input / IconButton
- Scrollbar 커스텀 스타일

### 제외

- 실제 코드 편집 기능
- Monaco Editor 완전 통합
- Extension Marketplace
- Git 실제 연동
- Debugger 실제 연동
- Settings Sync
- 테마 import/export
- Minimap (에디터 우측 코드 축소 미리보기 — VS Code 기본값이지만 이 시스템에선 의도적으로 제외)

---

## 16.5 VS Code 충실도 갭 체크리스트

실제 VS Code와 1:1로 대조해 확인한 항목이다. 구현(`src/widgets/ide-shell`, `src/shared/styles/tokens.css`, `src/app/globals.css`)이 아래 기준을 만족하는지 점검한다.

### 일치 확인 (✅ 구현 완료)

- [x] **레이아웃**: Title Bar → (Activity Bar · Side Bar · Editor+Panel) → Status Bar. Panel은 Editor 아래 수직 분할.
- [x] **타이틀바**: 앱 아이콘 + Menu Bar(좌) / 네비게이션·Command Center(중앙) / 레이아웃 토글·윈도우 컨트롤(우). 높이 34px.
- [x] **Command Center**: 타이틀바 정중앙, 클릭 시 인라인 입력 + Quick Open 드롭다운.
- [x] **윈도우 컨트롤**: Windows 스타일 최소화/복원/닫기 (mac 신호등 아님).
- [x] **액티비티바**: 너비 48px, 아이콘 24px, 활성 시 좌측 2px 인디케이터 + foreground 변경.
- [x] **사이드바**: 300px, 섹션 헤더 22px·11px·uppercase·700, `#191a1b` 배경.
- [x] **에디터 탭바**: 별도 행(35px), 활성 탭 상단 `#3994bc`(틸) 보더 + 에디터 배경(`#121314`), dirty dot.
- [x] **브레드크럼**: 탭 아래 22px·12px 경로 표시.
- [x] **패널 탭바**: PROBLEMS/OUTPUT/DEBUG CONSOLE/TERMINAL/PORTS, 활성 시 하단 밑줄(굵기 변화 없음), 한 줄 유지(`white-space: nowrap`).
- [x] **상태바**: 22px, `#191a1b` 배경, 좌측 Remote(`><`)·branch·err·warn / 우측 Ln·Col·Spaces·Encoding·EOL·Lang.
- [x] **색상**: 모든 surface가 역할 기반 토큰(`--vscode-*`)을 사용, 하드코딩 없음. **Dark 2026** 팔레트(크롬 `#191a1b` / 에디터 `#121314` / 틸 액센트 `#3994bc` / 활성 막대 `#bfbfbf`).
- [x] **스크롤바**: 10px, 투명 track + 반투명 thumb.
- [x] **모션**: hover/transition 80–120ms로 최소화.

### 이번 작업에서 보정한 갭

- [x] 패널 탭 `DEBUG CONSOLE`이 좁은 폭에서 두 줄로 줄바꿈되던 문제 → `.panel-tab { white-space: nowrap }`.
- [x] 상태바 좌측 끝 Remote(`><`) 버튼 누락 → `status-bar.tsx`에 추가(`--vscode-statusBarItem-remoteBackground`, Dark 2026에서 틸 `#3994bc`).
- [x] 패널 활성 탭 font-weight 문서값(600)이 실제 VS Code(400, 밑줄만으로 구분)와 불일치 → 400으로 정정.
- [x] 테마 1차 전환: 구형 Dark+(사이드바 `#252526`·파란 상태바 `#007acc`) → Dark Modern(크롬 `#181818`/에디터 `#1f1f1f`/파란 액센트 `#0078d4`).
- [x] **테마 최종 전환: Dark Modern → 공식 2026 기본값 "Dark 2026"** (`ThemeSettingDefaults.COLOR_THEME_DARK = 'Dark 2026'`로 확인). 크롬 `#191a1b`, 에디터 `#121314`(크롬보다 어두움), 보더 `#2a2b2c`, 틸 액센트 `#3994bc`(탭 보더·포커스·뱃지·원격버튼), 버튼 `#297aa0`, 액티비티바 활성 막대 `#bfbfbf`(연회색), 텍스트 `#bfbfbf`/`#8c8c8c`, 구문강조 GitHub Dark 계열.
- [x] **정정**: 앞서 "`#191a1b`를 쓰는 내장 테마 없음"이라 답했으나 오류였음 — **Dark 2026이 크롬 배경으로 `#191a1b`를 사용**한다(당시 2026 테마 파일을 검색에서 누락).

### 의도적 비대상 (디자인 결정)

- [ ] **Minimap** — 사용하지 않음. 에디터 우측에 미니맵 컬럼/캔버스를 두지 않으며, 이는 버그가 아닌 설계상 제외다.

### 후속 정밀도 항목

- [x] 파일 타입 컬러 아이콘 — 확장자별 색상 포함 커스텀 `FileIcon` 컴포넌트로 구현 (`src/shared/ui/icons/FileIcon.tsx`).
- [x] 사이드바 Explorer 하위 collapsible 섹션 — OUTLINE / TIMELINE 추가 (`sidebar.tsx`).
- [x] 브레드크럼 구분자를 `codicon-chevron-right` 아이콘으로 교체 (`editor-group.tsx`).
- [ ] 좁은 폭에서 Menu Bar를 햄버거로 접기 (현재는 Command Center 최소폭과 경쟁).

---

## 17. 품질 기준

### 시각적 기준

- 첫 화면에서 VS Code와 유사한 레이아웃으로 인식되어야 한다.
- 배경, 사이드바, 탭, 상태바의 색상 구분이 명확해야 한다.
- 텍스트가 작아도 읽을 수 있어야 한다.
- hover/focus/selected 상태가 모두 구분되어야 한다.

### 기술 기준

- 모든 색상은 CSS 변수로만 사용한다.
- 컴포넌트 내부에 하드코딩 색상 금지.
- layout dimension도 가능하면 토큰화한다.
- 컴포넌트는 controlled/uncontrolled 패턴 중 하나를 명확히 따른다.
- React 사용 시 compound component 패턴을 일부 허용한다.

---

## 18. 추천 CSS 토큰 시작점

```css
:root {
  /* ── Surface ─────────────────────────────── Dark 2026 ── */
  --vscode-window-background: #191a1b;

  --vscode-titlebar-background: #191a1b;
  --vscode-titlebar-foreground: #8c8c8c;
  --vscode-titlebar-border: #2a2b2c;
  --vscode-titlebar-inactiveIconForeground: rgba(255, 255, 255, 0.58);
  --vscode-titlebar-activeIconForeground: #ffffff;
  --vscode-titlebar-closeButton-hoverBackground: #c42b1c;

  --vscode-activitybar-background: #191a1b;
  --vscode-activitybar-foreground: #bfbfbf;
  --vscode-activitybar-inactiveForeground: #8c8c8c;
  --vscode-activitybar-activeBorder: #bfbfbf;
  --vscode-activitybar-border: #2a2b2c;

  --vscode-sidebar-background: #191a1b;
  --vscode-sidebar-foreground: #bfbfbf;
  --vscode-sidebar-border: #2a2b2c;

  --vscode-sidebarSectionHeader-background: #191a1b;
  --vscode-sidebarSectionHeader-foreground: #bfbfbf;
  --vscode-sidebarSectionHeader-border: #2a2b2c;

  --vscode-editor-background: #121314;
  --vscode-editor-foreground: #bbbebf;
  --vscode-editor-selectionBackground: #264f78;

  --vscode-panel-background: #191a1b;
  --vscode-panel-border: #2a2b2c;
  --vscode-panelTitle-activeForeground: #bfbfbf;
  --vscode-panelTitle-inactiveForeground: #8c8c8c;
  --vscode-panelTitle-activeBorder: #3994bc;
  --vscode-icon-foreground: #8c8c8c;

  --vscode-statusbar-background: #191a1b;
  --vscode-statusbar-foreground: #8c8c8c;
  --vscode-statusbar-border: #2a2b2c;

  /* ── List / Tree ─────────────────────────────────────── */
  --vscode-list-hoverBackground: #ffffff0d;
  --vscode-list-activeSelectionBackground: #3994bc26;
  --vscode-list-activeSelectionForeground: #ededed;
  --vscode-list-inactiveSelectionBackground: #2c2d2e;
  --vscode-list-focusBackground: #3994bc26;

  /* ── Tabs ────────────────────────────────────────────── */
  --vscode-tab-activeBackground: #121314;
  --vscode-tab-activeForeground: #bfbfbf;
  --vscode-tab-inactiveBackground: #191a1b;
  --vscode-tab-inactiveForeground: #8c8c8c;
  --vscode-tab-selectedBackground: #121314;
  --vscode-tab-selectedForeground: #bfbfbfa0;
  --vscode-tab-border: #2a2b2c;
  --vscode-tab-activeBorderTop: #3994bc;
  --vscode-tab-dirtyIndicator: #e8a735;
  --vscode-editorGroupHeader-tabsBackground: #191a1b;
  --vscode-editorGroupHeader-border: #2a2b2c;

  /* ── Menu / Quick Input ──────────────────────────────── */
  --vscode-menu-background: #202122;
  --vscode-menu-foreground: #bfbfbf;
  --vscode-quickInput-background: #252526;
  --vscode-menu-selectionBackground: #3994bc26;
  --vscode-menu-selectionForeground: #ededed;
  --vscode-menu-separatorBackground: #2a2b2c;
  --vscode-menu-border: #2a2b2c;

  /* ── Input / Button ──────────────────────────────────── */
  --vscode-input-background: #191a1b;
  --vscode-input-foreground: #bfbfbf;
  --vscode-input-border: #333536;
  --vscode-input-placeholderForeground: #555555;
  --vscode-button-background: #297aa0;
  --vscode-button-foreground: #ffffff;
  --vscode-button-hoverBackground: #2b7da3;
  --vscode-button-secondaryBackground: #3a3d41;
  --vscode-button-secondaryForeground: #ffffff;
  --vscode-button-secondaryHoverBackground: #45494e;

  /* ── Scrollbar ───────────────────────────────────────── */
  --vscode-scrollbarSlider-background: #83848533;
  --vscode-scrollbarSlider-hoverBackground: #83848566;
  --vscode-scrollbarSlider-activeBackground: #83848599;

  /* ── Focus / Border ──────────────────────────────────── */
  --vscode-focusBorder: #3994bcb3;
  --vscode-widget-border: #2a2b2c;
  --vscode-contrastBorder: transparent;

  /* ── Text ────────────────────────────────────────────── */
  --vscode-foreground: #bfbfbf;
  --vscode-descriptionForeground: #8c8c8c;
  --vscode-disabledForeground: #555555;
  --vscode-errorForeground: #f48771;

  /* ── Notification ────────────────────────────────────── */
  --vscode-notifications-background: #202122;
  --vscode-notifications-foreground: #bfbfbf;
  --vscode-notifications-border: #2a2b2c;
  --vscode-notificationToast-border: #2a2b2c;
  --vscode-notificationsInfoIcon-foreground: #75beff;
  --vscode-notificationsWarningIcon-foreground: #cca700;
  --vscode-notificationsErrorIcon-foreground: #f48771;

  /* ── Editor Gutter ───────────────────────────────────── */
  --vscode-editorLineNumber-foreground: #858889;
  --vscode-editorLineNumber-activeForeground: #bbbebf;
  --vscode-editorGutter-background: #121314;
  --vscode-editorGutter-addedBackground: #2ea043;
  --vscode-editorGutter-modifiedBackground: #1b81a8;
  --vscode-editorGutter-deletedBackground: #f85149;
  --vscode-editorIndentGuide-background: #2a2b2c;
  --vscode-editorIndentGuide-activeBackground: #707070;

  /* ── Editor Syntax (GitHub Dark 계열) ────────────────── */
  --syntax-comment: #8b949e;
  --syntax-keyword: #ff7b72;
  --syntax-string: #a5d6ff;
  --syntax-number: #79c0ff;
  --syntax-function: #d2a8ff;
  --syntax-variable: #ffa657;
  --syntax-type: #7ee787;
  --syntax-class: #7ee787;
  --syntax-operator: #c9d1d9;

  /* ── Terminal ────────────────────────────────────────── */
  --terminal-background: #191a1b;
  --terminal-foreground: #bfbfbf;
  --terminal-cursor: #ffffff;
  --terminal-selectionBackground: #ffffff40;
  --terminal-ansiBlue: #569cd6;
  --terminal-ansiCyan: #4ec9b0;

  /* ── Toolbar ─────────────────────────────────────────── */
  --vscode-toolbar-separator: rgba(255, 255, 255, 0.15);

  /* ── Keyboard Labels ─────────────────────────────────── */
  --vscode-keybindingLabel-background: #3c3c3c;
  --vscode-keybindingLabel-border: #555555;
  --vscode-keybindingLabel-foreground: #cccccc;

  /* ── Shadow ──────────────────────────────────────────── */
  --vscode-widget-shadow: rgba(0, 0, 0, 0.36);
  --shadow-dropdown: 0 2px 8px rgba(0, 0, 0, 0.36);
  --shadow-overlay: 0 8px 24px rgba(0, 0, 0, 0.45);
  --shadow-notification: 0 4px 12px rgba(0, 0, 0, 0.40);

  /* ── Z-index ─────────────────────────────────────────── */
  --z-base: 0;
  --z-sidebar: 10;
  --z-panel: 10;
  --z-statusbar: 20;
  --z-titlebar: 30;
  --z-drag-overlay: 50;
  --z-tooltip: 100;
  --z-dropdown: 200;
  --z-context-menu: 300;
  --z-overlay: 400;
  --z-command-palette: 500;
  --z-notification: 600;

  /* ── Dimensions ──────────────────────────────────────── */
  --titlebar-height: 34px;
  --activitybar-width: 48px;
  --activitybar-action-height: 48px;
  --activitybar-icon-size: 24px;
  --sidebar-width: 300px;
  --panel-height: 220px;
  --statusbar-height: 22px;
  --tabbar-height: 35px;
  --tabbar-height-compact: 22px;
  --panel-tabbar-height: 30px;
  --gutter-width: 50px;
  --tooltip-delay: 500ms;

  /* ── Status Bar Item Variants ────────────────────────── */
  --vscode-statusBarItem-remoteBackground: #3994bc;
  --vscode-statusBarItem-remoteForeground: #ffffff;
  --vscode-statusBarItem-warningBackground: #cc6633;
  --vscode-statusBarItem-warningForeground: #ffffff;
  --vscode-statusBarItem-errorBackground: #c72e0f;
  --vscode-statusBarItem-errorForeground: #ffffff;
}
```

---

## 19. 개발 우선순위

### Phase 1: Foundation

- 디자인 토큰 정의
- AppShell 레이아웃 구현 (Panel이 Editor 아래 위치하는 구조 필수)
- Dark theme 적용
- 기본 typography/spacing/radius 적용
- Scrollbar 커스텀 스타일 적용

### Phase 2: Core UI

- Activity Bar
- Side Bar (Section Header 포함)
- Tree View
- Editor Tabs
- Status Bar

### Phase 3: Interaction

- 선택 상태
- hover/focus 상태
- resize split view
- command palette (`Ctrl+Shift+P`)
- quick pick (`Ctrl+P`)
- context menu
- notification toast

### Phase 4: Editor Integration

- Monaco Editor 적용
- syntax theme 연결
- tab dirty state
- file tree와 editor state 연결

### Phase 5: Polish

- Light theme
- keyboard shortcuts 전체 정의
- accessibility audit
- visual regression test
- Storybook 문서화

---

## 20. 완료 기준

이 디자인 시스템은 다음 조건을 만족하면 1차 완료로 본다.

- VS Code와 유사한 레이아웃이 구현되어 있다. (Panel이 Editor 아래에 위치)
- Dark theme 토큰이 전역 CSS 변수로 제공된다.
- 주요 컴포넌트가 토큰 기반으로 스타일링된다.
- Activity Bar, Side Bar (Section Header 포함), Editor Tabs, Panel, Status Bar가 상태별 디자인을 가진다.
- Command Palette와 Quick Pick이 각각 제공된다.
- Context Menu와 Notification Toast가 제공된다.
- Scrollbar가 VS Code 스타일로 커스터마이징된다.
- Storybook 또는 샘플 페이지에서 모든 컴포넌트 상태를 확인할 수 있다.
- Monaco Editor를 붙여도 시각적으로 이질감이 없다.
