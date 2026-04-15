import { lazy, Suspense } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import ProtectedRoute from "./components/ProtectedRoute";
import { ROUTES } from "./const/endpoints";
// load on demand
const LoginForm = lazy(() => import("./pages/LoginFormPage"));
const GlobalAdminDashboard = lazy(
	() => import("./pages/GlobalAdminDashboardPage"),
);
const AdminDashboard = lazy(() => import("./pages/AdminDashboardPage"));
const ProvinceEmployeesPage = lazy(
	() => import("./pages/ProvinceEmployeesPage"),
);
const EmployeePage = lazy(() => import("./pages/EmployeePage"));
const NewEmployeeFormPage = lazy(() => import("./pages/NewEmployeeFormPage"));

function App() {
	return (
		<Suspense>
			<Routes>
				<Route path={ROUTES.ROOT} element={<LoginForm />} />
				<Route
					path={ROUTES.PROVINCES}
					element={
						<ProtectedRoute>
							<GlobalAdminDashboard />
						</ProtectedRoute>
					}
				/>
				<Route
					path={ROUTES.ADMIN_DASHBOARD}
					element={
						<ProtectedRoute>
							<AdminDashboard />
						</ProtectedRoute>
					}
				/>
				<Route
					path={ROUTES.PROVINCE_EMPLOYEES}
					element={
						<ProtectedRoute>
							<ProvinceEmployeesPage />
						</ProtectedRoute>
					}
				/>
				<Route
					path={ROUTES.PROVINCE_EMPLOYEE_NEW}
					element={
						<ProtectedRoute>
							<NewEmployeeFormPage />
						</ProtectedRoute>
					}
				/>
				<Route
					path={ROUTES.PROVINCE_EMPLOYEE_DETAIL}
					element={
						<ProtectedRoute>
							<EmployeePage />
						</ProtectedRoute>
					}
				/>
				<Route path="*" element={<Navigate to={ROUTES.ROOT} />} />
			</Routes>
		</Suspense>
	);
}

export default App;
