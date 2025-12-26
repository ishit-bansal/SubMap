# SubMap

**Visualize how much time you work to pay for your subscriptions.**

A sleek, retro-themed web app that helps you understand the true cost of your subscriptions by showing them as a proportional treemap visualization and calculating how many hours/days you work to afford them.

**[Live Site](https://sub-map.vercel.app)**

## Features

- **Visual Treemap** - See all your subscriptions at a glance with proportionally sized tiles
- **Work Time Calculator** - Enter your hourly/daily/weekly/monthly income to see how long you work to pay for subscriptions
- **Quick Search & Add** - Type to search from 45+ popular presets or add custom subscriptions
- **Inline Editing** - Click on any price to edit it directly
- **Real-time Updates** - Everything updates instantly as you add/remove/edit
- **Dark & Light Themes** - Toggle between retro neon dark mode and a clean light mode
- **Retro Sound Effects** - Subtle 8-bit sounds for interactions
- **Local Storage** - Your data stays in your browser, no account needed

## Quick Start

1. Clone or download the repository  
2. Run a local server:
   ```bash
   npx serve .
3. Start adding your subscriptions!

## Tech Stack

- **Vanilla JavaScript** - No frameworks, just clean JS
- **Tailwind CSS** - Utility-first styling via CDN
- **Iconify** - Beautiful icons
- **Web Audio API** - Retro sound effects
- **LocalStorage** - Persistent data storage

## Project Structure

```
┌── assets              # Favicon Images
├── js/
│   ├── app.js          # Main application logic
│   ├── presets.js      # Subscription presets data
│   ├── storage.js      # LocalStorage handling
│   ├── treemap.js      # Squarified treemap algorithm
│   ├── modals.js       # Modal handling
│   └── sounds.js       # Retro sound effects
├── index.html          # Main HTML file
├── README.md
└── styles.css          # Custom styles & theme
```

## License

MIT License - feel free to use this project however you like!