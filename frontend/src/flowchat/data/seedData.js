// Demo content showcasing Start (green), WhatsApp Interactive Form,
// Multi-branch Conditions, REST API query, and Counsellor handoff.

const clientId = 'client_demo';
const mainBotId = 'bot_main';
const supportBotId = 'bot_support';

export const seedData = {
  clients: [
    { id: clientId, name: 'Greenwood International', industry: 'Education & Admissions', createdAt: Date.now() },
  ],
  bots: [
    {
      id: mainBotId,
      clientId,
      name: 'Admissions & Enquiry Bot',
      status: 'draft',
      updatedAt: Date.now(),
      meta: { phoneNumberId: '1098xxxxxx', wabaId: '', accessToken: '', verifyToken: 'flowchat_verify' },
      startNodeId: 'n_start',
      nodes: {
        n_start: {
          id: 'n_start',
          type: 'start',
          position: { x: 60, y: 220 },
          data: { keywords: ['hi', 'hello', 'admission', 'enquiry'] },
          connections: { next: 'n_welcome' },
        },
        n_welcome: {
          id: 'n_welcome',
          type: 'message',
          position: { x: 380, y: 220 },
          data: { text: 'Hello! 👋 Welcome to Greenwood International Admissions. How may we assist you today?' },
          connections: { next: 'n_menu' },
        },
        n_menu: {
          id: 'n_menu',
          type: 'buttons',
          position: { x: 700, y: 220 },
          data: {
            text: 'Choose an option:',
            buttons: [
              { id: 'b1', label: '📝 Fill Enquiry Form' },
              { id: 'b2', label: '🎓 Check Status (API)' },
              { id: 'b3', label: '👨‍🏫 Talk to Counsellor' },
            ],
          },
          connections: { b1: 'n_form', b2: 'n_api', b3: 'n_handoff' },
        },
        n_form: {
          id: 'n_form',
          type: 'whatsappForm',
          position: { x: 1040, y: 80 },
          data: {
            formId: 'form_admissions_1',
            saveResponseAs: 'enquiry_data',
          },
          connections: { submitted: 'n_form_done', cancelled: 'n_end' },
        },
        n_form_done: {
          id: 'n_form_done',
          type: 'message',
          position: { x: 1380, y: 80 },
          data: {
            text: 'Awesome {{enquiry_data.full_name}}! We received your enquiry for {{enquiry_data.course}}. Our team will reach out at {{enquiry_data.phone}} soon! 🎓',
          },
          connections: { next: 'n_end' },
        },
        n_api: {
          id: 'n_api',
          type: 'apiRequest',
          position: { x: 1040, y: 300 },
          data: {
            method: 'GET',
            url: 'https://jsonplaceholder.typicode.com/todos/1',
            headers: [{ key: 'Content-Type', value: 'application/json' }],
            body: '',
            saveResponseAs: 'todo_res',
          },
          connections: { success: 'n_cond', error: 'n_api_fail' },
        },
        n_cond: {
          id: 'n_cond',
          type: 'condition',
          position: { x: 1380, y: 300 },
          data: {
            branches: [
              {
                id: 'branch_1',
                label: 'User 1 & Title Check',
                matchType: 'AND',
                rules: [
                  { variable: 'todo_res.userId', operator: 'equals', value: '1' },
                ],
              },
            ],
            elseLabel: 'Other User',
          },
          connections: { branch_1: 'n_show_status', else: 'n_api_fail' },
        },
        n_show_status: {
          id: 'n_show_status',
          type: 'message',
          position: { x: 1720, y: 220 },
          data: { text: '✅ Verified record! Task Title: {{todo_res.title}} (Status: {{todo_res.completed}})' },
          connections: { next: 'n_end' },
        },
        n_api_fail: {
          id: 'n_api_fail',
          type: 'message',
          position: { x: 1720, y: 380 },
          data: { text: "Hmm, record verification did not match. Please contact admissions support." },
          connections: { next: 'n_end' },
        },
        n_handoff: {
          id: 'n_handoff',
          type: 'subchatbot',
          position: { x: 1040, y: 520 },
          data: { targetBotId: supportBotId },
          connections: {},
        },
        n_end: {
          id: 'n_end',
          type: 'end',
          position: { x: 2060, y: 220 },
          data: { text: 'Thank you for connecting with Greenwood International! 💚' },
          connections: {},
        },
      },
    },
    {
      id: supportBotId,
      clientId,
      name: 'Admissions Counsellor Handoff',
      status: 'draft',
      updatedAt: Date.now(),
      meta: { phoneNumberId: '', wabaId: '', accessToken: '', verifyToken: '' },
      startNodeId: 's_start',
      nodes: {
        s_start: {
          id: 's_start',
          type: 'start',
          position: { x: 80, y: 140 },
          data: { keywords: [] },
          connections: { next: 's_msg' },
        },
        s_msg: {
          id: 's_msg',
          type: 'message',
          position: { x: 400, y: 140 },
          data: { text: "Connecting you to our dedicated Admissions Counsellor 🎧. An expert will join this chat in a few moments!" },
          connections: { next: 's_end' },
        },
        s_end: {
          id: 's_end',
          type: 'end',
          position: { x: 720, y: 140 },
          data: { text: '' },
          connections: {},
        },
      },
    },
  ],
};
