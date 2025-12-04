# Favicon Setup Instructions

Place your favicon files in this `public/` directory with the following names:

## Required Files

1. **favicon.ico** (16x16 or 32x32 pixels)
   - Classic favicon format
   - Supported by all browsers
   - Can be multi-resolution (16x16, 32x32, 48x48)

2. **favicon.svg** (any size, vector)
   - Modern SVG favicon
   - Scales perfectly at any size
   - Supported by modern browsers
   - Optional but recommended

3. **apple-touch-icon.png** (180x180 pixels)
   - Used when users add your site to iOS home screen
   - Should be 180x180 pixels
   - PNG format

4. **favicon-32x32.png** (32x32 pixels)
   - Standard size for most browsers
   - PNG format

5. **favicon-16x16.png** (16x16 pixels)
   - Small size for browser tabs
   - PNG format

## How to Generate Favicons

### Option 1: Online Generator
Use a favicon generator like:
- https://realfavicongenerator.net/
- https://favicon.io/
- https://www.favicon-generator.org/

Upload your logo/image and it will generate all required sizes.

### Option 2: Manual Creation
1. Create a square image (512x512 or 1024x1024)
2. Use an image editor (Photoshop, GIMP, Figma, etc.)
3. Export to different sizes:
   - 180x180 for apple-touch-icon.png
   - 32x32 for favicon-32x32.png
   - 16x16 for favicon-16x16.png
4. Convert to .ico format for favicon.ico
5. Create SVG version if possible

## Design Tips

- Use simple, recognizable shapes
- Ensure it looks good at small sizes (16x16)
- Use high contrast colors
- Consider the horror/tech theme of the dashboard
- Test on both light and dark browser themes

## Current Setup

The `index.html` file is already configured to use these favicons:

```html
<link rel="icon" type="image/x-icon" href="/favicon.ico" />
<link rel="icon" type="image/svg+xml" href="/favicon.svg" />
<link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />
<link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png" />
<link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png" />
```

Just add your favicon files to this directory and they'll work automatically!
