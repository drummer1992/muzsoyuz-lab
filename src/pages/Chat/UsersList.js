import React, { useEffect } from 'react'
import { makeStyles } from '@material-ui/core/styles'
import List from '@material-ui/core/List'
import ListItem from '@material-ui/core/ListItem'
import ListItemIcon from '@material-ui/core/ListItemIcon'
import ListItemText from '@material-ui/core/ListItemText'
import Collapse from '@material-ui/core/Collapse'
import ExpandLess from '@material-ui/icons/ExpandLess'
import ExpandMore from '@material-ui/icons/ExpandMore'
import { GroupAdd } from "@material-ui/icons"
import { Avatar } from "@material-ui/core"

const useStyles = makeStyles((theme) => ({
  root  : {
    width          : '100%',
    maxWidth       : 360,
    backgroundColor: theme.palette.background.paper,
    position       : 'relative',
    overflow       : 'auto',
    maxHeight      : 300,
  },
  nested: {
    paddingLeft: theme.spacing(4),
  },
}))

export default function UsersList({ users, onClick }) {
  const classes = useStyles()
  const [open, setOpen] = React.useState(false)

  useEffect(() => {

  }, [users, open])

  const handleClick = () => {
    setOpen(!open)
  }

  return (
    <List
      component="nav"
      aria-labelledby="nested-list-subheader"
      className={classes.root}
    >
      <ListItem button onClick={handleClick}>
        <ListItemIcon>
          <GroupAdd/>
        </ListItemIcon>
        <ListItemText primary="Add Conversation"/>
        {open ? <ExpandLess/> : <ExpandMore/>}
      </ListItem>
      <Collapse
        in={open}
        timeout="auto"
        unmountOnExit
      >
        <List component="div" disablePadding>
          {
            (users || []).map((user, i) => (
              <ListItem
                key={`user-${i}`}
                button
                onClick={onClick(user._id)}
                className={classes.nested}
              >
                <ListItemIcon>
                  <Avatar
                    alt={user.email}
                    src={user.imageURL}
                  />
                </ListItemIcon>
                <ListItemText primary={user.email}/>
              </ListItem>
            ))
          }
        </List>
      </Collapse>
    </List>
  )
}