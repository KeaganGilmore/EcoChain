# 🌿 EcoChain

An interactive browser game that teaches ecosystem cause-and-effect by letting players balance energy, species, and resources in a living natural system.

## 🎮 Play Now

[Play EcoChain](https://keagangilmore.github.io/EcoChain/) - No login required, just click and play!

## 📖 About

EcoChain is an educational browser game that teaches natural science concepts through interactive gameplay rather than text. Players manage a simple ecosystem with three species:

- 🌱 **Plants** - Producers that grow through photosynthesis
- 🐰 **Rabbits** - Herbivores that eat plants
- 🦊 **Foxes** - Predators that hunt rabbits

### Learning Objectives

- **Energy Transfer**: Understand how energy flows through food chains (Sun → Plants → Rabbits → Foxes)
- **Ecosystem Balance**: Learn how populations affect each other in cause-and-effect relationships
- **Resource Management**: Discover what happens when species have too much or too little food
- **Natural Selection**: See how populations grow and decline based on available resources

## 🎯 How to Play

1. **Goal**: Keep all three species alive for 10 rounds
2. **Each Round**: Choose one action:
   - Plant Seeds (adds more plants)
   - Release Rabbits (adds more rabbits)
   - Release Foxes (adds more foxes)
   - Observe (let nature balance itself)
3. **Watch**: See the cause-and-effect as your ecosystem responds
4. **Learn**: Understand how each species depends on the others

### Gameplay Mechanics

- Plants grow naturally each round through photosynthesis
- Rabbits eat plants; they reproduce when well-fed, starve when plants are scarce
- Foxes hunt rabbits; they reproduce when prey is abundant, starve when rabbits are scarce
- If any species goes extinct, the ecosystem collapses!

## 🔧 Technical Details

### Technologies Used

- Pure HTML5, CSS3, and JavaScript (no frameworks)
- Responsive design works on desktop and mobile
- LX Library telemetry integration for analytics

### LX Library Telemetry

The game includes telemetry tracking with a unique UUID generated per page load:

- **Session ID**: Stored in `<meta name="lx-page-session">`
- **Events Tracked**:
  - `page_load` - When the game loads
  - `start` - When a new game begins
  - `choice` - When the player makes a decision
  - `outcome` - After each round processes
  - `completion` - When the game ends (win or loss)

All events include the session UUID, timestamp, and relevant game data.

### Deployment

The game is deployed to GitHub Pages automatically via GitHub Actions when changes are pushed to the main branch.

## 🚀 Local Development

To run the game locally:

```bash
# Clone the repository
git clone https://github.com/KeaganGilmore/EcoChain.git

# Navigate to the directory
cd EcoChain

# Start a local web server (Python 3)
python3 -m http.server 8080

# Or use Node.js
npx http-server -p 8080

# Open http://localhost:8080 in your browser
```

## 📁 Project Structure

```
EcoChain/
├── index.html          # Main HTML file with game structure
├── style.css           # All styling and animations
├── game.js             # Game logic and telemetry
├── .github/
│   └── workflows/
│       └── pages.yml   # GitHub Pages deployment
└── README.md           # This file
```

## 🎓 Educational Use

EcoChain is perfect for:

- Science classrooms teaching ecology and ecosystems
- Environmental education programs
- Self-directed learning about nature and biology
- Understanding complex systems through interactive simulation

## 📜 License

This project is licensed under the GNU General Public License v3.0 - see the [LICENSE](LICENSE) file for details.

## 🤝 Contributing

Contributions are welcome! Feel free to:

- Report bugs or suggest features via GitHub Issues
- Submit pull requests with improvements
- Share the game with students and educators

## 🌟 Share & Enjoy!

The game URL works for anyone - no login required. Share it freely!
