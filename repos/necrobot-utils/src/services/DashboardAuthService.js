/**
 * DashboardAuthService - Discord OAuth authentication service
 * Handles OAuth 2.0 authorization code flow, token management, and guild verification
 */

class DashboardAuthService {
  /**
   * Initialize DashboardAuthService with Discord credentials
   * @param {string} clientId - Discord application client ID
   * @param {string} clientSecret - Discord application client secret
   * @param {string} guildId - Discord guild ID for membership verification
   * @param {string} botToken - Discord bot token for API calls
   */
  constructor(clientId, clientSecret, guildId, botToken) {
    if (!clientId) {
      throw new Error('Client ID is required');
    }
    if (!clientSecret) {
      throw new Error('Client Secret is required');
    }
    if (!guildId) {
      throw new Error('Guild ID is required');
    }
    if (!botToken) {
      throw new Error('Bot Token is required');
    }

    this.clientId = clientId;
    this.clientSecret = clientSecret;
    this.guildId = guildId;
    this.botToken = botToken;
    this.baseUrl = 'https://discord.com/api/v10';
    this.userProfileCache = new Map();

    // Use native fetch (available in Node.js 18+)
    // Allow override for testing
    this._fetch = global.fetch || require('node-fetch');
  }

  /**
   * Exchange authorization code for access and refresh tokens
   * @param {string} code - Authorization code from OAuth callback
   * @param {string} redirectUri - OAuth redirect URI
   * @returns {Promise<{accessToken: string, refreshToken: string, expiresIn: number, tokenType: string}>}
   */
  async exchangeCodeForTokens(code, redirectUri) {
    try {
      const params = new URLSearchParams({
        client_id: this.clientId,
        client_secret: this.clientSecret,
        grant_type: 'authorization_code',
        code: code,
        redirect_uri: redirectUri,
      });

      const response = await this._fetch(`${this.baseUrl}/oauth2/token`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: params.toString(),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(`Failed to exchange code: ${error.error || response.status}`);
      }

      const data = await response.json();

      return {
        accessToken: data.access_token,
        refreshToken: data.refresh_token,
        expiresIn: data.expires_in,
        tokenType: data.token_type,
      };
    } catch (error) {
      throw new Error(`Failed to exchange code for tokens: ${error.message}`);
    }
  }

  /**
   * Refresh expired access token using refresh token
   * @param {string} refreshToken - Refresh token
   * @returns {Promise<{accessToken: string, expiresIn: number}>}
   */
  async refreshAccessToken(refreshToken) {
    try {
      const params = new URLSearchParams({
        client_id: this.clientId,
        client_secret: this.clientSecret,
        grant_type: 'refresh_token',
        refresh_token: refreshToken,
      });

      const response = await this._fetch(`${this.baseUrl}/oauth2/token`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: params.toString(),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(`Failed to refresh token: ${error.error || response.status}`);
      }

      const data = await response.json();

      return {
        accessToken: data.access_token,
        expiresIn: data.expires_in,
      };
    } catch (error) {
      throw new Error(`Failed to refresh token: ${error.message}`);
    }
  }

  /**
   * Validate token and check expiration
   * @param {Object} token - Token object with accessToken and expiresAt
   * @returns {boolean} True if token is valid, false otherwise
   */
  validateToken(token) {
    if (!token || !token.accessToken) {
      return false;
    }

    if (!token.expiresAt) {
      return false;
    }

    // Check if token is expired
    const now = Date.now();
    return token.expiresAt > now;
  }

  /**
   * Get user profile from Discord API
   * @param {string} accessToken - User access token
   * @returns {Promise<{id: string, username: string, email: string, avatar: string, discriminator: string}>}
   */
  async getUserProfile(accessToken) {
    try {
      // Check cache first
      if (this.userProfileCache.has(accessToken)) {
        return this.userProfileCache.get(accessToken);
      }

      const response = await this._fetch(`${this.baseUrl}/users/@me`, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(`Failed to fetch user profile: ${error.message || response.status}`);
      }

      const data = await response.json();

      const profile = {
        id: data.id,
        username: data.username,
        email: data.email,
        avatar: data.avatar,
        discriminator: data.discriminator,
      };

      // Cache the profile
      this.userProfileCache.set(accessToken, profile);

      return profile;
    } catch (error) {
      throw new Error(`Failed to fetch user profile: ${error.message}`);
    }
  }

  /**
   * Verify user is member of specified guild
   * @param {string} accessToken - User access token
   * @param {string} guildId - Guild ID to check (defaults to service guildId)
   * @returns {Promise<boolean>} True if user is guild member, false otherwise
   */
  async isGuildMember(accessToken, guildId = null) {
    try {
      const targetGuildId = guildId || this.guildId;

      // Get user profile to get user ID
      const profile = await this.getUserProfile(accessToken);
      const userId = profile.id;

      // Use bot token to check guild membership
      const response = await this._fetch(`${this.baseUrl}/guilds/${targetGuildId}/members/${userId}`, {
        method: 'GET',
        headers: {
          Authorization: this.botToken,
        },
      });

      if (response.ok) {
        return true;
      }

      // 404 means user is not a member
      if (response.status === 404) {
        return false;
      }

      // Other errors
      return false;
    } catch {
      // On error, assume not a member
      return false;
    }
  }

  /**
   * Get user roles in specified guild
   * @param {string} accessToken - User access token
   * @param {string} guildId - Guild ID to check (defaults to service guildId)
   * @returns {Promise<string[]>} Array of role IDs
   */
  async getUserRoles(accessToken, guildId = null) {
    try {
      const targetGuildId = guildId || this.guildId;

      // Get user profile to get user ID
      const profile = await this.getUserProfile(accessToken);
      const userId = profile.id;

      // Use bot token to get guild member data
      const response = await this._fetch(`${this.baseUrl}/guilds/${targetGuildId}/members/${userId}`, {
        method: 'GET',
        headers: {
          Authorization: this.botToken,
        },
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(`Failed to fetch user roles: ${error.message || response.status}`);
      }

      const data = await response.json();

      return data.roles || [];
    } catch (error) {
      throw new Error(`Failed to fetch user roles: ${error.message}`);
    }
  }

  /**
   * Build Discord OAuth authorization URL
   * @param {string} redirectUri - OAuth redirect URI
   * @param {string} state - State parameter for CSRF protection
   * @returns {string} Authorization URL
   */
  getAuthorizationUrl(redirectUri, state) {
    const params = new URLSearchParams({
      client_id: this.clientId,
      redirect_uri: redirectUri,
      response_type: 'code',
      scope: 'identify email guilds guilds.members.read',
      state: state,
    });

    return `https://discord.com/api/oauth2/authorize?${params.toString()}`;
  }

  /**
   * Revoke access token (logout)
   * @param {string} accessToken - Access token to revoke
   * @returns {Promise<boolean>} True if revocation successful, false otherwise
   */
  async revokeToken(accessToken) {
    try {
      const params = new URLSearchParams({
        client_id: this.clientId,
        client_secret: this.clientSecret,
        token: accessToken,
      });

      const response = await this._fetch(`${this.baseUrl}/oauth2/token/revoke`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: params.toString(),
      });

      // Remove from cache
      this.userProfileCache.delete(accessToken);

      return response.ok;
    } catch {
      return false;
    }
  }
}

module.exports = DashboardAuthService;
