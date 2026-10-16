// Minimal ambient types for the node: built-ins this test file uses.
// There is no @types/node here; this scopes just enough shape for our usage.
declare module 'node:test' {
  type TestFn = () => void | Promise<void>;
  export function test(name: string, fn: TestFn): void;
}

declare module 'node:assert/strict' {
  interface Assert {
    equal(actual: unknown, expected: unknown, message?: string | Error): void;
    deepEqual(actual: unknown, expected: unknown, message?: string | Error): void;
  }
  const assert: Assert;
  export default assert;
}
