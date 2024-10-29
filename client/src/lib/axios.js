import axios from 'axios';

export const axiosInstance = axios.create({
  baseURL: 'http://localhost:5000/api', // 모든 요청의 기본 경로 설정 (API 서버 주소)
  withCredentials: true,
  // 요청에 쿠키 및 자격 증명(credentials)을 포함합니다.
  // CORS 환경에서 인증 관련 데이터를 포함해 서버로 전송할 때 필요합니다.
  // 서버는 응답 헤더에 Access-Control-Allow-Credentials: true를 설정해야 합니다.
});
