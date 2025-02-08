// 1. Init Code
console.log('init code');

import http from 'k6/http';
import { check } from 'k6';
import { SharedArray } from 'k6/data';
import { group } from 'k6';

export const options = {
  vus: 3,
  stages: [
    {
      duration: '1m',
      target: 10,
    },
    {
      duration: '1m',
      target: 30,
    },
    {
      duration: '1m',
      target: 0,
    },
  ],
};

const data0 = new SharedArray('some name', function () {
  const dataArray = [];

  return dataArray; // must be an array
});

// 2. Setup code
export function setup() {
  console.log('Setup code');
  return {
    url: 'http://localhost:5000/api',
  };
}

// 3. VU(virtual user) code
export default function (data) {
  const url = 'http://localhost:5000/api/login';

  const payload = JSON.stringify({
    email: 'test@gmail.com',
    password: '123456',
  });

  const params = {
    headers: {
      'Content-Type': 'application/json',
    },
  };

  group('post', function () {
    const res = http.post(url, payload, params);

    check(res, {
      'is status 201': (r) => r.status === 201,
    });
  });

  group('get', function () {
    const res = http.get(url);

    check(res, {
      'is status 200': (r) => r.status === 200,
    });
  });
}

// 4. teardown code
export function teardown(data) {
  console.log('Tearing down...');
}
