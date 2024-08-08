import React from 'react';
import { ChakraProvider, Box, extendTheme } from '@chakra-ui/react';
// import globals.css
import '../styles/globals.css';

const theme = extendTheme({
  styles: {
    global: {
      body: {
        bg: 'gray.50',
      },
    },
  },
});

export default function App({ Component, pageProps }) {
  return <ChakraProvider theme={theme}>
    <Component {...pageProps} />
  </ChakraProvider>;
}
