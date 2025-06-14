const express = require('express');
const app = express();
const http = require('http').createServer(app);
const WebSocket = require('ws');
const wss = new WebSocket.Server({ server: http });

const PORT = 3000;

const rooms = {};

wss.on('connection', (ws, req) => {
  console.log('Client connected.: '+ ws);

  // Lấy thông tin về room từ query parameter
  const urlParams = new URLSearchParams(req.url.split('?')[1]);
  const room = urlParams.get('room') || 'default';

  // Thêm client vào room tương ứng
  if (!rooms[room]) {
    rooms[room] = [];
  }
  rooms[room].push(ws);

  ws.on('message', (message) => {
    console.log('Received message:', message);
	const data = message.toString('utf8');
    // Gửi tin nhắn từ client đến tất cả các client trong cùng room
    rooms[room].forEach((client) => {
		console.log('Client connected.: '+ ws);
		console.log('Client connected.: '+ client);
      if (client.readyState === WebSocket.OPEN) {
        client.send(data);
      }
    });
  });

  ws.on('close', () => {
    console.log('Client disconnected.');

    // Xóa client khỏi room khi client đóng kết nối
    const index = rooms[room].indexOf(ws);
    if (index !== -1) {
      rooms[room].splice(index, 1);
    }
  });
});

http.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}.`);
});
