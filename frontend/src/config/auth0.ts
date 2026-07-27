function required(name: 'VITE_AUTH0_DOMAIN' | 'VITE_AUTH0_CLIENT_ID'): string {
  const value = import.meta.env[name]
  if (!value) throw new Error(`${name} is required`)
  return value
}

export const auth0Config = {
  domain: required('VITE_AUTH0_DOMAIN'),
  clientId: required('VITE_AUTH0_CLIENT_ID'),
  authorizationParams: {
    audience: import.meta.env.VITE_AUTH0_AUDIENCE,
    redirect_uri: `${window.location.origin}/callback`,
  },
}
