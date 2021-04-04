import { io } from "socket.io-client"
import { useEffect, useRef, useState } from 'react'
import e from "../constants"
import keyBy from 'lodash/keyBy'
import cloneDeep from 'lodash/cloneDeep'
import { useSelector } from "react-redux"
import { selectUser } from "../redux/slice/user"

const SECOND = 1000

const useChat = token => {
  const [currentConversation, setCurrentConversation] = useState(null)
  const [conversationsMap, setConversationsMap] = useState({})
  const [users, setUsers] = useState([])

  const { profile } = useSelector(selectUser)

  token = profile?._id && token

  /**
   * @type {{ current: Socket }}
   */
  const socketRef = useRef()

  useEffect(() => {
    socketRef.current = io(process.env.REACT_APP_HOST, {
      query: { token },
      path : '/api/v2/chat',
    })

    socketRef.current.on(e.CONNECT, () => {
      socketRef.current.emit(e.CONNECTED, fetchConversations)
    })

    socketRef.current.on(e.TYPING_STARTED, chatId => {
      setConversationsMap(map => {
        const nextMap = cloneDeep(map)

        nextMap[chatId].typing = true
        nextMap[chatId].typingStartedAt = Date.now()

        return nextMap
      })

      setTimeout(() => {
        setConversationsMap(map => {
          let nextMap = map

          if (Date.now() - nextMap[chatId].typingStartedAt > SECOND) {
            nextMap = cloneDeep(map)

            nextMap[chatId].typing = false
          }

          return nextMap
        })
      }, SECOND)
    })

    socketRef.current.on(e.CHAT_ERROR, error => alert(error.message))
    socketRef.current.on(e.CHAT_VIEWED, chatId => {
      setConversationsMap(map => {
        const nextMap = cloneDeep(map)

        const conversation = nextMap[chatId]

        conversation.messages.forEach(m => {
          m.viewed = true
        })

        setCurrentConversation(currentConversation => {
          return conversation._id === currentConversation?._id
            ? conversation
            : currentConversation
        })

        return nextMap
      })
    })

    socketRef.current.on(e.USER_ACTIVE, ({ _id: userId, isActive, lastSeen }) => {
      console.log({ userId, isActive })

      setConversationsMap(map => {
        const cloned = cloneDeep(map)

        for (const conversation of Object.values(cloned)) {
          if (conversation.user._id === userId) {
            conversation.user.isActive = isActive
            conversation.user.lastSeen = lastSeen

            break
          }
        }

        return cloned
      })
    })

    socketRef.current.on(e.NEW_MESSAGE, addNewMessage)
    socketRef.current.on(e.CREATED_CONVERSATION, fetchConversation)

    return () => socketRef.current.disconnect()
  }, [profile])

  const sendMessage = chatMessage => {
    socketRef.current.emit(e.MESSAGE, chatMessage)
  }

  const changeConversation = roomId => {
    setConversationsMap(map => {
      setCurrentConversation(map[roomId])

      const hasUnViewed = map[roomId].messages.some(m => {
        return !m.viewed && m.senderId !== profile._id
      })

      hasUnViewed && socketRef.current.emit(e.SET_VIEWED, roomId)

      return map
    })
  }

  const createConversation = userId => {
    socketRef.current.emit(e.CREATE_CONVERSATION, userId)
  }

  const fetchConversations = () => {
    socketRef.current.emit(e.GET_CONVERSATIONS, conversations => {
      setConversationsMap(keyBy(conversations, '_id'))
    })

    socketRef.current.emit(e.GET_USERS, users => {
      setUsers(users.filter(user => user.facebookId && user._id !== profile._id))
    })
  }

  const fetchConversation = id => {
    const onResponse = conversation => {
      setConversationsMap(map => {
        const nextMap = cloneDeep(map)

        nextMap[id] = conversation

        return nextMap
      })
    }

    socketRef.current.emit(e.JOIN_THE_CREATED_CONVERSATION, id, onResponse)
  }

  const addNewMessage = message => {
    setConversationsMap(map => {
      const nextMap = cloneDeep(map)

      const conversation = nextMap[message.chatId]

      conversation.messages.push(message)

      setCurrentConversation(currentConversation => {
        if (conversation._id === currentConversation?._id) {
          conversation.user._id === message.senderId
          && socketRef.current.emit(e.SET_VIEWED, message.chatId)

          return conversation
        }

        return currentConversation
      })


      nextMap[message.chatId] = conversation

      return nextMap
    })
  }

  const getConversations = () => {
    return Object.values(conversationsMap)
  }

  const setTyping = chatId => {
    socketRef.current.emit(e.TYPING_START, chatId)
  }

  return {
    currentConversation,
    users,
    sendMessage,
    changeConversation,
    createConversation,
    fetchConversations,
    getConversations,
    setTyping,
  }
}

export default useChat