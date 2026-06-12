import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, act } from '@testing-library/react';
import Timer from '../../src/components/exam/Timer.jsx';

beforeEach(() => {
  vi.useFakeTimers();
  vi.setSystemTime(new Date('2026-06-12T10:00:00Z'));
});

afterEach(() => {
  vi.useRealTimers();
});

describe('Timer — countdown mode (Full Test)', () => {
  it('shows initial time = durationSec when just started', () => {
    const startedAt = new Date('2026-06-12T10:00:00Z');
    render(
      <Timer durationSec={120 * 60} startedAt={startedAt} mode="countdown" />,
    );
    expect(screen.getByText('02:00:00')).toBeTruthy();
    expect(screen.getByText('Còn lại')).toBeTruthy();
  });

  it('decrements 1 second after 1s tick', () => {
    const startedAt = new Date('2026-06-12T10:00:00Z');
    render(
      <Timer durationSec={60} startedAt={startedAt} mode="countdown" />,
    );
    expect(screen.getByText('01:00')).toBeTruthy();
    act(() => {
      vi.advanceTimersByTime(1000);
    });
    expect(screen.getByText('00:59')).toBeTruthy();
  });

  it('clamps to 00:00 when elapsed > duration', () => {
    const startedAt = new Date('2026-06-12T08:00:00Z'); // 2h ago
    render(
      <Timer durationSec={60 * 60} startedAt={startedAt} mode="countdown" />,
    );
    expect(screen.getByText('00:00')).toBeTruthy();
  });

  it('calls onExpire when countdown reaches 0', () => {
    const onExpire = vi.fn();
    const startedAt = new Date('2026-06-12T10:00:00Z');
    render(
      <Timer
        durationSec={2}
        startedAt={startedAt}
        mode="countdown"
        onExpire={onExpire}
      />,
    );
    act(() => {
      vi.advanceTimersByTime(3000);
    });
    expect(onExpire).toHaveBeenCalled();
  });

  it('does NOT fire onExpire twice', () => {
    const onExpire = vi.fn();
    const startedAt = new Date('2026-06-12T08:00:00Z'); // already past
    render(
      <Timer
        durationSec={60}
        startedAt={startedAt}
        mode="countdown"
        onExpire={onExpire}
      />,
    );
    act(() => {
      vi.advanceTimersByTime(5000);
    });
    expect(onExpire).toHaveBeenCalledTimes(1);
  });
});

describe('Timer — elapsed mode (Practice / Full Test ?mode=practice)', () => {
  it('shows 00:00 elapsed when just started', () => {
    const startedAt = new Date('2026-06-12T10:00:00Z');
    const { container } = render(
      <Timer durationSec={3600} startedAt={startedAt} mode="elapsed" />,
    );
    expect(container.textContent).toContain('00:00');
    expect(container.textContent).toContain('Đã làm');
  });

  it('counts up over time', () => {
    const startedAt = new Date('2026-06-12T10:00:00Z');
    const { container } = render(
      <Timer durationSec={3600} startedAt={startedAt} mode="elapsed" />,
    );
    act(() => {
      vi.advanceTimersByTime(5000);
    });
    expect(container.textContent).toContain('00:05');
  });

  it('does NOT call onExpire even when "duration" passes', () => {
    const onExpire = vi.fn();
    const startedAt = new Date('2026-06-12T10:00:00Z');
    render(
      <Timer
        durationSec={2}
        startedAt={startedAt}
        mode="elapsed"
        onExpire={onExpire}
      />,
    );
    act(() => {
      vi.advanceTimersByTime(10000);
    });
    expect(onExpire).not.toHaveBeenCalled();
  });

  it('resumes elapsed time when startedAt is in the past', () => {
    // Mimic Practice resume: startedAt = NOW - 90s elapsedSec
    const startedAt = new Date(Date.now() - 90 * 1000);
    render(
      <Timer durationSec={3600} startedAt={startedAt} mode="elapsed" />,
    );
    expect(screen.getByText('01:30')).toBeTruthy();
  });
});

describe('Timer — visual states', () => {
  it('shows warning style when < 10 min in countdown', () => {
    const startedAt = new Date('2026-06-12T10:00:00Z');
    const { container } = render(
      <Timer durationSec={9 * 60} startedAt={startedAt} mode="countdown" />,
    );
    expect(container.innerHTML).toMatch(/text-tertiary-600/);
  });

  it('shows critical style when < 3 min in countdown', () => {
    const startedAt = new Date('2026-06-12T10:00:00Z');
    const { container } = render(
      <Timer durationSec={2 * 60} startedAt={startedAt} mode="countdown" />,
    );
    expect(container.innerHTML).toMatch(/text-red-600/);
    expect(container.innerHTML).toMatch(/animate-pulse/);
  });

  it('shows neutral slate style in elapsed mode', () => {
    const startedAt = new Date('2026-06-12T10:00:00Z');
    const { container } = render(
      <Timer durationSec={3600} startedAt={startedAt} mode="elapsed" />,
    );
    expect(container.innerHTML).toMatch(/text-slate-600/);
    expect(container.innerHTML).not.toMatch(/animate-pulse/);
  });
});
