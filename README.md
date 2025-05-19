# CueGenerator

**CueGenerator** is a Node.js + TypeScript tool that analyzes a continuous MP3 file, detects silence between songs, and generates a `.cue` sheet to split or navigate the tracks in any compatible player or editor.

## 🎯 Features

- Detects silent gaps between songs using FFmpeg
- Automatically calculates track start times
- Exports a valid `.cue` file for easy navigation or splitting
- Works with any MP3 file (e.g., albums, live recordings)

## 📦 Requirements

- Node.js (v16+ recommended)
- FFmpeg (installed automatically via `ffmpeg-static`)

## 🚀 Setup

```bash
git clone https://github.com/your-username/CueGenerator.git
cd CueGenerator
npm install
```

## 🛠️ Configuration

Place your .mp3 file in the project directory (default: samples.mp3). You can customize detection sensitivity in src/index.ts:

```typescript
const silenceThreshold = '-24.2dB'; // lower = more sensitive
const silenceDuration = 0.5;        // seconds of silence required
```

## 📂 Project Structure

```
CueGenerator/
├── src/
│   └── index.ts         # Main script
├── samples.mp3          # Your input file (example)
├── package.json
├── tsconfig.json
```

## 🧪 Usage

Run the analyzer and generate the .cue file:
```bash
npx ts-node src/index.ts
```

You will see output like:

```bash
✅ CUE sheet has been saved: /absolute/path/samples.cue
```

## 📄 Example Output (.cue)
```lisp
PERFORMER "Unknown"
TITLE "Split Tracks"
FILE "samples.mp3" MP3
  TRACK 01 AUDIO
    TITLE "Track 1"
    PERFORMER "Unknown"
    INDEX 01 00:00:00
  TRACK 02 AUDIO
    TITLE "Track 2"
    PERFORMER "Unknown"
    INDEX 01 02:14:05
...
```

## 🎧 Compatible With

	•	foobar2000
	•	Audacity
	•	VLC Media Player
	•	mp3DirectCut
	•	Cue splitting tools

## 📃 License

MIT License