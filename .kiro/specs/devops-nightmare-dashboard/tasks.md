# Implementation Plan

- [x] 1. Set up project structure and dependencies





  - Initialize Vite + React + TypeScript project
  - Install dependencies: Tailwind CSS, Lucide-React, fast-check, Vitest, React Testing Library
  - Configure Tailwind with custom theme extensions for horror modes
  - Set up Vitest configuration for unit and property-based testing
  - Create directory structure: `/src/components`, `/src/services`, `/src/contexts`, `/src/types`, `/src/assets`
  - _Requirements: 12.1, 12.2, 12.3_

- [x] 2. Implement Storage Service





  - Create `StorageService` class with methods for name, todos, and API key
  - Implement error handling for quota exceeded and disabled storage
  - Add JSON serialization/deserialization with validation
  - _Requirements: 1.2, 4.4, 6.3_

- [x] 2.1 Write property test for Storage Service






  - **Property 1: Name persistence round trip**
  - **Validates: Requirements 1.2**

- [x] 2.2 Write property test for Storage Service






  - **Property 7: Settings persistence round trip**
  - **Validates: Requirements 6.3**

- [x] 3. Create Theme Manager Context





  - Implement `ThemeContext` with health status state (0-100)
  - Create mode resolution function with threshold logic (80, 40, 0)
  - Define theme configurations for Peaceful, Glitch, and Nightmare modes
  - Set up CSS custom properties management
  - _Requirements: 7.2, 7.3, 7.4, 7.5, 7.6_

- [x] 3.1 Write property test for Theme Manager






  - **Property 3: Mode threshold consistency**
  - **Validates: Requirements 7.4, 7.5, 7.6**

- [x] 3.2 Write property test for Theme Manager






  - **Property 10: Mode boundary transitions**
  - **Validates: Requirements 7.3**

- [x] 4. Build Onboarding Modal Component




  - Create modal UI with name input field
  - Implement first-load detection using storage check
  - Add form validation to prevent empty name submission
  - Save name to LocalStorage on submit
  - _Requirements: 1.1, 1.2, 1.3, 1.4_

- [x] 5. Implement Greeting Component




  - Create greeting display component that consumes theme context
  - Implement time-based greeting logic (morning/afternoon/evening)
  - Add Peaceful Mode greeting format: "Good [time], {Name}"
  - Add Nightmare Mode greeting format: "SYSTEM FAILURE... RUN {Name}..."
  - Apply theme-based styling from context
  - _Requirements: 2.1, 2.2, 2.3, 2.4, 10.3_

- [ ]* 5.1 Write property test for Greeting Component
  - **Property 5: Time-based greeting consistency**
  - **Validates: Requirements 2.2, 2.3, 2.4**

- [ ]* 5.2 Write property test for Greeting Component
  - **Property 9: Nightmare mode greeting transformation**
  - **Validates: Requirements 10.3**

- [x] 6. Build Clock Component





  - Create digital clock display (HH:MM format)
  - Implement real-time updates using setInterval
  - Apply glitch animations in Glitch Mode using CSS classes
  - Ensure proper cleanup on unmount
  - _Requirements: 2.5, 9.3_

- [x] 7. Implement Todo List Component





  - Create todo list UI with input field and task list
  - Implement add todo functionality with whitespace validation
  - Implement delete todo functionality
  - Load todos from LocalStorage on mount
  - Persist todos to LocalStorage on changes (with debouncing)
  - Apply glitch animations in Glitch Mode
  - _Requirements: 4.1, 4.2, 4.3, 4.4, 4.5, 9.4_

- [x] 7.1 Write property test for Todo List






  - **Property 4: Empty task rejection**
  - **Validates: Requirements 4.2**

- [x] 7.2 Write property test for Todo List






  - **Property 2: Todo list persistence round trip**
  - **Validates: Requirements 4.4**

- [x] 8. Create Background Manager Component





  - Implement Unsplash API integration with error handling
  - Create fallback logic to randomly select from 5 local images
  - Add loading states and error handling
  - Override background with horror image in Nightmare Mode
  - Preload local fallback images for performance
  - _Requirements: 5.1, 5.2, 5.3, 5.4, 10.2_

- [x] 8.1 Write property test for Background Manager






  - **Property 6: Background fallback reliability**
  - **Validates: Requirements 5.2, 5.3**

- [x] 9. Build Weather Component





  - Request user geolocation on mount
  - Fetch weather data from OpenWeatherMap API
  - Display weather icon and temperature
  - Handle geolocation denial with default state
  - Handle API failures gracefully
  - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5_

- [x] 10. Implement Settings Modal Component





  - Create modal UI with gear icon trigger
  - Add input field for Unsplash API key
  - Load existing API key from storage
  - Save API key to LocalStorage on submit
  - Trigger background refresh after saving new key
  - _Requirements: 5.5, 6.1, 6.2, 6.3, 6.4, 6.5_

- [x] 11. Create Horror Overlay Component





  - Implement conditional rendering based on mode
  - Add scanline effects and flicker for Glitch Mode
  - Add red vignette and pulsing effects for Nightmare Mode
  - Use CSS for GPU-accelerated animations
  - Ensure overlay doesn't block user interactions
  - _Requirements: 9.1, 9.2, 10.4_

- [x] 12. Build Dev Mode Toggle Component





  - Create slider UI (0-100 range)
  - Add visual indicators for mode thresholds (80, 40)
  - Connect to Theme Context's setHealthStatus
  - Display current health status value
  - _Requirements: 7.1, 7.2_

