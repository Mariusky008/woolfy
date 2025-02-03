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

    // ... tout le reste du code JavaScript ...
}); 