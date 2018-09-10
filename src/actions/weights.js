export const fetchWeights = () => {
	return (dispatch, getState) => {
		let headers = {"Content-Type": "application/json"};
		let {token} = getState().auth;

		if (token) {
			headers["Authorization"] = "Token " + token;
		}

		return fetch("/api/weights/", {headers, })
		.then(res => {
			if (res.status < 500) {
				return res.json().then(data => {
					return {status: res.status, data};
				})
			} else {
				throw res;
			}
		})
		.then(res => {
			if (res.status === 200) {
				return dispatch({type: 'FETCH_WEIGHTS', weights: res.data});
			} else if (res.status === 401 || res.status === 403) {
				dispatch({type: "AUTHENTICATION_ERROR", data: res.data});
				throw res.data;
			}
		})
	}
}

export const addWeight = (weight_kg, date_added) => {
	return (dispatch, getState) => {
		let headers = {"Content-Type": "application/json"};
		let {token} = getState().auth;

		if (token) {
			headers["Authorization"] = "Token " + token;
		}

		let body = JSON.stringify({weight_kg, date_added});
		return fetch("/api/weights/", {headers, method: "POST", body})
		.then(res => {
			if (res.status < 500) {
				return res.json().then(data => {
					return {status: res.status, data};
				})
			} else {
				throw res;
			}
		})
		.then(res => {
			if (res.status === 201) {
				return dispatch({type: 'ADD_WEIGHT', weight: res.data});
			} else if (res.status === 401 || res.status === 403) {
				dispatch({type: "AUTHENTICATION_ERROR", data: res.data});
				throw res.data;
			} else if (res.status === 400){
				let alertString = "";
				Object.keys(res.data).map(key => {
					alertString += res.data[key] + "\n";
				});
				alert(alertString);
			}
		})
	}
}

export const updateWeight = (weight_kg, id) => {
	return (dispatch, getState) => {
		let headers = {"Content-Type": "application/json"};
		let {token} = getState().auth;

		if (token) {
			headers["Authorization"] = "Token " + token;
		}

		let body = JSON.stringify({weight_kg});
		return fetch('/api/weights/' + id + "/", {headers, method: "PUT", body})
		.then(res => {
			if (res.status < 500) {
				return res.json().then(data => {
					return {status: res.status, data};
				})
			} else {
				throw res;
			}
		})
		.then(res => {
			if (res.status === 200) {
				return dispatch({type: 'UPDATE_WEIGHT', weight_kg: weight_kg, id: id});
			} else if (res.status === 401 || res.status === 403) {
				dispatch({type: "AUTHENTICATION_ERROR", data: res.data});
				throw res.data;
			}
		})
	}
}

export const deleteWeight = id => {
	return (dispatch, getState) => {

		let headers = {"Content-Type": "application/json"};
		let {token} = getState().auth;

		if (token) {
			headers["Authorization"] = "Token " + token;
		}

		return fetch(`/api/weights/${id}/`, {headers, method: "DELETE"})
		.then(res => {
			if (res.status === 204) {
				return {status: res.status, data: {}};
			} else if (res.status < 500) {
				return res.json().then(data => {
					return {status: res.status, data};
				})
			} else {
				throw res;
			}
		})
		.then(res => {
			if (res.status === 204) {
				return dispatch({type: 'DELETE_WEIGHT', id:id});
			} else if (res.status === 401 || res.status === 403) {
				dispatch({type: "AUTHENTICATION_ERROR", data: res.data});
				throw res.data;
			}
		})
	}
}