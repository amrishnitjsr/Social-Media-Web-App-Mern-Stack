import React from 'react';
import { MantineProvider } from '@mantine/core';

const MantineWrapper = ({ children }) => {
    return (
        <MantineProvider theme={{ colorScheme: 'light' }}>
            {children}
        </MantineProvider>
    );
};

export default MantineWrapper;