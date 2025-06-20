// Enhanced WebSocket service with more realistic functionality
import { v4 as uuidv4 } from "uuid"

// Mock WebSocket events for demonstration
export const SOCKET_EVENTS = {
  CONNECT: "connect",
  DISCONNECT: "disconnect",
  MESSAGE: "message",
  NOTIFICATION: "notification",
  USER_STATUS: "user_status",
  TYPING: "typing",
  READ_RECEIPT: "read_receipt",
}

// Mock WebSocket class to simulate real WebSocket behavior
class MockWebSocket {
  private listeners: Record<string, Function[]> = {}
  private isConnected = false
  private userId: string | null = null
  private mockUsers: Record<string, boolean> = {} // Online status of users
  private messageCallbacks: ((message: any) => void)[] = []
  private notificationCallbacks: ((notification: any) => void)[] = []
  private statusCallbacks: ((status: any) => void)[] = []
  private typingCallbacks: ((typing: any) => void)[] = []
  private readReceiptCallbacks: ((receipt: any) => void)[] = []

  constructor() {
    // Initialize with some mock online users
    this.mockUsers = {
      "2": true,
      "3": true,
      "5": false,
    }
  }

  // Connect to the mock WebSocket server
  connect(userId: string): Promise<void> {
    return new Promise((resolve) => {
      setTimeout(() => {
        this.isConnected = true
        this.userId = userId
        this.dispatchEvent({ type: SOCKET_EVENTS.CONNECT })

        // Send initial online users
        this.statusCallbacks.forEach((callback) => {
          callback({
            onlineUsers: Object.entries(this.mockUsers)
              .filter(([_, status]) => status)
              .map(([id]) => id),
          })
        })

        resolve()
      }, 500)
    })
  }

  // Disconnect from the mock WebSocket server
  disconnect(): void {
    this.isConnected = false
    this.userId = null
    this.dispatchEvent({ type: SOCKET_EVENTS.DISCONNECT })
  }

  // Add event listener
  addEventListener(event: string, callback: Function): void {
    if (!this.listeners[event]) {
      this.listeners[event] = []
    }
    this.listeners[event].push(callback)

    // Store callbacks by type for easier access
    if (event === SOCKET_EVENTS.MESSAGE) {
      this.messageCallbacks.push(callback as (message: any) => void)
    } else if (event === SOCKET_EVENTS.NOTIFICATION) {
      this.notificationCallbacks.push(callback as (notification: any) => void)
    } else if (event === SOCKET_EVENTS.USER_STATUS) {
      this.statusCallbacks.push(callback as (status: any) => void)
    } else if (event === SOCKET_EVENTS.TYPING) {
      this.typingCallbacks.push(callback as (typing: any) => void)
    } else if (event === SOCKET_EVENTS.READ_RECEIPT) {
      this.readReceiptCallbacks.push(callback as (receipt: any) => void)
    }
  }

  // Remove event listener
  removeEventListener(event: string, callback: Function): void {
    if (this.listeners[event]) {
      this.listeners[event] = this.listeners[event].filter((cb) => cb !== callback)
    }

    // Remove from type-specific callbacks
    if (event === SOCKET_EVENTS.MESSAGE) {
      this.messageCallbacks = this.messageCallbacks.filter((cb) => cb !== callback)
    } else if (event === SOCKET_EVENTS.NOTIFICATION) {
      this.notificationCallbacks = this.notificationCallbacks.filter((cb) => cb !== callback)
    } else if (event === SOCKET_EVENTS.USER_STATUS) {
      this.statusCallbacks = this.statusCallbacks.filter((cb) => cb !== callback)
    } else if (event === SOCKET_EVENTS.TYPING) {
      this.typingCallbacks = this.typingCallbacks.filter((cb) => cb !== callback)
    } else if (event === SOCKET_EVENTS.READ_RECEIPT) {
      this.readReceiptCallbacks = this.readReceiptCallbacks.filter((cb) => cb !== callback)
    }
  }

  // Dispatch event to listeners
  private dispatchEvent(event: { type: string; data?: any }): void {
    if (this.listeners[event.type]) {
      this.listeners[event.type].forEach((callback) => callback(event))
    }
  }

