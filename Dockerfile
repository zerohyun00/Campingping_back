# Node.js Alpine 베이스 이미지 사용
FROM node:22-alpine

# 종속성 설치를 위한 필수 패키지 추가
RUN apk add --no-cache python3 make g++

# 작업 디렉토리 설정
WORKDIR /app

# NestJS CLI 글로벌 설치
RUN npm install -g @nestjs/cli

# 종속성 복사 및 설치
COPY package*.json ./
RUN npm install

# NestJS 프로젝트 복사
COPY . .

# NestJS 빌드
RUN npm run build

# 앱 실행
CMD ["npm", "run", "start:prod"]
