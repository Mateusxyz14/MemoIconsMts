// Estado del juego
let gameState = {
    playerName: '',
    attempts: 0,
    pairsFound: 0,
    firstCard: null,
    secondCard: null,
    canClick: true,
    gameActive: false,
    cards: []
};

// Íconos únicos para las cartas (4 pares)
const gameImages = [
    'img/i1.png',  // Reemplaza con la ruta de tu primera imagen
    'img/i2.png',  // Reemplaza con la ruta de tu segunda imagen
    'img/i3.png',  // Reemplaza con la ruta de tu tercera imagen
    'img/i4.png'   // Reemplaza con la ruta de tu cuarta imagen
];

// Elementos del DOM
const elements = {
    // Pantallas
    menuScreen: document.getElementById('menu-screen'),
    instructionsScreen: document.getElementById('instructions-screen'),
    gameScreen: document.getElementById('game-screen'),
    
    // Botones del menú
    startGameBtn: document.getElementById('start-game'),
    instructionsBtn: document.getElementById('instructions'),
    backMenuBtn: document.getElementById('back-menu'),
    
    // Input del jugador
    playerNameInput: document.getElementById('player-name'),
    playerDisplay: document.getElementById('player-display'),
    
    // Elementos del juego
    gameBoard: document.querySelector('.game-board'),
    attemptsDisplay: document.getElementById('attempts'),
    pairsDisplay: document.getElementById('pairs-found'),
    
    // Botones de juego
    pauseBtn: document.getElementById('pause-game'),
    restartBtn: document.getElementById('restart-game'),
    
    // Modales
    pauseModal: document.getElementById('pause-modal'),
    victoryModal: document.getElementById('victory-modal'),
    
    // Botones de modales
    resumeBtn: document.getElementById('resume-game'),
    quitBtn: document.getElementById('quit-game'),
    playAgainBtn: document.getElementById('play-again'),
    menuVictoryBtn: document.getElementById('menu-victory'),
    
    // Elementos de victoria
    victoryMessage: document.getElementById('victory-message'),
    finalAttempts: document.getElementById('final-attempts')
};

// Inicialización del juego
document.addEventListener('DOMContentLoaded', () => {
    initializeEventListeners();
    showScreen('menu');
});

function initializeEventListeners() {
    // Botones del menú
    elements.startGameBtn.addEventListener('click', startGame);
    elements.instructionsBtn.addEventListener('click', () => showScreen('instructions'));
    elements.backMenuBtn.addEventListener('click', () => showScreen('menu'));
    
    // Input del jugador - Enter para iniciar
    elements.playerNameInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            startGame();
        }
    });
    
    // Botones de juego
    elements.pauseBtn.addEventListener('click', pauseGame);
    elements.restartBtn.addEventListener('click', restartGame);
    
    // Botones de modales
    elements.resumeBtn.addEventListener('click', resumeGame);
    elements.quitBtn.addEventListener('click', quitToMenu);
    elements.playAgainBtn.addEventListener('click', playAgain);
    elements.menuVictoryBtn.addEventListener('click', quitToMenu);
    
    // Clicks en el tablero
    elements.gameBoard.addEventListener('click', handleCardClick);
}

function showScreen(screenName) {
    // Ocultar todas las pantallas
    document.querySelectorAll('.screen').forEach(screen => {
        screen.classList.remove('active');
    });
    
    // Mostrar la pantalla seleccionada
    switch(screenName) {
        case 'menu':
            elements.menuScreen.classList.add('active');
            break;
        case 'instructions':
            elements.instructionsScreen.classList.add('active');
            break;
        case 'game':
            elements.gameScreen.classList.add('active');
            break;
    }
}

