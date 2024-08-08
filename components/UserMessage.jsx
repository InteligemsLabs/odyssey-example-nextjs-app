import React from 'react';
import { Box } from '@chakra-ui/react';

const UserMessage = ({ message }) => {
  return (
    <Box className="chat-message" bg="purple.100" p={3} borderRadius="md" alignSelf="flex-end" mb={2}>
      {message}
    </Box>
  );
};

export default UserMessage;
