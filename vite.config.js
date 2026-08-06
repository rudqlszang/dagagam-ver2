import { existsSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

/**
 * 개발 서버에서 /api/* 를 실행해 주는 플러그인.
 *
 * 배포(Vercel)에서는 api/ 폴더가 자동으로 서버리스 함수가 되지만,
 * `npm run dev` 에서는 아무도 처리해 주지 않아 404가 난다.
 * 그러면 앱이 "API 없음 = 무료 모드"로 판단해 버려서, 키를 넣어 두고도
 * 로컬에서 확인할 수 없다. 그 간극만 메워 주는 얇은 어댑터다.
 *
 * 정적 호스팅(GitHub Pages)에는 api/ 가 배포되지 않는다. 그래도 앱은
 * 브라우저 음성 + 로컬 스크립트로 끝까지 동작한다.
 */
function devApiRoutes() {
  const apiDir = new URL('./api/', import.meta.url)

  return {
    name: 'dagagam-dev-api',
    apply: 'serve',
    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        if (!req.url?.startsWith('/api/')) return next()

        const name = req.url.split('?')[0].slice('/api/'.length)
        if (!/^[a-z0-9-]+$/i.test(name)) return next()

        const file = new URL(`${name}.js`, apiDir)
        if (!existsSync(fileURLToPath(file))) return next()

        // Vercel 핸들러가 기대하는 최소한의 형태를 만들어 준다
        res.status = (code) => {
          res.statusCode = code
          return res
        }
        res.json = (obj) => {
          res.setHeader('content-type', 'application/json')
          res.end(JSON.stringify(obj))
        }
        res.send = (data) => res.end(data)

        try {
          if (req.method === 'POST') {
            const chunks = []
            for await (const chunk of req) chunks.push(chunk)
            const raw = Buffer.concat(chunks).toString('utf8')
            req.body = raw ? JSON.parse(raw) : {}
          }
          const mod = await import(`${file.href}?t=${Date.now()}`)
          await mod.default(req, res)
        } catch (err) {
          server.config.logger.error(`[dev-api] ${name}: ${err?.message ?? err}`)
          if (!res.writableEnded) res.status(500).json({ error: 'dev_api_failed' })
        }
      })
    },
  }
}

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  // .env 의 서버 키를 개발용 API 핸들러가 읽을 수 있게 옮겨 준다.
  // VITE_ 접두사가 없으므로 클라이언트 번들에는 들어가지 않는다.
  Object.assign(process.env, loadEnv(mode, process.cwd(), ''))

  return {
    // 배포 위치에 따라 base 경로가 다르다.
    //   GitHub Pages 프로젝트 사이트 → /dagagam-ver2/ 아래 (저장소 이름과 같아야 한다)
    //   Vercel · 로컬 개발          → 루트(/)
    // Vercel은 빌드 중 VERCEL 환경변수를 자동으로 넣어 준다.
    base:
      process.env.VERCEL || mode !== 'production' ? '/' : '/dagagam-ver2/',
    plugins: [react(), tailwindcss(), devApiRoutes()],
  }
})
