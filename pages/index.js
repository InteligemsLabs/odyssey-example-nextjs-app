import Head from "next/head";
import { Inter } from "next/font/google";
import Chat from '@/components/Chat';
import { Box } from "@chakra-ui/react";

const inter = Inter({ subsets: ["latin"] });

export default function Home() {
  return (
    <>
      <Head>
        <title>Odyssey</title>
        <meta name="description" content="Odyssey chat" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <Box height="100vh">
        <Chat />
      </Box>
    </>
  );
}