function startGame() {
    const playerName = elements.playerNameInput.value.trim();
    
    if (!playerName) {
        elements.playerNameInput.style.animation = 'shake 0.5s';
        elements.playerNameInput.placeholder = 'Por favor, ingresa tu nombre';
        setTimeout(() => {
            elements.playerNameInput.style.animation = '';
            elements.playerNameInput.placeholder = 'Ingresa tu nombre';
        }, 500);
        return;
    }
    
    gameState.playerName = playerName;
    elements.playerDisplay.textContent = `Jugador: ${playerName}`;
    
    initializeGame();
    showScreen('game');
}

function initializeGame() {
    gameState.attempts = 0;
    gameState.pairsFound = 0;
    gameState.firstCard = null;
    gameState.secondCard = null;
    gameState.canClick = true;
    gameState.gameActive = true;
    
    // Crear array de cartas (cada ícono dos veces)
    gameState.cards = [...gameImages, ...gameImages];
    
    // Mezclar las cartas
    shuffleArray(gameState.cards);
    
    // Configurar el tablero
    setupGameBoard();
    updateDisplay();
}

function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
}

function setupGameBoard() {
    const cards = elements.gameBoard.querySelectorAll('.card');
    
    cards.forEach((card, index) => {
        // Buscar el elemento img dentro de card-front
        const cardImage = card.querySelector('.card-image');
        
        // Establecer la ruta de la imagen
        cardImage.src = gameState.cards[index];
        cardImage.alt = `Carta ${index + 1}`;
        
        // Manejar error de carga de imagen
        cardImage.onerror = function() {
            console.warn(`No se pudo cargar la imagen: ${gameState.cards[index]}`);
            // Crear un ícono de respaldo
            this.style.display = 'none';
            const fallbackIcon = document.createElement('div');
            fallbackIcon.textContent = '🎮';
            fallbackIcon.style.fontSize = '40px';
            fallbackIcon.style.textAlign = 'center';
            fallbackIcon.style.lineHeight = '80px';
            this.parentNode.appendChild(fallbackIcon);
        };
        
        // Resetear estado de la carta
        card.classList.remove('flipped', 'matched');
        card.dataset.icon = gameState.cards[index];
        card.dataset.index = index;
    });
}

function handleCardClick(e) {
    if (!gameState.canClick || !gameState.gameActive) return;
    
    const card = e.target.closest('.card');
    if (!card || card.classList.contains('flipped') || card.classList.contains('matched')) return;
    
    flipCard(card);
    
    if (!gameState.firstCard) {
        gameState.firstCard = card;
    } else if (!gameState.secondCard && card !== gameState.firstCard) {
        gameState.secondCard = card;
        gameState.canClick = false;
        
        // Verificar inmediatamente después de que la animación de volteo termine
        setTimeout(() => {
            checkForMatch();
        }, 300);
    }
}

function flipCard(card) {
    card.classList.add('flipped');
}

function checkForMatch() {
    const firstIcon = gameState.firstCard.dataset.icon;
    const secondIcon = gameState.secondCard.dataset.icon;
    
    gameState.attempts++;
    
    if (firstIcon === secondIcon) {
        // ¡Coincidencia! - Efecto inmediato de éxito
        gameState.firstCard.classList.add('matched');
        gameState.secondCard.classList.add('matched');
        gameState.pairsFound++;
        
        // Efecto dinámico de éxito inmediato
        playMatchSuccessEffect(gameState.firstCard, gameState.secondCard);
        
        // Resetear inmediatamente para permitir más clicks
        gameState.firstCard = null;
        gameState.secondCard = null;
        gameState.canClick = true;
        
        if (gameState.pairsFound === 4) {
            setTimeout(() => {
                showVictory();
            }, 800);
        }
    } else {
        // No coinciden - Voltear inmediatamente
        playMismatchEffect(gameState.firstCard, gameState.secondCard);
        
        // Voltear las cartas inmediatamente
        setTimeout(() => {
            gameState.firstCard.classList.remove('flipped');
            gameState.secondCard.classList.remove('flipped');
            
            gameState.firstCard = null;
            gameState.secondCard = null;
            gameState.canClick = true;
        }, 500); // Tiempo reducido para mejor experiencia
    }
    
    updateDisplay();
}

