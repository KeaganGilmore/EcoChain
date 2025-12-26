// LX Library Telemetry Setup
function generateUUID() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
        const r = Math.random() * 16 | 0;
        const v = c === 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
    });
}

// Initialize session UUID and set it in meta tag
const sessionUUID = generateUUID();
document.querySelector('meta[name="lx-page-session"]').setAttribute('content', sessionUUID);

// Telemetry event emitter
function emitLxEvent(eventType, data = {}) {
    const event = {
        session: sessionUUID,
        timestamp: new Date().toISOString(),
        type: eventType,
        data: data
    };
    
    // Log to console (in production, this would be sent to a telemetry service)
    console.log('LX Event:', event);
    
    // Store events for this session
    if (!window.lxEvents) {
        window.lxEvents = [];
    }
    window.lxEvents.push(event);
}

// Ecosystem constants
const ECOSYSTEM_CONSTANTS = {
    PLANT_GROWTH_RATE: 0.3,
    PLANTS_PER_RABBIT: 2,
    RABBIT_BIRTH_RATE: 0.2,
    RABBIT_STARVATION_RATE: 0.3,
    FOX_BIRTH_RATE: 0.15,
    FOX_STARVATION_RATE: 0.4
};

// Game State
class EcoGame {
    constructor() {
        this.round = 1;
        this.maxRounds = 10;
        this.populations = {
            plants: 15,
            rabbits: 8,
            foxes: 3
        };
        this.maxPopulations = {
            plants: 30,
            rabbits: 20,
            foxes: 15
        };
        this.history = [];
        this.gameActive = false;
        this.actionsTaken = [];
    }

    start() {
        this.round = 1;
        this.populations = {
            plants: 15,
            rabbits: 8,
            foxes: 3
        };
        this.history = [];
        this.gameActive = true;
        this.actionsTaken = [];
        
        emitLxEvent('start', {
            initialPopulations: {...this.populations}
        });
    }

    processRound(action) {
        const previousPops = {...this.populations};
        
        // Apply player action
        this.applyAction(action);
        
        // Store action
        this.actionsTaken.push({
            round: this.round,
            action: action,
            populationsBefore: previousPops,
            populationsAfter: {...this.populations}
        });
        
        // Emit choice event
        emitLxEvent('choice', {
            round: this.round,
            action: action,
            populationsBefore: previousPops,
            populationsAfter: {...this.populations}
        });
        
        // Natural processes (after player action)
        const changes = this.simulateEcosystem();
        
        // Record history
        this.history.push({
            round: this.round,
            action: action,
            populations: {...this.populations},
            changes: changes
        });
        
        // Emit outcome event
        emitLxEvent('outcome', {
            round: this.round,
            populations: {...this.populations},
            changes: changes,
            isExtinct: this.isExtinct()
        });
        
        return changes;
    }

    applyAction(action) {
        switch(action) {
            case 'add-plants':
                this.populations.plants += 5;
                break;
            case 'add-rabbits':
                this.populations.rabbits += 3;
                break;
            case 'add-foxes':
                this.populations.foxes += 2;
                break;
            case 'do-nothing':
                // No immediate action
                break;
        }
    }

