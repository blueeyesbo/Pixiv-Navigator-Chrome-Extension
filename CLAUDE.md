# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a Chrome extension for batch opening Pixiv web pages with four modes:
1. Artwork ID mode
2. User ID mode
3. Manga ID mode
4. Keyword search mode

The extension extracts IDs from text input and generates corresponding URLs for Pixiv navigation.

## Key Architecture

- `manifest.json` - Chrome extension configuration
- `popup.html` - Main UI interface
- `popup.js` - Core logic for ID extraction, URL generation, and tab management
- `popup.css` - Modern UI styling with animations
- `demourl.txt` - Sample URLs for each mode

## Development Commands

To test the extension:
1. Open Chrome and navigate to `chrome://extensions/`
2. Enable "Developer mode"
3. Click "Load unpacked" and select this project directory
4. Test functionality by clicking the extension icon

## Core Features

- Intelligent ID extraction using regex pattern `\b\d{6,12}\b`
- History persistence using chrome.storage.session (last 10 records)
- Smooth animations and modern UI design
- Single URL click-to-open (removed batch open button per requirements)
- Responsive design with consistent styling

## Code Structure

The main logic flow:
1. User inputs text and selects mode
2. `extractIds()` parses input using regex
3. `generateUrls()` creates Pixiv URLs based on mode
4. URLs displayed in UI with click handlers
5. History saved/loaded using Chrome Storage API
6. Single URL opening via `chrome.tabs.create()`

## Design Principles

- Minimalist design with consistent color scheme (#4a90e2 primary blue)
- Smooth animations (fade-in, slide-in effects)
- Clean typography using system fonts
- Responsive UI components with proper spacing
- SVG icons for visual enhancement