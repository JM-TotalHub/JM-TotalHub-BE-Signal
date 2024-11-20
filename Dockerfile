# 베이스 이미지 설정
FROM node:20.14

# 작업 디렉토리 설정
WORKDIR /app

# package.json과 package-lock.json 파일을 먼저 복사
COPY package*.json ./

# 의존성 설치
RUN npm install

# 애플리케이션 소스 코드 복사
COPY . .

# 포트 노출
EXPOSE 7000

# 애플리케이션 실행
# CMD ["sh", "-c", "npx prisma --version && npx prisma generate && npx prisma migrate deploy && npm start"]

# 마이 그레이션 제외하고 클라이언트 생성만 
CMD ["sh", "-c", "npx prisma --version && npx prisma generate && npm start"] 

# CMD ["sh", "-c", "npx prisma --version && npx prisma migrate deploy && npm start"]
