import axios, { AxiosRequestConfig } from 'axios';

const axiosInstance = axios.create({
  timeout: 10000, // 10초 타임아웃
});

export async function fetchWithRetry(
  url: string,
  config: AxiosRequestConfig,
  retries: number = 3,
): Promise<any> {
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      return await axiosInstance.get(url, config);
    } catch (error) {
      if (attempt === retries) throw error;
      console.warn(`재시도 중... (${attempt}/${retries})`);
    }
  }
}