// Dax Chat — thin compatibility layer over api/dax.js.
//
// The chat transport moved into dax.js; this module keeps the names callers
// already use (ChatBot imports sendMessage / getChatHistory / clearChat) so the
// move didn't have to touch every call site. The previous version re-exported
// these under renamed aliases (getChatHistoryFn / getChatHistoryApi), which no
// caller used — and the build failed on the missing exports.
import { daxChat, getChatHistory as daxGetChatHistory, clearChat as daxClearChat } from './dax';

export const sendMessage    = (message) => daxChat(message);
export const getChatHistory = () => daxGetChatHistory();
export const clearChat      = () => daxClearChat();
