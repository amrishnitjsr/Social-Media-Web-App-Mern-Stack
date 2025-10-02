import React from 'react';
import { GoogleLogin } from '@react-oauth/google';
import { useDispatch } from 'react-redux';
import axios from 'axios';

const GoogleAuthButton = ({ buttonText = "Continue with Google", onSuccess, onError }) => {
    const dispatch = useDispatch();

    const handleGoogleSuccess = async (credentialResponse) => {
        try {
            console.log('Google Login Success:', credentialResponse);
            
            // Send the credential to your backend
            const response = await axios.post('http://localhost:4000/auth/google/verify', {
                credential: credentialResponse.credential
            });

            if (response.data) {
                // Dispatch success action to Redux store
                dispatch({ type: 'AUTH_SUCCESS', data: response.data });
                
                // Store user data in localStorage
                localStorage.setItem('profile', JSON.stringify(response.data));
                
                if (onSuccess) {
                    onSuccess(response.data);
                }
            }
        } catch (error) {
            console.error('Google Auth Error:', error);
            if (onError) {
                onError(error);
            }
            dispatch({ type: 'AUTH_FAIL' });
        }
    };

    const handleGoogleError = () => {
        console.log('Google Login Failed');
        if (onError) {
            onError(new Error('Google Login Failed'));
        }
        dispatch({ type: 'AUTH_FAIL' });
    };

    return (
        <div style={{ 
            display: 'flex', 
            justifyContent: 'center', 
            margin: '10px 0',
            width: '100%'
        }}>
            <GoogleLogin
                onSuccess={handleGoogleSuccess}
                onError={handleGoogleError}
                text={buttonText}
                theme="filled_blue"
                size="large"
                width="100%"
                logo_alignment="left"
            />
        </div>
    );
};

export default GoogleAuthButton;