// import { Server } from "socket.io";
// import dotenv from "dotenv";
// dotenv.config();
// let io; // Declare io variable
// export const initializeSocketIO = (server) => {
//   io = new Server(server, {
//     cors: {
//       origin: process.env.CLIENT_URL, // Adjust to your React app's origin
//       methods: ["GET", "POST"],
//     },
//   });

//   io.on("connection", (socket) => {
//     console.log("Client connected:", socket.id);

//     socket.on("disconnect", () => {
//       console.log("Client disconnected:", socket.id);
//     });
//   });
// };

// export default io;
