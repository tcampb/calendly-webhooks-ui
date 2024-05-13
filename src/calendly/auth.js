import axios from 'axios'
import { CLIENT_ID, REDIRECT_URI } from './config'


const auth = axios.create({
    baseURL: "https://auth.calendly.com",
});

export const requestToken = async ({ code }) => {
    try {
        const { data } = await auth.post('/oauth/token', {
            client_id: CLIENT_ID,
            redirect_uri: REDIRECT_URI,
            grant_type: 'authorization_code',
            code
        })

        return [true, data]
    } catch (e) {
        return [false, e]
    }
}