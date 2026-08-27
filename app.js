document.addEventListener('DOMContentLoaded', function() {
  const navbarToggler = document.querySelector('.navbar-toggler');
  const navbarCollapse = document.getElementById('navbarNav');

  if (navbarToggler && navbarCollapse) {
    navbarToggler.addEventListener('click', function() {
      const isExpanded = this.getAttribute('aria-expanded') === 'true' || false;
      this.setAttribute('aria-expanded', !isExpanded);
      navbarCollapse.classList.toggle('show');
      this.classList.toggle('open'); 
    });
  }

  const heroSection = document.querySelector('.hero-section');
  const sliderLeftArrow = document.querySelector('.slider-arrow-left');
  const sliderRightArrow = document.querySelector('.slider-arrow-right');

  const heroBackgrounds = [
    'url("assets/images/smartwatch-background.jpg")',
    'url("https://placehold.co/1200x400/007bff/ffffff?text=Second+Hero+Image")'
  ];
  let currentSlide = 0;

  function updateHeroBackground() {
    heroSection.style.backgroundImage = heroBackgrounds[currentSlide];
  }

  if (sliderLeftArrow && sliderRightArrow && heroSection) {
    sliderRightArrow.addEventListener('click', function() {
      currentSlide = (currentSlide + 1) % heroBackgrounds.length;
      updateHeroBackground();
    });

    sliderLeftArrow.addEventListener('click', function() {
      currentSlide = (currentSlide - 1 + heroBackgrounds.length) % heroBackgrounds.length;
      updateHeroBackground();
    });

    updateHeroBackground();
  }
});
