const revealItems = document.querySelectorAll('.product-card, .proof-grid article, .metric-rail div, .section-heading, .bundle-section, .feature-window');

const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
      revealObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.12 });

revealItems.forEach((item) => {
  item.classList.add('reveal');
  revealObserver.observe(item);
});

const panelRows = Array.from(document.querySelectorAll('.visual-panel b'));
let activeRow = 0;

function pulsePanel() {
  panelRows.forEach((row, index) => {
    row.style.background = index === activeRow ? 'rgba(90, 94, 255, 0.42)' : 'transparent';
    row.style.color = index === activeRow ? '#ffffff' : '#dbe0ff';
  });
  activeRow = (activeRow + 1) % panelRows.length;
}

if (panelRows.length > 0) {
  pulsePanel();
  window.setInterval(pulsePanel, 1200);
}
