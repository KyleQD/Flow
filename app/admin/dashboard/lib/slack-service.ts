export interface SlackChannel {
  id: string
  name: string
}

export interface SlackWorkspace {
  id: string
  name: string
  isConnected: boolean
  channels: SlackChannel[]
}

export interface SlackNotificationConfig {
  eventId: string
  channelId: string
  notifications: {
    taskCreated: boolean
    taskCompleted: boolean
    taskAssigned: boolean
    eventUpdates: boolean
    budgetAlerts: boolean
  }
}

export const SlackService = {
  async getWorkspaces(): Promise<SlackWorkspace[]> {
    // TODO: Replace with real API call
    return []
  },
  async getNotificationConfig(eventId: string): Promise<SlackNotificationConfig | null> {
    // TODO: Replace with real API call
    return null
  },
  async saveNotificationConfig(config: SlackNotificationConfig): Promise<void> {
    // TODO: Replace with real API call
  },
  async connectWorkspace(code: string): Promise<SlackWorkspace> {
    // TODO: Replace with real API call
    return { id: '1', name: 'Demo Workspace', isConnected: true, channels: [] }
  },
  async disconnectWorkspace(workspaceId: string): Promise<void> {
    // TODO: Replace with real API call
  },
  async getChannels(workspaceId: string): Promise<SlackChannel[]> {
    // TODO: Replace with real API call
    return []
  },
  async sendMessage(channelId: string, message: string): Promise<void> {
    // TODO: Replace with real API call
  },
  async sendTaskNotification(taskId: string, status: string): Promise<void> {
    // TODO: Replace with real API call
  }
} 