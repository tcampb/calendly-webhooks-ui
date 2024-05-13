import { OAUTH_URL } from "../calendly/config"
import { Button, Flex } from "@mantine/core"
import calendly from '../assets/calendly.png'

export default function Login() {
    return (
        <Flex justify={'center'}>
            <Button mt={'xl'} style={{
                backgroundColor: 'rgb(0, 105, 255)'
            }} component="a" href={OAUTH_URL} leftSection={<img height={'35px'} width={'35px'} src={calendly} alt="React Logo" />} variant="filled" size="lg">
                Login with Calendly
            </Button>
        </Flex>
    )
}