function playSuccessEffect(card1, card2) {
    // Efecto visual de éxito
    [card1, card2].forEach(card => {
        card.style.animation = 'pulse 0.6s ease';
        setTimeout(() => {
            card.style.animation = '';
        }, 600);
    });
}

function updateDisplay() {
    elements.attemptsDisplay.textContent = gameState.attempts;
    elements.pairsDisplay.textContent = `${gameState.pairsFound}/4`;
}

function pauseGame() {
    if (!gameState.gameActive) return;
    
    gameState.canClick = false;
    showModal('pause');
}

function resumeGame() {
    gameState.canClick = true;
    hideModal('pause');
}

function restartGame() {
    hideModal('pause');
    initializeGame();
}

function playAgain() {
    hideModal('victory');
    initializeGame();
}

function quitToMenu() {
    hideModal('pause');
    hideModal('victory');
    gameState.gameActive = false;
    elements.playerNameInput.value = '';
    showScreen('menu');
}

function showVictory() {
    gameState.gameActive = false;
    
    elements.victoryMessage.textContent = `¡Felicidades ${gameState.playerName}! Completaste el desafío`;
    elements.finalAttempts.textContent = gameState.attempts;
    
    showModal('victory');
}

function showModal(modalType) {
    const modal = modalType === 'pause' ? elements.pauseModal : elements.victoryModal;
    modal.classList.add('show');
}

function hideModal(modalType) {
    const modal = modalType === 'pause' ? elements.pauseModal : elements.victoryModal;
    modal.classList.remove('show');
}

// Funciones de utilidad
function addShakeAnimation() {
    const style = document.createElement('style');
    style.textContent = `
        @keyframes shake {
            0%, 100% { transform: translateX(0); }
            10%, 30%, 50%, 70%, 90% { transform: translateX(-5px); }
            20%, 40%, 60%, 80% { transform: translateX(5px); }
        }
    `;
    document.head.appendChild(style);
}

// Agregar animación de shake al cargar
addShakeAnimation();

// Efectos de sonido (usando Web Audio API)
const audioContext = new (window.AudioContext || window.webkitAudioContext)();

function playTone(frequency, duration, type = 'sine') {
    try {
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);
        
        oscillator.frequency.value = frequency;
        oscillator.type = type;
        
        gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + duration);
        
        oscillator.start(audioContext.currentTime);
        oscillator.stop(audioContext.currentTime + duration);
    } catch (e) {
        // Silenciar errores de audio si el contexto no está disponible
    }
}

// Efectos dinámicos mejorados para coincidencias y fallos
function playMatchSuccessEffect(card1, card2) {
    // Sonido de éxito inmediato
    playTone(800, 0.15);
    setTimeout(() => playTone(1200, 0.2), 150);
    
    // Efecto visual espectacular para coincidencia
    [card1, card2].forEach((card, index) => {
        // Efecto de brillo intenso
        card.style.animation = 'matchGlow 0.8s ease-in-out';
        card.style.boxShadow = '0 0 30px #00ff41, 0 0 60px #00ff41, 0 0 90px #00ff41';
        card.style.borderColor = '#00ff41';
        card.style.transform = 'scale(1.1)';
        
        // Crear efecto de partículas
        createParticleEffect(card);
        
        setTimeout(() => {
            card.style.animation = '';
            card.style.transform = 'scale(1)';
            card.style.boxShadow = '0 0 20px rgba(102, 255, 102, 0.5)';
        }, 800);
    });
}

function playMismatchEffect(card1, card2) {
    // Sonido de fallo
    playTone(300, 0.3, 'square');
    
    // Efecto visual de error - shake rápido
    [card1, card2].forEach(card => {
        card.style.animation = 'mismatchShake 0.4s ease-in-out';
        card.style.borderColor = '#ff6b6b';
        card.style.boxShadow = '0 0 20px rgba(255, 107, 107, 0.5)';
        
        setTimeout(() => {
            card.style.animation = '';
            card.style.borderColor = '#00ff41';
            card.style.boxShadow = '0 0 15px rgba(0, 255, 65, 0.3)';
        }, 400);
    });
}

