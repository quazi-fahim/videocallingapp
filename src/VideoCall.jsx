
import React, { useEffect, useRef, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Peer from "peerjs";
import { Box, Button, Grid, GridItem, Heading, IconButton, Text } from "@chakra-ui/react";
import { FaMicrophone, FaMicrophoneSlash } from "react-icons/fa";

const VideoCall = () => {
    const { roomId } = useParams();
    const navigate = useNavigate();
    const myVideoRef = useRef();
    const peerRef = useRef();
    const peersRef = useRef({});
    const [peerId, setPeerId] = useState("");
    const [stream, setStream] = useState(null);
    const [isVideoOff, setIsVideoOff] = useState(true);
    const [isAudioMuted, setIsAudioMuted] = useState(true);
    const [users, setUsers] = useState([]);
    const userName = localStorage.getItem("userName") || "Guest";

    useEffect(() => {
        const peer = new Peer(undefined, {
            host: "peerjs.com",
            secure: true,
            port: 443
        });

        peer.on("open", (id) => {
            setPeerId(id);
            console.log("My Peer ID:", id);
        });

        navigator.mediaDevices.getUserMedia({ video: true, audio: true })
            .then((userStream) => {
                setStream(userStream);
                userStream.getVideoTracks()[0].enabled = false;
                userStream.getAudioTracks()[0].enabled = false;

                peer.on("call", (call) => {
                    call.answer(userStream);
                    call.on("stream", (remoteStream) => {
                        if (!peersRef.current[call.peer]) {
                            addRemoteUser(call.peer, remoteStream, `User-${call.peer}`);
                            peersRef.current[call.peer] = call;
                        }
                    });
                });

                joinRoom(peer, userStream);
            });

        peerRef.current = peer;
        return () => peer.disconnect();
    }, []);

    const addRemoteUser = (peerId, stream, name) => {
        setUsers((prevUsers) => [...prevUsers, { id: peerId, stream, name, isMuted: true, isVideoOff: true }]);
    };

    const joinRoom = (peer, userStream) => {
        fetch(`https://peerjs.com/peers`)
            .then((res) => res.json())
            .then((peers) => {
                peers.forEach((peerId) => {
                    if (peerId !== peer.id) {
                        const call = peer.call(peerId, userStream);
                        call.on("stream", (remoteStream) => {
                            if (!peersRef.current[peerId]) {
                                addRemoteUser(peerId, remoteStream, `User-${peerId}`);
                                peersRef.current[peerId] = call;
                            }
                        });
                    }
                });
            });
    };

    const toggleAudio = () => {
        if (!stream) return;
        setIsAudioMuted((prevState) => {
            const newState = !prevState;
            stream.getAudioTracks().forEach(track => (track.enabled = !newState));
            return newState;
        });
    };

    const toggleVideo = () => {
        if (!stream) return;
        setIsVideoOff((prevState) => {
            const newState = !prevState;
            stream.getVideoTracks().forEach(track => (track.enabled = !newState));
    
            if (!newState) {
                setTimeout(() => {
                    if (myVideoRef.current) {
                        myVideoRef.current.srcObject = stream;
                        myVideoRef.current.play().catch(err => console.error("Video play error:", err));
                    }
                }, 100);
            } else {
                if (myVideoRef.current) {
                    myVideoRef.current.srcObject = null;
                }
            }
            return newState;
        });
    };

    return (
        <Box>
        <Box p={4} textAlign="center">
            <Heading size="lg" mb={3}>Room: {roomId}</Heading>

            <Grid templateColumns={{ base: "2fr 1fr" , md: "2fr 1fr" }} gap={4} p={4} minH="500px" width="100%">
                {/* Main Video Section */}
                <GridItem bg="gray.700" borderRadius="10px" position="relative" display="flex" alignItems="center" justifyContent="center" overflow="hidden">
                    {!isVideoOff ? (
                        <video ref={myVideoRef} autoPlay muted style={{ width: "100%", borderRadius: "10px" }} />
                    ) : (
                        <Text color="white" fontSize="xl">{userName}</Text>
                    )}

                    {/* Audio Icon - Bottom Left */}
                    <IconButton
    as={isAudioMuted ? FaMicrophoneSlash : FaMicrophone}
    aria-label="Mute/Unmute"
    size="2xs"
    position="absolute"
    bottom="10px"
    left="10px"
    isRound
    bg="black.400"
    onClick={toggleAudio}
    color={isAudioMuted ? "red" : "white"}
/>


                </GridItem>

                {/* Users Grid Section */}
                <GridItem bg="gray.200" borderRadius="10px" p={3} display="grid" gridTemplateRows="repeat(auto-fit, minmax(120px, 1fr))" gap={3} minH="300px" maxH="500px" overflowY="auto">
                    {users.map((user) => (
                        <UserBox key={user.id} name={user.name} isMuted={user.isMuted} videoRef={user.stream} />
                    ))}
                </GridItem>
            </Grid>

            {/* Controls */}
            <Box mt={4} display="flex" justifyContent="center" gap={2}>
                <Button colorScheme="red" onClick={toggleAudio}>{isAudioMuted ? "Unmute" : "Mute"}</Button>
                <Button colorScheme="blue" onClick={toggleVideo}>{isVideoOff ? "Turn Video On" : "Turn Video Off"}</Button>
                <Button colorScheme="gray" onClick={() => navigate("/")}>Leave Call</Button>
            </Box>
        </Box>
        </Box>
    );
};

const UserBox = ({ name, isMuted, videoRef }) => {
    return (
        <Box bg="gray.300" borderRadius="10px" display="flex" alignItems="center" justifyContent="center" flexDir="row" position="relative" p={2} minW="120px" maxW="150px">
            {videoRef ? (
                <video ref={(video) => video && (video.srcObject = videoRef)} autoPlay style={{ width: "100%", borderRadius: "10px" }} />
            ) : (
                <Text fontWeight="bold" fontSize="lg" color="gray.700">{name}</Text>
            )}
            <IconButton
                icon={isMuted ? <FaMicrophoneSlash color="red" /> : <FaMicrophone />}
                aria-label="Mute/Unmute"
                size="sm"
                position="absolute"
                bottom="5px"
                left="5px"
                isRound
                bg="white"
            />
        </Box>
        
    );
    
};

export default VideoCall;














