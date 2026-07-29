import { useAuth0 } from '@auth0/auth0-react'
import BookmarkBorderIcon from '@mui/icons-material/BookmarkBorder'
import FolderOutlinedIcon from '@mui/icons-material/FolderOutlined'
import LogoutIcon from '@mui/icons-material/Logout'
import { AppBar, Box, Button, Drawer, List, ListItemButton, ListItemIcon, ListItemText, Toolbar, Typography } from '@mui/material'
import { NavLink, Outlet } from 'react-router'

const drawerWidth = 244

const navigation = [
  { label: 'All bookmarks', to: '/all', icon: <BookmarkBorderIcon /> },
  { label: 'Collections', to: '/collections', icon: <FolderOutlinedIcon /> },
  { label: 'Bookmarks', to: '/bookmarks', icon: <BookmarkBorderIcon /> },
]

export default function AppShell() {
  const { user, logout } = useAuth0()

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh' }}>
      <AppBar color="inherit" elevation={0} position="fixed" sx={{ borderBottom: 1, borderColor: 'divider', ml: { md: `${drawerWidth}px` }, width: { md: `calc(100% - ${drawerWidth}px)` } }}>
        <Toolbar sx={{ justifyContent: 'space-between' }}>
          <Typography component="h1" variant="h6" sx={{ fontWeight: 700 }}>Private Bookmark Manager</Typography>
          <Button color="inherit" endIcon={<LogoutIcon />} onClick={() => logout({ logoutParams: { returnTo: window.location.origin } })}>{user?.name ?? user?.email ?? 'Account'}</Button>
        </Toolbar>
      </AppBar>
      <Drawer open sx={{ display: { xs: 'none', md: 'block' }, '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth } }} variant="permanent">
        <Toolbar><Typography color="primary" variant="h6">Bookmarks</Typography></Toolbar>
        <List sx={{ px: 1 }}>
          {navigation.map(({ label, to, icon }) => <ListItemButton component={NavLink} key={to} to={to} sx={{ borderRadius: 1.5, mb: 0.5, '&.active': { bgcolor: 'primary.main', color: 'primary.contrastText', '& .MuiListItemIcon-root': { color: 'inherit' } } }}><ListItemIcon>{icon}</ListItemIcon><ListItemText primary={label} /></ListItemButton>)}
        </List>
      </Drawer>
      <Box component="main" sx={{ flexGrow: 1, ml: { md: `${drawerWidth}px` }, p: { xs: 2, md: 4 }, pt: { xs: 10, md: 12 } }}><Outlet /></Box>
    </Box>
  )
}
