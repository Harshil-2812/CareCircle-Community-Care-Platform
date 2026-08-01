// Quick end-to-end test: login as admin, then hit the analytics endpoint
const http = require('http');

function post(path, body) {
  return new Promise((resolve, reject) => {
    const data = JSON.stringify(body);
    const req = http.request({ hostname: 'localhost', port: 5000, path, method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(data) }
    }, res => {
      let raw = '';
      res.on('data', c => raw += c);
      res.on('end', () => resolve({ status: res.statusCode, body: JSON.parse(raw) }));
    });
    req.on('error', reject);
    req.write(data);
    req.end();
  });
}

function get(path, token) {
  return new Promise((resolve, reject) => {
    const req = http.request({ hostname: 'localhost', port: 5000, path, method: 'GET',
      headers: { Authorization: `Bearer ${token}` }
    }, res => {
      let raw = '';
      res.on('data', c => raw += c);
      res.on('end', () => resolve({ status: res.statusCode, body: JSON.parse(raw) }));
    });
    req.on('error', reject);
    req.end();
  });
}

async function main() {
  // Login as admin
  const loginRes = await post('/api/auth/login', { email: 'arjun@email.com', password: 'Password@123' });
  if (loginRes.status !== 200) {
    console.log('Login failed:', loginRes.body);
    return;
  }
  const token = loginRes.body.data.token || loginRes.body.token;
  console.log('Logged in as:', loginRes.body.data?.user?.full_name || loginRes.body.data?.full_name);

  // Hit the analytics endpoint
  const analytics = await get('/api/users/analytics/top-volunteers', token);
  console.log('Analytics status:', analytics.status);
  console.log('Analytics data:', JSON.stringify(analytics.body, null, 2));
}

main().catch(console.error);
