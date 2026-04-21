import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { useIsGlobalAdmin } from '../useAuth';
import { authApi } from '../../api/api';

vi.mock('../../api/api');

describe('useIsGlobalAdmin', () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it('should return true when user has global admin access', async () => {
		vi.mocked(authApi.me).mockResolvedValueOnce({
			success: true,
			data: { role: 'globalAdmin' },
		} as any);

		const { result } = renderHook(() => useIsGlobalAdmin());

		expect(result.current.loading).toBe(true);
		expect(result.current.isGlobalAdmin).toBe(false);

		await waitFor(() => {
			expect(result.current.loading).toBe(false);
		});

		expect(result.current.isGlobalAdmin).toBe(true);
		expect(authApi.me).toHaveBeenCalled();
	});

	it('should return false when user does not have global admin access', async () => {
		vi.mocked(authApi.me).mockResolvedValueOnce({
			success: true,
			data: { role: 'provinceAdmin', provinceId: '123' },
		} as any);

		const { result } = renderHook(() => useIsGlobalAdmin());

		expect(result.current.loading).toBe(true);

		await waitFor(() => {
			expect(result.current.loading).toBe(false);
		});

		expect(result.current.isGlobalAdmin).toBe(false);
		expect(authApi.me).toHaveBeenCalled();
	});

	it('should handle network errors gracefully', async () => {
		vi.mocked(authApi.me).mockRejectedValueOnce(new Error('Network Error'));

		const { result } = renderHook(() => useIsGlobalAdmin());

		await waitFor(() => {
			expect(result.current.loading).toBe(false);
		});

		expect(result.current.isGlobalAdmin).toBe(false);
	});
});
