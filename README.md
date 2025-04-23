<a href="http://kdt-react-node-1-team02.elicecoding.com/" target="_blank">
<img src="README.asset/campingping_logo.png" alt="배너" width="100%"/>
</a>

<br/>
<br/>

# 0. Getting Started (시작하기)

```bash
$ npm run start
```

[서비스 링크](https://kdt-react-node-1-team03.elicecoding.com/)

<br/>
<br/>

# 1. Project Overview (프로젝트 개요)

- 프로젝트 이름: 캠핑핑
- 프로젝트 설명: 캠핑을 즐기는 사람들에게 최적의 캠핑장 정보를 제공하고, 위치 기반으로 사람들과 연결할 수 있는 커뮤니티 서비스
  <br/>
  <br/>

# 2. Team Members (팀원 및 팀 소개)

|                          김영현                           |                           백기준                           |                                 김지연                                  |                           최준영                           |
| :-------------------------------------------------------: | :--------------------------------------------------------: | :---------------------------------------------------------------------: | :--------------------------------------------------------: |
| <img src="README.asset/kim.png" alt="김영현" width="150"> | <img src="README.asset/back.png" alt="백기준" width="150"> | <img src="README.asset/yeon.png" alt="김지연" width="150" height="140"> | <img src="README.asset/choi.png" alt="최준영" width="150"> |
|                            BE                             |                             BE                             |                                   FE                                    |                             FE                             |
|          [GitHub](https://github.com/zerohyun00)          |            [GitHub](https://github.com/KK10024)            |                  [GitHub](https://github.com/yeonn-k)                   |     [GitHub](https://kdt-gitlab.elice.io/junyoungchoi)     |

<br/>
<br/>

# 3. Key feature (주요 기능)

### 1. 위치 기반 캠핑장 정보 필터링 기능

- 사용자의 위치에 맞는 캠핑장 정보를 카테고리 , 지역별로 필터링 해서 제공합니다.
- 필터링 할 수 있는 항목 에는 다음과 같은 정보가 포함됩니다:
  - **지역별**: 서울특별시 , 경기도, 부산광역시 등 지역별로 필터링 가능
  - **일반야영장**
  - **자동차야영장**
  - **카라반**
  - **글램핑**
  - **캠프닉**
  - **산**
  - **숲**
  - **계곡**
  - **바다**
  - **해변**
  - **섬**
  - **강**
  - **호수**
  - **도시**
  - **반려동물**

### 2. 위치 기반 커뮤니티 기능

- 사용자의 반경 1.5km 이내에 다른 사용자가 올린 게시물을 볼 수 있고, 소통할 수 있습니다.
  - **게시물 CRUD**: 서버에서 가져온 팀원 목록에서 필요한 팀원을 선택하여 일정에 추가할 수 있습니다.
  - **댓글 CRUD**: 일정에 배정된 팀원 목록에서 팀원을 제거할 수 있습니다.

### 3. 위치 기반 채팅 기능

- 유저가 올린 게시글에 상대 유저의 닉네임을 클릭하면 1:1 채팅을 할 수 있습니다.
  - **채팅**: 상대 유저와 실시간 웹소켓으로 1:1 채팅을 할 수 있습니다.
  - **대화 내용 저장**: 높음, 중간, 낮음으로 우선순위를 설정하여 일정의 중요도를 명확히 할 수 있습니다.
  - **읽음 , 안읽음 확인**: 상대방 유저가 메시지를 읽으면 표시를 해줍니다.

### 4. 회원 관리 기능

- **회원가입**: 사용자가 이메일 인증을 통해 회원가입을 하면 데이터베이스에 유저 정보가 저장되어 관리됩니다.
- **로그인**: 등록된 사용자 정보로 로그인하여 시스템에 접근할 수 있고, 카카오 소셜 로그인을 통해 더 편하게 서비스를 이용할 수 있습니다.

<br/>
<br/>

# 4. 화면 구성 📺

|                      로그인 페이지                      |                     회원가입 페이지                      |                  리스트 페이지                  |
| :-----------------------------------------------------: | :------------------------------------------------------: | :---------------------------------------------: |
|    <img width="200px" src="README.asset/login.jpg">     |    <img width="200px" src="README.asset/signUp.jpg">     | <img width="150px" src="README.asset/list.jpg"> |
|                   리스트 상세 페이지                    |                    지역 필터링 페이지                    |                   지도 페이지                   |
| <img width="150px" src="README.asset/list_detail.jpg">  |    <img width="150px" src="README.asset/region.jpg">     | <img width="150px" src="README.asset/map.jpg">  |
|               커뮤니티 페이지 (내 게시물)               |              커뮤니티 페이지 (전체 게시물)               |                   채팅 페이지                   |
| <img width="150px" src="README.asset/community_my.jpg"> | <img width="150px" src="README.asset/community_all.jpg"> | <img width="150px" src="README.asset/chat.jpg"> |

---

# 4. Tasks & Responsibilities (작업 및 역할 분담)

|        |                                                            |                                                                                                                                              |
| ------ | ---------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------- |
| 김영현 | <img src="README.asset/kim.png" alt="김영현" width="100">  | <ul><li>유저 API(JWT, 인증, 인가, 이미지)</li><li>웹소켓 채팅</li><li>커뮤니티 API</li><li>즐겨찾기 API</li><li>CI & CD 구축</li></ul>       |
| 백기준 | <img src="README.asset/back.png" alt="백기준" width="100"> | <ul><li>캠핑 공공 API 관리</li><li>캠핑 API</li><li>캠핑 이미지 API</li><li>커뮤니티 API</li><li>CI & CD 구축</li></ul>                      |
| 김지연 | <img src="README.asset/yeon.png" alt="김지연" width="60">  | <ul><li>로그인, 회원가입 페이지</li><li>검색 페이지</li><li>지도 페이지</li><li>채팅 페이지</li><li>버튼, 인풋, 카드 컴포넌트 제작</li></ul> |
| 최준영 | <img src="README.asset/choi.png" alt="최준영" width="100"> | <ul><li>커뮤니티 페이지</li><li>날씨 컴포넌트 제작</li></ul>                                                                                 |

<br/>
<br/>

# 5. Technology Stack (기술 스택)

## 5.1 Frontend

| 기술 스택       | 설명                                                                           | 로고                                                                                                                        |
| --------------- | ------------------------------------------------------------------------------ | --------------------------------------------------------------------------------------------------------------------------- |
| **Next.js**     | React 기반의 서버 사이드 렌더링 및 정적 웹사이트 생성을 위한 프레임워크입니다. | ![Next.js Badge](https://img.shields.io/badge/Next.js-000000?style=for-the-badge&logo=nextdotjs&logoColor=white)            |
| **TailwindCSS** | 빠르고 유연한 스타일링을 위한 유틸리티 중심의 CSS 프레임워크입니다.            | ![TailwindCSS Badge](https://img.shields.io/badge/TailwindCSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white) |
| **TypeScript**  | JavaScript에 정적 타입을 추가하여 코드의 안정성을 높이는 언어입니다.           | ![TypeScript Badge](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)     |
| **Zustand**     | 전역 상태 관리를 위한 간단하고 빠른 상태 관리 라이브러리입니다.                | ![Zustand Badge](https://img.shields.io/badge/Zustand-000000?style=for-the-badge&logo=zustand&logoColor=white)              |
| **Docker**      | 애플리케이션을 컨테이너로 패키징, 배포, 실행하기 위한 도구입니다.              | ![Docker Badge](https://img.shields.io/badge/Docker-2496ED?style=for-the-badge&logo=docker&logoColor=white)                 |

<br/>

## 5.2 Backend

| 기술 스택          | 설명                                                                                 | 로고                                                                                                                                 |
| ------------------ | ------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------ |
| **Nest.js**        | 효율적이고 확장 가능하며 잘 구조화된 서버 애플리케이션 개발을 위한 프레임워크입니다. | ![Nest.js Badge](https://img.shields.io/badge/Nest.js-E0234E?style=for-the-badge&logo=nestjs&logoColor=white)                        |
| **PostgreSQL**     | 안정적이고 확장 가능하며 관계형 데이터 저장을 지원하는 데이터베이스입니다.           | ![PostgreSQL Badge](https://img.shields.io/badge/PostgreSQL-4169E1?style=for-the-badge&logo=postgresql&logoColor=white)              |
| **TypeScript**     | JavaScript에 정적 타입을 추가하여 코드의 안정성을 높이는 언어입니다.                 | ![TypeScript Badge](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)              |
| **AWS S3**         | 확장 가능하고 안전한 객체 저장을 제공하는 클라우드 스토리지 서비스입니다.            | ![AWS S3 Badge](https://img.shields.io/badge/AWS%20S3-569A31?style=for-the-badge&logo=amazon-aws&logoColor=white)                    |
| **GitHub Actions** | 지속적인 통합 및 배포 워크플로를 자동화하기 위한 도구입니다.                         | ![GitHub Actions Badge](https://img.shields.io/badge/GitHub%20Actions-2088FF?style=for-the-badge&logo=githubactions&logoColor=white) |
| **Docker**         | 애플리케이션을 컨테이너로 패키징, 배포, 실행하기 위한 도구입니다.                    | ![Docker Badge](https://img.shields.io/badge/Docker-2496ED?style=for-the-badge&logo=docker&logoColor=white)                          |

<br/>

## 5.3 Cooperation

| 도구    | 로고                                                                                                         |
| ------- | ------------------------------------------------------------------------------------------------------------ |
| Git     | <img src="https://git-scm.com/images/logos/downloads/Git-Icon-1788C.png" alt="Git" width="100">              |
| GitLab  | <img src="https://upload.wikimedia.org/wikipedia/commons/e/e1/GitLab_logo.svg" alt="GitLab" width="100">     |
| Notion  | <img src="https://upload.wikimedia.org/wikipedia/commons/4/45/Notion_app_logo.png" alt="Notion" width="100"> |
| Discord | <img src="https://upload.wikimedia.org/wikipedia/en/9/98/Discord_logo.svg" alt="Discord" width="100">        |

<br/>

# 6. Project Structure (프로젝트 구조, 백엔드)

```plaintext
BACK/
├── .github/workflows/     # GitHub Actions 워크플로 파일
├── dist/                  # 빌드된 파일
├── node_modules/          # 설치된 npm 모듈
├── README.asset           # README에 사용된 에셋 파일
├── src/
│   ├── auth/              # 인증 관련 모듈
│   ├── camping/           # 캠핑 관련 모듈
│   ├── chat/              # 채팅 관련 모듈
│   ├── comment/           # 댓글 관련 모듈
│   ├── common/            # 공통 모듈
│   ├── community/         # 커뮤니티 관련 모듈
│   ├── config/            # 환경 설정 파일
│   ├── database/          # 데이터베이스 설정 및 연결
│   ├── favorite/          # 즐겨찾기 관련 모듈
│   ├── image/             # 이미지 처리 관련 모듈
│   ├── migrations/        # 데이터베이스 마이그레이션 파일
│   ├── review/            # 리뷰 관련 모듈
│   ├── user/              # 사용자 관련 모듈
│   ├── app.controller.ts  # 메인 애플리케이션 컨트롤러
│   ├── app.module.ts      # 메인 애플리케이션 모듈
│   ├── app.service.ts     # 메인 애플리케이션 서비스
│   └── main.ts            # 애플리케이션 진입 파일
├── test/                  # 테스트 관련 파일
├── .env                   # 환경 변수 파일
├── .eslintrc.js           # ESLint 설정 파일
├── .gitignore             # Git에서 무시할 파일 및 폴더 목록
├── .prettierrc            # Prettier 설정 파일
├── docker-compose.yml     # Docker Compose 설정 파일
├── Dockerfile             # Docker 설정 파일
├── nest-cli.json          # NestJS CLI 설정 파일
├── package-lock.json      # 정확한 종속성 버전 기록 파일
├── package.json           # 프로젝트 종속성 및 스크립트 정의
├── README.md              # 프로젝트 개요 및 사용법
├── tsconfig.build.json    # 빌드 시 TypeScript 설정 파일
└── tsconfig.json          # TypeScript 설정 파일

```

<br/>
<br/>

## 명명 규칙

- 변수 & 함수 : 카멜케이스

<br/>

# 7. 커밋 컨벤션

## 기본 구조

```
type : subject
```

<br/>

## type 종류

```
feat : 새로운 기능 추가
fix : 버그 수정
docs : 문서 수정
style : 코드 포맷팅, 세미콜론 누락, 코드 변경이 없는 경우
refactor : 코드 리펙토링
test : 테스트 코드, 리펙토링 테스트 코드 추가
chore : 빌드 업무 수정, 패키지 매니저 수정
```

<br/>

<br/>

## 커밋 예시

```
== ex1
feat: "회원 가입 기능 구현"

== ex2
fix: "DB연결 에러 해결"
```

<br/>

## 🛠 시연 영상

[시연 영상 ](https://youtu.be/dC5v-PPcN1Q)
<br/>
<br/>
