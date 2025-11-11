// extractSignatureSegments.mjs
import fs from 'fs'
import path from 'path'

const svgPath = path.resolve('public', 'signature.svg')
const outputPath = path.resolve('src', 'components', 'signatureSegments.ts')

const svg = fs.readFileSync(svgPath, 'utf8')

const segments = Array.from(svg.matchAll(/<path[^>]*d="([^"]+)"/g), match =>
  match[1].replace(/'/g, "\\'")
)

const fileContent = `export const SEGMENTS: string[] = [\n${segments
  .map(d => `  '${d}',`)
  .join('\n')}\n];\n`

fs.writeFileSync(outputPath, fileContent)

console.log(`Generated ${segments.length} segments -> ${path.relative(process.cwd(), outputPath)}`)