    simulateEcosystem() {
        const changes = {
            plants: 0,
            rabbits: 0,
            foxes: 0,
            events: []
        };

        // Plants grow naturally (photosynthesis)
        const plantGrowth = Math.floor(this.populations.plants * ECOSYSTEM_CONSTANTS.PLANT_GROWTH_RATE);
        this.populations.plants += plantGrowth;
        changes.plants += plantGrowth;
        if (plantGrowth > 0) {
            changes.events.push(`🌱 Plants grew by ${plantGrowth} through photosynthesis`);
        }

        // Rabbits eat plants
        const rabbitsNeedFood = this.populations.rabbits;
        const plantsEaten = Math.min(this.populations.plants, rabbitsNeedFood * ECOSYSTEM_CONSTANTS.PLANTS_PER_RABBIT);
        this.populations.plants -= plantsEaten;
        changes.plants -= plantsEaten;
        
        // Rabbits reproduce or starve based on food
        if (this.populations.plants >= rabbitsNeedFood) {
            const rabbitBirth = Math.floor(this.populations.rabbits * ECOSYSTEM_CONSTANTS.RABBIT_BIRTH_RATE);
            this.populations.rabbits += rabbitBirth;
            changes.rabbits += rabbitBirth;
            changes.events.push(`🐰 Rabbits ate ${plantsEaten} plants and ${rabbitBirth} were born`);
        } else {
            const rabbitStarve = Math.floor(this.populations.rabbits * ECOSYSTEM_CONSTANTS.RABBIT_STARVATION_RATE);
            this.populations.rabbits -= rabbitStarve;
            changes.rabbits -= rabbitStarve;
            changes.events.push(`🐰 ${rabbitStarve} rabbits starved due to lack of plants`);
        }

        // Foxes hunt rabbits
        const foxesNeedFood = this.populations.foxes;
        const rabbitsBeforeHunt = this.populations.rabbits;
        const rabbitsHunted = Math.min(this.populations.rabbits, foxesNeedFood);
        this.populations.rabbits -= rabbitsHunted;
        changes.rabbits -= rabbitsHunted;

        // Foxes reproduce or starve based on food (check population BEFORE hunting)
        if (rabbitsBeforeHunt >= foxesNeedFood) {
            const foxBirth = Math.floor(this.populations.foxes * ECOSYSTEM_CONSTANTS.FOX_BIRTH_RATE);
            this.populations.foxes += foxBirth;
            changes.foxes += foxBirth;
            changes.events.push(`🦊 Foxes hunted ${rabbitsHunted} rabbits and ${foxBirth} were born`);
        } else {
            const foxStarve = Math.floor(this.populations.foxes * ECOSYSTEM_CONSTANTS.FOX_STARVATION_RATE);
            this.populations.foxes -= foxStarve;
            changes.foxes -= foxStarve;
            changes.events.push(`🦊 ${foxStarve} foxes starved due to lack of rabbits`);
        }

        // Ensure populations don't go negative
        this.populations.plants = Math.max(0, this.populations.plants);
        this.populations.rabbits = Math.max(0, this.populations.rabbits);
        this.populations.foxes = Math.max(0, this.populations.foxes);

        // Cap populations at maximum
        this.populations.plants = Math.min(this.maxPopulations.plants, this.populations.plants);
        this.populations.rabbits = Math.min(this.maxPopulations.rabbits, this.populations.rabbits);
        this.populations.foxes = Math.min(this.maxPopulations.foxes, this.populations.foxes);

        return changes;
    }

    isExtinct() {
        return this.populations.plants === 0 || 
               this.populations.rabbits === 0 || 
               this.populations.foxes === 0;
    }

    isComplete() {
        return this.round >= this.maxRounds;
    }

    nextRound() {
        this.round++;
    }

    getResult() {
        const survived = !this.isExtinct() && this.isComplete();
        return {
            survived: survived,
            rounds: this.round,
            finalPopulations: {...this.populations},
            actionsSummary: this.getActionSummary()
        };
    }

    getActionSummary() {
        const summary = {
            'add-plants': 0,
            'add-rabbits': 0,
            'add-foxes': 0,
            'do-nothing': 0
        };
        this.actionsTaken.forEach(a => {
            summary[a.action]++;
        });
        return summary;
    }
}

// UI Controller
class GameUI {
    constructor(game) {
        this.game = game;
        this.screens = {
            welcome: document.getElementById('welcome-screen'),
            play: document.getElementById('play-screen'),
            end: document.getElementById('end-screen')
        };
        this.elements = {
            startBtn: document.getElementById('start-btn'),
            restartBtn: document.getElementById('restart-btn'),
            roundNumber: document.getElementById('round-number'),
            statusMessage: document.getElementById('status-message'),
            plantsCount: document.getElementById('plants-count'),
            rabbitsCount: document.getElementById('rabbits-count'),
            foxesCount: document.getElementById('foxes-count'),
            plantsBar: document.getElementById('plants-bar'),
            rabbitsBar: document.getElementById('rabbits-bar'),
            foxesBar: document.getElementById('foxes-bar'),
            feedbackPanel: document.getElementById('feedback-panel'),
            feedbackContent: document.getElementById('feedback-content'),
            endResult: document.getElementById('end-result'),
            endSummary: document.getElementById('end-summary')
        };
        this.actionButtons = document.querySelectorAll('.action-btn');
        
        this.setupEventListeners();
    }

    setupEventListeners() {
        this.elements.startBtn.addEventListener('click', () => this.startGame());
        this.elements.restartBtn.addEventListener('click', () => this.startGame());
        
        this.actionButtons.forEach(btn => {
            btn.addEventListener('click', (e) => {
                const action = e.currentTarget.dataset.action;
                this.handleAction(action);
            });
        });
    }

    startGame() {
        this.game.start();
        this.showScreen('play');
        this.updateDisplay();
        this.enableActions();
        this.elements.feedbackPanel.classList.remove('active');
    }

    handleAction(action) {
        this.disableActions();
        
        const changes = this.game.processRound(action);
        
        // Animate and update display
        this.updateDisplay(true);
        this.showFeedback(action, changes);
        
        // Check game state
        setTimeout(() => {
            if (this.game.isExtinct()) {
                this.endGame(false);
            } else if (this.game.isComplete()) {
                this.endGame(true);
            } else {
                this.game.nextRound();
                this.updateDisplay();
                this.enableActions();
            }
        }, 3000);
    }

