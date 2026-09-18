import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const root = path.dirname(fileURLToPath(import.meta.url))
const out = path.join(root, 'dist')
const entries = ['_next', 'api', 'assets', 'img', 'trade', 'favicon.ico', 'index.html', 'manifest.json', 'root.headers', 'socrates-runtime.js']

fs.rmSync(out, { recursive: true, force: true })
fs.mkdirSync(out, { recursive: true })
for (const entry of entries) {
  const source = path.join(root, entry)
  if (!fs.existsSync(source)) throw new Error(`Missing static build entry: ${entry}`)
  fs.cpSync(source, path.join(out, entry), { recursive: true })
}
console.log(`Built static deployment in ${out}`)
