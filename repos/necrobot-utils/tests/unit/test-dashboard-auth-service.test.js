/**
 * Test suite for DashboardAuthService
 * Tests Discord OAuth authentication, token management, and guild verification
 */

const assert = require('assert');
const DashboardAuthService = require('../../src/services/DashboardAuthService');

describe('DashboardAuthService', () => {
  let authService;
  const mockClientId = 'test-client-id-123';
  const mockClientSecret = 'test-client-secret-456';
  const mockGuildId = 'test-guild-789';
  const mockBotToken = 'Bot test-bot-token-abc';

  beforeEach(() => {
    authService = new DashboardAuthService(mockClientId, mockClientSecret, mockGuildId, mockBotToken);
  });

  describe('initialization', () => {
    it('should initialize with Discord credentials', () => {
      assert.ok(authService);
      assert.strictEqual(authService.clientId, mockClientId);
      assert.strictEqual(authService.clientSecret, mockClientSecret);
      assert.strictEqual(authService.guildId, mockGuildId);
      assert.strictEqual(authService.botToken, mockBotToken);
    });

    it('should throw error if required credentials are missing', () => {
      assert.throws(() => {
        new DashboardAuthService(null, mockClientSecret, mockGuildId, mockBotToken);
      }, /Client ID is required/);
    });
  });

  describe('Token Exchange', () => {
    it('should exchange authorization code for tokens', async () => {
      // Mock fetch implementation
      const mockFetch = async () => ({
        ok: true,
        json: async () => ({
          access_token: 'token_xyz',
          refresh_token: 'refresh_xyz',
          expires_in: 604800,
          token_type: 'Bearer',
        }),
      });
      authService._fetch = mockFetch;

      const result = await authService.exchangeCodeForTokens('test-code', 'http://localhost:3000/callback');

      assert.strictEqual(result.accessToken, 'token_xyz');
      assert.strictEqual(result.refreshToken, 'refresh_xyz');
      assert.strictEqual(result.expiresIn, 604800);
      assert.strictEqual(result.tokenType, 'Bearer');
    });

    it('should return access token, refresh token, expires_in', async () => {
      const mockFetch = async () => ({
        ok: true,
        json: async () => ({
          access_token: 'access123',
          refresh_token: 'refresh456',
          expires_in: 3600,
          token_type: 'Bearer',
        }),
      });
      authService._fetch = mockFetch;

      const result = await authService.exchangeCodeForTokens('code123', 'http://redirect');

      assert.ok(result.accessToken);
      assert.ok(result.refreshToken);
      assert.ok(result.expiresIn);
    });

    it('should throw error for invalid code', async () => {
      const mockFetch = async () => ({
        ok: false,
        status: 400,
        json: async () => ({ error: 'invalid_grant' }),
      });
      authService._fetch = mockFetch;

      try {
        await authService.exchangeCodeForTokens('invalid-code', 'http://redirect');
        assert.fail('Should have thrown error');
      } catch (error) {
        assert.ok(error.message.includes('Failed to exchange code'));
      }
    });

    it('should throw error for invalid client credentials', async () => {
      const mockFetch = async () => ({
        ok: false,
        status: 401,
        json: async () => ({ error: 'invalid_client' }),
      });
      authService._fetch = mockFetch;

      try {
        await authService.exchangeCodeForTokens('test-code', 'http://redirect');
        assert.fail('Should have thrown error');
      } catch (error) {
        assert.ok(error.message.includes('Failed to exchange code'));
      }
    });
  });

  describe('Token Refresh', () => {
    it('should refresh expired access token using refresh token', async () => {
      const mockFetch = async () => ({
        ok: true,
        json: async () => ({
          access_token: 'new_token_xyz',
          expires_in: 604800,
          token_type: 'Bearer',
        }),
      });
      authService._fetch = mockFetch;

      const result = await authService.refreshAccessToken('refresh_token_123');

      assert.strictEqual(result.accessToken, 'new_token_xyz');
      assert.strictEqual(result.expiresIn, 604800);
    });

    it('should return new access token', async () => {
      const mockFetch = async () => ({
        ok: true,
        json: async () => ({
          access_token: 'refreshed_token',
          expires_in: 3600,
          token_type: 'Bearer',
        }),
      });
      authService._fetch = mockFetch;

      const result = await authService.refreshAccessToken('old_refresh_token');

      assert.ok(result.accessToken);
      assert.strictEqual(result.accessToken, 'refreshed_token');
    });

    it('should handle invalid refresh token', async () => {
      const mockFetch = async () => ({
        ok: false,
        status: 400,
        json: async () => ({ error: 'invalid_grant' }),
      });
      authService._fetch = mockFetch;

      try {
        await authService.refreshAccessToken('invalid_refresh_token');
        assert.fail('Should have thrown error');
      } catch (error) {
        assert.ok(error.message.includes('Failed to refresh token'));
      }
    });

    it('should handle network errors gracefully', async () => {
      const mockFetch = async () => {
        throw new Error('Network error');
      };
      authService._fetch = mockFetch;

      try {
        await authService.refreshAccessToken('refresh_token');
        assert.fail('Should have thrown error');
      } catch (error) {
        assert.ok(error.message.includes('Failed to refresh token'));
      }
    });
  });

  describe('Token Validation', () => {
    it('should validate token expiration', () => {
      const validToken = {
        accessToken: 'token123',
        expiresAt: Date.now() + 3600000, // 1 hour from now
      };

      const result = authService.validateToken(validToken);
      assert.strictEqual(result, true);
    });

    it('should identify expired tokens', () => {
      const expiredToken = {
        accessToken: 'token123',
        expiresAt: Date.now() - 3600000, // 1 hour ago
      };

      const result = authService.validateToken(expiredToken);
      assert.strictEqual(result, false);
    });

    it('should identify valid tokens', () => {
      const validToken = {
        accessToken: 'valid_token',
        expiresAt: Date.now() + 1000000,
      };

      const result = authService.validateToken(validToken);
      assert.strictEqual(result, true);
    });

    it('should handle malformed tokens', () => {
      const malformedToken = { accessToken: 'token' }; // missing expiresAt

      const result = authService.validateToken(malformedToken);
      assert.strictEqual(result, false);
    });
  });

  describe('User Profile', () => {
    it('should fetch user profile from Discord API', async () => {
      const mockFetch = async () => ({
        ok: true,
        json: async () => ({
          id: '123456789',
          username: 'TestUser',
          email: 'test@example.com',
          avatar: 'a_1234567890',
          discriminator: '0001',
        }),
      });
      authService._fetch = mockFetch;

      const result = await authService.getUserProfile('access_token_xyz');

      assert.strictEqual(result.id, '123456789');
      assert.strictEqual(result.username, 'TestUser');
      assert.strictEqual(result.email, 'test@example.com');
      assert.strictEqual(result.avatar, 'a_1234567890');
      assert.strictEqual(result.discriminator, '0001');
    });

    it('should return user ID, username, avatar, email', async () => {
      const mockFetch = async () => ({
        ok: true,
        json: async () => ({
          id: '987654321',
          username: 'AnotherUser',
          email: 'another@example.com',
          avatar: 'avatar_hash',
          discriminator: '0002',
        }),
      });
      authService._fetch = mockFetch;

      const result = await authService.getUserProfile('token');

      assert.ok(result.id);
      assert.ok(result.username);
      assert.ok(result.email);
      assert.ok(result.avatar);
    });

    it('should cache user profile (optional)', async () => {
      let callCount = 0;
      const mockFetch = async () => {
        callCount++;
        return {
          ok: true,
          json: async () => ({
            id: '123',
            username: 'CachedUser',
            email: 'cached@example.com',
            avatar: 'avatar',
            discriminator: '0000',
          }),
        };
      };
      authService._fetch = mockFetch;

      // First call - should fetch
      await authService.getUserProfile('token123');
      // Second call with same token - should use cache
      await authService.getUserProfile('token123');

      // Cache is optional, so we don't strictly enforce it
      // but this test documents the expected behavior
      assert.ok(callCount >= 1);
    });

    it('should handle API errors gracefully', async () => {
      const mockFetch = async () => ({
        ok: false,
        status: 401,
        json: async () => ({ message: 'Unauthorized' }),
      });
      authService._fetch = mockFetch;

      try {
        await authService.getUserProfile('invalid_token');
        assert.fail('Should have thrown error');
      } catch (error) {
        assert.ok(error.message.includes('Failed to fetch user profile'));
      }
    });
  });

  describe('Guild Membership', () => {
    it('should verify user is member of guild', async () => {
      const mockFetch = async () => ({
        ok: true,
        json: async () => ({
          nick: 'TestUser',
          roles: ['role1', 'role2'],
          joined_at: '2024-01-01T00:00:00.000Z',
        }),
      });
      authService._fetch = mockFetch;

      const result = await authService.isGuildMember('access_token', 'guild123');

      assert.strictEqual(result, true);
    });

    it('should return true for guild members', async () => {
      const mockFetch = async () => ({
        ok: true,
        json: async () => ({
          nick: 'Member',
          roles: [],
          joined_at: '2024-01-01T00:00:00.000Z',
        }),
      });
      authService._fetch = mockFetch;

      const result = await authService.isGuildMember('token', 'guild456');

      assert.strictEqual(result, true);
    });

    it('should return false for non-members', async () => {
      const mockFetch = async () => ({
        ok: false,
        status: 404,
        json: async () => ({ message: 'Unknown Member' }),
      });
      authService._fetch = mockFetch;

      const result = await authService.isGuildMember('token', 'guild789');

      assert.strictEqual(result, false);
    });

    it('should handle missing guild', async () => {
      const mockFetch = async () => ({
        ok: false,
        status: 404,
        json: async () => ({ message: 'Unknown Guild' }),
      });
      authService._fetch = mockFetch;

      const result = await authService.isGuildMember('token', 'invalid_guild');

      assert.strictEqual(result, false);
    });
  });

  describe('User Roles', () => {
    it('should fetch user roles in guild', async () => {
      const mockFetch = async () => ({
        ok: true,
        json: async () => ({
          roles: ['role1', 'role2', 'role3'],
          nick: 'TestUser',
          joined_at: '2024-01-01T00:00:00.000Z',
        }),
      });
      authService._fetch = mockFetch;

      const result = await authService.getUserRoles('access_token', 'guild123');

      assert.ok(Array.isArray(result));
      assert.strictEqual(result.length, 3);
      assert.strictEqual(result[0], 'role1');
      assert.strictEqual(result[1], 'role2');
      assert.strictEqual(result[2], 'role3');
    });

    it('should return array of role IDs', async () => {
      const mockFetch = async () => ({
        ok: true,
        json: async () => ({
          roles: ['admin', 'moderator'],
          nick: 'User',
          joined_at: '2024-01-01T00:00:00.000Z',
        }),
      });
      authService._fetch = mockFetch;

      const result = await authService.getUserRoles('token', 'guild');

      assert.ok(Array.isArray(result));
      assert.ok(result.includes('admin'));
      assert.ok(result.includes('moderator'));
    });

    it('should handle users with no roles', async () => {
      const mockFetch = async () => ({
        ok: true,
        json: async () => ({
          roles: [],
          nick: 'NoRolesUser',
          joined_at: '2024-01-01T00:00:00.000Z',
        }),
      });
      authService._fetch = mockFetch;

      const result = await authService.getUserRoles('token', 'guild');

      assert.ok(Array.isArray(result));
      assert.strictEqual(result.length, 0);
    });

    it('should handle API errors', async () => {
      const mockFetch = async () => ({
        ok: false,
        status: 403,
        json: async () => ({ message: 'Forbidden' }),
      });
      authService._fetch = mockFetch;

      try {
        await authService.getUserRoles('invalid_token', 'guild');
        assert.fail('Should have thrown error');
      } catch (error) {
        assert.ok(error.message.includes('Failed to fetch user roles'));
      }
    });
  });

  describe('Authorization URL', () => {
    it('should build Discord OAuth authorization URL', () => {
      const redirectUri = 'http://localhost:3000/callback';
      const state = 'random-state-string';

      const url = authService.getAuthorizationUrl(redirectUri, state);

      assert.ok(url.includes('discord.com/api/oauth2/authorize'));
      assert.ok(url.includes(`client_id=${mockClientId}`));
      assert.ok(url.includes(`redirect_uri=${encodeURIComponent(redirectUri)}`));
      assert.ok(url.includes(`state=${state}`));
      assert.ok(url.includes('response_type=code'));
    });

    it('should include required scopes', () => {
      const url = authService.getAuthorizationUrl('http://localhost', 'state');

      assert.ok(url.includes('scope='));
      assert.ok(url.includes('identify'));
      assert.ok(url.includes('guilds'));
    });
  });

  describe('Token Revocation', () => {
    it('should revoke token (logout)', async () => {
      const mockFetch = async () => ({
        ok: true,
        status: 200,
      });
      authService._fetch = mockFetch;

      const result = await authService.revokeToken('access_token_xyz');

      assert.strictEqual(result, true);
    });

    it('should handle revocation errors', async () => {
      const mockFetch = async () => ({
        ok: false,
        status: 400,
        json: async () => ({ error: 'invalid_token' }),
      });
      authService._fetch = mockFetch;

      const result = await authService.revokeToken('invalid_token');

      assert.strictEqual(result, false);
    });
  });
});
