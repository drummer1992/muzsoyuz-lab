import React, { useEffect, useState } from "react"
import { Helmet } from "react-helmet"
import {
  Box,
  Grid,
  Card,
  TextField as MuiTextField,
  List,
  Fab,
  Divider as MuiDivider,
} from "@material-ui/core"

import { spacing } from "@material-ui/system"
import styled from "styled-components/macro"
import SendIcon from "@material-ui/icons/Send"
import useChat from "../../hooks/useChat"
import { useDispatch, useSelector } from "react-redux"
import { fetchProfile, login, selectUser } from "../../redux/slice/user"
import Button from "@material-ui/core/Button"
import Conversation from "./Conversation"
import Message from "./Message"
import UsersList from "./UsersList"

const Divider = styled(MuiDivider)(spacing)

const TextField = styled(MuiTextField)(spacing)

const ChatContainer = styled(Grid)`
  width: 100%;
  height: 100vh;
`

const ChatSidebar = styled(Grid)`
  border-right: 1px solid ${(props) => props.theme.palette.divider};
`

const ChatMain = styled(Grid)``

const ChatMessages = styled.div`
  overflow-y: scroll;
  height: calc(100vh - 94px);
`

const ChatInput = styled(Grid)`
  min-height: 94px;
  padding: ${(props) => props.theme.spacing(5)}px;
`

const logout = () => {
  window.localStorage.clear()
  window.location.reload()
}

function ChatWindow() {
  const dispatch = useDispatch()

  const { status: authStatus, profile, token, error: authError } = useSelector(selectUser)

  const {
    currentConversation,
    sendMessage,
    createConversation,
    changeConversation,
    getConversations,
    setTyping,
    fetchUsers,
  } = useChat(token)

  const [chatInput, setChatInput] = useState('')
  const [selectedConversationId, setSelectedConversationId] = useState(null)
  const conversations = getConversations()

  useEffect(() => {
    if (authStatus === 'idle' && !token) {
      dispatch(login({
        email   : prompt('Email'),
        password: prompt('Password'),
      }))
    }

    if (token && !profile?.status) {
      dispatch(fetchProfile())
    }
  }, [token, profile, currentConversation])

  const handleMessageSend = () => {
    if (!chatInput) {
      return alert('Empty input')
    }

    if (!currentConversation?._id) {
      return alert('No one conversation set')
    }

    sendMessage({
      text  : chatInput,
      chatId: currentConversation._id,
    })

    setChatInput('')
  }

  const handleEnterPress = event => {
    if (event.key === 'Enter') {
      handleMessageSend()
    }
  }

  if (authStatus !== 'idle' && (!profile || !token || authError)) {
    return <h1>Error: {authError || "Unknown Error"}</h1>
  }

  if (profile?.status !== 'succeeded') {
    return <h1>Wait a minute</h1>
  }

  const handleCreateRoom = userId => () => {
    createConversation(userId)
  }

  const handleTyping = e => {
    currentConversation && setTyping(currentConversation._id)

    setChatInput(e.target.value)
  }

  return (
    <ChatContainer container component={Card}>
      <ChatSidebar item xs={12} md={4} lg={3}>
        <p style={{ marginLeft: 10 }}>
          {`Hello ${profile?.email}`}
        </p>
        <Grid item xs={12}>
          <Box p={2}>
            <UsersList
              onClick={handleCreateRoom}
              fetchUsers={fetchUsers}
            />
          </Box>
        </Grid>
        <Divider/>
        <List>
          {
            conversations.map((item, i) => (
              <Conversation
                key={`conversation-${i}`}
                conversation={item}
                selected={selectedConversationId === item._id}
                profile={profile}
                onClick={() => {
                  changeConversation(item._id)
                  setSelectedConversationId(item._id)
                }}
              />
            ))
          }
        </List>
        <Box p={2}>
          <Button
            style={{ cursor: 'pointer', color: 'red' }} onClick={logout}>
            Logout
          </Button>
        </Box>
      </ChatSidebar>
      <ChatMain item xs={12} md={8} lg={9}>
        <ChatMessages>
          {(currentConversation?.messages || []).map(
            ({ senderId, text, viewed, createdAt }, i) => (
              <Message
                key={`message-${i}`}
                name={senderId === profile._id ? 'I' : senderId}
                message={text}
                viewed={viewed}
                time={new Date(createdAt).toLocaleTimeString()}
                position={senderId === profile._id ? 'right' : 'left'}
              />
            )
          )}
        </ChatMessages>
        <Divider/>
        <ChatInput container>
          <Grid item style={{ flexGrow: 1 }}>
            <TextField
              autoFocus={true}
              onChange={handleTyping}
              onKeyUp={handleEnterPress}
              value={chatInput}
              variant="outlined"
              label="Type your message"
              fullWidth
            />
          </Grid>
          <Grid item>
            <Box ml={2}>
              <Fab color="primary" aria-label="add" size="medium">
                <SendIcon onClick={handleMessageSend}/>
              </Fab>
            </Box>
          </Grid>
        </ChatInput>
      </ChatMain>
    </ChatContainer>
  )
}

function Chat() {
  return (
    <React.Fragment>
      <Helmet title="Chat"/>
      <ChatWindow/>
    </React.Fragment>
  )
}

export default Chat
