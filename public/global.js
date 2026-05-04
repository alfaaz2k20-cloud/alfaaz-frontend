/* ========================================
   ALFAAZ COLLECTIVE — GLOBAL SCRIPTS
======================================== */

// 1. Initialize Global Configuration
const API_URL = "https://alfaaz-project.onrender.com";

// 2. The Master Refresh Function
window.refreshGlobalEffects = function() {
    
    // A. Re-bind Lucide Icons
    if (window.lucide) {
        lucide.createIcons();
    }

    // B. Re-bind Magnetic Effects safely
    document.querySelectorAll('.magnetic').forEach(element => {
        if (element.dataset.magneticAttached === 'true') return;
        
        element.addEventListener('mousemove', (e) => {
            const rect = element.getBoundingClientRect();
            const x = e.clientX - rect.left - rect.width / 2;
            const y = e.clientY - rect.top - rect.height / 2;
            element.style.transform = `translate(${x * 0.3}px, ${y * 0.3}px)`;
        });
        
        element.addEventListener('mouseleave', () => {
            element.style.transform = 'translate(0, 0)';
        });

        element.dataset.magneticAttached = 'true';
    });
};

// Run once DOM loads
document.addEventListener('DOMContentLoaded', window.refreshGlobalEffects);

// 3. Global API Fetch Wrapper
window.globalApiFetch = async function(endpoint, options = {}) {
    const token = localStorage.getItem('alfaaz_token');
    const headers = { 'Content-Type': 'application/json' };
    
    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
    }

    try {
        const response = await fetch(`${API_URL}${endpoint}`, {
            ...options,
            headers: { ...headers, ...(options.headers || {}) }
        });

        if (response.status === 401 || response.status === 403) {
            localStorage.clear();
            window.location.href = 'login.html';
            return null; 
        }

        return response;
    } catch (error) {
        console.error("API fetch error:", error);
        throw error;
    }
};

// 4. The Bilingual Heartbeat (Staggered Cascade)
(function() {
  function startLanguageCycle() {
    const bilingualElements = document.querySelectorAll('.ur-hover');
    if (bilingualElements.length === 0) return;

    setInterval(() => {
      bilingualElements.forEach((el, index) => {
        // Stagger the class toggle by 150ms per element for a ripple effect
        setTimeout(() => {
          el.classList.toggle('lang-swapped');
        }, index * 150); 
      });
    }, 5000); 
  }

  document.addEventListener('DOMContentLoaded', startLanguageCycle);
})();