    updateDisplay(animate = false) {
        const pops = this.game.populations;
        const maxPops = this.game.maxPopulations;
        
        this.elements.roundNumber.textContent = this.game.round;
        this.elements.plantsCount.textContent = pops.plants;
        this.elements.rabbitsCount.textContent = pops.rabbits;
        this.elements.foxesCount.textContent = pops.foxes;
        
        // Update bars
        this.elements.plantsBar.style.width = `${(pops.plants / maxPops.plants) * 100}%`;
        this.elements.rabbitsBar.style.width = `${(pops.rabbits / maxPops.rabbits) * 100}%`;
        this.elements.foxesBar.style.width = `${(pops.foxes / maxPops.foxes) * 100}%`;
        
        // Update card states
        this.updateCardState('plants', pops.plants, maxPops.plants, animate);
        this.updateCardState('rabbits', pops.rabbits, maxPops.rabbits, animate);
        this.updateCardState('foxes', pops.foxes, maxPops.foxes, animate);
    }

    updateCardState(species, count, max, animate) {
        const card = document.querySelector(`#${species}-count`).closest('.population-card');
        
        // Remove all state classes
        card.classList.remove('critical', 'thriving', 'extinct', 'pulse');
        
        if (count === 0) {
            card.classList.add('extinct');
        } else if (count < max * 0.3) {
            card.classList.add('critical');
        } else if (count > max * 0.7) {
            card.classList.add('thriving');
        }
        
        if (animate) {
            card.classList.add('pulse');
            setTimeout(() => card.classList.remove('pulse'), 500);
        }
    }

    showFeedback(action, changes) {
        const actionNames = {
            'add-plants': 'Planted Seeds',
            'add-rabbits': 'Released Rabbits',
            'add-foxes': 'Released Foxes',
            'do-nothing': 'Observed Nature'
        };
        
        let html = `<div class="feedback-title">🔄 ${actionNames[action]}</div>`;
        html += '<div class="feedback-changes">';
        
        changes.events.forEach(event => {
            html += `<div class="change-item">${event}</div>`;
        });
        
        html += '</div>';
        
        this.elements.feedbackContent.innerHTML = html;
        this.elements.feedbackPanel.classList.add('active');
    }

    endGame(won) {
        const result = this.game.getResult();
        
        // Emit completion event
        emitLxEvent('completion', {
            won: won,
            rounds: result.rounds,
            finalPopulations: result.finalPopulations,
            actionsSummary: result.actionsSummary
        });
        
        this.showScreen('end');
        
        if (won) {
            this.elements.endResult.textContent = '🎉';
            this.elements.endSummary.innerHTML = `
                <div class="end-title">Ecosystem Balanced!</div>
                <div class="end-message">
                    Congratulations! You successfully maintained a balanced ecosystem for all ${result.rounds} rounds.
                    You've learned how energy flows through food chains and how every species depends on others!
                </div>
                <div class="end-stats">
                    <div class="stat-item">Final Plants: ${result.finalPopulations.plants} 🌱</div>
                    <div class="stat-item">Final Rabbits: ${result.finalPopulations.rabbits} 🐰</div>
                    <div class="stat-item">Final Foxes: ${result.finalPopulations.foxes} 🦊</div>
                </div>
            `;
        } else {
            const extinct = [];
            if (result.finalPopulations.plants === 0) extinct.push('Plants 🌱');
            if (result.finalPopulations.rabbits === 0) extinct.push('Rabbits 🐰');
            if (result.finalPopulations.foxes === 0) extinct.push('Foxes 🦊');
            
            this.elements.endResult.textContent = '💔';
            this.elements.endSummary.innerHTML = `
                <div class="end-title">Ecosystem Collapsed</div>
                <div class="end-message">
                    The ecosystem became unbalanced on round ${result.rounds}. 
                    ${extinct.join(', ')} went extinct, breaking the food chain.
                    <br><br>
                    Remember: Every species needs the right amount of food to survive. Too much or too little disrupts the balance!
                </div>
                <div class="end-stats">
                    <div class="stat-item">Final Plants: ${result.finalPopulations.plants} 🌱</div>
                    <div class="stat-item">Final Rabbits: ${result.finalPopulations.rabbits} 🐰</div>
                    <div class="stat-item">Final Foxes: ${result.finalPopulations.foxes} 🦊</div>
                </div>
            `;
        }
    }

    showScreen(screenName) {
        Object.values(this.screens).forEach(screen => screen.classList.remove('active'));
        this.screens[screenName].classList.add('active');
    }

    enableActions() {
        this.actionButtons.forEach(btn => btn.classList.remove('disabled'));
        this.elements.statusMessage.textContent = 'Choose your action for this round';
    }

    disableActions() {
        this.actionButtons.forEach(btn => btn.classList.add('disabled'));
        this.elements.statusMessage.textContent = 'Processing round...';
    }
}

// Initialize game
const game = new EcoGame();
const ui = new GameUI(game);

// Log initial page load
emitLxEvent('page_load', {
    userAgent: navigator.userAgent,
    timestamp: new Date().toISOString()
});
