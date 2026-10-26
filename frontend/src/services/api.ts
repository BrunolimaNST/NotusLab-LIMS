import axios from 'axios';

export const api = axios.create({
  baseURL: 'http://localhost:3333/api/v1',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

export default api;
