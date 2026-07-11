#!/usr/bin/env node

/**
 * Spotify Refresh Token Generator
 * 
 * Run this script once to get your refresh token:
 * 1. Set your CLIENT_ID and CLIENT_SECRET below
 * 2. Run: node scripts/get-spotify-token.js
 * 3. Open the URL in browser, authorize, and copy the code from the redirect URL
 * 4. The script will output your refresh token
 */

const CLIENT_ID = '09efb5dfca5e4a299407530d243f265b';
const CLIENT_SECRET = 'b6e59f1f3fd04e0ea63544658f414376';
const REDIRECT_URI = 'http://127.0.0.1:3000/callback'; // Must use 127.0.0.1, not localhost (Spotify requirement)

const SCOPES = [
    'user-read-currently-playing',
    'user-read-playback-state',
    'user-modify-playback-state',
    'streaming',
    'playlist-read-private',
    'playlist-read-collaborative',
].join('%20');

const authUrl = `https://accounts.spotify.com/authorize?client_id=${CLIENT_ID}&response_type=code&redirect_uri=${encodeURIComponent(REDIRECT_URI)}&scope=${SCOPES}`;

console.log('\n🎵 Spotify Refresh Token Generator\n');
console.log('Step 1: Open this URL in your browser:\n');
console.log(authUrl);
console.log('\nStep 2: After authorization, you will be redirected to a URL like:');
console.log('http://localhost:3000/callback?code=XXXXXXXXXXXX\n');
console.log('Step 3: Copy the "code" parameter and run:');
console.log(`curl -X POST "https://accounts.spotify.com/api/token" \\
  -H "Content-Type: application/x-www-form-urlencoded" \\
  -d "grant_type=authorization_code" \\
  -d "code=YOUR_CODE_HERE" \\
  -d "redirect_uri=${REDIRECT_URI}" \\
  -d "client_id=${CLIENT_ID}" \\
  -d "client_secret=${CLIENT_SECRET}"`);
console.log('\nStep 4: Copy the "refresh_token" from the response and add it to .env.local\n');
