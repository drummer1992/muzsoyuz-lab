import sumBy from "lodash/sumBy"
import { Done, DoneAll, MoreHoriz } from "@material-ui/icons"
import { Avatar, Badge, ListItem, ListItemIcon, ListItemText } from "@material-ui/core"
import React from "react"
import styled from "styled-components/macro"

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

export default function Conversation({ conversation, onClick, profile, selected }) {
  const Status = getStatusBadge(conversation.user.isActive)

  const byUnreadMessages = ({ viewed, senderId }) => {
    return Number(!viewed && senderId !== profile._id)
  }

  const unreadCount = sumBy(conversation.messages, byUnreadMessages)

  const getConversationStatus = () => {
    if (conversation.typing) {
      return <MoreHoriz/>
    }

    if (!unreadCount) {
      const hasUnreadParticipantsUnread = conversation.messages
        .some(({ senderId, viewed }) => !viewed && senderId === profile._id)

      if (!conversation.messages.some(m => m.senderId === profile._id)) {
        return null
      }

      return hasUnreadParticipantsUnread
        ? <Done/>
        : <DoneAll/>
    }

    return null
  }

  const { name, email } = conversation.user

  return (
    <ListItem
      selected={selected}
      button
      onClick={onClick}>
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
            alt={name || email}
            src={conversation.user.imageURL}
          />
        </Status>
      </ListItemIcon>
      <ListItemText
        style={{ overflow: 'hidden' }}
        primary={name || email || "Guest"}
        secondary={
          !conversation.user.isActive
          && `Last seen: ${new Date(conversation.user.lastSeen).toLocaleTimeString()}`}
      />
      <Badge
        badgeContent={unreadCount}
        color="secondary"
      />
      {getConversationStatus()}
    </ListItem>
  )
}