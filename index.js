const io = require("socket.io")(process.env.PORT || 8000, {
    cors: {
        origin: "http://localhost:3000",
    },
});

let users = [];

const addUser = (userId, socketId) => {
    !users.some((user) => user.userId === userId) &&
        users.push({ userId, socketId });
};

const removeUser = (socketId) => {
    users = users.filter((user) => user.socketId !== socketId);
};

const getUser = (userId) => {
    return users.find((user) => user.userId === userId);
};

io.on("connection", (socket) => {
    console.log("a user connected.");

    //take userId and socketId from user
    socket.on("addUser", (userId) => {
        addUser(userId, socket.id);
        io.emit("getUsers", users);
        console.log(users)
    });

    //send and get message
    socket.on("sendMessage", ({ senderId, receiverId, text, avatar, fullName }) => {
        const user = getUser(receiverId);
        console.log(user)
        if (user) {
            console.log('hit')
            io.to(user.socketId).emit("getMessage", {
                sender: {
                    senderId,
                    avatar,
                    fullName,
                },
                text,
        });}
    });

    //when disconnect
    socket.on("disconnect", () => {
        console.log("a user disconnected!");
        removeUser(socket.id);
        io.emit("getUsers", users);
    });
});
