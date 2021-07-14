import socketio from "socket.io-client";
import React from "react";

const ENDPOINT = window.location.protocol + "//" + window.location.host;

export const socket = socketio.connect(ENDPOINT);
export const SocketContext = React.createContext();
