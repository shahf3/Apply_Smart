// api/[...path].js  (CommonJS; works on Vercel Node runtime)
const { Buffer } = require('buffer');

// If you ever need to increase function timeout or memory, you can use vercel.json (shown below).

module.exports = async (req, res) => {
  try {
    // Basic CORS preflight support (usually not needed since it’s same-origin on Vercel)
    if (req.method === 'OPTIONS') {
      res.setHeader('Access-Control-Allow-Origin', '*');
      res.setHeader('Access-Control-Allow-Methods', 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS');
      res.setHeader(
        'Access-Control-Allow-Headers',
        req.headers['access-control-request-headers'] || 'Content-Type, Authorization'
      );
      return res.status(204).end();
    }

    const EB = (process.env.EB_URL || '').replace(/\/$/, ''); // e.g. https://applysmart.eu-north-1.elasticbeanstalk.com
    if (!EB) {
      res.status(500).json({ error: 'Missing EB_URL env var on Vercel' });
      return;
    }

    // Strip the /api prefix from the incoming path
    const upstreamPath = req.url.replace(/^\/api/, '');
    const url = EB + upstreamPath;

    // Forward headers but drop hop-by-hop headers that can break proxying
    const headers = { ...req.headers };
    delete headers.host;
    delete headers['content-length'];
    delete headers['accept-encoding'];

    // For non-GET/HEAD, stream the original request body to EB
    const init = {
      method: req.method,
      headers,
    };

    if (req.method !== 'GET' && req.method !== 'HEAD') {
      // Node 18 fetch supports stream bodies; duplex hint helps
      init.body = req;
      init.duplex = 'half';
    }

    const resp = await fetch(url, init);

    // Copy response headers (avoid hop-by-hop/transfer-encoding)
    for (const [k, v] of resp.headers) {
      if (k.toLowerCase() !== 'transfer-encoding') {
        res.setHeader(k, v);
      }
    }

    const ab = await resp.arrayBuffer();
    res.status(resp.status).send(Buffer.from(ab));
  } catch (err) {
    console.error('Proxy error:', err);
    res.status(502).json({ error: 'Bad gateway via proxy', detail: String(err) });
  }
};
