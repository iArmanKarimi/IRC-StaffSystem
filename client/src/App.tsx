import { Routes, Route } from "react-router-dom";
import Login from "./pages/Login";
import ProtectedRoute from "./components/ProtectedRoute";
import Employees from "./pages/Employees";
import ENDPOINTS from "./const/endpoints";

function App() {
	return (
		<Routes>
			<Route path={ENDPOINTS.ROOT} element={<Login />}></Route>
			<Route
				path={ENDPOINTS.EMPLOYEES_GLOBAL}
				element={
					<ProtectedRoute>
						<Employees />
					</ProtectedRoute>
				}
			></Route>
			<Route
				path={ENDPOINTS.EMPLOYEES_PROVINCE}
				element={
					<ProtectedRoute>
						<ProvinceEmployees />
					</ProtectedRoute>
				}
			></Route>

			<Route
				path={ENDPOINTS.EMPLOYEES_GET_ONE}
				element={
					<ProtectedRoute>
						<Employee />
					</ProtectedRoute>
				}
			></Route>
		</Routes>
	);
}

export default App;
