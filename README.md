# React + TypeScript + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Babel](https://babeljs.io/) (or [oxc](https://oxc.rs) when used in [rolldown-vite](https://vite.dev/guide/rolldown)) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the ESLint configuration

If you are developing a production application, we recommend updating the configuration to enable type-aware lint rules:

```js
export default defineConfig([
  # 여행 일정 추천 (성향 기반 테스트)

  React + TypeScript + Vite + Tailwind CSS로 만든 데모 SPA입니다.

  - 로그인/회원가입(데모) 후 테스트 진행
  - 질문을 “피드처럼 아래로 쌓는” 진행 UI
  - 완료 후 페르소나 기반 일정표(Day1~DayN) 결과
  - 일정 아이템 즐겨찾기(하트) + 즐겨찾기/히스토리 페이지
  - 추후 백엔드 연동 대비: OAuth 시작/콜백 라우트 및 persona 분석 API 연결 구조 포함

  ## 실행

  ```bash
  npm install
  npm run dev
  ```

  - Dev 서버: http://localhost:5173

  ### 빌드

  ```bash
  npm run build
  ```

  ### 린트

  ```bash
  npm run lint
  ```

  Windows에서 `npm run lint`가 환경에 따라 실행이 꼬일 경우 `npm.cmd run lint`로 실행해도 됩니다.

  ## 라우팅

  - `/login`: 로그인/회원가입
  - `/planner`: 질문 피드(테스트 진행)
  - `/result`: 일정표 결과
  - `/favorites`: 즐겨찾기/히스토리
  - `/auth/:provider`: 소셜 로그인 시작(google/facebook)
  - `/auth/callback`: 소셜 로그인 콜백 처리

  ## 환경변수(선택)

  백엔드가 붙기 전까지는 없어도 동작합니다. (없으면 로컬 분석/데모 플로우로 동작)

  - `VITE_AUTH_API_URL`: OAuth code 교환 등을 처리할 백엔드 주소
  - `VITE_PERSONA_API_URL`: 답변을 기반으로 페르소나/일정 결과를 반환하는 백엔드 주소

  예시는 `.env.example` 참고.

  ## 저장소(브라우저 스토리지) 사용

  리팩터링 후 페이지는 직접 `sessionStorage/localStorage`에 접근하지 않고 `src/storage/*`를 통해 접근합니다.

  - `sessionStorage`: 인증 상태, 현재 결과(persona/answers), 즐겨찾기
  - `localStorage`: 회원가입 유저 목록(데모), 결과 히스토리 누적

  ## 코드 구조(요약)

  - `src/pages/*`: 라우트 페이지(로그인/플래너/결과/즐겨찾기/OAuth)
  - `src/components/*`: 공통 UI(PageShell/Card/Spinner/ToggleTabs/HeartButton/ProgressBar)
  - `src/storage/*`: 키/JSON read-write + auth/users/persona/favorites/history 저장 로직
  - `src/services/*`: persona 분석 및 OAuth 연동을 위한 서비스 레이어
  - `src/questions.ts`: 질문 상수
