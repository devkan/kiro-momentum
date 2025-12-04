# Audio Files Creation Guide

## Overview

The DevOps Nightmare Dashboard uses audio files to enhance the horror experience in Nightmare Mode. All audio files should be placed in the `public/audio/` directory.

---

## Required Audio Files

### 🚨 Priority 1: Nightmare Mode Background Audio (Required)

The AudioManager tries to load these files in order. **At least ONE is required** for audio to work:

#### 1. `siren.mp3` (Recommended)
- **Purpose**: Emergency siren sound for Nightmare Mode
- **Type**: Looping background ambiance
- **Duration**: 5-15 seconds (will loop)
- **Volume**: Medium intensity
- **Characteristics**: 
  - Emergency/alarm siren
  - Industrial warning sound
  - Server room emergency alert
  - Continuous, urgent tone

#### 2. `heartbeat.mp3` (Alternative)
- **Purpose**: Heartbeat sound for Nightmare Mode
- **Type**: Looping background ambiance
- **Duration**: 2-5 seconds (will loop)
- **Volume**: Low to medium
- **Characteristics**:
  - Slow, ominous heartbeat
  - Can speed up slightly for tension
  - Deep bass thump

#### 3. `horror.mp3` (Fallback)
- **Purpose**: Generic horror ambient sound
- **Type**: Looping background ambiance
- **Duration**: 10-30 seconds (will loop)
- **Volume**: Low to medium
- **Characteristics**:
  - Dark ambient drone
  - Eerie atmosphere
  - Subtle horror soundscape

---

### 🍅 Priority 2: Pomodoro Timer Audio (Optional - Not Yet Implemented)

These files are documented but not currently used. They can be added for future implementation:

#### 4. `tick.mp3`
- **Purpose**: Subtle ticking during Pomodoro timer (Nightmare Mode only)
- **Duration**: 1 second
- **Characteristics**: Clock tick sound

#### 5. `tick_fast.mp3`
- **Purpose**: Rapid ticking in last 60 seconds (Nightmare Mode)
- **Duration**: 0.5 seconds
- **Characteristics**: Faster clock tick, building tension

#### 6. `alarm_peaceful.mp3`
- **Purpose**: Timer completion sound (Peaceful/Glitch modes)
- **Duration**: 2-3 seconds
- **Characteristics**: Gentle chime, pleasant notification

#### 7. `alarm_nightmare.mp3`
- **Purpose**: Timer completion sound (Nightmare Mode)
- **Duration**: 2-3 seconds
- **Characteristics**: Urgent alarm, jarring sound

---

## File Specifications

### Format
- **Required**: MP3 format
- **Bitrate**: 128-192 kbps (good quality, reasonable file size)
- **Sample Rate**: 44.1 kHz

### Audio Properties
- **Volume**: Normalize to -3dB to -6dB (app sets volume to 30%)
- **Looping**: Ensure seamless loop points (no clicks/pops)
- **Mono/Stereo**: Stereo preferred for ambiance, mono acceptable

### File Size
- Keep files under 500KB each for fast loading
- Compress appropriately without losing quality

---

## Where to Find/Create Audio Files

### Free Sound Effect Resources

