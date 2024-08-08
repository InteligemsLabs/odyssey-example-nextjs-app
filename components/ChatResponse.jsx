import React from 'react';
import { Box } from '@chakra-ui/react';
import Markdown from 'markdown-to-jsx'

const ChatResponse = ({ message }) => {
  return (
    <Box className="chat-response" bg="gray.100" p={3} borderRadius="md" alignSelf="flex-start" mb={2}>
      <Markdown>
      {message}
      </Markdown>
    </Box>
  );
};

export default ChatResponse;
