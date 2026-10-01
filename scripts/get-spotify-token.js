#!/usr/bin/env node

/**
 * Spotify Refresh Token Generator
 *
 * Reads SPOTIFY_CLIENT_ID / SPOTIFY_CLIENT_SECRET from the environment:
 *
 * 1. node --env-file=.env.local scripts/get-spotify-token.js
 *    Open the printed URL, authorize, and copy the `code` from the redirect URL.
 * 2. node --env-file=.env.local scripts/get-spotify-token.js <code>
 *    Prints the refresh token to put in SPOTIFY_REFRESH_TOKEN.
 */

const CLIENT_ID = process.env.SPOTIFY_CLIENT_ID;
const CLIENT_SECRET = process.env.SPOTIFY_CLIENT_SECRET;
const REDIRECT_URI = 'http://127.0.0.1:3000/callback'; // Must use 127.0.0.1, not localhost (Spotify requirement)

if (!CLIENT_ID || !CLIENT_SECRET) {
    console.error('Missing SPOTIFY_CLIENT_ID / SPOTIFY_CLIENT_SECRET. Run with --env-file=.env.local');
    process.exit(1);
}

// The Web Playback SDK refuses to start without streaming + user-read-email +
// user-read-private, and reports it as an authentication_error.
const SCOPES = [
    'streaming',
    'user-read-email',
    'user-read-private',
    'user-read-currently-playing',
    'user-read-playback-state',
    'user-modify-playback-state',
    'playlist-read-private',
    'playlist-read-collaborative',
    // "On repeat" on the home page reads the account's most-played tracks.
    'user-top-read',
].join(' ');

const code = process.argv[2];

if (!code) {
    const params = new URLSearchParams({
        client_id: CLIENT_ID,
        response_type: 'code',
        redirect_uri: REDIRECT_URI,
        scope: SCOPES,
        show_dialog: 'true',
    });
    console.log('\n🎵 Spotify Refresh Token Generator\n');
    console.log('Step 1: Open this URL in your browser:\n');
    console.log(`https://accounts.spotify.com/authorize?${params}`);
    console.log(`\nStep 2: You'll land on ${REDIRECT_URI}?code=XXXX (the page itself may 404 — that's fine).`);
    console.log('Step 3: Run this script again with the code:\n');
    console.log('  node --env-file=.env.local scripts/get-spotify-token.js <code>\n');
    process.exit(0);
}

(async () => {
    const res = await fetch('https://accounts.spotify.com/api/token', {
        method: 'POST',
        headers: {
            Authorization: `Basic ${Buffer.from(`${CLIENT_ID}:${CLIENT_SECRET}`).toString('base64')}`,
            'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
            grant_type: 'authorization_code',
            code,
            redirect_uri: REDIRECT_URI,
        }),
    });
    const data = await res.json();

    if (!res.ok) {
        console.error('Token exchange failed:', data);
        process.exit(1);
    }

    const me = await fetch('https://api.spotify.com/v1/me', {
        headers: { Authorization: `Bearer ${data.access_token}` },
    }).then((r) => r.json());

    console.log('\nScopes:', data.scope);
    if (me.product !== 'premium') {
        console.warn(`\n⚠️  Account tier is "${me.product}". In-browser playback needs Spotify Premium.`);
    }
    console.log('\nSPOTIFY_REFRESH_TOKEN=' + data.refresh_token);
    console.log('\nPut that in .env.local and in the Vercel project env vars, then redeploy.\n');
})();
