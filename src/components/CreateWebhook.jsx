import { useEffect, useState } from 'react'
import CalendlyApi from '../calendly/api'
import { notifications } from '@mantine/notifications';
import { Button, Center, Checkbox, Divider, Flex, NativeSelect, Paper, TextInput } from '@mantine/core'
import { useNavigate } from 'react-router-dom';

export default function CreateWebhook() {
    const navigate = useNavigate()
    const [role, setRole] = useState(null)
    const [signingKey, setSigningKey] = useState(null)
    const [organization, setOrganization] = useState(null)
    const [user, setUser] = useState(null)
    const [groups, setGroups] = useState([])
    const isAdmin = ['owner', 'admin'].includes(role)
    const [url, setUrl] = useState('')
    const [loading, setLoading] = useState(false)
    const [scope, setScope] = useState('user')
    const [group, setGroup] = useState(groups[0] && groups[0].uri)
    const [events, setEvents] = useState([])
    const isValid = events.length > 0 && url && (scope === 'group' ? group : true)
    const scopes = [
        { label: 'My Account', value: 'user' },
        { label: 'Organization', value: 'organization', disabled: !isAdmin },
        { label: 'Group', value: 'group', disabled: !isAdmin }
    ]

    const onSubmit = async (e) => {
        e.preventDefault()
        setLoading(true)
        const api = new CalendlyApi();

        const [success, data] = await api.createWebhook({
            events,
            organization,
            user,
            url,
            group,
            scope,
            signing_key: signingKey
        })


        if (success) {
            notifications.show({
                color: 'green',
                title: 'Webhook created'
            })

            const query = ['user', 'organization'].includes(scope) ? `?scope=${scope}` : ''

            navigate(`/webhooks${query}`)
        } else {
            notifications.show({
                color: 'red',
                title: 'Error',
                message: JSON.stringify(data)
            })
        }

        setLoading(false)
    }

    useEffect(() => {
        const api = new CalendlyApi();
        api.getUserMembership().then(([success, data]) => {
            if (success) {
                setRole(data.role)
                setOrganization(data.organization)
                setUser(data.user)
            }
        })

        api.getGroups().then(([success, data]) => {
            if (success) {
                setGroups(data.collection)
            }
        })

    }, [])

    return (
        <Flex justify={'center'}>
            <Paper shadow="lg" p="xl">
                <form style={{ minWidth: '550px' }} onSubmit={onSubmit}>
                    <TextInput
                        type='url'
                        label="Callback URL"
                        placeholder="https://zapier.com/hooks/standard/123456"
                        required={true}
                        onChange={(e) => setUrl(e.target.value)}
                    />

                    <Divider my="md" />

                    <NativeSelect
                        label="Scope"
                        data={scopes}
                        onChange={(e) => {
                            setEvents([])
                            setScope(e.target.value)

                            if (e.target.value === 'group') {
                                setGroup(groups[0] && groups[0].uri)
                            }
                        }}
                        value={scope}
                    />

                    <Divider my="md" />

                    {scope === 'group' && (
                        <NativeSelect
                            label="Group"
                            data={groups.map(group => ({ label: group.name, value: group.uri }))}
                            onChange={(e) => setGroup(e.target.value)}
                            value={group}
                        />
                    )}

                    {scope === 'group' && <Divider my="md" />}

                    <Checkbox.Group
                        defaultValue={[]}
                        label="Events"
                        withAsterisk
                        onChange={setEvents}
                        value={events}
                    >
                        <Checkbox p={'xs'} value="invitee.created" label="Invitee created" />
                        <Checkbox p={'xs'} value="invitee.canceled" label="Invitee canceled" />
                        {scope !== 'group' && <Checkbox p={'xs'} value="invitee_no_show.created" label="No show created" />}
                        {scope === 'organization' && <Checkbox p={'xs'} value="routing_form_submission.created" label="Routing form submission created" />}
                    </Checkbox.Group>

                    <Divider my="md" />

                    <TextInput
                        type='text'
                        label="Signing key (optional)"
                        placeholder="1d3b42bad545429797fef3776f6e0e57"
                        onChange={(e) => setSigningKey(e.target.value)}
                    />

                    <Divider my="md" />

                    <Center>
                        <Button disabled={loading || !isValid} type='submit'>Create Webhook</Button>
                    </Center>
                </form>
            </Paper>
        </Flex>
    )
}