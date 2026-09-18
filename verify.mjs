import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const root=path.dirname(fileURLToPath(import.meta.url))
const required=[
  'index.html','trade/index.html',
  'vendor-next/static/immutable/chunks/2ffbhrw1aldfg.css',
  'vendor-next/static/immutable/chunks/25kvgcvbp6c14.js',
  'assets/cdn.jsdelivr.net/gh/MilovanovicMatija/prime@main/assets/index-DM4qWrvI.js',
  'assets/cdn.jsdelivr.net/gh/MilovanovicMatija/prime@main/models/scene.glb',
  'assets/cdn.jsdelivr.net/gh/MilovanovicMatija/prime@main/models/scene-mobile.glb',
  'assets/cdn.jsdelivr.net/gh/MilovanovicMatija/prime@main/models/scene-bnb-flush.glb',
  'assets/cdn.jsdelivr.net/gh/MilovanovicMatija/prime@main/models/scene-mobile-bnb-flush.glb',
  'assets/cdn.prod.website-files.com/6a3e64ff64a92f2281e8e82a/js/webflow.achunk.6131e94a113e2847.js',
  'assets/cdn.prod.website-files.com/6a3e64ff64a92f2281e8e82a/js/webflow.achunk.ddcb9913a142f399.js',
  'vendor-next/static/immutable/chunks/3xckc-wigoukr.js',
  'api/markets.json','api/ticks.json'
]
for(const rel of required){const p=path.join(root,rel);if(!fs.existsSync(p)||!fs.statSync(p).size)throw new Error(`Missing ${rel}`)}
const html=fs.readFileSync(path.join(root,'index.html'),'utf8')
const runtime=fs.readFileSync(path.join(root,'socrates-runtime.js'),'utf8')
if(!html.includes('<script src="/socrates-runtime.js"></script>')) throw new Error('Runtime copy adapter is not injected')
for(const expected of ['SOCRATESOS','Question the move','Find the why','Built for context, not the hype','X agent for tokenized stocks','branded image','#F3BA2F'])if(!runtime.includes(expected))throw new Error(`Missing runtime copy/theme: ${expected}`)
if(runtime.includes('Open the agent')) throw new Error('Retired Open the agent CTA remains in runtime')
const copyMatch=runtime.match(/const COPY = (\{.*\});\r?\n  const entries/)
if(!copyMatch)throw new Error('Unable to inspect public copy map')
for(const value of Object.values(JSON.parse(copyMatch[1])))if(/\.+(?=\s|$)/.test(value))throw new Error(`Sentence-ending full stop remains in public copy: ${value}`)
const webgl=fs.readFileSync(path.join(root,'assets/cdn.jsdelivr.net/gh/MilovanovicMatija/prime@main/assets/index-DM4qWrvI.js'),'utf8')
for(const expected of ['/models/scene-bnb-flush.glb','/models/scene-mobile-bnb-flush.glb'])if(!webgl.includes(expected))throw new Error(`WebGL bundle does not load ${expected}`)
if(webgl.includes('scene-debug.glb')||webgl.includes('scene-mobile-debug.glb'))throw new Error('Debug glasses model remains wired into production')
if(!webgl.includes('C==="BNB_Temple_Badge"')||!webgl.includes('for(const y of[h,...n,k].filter(Boolean))this._patchErosion(y.material)'))throw new Error('BNB glasses logo is not bound to the model dissolve/scroll lifecycle')
for(const rel of required.filter(x=>x.endsWith('.glb'))){const b=fs.readFileSync(path.join(root,rel));if(b.subarray(0,4).toString()!=='glTF'||b.readUInt32LE(4)!==2||b.readUInt32LE(8)!==b.length)throw new Error(`Invalid GLB ${rel}`)}
for(const rel of required.filter(x=>/scene(?:-mobile)?-bnb-flush\.glb$/.test(x))){
  const b=fs.readFileSync(path.join(root,rel)),jsonLength=b.readUInt32LE(12)
  const gltf=JSON.parse(b.subarray(20,20+jsonLength).toString('utf8').trim())
  const badgeNode=gltf.nodes.find(x=>x.name==='BNB_Temple_Badge')
  if(!badgeNode)throw new Error(`Missing animated BNB badge node in ${rel}`)
  if(!gltf.materials.some(x=>x.name==='Fake_BNB_Temple_Badge'&&x.alphaMode==='MASK'))throw new Error(`Missing transparent BNB decal material in ${rel}`)
  if(!gltf.images.some(x=>x.name==='BNB_Temple_Badge'))throw new Error(`Missing embedded BNB badge image in ${rel}`)
  const badgePosition=gltf.accessors[gltf.meshes[badgeNode.mesh].primitives[0].attributes.POSITION]
  if(Math.abs(badgePosition.min[0]+0.856)>1e-5||Math.abs(badgePosition.max[0]+0.856)>1e-5)throw new Error(`BNB decal is not flush to the temple surface in ${rel}`)
}
console.log(`Verified ${required.length} critical files, SocratesOS copy, and all GLB models.`)
