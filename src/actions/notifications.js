export const fetchNotifications = () => {
    return (dispatch, getState) => {
        let headers = {"Content-Type": "application/json"};
		let {token} = getState().auth;

		if (token) {
			headers["Authorization"] = "Token " + token;
		}

		return fetch("/api/notifications/", {headers, })
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
				return dispatch({type: 'FETCH_NOTIFICATIONS', notifications: res.data});
			} else if (res.status === 401 || res.status === 403) {
				dispatch({type: "AUTHENTICATION_ERROR", data: res.data});
				throw res.data;
			}
		})
    }
}

export const updateNotificationStatus = id => {
    return (dispatch, getState) => {
		let headers = {"Content-Type": "application/json"};
		let {token} = getState().auth;

		if (token) {
			headers["Authorization"] = "Token " + token;
		}

		let body = JSON.stringify({id});
		return fetch('/api/notifications/' + id + "/", {headers, method: "PATCH", body})
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
				return dispatch({type: 'UPDATE_NOTIFICATION', id: id});
			} else if (res.status === 401 || res.status === 403) {
				dispatch({type: "AUTHENTICATION_ERROR", data: res.data});
				throw res.data;
			}
		})
	}
}
export const addNotification = (message) => {
	return (dispatch, getState) => {
		let headers = {"Content-Type": "application/json"};
		let {token} = getState().auth;

		if (token) {
			headers["Authorization"] = "Token " + token;
        }
        
		let body = JSON.stringify({message});
		return fetch("/api/notifications/", {headers, method: "POST", body})
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
            console.log(res.data)
			if (res.status === 201) {
				return dispatch({type: 'ADD_NOTIFICATION', notification: res.data});
			} else if (res.status === 401 || res.status === 403) {
				dispatch({type: "AUTHENTICATION_ERROR", data: res.data});
				throw res.data;
			}
		})
	}
}