
const { io } = require('socket.io-client');

const token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIwYmM0MjZjOC1iNDY1LTQxNmQtYjdkNC1jMmE4OGMxNjBlNzEiLCJqdGkiOiJkYTllMmJlNi00MzY1LTQ4NzctYjIyYi04OGYzNjI4OWY3ZTAiLCJ1c2VybmFtZSI6IlVwZGF0ZWQgVGVzdCBVc2VyIiwiZW1haWwiOiJ1cGRhdGVkQGV4YW1wbGUuY29tIiwicm9sZXMiOlsiUk9MRV9BRE1JTiJdLCJpYXQiOjE3OTU0NjI5OTIsImV4cCI6MTc5NTQ2Mzg5Mn0.MG-PDBesIUU_nj_2LMKQoquHtCnyLtRCHaOYc2UMdNo';
const ticketId = 'f406d137-afd0-4eb8-93c6-b03d496c421a';

const socket = io('http://localhost:5001/support-chat', {
  auth: { token },
  transports: ['websocket'],
});

socket.on('connect', () => {
  console.log('Connected to ShopSphere Live Chat');

  socket.emit('join_ticket', { ticketId }, (response) => {
    console.log('Join response:', response);

    if (response?.success) {
      socket.emit(
        'send_message',
        {
          ticketId,
          message: 'Hello! Testing ShopSphere live chat.',
        },
        (result) => {
          console.log('Send response:', result);
        },
      );
    }
  });
});

socket.on('new_message', (message) => {
  console.log('New message received:', message);
});

socket.on('connect_error', (error) => {
  console.error('Connection error:', error.message);
});
