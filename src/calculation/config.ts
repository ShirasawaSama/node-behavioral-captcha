import { type Range, type Size, defaultFonts, defaultAngles, defualtThumbTextColors } from '../config.js'

export const defaultConfig = {
  size: { width: 150, height: 40 } satisfies Size,
  textColors: defualtThumbTextColors,
  fontSize: [24, 30] as Range,
  range: [0, 50] as Range,
  backgroundColor: '#fff',
  fonts: defaultFonts,
  angles: defaultAngles,
  quality: 70
}

export type Config = typeof defaultConfig
