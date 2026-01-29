# Pattern: Error Handling

**Consistent error handling across the codebase. Errors must be logged and reported to users.**

## Error Handling Strategy

### In Commands

**Commands automatically catch errors via CommandLoader. Just write your logic:**

```javascript
module.exports = {
  name: 'mycommand',
  description: 'Does something',
  data: new SlashCommandBuilder()...,
  async executeInteraction(interaction) {
    // CommandLoader wraps this in try-catch
    // Errors are automatically logged and reported
    const result = await someAsyncOperation();
    await interaction.editReply('Success!');
  }
};
```

### Error Reporting to Users

**Always use response helpers for user-facing errors:**

```javascript
const { sendError, sendSuccess } = require('necrobot-utils');

module.exports = {
  async executeInteraction(interaction) {
    try {
      const data = await fetchData();
      if (!data) {
        return await sendError(interaction, 'Data not found', true);
      }
      await sendSuccess(interaction, 'Operation successful!');
    } catch (error) {
      // Error is logged by CommandLoader, just report to user
      await sendError(interaction, 'Something went wrong', true);
    }
  }
};
```

### Logging Errors

**Use error handler middleware from necrobot-utils:**

```javascript
const { logError } = require('necrobot-utils');

try {
  await someOperation();
} catch (error) {
  logError(error, 'Context: describing what operation failed');
  throw error; // Let CommandLoader catch it
}
```

## Service Layer Error Handling

**Services should throw descriptive errors:**

```javascript
class DatabaseService {
  async getQuote(id) {
    if (!id) {
      throw new Error('Quote ID is required');
    }
    
    try {
      const result = await this.db.run('SELECT * FROM quotes WHERE id = ?', [id]);
      if (!result) {
        throw new Error(`Quote #${id} not found`);
      }
      return result;
    } catch (error) {
      // Log the error
      console.error('Database error:', error.message);
      // Throw with context
      throw new Error(`Failed to fetch quote: ${error.message}`);
    }
  }
}
```

## Error Types

### 1. Validation Errors

```javascript
// Input validation failed
if (!name || name.trim() === '') {
  throw new Error('Name is required');
}
```

### 2. Database Errors

```javascript
try {
  await db.insert(data);
} catch (error) {
  throw new Error(`Database operation failed: ${error.message}`);
}
```

### 3. Discord API Errors

```javascript
try {
  await interaction.editReply(message);
} catch (error) {
  if (error.code === 'InteractionAlreadyReplied') {
    await interaction.followUp(message);
  } else {
    throw error;
  }
}
```

### 4. Timeout Errors

```javascript
async function withTimeout(promise, ms) {
  const timeout = new Promise((_, reject) =>
    setTimeout(() => reject(new Error('Operation timed out')), ms)
  );
  return Promise.race([promise, timeout]);
}
```

## Testing Error Scenarios

**Always test error paths:**

```javascript
describe('error handling', () => {
  it('should throw error for invalid input', () => {
    assert.throws(() => {
      service.getQuote(null);
    }, /Quote ID is required/);
  });

  it('should handle database connection error', async () => {
    const mockDb = { 
      run: async () => { throw new Error('Connection failed'); }
    };
    const service = new DatabaseService(mockDb);
    
    try {
      await service.getQuote(1);
      assert.fail('Should have thrown');
    } catch (error) {
      assert.ok(error.message.includes('Database operation failed'));
    }
  });
});
```

## Error Response Helper

**Standard response format for errors:**

```javascript
const { sendError } = require('necrobot-utils');

// Ephemeral (visible only to user)
await sendError(interaction, 'Something went wrong', true);

// Public (visible to everyone)
await sendError(interaction, 'Command failed', false);
```

## DO's and DON'Ts

✅ DO: Use response helpers for user-facing messages  
✅ DO: Log errors with context  
✅ DO: Throw descriptive error messages  
✅ DO: Test error scenarios  
✅ DO: Handle async errors with try-catch or .catch()  

❌ DON'T: Use console.log for errors (use logger)  
❌ DON'T: Silently catch errors without logging  
❌ DON'T: Show stack traces to users  
❌ DON'T: Throw generic "Error" without message  
❌ DON'T: Ignore promise rejections  

## Common Patterns

### Retry Logic

```javascript
async function retryOperation(fn, retries = 3) {
  for (let i = 0; i < retries; i++) {
    try {
      return await fn();
    } catch (error) {
      if (i === retries - 1) throw error;
      await new Promise(r => setTimeout(r, 1000 * (i + 1)));
    }
  }
}
```

### Optional Fallback

```javascript
async function getDataWithFallback() {
  try {
    return await fetchPrimary();
  } catch (error) {
    console.warn('Primary fetch failed, trying fallback:', error.message);
    return await fetchFallback();
  }
}
```

### Error Aggregation

```javascript
async function bulkOperation(items) {
  const errors = [];
  const results = [];
  
  for (const item of items) {
    try {
      results.push(await processItem(item));
    } catch (error) {
      errors.push({ item, error: error.message });
    }
  }
  
  if (errors.length > 0) {
    throw new Error(`${errors.length} operations failed`);
  }
  return results;
}
```
