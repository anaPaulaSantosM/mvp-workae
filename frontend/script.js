document
  .getElementById('waitlistForm')
  .addEventListener('submit', async function (e) {
    e.preventDefault();

    const email = e.target.querySelector('input').value;

    const response = await fetch('http://localhost:3334/api/waitlist', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email })
    });

    const result = await response.json();

    if (response.ok) {
      const popup = document.getElementById('popup');
      popup.style.display = 'flex';
      e.target.reset();

      const closeBtn = document.querySelector('.popup-close');
      closeBtn.addEventListener('click', () => {
        popup.style.display = 'none';
      });

      popup.addEventListener('click', (event) => {
        if (event.target === popup) {
          popup.style.display = 'none';
        }
      });
    } else {
      alert(result.message || result.error);
    }
  });

document.addEventListener('DOMContentLoaded', () => {
  const slides = document.querySelector('.carousel-slides');
  const slide = document.querySelectorAll('.carousel-slide');
  const prevBtn = document.querySelector('.carousel-nav .prev');
  const nextBtn = document.querySelector('.carousel-nav .next');

  let currentIndex = 0;
  const slideWidth = slide[0].clientWidth;

  function goToSlide(index) {
    slides.style.transform = `translateX(-${index * slideWidth}px)`;
    currentIndex = index;
  }

  prevBtn.addEventListener('click', () => {
    const newIndex = (currentIndex - 1 + slide.length) % slide.length;
    goToSlide(newIndex);
  });

  nextBtn.addEventListener('click', () => {
    const newIndex = (currentIndex + 1) % slide.length;
    goToSlide(newIndex);
  });

  setInterval(() => {
    const newIndex = (currentIndex + 1) % slide.length;
    goToSlide(newIndex);
  }, 5000);
});
