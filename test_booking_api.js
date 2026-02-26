const fetch = require('node-fetch');
(async () => {
  const data = {
    user_id: 'test_user_123',
    service_ids: [1],
    body_type: 'sedan',
    date: '2026-02-20',
    time: '10:00',
    total_price: 500
  };
  try {
    const res = await fetch('http://109.69.16.132:3001/api/bookings', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    console.log('Status:', res.status);
    console.log('Response:', await res.json());
  } catch (e) {
    console.error('API Error:', e.message);
  }
})();
