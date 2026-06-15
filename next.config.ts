import type { NextConfig } from "next";

/**
 * 백엔드 오리진(서버사이드 전용).
 *
 * 브라우저는 항상 same-origin(HTTPS) "/api" 로 요청하고, Next.js 서버가
 * 이 오리진으로 프록시한다. 덕분에 HTTPS 페이지에서 HTTP 백엔드를 직접
 * 호출하면서 발생하던 Mixed Content 차단이 사라진다.
 *
 * 실제 백엔드 주소는 소스에 박지 않고 환경변수로만 주입한다.
 * - 로컬 개발:   .env.local 의 BACKEND_ORIGIN (gitignore 대상)
 * - Vercel(운영): 대시보드 환경변수 BACKEND_ORIGIN
 * 미설정 시 로컬 백엔드(localhost:3000)로 폴백한다.
 *
 * NEXT_PUBLIC_ 접두사가 없으므로 클라이언트 번들에 노출되지 않는다.
 */
const BACKEND_ORIGIN = process.env.BACKEND_ORIGIN ?? "http://localhost:3000";

const nextConfig: NextConfig = {
  async rewrites() {
    return [
      {
        source: "/api/:path*",
        destination: `${BACKEND_ORIGIN}/api/:path*`,
      },
    ];
  },
};

export default nextConfig;
