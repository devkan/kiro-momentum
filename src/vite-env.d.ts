/// <reference types="vite/client" />

// Declare module types for image imports
declare module '*.jpg' {
  const src: string;
  export default src;
}

declare module '*.jpeg' {
  const src: string;
  export default src;
}

declare module '*.png' {
  const src: string;
  export default src;
}

declare module '*.svg' {
  const src: string;
  export default src;
}

declare module '*.gif' {
  const src: string;
  export default src;
}

declare module '*.webp' {
  const src: string;
  export default src;
}

// Extend ImportMeta for Vite environment variables
interface ImportMetaEnv {
  readonly VITE_OPENWEATHER_API_KEY?: string;
  readonly VITE_UNSPLASH_API_KEY?: string;
  // Add other env variables as needed
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
