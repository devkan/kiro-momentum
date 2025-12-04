# Audio Files for DevOps Nightmare Dashboard

This directory should contain horror sound effects for the Nightmare Mode.

## Required Files

### Nightmare Mode Audio
The AudioManager component will attempt to load audio files in the following order:

1. `siren.mp3` - Emergency siren sound effect
2. `heartbeat.mp3` - Heartbeat sound effect
3. `horror.mp3` - Generic horror ambient sound

### Pomodoro Timer Audio
The Pomodoro Timer feature requires the following audio files:

1. `tick.mp3` - Subtle ticking sound (plays during Nightmare Mode timer)
2. `tick_fast.mp3` - Rapid ticking sound (plays in last 60 seconds, Nightmare Mode)
3. `alarm_peaceful.mp3` - Gentle chime for timer completion (Peaceful/Glitch modes)
4. `alarm_nightmare.mp3` - Urgent siren for timer completion (Nightmare Mode)

## File Requirements

- **Format**: MP3 (recommended for browser compatibility)
- **Volume**: Audio files should be normalized to a reasonable volume level (the component sets volume to 0.3 by default)
- **Loop**: The audio will be looped automatically when playing
- **Duration**: 5-30 seconds recommended for seamless looping

## Graceful Fallback

If no audio files are present, the AudioManager component will:
- Fail gracefully without breaking the application
- Log a warning to the console
- Not render any audio controls
- Continue to function normally in all other aspects

## Adding Audio Files

1. Place your audio files in this directory (`public/audio/`)
2. Name them according to the list above (at least one file is needed)
3. The component will automatically detect and use the first available file
4. Refresh the application to load the new audio files

## Recommended Sources for Free Horror Sound Effects

- [Freesound.org](https://freesound.org/)
- [Zapsplat.com](https://www.zapsplat.com/)
- [Pixabay Audio](https://pixabay.com/sound-effects/)

Make sure to check the licensing requirements for any audio files you use.
