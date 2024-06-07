# CloudFlare CORS Proxy
Cloudflare CORS proxy in a worker.

> [WARNING]: This is not a public proxy, please host on your own servers!

This project is written for [CloudFlare Workers](https://workers.cloudflare.com/), and can be easily deployed with [Wrangler CLI](https://developers.cloudflare.com/workers).


```bash
wrangler publish
```

## Usage Example

```javascript
fetch(`https://{your-name}.workers.dev/?${encodeURIComponent('https://httpbin.org/anything')}`, {
  method: 'post',
  headers: {
    Authorization: 'Bearer Foo'
  }
}).then(res => {
  console.log(res.headers)
  return res.json()
}).then(console.log)
```
