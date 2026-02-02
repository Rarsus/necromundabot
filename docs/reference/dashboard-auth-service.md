# DashboardAuthService API Reference

**Location**: `repos/necrobot-utils/src/services/DashboardAuthService.js`

**Purpose**: Reusable Discord OAuth 2.0 authentication service for dashboard integration

## Overview

The DashboardAuthService provides a comprehensive implementation of Discord OAuth 2.0 authentication flow, including token management, user profile retrieval, and guild membership verification. This service is designed to be used by the necrobot-dashboard for authenticating users and managing their access to guild-specific features.

## Table of Contents

- [Installation](#installation)
- [Quick Start](#quick-start)
- [Constructor](#constructor)
- [Methods](#methods)
  - [exchangeCodeForTokens](#exchangeodefortokens)
  - [refreshAccessToken](#refreshaccesstoken)
  - [validateToken](#validatetoken)
  - [getUserProfile](#getuserprofile)
  - [isGuildMember](#isguildmember)
  - [getUserRoles](#getuserroles)
  - [getAuthorizationUrl](#getauthorizationurl)
  - [revokeToken](#revoketoken)
- [Error Handling](#error-handling)
- [Security Considerations](#security-considerations)
- [Testing](#testing)
- [Examples](#examples)

## Installation

The DashboardAuthService is part of the `@rarsus/necrobot-utils` package:

```javascript
const { DashboardAuthService } = require('@rarsus/necrobot-utils');
```

## Quick Start

```javascript
const { DashboardAuthService } = require('@rarsus/necrobot-utils');

// Initialize the service
const authService = new DashboardAuthService(
  process.env.DISCORD_CLIENT_ID,
  process.env.DISCORD_CLIENT_SECRET,
  process.env.DISCORD_GUILD_ID,
  process.env.DISCORD_BOT_TOKEN
);

// Generate OAuth authorization URL
const authUrl = authService.getAuthorizationUrl('http://localhost:3000/callback', 'random-state-string');

// Exchange authorization code for tokens
const tokens = await authService.exchangeCodeForTokens(authCode, 'http://localhost:3000/callback');

// Get user profile
const profile = await authService.getUserProfile(tokens.accessToken);

// Verify guild membership
const isMember = await authService.isGuildMember(tokens.accessToken);
```

## Constructor

### `new DashboardAuthService(clientId, clientSecret, guildId, botToken, apiVersion?)`

Creates a new instance of DashboardAuthService.

**Parameters:**

- `clientId` (string, required): Discord application client ID
- `clientSecret` (string, required): Discord application client secret
- `guildId` (string, required): Discord guild ID for membership verification
- `botToken` (string, required): Discord bot token for API calls (format: "Bot YOUR_TOKEN")
- `apiVersion` (string, optional): Discord API version (default: "v10")

**Returns:** DashboardAuthService instance

**Throws:**

- Error if any required parameter is missing

**Example:**

```javascript
const authService = new DashboardAuthService(
  '123456789012345678', // clientId
  'your-client-secret', // clientSecret
  '987654321098765432', // guildId
  'Bot your-bot-token', // botToken
  'v10' // apiVersion (optional)
);
```

## Methods

### exchangeCodeForTokens

Exchanges an authorization code for access and refresh tokens.

```javascript
async exchangeCodeForTokens(code, redirectUri)
```

**Parameters:**

- `code` (string): Authorization code from OAuth callback
- `redirectUri` (string): OAuth redirect URI (must match the one used in authorization URL)

**Returns:** Promise resolving to:

```javascript
{
  accessToken: string,      // Access token for API calls
  refreshToken: string,     // Refresh token for obtaining new access tokens
  expiresIn: number,       // Token expiration time in seconds
  tokenType: string        // Token type (usually "Bearer")
}
```

**Throws:**

- Error if code exchange fails (invalid code, invalid credentials, network error)

**Example:**

```javascript
try {
  const tokens = await authService.exchangeCodeForTokens(
    'authorization_code_from_callback',
    'http://localhost:3000/callback'
  );

  console.log('Access Token:', tokens.accessToken);
  console.log('Expires in:', tokens.expiresIn, 'seconds');
} catch (error) {
  console.error('Token exchange failed:', error.message);
}
```

### refreshAccessToken

Refreshes an expired access token using a refresh token.

```javascript
async refreshAccessToken(refreshToken)
```

**Parameters:**

- `refreshToken` (string): Refresh token obtained from initial authorization

**Returns:** Promise resolving to:

```javascript
{
  accessToken: string,      // New access token
  expiresIn: number        // New expiration time in seconds
}
```

**Throws:**

- Error if token refresh fails (invalid refresh token, network error)

**Example:**

```javascript
try {
  const newTokens = await authService.refreshAccessToken(oldRefreshToken);
  console.log('New Access Token:', newTokens.accessToken);
} catch (error) {
  console.error('Token refresh failed:', error.message);
  // User needs to re-authenticate
}
```

### validateToken

Validates a token and checks if it has expired.

```javascript
validateToken(token);
```

**Parameters:**

- `token` (object): Token object with `accessToken` and `expiresAt` properties

**Returns:** boolean

- `true` if token is valid and not expired
- `false` if token is invalid, malformed, or expired

**Example:**

```javascript
const token = {
  accessToken: 'user_access_token',
  expiresAt: Date.now() + 3600000, // 1 hour from now
};

if (authService.validateToken(token)) {
  console.log('Token is valid');
} else {
  console.log('Token is expired or invalid');
  // Refresh the token
}
```

### getUserProfile

Retrieves user profile information from Discord API.

```javascript
async getUserProfile(accessToken)
```

**Parameters:**

- `accessToken` (string): User's access token

**Returns:** Promise resolving to:

```javascript
{
  id: string,              // Discord user ID
  username: string,        // Discord username
  email: string,          // User email (requires email scope)
  avatar: string,         // Avatar hash
  discriminator: string   // User discriminator (e.g., "0001")
}
```

**Throws:**

- Error if profile fetch fails (invalid token, API error)

**Note:** User profiles are cached to reduce API calls. Cache is cleared when tokens are revoked.

**Example:**

```javascript
try {
  const profile = await authService.getUserProfile(accessToken);
  console.log('User:', profile.username);
  console.log('Email:', profile.email);
  console.log('User ID:', profile.id);
} catch (error) {
  console.error('Failed to fetch profile:', error.message);
}
```

### isGuildMember

Verifies if a user is a member of the specified guild.

```javascript
async isGuildMember(accessToken, guildId?)
```

**Parameters:**

- `accessToken` (string): User's access token
- `guildId` (string, optional): Guild ID to check (defaults to service's guildId)

**Returns:** Promise resolving to boolean

- `true` if user is a guild member
- `false` if user is not a member or verification fails

**Note:** This method uses the bot token to check membership and returns false on any error (safe default).

**Example:**

```javascript
const isMember = await authService.isGuildMember(accessToken);

if (isMember) {
  console.log('User is a guild member');
  // Allow access to dashboard
} else {
  console.log('User is not a guild member');
  // Deny access or show invite link
}
```

### getUserRoles

Retrieves user's roles in the specified guild.

```javascript
async getUserRoles(accessToken, guildId?)
```

**Parameters:**

- `accessToken` (string): User's access token
- `guildId` (string, optional): Guild ID (defaults to service's guildId)

**Returns:** Promise resolving to array of role IDs (strings)

```javascript
['role_id_1', 'role_id_2', 'role_id_3'];
```

**Throws:**

- Error if role fetch fails (invalid token, API error, not a member)

**Example:**

```javascript
try {
  const roles = await authService.getUserRoles(accessToken);

  if (roles.includes('admin_role_id')) {
    console.log('User has admin privileges');
  }

  console.log('User roles:', roles.length);
} catch (error) {
  console.error('Failed to fetch roles:', error.message);
}
```

### getAuthorizationUrl

Generates a Discord OAuth authorization URL.

```javascript
getAuthorizationUrl(redirectUri, state);
```

**Parameters:**

- `redirectUri` (string): OAuth redirect URI (must be registered in Discord app)
- `state` (string): State parameter for CSRF protection (random string)

**Returns:** string - Full authorization URL

**Scopes Included:**

- `identify` - Basic user information
- `email` - User email
- `guilds` - List of user's guilds
- `guilds.members.read` - Guild member information

**Example:**

```javascript
const crypto = require('crypto');
const state = crypto.randomBytes(16).toString('hex');

const authUrl = authService.getAuthorizationUrl('http://localhost:3000/callback', state);

// Store state in session for verification
req.session.oauthState = state;

// Redirect user to Discord
res.redirect(authUrl);
```

### revokeToken

Revokes an access token (logout).

```javascript
async revokeToken(accessToken)
```

**Parameters:**

- `accessToken` (string): Access token to revoke

**Returns:** Promise resolving to boolean

- `true` if revocation successful
- `false` if revocation fails (token already invalid, network error)

**Note:** This method always removes the token from cache and returns false on errors (safe for logout).

**Example:**

```javascript
const revoked = await authService.revokeToken(accessToken);

if (revoked) {
  console.log('Token revoked successfully');
} else {
  console.log('Token revocation failed (may already be invalid)');
}

// Clear session regardless of revocation result
req.session.destroy();
```

## Error Handling

The DashboardAuthService throws descriptive errors for most operations. Always wrap API calls in try-catch blocks:

```javascript
try {
  const tokens = await authService.exchangeCodeForTokens(code, redirectUri);
  // Success - store tokens securely
} catch (error) {
  console.error('Authentication failed:', error.message);

  if (error.message.includes('invalid_grant')) {
    // Authorization code expired or invalid
    res.redirect('/login');
  } else if (error.message.includes('invalid_client')) {
    // Client credentials incorrect
    console.error('Configuration error - check client credentials');
  } else {
    // Network or other error
    res.status(500).send('Authentication service unavailable');
  }
}
```

### Common Error Scenarios

| Error Message                             | Cause                              | Solution                         |
| ----------------------------------------- | ---------------------------------- | -------------------------------- |
| `Client ID is required`                   | Missing constructor parameter      | Provide client ID                |
| `Failed to exchange code: invalid_grant`  | Invalid/expired auth code          | Redirect user to re-authenticate |
| `Failed to exchange code: invalid_client` | Wrong credentials                  | Check client ID and secret       |
| `Failed to refresh token`                 | Invalid refresh token              | User needs to re-authenticate    |
| `Failed to fetch user profile`            | Invalid/expired access token       | Refresh token or re-authenticate |
| `Failed to fetch user roles`              | User not in guild or token invalid | Check guild membership first     |

## Security Considerations

### 1. **Store Tokens Securely**

Never store access tokens in:

- Local storage (vulnerable to XSS)
- Cookies without `httpOnly` flag
- URL parameters
- Client-side code

**Recommended**: Store tokens in:

- Server-side sessions (encrypted)
- Secure, httpOnly cookies
- Database with encryption

### 2. **Validate State Parameter**

Always validate the state parameter to prevent CSRF attacks:

```javascript
// Generate state
const state = crypto.randomBytes(16).toString('hex');
req.session.oauthState = state;

// Verify state in callback
if (req.query.state !== req.session.oauthState) {
  throw new Error('Invalid state parameter - possible CSRF attack');
}
delete req.session.oauthState;
```

### 3. **Use HTTPS**

Always use HTTPS in production:

- Redirect URIs must use HTTPS
- Configure Discord app with HTTPS URLs
- Enable secure cookies

### 4. **Token Expiration**

Implement token expiration checking:

```javascript
const tokenData = {
  accessToken: tokens.accessToken,
  expiresAt: Date.now() + tokens.expiresIn * 1000,
};

// Store tokenData in session

// Before API calls, check expiration
if (!authService.validateToken(tokenData)) {
  // Refresh token
  const newTokens = await authService.refreshAccessToken(tokens.refreshToken);
  // Update stored tokens
}
```

### 5. **Rotate Refresh Tokens**

Consider implementing refresh token rotation:

- Store refresh token securely
- After refresh, invalidate old refresh token
- Update stored refresh token

### 6. **Rate Limiting**

Implement rate limiting for:

- Authorization attempts
- Token refresh attempts
- API calls

## Testing

The service includes comprehensive test coverage (>91%):

```bash
# Run tests
npm test --workspace=repos/necrobot-utils -- test-dashboard-auth-service.test.js

# Run with coverage
npm run test:coverage --workspace=repos/necrobot-utils
```

### Test Categories

- ✅ Constructor validation (5 tests)
- ✅ Token exchange (4 tests)
- ✅ Token refresh (4 tests)
- ✅ Token validation (4 tests)
- ✅ User profile (4 tests)
- ✅ Guild membership (4 tests)
- ✅ User roles (4 tests)
- ✅ Authorization URL (2 tests)
- ✅ Token revocation (2 tests)

### Mocking in Tests

The service uses a mockable `_fetch` property for testing:

```javascript
// In tests
const mockFetch = async () => ({
  ok: true,
  json: async () => ({ access_token: 'test_token' }),
});

authService._fetch = mockFetch;
```

## Examples

### Complete Authentication Flow

```javascript
const express = require('express');
const session = require('express-session');
const crypto = require('crypto');
const { DashboardAuthService } = require('@rarsus/necrobot-utils');

const app = express();
app.use(session({ secret: 'your-secret', resave: false, saveUninitialized: false }));

const authService = new DashboardAuthService(
  process.env.DISCORD_CLIENT_ID,
  process.env.DISCORD_CLIENT_SECRET,
  process.env.DISCORD_GUILD_ID,
  process.env.DISCORD_BOT_TOKEN
);

// Step 1: Redirect to Discord
app.get('/login', (req, res) => {
  const state = crypto.randomBytes(16).toString('hex');
  req.session.oauthState = state;

  const authUrl = authService.getAuthorizationUrl('http://localhost:3000/callback', state);

  res.redirect(authUrl);
});

// Step 2: Handle OAuth callback
app.get('/callback', async (req, res) => {
  try {
    // Verify state
    if (req.query.state !== req.session.oauthState) {
      throw new Error('Invalid state parameter');
    }
    delete req.session.oauthState;

    // Exchange code for tokens
    const tokens = await authService.exchangeCodeForTokens(req.query.code, 'http://localhost:3000/callback');

    // Get user profile
    const profile = await authService.getUserProfile(tokens.accessToken);

    // Verify guild membership
    const isMember = await authService.isGuildMember(tokens.accessToken);

    if (!isMember) {
      return res.status(403).send('You must be a member of the guild to access this dashboard');
    }

    // Get user roles
    const roles = await authService.getUserRoles(tokens.accessToken);

    // Store in session
    req.session.user = {
      id: profile.id,
      username: profile.username,
      email: profile.email,
      roles: roles,
    };

    req.session.tokens = {
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
      expiresAt: Date.now() + tokens.expiresIn * 1000,
    };

    res.redirect('/dashboard');
  } catch (error) {
    console.error('Authentication failed:', error.message);
    res.status(500).send('Authentication failed');
  }
});

// Step 3: Protected route
app.get('/dashboard', async (req, res) => {
  if (!req.session.user) {
    return res.redirect('/login');
  }

  // Check token expiration
  if (!authService.validateToken(req.session.tokens)) {
    try {
      // Refresh token
      const newTokens = await authService.refreshAccessToken(req.session.tokens.refreshToken);

      req.session.tokens.accessToken = newTokens.accessToken;
      req.session.tokens.expiresAt = Date.now() + newTokens.expiresIn * 1000;
    } catch (error) {
      // Refresh failed - user needs to re-authenticate
      delete req.session.user;
      delete req.session.tokens;
      return res.redirect('/login');
    }
  }

  res.send(`Welcome, ${req.session.user.username}!`);
});

// Step 4: Logout
app.get('/logout', async (req, res) => {
  if (req.session.tokens) {
    await authService.revokeToken(req.session.tokens.accessToken);
  }

  req.session.destroy();
  res.redirect('/');
});

app.listen(3000, () => console.log('Server running on port 3000'));
```

### Middleware for Protected Routes

```javascript
// middleware/requireAuth.js
const { DashboardAuthService } = require('@rarsus/necrobot-utils');

const authService = new DashboardAuthService(
  process.env.DISCORD_CLIENT_ID,
  process.env.DISCORD_CLIENT_SECRET,
  process.env.DISCORD_GUILD_ID,
  process.env.DISCORD_BOT_TOKEN
);

async function requireAuth(req, res, next) {
  if (!req.session.user || !req.session.tokens) {
    return res.redirect('/login');
  }

  // Check token expiration
  if (!authService.validateToken(req.session.tokens)) {
    try {
      const newTokens = await authService.refreshAccessToken(req.session.tokens.refreshToken);

      req.session.tokens.accessToken = newTokens.accessToken;
      req.session.tokens.expiresAt = Date.now() + newTokens.expiresIn * 1000;
    } catch (error) {
      delete req.session.user;
      delete req.session.tokens;
      return res.redirect('/login');
    }
  }

  next();
}

async function requireRole(roleId) {
  return async (req, res, next) => {
    if (!req.session.user.roles.includes(roleId)) {
      return res.status(403).send('Insufficient permissions');
    }
    next();
  };
}

module.exports = { requireAuth, requireRole };

// Usage
app.get('/dashboard', requireAuth, (req, res) => {
  res.send('Dashboard');
});

app.get('/admin', requireAuth, requireRole('admin_role_id'), (req, res) => {
  res.send('Admin panel');
});
```

## Related Documentation

- [Discord OAuth2 Documentation](https://discord.com/developers/docs/topics/oauth2)
- [Discord API Reference](https://discord.com/developers/docs/reference)
- [Necrobot Dashboard Architecture](../architecture/guild-aware-architecture.md)

## Support

For issues or questions:

- Check test suite for usage examples
- Review error messages for troubleshooting
- Consult Discord Developer Portal for API updates

## Version History

- **v1.0.0** (2024-02): Initial implementation
  - OAuth 2.0 authorization code flow
  - Token management (exchange, refresh, validation)
  - User profile retrieval
  - Guild membership verification
  - User roles fetching
  - 91.46% test coverage
  - Comprehensive error handling
