# WordPress Integration for Cheap Alarms React App

## Setup Instructions

### 1. Build the React App
First, make sure you've built the production version of the React app:

```bash
npm run build
```

This will create the `dist` folder with the compiled assets and the `manifest.json` file.

### 2. Copy Files to WordPress Theme

Copy the entire `dist` folder to your WordPress theme directory and rename it to `react-app`:

```
your-theme/
├── functions.php
├── react-app/           # <- This is your dist folder renamed
│   ├── .vite/
│   │   └── manifest.json
│   ├── assets/
│   │   ├── main-[hash].css
│   │   ├── main-[hash].js
│   │   └── ghl-api-[hash].js
│   └── vite.svg
```

### 3. Add Functions to WordPress

Add the code from `wordpress-functions.php` to your theme's `functions.php` file.

### 4. Use the Shortcode

Add the alarm configurator to any page or post using the shortcode:

```
[cheap_alarm_app]
```

## File Structure

- **Entry Point**: `src/main.jsx` - Main React application
- **API Module**: `src/lib/ghl-api.js` - GoHighLevel API integration (dynamically loaded)
- **Manifest**: `.vite/manifest.json` - Asset mapping for WordPress

## Environment Variables

Make sure your WordPress site has the necessary environment variables configured for the GoHighLevel API integration.

## Troubleshooting

1. **"React app not built yet"** - Run `npm run build` and copy the dist folder
2. **"Entry not found in manifest"** - Check that the manifest.json file exists and contains the correct entry
3. **Assets not loading** - Verify the react-app folder path in your theme directory
4. **API errors** - Check browser console for GoHighLevel API configuration issues

## Development Workflow

1. Make changes to React app
2. Run `npm run build`
3. Copy updated `dist` folder to WordPress theme as `react-app`
4. Test on WordPress site

For development, you can also run `npm run dev` and use the development server, but for production WordPress integration, always use the built assets.