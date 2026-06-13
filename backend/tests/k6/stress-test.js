import http from 'k6/http';
import { sleep, check } from 'k6';

export const options = {
  stages: [
    { duration: '30s', target: 200 }, // Naik perlahan ke 200 user dalam 30 detik
    { duration: '30s', target: 200 }, // Tahan di 200 user selama 30 detik
    { duration: '30s', target: 0 },   // Turun perlahan ke 0 user
  ],
};

export default function () {
  // Tetap menembak rute root (/)
  const res = http.get('http://localhost:5000/'); 
  
  check(res, {
    'status adalah 200': (r) => r.status === 200,
  });
  
  sleep(1);
}