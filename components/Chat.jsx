import React, { useState, useEffect, useRef } from 'react';
import { Box, Flex, Heading, Spinner, Text, useToast, VStack, Alert, AlertIcon, AlertTitle, AlertDescription } from '@chakra-ui/react';
import Messages from './Messages';
import MessageBox from './MessageBox';
import LoginAs from './LoginAs';

const Chat = () => {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [teamMembers, setTeamMembers] = useState(null);
  const [userId, setUserId] = useState(null);
  const [workspaceId, setWorkspaceId] = useState(null);
  const [conversations, setConversations] = useState([]);
  const [activeConversation, setActiveConversation] = useState(null);
  const [error, setError] = useState(null);
  const toast = useToast();
  const chatContainerRef = useRef(null);

  // Handle sending a message to the Odyssey
  const handleSendMessage = async (message) => {
    if (!message || !workspaceId || !activeConversation || !userId) {
      return;
    }

    const newMessages = [...messages, { type: 'query', text: message }];
    setMessages(newMessages);
  
    const response = await fetch('/api/chat/message', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        userId: userId,
      },
      body: JSON.stringify({
        workspaceId: workspaceId,
        conversationId: activeConversation,
        message: message,
      }),
    });
  
    if (response.ok) {
      const data = await response.json();
  
      const newMessage = {
        type: 'response',
        text: data.data.response,
      };
  
      setMessages((prevMessages) => [...prevMessages, newMessage]);
    }
  };

  // Scroll to the bottom of the chat container when messages change
  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [messages]);


  // Fetch messages when the workspaceId and activeConversation change
  useEffect(() => {
    const fetchMessages = async () => {
      setLoading(true);

      const toastId = 'fetch-toast';
      if (!toast.isActive(toastId)) {
        toast({
          id: toastId,
          title: 'Loading messages...',
          status: 'info',
          duration: null,
          isClosable: true,
        });
      }

      const response = await fetch(`/api/chat/messages?workspaceId=${workspaceId}&conversationId=${activeConversation}`, {
        headers: {
          userId: userId,
        },
      });

      if (response.ok) {
        const data = await response.json();

        const newMessages = data.data.map((message) => ({
          type: message.type,
          text: message.response || message.query,
        }));

        setMessages(newMessages);

        toast.close(toastId);
      } else {
        const errorData = await response.json();
        const status = response.status;

        const toastId = 'fetch-toast';
        if (!toast.isActive(toastId)) {
          toast({
            id: toastId,
            title: 'Error loading messages',
            description: `${status} ${errorData.message}`,
            status: 'error',
            duration: 5000,
            isClosable: true,
          });
        }
      }

      setLoading(false);
    }

    if (workspaceId && activeConversation && userId) {
      fetchMessages();
    }
  }, [workspaceId, activeConversation, userId]);

  // Fetch the workspaceId when the component mounts
  useEffect(() => {
    const fetchBuildStatus = async () => {
      const response = await fetch('/api/build-status', {
        headers: {
          userId: userId,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setWorkspaceId(data?.workspaceId);
      } else {
        const errorData = await response.json();
        const status = response.status;

        setError(`${status} ${errorData.message}`);
      }
    }

    if (userId) {
      fetchBuildStatus();
    }
  }, [userId]);

  // Fetch the conversations when the workspaceId changes
  useEffect(() => {
    const fetchConversations = async () => {
      const response = await fetch(`/api/conversations?workspaceId=${workspaceId}`, {
        headers: {
          userId: userId,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setConversations(data.conversations);
      }
    }

    if (workspaceId && userId) {
      fetchConversations();
    }
  }, [workspaceId, userId]);

  // Fetch team members
  useEffect(() => {
    const fetchTeamMembers = async () => {
      const response = await fetch(`/api/team/members?slug=odyssey-dev`);

      if (response.ok) {
        const data = await response.json();
        setTeamMembers(data?.data);
      }
    }

    fetchTeamMembers();
  }, []);

  const ChatContent = () => {
    if (!userId) {
      return (
        <Flex
          position="fixed"
          top="0"
          left="0"
          right="0"
          bottom="0"
          justifyContent="center"
          alignItems="center"
          flexDirection="column"
        >
          <LoginAs teamMembers={teamMembers} setUserId={setUserId} />
        </Flex>
      );
    }
      
    if (error) {
      return (
        <Flex
          position="fixed"
          top="0"
          left="0"
          right="0"
          bottom="0"
          justifyContent="center"
          alignItems="center"
          flexDirection="column"
        >
          <Alert 
            status='error'
            flexDirection='column'
            alignItems='center'
            justifyContent='center'
            textAlign='center'
            width='300px'
            height='200px'
          >
            <AlertIcon boxSize='40px' mr={0} />
            <AlertTitle mt={4} mb={1} mr={0} fontSize='lg'>Error fetching workspace</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        </Flex>
      );
    }

    if (loading && !messages.length) {
      return (
        <Flex
          position="fixed"
          top="0"
          left="0"
          right="0"
          bottom="0"
          justifyContent="center"
          alignItems="center"
          flexDirection="column"
        >
          <Spinner size="xl" />
          <Text>Fetching messages...</Text>
        </Flex>
      );
    }
  }

  return (
    <Flex height="100vh" bg="gray.900">
      <Box width="250px" bg="gray.900" p={4} boxShadow="md">
        <Heading as="h4" size="md" mb={4} color="white">
          Conversations
        </Heading>
        <VStack align="flex-start" spacing={2} color="white">
          {conversations?.map((conversation) => (
            <div colorScheme='white' variant='link' size='xs' style={{
              cursor: 'pointer',
              fontWeight: activeConversation === conversation.conversationid ? 'bold' : 'normal',
            }} onClick={() => {
              if (activeConversation === conversation.conversationid) {
                return;
              }

              setMessages([]);

              setActiveConversation(conversation.conversationid);
            }}>
              {conversation.name}
            </div>
          ))}
        </VStack>
      </Box>

      <ChatContent />

      <Flex direction="column" flex="1" height="100vh" bg="gray.100">
          <Box py={3} px={5} bg="white" boxShadow="md" style={{
            borderBottom: '1px solid #ddd',
          }}>
            <Heading as="h3" size="lg">
              Odyssey Chat App
            </Heading>
          </Box>
          <Flex
            ref={chatContainerRef}
            direction="column"
            flex="1"
            overflowY="auto"
            p={5}
            bg="white"
          >
            <Messages messages={messages} />
          </Flex>
          {activeConversation && <Box p={5} bg="white" boxShadow="md">
            <MessageBox onSendMessage={handleSendMessage} />
          </Box>}
        </Flex>
      </Flex>
  );
};

export default Chat;
