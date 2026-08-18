// Central definition of every node type the builder supports.

export const NODE_TYPES = {
  start: {
    label: 'Start (Trigger)',
    icon: 'bi-play-circle-fill',
    color: '#25D366', // ONLY Start node is WhatsApp Green
    description: 'When the chat begins / a keyword is received',
    outputs: [{ key: 'next', label: '' }],
    defaultData: { keywords: ['hi', 'hello', 'start', 'enquiry'] },
  },
  message: {
    label: 'Send Message',
    icon: 'bi-chat-left-text-fill',
    color: '#3b82f6', // Clean Royal Blue
    description: 'Send a formatted text message with variables',
    outputs: [{ key: 'next', label: '' }],
    defaultData: { text: 'Hey there! 👋 Welcome to our WhatsApp service.' },
  },
  buttons: {
    label: 'Quick Reply Buttons',
    icon: 'bi-ui-radios',
    color: '#6366f1', // Indigo Purple
    description: 'Ask a question with tappable button options',
    outputs: 'dynamic', // built from data.buttons
    defaultData: {
      text: 'What would you like to do?',
      buttons: [
        { id: 'b1', label: 'Option 1' },
        { id: 'b2', label: 'Option 2' },
      ],
    },
  },
  question: {
    label: 'Ask a Question',
    icon: 'bi-patch-question-fill',
    color: '#f59e0b', // Amber Orange
    description: 'Capture user reply into a variable',
    outputs: [{ key: 'next', label: '' }],
    defaultData: { text: 'Please enter your detail:', variableName: 'user_input', inputType: 'text' },
  },
  whatsappForm: {
    label: 'WhatsApp Form',
    icon: 'bi-ui-checks',
    color: '#0284c7', // Sky Cyan
    description: 'Send an interactive WhatsApp enquiry / registration form',
    outputs: [
      { key: 'submitted', label: 'On Submit' },
      { key: 'cancelled', label: 'On Cancel' },
    ],
    defaultData: {
      formId: '',
      saveResponseAs: 'form_data',
    },
  },
  apiRequest: {
    label: 'Call an API',
    icon: 'bi-cloud-arrow-down-fill',
    color: '#9333ea', // Deep Violet
    description: 'Fetch or send data to any HTTP REST API',
    outputs: [
      { key: 'success', label: 'On Success' },
      { key: 'error', label: 'On Error' },
    ],
    defaultData: {
      method: 'GET',
      url: 'https://jsonplaceholder.typicode.com/todos/1',
      headers: [{ key: 'Content-Type', value: 'application/json' }],
      body: '',
      saveResponseAs: 'api_response',
    },
  },
  condition: {
    label: 'Multiple Conditions',
    icon: 'bi-signpost-split-fill',
    color: '#ea580c', // Dark Amber / Orange
    description: 'Branch the flow on multiple variables and AND/OR rules',
    outputs: 'dynamic_condition', // built from branches + else
    defaultData: {
      branches: [
        {
          id: 'branch_1',
          label: 'Branch 1',
          matchType: 'AND', // 'AND' | 'OR'
          rules: [
            { variable: 'api_response.userId', operator: 'equals', value: '1' },
          ],
        },
      ],
      elseLabel: 'Default (Else)',
    },
  },
  subchatbot: {
    label: 'Connect Sub-Bot',
    icon: 'bi-diagram-3-fill',
    color: '#0d9488', // Teal
    description: 'Hand off the conversation to another chatbot flow',
    outputs: [],
    defaultData: { targetBotId: '' },
  },
  end: {
    label: 'End Conversation',
    icon: 'bi-stop-circle-fill',
    color: '#475569', // Slate Dark Neutral
    description: 'Close the flow / conclude conversation',
    outputs: [],
    defaultData: { text: 'Thanks for connecting with us! 💚' },
  },
};

export const PALETTE_ORDER = [
  'start',
  'message',
  'buttons',
  'question',
  'whatsappForm',
  'apiRequest',
  'condition',
  'subchatbot',
  'end',
];
