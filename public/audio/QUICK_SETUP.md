# Quick Audio Setup

## What You Need

Place **at least ONE** of these files in `public/audio/`:

1. **`siren.mp3`** - Emergency siren sound (RECOMMENDED)
2. **`heartbeat.mp3`** - Heartbeat sound (ALTERNATIVE)
3. **`horror.mp3`** - Horror ambiance (FALLBACK)

## File Requirements

- **Format**: MP3
- **Duration**: 5-30 seconds (will loop automatically)
- **Volume**: Normalized to -3dB to -6dB
- **Size**: Under 500KB

## Where to Get Sounds

### Quick & Free:
1. **Freesound.org** - Search "siren" or "emergency alarm"
2. **Zapsplat.com** - Search "alarm siren"
3. **Pixabay Audio** - Search "siren"

### Search Terms:
- For siren: "emergency siren", "alarm siren", "warning siren"
- For heartbeat: "heartbeat slow", "ominous heartbeat"
- For horror: "horror ambiance", "dark atmosphere", "eerie drone"

## Quick Steps

1. Download a siren sound from Freesound.org
2. Convert to MP3 (if needed)
3. Rename to `siren.mp3`
4. Place in `public/audio/siren.mp3`
5. Refresh the app
6. Test in Nightmare Mode (health 0-39)

## File Structure

```
public/
└── audio/
    ├── siren.mp3       ← Add at least one of these
    ├── heartbeat.mp3   ← 
    └── horror.mp3      ← 
```

## Testing

1. Open the dashboard
2. Select "AWS Monitoring" in Settings
3. Drag System Stability slider to 0-39
4. Audio should play automatically
5. Use mute button (bottom right) if needed

---

**See AUDIO_FILES_GUIDE.md in project root for detailed instructions**