  // Send message through WebSocket
  send(data: string): void {
    if (!this.isConnected) {
      console.error("Cannot send message: WebSocket not connected")
      return
    }

    try {
      const parsedData = JSON.parse(data)

      // Handle different message types
      switch (parsedData.type) {
        case "message":
          this.handleMessage(parsedData.data)
          break
        case "typing":
          this.handleTyping(parsedData.data)
          break
        case "read_receipt":
          this.handleReadReceipt(parsedData.data)
          break
        default:
          console.warn("Unknown message type:", parsedData.type)
      }
    } catch (error) {
      console.error("Error parsing message:", error)
    }
  }

  // Handle incoming message
  private handleMessage(data: any): void {
    // Simulate server processing
    setTimeout(() => {
      // Echo the message back to simulate receiving it
      this.messageCallbacks.forEach((callback) => {
        callback({
          type: SOCKET_EVENTS.MESSAGE,
          data: {
            ...data,
            id: data.message.id.startsWith("temp-") ? uuidv4() : data.message.id,
            timestamp: new Date().toISOString(),
          },
        })
      })

      // Simulate the other user sending a response after a delay
      if (Math.random() > 0.7) {
        setTimeout(
          () => {
            const otherUserId = data.message.receiverId
            const currentUserId = this.userId

            if (currentUserId) {
              const responseMessage = {
                id: uuidv4(),
                senderId: otherUserId,
                receiverId: currentUserId,
                content: this.generateResponse(),
                timestamp: new Date().toISOString(),
                isRead: false,
              }

              this.messageCallbacks.forEach((callback) => {
                callback({
                  type: SOCKET_EVENTS.MESSAGE,
                  data: {
                    conversationId: data.conversationId,
                    message: responseMessage,
                  },
                })
              })
            }
          },
          3000 + Math.random() * 5000,
        ) // Random delay between 3-8 seconds
      }
    }, 300)
  }

  // Generate a random response message
  private generateResponse(): string {
    const responses = [
      "Thanks for reaching out!",
      "I'll get back to you soon about this.",
      "That sounds interesting. Let's discuss more.",
      "Great to hear from you!",
      "I'm available next week if you want to meet up.",
      "Do you have more details about the event?",
      "I've worked on similar projects before.",
      "Let me check my schedule and get back to you.",
      "I'd be happy to collaborate on this.",
      "Can you send me more information?",
    ]

    return responses[Math.floor(Math.random() * responses.length)]
  }

  // Handle typing indicator
  private handleTyping(data: any): void {
    // Broadcast typing status to all listeners
    this.typingCallbacks.forEach((callback) => {
      callback({
        type: SOCKET_EVENTS.TYPING,
        data,
      })
    })
  }

  // Handle read receipt
  private handleReadReceipt(data: any): void {
    // Broadcast read receipt to all listeners
    this.readReceiptCallbacks.forEach((callback) => {
      callback({
        type: SOCKET_EVENTS.READ_RECEIPT,
        data,
      })
    })
  }

  // Simulate receiving a notification
  simulateNotification(title: string, message: string): void {
    if (!this.isConnected) return

    const notification = {
      id: uuidv4(),
      title,
      message,
      timestamp: new Date().toISOString(),
    }

    this.notificationCallbacks.forEach((callback) => {
      callback({
        type: SOCKET_EVENTS.NOTIFICATION,
        data: notification,
      })
    })
  }

  // Simulate user status change
  simulateUserStatusChange(userId: string, isOnline: boolean): void {
    if (!this.isConnected) return

    this.mockUsers[userId] = isOnline

    this.statusCallbacks.forEach((callback) => {
      callback({
        type: SOCKET_EVENTS.USER_STATUS,
        data: {
          userId,
          status: isOnline ? "online" : "offline",
        },
      })
    })
  }

  // Get connection status
  getStatus(): { isConnected: boolean; userId: string | null } {
    return {
      isConnected: this.isConnected,
      userId: this.userId,
    }
  }

  // Get online users
  getOnlineUsers(): string[] {
    return Object.entries(this.mockUsers)
      .filter(([_, status]) => status)
      .map(([id]) => id)
  }
}

// Singleton instance
let socketInstance: MockWebSocket | null = null

// Get or create socket instance
export function getSocketInstance(): MockWebSocket {
  if (!socketInstance) {
    socketInstance = new MockWebSocket()
  }
  return socketInstance
}
