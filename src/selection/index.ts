import { GlobalFonts, createCanvas, loadImage, type Image } from '@napi-rs/canvas'
import { type Config, defaultConfig } from './config.js'
import type { Size, Range } from '../config.js'
// import { writeFileSync } from 'fs'
import { drawCircles, drawRandomLines } from '../utils.js'

const createSelectionCaptchaGenerator = async (config: Partial<Config> = { }): Promise<SelectionCaptcha> => {
  const cfg = { ...defaultConfig, ...config }
  cfg.fonts.forEach(font => {
    if (typeof font === 'string' || GlobalFonts.has(font.name)) return
    GlobalFonts.registerFromPath(font.path, font.name)
  })
  return new SelectionCaptcha(cfg, await Promise.all(cfg.backgroundImages.map(async it => await loadImage(it))))
}

export default createSelectionCaptchaGenerator

export interface Dot {
  x: number
  y: number
  fontWidth: number
  fontHeight: number
}

interface DotInternal extends Dot {
  fontSize: number
  text: string
  randAngle: number
  randColor: string
  randColor2: string
}

export class SelectionCaptcha {
  constructor (private readonly config: Config, private readonly backgroundImages: Image[]) { }

  public async generate (imageSize = this.config.size, thumbSize = this.config.thumbSize): Promise<{ image: Buffer, thumb: Buffer, dots: Dot[] }> {
    const length = this.config.length[0] + (Math.random() * (this.config.length[1] - this.config.length[0]) + 0.4) | 0
    const chars = []
    for (let i = 0; i < length; i++) chars.push(this.config.chars[Math.random() * this.config.chars.length | 0])

    const allDots = this.genDots(imageSize, this.config.fontSize, chars)
    allDots.sort(() => Math.random() - 0.5)
    const checkLength = this.config.checkLength[0] + (Math.random() * (this.config.checkLength[1] - this.config.checkLength[0]) + 0.4) | 0
    const checkDots = allDots.slice(0, checkLength)
    const thumbDots = this.genDots(thumbSize, this.config.thumbFontSize, checkDots.map(it => it.text))

    return {
      image: await this.genImage(imageSize, allDots, Math.random() * 15 + 10 | 0, Math.random() * 4 + 5 | 0, this.backgroundImages[Math.random() * this.backgroundImages.length | 0]),
      thumb: await this.genImage(thumbSize, thumbDots, Math.random() * 5 + 5 | 0, Math.random() * 2 + 3 | 0),
      dots: checkDots.map((it, i) => ({ x: it.x, y: it.y, fontWidth: it.fontWidth, fontHeight: it.fontHeight }))
    }
  }

  private async genImage (imageSize: Size, dots: DotInternal[], circles: number, lines: number, background?: Image): Promise<Buffer> {
    const canvas = createCanvas(imageSize.width, imageSize.height)
    const ctx = canvas.getContext('2d')
    if (background != null) ctx.drawImage(background, 0, 0, canvas.width, canvas.height)
    else {
      ctx.fillStyle = this.config.thumbBackgroundColor
      ctx.fillRect(0, 0, canvas.width, canvas.height)
    }
    drawRandomLines(ctx, canvas.width, canvas.height, lines)
    drawCircles(ctx, canvas.width, canvas.height, circles)
    dots.forEach(dot => {
      ctx.save()
      const font = this.config.fonts[Math.random() * this.config.fonts.length | 0]
      ctx.textBaseline = 'top'
      ctx.font = `${dot.fontSize}px '${typeof font === 'string' ? font : font.name}'`
      ctx.fillStyle = dot.randColor
      ctx.strokeStyle = dot.randColor2
      ctx.lineWidth = 2.3
      ctx.translate(dot.x, dot.y)
      ctx.rotate(dot.randAngle * Math.PI / 180)
      ctx.strokeText(dot.text, 0, 0, dot.fontWidth - 4)
      ctx.fillText(dot.text, 0, 0, dot.fontWidth - 4)
      ctx.restore()
    })

    return await canvas.encode('jpeg', this.config.quality)
  }

  // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
  private genDots (imageSize: Size, fontSize: Range, chars: string[], padding = 10): DotInternal[] {
    const width = imageSize.width - padding * 2
    const height = imageSize.height - padding * 2

    const sigleWidth = width / chars.length

    return chars.map((text, i) => {
      const randAngleRange = this.config.angles[Math.random() * this.config.angles.length | 0]
      const randAngle = Math.random() * (randAngleRange[1] - randAngleRange[0]) + randAngleRange[0] | 0
      const randColor = this.config.textColors[Math.random() * this.config.textColors.length | 0]
      const randColor2 = this.config.thumbTextColors[Math.random() * this.config.thumbTextColors.length | 0]
      const randFontSize = Math.random() * (fontSize[1] - fontSize[0]) + fontSize[0] | 0
      let fontHeight = randFontSize
      let fontWidth = randFontSize

      if (text.length > 1) {
        fontWidth = randFontSize * text.length
        if (randAngle > 0) {
          const surplus = fontWidth - randFontSize
          const ra = randAngle % 90
          const pr = surplus / 90
          const h = Math.max(ra * pr, 1)
          fontHeight = fontHeight + h | 0
        }
      }

      const x = sigleWidth * i + padding + Math.random() * (sigleWidth - fontHeight / 2) | 0
      const y = Math.min(Math.random() * height + padding * 2, imageSize.height - fontHeight) | 0

      return { x, y, fontSize: randFontSize, fontWidth, fontHeight, text, randAngle, randColor, randColor2 }
    })
  }

  public verify (input: Array<[number, number]>, dots: Dot[], padding = 5): boolean {
    if (input.length !== dots.length) return false
    for (let i = 0; i < input.length; i++) {
      const dot = dots[i]
      const [x, y] = input[i]
      if (x < dot.x - padding || x > dot.x + dot.fontWidth + padding) return false
      if (y < dot.y - padding || y > dot.y + dot.fontHeight + padding) return false
    }
    return true
  }
}

// const g = await createGenerator()
// const t = Date.now()
// const c = await g.generate()
// console.log(Date.now() - t)
// writeFileSync('test.jpg', c.image)
// writeFileSync('test_thumb.jpg', c.thumb)
