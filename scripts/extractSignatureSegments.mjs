// extractSignatureSegments.mjs
import fs from 'fs'
import path from 'path'
import { XMLParser } from 'fast-xml-parser'

const svgPath = path.resolve('public', 'signature.svg')
const outputPath = path.resolve('src', 'components', 'signatureSegments.ts')
const DEFAULT_VIEW_BOX = '0 0 972 496'

const svg = fs.readFileSync(svgPath, 'utf8')

const parser = new XMLParser({
    ignoreAttributes: false,
    attributeNamePrefix: '@_',
})

const doc = parser.parse(svg)

const collected = []

const collectPaths = value => {
    if (!value) return
    if (Array.isArray(value)) {
        value.forEach(collectPaths)
        return
    }
    if (typeof value === 'object') {
        if (typeof value['@_d'] === 'string') {
            collected.push(value['@_d'])
        }
        Object.keys(value).forEach(key => {
            if (key !== '@_d') {
                collectPaths(value[key])
            }
        })
    }
}

collectPaths(doc.svg)

if (collected.length === 0) {
    throw new Error('No <path> elements found in public/signature.svg')
}

const parseFirstPoint = (d) => {
    const match = /[-+]?\d*\.?\d+/.exec(d)
    if (!match) return { x: 0, y: 0 }
    const x = parseFloat(match[0])
    const rest = d.slice(match.index + match[0].length)
    const matchY = /[-+]?\d*\.?\d+/.exec(rest)
    const y = matchY ? parseFloat(matchY[0]) : 0
    return { x, y }
}

const segments = collected
    .filter(d => typeof d === 'string' && d.trim().length > 0)
    .map(d => d.replace(/'/g, "\\'"))
    .sort((a, b) => {
        const { y: yA } = parseFirstPoint(a)
        const { y: yB } = parseFirstPoint(b)
        return yA - yB
    })

const viewBox = typeof doc.svg?.['@_viewBox'] === 'string' && doc.svg['@_viewBox'].trim().length > 0
    ? doc.svg['@_viewBox']
    : DEFAULT_VIEW_BOX

const fileContent = `export const VIEW_BOX = '${viewBox}';\nexport const SEGMENTS: string[] = [\n${segments
  .map(d => `  '${d}',`)
  .join('\n')}\n];\n`

fs.writeFileSync(outputPath, fileContent)

console.log(`Generated ${segments.length} segments -> ${path.relative(process.cwd(), outputPath)}`)
console.log(`Using viewBox: ${viewBox}`)