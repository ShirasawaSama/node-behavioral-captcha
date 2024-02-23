import { type SKRSContext2D } from '@napi-rs/canvas'

export const drawRandomLines = (ctx: SKRSContext2D, width: number, height: number, count: number): void => {
  ctx.save()
  for (let i = 0; i < count; i++) {
    ctx.beginPath()
    ctx.moveTo(Math.random() * width, Math.random() * height)
    ctx.bezierCurveTo(
      Math.random() * width, Math.random() * height,
      Math.random() * width, Math.random() * height,
      Math.random() * width, Math.random() * height
    )
    ctx.lineWidth = Math.random() * 2
    ctx.strokeStyle = `rgba(${Math.random() * 255 | 0}, ${Math.random() * 255 | 0}, ${Math.random() * 255 | 0}, 0.5)`
    ctx.stroke()
  }
  ctx.restore()
}

export const drawCircles = (ctx: SKRSContext2D, width: number, height: number, count: number): void => {
  ctx.save()
  for (let i = 0; i < count; i++) {
    ctx.beginPath()
    ctx.arc(Math.random() * width, Math.random() * height, Math.random() * 10, 0, Math.PI * 2)
    ctx.fillStyle = `rgba(${Math.random() * 255 | 0}, ${Math.random() * 255 | 0}, ${Math.random() * 255 | 0}, 0.5)`
    ctx.fill()
  }
  ctx.restore()
}
