'use strict';

// Cache buster function
function cacheBuster() {
    const timestamp = new Date().getTime();
    const scripts = document.getElementsByTagName('script');

    for (let i = 0; i < scripts.length; i++) {
        const src = scripts[i].src;
        // Append cache busting parameter if src exists
        if (src) {
            scripts[i].src = src.split('?')[0] + '?v=' + timestamp;
        }
    }
}

// Execute cache buster on page load
window.onload = cacheBuster;