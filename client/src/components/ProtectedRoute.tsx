import { Navigate } from "react-router-dom";
import api from "../api/api";
import { useEffect, useState } from "react";
import ENDPOINTS from "../const/endpoints";

export default function ProtectedRoute({ children }) {
	const [loading, setLoading] = useState(true);
	const [authorized, setAuthorized] = useState(false);
	useEffect(() => {
		api
			.get("/auth/login")
			.then(() => setAuthorized(true))
			.catch(() => setAuthorized(false))
			.finally(() => setLoading(false));
	}, []);
	if (loading) {
		return <div>Loading...</div>;
	}
	if (!authorized) {
		return <Navigate to={ENDPOINTS.ROOT} />;
	}
	return children;
}
