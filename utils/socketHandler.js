// import jwt from "jsonwebtoken"; // Ensure you have jsonwebtoken installed
// import User from "../model/user/accountModel.js"; // Update path as per your project
// import Message from "../model/message/messageModel.js";

// const socketHandler = (io) => {
//     const onlineUsers = new Map();
//     let allUsers = [];
//     io.use(async (socket, next) => {
//         try {
//             const token = socket.handshake.auth?.token;
//             console.log("🔍 Received token:", token);

//             if (!token) {
//                 return next(new Error("Authentication error: No token provided"));
//             }

//             const decoded = jwt.verify(token, process.env.JWT_SECRET);
//             const user = await User.findById(decoded.id);

//             if (!user) {
//                 return next(new Error("User not found"));
//             }

//             socket.user = user; // ✅ Attach user data to socket
//             next();
//         } catch (error) {
//             console.error("❌ Authentication failed:", error.message);
//             next(new Error("Authentication error: " + error.message));
//         }
//     });

//     io.on("connection", (socket) => {
//         const user = socket.user;
//         if (!user) {
//             console.error("❌ User object missing in socket!");
//             return;
//         }

//         onlineUsers.set(socket.id, { id: user._id, name: user.name });
//         console.log(`✅ ${user.name} is online`);

       
//         io.emit("online_users", Array.from(onlineUsers.values()));

//         // socket.on("join_chat", async(room) => {
//         //     socket.join(room);
//         //     console.log(`User joined room: ${room}`);

//         // });

//         socket.on("join_chat", async (room) => {
//             socket.join(room);
//             console.log(`${user.name} joined room: ${room}`);

//             try {
//                 const previousMessages = await Message.find({ chatId: room })
//                     .populate("sender", "name")
//                     .sort({ createdAt: 1 });

//                 socket.emit("chat_history", previousMessages);
//             } catch (err) {
//                 console.error("❌ Error fetching chat history:", err);
//             }
//         });

//         socket.on("send_message", async (data) => {
//             try {
//                 console.log("📩 Message data received on server:", data);
                
//                 const newMessage = await Message.create({
//                     content:data.content,
//                     sender: user._id,
//                     chatId: data.room,
//                 });

//                 const populatedMessage = await newMessage.populate("sender", "name");
//                 console.log(populatedMessage,"----00-------");
                

//                 io.to(data.room).emit("receive_message", populatedMessage);

//             } catch (err) {
//                 console.error("❌ Error saving message:", err);
//             }
//         });


//         socket.on("disconnect", () => {
//             onlineUsers.delete(socket.id); 
//             console.log(`🚪 ${user.name} disconnected`);

//             io.emit("online_users", Array.from(onlineUsers.values())); 
//         });
//     });
// };

// export default socketHandler;




import jwt from "jsonwebtoken";
import User from "../model/user/accountModel.js";
import Message from "../model/message/messageModel.js";

const socketHandler = (io) => {
    const onlineUsers = new Map(); // To keep track of currently online users
    const offlineUsers = new Map(); // To keep track of previously online users (when disconnected)

    io.use(async (socket, next) => {
        try {
            const token = socket.handshake.auth?.token;
            console.log("🔍 Received token:", token);

            if (!token) {
                return next(new Error("Authentication error: No token provided"));
            }

            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            const user = await User.findById(decoded.id);

            if (!user) {
                return next(new Error("Authentication error: User not found"));
            }

            socket.user = user;
            next();
        } catch (error) {
            console.error("❌ Authentication failed:", error.message);
            next(new Error("Authentication error: " + error.message));
        }
    });

    io.on("connection", (socket) => {
        const user = socket.user;
        if (!user) {
            console.error("❌ User object missing in socket!");
            return;
        }

        // Mark user as online
        onlineUsers.set(socket.id, { id: user._id, name: user.name });
        console.log(`✅ ${user.name} is online`);
        io.emit("online_users", Array.from(onlineUsers.values())); // Emit online users list to all clients

        // 🏠 User joins a chat room
        socket.on("join_chat", async (room) => {
            socket.join(room);
            console.log(`🚀 ${user.name} joined room: ${room}`);

            // 🔹 Send system message that user joined
            const joinMessage = {
                _id: Date.now(),
                content: `${user.name} has joined the chat`,
                type: "system",
                chatId: room,
                createdAt: new Date().toISOString(),
            };
            io.to(room).emit("receive_message", joinMessage);

            try {
                // Send previous chat history
                const previousMessages = await Message.find({ chatId: room })
                    .populate("sender", "name")
                    .sort({ createdAt: 1 });

                socket.emit("chat_history", previousMessages);
            } catch (err) {
                console.error("❌ Error fetching chat history:", err);
            }
        });

        // 📩 User sends a message
        socket.on("send_message", async (data) => {
            try {
                console.log("📩 Message received:", data);

                const newMessage = await Message.create({
                    content: data.content,
                    sender: user._id,
                    chatId: data.room,
                });

                const populatedMessage = await newMessage.populate("sender", "name");

                // Broadcast the message to the chat room
                io.to(data.room).emit("receive_message", populatedMessage);

            } catch (err) {
                console.error("❌ Error saving message:", err);
            }
        });

        // 🚪 User leaves the chat
        socket.on("leave_chat", (room) => {
            socket.leave(room);
            console.log(`🚪 ${user.name} left room: ${room}`);

            // 🔹 Send system message that user left
            const leaveMessage = {
                _id: Date.now(),
                content: `${user.name} has left the chat`,
                type: "system",
                chatId: room,
                createdAt: new Date().toISOString(),
            };
            io.to(room).emit("receive_message", leaveMessage);
        });

        // 🚪 User disconnects
        socket.on("disconnect", () => {
            // Remove user from online users map and add to offline users map
            if (onlineUsers.has(socket.id)) {
                offlineUsers.set(socket.id);
                onlineUsers.delete(socket.id);
                console.log(`🚪 ${user.name} disconnected`);

                // Emit updated online and offline users list
                io.emit("online_users", Array.from(onlineUsers.values()));
                io.emit("offline_users", Array.from(offlineUsers.values()));
            }
        });

        socket.on("offline_users", () => {
            // Send the list of offline users if requested
            socket.emit("offline_users", Array.from(offlineUsers.values()));
        });

        // Optionally, you could emit a message about offline users
        socket.on("request_offline_users", () => {
            // Optionally you can send the list of offline users if needed
            socket.emit("offline_users", Array.from(offlineUsers.values()));
        });

    });
};

export default socketHandler;
