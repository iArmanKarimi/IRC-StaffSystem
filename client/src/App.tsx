import { Routes, Route, Navigate } from "react-router-dom";
import LoginForm from "./pages/LoginFormPage";
import ProtectedRoute from "./components/ProtectedRoute";
import GlobalAdminDashboard from "./pages/GlobalAdminDashboardPage";
import AdminDashboard from "./pages/AdminDashboardPage";
import ProvinceEmployeesPage from "./pages/ProvinceEmployeesPage";
import EmployeePage from "./pages/EmployeePage";
import NewEmployeeFormPage from "./pages/NewEmployeeFormPage";
import { ROUTES } from "./const/endpoints";

function App() {
	return (
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
	);
}

export default App;
