# Design Document

## Overview

The DevOps Nightmare Dashboard is a React-based single-page application that provides productivity features while dynamically transforming its visual presentation based on simulated server health status. The architecture emphasizes separation of concerns with a dedicated theme management system that enables instantaneous visual transitions between Peaceful, Glitch, and Nightmare modes without affecting core functionality.

## Architecture

### High-Level Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                        Dashboard App                         │
├─────────────────────────────────────────────────────────────┤
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │   Greeting   │  │    Clock     │  │   Weather    │      │
│  │  Component   │  │  Component   │  │  Component   │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │  Todo List   │  │  Background  │  │   Settings   │      │
│  │  Component   │  │   Manager    │  │    Modal     │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
├─────────────────────────────────────────────────────────────┤
│                    Theme Manager (Context)                   │
│  ┌─────────────────────────────────────────────────────┐    │
│  │  Health Status (0-100) → Mode Resolver → CSS Vars  │    │
│  └─────────────────────────────────────────────────────┘    │
├─────────────────────────────────────────────────────────────┤
│                     Storage Layer                            │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │  LocalStorage│  │  Unsplash    │  │   Weather    │      │
│  │   Service    │  │     API      │  │     API      │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
└─────────────────────────────────────────────────────────────┘
```

### Component Hierarchy

```
App
├── ThemeProvider (Context)
│   └── Dashboard
│       ├── OnboardingModal (conditional)
│       ├── BackgroundLayer
│       ├── HorrorOverlay (conditional)
│       ├── Header
│       │   ├── Greeting
│       │   ├── Clock
│       │   └── SettingsButton
│       ├── MainContent
│       │   ├── Weather
│       │   └── TodoList
│       ├── DevModeToggle
│       ├── SettingsModal (conditional)
│       └── AudioManager (conditional)
```

## Components and Interfaces

### 1. Theme Manager (React Context)

The Theme Manager is the core system that decouples visual presentation from business logic.

**Responsibilities:**
- Maintain AWS health status state (0-100)
- Calculate current mode based on health status
- Provide theme configuration to all components
- Manage CSS custom properties for instant transitions

**Interface:**

```typescript
interface ThemeMode {
  mode: 'peaceful' | 'glitch' | 'nightmare';
  healthStatus: number;
  fontFamily: string;
  backgroundFilter: string;
  textGlitch: boolean;
  showHorrorOverlay: boolean;
  greetingTemplate: string;
  soundEnabled: boolean;
}

interface ThemeContextValue {
  theme: ThemeMode;
  healthStatus: number;
  setHealthStatus: (status: number) => void;
}
```

**Mode Resolution Logic:**
```typescript
function resolveMode(healthStatus: number): ThemeMode {
  if (healthStatus >= 80) return PEACEFUL_MODE;
  if (healthStatus >= 40) return GLITCH_MODE;
  return NIGHTMARE_MODE;
}
```

### 2. Storage Service

Abstraction layer for LocalStorage operations.

**Interface:**

```typescript
interface StorageService {
  getUserName(): string | null;
  setUserName(name: string): void;
  getTodos(): Todo[];
  setTodos(todos: Todo[]): void;
  getUnsplashKey(): string | null;
  setUnsplashKey(key: string): void;
}
```

### 3. Background Manager Component

Handles background image fetching and fallback logic.

**State:**
```typescript
interface BackgroundState {
  imageUrl: string;
  isLoading: boolean;
  source: 'unsplash' | 'local';
}
```

**Logic Flow:**
1. Check for Unsplash API key in storage
2. If key exists, attempt Unsplash API call
3. On success, use Unsplash image
4. On failure or no key, randomly select from 5 local images
5. In Nightmare Mode, override with horror image

### 4. Todo List Component

**Interface:**

```typescript
interface Todo {
  id: string;
  text: string;
  createdAt: number;
}

interface TodoListProps {
  todos: Todo[];
  onAdd: (text: string) => void;
  onDelete: (id: string) => void;
}
```

### 5. Weather Component

**Interface:**

```typescript
interface WeatherData {
  temperature: number;
  icon: string;
  description: string;
}

