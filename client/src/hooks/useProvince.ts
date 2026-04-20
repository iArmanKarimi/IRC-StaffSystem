import { useEffect, useState } from "react";
import { provinceApi, type Province } from "../api/api";

type UseProvinceResult = {
	province: Province | null;
	loading: boolean;
	error: string | null;
	refetch: () => Promise<void>;
};

export function useProvince(provinceId?: string): UseProvinceResult {
	const [province, setProvince] = useState<Province | null>(null);
	const [loading, setLoading] = useState(Boolean(provinceId));
	const [error, setError] = useState<string | null>(null);

	const fetchProvince = async () => {
		if (!provinceId) {
			setProvince(null);
			setLoading(false);
			return;
		}

		setLoading(true);
		setError(null);
		try {
			const response = await provinceApi.get(provinceId);
			setProvince(response.data ?? null);
		} catch (err) {
			console.error("Error fetching province:", err);
			const errorMessage =
				err instanceof Error ? err.message : "خطا در بارگذاری استان";
			setError(errorMessage);
			setProvince(null);
		} finally {
			setLoading(false);
		}
	};

	useEffect(() => {
		fetchProvince();
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [provinceId]);

	return { province, loading, error, refetch: fetchProvince };
}
