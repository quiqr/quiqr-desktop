import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { createDebounce } from '../../src/utils/debounce';

describe('createDebounce', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('should delay execution until after the specified delay', () => {
    const mockFn = vi.fn();
    const debounce = createDebounce(100);

    debounce.debounce(mockFn);

    // Function should not execute immediately
    expect(mockFn).not.toHaveBeenCalled();

    // Fast-forward time by 50ms
    vi.advanceTimersByTime(50);
    expect(mockFn).not.toHaveBeenCalled();

    // Fast-forward time by another 50ms (100ms total)
    vi.advanceTimersByTime(50);
    expect(mockFn).toHaveBeenCalledTimes(1);
  });

  it('should cancel previous timers when called multiple times rapidly', () => {
    const mockFn1 = vi.fn();
    const mockFn2 = vi.fn();
    const mockFn3 = vi.fn();
    const debounce = createDebounce(100);

    // Call debounce three times rapidly
    debounce.debounce(mockFn1);
    vi.advanceTimersByTime(30);

    debounce.debounce(mockFn2);
    vi.advanceTimersByTime(30);

    debounce.debounce(mockFn3);

    // None should have executed yet
    expect(mockFn1).not.toHaveBeenCalled();
    expect(mockFn2).not.toHaveBeenCalled();
    expect(mockFn3).not.toHaveBeenCalled();

    // Fast-forward to complete the delay from the last call
    vi.advanceTimersByTime(100);

    // Only the last function should execute
    expect(mockFn1).not.toHaveBeenCalled();
    expect(mockFn2).not.toHaveBeenCalled();
    expect(mockFn3).toHaveBeenCalledTimes(1);
  });

  it('should clear pending execution when cancel is called', () => {
    const mockFn = vi.fn();
    const debounce = createDebounce(100);

    debounce.debounce(mockFn);

    // Advance time partially
    vi.advanceTimersByTime(50);
    expect(mockFn).not.toHaveBeenCalled();

    // Cancel the pending execution
    debounce.cancel();

    // Fast-forward past the original delay
    vi.advanceTimersByTime(100);

    // Function should never execute
    expect(mockFn).not.toHaveBeenCalled();
  });

  it('should allow multiple debounce instances to operate independently', () => {
    const mockFn1 = vi.fn();
    const mockFn2 = vi.fn();

    const debounce1 = createDebounce(100);
    const debounce2 = createDebounce(200);

    // Call both debounce instances
    debounce1.debounce(mockFn1);
    debounce2.debounce(mockFn2);

    // Neither should have executed yet
    expect(mockFn1).not.toHaveBeenCalled();
    expect(mockFn2).not.toHaveBeenCalled();

    // Fast-forward to trigger first debounce
    vi.advanceTimersByTime(100);
    expect(mockFn1).toHaveBeenCalledTimes(1);
    expect(mockFn2).not.toHaveBeenCalled();

    // Fast-forward to trigger second debounce
    vi.advanceTimersByTime(100);
    expect(mockFn1).toHaveBeenCalledTimes(1);
    expect(mockFn2).toHaveBeenCalledTimes(1);
  });

  it('should handle multiple calls to cancel safely', () => {
    const mockFn = vi.fn();
    const debounce = createDebounce(100);

    debounce.debounce(mockFn);

    // Call cancel multiple times
    debounce.cancel();
    debounce.cancel();
    debounce.cancel();

    // Fast-forward past the delay
    vi.advanceTimersByTime(200);

    // Function should never execute
    expect(mockFn).not.toHaveBeenCalled();
  });

  it('should allow debounce to be called again after cancel', () => {
    const mockFn1 = vi.fn();
    const mockFn2 = vi.fn();
    const debounce = createDebounce(100);

    // First debounce call
    debounce.debounce(mockFn1);
    debounce.cancel();

    // Second debounce call after cancel
    debounce.debounce(mockFn2);
    vi.advanceTimersByTime(100);

    // Only the second function should execute
    expect(mockFn1).not.toHaveBeenCalled();
    expect(mockFn2).toHaveBeenCalledTimes(1);
  });
});