interface WeatherState {
  data: WeatherData | null;
  isLoading: boolean;
  error: string | null;
}
```

### 6. Horror Overlay Component

Renders visual effects for Glitch and Nightmare modes.

**Props:**

```typescript
interface HorrorOverlayProps {
  mode: 'peaceful' | 'glitch' | 'nightmare';
  intensity: number; // 0-1 based on health degradation
}
```

**Effects:**
- Peaceful: No overlay
- Glitch: Scanline effects, occasional flicker
- Nightmare: Red vignette, pulsing effects

### 7. Dev Mode Toggle Component

**Interface:**

```typescript
interface DevModeToggleProps {
  healthStatus: number;
  onChange: (status: number) => void;
}
```

Renders as a slider (0-100) with visual indicators for mode thresholds.

## Data Models

### User Profile

```typescript
interface UserProfile {
  name: string;
  onboardingComplete: boolean;
}
```

### Application Settings

```typescript
interface AppSettings {
  unsplashApiKey: string | null;
  soundEnabled: boolean;
}
```

### Todo Item

```typescript
interface Todo {
  id: string; // UUID
  text: string;
  createdAt: number; // Unix timestamp
}
```

### Theme Configuration

```typescript
interface ThemeConfig {
  mode: 'peaceful' | 'glitch' | 'nightmare';
  cssVars: {
    '--font-primary': string;
    '--bg-filter': string;
    '--text-color': string;
    '--overlay-opacity': string;
    '--glitch-intensity': string;
  };
}
```

## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system—essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*

### Property 1: Name persistence round trip

*For any* valid user name string, storing it to LocalStorage and then retrieving it should return the identical name value.

**Validates: Requirements 1.2**

### Property 2: Todo list persistence round trip

*For any* list of todo items, storing the list to LocalStorage and then retrieving it should return an equivalent list with all items preserved.

**Validates: Requirements 4.4**

### Property 3: Mode threshold consistency

*For any* health status value, the resolved theme mode should be consistent: values 80-100 always resolve to Peaceful, 40-79 to Glitch, and 0-39 to Nightmare.

**Validates: Requirements 7.4, 7.5, 7.6**

### Property 4: Empty task rejection

*For any* string composed entirely of whitespace characters, attempting to add it as a todo should be rejected and the todo list should remain unchanged.

**Validates: Requirements 4.2**

### Property 5: Time-based greeting consistency

*For any* given hour of the day, the greeting message should consistently use the correct time-of-day prefix: "Good morning" for 5-11, "Good afternoon" for 12-17, "Good evening" for 18-4.

**Validates: Requirements 2.2, 2.3, 2.4**

### Property 6: Background fallback reliability

*For any* state where the Unsplash API fails or no API key exists, the background manager should always successfully display a local fallback image without errors.

**Validates: Requirements 5.2, 5.3**

### Property 7: Settings persistence round trip

*For any* valid Unsplash API key string, storing it via the settings modal and then retrieving it should return the identical key value.

**Validates: Requirements 6.3**

### Property 8: Theme transition data preservation

*For any* application state (todos, user name, time, weather), transitioning between theme modes should preserve all data without loss or corruption.

**Validates: Requirements 11.2, 11.3**

### Property 9: Nightmare mode greeting transformation

*For any* user name, when health status is between 0-39, the greeting should always follow the format "SYSTEM FAILURE... RUN {Name}..." with the user's name preserved.

**Validates: Requirements 10.3**

### Property 10: Mode boundary transitions

*For any* health status value at a mode boundary (80, 40, 39, 0), incrementing or decrementing by 1 should trigger the appropriate mode change exactly once.

**Validates: Requirements 7.3**

## Error Handling

### API Failures

**Unsplash API:**
- Network timeout: Fall back to local images
- Invalid API key: Fall back to local images
- Rate limit exceeded: Fall back to local images
- Log errors to console for debugging

**Weather API:**
- Geolocation denied: Display default weather state
- Network failure: Show "Weather unavailable" message
- Invalid response: Gracefully degrade to no weather display

### Storage Failures

**LocalStorage:**
- Quota exceeded: Alert user and prevent new todos
- Storage disabled: Warn user and use in-memory fallback
- Corrupted data: Clear and reinitialize with defaults

### Asset Loading

**Images:**
- Failed to load: Use solid color fallback
- Missing local assets: Use CSS gradient background

**Fonts:**
- Google Fonts unavailable: Fall back to system fonts
- Horror fonts not loaded: Use bold system font as fallback

**Audio:**
- Audio file missing: Disable sound effects
- Autoplay blocked: Provide manual play button

## Testing Strategy

### Unit Testing

**Framework:** Vitest (Vite's native test runner)

**Coverage Areas:**
- Storage service CRUD operations
- Mode resolution logic
- Time-based greeting calculation
- Todo list operations (add, delete)
- Background fallback logic
- Input validation (empty tasks, whitespace)

**Example Tests:**
- Test that empty strings are rejected from todo list
- Test that mode resolver returns correct mode for boundary values (80, 40, 39)
- Test that greeting changes based on mocked time values
- Test that storage service handles null/undefined gracefully

### Property-Based Testing

**Framework:** fast-check (JavaScript property-based testing library)

**Approach:**
- Generate random user names and verify storage round trips
- Generate random todo lists and verify persistence
- Generate random health status values and verify mode consistency
- Generate random timestamps and verify greeting logic
- Generate random whitespace strings and verify rejection

**Configuration:**
- Minimum 100 iterations per property test
- Use custom generators for domain-specific data (health status 0-100, valid todo text)

### Integration Testing

**Framework:** React Testing Library

**Coverage Areas:**
- Full user flow: onboarding → add todos → change theme
- Settings modal: open → enter API key → save → close
- Theme transitions: verify CSS classes update correctly
- Background loading: mock API responses and verify fallback

### End-to-End Testing

**Framework:** Playwright (optional for hackathon)

**Scenarios:**
- Complete onboarding flow
- Add and delete multiple todos
- Simulate health degradation through all modes
- Verify visual effects render correctly

## Performance Considerations

### Optimization Strategies

1. **Theme Transitions:**
   - Use CSS custom properties for instant updates
   - Leverage GPU-accelerated transforms for animations
   - Debounce health status updates if needed

2. **Image Loading:**
   - Preload local fallback images
   - Use lazy loading for horror assets
   - Implement image caching strategy

3. **LocalStorage:**
   - Debounce todo list writes (300ms)
   - Batch storage operations
   - Use JSON serialization efficiently

4. **Re-rendering:**
   - Memoize expensive components (Weather, Background)
   - Use React.memo for pure components
   - Optimize context to prevent unnecessary re-renders

### Bundle Size

- Code splitting for horror assets (fonts, images, sounds)
- Tree-shake unused Tailwind classes
- Lazy load settings modal
- Target < 500KB initial bundle

## Accessibility

- Provide reduced motion alternatives for glitch effects
- Ensure color contrast meets WCAG AA standards
- Add ARIA labels for icon buttons
- Support keyboard navigation for all interactive elements
- Provide option to disable horror sound effects

## Security Considerations

- Sanitize user input for name and todos (prevent XSS)
- Validate API keys before storage
- Use HTTPS for all external API calls
- Implement Content Security Policy headers
- No sensitive data stored in LocalStorage

## Deployment

**Build Process:**
```bash
npm run build
```

**Output:**
- Static files in `dist/` directory
- Can be hosted on any static file server
- Compatible with GitHub Pages, Netlify, Vercel

**Environment Variables:**
- No build-time secrets required
- API keys provided by users at runtime

## Future Enhancements

- Real AWS Health Dashboard integration
- Multiple theme presets (different horror styles)
- Customizable todo categories
- Export/import settings and todos
- Progressive Web App (PWA) support
- Multi-language support
