import { GlobalFonts } from '@napi-rs/canvas'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

export const currentPath = join(dirname(fileURLToPath(import.meta.url)), '..')

export type Range = [number, number]
export interface Size { width: number, height: number }
export interface FileFont { path: string, name: string }

export const defaultTextColors = [
  '#fde98e',
  '#60c1ff',
  '#fcb08e',
  '#fb88ff',
  '#b4fed4',
  '#cbfaa9'
]
export const defualtThumbTextColors = [
  '#006600',
  '#005db9',
  '#aa002a',
  '#875400',
  '#6e3700',
  '#660033'
]

export const defaultAngles: Range[] = [
  [20, 35],
  [35, 45],
  [305, 325],
  [325, 330]
]

export const defaultFonts = [{ path: join(currentPath, '../fonts/FZShengSKSJW.TTF'), name: 'FZShengSKSJW' }] as Array<FileFont | string>

export const loadFonts = (fonts: Array<FileFont | string>): void => {
  fonts.forEach(font => {
    if (typeof font === 'string' || GlobalFonts.has(font.name)) return
    GlobalFonts.registerFromPath(font.path, font.name)
  })
}