- [x] 13. Implement Audio Manager Component





  - Load horror sound effects (siren/heartbeat)
  - Play sounds conditionally in Nightmare Mode
  - Handle autoplay blocking with manual play option
  - Add mute/unmute toggle
  - Implement graceful fallback if audio files missing
  - _Requirements: 10.5_

- [x] 14. Assemble Dashboard Layout





  - Create main Dashboard component structure
  - Integrate all child components (Header, MainContent, Modals)
  - Apply theme-based CSS classes from context
  - Implement smooth CSS transitions for mode changes
  - Ensure responsive layout with Tailwind
  - _Requirements: 11.1, 11.4_

- [x] 14.1 Write property test for Dashboard






  - **Property 8: Theme transition data preservation**
  - **Validates: Requirements 11.2, 11.3**

- [x] 15. Add theme-specific styling and assets





  - Import Google Fonts (Roboto, Creepster, Nosifer)
  - Add 5 local fallback landscape images to `/assets/defaults`
  - Add horror-themed background image for Nightmare Mode
  - Create Tailwind utility classes for glitch effects
  - Implement CSS custom properties for theme transitions
  - Add font fallback configurations
  - _Requirements: 8.1, 8.2, 8.3, 8.4, 9.1, 9.2, 10.1, 10.2_

- [x] 16. Write integration tests






  - Test complete onboarding flow
  - Test settings modal open/save/close flow
  - Test theme transitions with mode changes
  - Test background loading with mocked API responses

- [x] 17. Checkpoint - Ensure all tests pass





  - Ensure all tests pass, ask the user if questions arise.

- [x] 18. Performance optimization





  - Implement React.memo for Weather and Background components
  - Add debouncing to todo list storage writes (300ms)
  - Lazy load Settings Modal
  - Code split horror assets (fonts, images, sounds)
  - Optimize Tailwind bundle with PurgeCSS
  - _Requirements: Performance Considerations_

- [x] 19. Accessibility improvements





  - Add ARIA labels to icon buttons
  - Implement keyboard navigation for all interactive elements
  - Add reduced motion media query for glitch effects
  - Ensure WCAG AA color contrast standards
  - Add option to disable sound effects
  - _Requirements: Accessibility_

- [x] 20. Security hardening





  - Sanitize user input for name and todos (XSS prevention)
  - Validate API keys before storage
  - Add Content Security Policy headers
  - Ensure all API calls use HTTPS
  - _Requirements: Security Considerations_

- [ ] 21. Implement Pomodoro Timer Feature



  - Create `usePomodoro` custom hook for timer logic
  - Implement timer state management (start, pause, resume, reset, skip)
  - Add LocalStorage persistence for timer state and config
  - Implement recovery logic for page refreshes
  - _Requirements: Pomodoro Timer Feature_

- [x] 21.1 Create Pomodoro Configuration Modal


  - Build modal UI with work/break duration inputs
  - Add auto-repeat checkbox
  - Implement form validation (1-60 min work, 1-30 min break)
  - Save configuration to LocalStorage
  - _Requirements: Pomodoro Timer Feature_

- [x] 21.2 Enhance Clock Component with Timer Display


  - Add conditional rendering for countdown vs current time
  - Implement SVG Circular Progress Ring component
  - Add timer label that changes based on phase and mode
  - Integrate usePomodoro hook into Clock component
  - _Requirements: Pomodoro Timer Feature_

- [x] 21.3 Implement Circular Progress Ring


  - Create SVG circle with stroke-dasharray animation
  - Add theme-based styling (green/yellow/red)
  - Implement dripping effect for Nightmare Mode using SVG filters
  - Add smooth progress animation
  - _Requirements: Pomodoro Timer Feature_

- [x] 21.4 Add Pomodoro Timer Button to Toolbar


  - Create tomato/timer icon button
  - Position in bottom right toolbar (near settings)
  - Add state-based color changes (idle/active/break)
  - Connect to configuration modal
  - _Requirements: Pomodoro Timer Feature_

- [x] 21.5 Integrate Pomodoro Audio Effects


  - Add ticking sound for Nightmare Mode
  - Implement speed-up effect for last 60 seconds
  - Add phase completion alarm sounds (peaceful/nightmare variants)
  - Respect global mute setting
  - Handle audio autoplay restrictions
  - _Requirements: Pomodoro Timer Feature_

- [x] 21.6 Write property test for Pomodoro Timer






  - **Property 11: Timer countdown accuracy**
  - **Validates: Pomodoro Timer accuracy**

- [x] 21.7 Write property test for Pomodoro Timer






  - **Property 12: Timer persistence round trip**
  - **Validates: Timer persistence across page reloads**

- [x] 21.8 Write property test for Pomodoro Timer






  - **Property 13: Phase transition consistency**
  - **Validates: Phase transition logic**

- [x] 21.9 Write unit tests for Pomodoro Timer






  - Test timer start/pause/resume/reset functionality
  - Test phase transitions (work → break → work)
  - Test auto-repeat behavior
  - Test LocalStorage persistence and recovery
  - Test audio playback in different modes

- [x] 22. Final polish and testing





  - Test all three modes (Peaceful, Glitch, Nightmare)
  - Verify smooth transitions between modes
  - Test error handling for all API failures
  - Verify LocalStorage fallbacks work correctly
  - Test Pomodoro Timer in all theme modes
  - Test on multiple browsers (Chrome, Firefox, Safari)
  - _Requirements: All_
