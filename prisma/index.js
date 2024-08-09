// 불필요한 인스턴스 prisma 인스턴스 생성을 막기위한 객체생성작업
// PrismaClient는 자체적으로 여러 요청을 관리하는 기능이 있음
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export default prisma;
