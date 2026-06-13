import http from 'k6/http';
import { sleep, check } from 'k6';

export const options = {
  vus: 50,       
  duration: '1m' 
};

export default function () {
  // Tembak langsung ke rute utama (root)
  const res = http.get('http://localhost:5000/'); 
  
  check(res, {
    'status adalah 200': (r) => r.status === 200,
  });
  
  sleep(1); 
}