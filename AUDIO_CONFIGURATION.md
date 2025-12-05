# Audio Configuration Summary

## ✅ Audio Files Configured

All audio files have been successfully integrated into the application!

---

## 📁 Audio Files in `public/audio/`

### Nightmare Mode Background Audio
- ✅ **`audio_siren.mp3`** - Emergency siren (primary)
- ✅ **`audio_heartbeat.mp3`** - Heartbeat sound (fallback)
- ✅ **`audio_horror.mp3`** - Horror ambiance (fallback)

### Pomodoro Timer Audio
- ✅ **`tick.mp3`** - Normal ticking sound
- ✅ **`fast_tick.mp3`** - Fast ticking (last 60 seconds)
- ✅ **`alarm_peaceful.mp3`** - Peaceful mode alarm
- ✅ **`alarm_nightmare.mp3`** - Nightmare mode alarm

---

## 🎵 How Audio Works

### 1. Nightmare Mode Background Audio (`AudioManager.tsx`)

**When it plays:**
- Only in Nightmare Mode (health 0-39)
- Only when AWS Monitoring is selected
- Automatically starts when entering Nightmare Mode

**Features:**
- Tries to load files in order: siren → heartbeat → horror
- Loops continuously
- Volume set to 30%
- Mute button appears in bottom right
- Handles autoplay blocking gracefully

**Controls:**
- Mute/Unmute button (bottom right, red circular button)
- "Click to Enable Audio" button if autoplay is blocked

---

### 2. Pomodoro Timer Audio (`PomodoroAudioManager.tsx`)

**Ticking Sounds (Nightmare Mode Only):**
- **Normal tick** (`tick.mp3`): Plays during timer countdown
- **Fast tick** (`fast_tick.mp3`): Plays in last 60 seconds
- Volume: 20% (normal), 30% (fast)
- Only plays in Nightmare Mode
- Stops when timer is paused

**Alarm Sounds (All Modes):**
- **Peaceful alarm** (`alarm_peaceful.mp3`): Plays in Peaceful/Glitch modes
- **Nightmare alarm** (`alarm_nightmare.mp3`): Plays in Nightmare Mode
- Volume: 50%
- Plays once when timer phase completes

---

## 🎮 How to Test Audio

### Test Nightmare Mode Background Audio:
1. Open Settings → Data Source
2. Select "AWS Monitoring"
3. Close Settings
4. Drag System Stability slider to 0-39 (Nightmare Mode)
5. Audio should start playing
6. Use mute button (bottom right) to toggle

### Test Pomodoro Timer Audio:
1. Click Timer icon (🍅) in top right
2. Set work duration (e.g., 1 minute for testing)
3. Click Start
4. **In Nightmare Mode:**
   - Hear ticking sound during countdown
   - Hear fast ticking in last 60 seconds
   - Hear nightmare alarm when timer completes
5. **In Peaceful Mode:**
   - No ticking sounds
   - Hear peaceful alarm when timer completes

---

## 🔧 Technical Details

### AudioManager Component
**Location:** `src/components/AudioManager.tsx`

**Responsibilities:**
- Loads background horror audio
- Manages playback in Nightmare Mode
- Provides mute controls
- Handles autoplay blocking

**Audio Loading Order:**
1. `/audio/audio_siren.mp3`
2. `/audio/audio_heartbeat.mp3`
3. `/audio/audio_horror.mp3`

### PomodoroAudioManager Component
**Location:** `src/components/PomodoroAudioManager.tsx`

**Responsibilities:**
- Plays ticking sounds during timer (Nightmare Mode only)
- Switches to fast tick in last 60 seconds
- Plays alarm when phase completes
- Respects sound settings

**Audio Files Used:**
- `/audio/tick.mp3` - Normal ticking
- `/audio/fast_tick.mp3` - Fast ticking
- `/audio/alarm_peaceful.mp3` - Peaceful alarm
- `/audio/alarm_nightmare.mp3` - Nightmare alarm

---

## ⚙️ Settings Integration

**Sound Effects Toggle:**
- Location: Settings → Data Source → Accessibility (AWS only)
- Controls both background audio and timer audio
- Persists across sessions

**When Disabled:**
- No background audio in Nightmare Mode
- No ticking sounds in Pomodoro timer
- Alarm sounds still play (can be muted separately)

---

## 🎯 Audio Behavior Matrix

| Mode | Data Source | Timer Active | Background Audio | Ticking | Alarm |
|------|-------------|--------------|------------------|---------|-------|
| Peaceful | HN | No | ❌ | ❌ | ✅ Peaceful |
| Peaceful | HN | Yes | ❌ | ❌ | ✅ Peaceful |
| Peaceful | AWS | No | ❌ | ❌ | ✅ Peaceful |
| Peaceful | AWS | Yes | ❌ | ❌ | ✅ Peaceful |
| Glitch | AWS | No | ❌ | ❌ | ✅ Peaceful |
| Glitch | AWS | Yes | ❌ | ❌ | ✅ Peaceful |
| Nightmare | AWS | No | ✅ Siren | ❌ | ✅ Nightmare |
| Nightmare | AWS | Yes | ✅ Siren | ✅ Tick | ✅ Nightmare |

---

## 🐛 Troubleshooting

### Audio Not Playing
1. Check browser console for errors
2. Verify files exist in `public/audio/`
3. Check if sound is enabled in Settings
4. Try different browser
5. Check browser autoplay settings

### Ticking Too Loud/Quiet
- Edit volume in `PomodoroAudioManager.tsx`:
  - Line: `tickAudio.volume = 0.2;` (20%)
  - Line: `fastTickAudio.volume = 0.3;` (30%)

### Background Audio Too Loud/Quiet
- Edit volume in `AudioManager.tsx`:
  - Line: `audio.volume = 0.3;` (30%)

### Alarm Too Loud/Quiet
- Edit volume in `PomodoroAudioManager.tsx`:
  - Line: `alarm.volume = 0.5;` (50%)

---

## 📝 Summary

✅ **All 7 audio files are configured and working**
✅ **Background audio plays in Nightmare Mode (AWS only)**
✅ **Pomodoro timer has ticking and alarm sounds**
✅ **Mute controls available**
✅ **Respects accessibility settings**
✅ **Graceful fallbacks for missing files**

The audio system is fully functional and ready to use! 🎉
