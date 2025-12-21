# SubMap

**Visualize how much time you work to pay for your subscriptions.**

A sleek, retro-themed web app that helps you understand the true cost of your subscriptions by showing them as a proportional treemap visualization and calculating how many hours/days you work to afford them.

![SubMap Preview](https://via.placeholder.com/800x450?text=SubMap+Preview)

## ✨ Features

- **Visual Treemap** - See all your subscriptions at a glance with proportionally sized tiles
- **Work Time Calculator** - Enter your hourly/daily/weekly/monthly income to see how long you work to pay for subscriptions
- **Quick Search & Add** - Type to search from 45+ popular presets or add custom subscriptions
- **Inline Editing** - Click on any price to edit it directly
- **Real-time Updates** - Everything updates instantly as you add/remove/edit
- **Dark & Light Themes** - Toggle between retro neon dark mode and a clean light mode
- **Retro Sound Effects** - Subtle 8-bit sounds for interactions
- **Local Storage** - Your data stays in your browser, no account needed

## 🚀 Quick Start

1. Clone or download this repository
2. Open `index.html` in any modern browser
3. Start adding your subscriptions!

No build tools, no dependencies to install, no server required.

## 🎮 How to Use

1. **Add Subscriptions**
   - Click the search bar or start typing
   - Press Enter or click to add a preset
   - For custom subscriptions, type the name and select "Add manually"

2. **Enter Your Income**
   - Input your income in the bottom-left panel
   - Choose the unit (hourly, daily, weekly, monthly)
   - Watch the "Work Time/yr" update to show your yearly time cost

3. **Manage Subscriptions**
   - Click on any price to edit it inline
   - Hover and click the X to remove a subscription
   - Use "clear" to remove all subscriptions

4. **Toggle Theme**
   - Click the theme button in the top-right corner

## 🎨 Tech Stack

- **Vanilla JavaScript** - No frameworks, just clean JS
- **Tailwind CSS** - Utility-first styling via CDN
- **Iconify** - Beautiful icons
- **Web Audio API** - Retro sound effects
- **LocalStorage** - Persistent data storage

## 📁 Project Structure

```
├── index.html          # Main HTML file
├── styles.css          # Custom styles & theme
├── js/
│   ├── app.js          # Main application logic
│   ├── presets.js      # Subscription presets data
│   ├── storage.js      # LocalStorage handling
│   ├── treemap.js      # Squarified treemap algorithm
│   ├── modals.js       # Modal handling
│   └── sounds.js       # Retro sound effects
└── README.md
```

## 🔧 Customization

### Adding More Presets
Edit `js/presets.js` to add more subscription presets:

```javascript
{ 
  name: "Service Name", 
  domain: "example.com", 
  price: 9.99, 
  cycle: "Monthly", 
  color: "cyan", 
  category: "Category" 
}
```

### Adjusting Sound Volume
Edit `MASTER_VOLUME` in `js/sounds.js` (0.0 to 1.0).

## 📝 License

MIT License - feel free to use this project however you like!

---

Made with ☕ and 🎮
