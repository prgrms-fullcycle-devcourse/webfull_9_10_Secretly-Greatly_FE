"use client";

import { useEffect, useState } from "react";

const isMockingMode = process.env.NEXT_PUBLIC_API_MOCKING === "true";

export function MSWProvider({ children }: { children: React.ReactNode }) {
  const [mswReady, setMswReady] = useState(false);

  useEffect(() => {
    const init = async () => {
      // 환경변수가 "true"로 켜져있을 때만 MSW를 활성화합니다.
      if (isMockingMode) {
        const { worker } = await import("./browser");
        await worker.start({
          onUnhandledRequest: "bypass", // 모킹하지 않은 API 요청은 경고 없이 통과시킵니다.
        });
      }
      setMswReady(true);
    };

    if (!mswReady) {
      init();
    }
  }, [mswReady]);

  // MSW가 활성화 모드일 때 초기화 완료 전까지는 렌더링을 지연시킵니다.
  if (!mswReady && isMockingMode) {
    return null; // 로딩 인디케이터나 빈 화면을 반환합니다.
  }

  return <>{children}</>;
}
