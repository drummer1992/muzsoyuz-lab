import React from "react"
import { Typography } from "@material-ui/core"
import { Done, DoneAll } from "@material-ui/icons"
import styled from "styled-components/macro"

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

export default function Message({
  message,
  viewed,
  time,
  position = "left",
}) {
  return (
    <ChatMessage position={position}>
      <ChatMessageInner>
        <ChatMessageBubble highlighted={position === "right"}>
          <Typography variant="body2">{message}</Typography>
        </ChatMessageBubble>
        {viewed ? <DoneAll/> : <Done/>}
        <ChatMessageTime variant="body2">{time}</ChatMessageTime>
      </ChatMessageInner>
    </ChatMessage>
  )
}