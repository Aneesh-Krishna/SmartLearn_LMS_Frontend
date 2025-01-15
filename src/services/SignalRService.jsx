// src/services/signalRService.js

import { HubConnectionBuilder } from '@microsoft/signalr';

class SignalRService {
  constructor() {
    this.connection = null;
  }

  // Connect to the SignalR Hub
  async connect() {
    this.connection = new HubConnectionBuilder()
      .withUrl('https://your-api-url/chatHub', {
        accessTokenFactory: () => localStorage.getItem('jwtToken')  // If you're using JWT for authentication
      })
      .build();

    // Start the connection
    await this.connection.start();
  }

  // Listen for messages from the server
  onReceiveMessage(callback) {
    this.connection.on('ReceiveMessage', (userName, message, fileUrl) => {
      callback(userName, message, fileUrl);
    });
  }

  // Listen for notifications from the server
  onReceiveNotification(callback) {
    this.connection.on('ReceiveNotification', (notification) => {
      callback(notification);
    });
  }

  // Join a specific course group
  async joinGroup(courseId) {
    await this.connection.invoke('JoinGroup', courseId);
  }

  // Leave a specific course group
  async leaveGroup(courseId) {
    await this.connection.invoke('LeaveGroup', courseId);
  }

  // Send a message to a course
  async sendMessage(courseId, userName, message, fileUrl = null) {
    await this.connection.invoke('SendMessage', courseId, userName, message, fileUrl);
  }

  // Send notification to a user
  async sendNotification(userId, notification) {
    await this.connection.invoke('SendNotification', userId, notification);
  }
}

const signalRService = new SignalRService();
export default signalRService;
