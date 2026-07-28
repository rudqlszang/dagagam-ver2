import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  // 배포 위치에 따라 base 경로가 다르다.
  //   GitHub Pages 프로젝트 사이트 → /dagagam/ 아래
  //   Vercel · 로컬 개발          → 루트(/)
  // Vercel은 빌드 중 VERCEL 환경변수를 자동으로 넣어 준다.
  base:
    process.env.VERCEL || process.env.NODE_ENV !== 'production'
      ? '/'
      : '/dagagam/',
  plugins: [react(), tailwindcss()],
})