function createParticleEffect(card) {
    const rect = card.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    
    // Crear múltiples partículas
    for (let i = 0; i < 8; i++) {
        const particle = document.createElement('div');
        particle.className = 'success-particle';
        particle.style.cssText = `
            position: fixed;
            width: 6px;
            height: 6px;
            background: #00ff41;
            border-radius: 50%;
            pointer-events: none;
            z-index: 1000;
            left: ${centerX}px;
            top: ${centerY}px;
            box-shadow: 0 0 10px #00ff41;
        `;
        
        document.body.appendChild(particle);
        
        // Animar partícula
        const angle = (i / 8) * 2 * Math.PI;
        const distance = 100;
        const endX = centerX + Math.cos(angle) * distance;
        const endY = centerY + Math.sin(angle) * distance;
        
        particle.animate([
            { 
                transform: 'translate(0, 0) scale(1)', 
                opacity: 1 
            },
            { 
                transform: `translate(${endX - centerX}px, ${endY - centerY}px) scale(0)`, 
                opacity: 0 
            }
        ], {
            duration: 600,
            easing: 'ease-out'
        }).onfinish = () => {
            document.body.removeChild(particle);
        };
    }
}

// Funcionalidad adicional para mejorar la experiencia
function handleCardHover() {
    const cards = elements.gameBoard.querySelectorAll('.card');
    
    cards.forEach(card => {
        card.addEventListener('mouseenter', () => {
            if (!card.classList.contains('flipped') && !card.classList.contains('matched') && gameState.canClick) {
                card.style.transform = 'scale(1.05)';
                card.style.transition = 'transform 0.2s ease';
            }
        });
        
        card.addEventListener('mouseleave', () => {
            card.style.transform = '';
        });
    });
}

// Llamar a la función de hover después de configurar el tablero
const originalSetupGameBoard = setupGameBoard;
setupGameBoard = function() {
    originalSetupGameBoard.call(this);
    handleCardHover();
};

// Atajos de teclado
document.addEventListener('keydown', (e) => {
    if (elements.gameScreen.classList.contains('active') && gameState.gameActive) {
        switch(e.key) {
            case 'Escape':
                if (!elements.pauseModal.classList.contains('show')) {
                    pauseGame();
                }
                break;
            case 'r':
            case 'R':
                if (e.ctrlKey || e.metaKey) {
                    e.preventDefault();
                    restartGame();
                }
                break;
        }
    }
    
    // Cerrar modales con Escape
    if (e.key === 'Escape') {
        if (elements.pauseModal.classList.contains('show')) {
            resumeGame();
        }
        if (elements.victoryModal.classList.contains('show')) {
            // No cerrar modal de victoria con Escape
        }
    }
});

// Función para animar la entrada de cartas
function animateCardsEntrance() {
    const cards = elements.gameBoard.querySelectorAll('.card');
    
    cards.forEach((card, index) => {
        card.style.opacity = '0';
        card.style.transform = 'translateY(20px) scale(0.8)';
        card.style.transition = 'all 0.5s ease';
        
        setTimeout(() => {
            card.style.opacity = '1';
            card.style.transform = 'translateY(0) scale(1)';
        }, index * 100);
    });
}

// Mejorar la función de inicialización con animaciones
const originalInitializeGame = initializeGame;
initializeGame = function() {
    originalInitializeGame.call(this);
    
    // Animar entrada de cartas después de un pequeño delay
    setTimeout(() => {
        animateCardsEntrance();
    }, 300);
};

