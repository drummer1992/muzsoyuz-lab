import io from "socket.io-client"
import { useEffect, useRef, useState } from 'react'

const MESSAGE = 'chatMessage'
const GET_CHAT = 'getChat'
const GET_MESSAGES = 'getMessages'
const CREATE_ROOM = 'createRoom'
const JOIN_ROOM = 'joinRoom'
const JOINED_ROOM = 'joinedRoom'
const LEAVE_ROOM = 'leaveRoom'
const LEFT_ROOM = 'leftRoom'
const TYPING = 'typing'

const GLOBAL_ROOM = 'global'

// Повідомлення відправляються в одну й ту ж руму

const useChat = token => {
  const [chat, setChat] = useState([])
  const [conversation, setConversation] = useState(null)
  const [messages, setMessages] = useState([])
  const socketRef = useRef()

  /**
   * Creates a WebSocket connection
   */
  useEffect(() => {
    /**
     * First of all we should fetch all conversations
     *
     * if !conversations.length
     *    fetchConversations
     *
     * then ↓
     */

    socketRef.current = io('http://localhost:9000/api/v1/chat', { query: { token } })

    socketRef.current.on('connect', () => {
      socketRef.current.emit(GET_CHAT, chat => {
        setChat(chat)
      })
    })

    /**
     * Listens for incoming messages
     */
    socketRef.current.on(MESSAGE, message => {
      setMessages(messages => [...messages, message])
    })

    socketRef.current.on(JOINED_ROOM, (client, body) => {
      console.log(body)
    })

    socketRef.current.on(LEFT_ROOM, (client, body) => {
      console.log(body)
    })

    return () => {
      socketRef.current.emit(LEAVE_ROOM, GLOBAL_ROOM)

      socketRef.current.disconnect()
    }
  }, [token])

  const sendMessage = chatMessage => {
    socketRef.current.emit(MESSAGE, {
      message : chatMessage.message,
      senderId: chatMessage.senderId,
      chat    : {
        id    : conversation.id,
        roomId: conversation.roomId,
      },
    })
  }

  const joinRoom = (roomId) => {
    if (chat.length) {
      socketRef.current.emit(JOIN_ROOM, roomId)

      const conversation = chat.find(conversation => conversation.roomId === roomId)

      if (conversation) {
        setConversation(conversation)

        socketRef.current.emit(GET_MESSAGES, roomId, setMessages)
      }
    }
  }

  const createRoom = (users, callback) => {
    socketRef.current.emit(CREATE_ROOM, users, roomId => {
      joinRoom(roomId)
      callback()
    })
  }

  return {
    messages,
    chat,
    sendMessage,
    joinRoom,
    createRoom,
  }
}

export default useChat