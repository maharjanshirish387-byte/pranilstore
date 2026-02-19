'use strict';

// Function to add a cache buster to URLs
function addCacheBuster(url) {
    // Append timestamp to the URL as a cache buster
    return `${url}?_=${new Date().getTime()}`;
}

// Example usage for an API request
const apiUrl = 'https://api.example.com/data';
const urlWithCacheBuster = addCacheBuster(apiUrl);
console.log('API URL with cache buster:', urlWithCacheBuster);