import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { requestToken } from "../calendly/auth";
import { saveAuthContext } from "../storage";

export default function Callback() {
    const code_verifier = localStorage.getItem("pkce_code_verifier")
    const [searchParams] = useSearchParams();
    const [error, setError] = useState(null)
    const navigate = useNavigate();
    const code = searchParams.get('code')

    useEffect(() => {
        if (code) {
            requestToken({ code, code_verifier }).then(([success, data]) => {
                if (success) {
                    localStorage.removeItem("pkce_state");
                    localStorage.removeItem("pkce_code_verifier");

                    saveAuthContext(data)
                    navigate('/webhooks')
                } else {
                    setError(data.response.error_description)
                }
            })
        } else {
            navigate('/')
        }
    }, [code, navigate, code_verifier])

    return (
        <div>{error}</div>
    )
}