import ffmpeg from 'fluent-ffmpeg'
import ffmpegStatic from 'ffmpeg-static'
import { spawn } from 'child_process'
import * as path from 'path'
import fs from 'fs-extra'

ffmpeg.setFfmpegPath(ffmpegStatic as string)

const filePath = path.resolve(__dirname, 'samples.mp3')
const cuePath = filePath.replace(/\.mp3$/, '.cue')
const silenceThreshold = '-30dB'
const silenceDuration = 1 // seconds

function parseSilenceOutput(stdout: string): number[] {
  const silenceRegex = /silence_(start|end): (\d+(\.\d+)?)/g
  const results: number[] = []
  let match: RegExpExecArray | null
  while ((match = silenceRegex.exec(stdout)) !== null) {
    results.push(parseFloat(match[2]))
  }
  return results
}

function secondsToCueTime(seconds: number): string {
  const mins = Math.floor(seconds / 60)
  const secs = Math.floor(seconds % 60)
  const frames = Math.floor((seconds % 1) * 75) // 75 frames per second in CUE
  return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}:${String(frames).padStart(2, '0')}`
}

function generateCutSheet(silencePoints: number[], totalDuration: number): [number, number][] {
  const cuts: [number, number][] = []
  let start = 0
  for (let i = 0; i < silencePoints.length; i += 2) {
    const end = silencePoints[i] // silence_start
    cuts.push([start, end])
    start = silencePoints[i + 1] // silence_end
  }
  cuts.push([start, totalDuration]) // last segment
  return cuts
}

function generateCueFile(cuts: [number, number][], filename: string): string {
  const cueLines: string[] = []
  cueLines.push(`PERFORMER "Unknown"`)
  cueLines.push(`TITLE "Split Tracks"`)
  cueLines.push(`FILE "${path.basename(filename)}" MP3`)

  cuts.forEach(([start], i) => {
    cueLines.push(`  TRACK ${String(i + 1).padStart(2, '0')} AUDIO`)
    cueLines.push(`    TITLE "Track ${i + 1}"`)
    cueLines.push(`    PERFORMER "Unknown"`)
    cueLines.push(`    INDEX 01 ${secondsToCueTime(start)}`)
  })

  return cueLines.join('\n')
}

function getDuration(): Promise<number> {
  return new Promise((resolve, reject) => {
    ffmpeg.ffprobe(filePath, (err, metadata) => {
      if (err || !metadata.format?.duration) return reject(err)
      resolve(metadata.format.duration)
    })
  })
}

async function analyzeSilence(): Promise<string> {
  return new Promise((resolve, reject) => {
    const args = [
      '-i', filePath,
      '-af', `silencedetect=noise=${silenceThreshold}:d=${silenceDuration}`,
      '-f', 'null',
      '-'
    ]
    const proc = spawn(ffmpegStatic as string, args)
    let output = ''
    proc.stderr.on('data', (data) => {
      output += data.toString()
    })
    proc.on('close', () => resolve(output))
    proc.on('error', reject)
  })
}

async function main() {
  try {
    const duration = await getDuration()
    const output = await analyzeSilence()
    const silencePoints = parseSilenceOutput(output)
    const cuts = generateCutSheet(silencePoints, duration)
    const cueText = generateCueFile(cuts, filePath)

    await fs.writeFile(cuePath, cueText)
    console.log(`✅ CUE sheet has been saved: ${cuePath}`)
  } catch (err) {
    console.error('Error:', err)
  }
}

main()