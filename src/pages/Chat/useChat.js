import { io } from "socket.io-client"
import { useEffect, useRef, useState } from 'react'
import e from "./events"
import keyBy from 'lodash/keyBy'
import cloneDeep from 'lodash/cloneDeep'
import { useSelector } from "react-redux"
import { selectUser } from "../../redux/slice/user"

const useChat = token => {
  const [currentConversation, setCurrentConversation] = useState(null)
  const [conversationsMap, setConversationsMap] = useState({})

  const { profile } = useSelector(state => selectUser(state))

  /**
   * @type {{ current: Socket }}
   */
  const socketRef = useRef()

  useEffect(() => {
    socketRef.current = io('http://localhost:8000', { query: { token } })

    socketRef.current.on(e.CONNECT, () => {
      socketRef.current.emit(e.CONNECTED, fetchConversations)
    })

    socketRef.current.on(e.CHAT_ERROR, error => alert(error.message))

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

    /**
     * Listens for incoming messages
     */
    socketRef.current.on(e.NEW_MESSAGE, addNewMessage)

    socketRef.current.on(e.CREATED_CONVERSATION, ({ participantId, _id }) => {
      if (participantId === profile._id) {
        fetchConversation(_id)
      }
    })

    return () => {
      socketRef.current.disconnect()
    }
  }, [token, profile])

  const sendMessage = chatMessage => {
    socketRef.current.emit(e.MESSAGE, chatMessage)
  }

  const changeConversation = (roomId) => {
    const onResponse = messages => {
      setConversationsMap(map => {
        const nextMap = cloneDeep(map)

        nextMap[roomId].messages = messages

        setCurrentConversation(nextMap[roomId])

        return nextMap
      })
    }

    socketRef.current.emit(e.GET_MESSAGES, roomId, onResponse)
  }

  const createConversation = userId => {
    const onResponse = newConversation => {
      setConversationsMap(map => {
        const nextMap = cloneDeep(map)

        nextMap[newConversation._id] = newConversation

        changeConversation(newConversation._id)

        return nextMap
      })
    }

    socketRef.current.emit(e.CREATE_CONVERSATION, userId, onResponse)
  }

  const fetchConversations = () => {
    const onResponse = conversations => {
      setConversationsMap(keyBy(conversations, '_id'))

      changeConversation(conversations[0]._id)
    }

    socketRef.current.emit(e.GET_CONVERSATIONS, onResponse)
  }

  const fetchConversation = id => {
    const onResponse = conversation => {
      setConversationsMap(map => {
        const nextMap = cloneDeep(map)

        nextMap[id] = conversation

        return nextMap
      })

      if (!currentConversation) {
        setCurrentConversation(conversation)
      }
    }

    socketRef.current.emit(e.GET_CONVERSATION, id, onResponse)
  }

  const addNewMessage = message => {
    setConversationsMap(map => {
      const nextMap = cloneDeep(map)

      nextMap[message.chatId].messages = nextMap[message.chatId].messages || []
      nextMap[message.chatId].messages.push(message)

      setCurrentConversation(conversation => {
        if (message.chatId !== conversation._id) {
          return conversation
        }

        return nextMap[message.chatId]
      })

      return nextMap
    })
  }

  const getConversations = () => {
    return Object.values(conversationsMap)
  }

  return {
    currentConversation,
    sendMessage,
    changeConversation,
    createConversation,
    fetchConversations,
    getConversations,
  }
}

export default useChat