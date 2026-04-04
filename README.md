<div align="center">

```
██████╗   ██╗  ███╗   ██╗   ██████╗    ██████╗ 
██╔══██╗  ██║  ████╗  ██║  ██╔════╝   ██╔═══██╗
██████╔╝  ██║  ██╔██╗ ██║  ██║  ███╗  ██║   ██║
██╔══██ ╗ ██║  ██║╚██╗██║  ██║   ██║  ██║   ██║
██████╔╝  ██║  ██║ ╚████║  ╚██████╔╝  ╚██████╔╝
╚═════╝   ╚═╝  ╚═╝  ╚═══╝  ╚═════╝    ╚═════╝ 
```

# 🎰 BINGO — Premium Web Game dev

**A fully responsive, animated 5×5 Bingo game where you challenge an AI bot.**  
*Crafted with pure HTML · CSS · Vanilla JavaScript*

---

[![Made By](https://img.shields.io/badge/made%20by-Aryan%20Surya%20S-blueviolet?style=for-the-badge&logo=github)](https://github.com/)
[![Tech Stack](https://img.shields.io/badge/stack-HTML%20·%20CSS%20·%20JS-cyan?style=for-the-badge&logo=html5)](.)
[![License](https://img.shields.io/badge/license-MIT-green?style=for-the-badge)](LICENSE)
[![Status](https://img.shields.io/badge/status-Live%20%26%20Playable-brightgreen?style=for-the-badge&logo=checkmarx)](.)
[![Vibes](https://img.shields.io/badge/vibes-Immaculate-gold?style=for-the-badge&logo=sparkles)](.)

---

<img src="https://readme-typing-svg.herokuapp.com?font=Space+Mono&size=18&duration=3000&pause=800&color=00E5FF&center=true&vCenter=true&multiline=true&width=600&height=80&lines=Pick+a+number.+Mark+your+board.+Win+5+lines.;The+bot+is+always+watching.+👁️" alt="Typing SVG" />

</div>

---

## ✨ What Is This?

> **BINGO** is a premium single-page browser game — no installs, no frameworks, no dependencies. Just open `index.html` and play.

You and an AI bot each receive a **randomized 5×5 board** filled with numbers 1–25. Numbers are called by turns — yours when you click, the bot's when it "thinks." Any number called gets **marked on both boards simultaneously**. First to complete **5 full lines** (rows, columns, or diagonals) wins.

---

## 🎮 How to Play

```
1. Open index.html in any modern browser
2. Your board is on the LEFT — click any number to call it
3. That number is marked on BOTH boards instantly
4. Wait 1–2 seconds → the Bot makes its move
5. First to complete 5 lines → BINGO! 🎉
```

### 🏆 Win Condition

| Lines Completed | Status |
|:-:|:-:|
| 0 – 4 | Keep going… |
| **5** | **🎉 BINGO! Game Over!** |

Lines can be:

```
→ Horizontal   ████████████
↓ Vertical     █
               █
               █
↘ Diagonal     █
                █
                 █
```

---

## 🚀 Features

| Feature | Detail |
|---|---|
| 🎲 **Randomized Boards** | Every game generates a unique 1–25 layout for both players |
| 🤝 **Shared Marking** | A number called by either player marks on both boards |
| 🤖 **Smart Bot AI** | Weighted strategy: bot prefers numbers that complete near-done lines |
| ⏱️ **Thinking Delay** | Bot waits 1–2 seconds to simulate decision-making |
| ✅ **Win Detection** | Checks all 12 lines (5 rows + 5 cols + 2 diags) after every move |
| 🌟 **Bingo Tracker** | B·I·N·G·O letters light up gold as you complete each line |
| 📜 **Call History** | Side panel logs every number called, color-coded by who called it |
| 🎆 **Win Animation** | Fireworks, modal, and glow effects on game end |
| 🔄 **Instant Restart** | One click to reset everything and play again |
| 📱 **Fully Responsive** | Works beautifully on desktop, tablet, and mobile |

---

## 🎨 Design System

```
┌─────────────────────────────────────┐
│  VISUAL PHILOSOPHY                  │
│  ─────────────────────────────────  │
│  Dark radial cosmos background      │
│  Glassmorphism board panels         │
│  Cyan (#00E5FF)  → Player accent    │
│  Pink (#FF4081)  → Bot accent       │
│  Gold (#FFD600)  → Bingo / Win      │
│  Purple (#B47CFF)→ Atmosphere       │
│  Green (#69FF47) → Secondary pop    │
└─────────────────────────────────────┘
```

### 🔤 Typography

| Role | Font |
|---|---|
| Logo & Titles | **Bebas Neue** — bold, condensed, cinematic |
| Numbers & Data | **Space Mono** — monospaced, technical precision |
| UI Labels | **Syne** — modern, geometric, readable |

### 💎 Effects Used

- **Glassmorphism** — `backdrop-filter: blur()` on all panels and modals
- **Layered orbs** — radial gradient blobs that drift across the background
- **Grid overlay** — subtle geometric mesh for depth and texture
- **Cell animations** — staggered entrance, scale-bounce on mark, ripple on click
- **Bingo line flash** — gold glow animation sweeps complete lines
- **Fireworks** — floating burst particles on the victory modal
- **Typing indicator** — animated dots while the bot "thinks"

---

## 📁 Project Structure

```
bingo/
│
├── 📄 index.html        ← Game layout & DOM structure
│   ├── Header with animated B·I·N·G·O logo
│   ├── Turn indicator badge
│   ├── Player board section (left)
│   ├── VS divider + called numbers panel
│   ├── Bot board section (right)
│   ├── Game Over modal with fireworks
│   └── Bot thinking indicator (slide-up toast)
│
├── 🎨 styles.css        ← All styling, animations, responsive rules
│   ├── CSS custom properties (design tokens)
│   ├── Background layer (orbs + grid)
│   ├── Header & logo keyframes
│   ├── Glass board panels
│   ├── Cell states: default / hover / marked-player / marked-bot / bingo-line
│   ├── Bingo tracker letters
│   ├── Called numbers chips
│   ├── Modal overlay & fireworks
│   ├── Bot thinking toast
│   └── Media queries (860px, 480px)
│
└── ⚙️  script.js         ← All game logic
    ├── State management
    ├── Board generation (Fisher-Yates shuffle)
    ├── Win detection (all 12 lines)
    ├── Bot AI (weighted line-completion scoring)
    ├── Marking & call log
    ├── UI rendering & cell click handling
    └── Game restart
```

---

## 🧠 Bot AI — How It Thinks

The bot isn't random. It uses a **weighted scoring strategy**:

```javascript
// For each available number, score it by how many
// near-complete lines it belongs to on the bot's board:

score += alreadyMarked² // quadratic reward for nearly-done lines

// Plus a touch of randomness to keep it beatable:
score += Math.random() * 1.5
```

This means the bot:
- **Aggressively closes** lines that are 3–4 deep
- **Occasionally surprises** you with unexpected picks
- **Is beatable** — strategy and luck both matter

---

## ⚙️ Technical Highlights

```
No frameworks. No build tools. No node_modules.
One folder. Three files. Open and play.
```

| Aspect | Implementation |
|---|---|
| **State** | Plain JS variables + `Set` for O(1) mark lookups |
| **Rendering** | DOM rebuilt on each mark with animation classes |
| **Win check** | 12-line scan after every move (rows + cols + diags) |
| **Animations** | CSS keyframes only — zero JS animation libraries |
| **Fonts** | Google Fonts via CDN (Bebas Neue, Space Mono, Syne) |
| **Responsive** | CSS Grid + clamp() for fluid cell sizing |

---

## 🖥️ Browser Compatibility

| Browser | Support |
|---|---|
| ✅ Chrome 88+ | Full support |
| ✅ Firefox 85+ | Full support |
| ✅ Safari 14+ | Full support |
| ✅ Edge 88+ | Full support |
| ⚠️ IE | Not supported |

> Requires `backdrop-filter` support for glassmorphism effects. All modern browsers qualify.

---

## 📸 Screens at a Glance

```
┌────────────────────────────────────────────────────────┐
│  🧑‍💻 YOU  B I N G O        VS       B I N G O  🤖 BOT │
│  ┌──────────────┐  [ CALLED ]  ┌──────────────┐       │
│  │  3  17  8  ║ │  12 ● player │  5  21  3  ║ │       │
│  │ 24  1 [12] ║ │   7 ● bot    │  8 [12] 19 ║ │       │
│  │ 11  6  20  ║ │              │  2   6  14 ║ │       │
│  │ ██ 15  9   ║ │              │ 25  15  ██ ║ │       │
│  │ 13 22  4   ║ │              │  1  22   4 ║ │       │
│  └──────────────┘              └──────────────┘       │
└────────────────────────────────────────────────────────┘
```

---

## 🛠️ Local Setup

No setup needed. Seriously.

```bash
# Option 1 — Double click
open index.html

# Option 2 — VS Code Live Server
code . && open with Live Server

# Option 3 — Python quick server
python3 -m http.server 8080
# then visit http://localhost:8080
```

---

## 🗺️ Roadmap / Ideas

- [ ] 🔊 Sound effects (pick, mark, bingo fanfare)
- [ ] 🎯 Difficulty levels (Easy / Medium / Hard bot)
- [ ] 🌐 Multiplayer via WebSockets
- [ ] 📊 Win/loss stats tracker (localStorage)
- [ ] 🎨 Custom themes (neon, retro, pastel)
- [ ] 📱 PWA support (install to homescreen)

---

## 👤 Author

<div align="center">

**Aryan Surya S**

*Frontend Craftsperson · Game Developer · Design Enthusiast*

[![GitHub](https://img.shields.io/badge/GitHub-@AryanSuryaS-181717?style=for-the-badge&logo=github)](https://github.com/)
[![Portfolio](https://img.shields.io/badge/Portfolio-Visit-00E5FF?style=for-the-badge&logo=vercel)](.)

</div>

---
ss bw
## 📜 License

```
MIT License — Use it, fork it, ship it. 
Just give credit where it's due. ✌️
```

---

s
