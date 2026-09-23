const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = Number(process.env.PORT || 3000);
const INDEX = fs.readFileSync(path.join(__dirname, 'index.html'));

const proxyMap = {
  '/api/kp': 'https://services.swpc.noaa.gov/json/planetary_k_index_1m.json',
  '/api/speed': 'https://services.swpc.noaa.gov/products/summary/solar-wind-speed.json',
  '/api/mag': 'https://services.swpc.noaa.gov/products/summary/solar-wind-mag-field.json'
};

const server = http.createServer(async (req, res) => {
  try {
    const url = new URL(req.url, `http://${req.headers.host || 'localhost'}`);

    if (url.pathname === '/health') {
      res.writeHead(200, { 'Content-Type': 'text/plain; charset=utf-8' });
      return res.end('ok');
    }

    if (proxyMap[url.pathname]) {
      const upstream = await fetch(proxyMap[url.pathname], { cache: 'no-store' });
      const body = await upstream.text();
      res.writeHead(upstream.status, {
        'Content-Type': 'application/json; charset=utf-8',
        'Cache-Control': 'no-store',
        'Access-Control-Allow-Origin': '*'
      });
      return res.end(body);
    }

    res.writeHead(200, {
      'Content-Type': 'text/html; charset=utf-8',
      'Cache-Control': 'no-store'
    });
    res.end(INDEX);
  } catch (error) {
    console.error(error);
    res.writeHead(500, { 'Content-Type': 'text/plain; charset=utf-8' });
    res.end('server error');
  }
});

server.listen(PORT, '0.0.0.0', () => {
  console.log(`CHAKRAIN server listening on ${PORT}`);
});
