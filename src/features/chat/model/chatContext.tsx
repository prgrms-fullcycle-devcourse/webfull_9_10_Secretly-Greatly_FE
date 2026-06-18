"use client";

import { createContext, useContext, type ReactNode } from "react";
import { useChatSocket, type UseChatSocketResult } from "./useChatSocket";

/**
 * 채팅 소켓을 앱 루트에서 한 번만 연결해 공유하기 위한 컨텍스트.
 *
 * ChatPanel 이 마운트될 때 소켓을 붙이면 패널을 닫거나 다른 탭으로 바꿀 때
 * 연결이 끊긴다. 이를 막기 위해 Provider를 ideShell(항상 마운트)에 두어
 * 로그인 즉시 소켓을 붙이고, 패널 상태와 무관하게 메시지를 누적한다.
 */
const chatContext = createContext<UseChatSocketResult | null>(null);

export function ChatProvider({ children }: { children: ReactNode }) {
  const chat = useChatSocket();
  return <chatContext.Provider value={chat}>{children}</chatContext.Provider>;
}

/** ChatProvider 하위에서 공유 소켓 상태를 읽는다. */
export function useChatContext(): UseChatSocketResult {
  const ctx = useContext(chatContext);
  if (!ctx) {
    throw new Error(
      "useChatContext 는 ChatProvider 안에서만 사용할 수 있습니다.",
    );
  }
  return ctx;
}