1. **Freesound.org** (https://freesound.org/)
   - Search: "siren", "emergency alarm", "heartbeat", "horror ambiance"
   - License: Check individual files (many are CC0/CC-BY)

2. **Zapsplat.com** (https://www.zapsplat.com/)
   - Search: "alarm siren", "horror atmosphere", "heartbeat"
   - License: Free with attribution

3. **Pixabay Audio** (https://pixabay.com/sound-effects/)
   - Search: "siren", "alarm", "horror"
   - License: Free for commercial use

4. **BBC Sound Effects** (https://sound-effects.bbcrewind.co.uk/)
   - Search: "alarm", "siren"
   - License: Free for personal/educational use

5. **YouTube Audio Library** (https://www.youtube.com/audiolibrary)
   - Filter by "Sound Effects"
   - License: Varies, check individual files

### AI Audio Generation Tools

1. **ElevenLabs** (https://elevenlabs.io/sound-effects)
   - Generate custom sound effects with AI
   - Good for specific sounds

2. **Soundraw** (https://soundraw.io/)
   - AI music generation
   - Can create ambient horror tracks

### DIY Recording/Creation

1. **Audacity** (Free audio editor)
   - Record your own sounds
   - Edit and loop audio
   - Apply effects (reverb, distortion)

2. **GarageBand** (Mac)
   - Built-in sound effects
   - Easy audio editing

---

## Recommended Sounds for Each File

### For `siren.mp3`:
- Search terms: "emergency siren", "air raid siren", "alarm siren", "warning siren"
- Examples:
  - Industrial alarm
  - Server room emergency alert
  - Nuclear warning siren
  - Tornado siren

### For `heartbeat.mp3`:
- Search terms: "heartbeat", "heart beat slow", "pulse"
- Examples:
  - Slow, deep heartbeat (60-80 BPM)
  - Ominous heartbeat with reverb
  - Distorted heartbeat

### For `horror.mp3`:
- Search terms: "horror ambiance", "dark atmosphere", "eerie drone", "horror soundscape"
- Examples:
  - Dark ambient drone
  - Creepy atmosphere
  - Tension building sound
  - Ominous hum

---

## How to Add Audio Files

1. **Download/Create** your audio files
2. **Convert to MP3** if needed (use online converter or Audacity)
3. **Normalize volume** to -3dB to -6dB
4. **Test looping** - ensure no clicks at loop point
5. **Rename** files according to the list above
6. **Place** in `public/audio/` directory:
   ```
   public/
   └── audio/
       ├── siren.mp3          ← Add here
       ├── heartbeat.mp3      ← Add here
       └── horror.mp3         ← Add here
   ```
7. **Refresh** the application
8. **Test** by entering Nightmare Mode (set health to 0-39)

---

## Testing Your Audio

1. Start the application
2. Open Settings → Data Source → Select "AWS Monitoring"
3. Use the System Stability slider at the bottom
4. Drag slider to 0-39 (Nightmare Mode)
5. Audio should start playing automatically
6. If autoplay is blocked, click "Enable Audio" button
7. Use the mute button (bottom right) to toggle audio

---

## Troubleshooting

### Audio Not Playing
- Check browser console for errors
- Verify file names match exactly (case-sensitive)
- Ensure files are in `public/audio/` directory
- Try different browser (Chrome, Firefox, Safari)
- Check if browser has autoplay blocked

### Audio Clicks/Pops When Looping
- Edit audio file to create seamless loop
- Use fade in/out at loop points
- Ensure audio starts and ends at zero crossing

### Audio Too Loud/Quiet
- Normalize audio file to -3dB to -6dB
- App sets volume to 30% automatically
- Adjust source file volume if needed

---

## Quick Start (Minimum Setup)

**To get audio working quickly, you only need ONE file:**

1. Download a siren sound effect from Freesound.org
2. Convert to MP3 if needed
3. Rename to `siren.mp3`
4. Place in `public/audio/siren.mp3`
5. Refresh app and test!

---

## File Checklist

- [ ] `siren.mp3` - Emergency siren (REQUIRED - at least one of the three)
- [ ] `heartbeat.mp3` - Heartbeat sound (REQUIRED - at least one of the three)
- [ ] `horror.mp3` - Horror ambiance (REQUIRED - at least one of the three)
- [ ] `tick.mp3` - Timer tick (Optional, not yet implemented)
- [ ] `tick_fast.mp3` - Fast timer tick (Optional, not yet implemented)
- [ ] `alarm_peaceful.mp3` - Peaceful alarm (Optional, not yet implemented)
- [ ] `alarm_nightmare.mp3` - Nightmare alarm (Optional, not yet implemented)

---

## License Considerations

⚠️ **Important**: Always check the license of audio files you download!

- **CC0 (Public Domain)**: Free to use, no attribution required ✅
- **CC-BY**: Free to use, attribution required ✅
- **Royalty-Free**: Usually requires purchase or subscription
- **Copyrighted**: Cannot use without permission ❌

For commercial use, ensure you have proper licensing!

---

## Need Help?

If you need help finding or creating audio files, consider:
1. Hiring a sound designer on Fiverr ($5-20)
2. Using AI generation tools (ElevenLabs, Soundraw)
3. Recording your own sounds with a smartphone
4. Asking in audio production communities (r/audioengineering)

---

**Remember**: The app works fine without audio files - they're an enhancement, not a requirement!
