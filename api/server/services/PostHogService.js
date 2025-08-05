const { PostHog } = require('posthog-node');

class PostHogService {
  constructor() {
    this.client = null;
    this.isInitialized = false;
  }

  initialize() {
    const apiKey = process.env.POSTHOG_API_KEY;
    const host = process.env.POSTHOG_HOST || 'http://localhost:8000';

    if (!apiKey) {
      console.warn('PostHog API key not configured. Analytics will be disabled.');
      return;
    }

    try {
      this.client = new PostHog(apiKey, {
        host,
        flushAt: 20,
        flushInterval: 10000,
      });
      this.isInitialized = true;
      console.log(`PostHog initialized with host: ${host}`);
    } catch (error) {
      console.error('Failed to initialize PostHog:', error);
    }
  }

  captureMessageSent({ userId, conversationId, messageId, endpoint, model, messageLength, hasFiles, parentMessageId }) {
    if (!this.isInitialized || !this.client) return;

    try {
      this.client.capture({
        distinctId: userId,
        event: 'backend_message_sent',
        properties: {
          conversationId,
          messageId,
          endpoint,
          model,
          messageLength,
          hasFiles,
          parentMessageId,
          timestamp: new Date().toISOString(),
        },
      });
    } catch (error) {
      console.error('PostHog capture error:', error);
    }
  }

  captureMessageReceived({ userId, conversationId, messageId, endpoint, model, responseLength, tokenCount, parentMessageId }) {
    if (!this.isInitialized || !this.client) return;

    try {
      this.client.capture({
        distinctId: userId,
        event: 'backend_message_received',
        properties: {
          conversationId,
          messageId,
          endpoint,
          model,
          responseLength,
          tokenCount,
          parentMessageId,
          timestamp: new Date().toISOString(),
        },
      });
    } catch (error) {
      console.error('PostHog capture error:', error);
    }
  }

  captureConversationCreated({ userId, conversationId, title, endpoint, model }) {
    if (!this.isInitialized || !this.client) return;

    try {
      this.client.capture({
        distinctId: userId,
        event: 'backend_conversation_created',
        properties: {
          conversationId,
          title,
          endpoint,
          model,
          timestamp: new Date().toISOString(),
        },
      });
    } catch (error) {
      console.error('PostHog capture error:', error);
    }
  }

  captureConversationUpdated({ userId, conversationId, title, messageCount }) {
    if (!this.isInitialized || !this.client) return;

    try {
      this.client.capture({
        distinctId: userId,
        event: 'backend_conversation_updated',
        properties: {
          conversationId,
          title,
          messageCount,
          timestamp: new Date().toISOString(),
        },
      });
    } catch (error) {
      console.error('PostHog capture error:', error);
    }
  }

  captureError({ userId, error, context }) {
    if (!this.isInitialized || !this.client) return;

    try {
      this.client.capture({
        distinctId: userId || 'anonymous',
        event: 'backend_error',
        properties: {
          error: error.message,
          errorStack: error.stack,
          context,
          timestamp: new Date().toISOString(),
        },
      });
    } catch (captureError) {
      console.error('PostHog capture error:', captureError);
    }
  }

  identifyUser({ userId, email, name, username }) {
    if (!this.isInitialized || !this.client) return;

    try {
      this.client.identify({
        distinctId: userId,
        properties: {
          email,
          name,
          username,
        },
      });
    } catch (error) {
      console.error('PostHog identify error:', error);
    }
  }

  shutdown() {
    if (this.client) {
      this.client.shutdown();
    }
  }
}

module.exports = new PostHogService();