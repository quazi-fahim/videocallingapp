import React from "react";
import {  Routes, Route } from "react-router-dom";
import Home from "./Home";
import VideoCall from "./VideoCall";


const App = () => {
    return (
       
            <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/room/:roomId" element={<VideoCall />} />
            </Routes>
           
    );
};

export default App;
