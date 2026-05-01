/* ========================================
   ALFAAZ COLLECTIVE — GLOBAL SCRIPTS
======================================== */

// 1. Initialize Global Configuration
const API_URL = "https://alfaaz-project.onrender.com";

// 2. Cursor Setup
const cursor = document.getElementById('cursor');
let mouseX = 0, mouseY = 0, cursorX = 0, cursorY = 0;

if (cursor) {
    document.addEventListener('mousemove', (e) => {
        mouseX = e.clientX; 
        mouseY = e.clientY;
    });

    function animateCursor() {
        cursorX += (mouseX - cursorX) * 0.15;
        cursorY += (mouseY - cursorY) * 0.15;
        cursor.style.left = cursorX + 'px';
        cursor.style.top = cursorY + 'px';
        requestAnimationFrame(animateCursor);
    }
    animateCursor();
}

// Hover effect functions defined safely outside the loop
function handleHoverEnter() { if (cursor) cursor.classList.add('hover'); }
function handleHoverLeave() { if (cursor) cursor.classList.remove('hover'); }

// 3. The Master Refresh Function
// Call this function whenever you fetch new data and inject it into the HTML
window.refreshGlobalEffects = function() {
    
    // A. Re-bind Lucide Icons if new ones were added
    if (window.lucide) {
        lucide.createIcons();
    }

    // B. Re-bind Cursor Hovers
    const hoverElements = document.querySelectorAll('.magnetic, a, button, .update-card, .club-card, .feature-item');
    hoverElements.forEach(el => {
        // Remove first to prevent duplicate firing, then add
        el.removeEventListener('mouseenter', handleHoverEnter);
        el.removeEventListener('mouseleave', handleHoverLeave);
        el.addEventListener('mouseenter', handleHoverEnter);
        el.addEventListener('mouseleave', handleHoverLeave);
    });

    // C. Re-bind Magnetic Effects safely using data attributes
    document.querySelectorAll('.magnetic').forEach(element => {
        // If we already attached the magnetic listener to this element, skip it.
        // This prevents memory leaks and protects your existing click events.
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

        // Mark as attached
        element.dataset.magneticAttached = 'true';
    });
};

// Run the master refresh once the DOM initially loads
document.addEventListener('DOMContentLoaded', window.refreshGlobalEffects);


// 4. Global API Fetch Wrapper
// Use this across your site to handle authorization and session expiry automatically
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

        // If the token is dead or spoofed, boot them to login immediately
        if (response.status === 401 || response.status === 403) {
            localStorage.clear();
            window.location.href = 'login.html';
            return null; // Return null so the calling function knows it failed
        }

        return response;
    } catch (error) {
        console.error("Transmission Intercepted:", error);
        throw error;
    }
};