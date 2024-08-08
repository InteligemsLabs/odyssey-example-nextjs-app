import React, { useState } from 'react';
import { Box, Input, Button, Flex } from '@chakra-ui/react';

const MessageBox = ({ onSendMessage }) => {
  const [message, setMessage] = useState('');

  const handleSendMessage = () => {
    onSendMessage(message);
    setMessage('');
  };

  return (
    <Flex mt={4}>
      <Input
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        placeholder="Type your message..."
        flex="1"
        onKeyPress={(e) => {
          if (e.key === 'Enter') {
            handleSendMessage();
          }
        }}
      />
      <Button ml={2} onClick={handleSendMessage} colorScheme="purple">
        Send
      </Button>
    </Flex>
  );
};

export default MessageBox;
