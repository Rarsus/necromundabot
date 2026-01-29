/**
 * Test suite for Response Helpers
 * Tests Discord message and embed formatting
 */

const assert = require('assert');
const {
  sendSuccess,
  sendError,
  sendInfo,
  sendDM,
  sendDataEmbed,
} = require('../../src/utils/helpers/response-helpers');

describe('Response Helpers', () => {
  let mockInteraction;
  let mockUser;

  beforeEach(() => {
    mockInteraction = {
      reply: async (msg) => ({ id: 'msg-123', ...msg }),
      deferReply: async () => ({}),
      editReply: async (msg) => ({ id: 'msg-123', ...msg }),
      followUp: async (msg) => ({ id: 'msg-456', ...msg }),
    };

    mockUser = {
      username: 'TestUser',
      send: async (msg) => ({ id: 'dm-123', ...msg }),
    };
  });

  describe('sendSuccess', () => {
    it('should send success embed with green color', async () => {
      const result = await sendSuccess(mockInteraction, 'Operation successful!');

      assert.ok(result.embeds);
      assert.strictEqual(result.embeds[0].color, 0x00ff00);
      assert.strictEqual(result.embeds[0].description, 'Operation successful!');
    });

    it('should support ephemeral messages', async () => {
      const result = await sendSuccess(mockInteraction, 'Success', true);

      assert.strictEqual(result.ephemeral, true);
    });

    it('should set ephemeral to false by default', async () => {
      const result = await sendSuccess(mockInteraction, 'Success');

      assert.strictEqual(result.ephemeral, false);
    });
  });

  describe('sendError', () => {
    it('should send error embed with red color', async () => {
      const result = await sendError(mockInteraction, 'Something went wrong');

      assert.ok(result.embeds);
      assert.strictEqual(result.embeds[0].color, 0xff0000);
      assert.strictEqual(result.embeds[0].description, 'Something went wrong');
    });

    it('should be ephemeral by default', async () => {
      const result = await sendError(mockInteraction, 'Error');

      assert.strictEqual(result.ephemeral, true);
    });

    it('should support non-ephemeral error messages', async () => {
      const result = await sendError(mockInteraction, 'Error', false);

      assert.strictEqual(result.ephemeral, false);
    });
  });

  describe('sendInfo', () => {
    it('should send info embed with blue color', async () => {
      const result = await sendInfo(mockInteraction, 'Info Title', 'Info description');

      assert.ok(result.embeds);
      assert.strictEqual(result.embeds[0].color, 0x0099ff);
      assert.strictEqual(result.embeds[0].title, 'Info Title');
      assert.strictEqual(result.embeds[0].description, 'Info description');
    });

    it('should set ephemeral to false by default', async () => {
      const result = await sendInfo(mockInteraction, 'Title', 'Description');

      assert.strictEqual(result.ephemeral, false);
    });
  });

  describe('sendDM', () => {
    it('should send direct message to user', async () => {
      const result = await sendDM(mockUser, 'Hello!');

      assert.ok(result.id);
    });

    it('should throw error if DM fails', async () => {
      mockUser.send = async () => {
        throw new Error('DM blocked');
      };

      assert.rejects(async () => {
        await sendDM(mockUser, 'Hello!');
      }, /Failed to send DM/);
    });
  });

  describe('sendDataEmbed', () => {
    it('should send embed with fields', async () => {
      const fields = [
        { name: 'Field 1', value: 'Value 1', inline: false },
        { name: 'Field 2', value: 'Value 2', inline: false },
      ];

      const result = await sendDataEmbed(mockInteraction, 'Data', fields);

      assert.strictEqual(result.embeds[0].title, 'Data');
      assert.strictEqual(result.embeds[0].fields.length, 2);
    });

    it('should support custom color', async () => {
      const result = await sendDataEmbed(mockInteraction, 'Data', [], 0xff00ff);

      assert.strictEqual(result.embeds[0].color, 0xff00ff);
    });

    it('should use default blue color if not specified', async () => {
      const result = await sendDataEmbed(mockInteraction, 'Data', []);

      assert.strictEqual(result.embeds[0].color, 0x0099ff);
    });
  });
});
