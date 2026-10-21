import { Server } from 'socket.io';

let ioInstance: Server | null = null;

export const setSocketIO = (io: Server): void => {
  ioInstance = io;
};

export const getSocketIO = (): Server | null => {
  return ioInstance;
};
