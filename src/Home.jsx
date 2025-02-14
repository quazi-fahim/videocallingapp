import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { v4 as uuidV4 } from "uuid";
import { Box, Button, Input, Text, Flex } from "@chakra-ui/react";

const Home = () => {
    const [name, setName] = useState("");
    const [roomId, setRoomId] = useState("");
    const navigate = useNavigate();

    const handleCreateMeeting = () => {
        if (!name.trim()) {
            alert("Please enter your name.");
            return;
        }
        localStorage.setItem("userName", name);
        const newRoomId = uuidV4();
        navigate(`/room/${newRoomId}`);
    };

    const handleJoinMeeting = () => {
        if (!name.trim()) {
            alert("Please enter your name.");
            return;
        }
        if (roomId.trim()) {
            localStorage.setItem("userName", name);
            navigate(`/room/${roomId}`);
        } else {
            alert("Please enter a valid Room ID.");
        }
    };

    return (
        <Box textAlign="center" mt={10}>
            <Text fontSize="2xl" fontWeight="bold">Welcome to Video Call</Text>

            <Flex direction="column" align="center" mt={5} gap={4}>
                <Input 
                    placeholder="Enter your name" 
                    value={name} 
                    onChange={(e) => setName(e.target.value)} 
                    w={["80%", "60%", "40%"]}
                />
                <Input 
                    placeholder="Enter Room ID" 
                    value={roomId} 
                    onChange={(e) => setRoomId(e.target.value)} 
                    w={["80%", "60%", "40%"]}
                />
                <Flex gap={4} w={["80%", "60%", "40%"]} justify="center">
                    <Button colorScheme="blue" flex="1" onClick={handleCreateMeeting}>
                        Create Meeting
                    </Button>
                    <Button colorScheme="green" flex="1" onClick={handleJoinMeeting}>
                        Join Meeting
                    </Button>
                </Flex>
            </Flex>
        </Box>
    );
};

export default Home;
