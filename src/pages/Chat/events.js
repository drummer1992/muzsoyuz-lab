const ClientEvent = {
  TYPING_START          : 'typingStart',
  TYPING_END            : 'typingEnd',
  JOIN_THE_CONVERSATION : 'joinTheConversation',
  LEAVE_THE_CONVERSATION: 'leaveTheConversation',
  SET_VIEWED            : 'setViewed',
  MESSAGE               : 'message',
  SET_ACTIVE            : 'setActive',
  CREATE_CONVERSATION   : 'createConversation',
  GET_CONVERSATIONS     : 'getConversations',
  GET_CONVERSATION      : 'getConversation',
  GET_MESSAGES          : 'getMessages',
  CONNECTED             : 'connected',
}

const ServerEvent = {
  TYPING_STARTED      : 'typingStarted',
  TYPING_ENDED        : 'typingEnded',
  NEW_MESSAGE         : 'newMessage',
  CHAT_ERROR          : 'chatError',
  CREATED_CONVERSATION: 'createdConversation',
  CONNECT             : 'connect',
  USER_ACTIVE         : 'userActive',
}

const Event = {
  ...ClientEvent,
  ...ServerEvent,
}

export default Event