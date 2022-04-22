export const runtimesPistonAliases = Object.freeze({
  'C++ (GCC)': 'c++' as const,
  'C (GCC)': 'c' as const,
  Java: 'java' as const,
  Python: 'python' as const,
  'JavaScript (Node.js)': 'node-js' as const,
  'TypeScript (Node.js)': 'node-ts' as const,
  'JavaScript (Deno)': 'deno-js' as const,
  'TypeScript (Deno)': 'deno-ts' as const,
  Go: 'go' as const,
});

export const supportedRuntimes = Object.freeze(Object.keys(runtimesPistonAliases)) as Readonly<
  (keyof typeof runtimesPistonAliases)[]
>;
