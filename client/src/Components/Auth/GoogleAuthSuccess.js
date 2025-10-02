import React, { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useDispatch } from 'react-redux';

const GoogleAuthSuccess = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const dispatch = useDispatch();

    useEffect(() => {
        // Parse URL parameters
        const urlParams = new URLSearchParams(location.search);
        const token = urlParams.get('token');
        const userString = urlParams.get('user');

        if (token && userString) {
            try {
                const user = JSON.parse(decodeURIComponent(userString));
                
                // Store auth data
                const authData = { user, token };
                localStorage.setItem('profile', JSON.stringify(authData));
                
                // Update Redux store
                dispatch({ type: 'AUTH_SUCCESS', data: authData });
                
                // Redirect to home
                navigate('/home');
            } catch (error) {
                console.error('Error parsing Google auth response:', error);
                navigate('/auth');
            }
        } else {
            navigate('/auth');
        }
    }, [location, navigate, dispatch]);

    return (
        <div style={{ 
            display: 'flex', 
            justifyContent: 'center', 
            alignItems: 'center', 
            height: '100vh',
            fontSize: '18px'
        }}>
            Completing Google Sign In...
        </div>
    );
};

export default GoogleAuthSuccess;