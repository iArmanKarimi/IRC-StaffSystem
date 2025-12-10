import { useEffect, useMemo, useState } from "react";
import { useParams, Link } from "react-router-dom";
import {
	provinceApi,
	Employee,
	PaginatedResponse,
	Pagination,
} from "../api/api";
import { ROUTES } from "../const/endpoints";

type EmployeesState = {
	data: Employee[];
	pagination: Pagination | null;
	_links?: Record<string, string>;
};

export default function ProvinceEmployeesPage() {
	const { provinceId } = useParams<{ provinceId: string }>();
	const [state, setState] = useState<EmployeesState>({
		data: [],
		pagination: null,
	});
	const [page, setPage] = useState(1);
	const [limit] = useState(20);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);

	const canGoPrev = useMemo(
		() => (state.pagination?.page ?? 1) > 1,
		[state.pagination]
	);
	const canGoNext = useMemo(
		() => (state.pagination?.page ?? 1) < (state.pagination?.pages ?? 1),
		[state.pagination]
	);

	useEffect(() => {
		if (!provinceId) {
			setError("Province ID is missing");
			setLoading(false);
			return;
		}

		const fetchEmployees = async () => {
			setLoading(true);
			setError(null);
			try {
				const response: PaginatedResponse<Employee> =
					await provinceApi.listEmployees(provinceId, page, limit);
				setState({
					data: response.data ?? [],
					pagination: response.pagination,
					_links: response._links,
				});
			} catch (err) {
				setError("Failed to load employees");
			} finally {
				setLoading(false);
			}
		};

		fetchEmployees();
	}, [provinceId, page, limit]);

	if (loading) {
		return <div>Loading employees...</div>;
	}

	if (error) {
		return <div>{error}</div>;
	}

	return (
		<div style={{ padding: "1rem" }}>
			<h1>Employees</h1>
			{state.data.length === 0 ? (
				<div>No employees found.</div>
			) : (
				<table style={{ width: "100%", borderCollapse: "collapse" }}>
					<thead>
						<tr>
							<th
								style={{
									textAlign: "left",
									borderBottom: "1px solid #ccc",
									padding: "0.5rem",
								}}
							>
								Name
							</th>
							<th
								style={{
									textAlign: "left",
									borderBottom: "1px solid #ccc",
									padding: "0.5rem",
								}}
							>
								Province
							</th>
							<th
								style={{
									textAlign: "left",
									borderBottom: "1px solid #ccc",
									padding: "0.5rem",
								}}
							>
								Actions
							</th>
						</tr>
					</thead>
					<tbody>
						{state.data.map((emp) => (
							<tr key={emp._id}>
								<td
									style={{ padding: "0.5rem", borderBottom: "1px solid #eee" }}
								>
									{[
										emp["basicInfo.firstName"],
										emp["basicInfo.lastName"],
										emp["basicInfo.fullName"],
									].find(Boolean) ?? emp._id}
								</td>
								<td
									style={{ padding: "0.5rem", borderBottom: "1px solid #eee" }}
								>
									{String(emp.provinceId)}
								</td>
								<td
									style={{ padding: "0.5rem", borderBottom: "1px solid #eee" }}
								>
									<Link
										to={ROUTES.PROVINCE_EMPLOYEE_DETAIL.replace(
											":provinceId",
											provinceId ?? ""
										).replace(":employeeId", emp._id)}
									>
										View
									</Link>
								</td>
							</tr>
						))}
					</tbody>
				</table>
			)}

			{state.pagination && (
				<div
					style={{
						marginTop: "1rem",
						display: "flex",
						gap: "0.5rem",
						alignItems: "center",
					}}
				>
					<button
						onClick={() => setPage((p) => Math.max(1, p - 1))}
						disabled={!canGoPrev}
					>
						Prev
					</button>
					<span>
						Page {state.pagination.page} of {state.pagination.pages} (total{" "}
						{state.pagination.total})
					</span>
					<button onClick={() => setPage((p) => p + 1)} disabled={!canGoNext}>
						Next
					</button>
				</div>
			)}
		</div>
	);
}
