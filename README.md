# Das Gleichgewichtsspiel – Pro Edition 🎮
**Made by Higer**

## Quick Start
1. Serve the project (don't open index.html directly — ES modules need a server):

   ```bash
   cd Gleichgewichtsspiel_Pro
   python3 -m http.server 8080
   # Then open http://localhost:8080
   ```

2. Or use VS Code Live Server extension.

## Features
- 🎫 Visual Ticket Stack with SVG animations
- 📊 Statistics Dashboard (Chart.js)
- 🌍 i18n: DE / EN / TR
- 🎓 Teacher Mode (type "lehrer" to unlock)
- 🔊 Web Audio API synthesized sounds
- 📱 PWA: installable on mobile (offline support)
- 🚀 60fps animations via requestAnimationFrame
- 🛡️ Global error boundary / crash screen

## Teacher Mode
Type the word **lehrer** anywhere in the app to reveal the teacher panel.
Configure: number ranges, time limits, cheat sheet, locked levels.

## File Structure
```
Gleichgewichtsspiel_Pro/
├── index.html          # Main HTML (tabs, modals, teacher mode)
├── manifest.json       # PWA manifest
├── sw.js               # Service Worker (offline)
├── css/
│   └── styles.css      # All styles
├── js/
│   ├── app.js          # Main orchestrator
│   ├── gameLogic.js    # Pure game logic (no DOM)
│   ├── ui.js           # 60fps UI / animations
│   ├── storage.js      # localStorage layer
│   ├── i18n.js         # Internationalization
│   ├── audio.js        # Web Audio API synth
│   └── stats.js        # Analytics & Chart.js
└── icons/
    ├── icon-192.svg
    └── icon-512.svg
```

## License
MIT © 2025 Higer
