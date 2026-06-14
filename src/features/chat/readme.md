# Chat

전체 채팅(단일 방) 실시간 통신을 담당하는 피처 슬라이스입니다.
WebSocket(Socket.IO) 실시간 송수신 + REST 히스토리/신고 + 위장 UI를 한곳에 모읍니다.

BE 는 채팅방을 종목 코드로 식별하므로, "전체 채팅"도 내부적으론 고정 방 코드
`GLOBAL_CHAT_ROOM`(기본 `005930`, `NEXT_PUBLIC_GLOBAL_CHAT_TICKER` 로 변경) 하나로
동작합니다.

## 구조

```text
chat/
├── api/                      # REST
│   ├── getChatMessages.ts    # GET  /api/chats/stocks/:ticker  (히스토리, 공개)
│   └── reportChat.ts         # PATCH /api/chats/:chatId/report  (신고, JWT)
├── model/
│   ├── constants.ts          # GLOBAL_CHAT_ROOM, 소켓 이벤트명, 쿨타임(3s) 등
│   ├── types.ts              # 메시지/응답/상태 타입
│   ├── socketClient.ts       # 토큰 실은 Socket.IO 연결 팩토리
│   └── useChatSocket.ts      # 연결·입장·수신·히스토리·전송·신고 통합 훅
├── ui/
│   └── chatPanel.tsx         # 채팅 패널 UI (VS Code Claude Code 패널 위장)
└── index.ts                  # Public API
```

UI 단일 본체는 `ui/chatPanel.tsx`이고, 위젯 `widgets/agentPanel` 은 이 `ChatPanel`을
렌더하는 얇은 래퍼입니다. UI 를 고칠 땐 `ui/chatPanel.tsx` 를 수정하세요.

## 통신 흐름

1. **연결** — 저장된 액세스 토큰(`@/shared/api`)을 `handshake.auth.token` 으로 연결.
2. **입장** — `join_room { ticker }` → `joined_room` 시 시스템 라인 + REST 히스토리 병합.
3. **수신** — `receive_message` 누적(같은 `chatId` 중복 제거).
4. **전송** — `send_message { ticker, message }`. BE 3초 쿨타임을 클라에서도 미러링.
5. **신고** — `reportChat(chatId)`; 누적 5회 이상이면 자동 블라인드.

## FSD 메모

`features/chat` 은 `features/auth` 를 직접 참조하지 않고, 인증 정보는
`@/shared/api`(`getStoredSession`/`getStoredToken`)에서만 읽습니다.
