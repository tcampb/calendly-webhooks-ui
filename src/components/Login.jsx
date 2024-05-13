import { OAUTH_URL } from "../calendly/config"
import { Button, Flex } from "@mantine/core"
import calendly from '../assets/calendly.png'
import { generateRandomString, pkceChallengeFromVerifier } from "../calendly/auth";

const onLogin = async () => {
    const usePKCE = !!window.crypto;

    if (!usePKCE) {
        return window.location = OAUTH_URL;
    }

    const state = generateRandomString();
    localStorage.setItem("pkce_state", state);
    const code_verifier = generateRandomString();
    localStorage.setItem("pkce_code_verifier", code_verifier);

    const code_challenge = await pkceChallengeFromVerifier(code_verifier);

    const url = [
        OAUTH_URL,
        `&response_type=code`,
        `state=${encodeURIComponent(state)}`,
        `code_challenge=${encodeURIComponent(code_challenge)}`,
        `code_challenge_method=S256`
    ].join("&");

    window.location = url;
}

export default function Login() {
    return (
        <Flex justify={'center'}>
            <Button onClick={onLogin} mt={'xl'} style={{
                backgroundColor: 'rgb(0, 105, 255)'
            }} leftSection={<img height={'35px'} width={'35px'} src={calendly} alt="React Logo" />} variant="filled" size="lg">
                Login with Calendly
            </Button>
        </Flex>
    )
}