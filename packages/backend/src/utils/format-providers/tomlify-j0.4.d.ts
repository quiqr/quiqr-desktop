/**
 * Type declarations for tomlify-j0.4
 */

declare module 'tomlify-j0.4' {
  export interface TomlifyOptions {
    space?: number;
    sort?: boolean;
    replace?: (key: string, value: unknown) => any;
  }

  export function toToml(obj: unknown, options?: TomlifyOptions): string;

  const tomlify: {
    toToml: typeof toToml;
  };

  export default tomlify;
}
