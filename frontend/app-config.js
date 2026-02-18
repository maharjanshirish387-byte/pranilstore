// Frontend runtime configuration. Edit this to point to your office print API.
window.APP_CONFIG = window.APP_CONFIG || {
    // Use a relative path by default (assumes frontend is served from the same host).
    // For silent printing from customers' browsers, set this to your office server URL,
    // e.g. 'https://office.example.com/api/print-order' (must be reachable from client).
    printApiUrl: '/api/print-order'
};
