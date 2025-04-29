import http from 'k6/http';
import { check, group, sleep } from 'k6';

export const options = {
  stages: [
    { duration: '30s', target: 50 }, // 0초 → 30초 동안 50명까지 증가
    { duration: '1m', target: 300 }, // 30초 → 1분 동안 300명까지 증가
    { duration: '1m', target: 1000 }, // 1분 → 2분 동안 1000명까지 증가
    { duration: '30s', target: 0 }, // 2분 → 2분 30초 동안 천천히 감소
  ],
  thresholds: {
    http_req_duration: ['p(95)<1000'], // 95% 요청이 1초 이내
    http_req_failed: ['rate<0.01'], // 실패율 1% 미만
  },
};

export function setup() {
  return { baseUrl: 'http://localhost:5000/api' };
}

export default function (data) {
  const res = http.get(`${data.baseUrl}/campings/lists`, {
    headers: { 'Content-Type': 'application/json' },
  });

  group('get campingList', () => {
    check(res, { 'status is 200': (r) => r.status === 200 });
  });

  sleep(1);
}

export function teardown(data) {
  console.log('Tearing down...');
}
