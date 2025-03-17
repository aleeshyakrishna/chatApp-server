import createError from 'http-errors';
import express from 'express';
import path from 'path';
import cookieParser from 'cookie-parser';
import logger from 'morgan';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import { createServer } from 'http';
import { Server } from 'socket.io';
import cors from 'cors';

import messageRouter from './routes/message/message.js';
import usersRouter from './routes/user/user.js';
import mongoDBConnect from './config/dbConfig.js';
import socketHandler from './utils/socketHandler.js';

const app = express();
const httpServer = createServer(app);

app.use(cors({
  origin: [
    "http://localhost:3000",
    "https://chat-app-client-pink-nine.vercel.app"
  ],
  methods: ["GET", "POST", "PUT", "DELETE"],
  credentials: true
}));

const io = new Server(httpServer, {
  cors: {
    origin: [
      "http://localhost:3000",
      "https://chat-app-client-pink-nine.vercel.app"
      ],
    methods: ["GET", "POST"],
    credentials: true
  }
});

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());

app.use(express.static(path.join(__dirname, 'public')));

mongoDBConnect();

app.use('/message', messageRouter);
app.use('/user', usersRouter);

app.get('/', (req, res) => {
  res.send('<h1>Welcome to My Server 🚀</h1>');
});

// Initialize Socket.IO
socketHandler(io);
app.set('io', io);

// 404 handler
app.use((req, res, next) => {
  next(createError(404));
});

// Error handler
app.use((err, req, res, next) => {
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};
  res.status(err.status || 500);
  res.render('error');
});

// Start the HTTP server
httpServer.listen(5000, () => {
  console.log("🚀 Server is running");
});

export { httpServer, app };
export default app;
