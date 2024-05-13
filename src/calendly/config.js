export const CLIENT_ID = "hR_U-DOgrKWuh2KQSK2VwGhndi5zDyQVVA07nR4yDh0"
export const REDIRECT_URI = "http://localhost:5173/oauth/callback"
export const OAUTH_URL = `https://auth.calendly.com/oauth/authorize?client_id=${encodeURIComponent(CLIENT_ID)}&redirect_uri=${encodeURIComponent(REDIRECT_URI)}&response_type=code`