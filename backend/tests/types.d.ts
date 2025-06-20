// Type declarations for tests
import { Pool } from 'pg';

declare global {
  var testDb: Pool;
  
  namespace jest {
    interface Matchers<R> {
      toBeValidUUID(): R;
      toBeValidJWT(): R;
    }
  }
}

export {};