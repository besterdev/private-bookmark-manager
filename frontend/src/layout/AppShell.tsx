import { useAuth0 } from '@auth0/auth0-react'
import BookmarkBorderIcon from '@mui/icons-material/BookmarkBorder'
import CloseIcon from '@mui/icons-material/Close'
import FolderOutlinedIcon from '@mui/icons-material/FolderOutlined'
import LogoutIcon from '@mui/icons-material/Logout'
import MenuIcon from '@mui/icons-material/Menu'
import { AppBar, Box, Button, Drawer, IconButton, List, ListItemButton, ListItemIcon, ListItemText, Toolbar, Typography } from '@mui/material'
import { NavLink, Outlet } from 'react-router'
import { useState } from 'react'

const drawerWidth = 244
const navigationIconButtonFocus = { outline: '3px solid #FF6E00', outlineOffset: 2 }

const navigation = [
  { label: 'All bookmarks', to: '/all', icon: <BookmarkBorderIcon /> },
  { label: 'Collections', to: '/collections', icon: <FolderOutlinedIcon /> },
  { label: 'Bookmarks', to: '/bookmarks', icon: <BookmarkBorderIcon /> },
]

function NavigationList({ onNavigate }: { onNavigate?: () => void }) {
  return (
    <List sx={{ px: 1 }}>
      {navigation.map(({ label, to, icon }) => (
        <ListItemButton component={NavLink} key={to} onClick={onNavigate} to={to} sx={{ borderRadius: 1.5, mb: 0.5, '&.active': { bgcolor: 'primary.main', color: 'primary.contrastText', '& .MuiListItemIcon-root': { color: 'inherit' } } }}>
          <ListItemIcon>{icon}</ListItemIcon>
          <ListItemText primary={label} />
        </ListItemButton>
      ))}
    </List>
  )
}

export default function AppShell() {
  const { user, logout } = useAuth0()
  const [mobileOpen, setMobileOpen] = useState(false)

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh' }}>
      <AppBar color="inherit" elevation={0} position="fixed" sx={{ borderBottom: 1, borderColor: 'divider', ml: { md: `${drawerWidth}px` }, width: { md: `calc(100% - ${drawerWidth}px)` } }}>
        <Toolbar sx={{ gap: 1 }}>
          <IconButton aria-label="Open navigation" color="inherit" onClick={() => setMobileOpen(true)} sx={{ '&.Mui-focusVisible': navigationIconButtonFocus, display: { xs: 'inline-flex', md: 'none' } }}>
            <MenuIcon />
          </IconButton>
          <Typography component="h1" noWrap variant="h6" sx={{ flexGrow: 1, fontWeight: 700, minWidth: 0 }}>Private Bookmark Manager</Typography>
          <Button color="inherit" endIcon={<LogoutIcon />} onClick={() => logout({ logoutParams: { returnTo: window.location.origin } })} sx={{ flexShrink: 0, maxWidth: { xs: 120, sm: 'none' }, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{user?.name ?? user?.email ?? 'Account'}</Button>
        </Toolbar>
      </AppBar>
      <Drawer open sx={{ display: { xs: 'none', md: 'block' }, '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth } }} variant="permanent">
        <Toolbar><Typography color="primary" variant="h6">Bookmarks</Typography></Toolbar>
        <Box component="nav" aria-label="Desktop navigation"><NavigationList /></Box>
      </Drawer>
      <Drawer onClose={() => setMobileOpen(false)} open={mobileOpen} sx={{ display: { xs: 'block', md: 'none' }, '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth } }} variant="temporary">
        <Toolbar sx={{ justifyContent: 'space-between' }}>
          <Typography color="primary" variant="h6">Bookmarks</Typography>
          <IconButton aria-label="Close navigation" onClick={() => setMobileOpen(false)} sx={{ '&.Mui-focusVisible': navigationIconButtonFocus }}><CloseIcon /></IconButton>
        </Toolbar>
        <Box component="nav" aria-label="Mobile navigation"><NavigationList onNavigate={() => setMobileOpen(false)} /></Box>
      </Drawer>
      <Box component="main" sx={{ flexGrow: 1, ml: { md: `${drawerWidth}px` }, p: { xs: 2, md: 4 }, pt: { xs: 10, md: 12 } }}><Outlet /></Box>
    </Box>
  )
}
