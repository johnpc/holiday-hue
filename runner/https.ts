import { request as httpsRequest } from 'node:https';

export interface JsonRequest {
  method: 'GET' | 'PUT';
  url: string;
  headers: Record<string, string>;
  body?: string;
}

/** Minimal JSON-over-HTTPS transport the Hue client is injected with. */
export type JsonTransport = (req: JsonRequest) => Promise<string>;

/**
 * Node https transport for the Hue bridge. The bridge presents a certificate
 * signed by Signify's private root CA (not in Node's trust store), so TLS
 * verification is disabled ONLY for this transport — it is pinned to a LAN IP
 * and the bridge authenticates us via the `hue-application-key` header.
 */
export const nodeTransport: JsonTransport = (req) =>
  new Promise((resolve, reject) => {
    const r = httpsRequest(
      req.url,
      { method: req.method, headers: req.headers, rejectUnauthorized: false, timeout: 5000 },
      (res) => {
        let data = '';
        res.setEncoding('utf8');
        res.on('data', (chunk: string) => (data += chunk));
        res.on('end', () => {
          const status = res.statusCode ?? 0;
          if (status >= 200 && status < 300) resolve(data);
          else
            reject(new Error(`hue: HTTP ${status} ${req.method} ${req.url} ${data.slice(0, 200)}`));
        });
      },
    );
    r.on('timeout', () => r.destroy(new Error(`hue: timeout ${req.method} ${req.url}`)));
    r.on('error', reject);
    if (req.body) r.write(req.body);
    r.end();
  });
