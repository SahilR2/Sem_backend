const express = require('express');
const http = require('http');
const axios = require('axios');

const app = express();
const server = http.createServer(app);
const { Server } = require('socket.io');
const io = new Server(server, {
    cors: {
        origin: '*',
    }
});

let imageArray = [];
const textParagraph = `Let's start by defining what a binary search trees is. A binary search tree is a hierarchical data structure that consists of nodes, where each node has at most two children, typically referred to as the left child and the right child. Importantly, for every node in a BST, all nodes in the left subtree have values less than the node's value, and all nodes in the right subtree have values greater than the node's value. This property makes BSTs particularly efficient for searching operations.`;

// Fetch image URLs from FastAPI
async function fetchImageUrls() {
    try {
        const response = await axios.get('https://58e8-34-125-115-23.ngrok-free.app/image-urls/', {
            params: {
                text_paragraph: textParagraph
            }
        });
        const imageUrls = response.data;
        imageArray = Object.values(imageUrls).flat();
        console.log("Loaded image URLs:", imageArray);
    } catch (error) {
        console.error("Error fetching image URLs:", error);
    }
}

// Fetch image URLs on server start
fetchImageUrls();

io.on('connection', (socket) => {
    console.log("connected");

    socket.on('draw-line', ({ prevPoint, currentPoint, color }) => {
        socket.broadcast.emit('draw-line', { prevPoint, currentPoint, color });
    });

    socket.on('clear', () => {
        io.emit('clear');
    });

    let imageIndex = 0;
    setInterval(() => {
        if (imageArray.length > 0) {
            const imageUrl = imageArray[imageIndex % imageArray.length];
            socket.emit('image', imageUrl);
            console.log(`Sent image URL: ${imageUrl}`);
            imageIndex++;
        }
    }, 3000);
});

server.listen(3001, () => {
    console.log("server listening on port 3001");
});
