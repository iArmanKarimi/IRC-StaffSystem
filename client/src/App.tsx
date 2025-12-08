import { Routes, Route } from "react-router-dom";
import LoginForm from "./pages/LoginFormPage";
import ProtectedRoute from "./components/ProtectedRoute";
import GlobalAdminDashboard from "./pages/GlobalAdminDashboardPage";
import ENDPOINTS from "./const/endpoints";

function App() {
	return (
		<Routes>
			<Route path={ENDPOINTS.ROOT} element={<LoginForm />}></Route>
			<Route
				path={ENDPOINTS.EMPLOYEES_GLOBAL}
				element={
					<ProtectedRoute>
						<GlobalAdminDashboard />
					</ProtectedRoute>
				}
			></Route>
			<Route
				path={ENDPOINTS.EMPLOYEES_PROVINCE}
				element={
					<ProtectedRoute>
						< />
					</ProtectedRoute>
				}
			></Route>

			<Route
				path={ENDPOINTS.EMPLOYEES_GET_ONE}
				element={
					<ProtectedRoute>
						< />
					</ProtectedRoute>
				}
			></Route>
		</Routes>
	);
}

export default App;
