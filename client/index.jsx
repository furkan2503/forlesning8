import React, {useEffect, useState} from "react";
import ReactDOM from "react-dom";
import {BrowserRouter, Link, Route, Routes, useNavigate} from "react-router-dom";

function FrontPage() {
    return <div>
    <h1>Front Page</h1>
        <div>
            <Link to="/login">Login</Link>
            <div/>
            <div>
            <Link to="/profile">Profile</Link>
            </div>
        </div>
    </div>;
}

async function fetchJSON(url) {
    const res = await fetch(url);
    if (!res.ok) {
        throw new Error(`failed ${res.status}`)
    }
    return await res.json();
}

function Login() {
    useEffect(async() => {
        const {authorization_endpoint} = await fetchJSON("https://accounts.google.com/.well-known/openid-configuration");

        const parameters = {
            response_type: "token",
            client_id: "782785875182-bnd6feikar8momm4ke0dropomp8sq08b.apps.googleusercontent.com",
            scope: "email profile",
            redirect_uri: window.location.origin + "/login/callback",
        }

        window.location.href = authorization_endpoint + "?" + new URLSearchParams(parameters);
    }, [])

    return <div>
        <h1>Please wait</h1>

    </div>;

}

function LoginCallback() {
    const navigate = useNavigate();
    useEffect(async () => {
        const {access_token} = Object.fromEntries(new URLSearchParams(window.location.hash.substring(1)));
        console.log(access_token)

       await fetch("/api/login", {
            method: "POST",
            headers: {
                "content-type": "application/json"
            },
            body: JSON.stringify({access_token}),
        });
        navigate("/")
    });

    return <h1>Login callback</h1>;
}

function useLoader(loadingFn) {
    const [loading, setLoading] = useState(true);
    const [data, setData] = useState();
    const [error, setError] = useState();

    async function load(){
        try {
            setLoading(true);
            setData(await loadingFn());
        } catch (error) {
            setError(error);
        }finally {
            setLoading(false);
        }
    }

    useEffect(() => load(), []);
    return {loading, data, error}
}

function Profile() {
    const {loading, data, error} = useLoader(async() => {
        return await fetchJSON("/api/login")
    });

    if (loading) {
        return <div>Please wait...</div>
    }
    if (error) {
        return <div>Error! {error.toString()}</div>
    }


    return <div>
        <h1>Profile</h1>
        <div>{JSON.stringify(data)}</div>
    </div>;
}

function Application() {
    return <BrowserRouter>
        <Routes>
            <Route path={"/"} element={<FrontPage/>} />
            <Route path={"/login"} element={<Login/>} />
            <Route path={"/login/callback"} element={<LoginCallback/>} />
            <Route path={"/profile"} element={<Profile/>} />
        </Routes>
    </BrowserRouter>;
}

ReactDOM.render(<Application />,document.getElementById("app"));