// Sistema de logros/estadísticas simples
const achievements = {
    checkPerfectGame() {
        if (gameState.attempts === 4 && gameState.pairsFound === 4) {
            return "¡JUEGO PERFECTO! 🏆";
        }
        return null;
    },
    
    checkQuickWin() {
        if (gameState.attempts <= 6) {
            return "¡MEMORIA EXCEPCIONAL! 🧠";
        }
        return null;
    },
    
    getEncouragementMessage() {
        if (gameState.attempts <= 8) {
            return "¡Excelente memoria!";
        } else if (gameState.attempts <= 12) {
            return "¡Buen trabajo!";
        } else {
            return "¡La práctica hace al maestro!";
        }
    }
};

// Mejorar el mensaje de victoria con logros
const originalShowVictory = showVictory;
showVictory = function() {
    gameState.gameActive = false;
    
    let victoryText = `¡Felicidades ${gameState.playerName}! Completaste el desafío`;
    
    // Verificar logros
    const perfectGame = achievements.checkPerfectGame();
    const quickWin = achievements.checkQuickWin();
    
    if (perfectGame) {
        victoryText += `\n${perfectGame}`;
    } else if (quickWin) {
        victoryText += `\n${quickWin}`;
    }
    
    elements.victoryMessage.innerHTML = victoryText.replace(/\n/g, '<br>');
    elements.finalAttempts.textContent = gameState.attempts;
    
    // Agregar mensaje de aliento
    const encouragement = achievements.getEncouragementMessage();
    elements.victoryMessage.innerHTML += `<br><small style="color: #66ff66;">${encouragement}</small>`;
    
    showModal('victory');
    
    // Sonido de victoria
    setTimeout(() => playTone(600, 0.3), 200);
    setTimeout(() => playTone(800, 0.3), 400);
    setTimeout(() => playTone(1000, 0.5), 600);
};

// Función para mostrar consejos
function showRandomTip() {
    const tips = [
        "💡 Intenta recordar la posición de las cartas que ya has visto",
        "🎯 Comienza por las esquinas, son más fáciles de recordar",
        "🧠 Usa técnicas de memoria como asociaciones mentales",
        "⚡ La práctica mejora tu memoria visual",
        "🎮 ¡Diviértete! Un mente relajada memoriza mejor"
    ];
    
    const randomTip = tips[Math.floor(Math.random() * tips.length)];
    
    // Crear elemento de tip temporal
    const tipElement = document.createElement('div');
    tipElement.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: rgba(0, 40, 0, 0.95);
        border: 2px solid #66ff66;
        border-radius: 10px;
        padding: 15px;
        color: #66ff66;
        font-size: 0.9rem;
        max-width: 300px;
        z-index: 1001;
        animation: slideInRight 0.5s ease;
    `;
    
    tipElement.textContent = randomTip;
    document.body.appendChild(tipElement);
    
    // Remover después de 4 segundos
    setTimeout(() => {
        tipElement.style.animation = 'slideOutRight 0.5s ease';
        setTimeout(() => {
            document.body.removeChild(tipElement);
        }, 500);
    }, 4000);
}

// Agregar estilos para animaciones de tips
const tipStyles = document.createElement('style');
tipStyles.textContent = `
    @keyframes slideInRight {
        from {
            transform: translateX(100%);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
    
    @keyframes slideOutRight {
        from {
            transform: translateX(0);
            opacity: 1;
        }
        to {
            transform: translateX(100%);
            opacity: 0;
        }
    }
`;
document.head.appendChild(tipStyles);

// Mostrar tip al iniciar el juego
const originalStartGame = startGame;
startGame = function() {
    originalStartGame.call(this);
    
    // Mostrar tip después de 3 segundos de iniciar
    setTimeout(() => {
        if (gameState.gameActive && gameState.attempts === 0) {
            showRandomTip();
        }
    }, 3000);
};

console.log("🎮 Memo-Icons Challenge cargado correctamente!");
console.log("🎯 Controles: Escape para pausar, Ctrl+R para reiniciar");
console.log("✨ ¡Disfruta el juego!");