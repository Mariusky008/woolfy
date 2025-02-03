document.addEventListener('DOMContentLoaded', () => {
    console.log('=== Démarrage du script ===');
    
    // Debug logs
    console.log('Script démarré');
    
    // Tout le code JavaScript que vous aviez avant, y compris :
    // - La génération des chaises
    // - Les animations
    // - Le compte à rebours
    // - Les mascottes Woolfy
    // etc.

    // Effet de parallaxe sur le header
    const hero = document.querySelector('.hero');
    const heroContent = document.querySelector('.hero-content');

    window.addEventListener('scroll', () => {
        const scrolled = window.pageYOffset;
        if (heroContent) {
            heroContent.style.transform = `translateY(${scrolled * 0.5}px)`;
        }
        if (hero) {
            hero.style.backgroundPositionY = `${scrolled * 0.5}px`;
        }
    });

    // Animation des statistiques au scroll
    const stats = document.querySelectorAll('.stat-number');
    const animationDuration = 2000;

    function animateValue(element, start, end, duration) {
        const range = end - start;
        const startTime = performance.now();
        
        function update(currentTime) {
            const elapsed = currentTime - startTime;
            const progress = Math.min(elapsed / duration, 1);
            const value = Math.floor(start + (range * progress));
            element.textContent = `${value}%`;
            
            if (progress < 1) {
                requestAnimationFrame(update);
            }
        }
        
        requestAnimationFrame(update);
    }

    // Observer pour les animations au scroll
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting && entry.target.classList.contains('stat-number')) {
                const finalValue = parseInt(entry.target.textContent);
                animateValue(entry.target, 0, finalValue, animationDuration);
                observer.unobserve(entry.target);
            }
        });
    }, { threshold: 0.5 });

    // Observer les éléments à animer
    stats.forEach(stat => observer.observe(stat));

    // Génération des chaises
    const chairsContainer = document.querySelector('.chairs-container');
    console.log('Container des chaises:', chairsContainer);

    if (chairsContainer) {
        console.log('=== Début de la génération des chaises ===');
        const numberOfChairs = 20;
        const radius = 350;
        
        // Déplacer playerNames en dehors pour qu'il soit accessible globalement
        const playerNames = [
            "Alex", "Sam", "Jordan", "Charlie", 
            "Morgan", "Taylor", "Casey", "Jamie",
            "Avery", "Riley", "Quinn", "Parker",
            "Eden", "Skylar", "Robin", "Sage",
            "Blair", "Winter", "Storm", "Phoenix"
        ];

        // Positions aléatoires pour les chaises spéciales
        const specialPositions = [
            Math.floor(Math.random() * numberOfChairs),
            Math.floor(Math.random() * numberOfChairs),
            Math.floor(Math.random() * numberOfChairs),
            Math.floor(Math.random() * numberOfChairs)
        ];

        console.log('Positions spéciales:', specialPositions); // Debug

        // Positions pour les chaises piégées
        const trappedPositions = [];
        while (trappedPositions.length < 2) {
            const pos = Math.floor(Math.random() * numberOfChairs);
            if (!specialPositions.includes(pos) && !trappedPositions.includes(pos)) {
                trappedPositions.push(pos);
            }
        }

        console.log('Positions piégées:', trappedPositions); // Debug

        // Mélanger les noms des joueurs
        const shuffledNames = [...playerNames].sort(() => Math.random() - 0.5);

        // Générer les chaises
        for (let i = 0; i < numberOfChairs; i++) {
            const angle = (i / numberOfChairs) * 2 * Math.PI;
            const x = radius * Math.cos(angle);
            const y = radius * Math.sin(angle);
            const rotation = angle * 180 / Math.PI - 90;

            const chair = document.createElement('div');
            
            // Déterminer si c'est une chaise spéciale
            if (i === specialPositions[0]) {
                chair.className = 'chair special-1';
            } else if (i === specialPositions[1]) {
                chair.className = 'chair special-2';
            } else if (i === specialPositions[2]) {
                chair.className = 'chair special-3';
            } else if (i === specialPositions[3]) {
                chair.className = 'chair special-4';
            } else {
                chair.className = 'chair';
            }

            console.log(`Création chaise ${i}:`, { x, y, rotation, class: chair.className }); // Debug
            
            // Ajouter le nom du joueur
            const playerName = document.createElement('div');
            playerName.className = 'chair-player-name';
            playerName.textContent = shuffledNames[i];
            chair.appendChild(playerName);
            
            // Ajouter l'écriteau "PIÉGÉE" si c'est une chaise piégée
            if (trappedPositions.includes(i)) {
                const trapLabel = document.createElement('div');
                trapLabel.className = 'chair-trap-label';
                trapLabel.textContent = 'PIÉGÉE';
                chair.appendChild(trapLabel);
            }
            
            // Définir les variables CSS pour la position et la rotation
            chair.style.setProperty('--x', `${x}px`);
            chair.style.setProperty('--y', `${y}px`);
            chair.style.setProperty('--angle', `${rotation}deg`);
            
            chairsContainer.appendChild(chair);

            // Ajout des événements de survol
            chair.addEventListener('mouseenter', () => {
                const message = document.createElement('div');
                message.className = 'chair-message';
                message.textContent = chair.classList.contains('special-1') ? 'Une chaise mystérieuse...' :
                                    chair.classList.contains('special-2') ? 'Cette chaise semble différente...' :
                                    chair.classList.contains('special-3') ? 'Attention à cette chaise !' :
                                    chair.classList.contains('special-4') ? 'Une chaise étrange...' :
                                    'Cette chaise est-elle piégée ?';
                chair.appendChild(message);
            });

            chair.addEventListener('mouseleave', () => {
                const message = chair.querySelector('.chair-message');
                if (message) {
                    message.remove();
                }
            });
        }

        console.log('Génération des chaises terminée'); // Debug
    } else {
        console.error('ERREUR: Container des chaises non trouvé!');
        console.log('Document body:', document.body.innerHTML);
    }

    // Animation des mascottes Woolfy
    const mascot = document.querySelector('.mascot-woolfy');
    const mascot2 = document.querySelector('.mascot-woolfy-2');
    console.log('Mascottes trouvées:', { mascot, mascot2 });

    // Position initiale des mascottes
    if (mascot && mascot2) {
        mascot.style.transform = 'translate(0, 0) rotateX(-45deg) scale(0.8)';
        mascot2.style.transform = 'translate(0, 0) rotateX(-45deg) scale(0.8)';
    }

    let currentChairIndex = 0;
    let currentChairIndex2 = Math.floor(Math.random() * 10);
    let chairs = [];

    function moveWoolfy() {
        console.log('Déplacement de Woolfy 1');
        const nextChairIndex = Math.floor(Math.random() * chairs.length);
        const chair = chairs[nextChairIndex];
        const currentChair = chairs[currentChairIndex];
        
        if (!chair || !currentChair) {
            console.error('Chaise non trouvée pour Woolfy 1');
            return;
        }

        const startX = parseFloat(currentChair.style.getPropertyValue('--x'));
        const startY = parseFloat(currentChair.style.getPropertyValue('--y'));
        const endX = parseFloat(chair.style.getPropertyValue('--x'));
        const endY = parseFloat(chair.style.getPropertyValue('--y'));
        
        const midX = (startX + endX) / 2;
        const midY = (startY + endY) / 2 - 30;
        
        const randomScale = 0.6 + Math.random() * 0.2;
        
        mascot.style.setProperty('--startX', `${startX}px`);
        mascot.style.setProperty('--startY', `${startY}px`);
        mascot.style.setProperty('--midX', `${midX}px`);
        mascot.style.setProperty('--midY', `${midY}px`);
        mascot.style.setProperty('--endX', `${endX}px`);
        mascot.style.setProperty('--endY', `${endY}px`);
        mascot.style.setProperty('--randomScale', randomScale);
        
        mascot.classList.add('jumping');
        
        setTimeout(() => {
            mascot.classList.remove('jumping');
            mascot.style.transform = `translate(${endX}px, ${endY}px) rotateX(-45deg) scale(${randomScale})`;
        }, 1500);
        
        currentChairIndex = nextChairIndex;
    }

    function moveWoolfy2() {
        console.log('Déplacement de Woolfy 2');
        const nextChairIndex = Math.floor(Math.random() * chairs.length);
        const chair = chairs[nextChairIndex];
        const currentChair = chairs[currentChairIndex2];
        
        const startX = parseFloat(currentChair.style.getPropertyValue('--x'));
        const startY = parseFloat(currentChair.style.getPropertyValue('--y'));
        const endX = parseFloat(chair.style.getPropertyValue('--x'));
        const endY = parseFloat(chair.style.getPropertyValue('--y'));
        
        const midX = (startX + endX) / 2;
        const midY = (startY + endY) / 2 - 30;
        
        const randomScale = 0.6 + Math.random() * 0.2;
        
        mascot2.style.setProperty('--startX2', `${startX}px`);
        mascot2.style.setProperty('--startY2', `${startY}px`);
        mascot2.style.setProperty('--midX2', `${midX}px`);
        mascot2.style.setProperty('--midY2', `${midY}px`);
        mascot2.style.setProperty('--endX2', `${endX}px`);
        mascot2.style.setProperty('--endY2', `${endY}px`);
        mascot2.style.setProperty('--randomScale2', randomScale);
        
        mascot2.classList.add('jumping');
        
        setTimeout(() => {
            mascot2.classList.remove('jumping');
            mascot2.style.transform = `translate(${endX}px, ${endY}px) rotateX(-45deg) scale(${randomScale})`;
        }, 1500);
        
        currentChairIndex2 = nextChairIndex;
    }

    function initializeWoolfy() {
        chairs = document.querySelectorAll('.chair');
        console.log('Initialisation des mascottes Woolfy, chaises trouvées:', chairs.length);
        
        if (chairs.length > 0 && mascot && mascot2) {
            console.log('Démarrage des animations Woolfy');
            moveWoolfy();
            moveWoolfy2();
            setInterval(moveWoolfy, 4000);
            setInterval(moveWoolfy2, 3500);
        } else {
            console.error('Éléments manquants:', {
                chairs: chairs.length,
                mascot1: !!mascot,
                mascot2: !!mascot2
            });
        }
    }

    // Initialiser après que les chaises sont générées
    setTimeout(() => {
        console.log('Tentative d\'initialisation des mascottes Woolfy');
        initializeWoolfy();
    }, 1000);

    // Animation des sections au scroll
    const contentWrappers = document.querySelectorAll('.content-wrapper');
    
    const sectionObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                sectionObserver.unobserve(entry.target);
            }
        });
    }, {
        threshold: 0.1,
        rootMargin: '0px 0px -100px 0px'
    });

    contentWrappers.forEach(wrapper => {
        sectionObserver.observe(wrapper);
    });

    // Animation des cartes au clic
    const featureCards = document.querySelectorAll('.feature-item.cyber-card');
    let isFlipping = false;
    
    featureCards.forEach(card => {
        card.addEventListener('click', () => {
            if (!isFlipping) {
                isFlipping = true;
                card.classList.add('flipped');
                
                setTimeout(() => {
                    card.classList.remove('flipped');
                    setTimeout(() => {
                        isFlipping = false;
                    }, 600);
                }, 2000);
            }
        });
    });

    // Compte à rebours
    const countdownElement = document.querySelector('.countdown .time');
    if (countdownElement) {
        function updateCountdown() {
            let [hours, minutes, seconds] = countdownElement.textContent.split(':').map(Number);
            
            setInterval(() => {
                seconds--;
                if (seconds < 0) {
                    seconds = 59;
                    minutes--;
                    if (minutes < 0) {
                        minutes = 59;
                        hours--;
                        if (hours < 0) {
                            hours = 3;
                            minutes = 24;
                            seconds = 10;
                        }
                    }
                }
                countdownElement.textContent = `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
            }, 1000);
        }
        updateCountdown();
    }

    // Redirection vers la page d'authentification
    function redirectToAuth() {
        window.location.href = 'http://localhost:5175/auth';
    }

    // Connecter le bouton de connexion
    const loginButton = document.querySelector('.login-button');
    if (loginButton) {
        loginButton.addEventListener('click', redirectToAuth);
    }

    // Connecter le bouton "JOUER MAINTENANT"
    const playButton = document.querySelector('.cta-button');
    if (playButton) {
        playButton.addEventListener('click', redirectToAuth);
    }

    // Connecter le bouton "REJOINDRE LA PROCHAINE PARTIE"
    const joinButton = document.querySelector('.cta-final .cta-button');
    if (joinButton) {
        joinButton.addEventListener('click', redirectToAuth);
    }

    // Système de chat
    const chatContainer = document.querySelector('.chat-container');
    console.log('Chat container:', chatContainer);

    // Variable globale pour suivre si le chat a été initialisé
    let chatInitialized = false;

    const messages = [
        "a envoyé une vidéo à",
        "a partagé une image avec",
        "a envoyé un message vocal à",
        "a réagi au message de",
        "a invité",
        "a défié",
        "fait confiance à",
        "suspecte",
        "a rejoint l'alliance de",
        "ne fait plus confiance à"
    ];

    function initializeChat() {
        if (chatContainer && !chatInitialized) {
            chatInitialized = true;
            
            // Vider le conteneur
            chatContainer.innerHTML = '';
            
            // Ajouter le message de bienvenue une seule fois
            const welcomeMessage = document.createElement('div');
            welcomeMessage.className = 'chat-line';
            welcomeMessage.textContent = "Bienvenue dans le chat de la partie !";
            chatContainer.appendChild(welcomeMessage);

            function generateChatMessage() {
                const names = [...playerNames];
                const sender = names.splice(Math.floor(Math.random() * names.length), 1)[0];
                const receiver = names[Math.floor(Math.random() * names.length)];
                const action = messages[Math.floor(Math.random() * messages.length)];
                
                const messageDiv = document.createElement('div');
                messageDiv.className = 'chat-line';
                messageDiv.textContent = `${sender} ${action} ${receiver}`;
                
                chatContainer.insertBefore(messageDiv, chatContainer.firstChild);
                
                if (chatContainer.children.length > 6) {
                    chatContainer.removeChild(chatContainer.lastChild);
                }
            }

            // Démarrer la génération de messages
            setInterval(generateChatMessage, 3000);
        }
    }

    // Initialiser le chat une seule fois
    initializeChat();
}); 