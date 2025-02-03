import React, { useEffect } from 'react';
import './styles/home.css';

declare global {
  interface Window {
    gameInitialized?: boolean;
  }
}

const HomePage: React.FC = () => {
  useEffect(() => {
    // Éviter les chargements multiples du script
    if (!document.getElementById('game-script')) {
      const script = document.createElement('script');
      script.src = new URL('./scripts/home.js', import.meta.url).href;
      script.id = 'game-script'; // Ajouter un ID unique
      script.async = false;
      
      script.onload = () => {
        console.log('Script chargé avec succès');
        // Déclencher l'événement DOMContentLoaded une seule fois
        if (!window.gameInitialized) {
          window.gameInitialized = true;
          const event = new Event('DOMContentLoaded');
          document.dispatchEvent(event);
        }
      };

      script.onerror = (e) => {
        console.error('Erreur de chargement du script:', e);
      };

      document.body.appendChild(script);
    }

    return () => {
      const script = document.getElementById('game-script');
      if (script) {
        document.body.removeChild(script);
      }
      window.gameInitialized = false;
    };
  }, []);

  useEffect(() => {
    // Ajouter Font Awesome et Google Fonts dans le head
    const links = [
      {
        rel: 'stylesheet',
        href: 'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css'
      },
      {
        rel: 'stylesheet',
        href: 'https://fonts.googleapis.com/css2?family=Orbitron:wght@400;700&family=Raleway:wght@300;400;600&display=swap'
      }
    ];

    links.forEach(link => {
      const linkElement = document.createElement('link');
      linkElement.rel = link.rel;
      linkElement.href = link.href;
      document.head.appendChild(linkElement);
    });

    return () => {
      // Retirer les liens ajoutés
      links.forEach(link => {
        const element = document.querySelector(`link[href="${link.href}"]`);
        if (element) {
          element.remove();
        }
      });
    };
  }, []);

  return (
    <>
      <nav className="nav-header">
        <div className="woolfy-icon">
          <div className="woolfy-icon-inner">
            <div className="woolfy-icon-eyes"></div>
          </div>
        </div>
        <button className="login-button">Connexion</button>
      </nav>
      <div className="cyberpunk-overlay"></div>
      <div className="smoke-overlay"></div>

      <header className="hero">
        <div className="neon-grid"></div>
        <div className="game-room">
          <div className="circular-table">
            <div className="table-glow"></div>
            <div className="table-lines"></div>
            <div className="table-center">
              <div className="table-center-glow"></div>
      </div>

          <div className="chairs-container">
              {/* Les chaises sont générées par le script */}
            </div>
            <div className="mascot-woolfy">
              <div className="mascot-woolfy-inner">
                <div className="mascot-woolfy-eyes"></div>
              </div>
            </div>
            <div className="mascot-woolfy-2">
              <div className="mascot-woolfy-inner">
                <div className="mascot-woolfy-eyes"></div>
              </div>
            </div>
          </div>

          <div className="game-chat-container">
            <div className="game-chat-header">
              <span className="game-chat-title">Chat de la partie</span>
            </div>
            <div className="game-chat-messages">
              <div className="game-chat-notification welcome">
                <i className="fas fa-crown"></i>
                Bienvenue dans la partie !
              </div>
              <div className="game-chat-notification video">
                <i className="fas fa-video"></i>
                Marc vient d'envoyer une vidéo à Louise
              </div>
              <div className="game-chat-notification voice">
                <i className="fas fa-microphone"></i>
                Greg vient de laisser un vocal à Lolo
              </div>
              <div className="game-chat-notification info">
                <i className="fas fa-circle-info"></i>
                La partie commence dans 2 minutes
              </div>
              <div className="game-chat-notification warning">
                <i className="fas fa-triangle-exclamation"></i>
                Une chaise piégée a été découverte !
              </div>
              <div className="game-chat-notification action">
                <i className="fas fa-handshake"></i>
                Sam et Jordan forment une alliance
              </div>
            </div>
          </div>
        </div>

        <div className="hero-content glitch-container">
          <h1 className="main-title glitch" data-text="Woolfy">Woolfy</h1>
          <h2 className="subtitle neon-text">et les Chaises Piégées</h2>
          <p className="tagline cyber-text">
            Un jeu de bluff, de stratégie et de trahison...<br />saurez-vous
            rester assis jusqu'à la fin ?
          </p>

          <div className="countdown-container">
            <p className="next-game">Prochaine partie dans</p>
            <div className="countdown glitch">
              <span className="time">03:24:10</span>
            </div>
          </div>

          <button className="cta-button glitch-button">
            <span className="glitch-text" data-text="JOUER MAINTENANT">JOUER MAINTENANT</span>
            <span className="button-effect"></span>
          </button>
        </div>
      </header>

      <main>
        <section className="concept cyber-section">
          <div className="content-wrapper">
            <div className="concept-header-container">
            <h2 className="glitch-title" data-text="Le Concept">Le Concept</h2>
              <div className="concept-subtitle">Un jeu de survie psychologique dans un univers cyberpunk</div>
            </div>

            <div className="concept-grid">
              <div className="concept-main-card cyber-panel">
                <div className="concept-card-content">
                  <div className="concept-icon">
                    <i className="fas fa-microchip neon-pulse"></i>
                    </div>
                  <h3 className="concept-card-title">Bienvenue dans le futur du divertissement</h3>
                  <p className="concept-description">
                    Dans un monde où la technologie rencontre la psychologie, 20 joueurs s'affrontent dans une 
                    partie mortelle autour d'une table holographique. Votre mission ? Survivre, démasquer Woolfy, 
                    et éviter les chaises piégées qui pourraient sceller votre destin.
                  </p>
                  <div className="concept-highlights">
                    <div className="highlight-item">
                      <span className="highlight-icon"><i className="fas fa-users"></i></span>
                      <span className="highlight-text">20 Joueurs</span>
                    </div>
                    <div className="highlight-item">
                      <span className="highlight-icon"><i className="fas fa-mask"></i></span>
                      <span className="highlight-text">1 Woolfy</span>
                    </div>
                    <div className="highlight-item">
                      <span className="highlight-icon"><i className="fas fa-bomb"></i></span>
                      <span className="highlight-text">5 Pièges</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="concept-features">
                <div className="feature-card cyber-panel">
                  <div className="feature-icon">
                    <i className="fas fa-chess neon-pulse"></i>
                </div>
                  <h4>Stratégie</h4>
                  <p>Chaque décision compte. Choisissez votre siège, formez des alliances, et planifiez vos actions avec précision.</p>
                </div>

                <div className="feature-card cyber-panel">
                  <div className="feature-icon">
                    <i className="fas fa-mask neon-pulse"></i>
              </div>
                  <h4>Bluff</h4>
                  <p>Maîtrisez l'art de la déception. Mentez, manipulez, et restez en vie dans ce jeu d'esprit.</p>
                </div>

                <div className="feature-card cyber-panel">
                  <div className="feature-icon">
                    <i className="fas fa-video neon-pulse"></i>
                  </div>
                  <h4>Interaction Live</h4>
                  <p>Communiquez en temps réel via vidéo, audio et chat. Observez les réactions et détectez les mensonges.</p>
                </div>
              </div>

              <div className="game-phases cyber-panel">
                <h3 className="phases-title">Déroulement d'un Tour</h3>
                <div className="phases-timeline">
                  <div className="phase-item">
                    <div className="phase-marker">01</div>
                    <div className="phase-content">
                      <h5>Placement</h5>
                      <p>Choisissez stratégiquement votre position initiale</p>
                    </div>
                  </div>
                  <div className="phase-item">
                    <div className="phase-marker">02</div>
                    <div className="phase-content">
                      <h5>Discussion</h5>
                      <p>Négociez, débattez et formez des alliances</p>
                    </div>
                  </div>
                  <div className="phase-item">
                    <div className="phase-marker">03</div>
                    <div className="phase-content">
                      <h5>Action</h5>
                      <p>Votez pour déplacer ou révéler une chaise</p>
            </div>
                </div>
                  <div className="phase-item">
                    <div className="phase-marker">04</div>
                    <div className="phase-content">
                      <h5>Phase Woolfy</h5>
                      <p>Woolfy peut éliminer un joueur s'il reste caché</p>
                </div>
                </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="statistics cyber-section">
          <div className="content-wrapper">
            <div className="stats-header">
              <h2 className="glitch-title" data-text="Statistiques Live">Statistiques Live</h2>
              <div className="stats-subtitle">Les chiffres parlent d'eux-mêmes</div>
            </div>

            <div className="stats-container">
              <div className="stat-card cyber-panel">
                <div className="stat-icon">
                  <i className="fas fa-users-between-lines neon-pulse"></i>
                </div>
                <div className="stat-content">
                  <div className="stat-value glitch" data-text="27%">27%</div>
                  <div className="stat-line"></div>
                  <p className="stat-description">
                    des joueurs ont trouvé des alliés... des amitiés se sont faites, des amours sont nées ici même
                  </p>
                </div>
                <div className="stat-background"></div>
              </div>

              <div className="stat-card cyber-panel">
                <div className="stat-icon">
                  <i className="fas fa-mask neon-pulse"></i>
                </div>
                <div className="stat-content">
                  <div className="stat-value glitch" data-text="87%">87%</div>
                  <div className="stat-line"></div>
                  <p className="stat-description">
                    adorent le frisson du bluff parfait
                  </p>
                </div>
                <div className="stat-background"></div>
              </div>

              <div className="stat-card cyber-panel">
                <div className="stat-icon">
                  <i className="fas fa-heart-pulse neon-pulse"></i>
                </div>
                <div className="stat-content">
                  <div className="stat-value glitch" data-text="93%">93%</div>
                  <div className="stat-line"></div>
                  <p className="stat-description">
                    ont ressenti l'adrénaline pure du jeu
                  </p>
                </div>
                <div className="stat-background"></div>
              </div>
            </div>

            <div className="stats-grid">
              <div className="mini-stat cyber-panel">
                <i className="fas fa-clock neon-pulse"></i>
                <span className="mini-stat-value">15min</span>
                <span className="mini-stat-label">Durée moyenne</span>
              </div>
              <div className="mini-stat cyber-panel">
                <i className="fas fa-trophy neon-pulse"></i>
                <span className="mini-stat-value">10K+</span>
                <span className="mini-stat-label">Parties jouées</span>
              </div>
              <div className="mini-stat cyber-panel">
                <i className="fas fa-star neon-pulse"></i>
                <span className="mini-stat-value">4.8/5</span>
                <span className="mini-stat-label">Note moyenne</span>
        </div>
              <div className="mini-stat cyber-panel">
                <i className="fas fa-users neon-pulse"></i>
                <span className="mini-stat-value">50K+</span>
                <span className="mini-stat-label">Joueurs actifs</span>
        </div>
      </div>
    </div>
        </section>

        <section className="cta-final cyber-section">
          <div className="content-wrapper">
            <div className="cta-grid">
              <div className="cta-content">
                <h2 className="glitch-title" data-text="Prêt à Jouer ?">Prêt à Jouer ?</h2>
                <p className="cta-description">
                  Le jeu commence. Les alliances se forment.<br/>
                  <span className="highlight-text">Woolfy est déjà à l'affût...</span>
                </p>
                
                <div className="cta-features">
                  <div className="cta-feature">
                    <i className="fas fa-shield-halved neon-pulse"></i>
                    <span>Serveurs sécurisés</span>
                  </div>
                  <div className="cta-feature">
                    <i className="fas fa-bolt neon-pulse"></i>
                    <span>Matchmaking instantané</span>
                  </div>
                  <div className="cta-feature">
                    <i className="fas fa-ranking-star neon-pulse"></i>
                    <span>Système de classement</span>
                  </div>
                </div>

            <button className="cta-button glitch-button">
              <span className="glitch-text" data-text="REJOINDRE LA PROCHAINE PARTIE">
                REJOINDRE LA PROCHAINE PARTIE
              </span>
              <span className="button-effect"></span>
            </button>
              </div>

              <div className="cta-mascot">
                <div className="mascot-container cyber-panel">
                  <div className="mascot-woolfy-large">
                    <div className="mascot-woolfy-inner">
                      <div className="mascot-woolfy-eyes"></div>
                    </div>
                  </div>
                  <div className="mascot-shadow"></div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
    </>
  );
};

export default HomePage; 