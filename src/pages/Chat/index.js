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
import { login, selectUser } from "../../redux/slice/user"
import { findChatUsers, selectMusicians } from "../../redux/slice/all-users"
import { Add } from "@material-ui/icons"

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

const Online = styled(Badge)`
  margin-right: ${(props) => props.theme.spacing(1)}px;
  span {
    background-color: ${(props) =>
  props.theme.sidebar.footer.online.background};
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

  const { status: authStatus, profile, token, error: authError } = useSelector(state => selectUser(state))
  const { status: musiciansStatus, data: musicians, error: musiciansError } = useSelector(state => selectMusicians(state))

  const { messages, chat, sendMessage, createRoom, joinRoom } = useChat(token)

  useEffect(() => {
    if (authStatus === 'idle') {
      dispatch(login({
        email   : prompt('Email'),
        password: prompt('Password'),
      }))
    }

    if (musiciansStatus === 'idle' && token && token !== 'undefined') {
      dispatch(findChatUsers({ token }))
    }
  })

  const [chatInput, setChatInput] = useState('')

  const handleMessageSend = () => {
    sendMessage({
      message : chatInput,
      senderId: profile.id,
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

  if (!musicians) {
    return <h1>Wait a minute</h1>
  }

  const handleCreateRoom = () => {
    const userId = prompt('User Id')

    createRoom([profile.id, userId], () => {
      dispatch(findChatUsers({ token }))
    })
  }

  const pickRoomId = users => {
    const conversation = chat.find(conversation => {
      return conversation.users.every(user => users.includes(user))
    })

    return conversation.roomId
  }

  return (
    <ChatContainer container component={Card}>
      <ChatSidebar item xs={12} md={4} lg={3}>
        <Grid item xs={12}>
          <Box p={2}>
            <Add style={{ cursor: 'pointer' }} onClick={handleCreateRoom}/>
          </Box>
        </Grid>
        <Divider/>
        <List>
          {
            (musicians || [])
              .map(musician => {
                return (
                  <ListItem button onClick={() => joinRoom(pickRoomId([profile.id, musician.id]))}>
                    <ListItemIcon>
                      <Online
                        overlap="circle"
                        anchorOrigin={{
                          vertical  : "bottom",
                          horizontal: "right",
                        }}
                        variant="dot"
                      >
                        <Avatar
                          alt={musician.name}
                          src={musician.imageURL}
                        />
                      </Online>
                    </ListItemIcon>
                    <ListItemText
                      primary={musician.name || "Guest"}
                      // secondary="Повідомлення під іменем"
                    />
                  </ListItem>
                )
              })
          }
        </List>
      </ChatSidebar>
      <ChatMain item xs={12} md={8} lg={9}>
        <ChatMessages>
          {
            messages.map((message, i) => (
              <ChatMessageComponent
                name={message.senderId === profile.id ? 'I' : message.senderId}
                message={message.message}
                time="now"
                position={message.senderId === profile.id ? 'right' : 'left'}
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
