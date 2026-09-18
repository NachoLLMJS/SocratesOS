import http from 'node:http'
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const root = process.env.VERCEL ? process.cwd() : path.dirname(fileURLToPath(import.meta.url))
const port = Number(process.env.PORT || 4173)
const mime = {
  '.html':'text/html; charset=utf-8','.js':'text/javascript; charset=utf-8','.css':'text/css; charset=utf-8',
  '.json':'application/json; charset=utf-8','.svg':'image/svg+xml','.png':'image/png','.jpg':'image/jpeg',
  '.jpeg':'image/jpeg','.webp':'image/webp','.avif':'image/avif','.ico':'image/x-icon','.woff2':'font/woff2',
  '.mov':'video/quicktime','.mp4':'video/mp4','.webm':'video/webm','.glb':'model/gltf-binary','.wasm':'application/wasm'
}
function resolveRequest(urlString) {
  const url = new URL(urlString, 'http://localhost')
  let pathname
  try { pathname = decodeURIComponent(url.pathname) } catch { return null }
  if (pathname === '/api/markets') pathname = '/api/markets.json'
  if (pathname === '/api/ticks') pathname = '/api/ticks.json'
  if (pathname === '/api/history') return null
  let candidate = path.resolve(root, `.${pathname}`)
  if (!candidate.startsWith(root)) return null
  if (fs.existsSync(candidate) && fs.statSync(candidate).isDirectory()) candidate = path.join(candidate, 'index.html')
  if (!path.extname(candidate) && fs.existsSync(`${candidate}.json`)) candidate += '.json'
  if (!fs.existsSync(candidate) && !path.extname(pathname)) candidate = path.join(root, 'index.html')
  return fs.existsSync(candidate) && fs.statSync(candidate).isFile() ? candidate : null
}
const handler = (req, res) => {
  const file = resolveRequest(req.url || '/')
  if (!file) { res.writeHead(404, {'content-type':'text/plain; charset=utf-8'}); return res.end('Not found') }
  const stat = fs.statSync(file), type = mime[path.extname(file).toLowerCase()] || 'application/octet-stream'
  const range = req.headers.range, common = {'content-type':type,'accept-ranges':'bytes','cache-control':'no-store','access-control-allow-origin':'*'}
  if (range) {
    const match = /bytes=(\d*)-(\d*)/.exec(range), start = match?.[1] ? Number(match[1]) : 0, end = match?.[2] ? Math.min(Number(match[2]), stat.size - 1) : stat.size - 1
    if (!match || start > end || start >= stat.size) { res.writeHead(416, {...common,'content-range':`bytes */${stat.size}`}); return res.end() }
    res.writeHead(206, {...common,'content-range':`bytes ${start}-${end}/${stat.size}`,'content-length':end-start+1})
    return fs.createReadStream(file,{start,end}).pipe(res)
  }
  res.writeHead(200, {...common,'content-length':stat.size})
  fs.createReadStream(file).pipe(res)
}
export default handler
if (!process.env.VERCEL) http.createServer(handler).listen(port,'0.0.0.0',()=>console.log(`SocratesOS exact mirror ready at http://127.0.0.1:${port}`))
