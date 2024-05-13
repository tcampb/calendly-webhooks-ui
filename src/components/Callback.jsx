import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { requestToken } from "../calendly/auth";
import { saveAuthContext } from "../storage";

export default function Callback() {
    const [searchParams] = useSearchParams();
    const [error, setError] = useState(null)
    const navigate = useNavigate();
    const code = searchParams.get('code')

    useEffect(() => {
        if (code) {
            requestToken({ code }).then(([success, data]) => {
                if (success) {
                    saveAuthContext(data)
                    navigate('/webhooks')
                } else {
                    setError(data.response.error_description)
                }
            })
        } else {
            navigate('/')
        }
    }, [code, navigate])

    return (
        <div>{error}</div>
    )
}