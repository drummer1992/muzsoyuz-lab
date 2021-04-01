import React, { useEffect, useState } from "react"
import styled from "styled-components/macro"
import { Helmet } from "react-helmet"
import {
  Badge,
  Box,
  Grid,
  Card,
  TextField as MuiTextField,
  Typography,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Avatar,
  Fab,
  Divider as MuiDivider,
} from "@material-ui/core"

import { spacing } from "@material-ui/system"

import SendIcon from "@material-ui/icons/Send"
import useChat from "./useChat"
import { useDispatch, useSelector } from "react-redux"
import { fetchProfile, login, selectUser } from "../../redux/slice/user"
import { Add } from "@material-ui/icons"
import Button from "@material-ui/core/Button"

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

const ChatMessage = styled.div`
  margin: 30px;
  text-align: ${(props) => props.position};
`

const ChatMessageInner = styled.div`
  display: inline-block;
`

const ChatMessageTime = styled(Typography)`
  text-align: right;
  opacity: 0.8;
`

const ChatMessageBubble = styled.div`
  display: inline-block;
  margin-right: auto;
  background: ${(props) =>
  props.highlighted
    ? props.theme.palette.secondary.main
    : props.theme.palette.action.hover};
  color: ${(props) =>
  props.highlighted
    ? props.theme.palette.common.white
    : props.theme.palette.text.primary};
  border-radius: 3px;
  padding: ${(props) => props.theme.spacing(2)}px;
  margin-bottom: ${(props) => props.theme.spacing(1)}px;
  ${(props) => props.theme.shadows[1]};
`

const ChatInput = styled(Grid)`
  min-height: 94px;
  padding: ${(props) => props.theme.spacing(5)}px;
`

const getStatusBadge = isActive => styled(Badge)`
  margin-right: ${(props) => props.theme.spacing(1)}px;
  span {
    background-color: ${(props) =>
  props.theme.sidebar.footer[isActive ? 'online' : 'offline'].background};
    border: 1.5px solid ${(props) => props.theme.palette.common.white};
    height: 12px;
    width: 12px;
    border-radius: 50%;
  }
`

function ChatMessageComponent({
  message,
  time,
  position = "left",
}) {
  return (
    <ChatMessage position={position}>
      <ChatMessageInner>
        <ChatMessageBubble highlighted={position === "right"}>
          <Typography variant="body2">{message}</Typography>
        </ChatMessageBubble>
        <ChatMessageTime variant="body2">{time}</ChatMessageTime>
      </ChatMessageInner>
    </ChatMessage>
  )
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
  } = useChat(token)

  useEffect(() => {
    if (authStatus === 'idle' && !token) {
      dispatch(login({
        email   : prompt('Email'),
        password: prompt('Password'),
      }))
    }

    if (token &&  !['succeeded', 'loading', 'failed'].includes(profile?.status)) {
      dispatch(fetchProfile())
    }
  }, [token, profile])

  const [chatInput, setChatInput] = useState('')
  const [selectedConversation, setSelectedConversation] = useState(null)

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

  const handleCreateRoom = () => {
    createConversation(prompt('User Id'))
  }

  return (
    <ChatContainer container component={Card}>
      <ChatSidebar item xs={12} md={4} lg={3}>
        <p style={{ marginLeft: 10 }}>
          {`Hello ${profile?.email}`}
        </p>
        <Grid item xs={12}>
          <Box p={2}>
            <Add style={{ cursor: 'pointer' }} onClick={handleCreateRoom}/>
          </Box>
        </Grid>
        <Divider/>
        <List>
          {
            getConversations()
              .map((conversation, i) => {
                const Status = getStatusBadge(conversation.user.isActive)

                const onClick = () => {
                  changeConversation(conversation._id)
                  setSelectedConversation(i)
                }

                return (
                  <ListItem
                    selected={selectedConversation === i}
                    key={`conversation-${i}`}
                    button onClick={onClick}>
                    <ListItemIcon>
                      <Status
                        overlap="circle"
                        anchorOrigin={{
                          vertical  : "bottom",
                          horizontal: "right",
                        }}
                        variant="dot"
                      >
                        <Avatar
                          alt={conversation.user.email}
                          src={conversation.user.imageURL}
                        />
                      </Status>
                    </ListItemIcon>
                    <ListItemText
                      primary={conversation.user.email || "Guest"}
                      secondary={
                        !conversation.user.isActive
                        && `Last seen: ${new Date(conversation.user.lastSeen).toLocaleTimeString()}`}
                    />
                  </ListItem>
                )
              })
          }
        </List>
        <Box p={2}>
          <Button
            style={{ cursor: 'pointer', color: 'red' }} onClick={() => {
            window.localStorage.clear()
            window.location.reload()
          }}>
            Вийти нахуй з цього чату
          </Button>
        </Box>
      </ChatSidebar>
      <ChatMain item xs={12} md={8} lg={9}>
        <ChatMessages>
          {
            (currentConversation?.messages || []).map((message, i) => (
              <ChatMessageComponent
                key={`message-${i}`}
                name={message.senderId === profile._id ? 'I' : message.senderId}
                message={message.text}
                time={new Date(message.createdAt).toLocaleTimeString()}
                position={message.senderId === profile._id ? 'right' : 'left'}
              />
            ))
          }
        </ChatMessages>
        <Divider/>
        <ChatInput container>
          <Grid item style={{ flexGrow: 1 }}>
            <TextField
              autoFocus={true}
              onChange={e => setChatInput(e.target.value)}
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
