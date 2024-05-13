import { ActionIcon, Button, Flex, NativeSelect, Skeleton, Modal, Text, Center, UnstyledButton } from "@mantine/core";


import { Table } from '@mantine/core';
import { IconTrash } from "@tabler/icons-react";
import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import CalendlyApi from "../calendly/api";

import { useDisclosure } from '@mantine/hooks';

export default function Webhooks() {
    const [searchParams, setSearchParams] = useSearchParams();
    const [webhooks, setWebhooks] = useState([])
    const [loading, setLoading] = useState(true)
    const [scope, setScope] = useState(searchParams.get('scope') === 'organization' ? 'organization' : 'user')
    const [nextPage, setNextPage] = useState(null)
    const [prevPage, setPrevPage] = useState(null)
    const [opened, { open, close }] = useDisclosure(false);
    const [selectedWebhook, setSelectedWebhook] = useState(null)
    const [isDeleting, setIsDeleting] = useState(false)
    const [error, setError] = useState(null)

    const fetchWebhooks = async ({ scope, pageToken }) => {
        setLoading(true)
        const api = new CalendlyApi();
        const [success, data] = await api.getWebhooks({ scope, pageToken })

        if (success) {
            setWebhooks(data.collection)
            setNextPage(data.pagination.next_page_token)
            setPrevPage(data.pagination.previous_page_token)
        }

        setLoading(false)
    }

    const onDelete = async () => {
        setIsDeleting(true)
        const api = new CalendlyApi();
        const [success, error] = await api.deleteWebhook(selectedWebhook)
        const isEmptyPage = webhooks.length === 1

        setIsDeleting(false)

        if (success) {
            setWebhooks(webhooks.filter(({ uri }) => uri !== selectedWebhook))

            close()

            if (isEmptyPage) {
                fetchWebhooks({ scope })
            }
        } else {
            setError(JSON.stringify(error))
        }
    }

    const onPagination = (action) => {
        const pageToken = action === 'next' ? nextPage : prevPage

        fetchWebhooks({ scope, pageToken })
    }

    useEffect(() => {
        setWebhooks([])
        setNextPage(null)
        setPrevPage(null)

        fetchWebhooks({ scope })
    }, [scope])

    const rows = webhooks.map(({ callback_url, events, created_at, state, uri }) => (
        <Table.Tr key={uri}>
            <Table.Td>{(new Date(created_at)).toLocaleDateString()}</Table.Td>
            <Table.Td>{events.map(event => {
                return <div key={event}>{event}</div>
            })}</Table.Td>
            <Table.Td>{callback_url}</Table.Td>
            <Table.Td>{state}</Table.Td>
            <Table.Td>
                <ActionIcon onClick={() => {
                    setSelectedWebhook(uri)
                    open()
                }} variant="transparent" aria-label="Delete">
                    <IconTrash color="red" style={{ width: '70%', height: '70%' }} stroke={1.5} />
                </ActionIcon>
            </Table.Td>
        </Table.Tr>
    ));



    return (
        <Flex justify={'center'}>
            <Flex direction={'column'} justify={'space-between'}>
                <Flex mb={'md'} justify={'space-between'}>
                    <NativeSelect label="Scope" data={[{
                        value: 'user',
                        label: 'My Account'
                    }, {
                        value: 'organization',
                        label: 'Organization'
                    }]}
                        onChange={(e) => {
                            setScope(e.target.value)
                            setSearchParams({ scope: e.target.value })
                        }}
                        value={scope}

                    />
                    <Button
                        size="sm"
                        component={Link}
                        to={'/webhooks/new'}
                    >
                        Create Webhook
                    </Button>
                </Flex>
                <Table.ScrollContainer minWidth={800}>
                    <Table>
                        <Table.Thead>
                            <Table.Tr>
                                <Table.Th>Create Date</Table.Th>
                                <Table.Th>Events</Table.Th>
                                <Table.Th>URL</Table.Th>
                                <Table.Th>State</Table.Th>
                                <Table.Th></Table.Th>
                            </Table.Tr>
                        </Table.Thead>
                        <Table.Tbody>
                            {!loading && rows}
                        </Table.Tbody>
                    </Table>
                    {!loading && (
                        <Flex mt='md' justify={'center'}>
                            <Flex w={'25%'} justify={'space-around'}>
                                {prevPage && <UnstyledButton onClick={() => onPagination('previous')}><Text size="lg" c={'blue'}>Previous</Text></UnstyledButton>}
                                {prevPage && nextPage && '|'}
                                {nextPage && <UnstyledButton onClick={() => onPagination('next')}><Text size="lg" c={'blue'}>Next</Text></UnstyledButton>}
                            </Flex>
                        </Flex>
                    )}
                </Table.ScrollContainer>
                {loading && <Skeleton mb={'md'} w={800} h={500}></Skeleton>}
                {webhooks.length === 0 && !loading && <Center><Text>{'You don\'t have any webhooks created yet'}</Text></Center>}
            </Flex>
            <Modal opened={opened} onClose={close} title={<Text>Are you sure you want to delete this webhook?</Text>}>
                <Flex justify={'center'}>
                    {error}
                    <Button mr={'md'} variant="outline" onClick={close}>Cancel</Button>
                    <Button loading={isDeleting} onClick={onDelete} variant="filled" color="red">Delete</Button>
                </Flex>
            </Modal>
        </Flex>
    );
}