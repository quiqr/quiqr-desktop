/**
 * Creates a debounce function that delays execution until after a specified delay.
 *
 * @param delay - The number of milliseconds to delay
 * @returns An object with `debounce` and `cancel` methods
 *
 * @example
 * ```typescript
 * const filterDebounce = createDebounce(200);
 *
 * // Debounce a function call
 * filterDebounce.debounce(() => {
 *   console.log('This will execute after 200ms');
 * });
 *
 * // Cancel pending execution
 * filterDebounce.cancel();
 * ```
 */
export const createDebounce = (delay: number) => {
  let timeoutId: NodeJS.Timeout | null = null;

  /**
   * Debounces a function call. If called multiple times rapidly,
   * only the last call will execute after the delay period.
   *
   * @param fn - The function to debounce
   */
  const debounce = (fn: () => void): void => {
    if (timeoutId !== null) {
      clearTimeout(timeoutId);
    }
    timeoutId = setTimeout(fn, delay);
  };

  /**
   * Cancels any pending debounced execution.
   */
  const cancel = (): void => {
    if (timeoutId !== null) {
      clearTimeout(timeoutId);
      timeoutId = null;
    }
  };

  return { debounce, cancel };
};
