import { startConversation } from '../src/conversation.mjs';
const message = process.argv.slice(2).join(' ') || 'I have two days and love porcelain and design.';
console.log(JSON.stringify(startConversation(message), null, 2));
