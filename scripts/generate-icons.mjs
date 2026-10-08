import sharp from 'sharp'
import { readFileSync } from 'node:fs'

// Íconos de la PWA: el cocinero sobre terracota.
const chef = readFileSync('public/chef.svg')
const BG = '#9A3412'

async function icon(size, scale, file) {
  const inner = Math.round(size * scale)
  const chefPng = await sharp(chef, { density: 600 }).resize(inner, inner, { kernel: 'nearest' }).png().toBuffer()
  await sharp({ create: { width: size, height: size, channels: 4, background: BG } })
    .composite([{ input: chefPng, gravity: 'center' }])
    .png()
    .toFile(file)
}

await icon(192, 0.82, 'public/pwa-192.png')
await icon(512, 0.82, 'public/pwa-512.png')
await icon(180, 0.82, 'public/apple-touch-icon.png')
// Maskable: más margen de seguridad.
await icon(512, 0.6, 'public/pwa-maskable-512.png')
console.log('icons generated')
