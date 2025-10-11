// Floating Chatbot JavaScript
class FloatingChatbot {
  constructor() {
    this.isOpen = false;
    this.messages = [];
    this.sessionId = this.generateSessionId();
    this.apiUrl = 'http://localhost:5000/api/chatbot';
    this.init();
  }

  generateSessionId() {
    return 'session_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
  }

  init() {
    this.createElements();
    this.bindEvents();
    this.addWelcomeMessage();
  }

  createElements() {
    // Elements are already in the HTML, just get references
    this.toggle = document.getElementById('chatbot-toggle');
    this.window = document.getElementById('chatbot-window');
    this.close = document.getElementById('chatbot-close');
    this.messagesContainer = document.getElementById('chatbot-messages');
    this.input = document.getElementById('chatbot-input');
    this.send = document.getElementById('chatbot-send');
    this.notification = document.getElementById('chatbot-notification');
  }

  bindEvents() {
    this.toggle.addEventListener('click', () => this.toggleChat());
    this.close.addEventListener('click', () => this.closeChat());
    this.send.addEventListener('click', () => this.sendMessage());
    this.input.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') this.sendMessage();
    });

    // Quick action buttons are now dynamically created and bound in addQuickActionButtons()
  }

  toggleChat() {
    if (this.isOpen) {
      this.closeChat();
    } else {
      this.openChat();
    }
  }

  openChat() {
    this.window.classList.add('active');
    this.isOpen = true;
    this.hideNotification();
    this.input.focus();
  }

  closeChat() {
    this.window.classList.remove('active');
    this.isOpen = false;
  }

  hideNotification() {
    this.notification.style.display = 'none';
  }

  showNotification() {
    this.notification.style.display = 'flex';
  }

  addMessage(content, isUser = false) {
    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${isUser ? 'user-message' : 'bot-message'}`;
    
    const avatar = document.createElement('div');
    avatar.className = 'message-avatar';
    
    if (isUser) {
      avatar.innerHTML = `
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
          <circle cx="12" cy="7" r="4"></circle>
        </svg>
      `;
    } else {
      avatar.innerHTML = `
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
          <circle cx="12" cy="7" r="4"></circle>
        </svg>
      `;
    }
    
    const messageContent = document.createElement('div');
    messageContent.className = 'message-content';
    messageContent.innerHTML = `<p>${content}</p>`;
    
    messageDiv.appendChild(avatar);
    messageDiv.appendChild(messageContent);
    
    this.messagesContainer.appendChild(messageDiv);
    this.scrollToBottom();
  }

  async sendMessage() {
    const message = this.input.value.trim();
    if (!message) return;

    this.addMessage(message, true);
    this.input.value = '';
    
    // Show typing indicator
    this.showTypingIndicator();
    
    try {
      // Send message to backend
      const response = await fetch(`${this.apiUrl}/message`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: message,
          sessionId: this.sessionId
        })
      });

      const data = await response.json();
      
      // Hide typing indicator
      this.hideTypingIndicator();
      
      if (data.success) {
        this.addMessage(data.response);
      } else {
        this.addMessage('I apologize, but I\'m having trouble processing your request right now. Please try again.');
      }
    } catch (error) {
      console.error('Error sending message:', error);
      this.hideTypingIndicator();
      this.addMessage('I\'m sorry, but I\'m having connection issues. Please try again in a moment.');
    }
  }

  showTypingIndicator() {
    const typingDiv = document.createElement('div');
    typingDiv.className = 'message bot-message typing-indicator';
    typingDiv.id = 'typing-indicator';
    
    const avatar = document.createElement('div');
    avatar.className = 'message-avatar';
    avatar.innerHTML = `
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
        <circle cx="12" cy="7" r="4"></circle>
      </svg>
    `;
    
    const messageContent = document.createElement('div');
    messageContent.className = 'message-content';
    messageContent.innerHTML = `
      <div class="typing-dots">
        <span></span>
        <span></span>
        <span></span>
      </div>
    `;
    
    typingDiv.appendChild(avatar);
    typingDiv.appendChild(messageContent);
    
    this.messagesContainer.appendChild(typingDiv);
    this.scrollToBottom();
  }

  hideTypingIndicator() {
    const typingIndicator = document.getElementById('typing-indicator');
    if (typingIndicator) {
      typingIndicator.remove();
    }
  }

  async handleQuickAction(action) {
    try {
      // Show typing indicator
      this.showTypingIndicator();
      
      // Send quick action to backend
      const response = await fetch(`${this.apiUrl}/quick-action`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: action,
          sessionId: this.sessionId
        })
      });

      const data = await response.json();
      
      // Hide typing indicator
      this.hideTypingIndicator();
      
      if (data.success) {
        this.addMessage(data.response);
      } else {
        this.addMessage('I apologize, but I\'m having trouble processing your request right now. Please try again.');
      }
    } catch (error) {
      console.error('Error handling quick action:', error);
      this.hideTypingIndicator();
      this.addMessage('I\'m sorry, but I\'m having connection issues. Please try again in a moment.');
    }
  }

  addWelcomeMessage() {
    // Welcome message is already in HTML
    this.showNotification();
    // Add quick action buttons after a short delay
    setTimeout(() => {
      this.addQuickActionButtons();
    }, 500);
  }

  addQuickActionButtons() {
    const quickActionDiv = document.createElement('div');
    quickActionDiv.className = 'quick-action-message';
    
    const quickActions = [
      // { text: 'View Properties', action: 'properties' },
      // { text: 'Contact Agent', action: 'contact' },
      // { text: 'Schedule Viewing', action: 'schedule' }
    ];
    
    quickActions.forEach(action => {
      const button = document.createElement('button');
      button.className = 'quick-action-btn';
      button.textContent = action.text;
      button.dataset.action = action.action;
      button.addEventListener('click', () => {
        this.handleQuickAction(action.action);
        // Remove the quick action buttons after clicking
        quickActionDiv.remove();
      });
      quickActionDiv.appendChild(button);
    });
    
    this.messagesContainer.appendChild(quickActionDiv);
    this.scrollToBottom();
  }

  scrollToBottom() {
    this.messagesContainer.scrollTop = this.messagesContainer.scrollHeight;
  }
}

// Initialize chatbot when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
  new FloatingChatbot();
});
