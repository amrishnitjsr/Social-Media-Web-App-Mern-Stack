import React from 'react';
import { GoogleOAuthProvider } from '@react-oauth/google';

const GoogleAuthProvider = ({ children }) => {
    const googleClientId = process.env.REACT_APP_GOOGLE_CLIENT_ID || "208734522485-1e9sbglrfp9qn6lh8h5hquebmhh6m3a0.apps.googleusercontent.com";

    return (
        <GoogleOAuthProvider clientId={googleClientId}>
            {children}
        </GoogleOAuthProvider>
    );
};

export default GoogleAuthProvider;