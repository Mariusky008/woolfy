document.addEventListener('DOMContentLoaded', () => {
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

    // Gestion des modales
    const modals = document.querySelectorAll('.modal');
    const modalTriggers = document.querySelectorAll('[data-modal]');
    const closeButtons = document.querySelectorAll('.close-modal');

    function openModal(modalId) {
        const modal = document.getElementById(`modal-${modalId}`);
        if (modal) {
            document.body.style.overflow = 'hidden';
            modal.classList.add('active');
            setTimeout(() => {
                modal.querySelector('.modal-content').style.transform = 'translateY(0)';
            }, 10);
        }
    }

    function closeModal(modal) {
        document.body.style.overflow = '';
        modal.querySelector('.modal-content').style.transform = 'translateY(20px)';
        setTimeout(() => {
            modal.classList.remove('active');
        }, 300);
    }

    modalTriggers.forEach(trigger => {
        trigger.addEventListener('click', () => {
            openModal(trigger.dataset.modal);
        });
    });

    closeButtons.forEach(button => {
        button.addEventListener('click', () => {
            closeModal(button.closest('.modal'));
        });
    });

    modals.forEach(modal => {
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                closeModal(modal);
            }
        });
    });

    // Fermeture des modales avec la touche Echap
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            modals.forEach(modal => {
                if (modal.classList.contains('active')) {
                    closeModal(modal);
                }
            });
        }
    });

    // Animation des images au scroll
    const sectionImages = document.querySelectorAll('.section-image');
    
    function handleScroll() {
        sectionImages.forEach(image => {
            const rect = image.getBoundingClientRect();
            const isVisible = rect.top < window.innerHeight && rect.bottom > 0;
            
            if (isVisible) {
                const scrollProgress = (window.innerHeight - rect.top) / (window.innerHeight + rect.height);
                const translateX = image.classList.contains('left') ? 
                    Math.min(0, -30 + (scrollProgress * 30)) : 
                    Math.min(0, 30 - (scrollProgress * 30));
                
                image.style.transform = `translateX(${translateX}%)`;
                image.style.opacity = Math.min(0.6, scrollProgress);
            }
        });
    }

    window.addEventListener('scroll', handleScroll);
    handleScroll();

    // Animation des features au hover
    const features = document.querySelectorAll('.feature');
    
    features.forEach(feature => {
        feature.addEventListener('mouseenter', () => {
            feature.style.transform = 'translateY(-10px)';
            feature.style.transition = 'transform 0.3s ease-out';
        });
        
        feature.addEventListener('mouseleave', () => {
            feature.style.transform = 'translateY(0)';
        });
    });

    // Smooth scroll pour les liens d'ancrage
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth'
                });
            }
        });
    });

    // Génération des chaises
    const chairsContainer = document.querySelector('.chairs-container');
    console.log('Container des chaises:', chairsContainer); // Debug

    if (chairsContainer) {
        const numberOfChairs = 20;
        const radius = 230;
        
        // Liste de prénoms pour les joueurs
        const playerNames = [
            "Alex", "Sam", "Jordan", "Charlie", 
            "Morgan", "Taylor", "Casey", "Jamie",
            "Avery", "Riley", "Quinn", "Parker",
            "Eden", "Skylar", "Robin", "Sage",
            "Blair", "Winter", "Storm", "Phoenix"
        ];

        // Positions aléatoires pour les chaises spéciales et piégées
        const specialPositions = [
            Math.floor(Math.random() * numberOfChairs), // Position pour special-1 (magenta)
            Math.floor(Math.random() * numberOfChairs), // Position pour special-2 (dorée)
            Math.floor(Math.random() * numberOfChairs), // Position pour special-3 (rouge)
            Math.floor(Math.random() * numberOfChairs)  // Position pour special-4 (jaune)
        ];

        // Positions pour les chaises piégées
        const trappedPositions = [];
        while (trappedPositions.length < 2) {
            const pos = Math.floor(Math.random() * numberOfChairs);
            if (!specialPositions.includes(pos) && !trappedPositions.includes(pos)) {
                trappedPositions.push(pos);
            }
        }

        // Mélanger les noms des joueurs
        const shuffledNames = [...playerNames].sort(() => Math.random() - 0.5);

        for (let i = 0; i < numberOfChairs; i++) {
            const angle = (i / numberOfChairs) * 2 * Math.PI;
            const x = radius * Math.cos(angle);
            const y = radius * Math.sin(angle);
            const rotation = angle * 180 / Math.PI + 90;

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
            
            // Appliquer la transformation initiale
            chair.style.position = 'absolute';
            chair.style.left = '50%';
            chair.style.top = '50%';
            chair.style.transform = `translate(calc(-50% + ${x}px), calc(-50% + ${y}px)) rotate(${rotation}deg)`;
            
            // Effet de disparition aléatoire seulement pour les chaises normales
            if (!chair.classList.contains('special-1') && 
                !chair.classList.contains('special-2') && 
                !chair.classList.contains('special-3') && 
                !chair.classList.contains('special-4') && 
                !trappedPositions.includes(i) && 
                Math.random() < 0.2) {
                chair.classList.add('vanishing');
            }
            
            console.log(`Chaise ${i} créée: x=${x}, y=${y}, angle=${rotation}`);
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
    } else {
        console.error("Le conteneur des chaises n'a pas été trouvé!");
    }

    // Animation des messages flottants
    const messages = document.querySelectorAll('.message');
    messages.forEach(message => {
        const delay = parseInt(message.dataset.delay);
        setTimeout(() => {
            message.style.animation = 'messageFloat 4s ease-in-out infinite';
        }, delay);
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

    // Animation de la grille néon
    const neonGrid = document.querySelector('.neon-grid');
    if (neonGrid) {
        let gridOffset = 0;

        function animateGrid() {
            gridOffset += 0.5;
            neonGrid.style.backgroundPosition = `${gridOffset}px ${gridOffset}px`;
            requestAnimationFrame(animateGrid);
        }
        animateGrid();
    }

    // Effet de glitch sur les boutons
    document.querySelectorAll('.glitch-button').forEach(button => {
        button.addEventListener('mouseenter', () => {
            button.classList.add('active');
        });

        button.addEventListener('mouseleave', () => {
            button.classList.remove('active');
        });
    });

    // Animation des mascottes Woolfy
    const mascot = document.querySelector('.mascot-woolfy');
    const mascot2 = document.querySelector('.mascot-woolfy-2');
    let currentChairIndex = 0;
    let currentChairIndex2 = Math.floor(Math.random() * 10); // Position de départ différente
    let chairs = [];

    function initializeWoolfy() {
        chairs = document.querySelectorAll('.chair');
        if (chairs.length > 0) {
            moveWoolfy();
            moveWoolfy2();
            setInterval(moveWoolfy, 4000);
            setInterval(moveWoolfy2, 3500); // Timing légèrement différent
        }
    }

    function moveWoolfy() {
        const nextChairIndex = Math.floor(Math.random() * chairs.length);
        const chair = chairs[nextChairIndex];
        const currentChair = chairs[currentChairIndex];
        
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
            mascot.style.transform = `translate(${endX}px, ${endY}px) scale(${randomScale})`;
        }, 1500);
        
        currentChairIndex = nextChairIndex;
    }

    function moveWoolfy2() {
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
            mascot2.style.transform = `translate(${endX}px, ${endY}px) scale(${randomScale})`;
        }, 1500);
        
        currentChairIndex2 = nextChairIndex;
    }

    // Initialiser après que les chaises sont générées
    setTimeout(() => {
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
                
                // Retourner la carte après 2 secondes
                setTimeout(() => {
                    card.classList.remove('flipped');
                    setTimeout(() => {
                        isFlipping = false;
                    }, 600); // Durée de l'animation
                }, 2000);
            }
        });
    });

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
}); 