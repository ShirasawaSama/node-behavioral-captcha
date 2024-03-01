import { createCanvas, type SKRSContext2D } from '@napi-rs/canvas'
import { type Config, defaultConfig } from './config.js'
// import { writeFileSync } from 'fs'
import { drawCircles, drawRandomLines } from '../utils.js'
import { loadFonts } from '../config.js'

export default class CalculationCaptcha {
  constructor (private readonly config: Config = defaultConfig) { loadFonts(config.fonts) }

  public async generate (imageSize = this.config.size): Promise<{ image: Buffer, answer: number }> {
    const canvas = createCanvas(imageSize.width, imageSize.height)
    const ctx = canvas.getContext('2d')
    ctx.fillStyle = this.config.backgroundColor
    ctx.fillRect(0, 0, canvas.width, canvas.height)
    const left = this.config.range[0] + Math.random() * (this.config.range[1] - this.config.range[0]) | 0
    const right = this.config.range[0] + Math.random() * (this.config.range[1] - this.config.range[0]) | 0
    const isSub = Math.random() > 0.5
    const answer = isSub ? left - right : left + right

    drawRandomLines(ctx, canvas.width, canvas.height, Math.random() * 4 + 5 | 0)
    drawCircles(ctx, canvas.width, canvas.height, Math.random() * 5 + 10 | 0)

    const part = imageSize.width / 5
    this.drawText(ctx, left.toString(), Math.random() * part + 5 | 0, Math.random() * imageSize.height / 4 + 10 | 0)
    this.drawText(ctx, isSub ? '-' : '+', Math.random() * part / 2 + part * 2 + 5 | 0, Math.random() * imageSize.height / 8 + 3 | 0, true)
    this.drawText(ctx, right.toString(), Math.random() * part + part * 3 + 5 | 0, Math.random() * imageSize.height / 4 + 10 | 0)

    return { image: await canvas.encode('jpeg', this.config.quality), answer }
  }

  private drawText (ctx: SKRSContext2D, text: string, x: number, y: number, simple = false): void {
    const randAngleRange = this.config.angles[Math.random() * this.config.angles.length | 0]
    const randAngle = Math.random() * (randAngleRange[1] - randAngleRange[0]) + randAngleRange[0] | 0
    ctx.save()
    const font = this.config.fonts[Math.random() * this.config.fonts.length | 0]
    ctx.textBaseline = 'top'
    ctx.font = `${Math.random() * (simple ? 5 : 0) * (this.config.fontSize[1] - this.config.fontSize[0]) + this.config.fontSize[0] | 0}px ${typeof font === 'string' ? font : font.name}`
    ctx.fillStyle = this.config.textColors[Math.random() * this.config.textColors.length | 0]
    ctx.translate(x, y)
    if (!simple) ctx.rotate(randAngle * Math.PI / 180)
    ctx.fillText(text, 0, 0)
    ctx.restore()
  }
}

export const createCalculationCaptchaGenerator = (config: Config = defaultConfig): CalculationCaptcha => new CalculationCaptcha(config)

// const g = new CalculatorCaptcha()
// const t = Date.now()
// const c = await g.generate()
// console.log(Date.now() - t)
// writeFileSync('test.jpg', c.image)
// console.log(c.answer)
