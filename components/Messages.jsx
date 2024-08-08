import React from 'react';
import { Box, VStack } from '@chakra-ui/react';
import UserMessage from './UserMessage';
import ChatResponse from './ChatResponse';

const Messages = ({ messages }) => {
  return (
    <VStack align="stretch" spacing={2}>
      {messages.map((msg, index) => {
        if (msg.type === 'query') {
          return <UserMessage key={index} message={msg.text} />;
        } else {
          return <ChatResponse key={index} message={msg.text} />;
        }
      })}
    </VStack>
  );
};

export default Messages;
