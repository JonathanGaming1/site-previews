// Produces a single, self-contained HTML preview of the built client app:
// inlines the JS module and CSS, and one favicon data URI, into index.html.
import { readFileSync, writeFileSync } from 'node:fs'

const dir = new URL('../dist/client', import.meta.url).pathname
let html = readFileSync(`${dir}/index.html`, 'utf8')

const jsFile = html.match(/<script type="module"[^>]*src="\/(assets\/([^"])+\.js)"/)?.[1]
const cssFile = html.match(/<link rel="stylesheet"[^>]*href="\/(assets\/([^"])+\.css)"/)?.[1]
if (!jsFile || !cssFile) throw new Error('cannot find built asset references in index.html')

const favicon = readFileSync(`${dir}/favicon.svg`).toString('base64')
html = html.replace('<link rel="icon" type="image/svg+xml" href="/favicon.svg" />',
  () => `<link rel="icon" type="image/svg+xml" href="data:image/svg+xml;base64,${favicon}" />`)

const js = readFileSync(`${dir}/${jsFile}`, 'utf8').replace(/<\/script>/g, '<\\/script>')
html = html.replace(/<script type="module"[^>]*src="\/assets\/([^"])+\.js"[^>]*><\/script>/, () => `<script type="module">${js}</script>`)

const css = readFileSync(`${dir}/${cssFile}`, 'utf8').replace(/<\/style>/g, '<\\/style>')
html = html.replace(/<link rel="stylesheet"[^>]*href="\/assets\/([^"])+\.css"[^>]*>/, () => `<style>${css}</style>`)

// Only the head must be asset-free: the inlined bundle legitimately contains a
// literal asset-tag string inside React's DOM error template.
const head = html.slice(0, html.indexOf('</head>'))
if (/src="\/assets\/|href="\/assets\//.test(head)) throw new Error('unreplaced asset reference remains')
writeFileSync('future-premium-aether.html', html)
console.log('wrote future-premium-aether.html,', html.length, 'bytes')
