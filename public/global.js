/* ========================================
   ALFAAZ COLLECTIVE — GLOBAL SCRIPTS
======================================== */

const API_URL = "https://alfaaz-project.onrender.com";

// 1. Master UI Binding
window.refreshGlobalEffects = function() {
    if (window.lucide) { lucide.createIcons(); }

    document.querySelectorAll('.magnetic').forEach(element => {
        if (element.dataset.magneticAttached === 'true') return;
        element.addEventListener('mousemove', (e) => {
            const rect = element.getBoundingClientRect();
            const x = e.clientX - rect.left - rect.width / 2;
            const y = e.clientY - rect.top - rect.height / 2;
            element.style.transform = `translate(${x * 0.3}px, ${y * 0.3}px)`;
        });
        element.addEventListener('mouseleave', () => { element.style.transform = 'translate(0, 0)'; });
        element.dataset.magneticAttached = 'true';
    });
};

document.addEventListener('DOMContentLoaded', window.refreshGlobalEffects);

// 2. Global Fetch Wrapper
window.globalApiFetch = async function(endpoint, options = {}) {
    const token = localStorage.getItem('alfaaz_token');
    const headers = { 'Content-Type': 'application/json' };
    if (token) headers['Authorization'] = `Bearer ${token}`;
    
    try {
        const response = await fetch(`${API_URL}${endpoint}`, { ...options, headers: { ...headers, ...(options.headers || {}) } });
        if (response.status === 401 || response.status === 403) { localStorage.clear(); window.location.href = 'login.html'; return null; }
        return response;
    } catch (error) { console.error("API fetch error:", error); throw error; }
};

// 3. Staggered Cascading Translations (Rippling Heartbeat)
(function() {
  function startLanguageCycle() {
    const bilingualElements = document.querySelectorAll('.ur-hover');
    if (bilingualElements.length === 0) return;

    setInterval(() => {
      bilingualElements.forEach((el, index) => {
        // This sets off a beautiful cascading wave 120ms apart
        setTimeout(() => {
          el.classList.toggle('lang-swapped');
        }, index * 120); 
      });
    }, 5000); 
  }
  
  // Ensures it runs reliably
  if (document.readyState === 'loading') { document.addEventListener('DOMContentLoaded', startLanguageCycle); } 
  else { startLanguageCycle(); }
})();