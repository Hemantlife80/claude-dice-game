# 3D Dice Game

A professional multiplayer dice rolling game built with React, TypeScript, Three.js, and Tailwind CSS.

## Features

- 🎲 Realistic 3D dice with smooth rolling animations
- 👥 Support for 1-4 players
- 🎯 Customizable target scores (30, 50, 75, 100)
- 🔊 Sound effects and voice announcements
- 🎉 Celebration animations when a player wins
- 📊 Real-time scoreboard and roll history
- 🎨 Beautiful wooden dice table aesthetic

## Installation

1. Extract the project files to a directory
2. Install dependencies:
```bash
npm install
```

## Running the Game

Start the development server:
```bash
npm run dev
```

The game will open in your browser at `http://localhost:5173`

## Building for Production

To create a production build:
```bash
npm run build
```

To preview the production build:
```bash
npm run preview
```

## How to Play

1. **Setup**: Choose the number of players, enter player names, and select a target score
2. **Gameplay**: Players take turns rolling the dice by clicking the "Roll Dice" button
3. **Scoring**: The dice value is added to the current player's score
4. **Winning**: The first player to reach or exceed the target score wins!

## Tech Stack

- **React 18** - UI framework
- **TypeScript** - Type safety
- **Vite** - Build tool and dev server
- **Three.js** - 3D graphics
- **Tailwind CSS** - Styling
- **Lucide React** - Icons

## Project Structure

```
dice-game/
├── src/
│   ├── App.tsx           # Main game component
│   ├── main.tsx          # Entry point
│   └── index.css         # Global styles with Tailwind
├── public/               # Static assets
├── index.html            # HTML template
├── package.json          # Dependencies
├── tsconfig.json         # TypeScript config
├── vite.config.ts        # Vite config
├── tailwind.config.js    # Tailwind config
└── postcss.config.js     # PostCSS config
```

## License

MIT