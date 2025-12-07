// frontend/__tests__/hooks/use-polling.test.ts
import { renderHook, act } from '@testing-library/react'
import { usePolling } from '@/hooks/use-polling'

jest.useFakeTimers()

describe('usePolling', () => {
  it('should not poll before startPolling is called', () => {
    const callback = jest.fn().mockResolvedValue(true)
    renderHook(() => usePolling(callback, 1000))
    expect(callback).not.toHaveBeenCalled()
  })

  it('should start polling when startPolling is called', () => {
    const callback = jest.fn().mockResolvedValue(true)
    const { result } = renderHook(() => usePolling(callback, 1000))

    act(() => {
      result.current.startPolling()
    })

    expect(callback).toHaveBeenCalledTimes(1)
  })

  it('should stop polling when callback returns true', async () => {
    const callback = jest.fn().mockResolvedValue(true)
    const { result } = renderHook(() => usePolling(callback, 1000))

    await act(async () => {
      result.current.startPolling()
      await jest.runOnlyPendingTimersAsync()
    })

    expect(callback).toHaveBeenCalledTimes(1)
    expect(result.current.isPolling).toBe(false)
  })

  it('should continue polling when callback returns false', async () => {
    const callback = jest
      .fn()
      .mockResolvedValueOnce(false)
      .mockResolvedValueOnce(true)
    const { result } = renderHook(() => usePolling(callback, 1000))

    await act(async () => {
      result.current.startPolling()
    })

    expect(callback).toHaveBeenCalledTimes(1)
    expect(result.current.isPolling).toBe(true)

    await act(async () => {
      await jest.runOnlyPendingTimersAsync()
    })

    expect(callback).toHaveBeenCalledTimes(2)
    expect(result.current.isPolling).toBe(false)
  })

  it('should stop polling when stopPolling is called', async () => {
    const callback = jest.fn().mockResolvedValue(false)
    const { result } = renderHook(() => usePolling(callback, 1000))

    await act(async () => {
      result.current.startPolling()
    })

    expect(callback).toHaveBeenCalledTimes(1)
    expect(result.current.isPolling).toBe(true)

    act(() => {
      result.current.stopPolling()
    })

    expect(result.current.isPolling).toBe(false)

    await act(async () => {
      await jest.runOnlyPendingTimersAsync()
    })

    expect(callback).toHaveBeenCalledTimes(1)
  })
})
