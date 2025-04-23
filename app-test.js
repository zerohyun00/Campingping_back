// 1. Init Code
console.log('init code');

import http from 'k6/http';
import { check } from 'k6';
import { group, sleep } from 'k6';

export const options = {
  vus: 3,
  stages: [
    { duration: '1m', target: 50 },
    { duration: '2m', target: 100 },
    { duration: '1m', target: 0 }, // 정리
  ],
  // 성능 목표(예시): 95%의 요청이 1초 이내에 완료되도록 설정
  thresholds: {
    http_req_duration: ['p(95)<1000'],
  },
};

// 2. Setup Code
export function setup() {
  console.log('Setup code');
  return {
    baseUrl: 'http://localhost:5000/api',
  };
}

// 3. VU (Virtual User) Code - 캠핑리스트 API만 테스트
export default function (data) {
  // 캠핑리스트 조회 엔드포인트
  const campingUrl = `${data.baseUrl}/campings/lists`;

  const params = {
    headers: {
      'Content-Type': 'application/json',
      // 인증이 필요하다면, 여기에서 수동으로 토큰이나 쿠키를 설정할 수 있습니다.
      // 예) 'Authorization': 'Bearer <your-token>'
    },
  };

  group('get campingList', function () {
    const res = http.get(campingUrl, params);

    check(res, {
      'campingList is 200': (r) => r.status === 200,
    });
  });

  // 사용자 행동을 모방하여 짧은 휴식시간 추가 (옵션)
  sleep(1);
}

// 4. Teardown Code
export function teardown(data) {
  console.log('Tearing down...');
}
