import React, { useState } from 'react';
import { Box, Button, Select, Text } from '@chakra-ui/react';

const LoginAs = ({ teamMembers, setUserId }) => {
  const [selectedUser, setSelectedUser] = useState('');

  const handleChange = (e) => {
    console.log('Selected user:', e.target.value);

    setSelectedUser(e.target.value);
  };

  const handleConfirm = () => {
    setUserId(selectedUser);
  };

  if (!teamMembers) {
    return null;
  }

  return (
    <Box width="300px" margin="auto" padding="20px" boxShadow="md" borderRadius="md">
      <Text fontSize="lg" marginBottom="8px">Login as:</Text>
      <Select placeholder="Select a user" onChange={handleChange}>
        {teamMembers.map((member) => (
          <option key={member.id} value={member.userId}>
            {member.user.email} ({member.role})
          </option>
        ))}
      </Select>
      <Button
        marginTop="16px"
        colorScheme="purple"
        onClick={handleConfirm}
        isDisabled={!selectedUser}
      >
        Confirm
      </Button>
    </Box>
  );
};

export default LoginAs;
