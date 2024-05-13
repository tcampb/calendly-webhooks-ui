import axios from 'axios'
import { CLIENT_ID, REDIRECT_URI } from './config'


const auth = axios.create({
    baseURL: "https://auth.calendly.com",
});

export const requestToken = async ({ code, code_verifier }) => {
    try {
        const payload = {
            client_id: CLIENT_ID,
            redirect_uri: REDIRECT_URI,
            grant_type: 'authorization_code',
            code
        }

        if (code_verifier) {
            payload.code_verifier = code_verifier
        }

        const { data } = await auth.post('/oauth/token', payload)

        return [true, data]
    } catch (e) {
        return [false, e]
    }
}

export function generateRandomString() {
    const array = new Uint32Array(28);
    window.crypto.getRandomValues(array);
    return Array.from(array, dec => ('0' + dec.toString(16)).substring(-2)).join('');
}

export function sha256(plain) {
    const encoder = new TextEncoder();
    const data = encoder.encode(plain);
    return window.crypto.subtle.digest('SHA-256', data);
}

export function base64urlencode(str) {
    // Convert the ArrayBuffer to string using Uint8 array to conver to what btoa accepts.
    // btoa accepts chars only within ascii 0-255 and base64 encodes them.
    // Then convert the base64 encoded to base64url encoded
    //   (replace + with -, replace / with _, trim trailing =)
    return window.btoa(String.fromCharCode.apply(null, new Uint8Array(str)))
        .replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

export async function pkceChallengeFromVerifier(v) {
    const hashed = await sha256(v);
    return base64urlencode(hashed);
}