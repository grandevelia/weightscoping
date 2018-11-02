export const confirmRegistration = (email, activation_key) => {
	return dispatch => {
		let headers = {
			"Content-Type": "application/json"
    	};
    	let body = JSON.stringify({email, activation_key});
    	return fetch ("/api/auth/confirm/", {headers, body, method: "POST"})
    	.then(res => {
    		if (res.status < 500){
    			return res.json().then(data => {
    				return {status: res.status, data}
    			})
    		} else {
    			throw res;
    		}
    	})
    	.then(res => {
    		if (res.status === 200){
    			dispatch({
    				type: 'CONFIRMATION_SUCCESSFUL',
    				data: res.data
    			})
    			return res.data;
    		} else if (res.status === 403 || res.status === 401 || res.status === 400){
    			dispatch({type: "CONFIRMATION_FAILED", data:res.data});
    			throw res.data;
    		}
    	})
	}
}

export const loadUser = () => {
	return (dispatch, getState) => {
		dispatch({type: "USER_LOADING"});
		const token = getState().auth.token;
		let headers = {
			"Content-Type": "application/json"
    	};
		if (token) {
			headers["Authorization"] = "Token " + token; 
		}
		return fetch("/api/auth/user/", {headers, })
		.then(res => {
			if (res.status < 500){
				return res.json().then(data => {
		        	return {status: res.status, data};
		        })
			} else {
				throw res;
			}
		})
		.then(res => {
			if (res.status === 200){
				dispatch({type: 'USER_LOADED', user:res.data});
				return res.data;
			} else if (res.status >= 400 && res.status < 500){
				dispatch({type:'AUTHENTICATION_ERROR', data:res.data});
				//throw res.data;
			}
		})
	}
}

export const login = (email, password) => {
	return dispatch => {
		let headers = {
			"Content-Type": "application/json"
		};
		let body = JSON.stringify({email, password});
		return fetch("/api/auth/login/", {headers, body, method: "POST"})
		.then(res => {
			if (res.status < 500){
				return res.json().then(data => {
					return {status: res.status, data}
				})
			} else {
				throw res;
			}
		})
		.then(res => {
			if (res.status === 200){
				dispatch({
					type: 'LOGIN_SUCCESSFUL',
					data: res.data
				})
				return res.data;
			} else if (res.status === 403 || res.status === 401 || res.status === 400){
				dispatch({type: "LOGIN_FAILED", data:res.data});
				throw res.data;
			}
		})
	}
}

export const register = (email, password, alcohol, carb_ranks, weight_units, height_units, height_inches, weight_kg, ideal_weight_kg, monetary_value, sex) => {
	return dispatch => {
		let headers = {
			"Content-Type": "application/json"
		};
		monetary_value = Math.round(parseInt(monetary_value*100,10));
		let body = JSON.stringify({email, weight_kg, password, alcohol, carb_ranks, weight_units, height_units, height_inches, ideal_weight_kg, monetary_value, sex});
		return fetch("/api/auth/register/", {headers, body, method: "POST"})
		.then(res => {
			if (res.status < 500){
				return res.json().then(data => {
					return {status: res.status, data}
				})
			} else {
				throw res;
			}
		})
		.then(res => {
			if (res.status === 200){
				dispatch({
					type: 'REGISTRATION_SUCCESSFUL',
					data: res.data
				});
				return res.data;
			} else if (res.status === 403 || res.status === 401) {
	        	dispatch({type: "AUTHENTICATION_ERROR", data: res.data});
	        	throw res.data;
	        } else {
	        	if (res.status === 400){
	        		dispatch({type: 'REGISTRATION_ERROR', data:res.data});
	        		throw res.data;
		        } else {
	        		dispatch({type: "REGISTRATION_FAILED", data: res.data});
	        		throw res.data;
		        }
	        }
		})
	}
}

export const logout = () => {
	return (dispatch, getState) => {
		let headers = {"Content-Type": "application/json"};
		let {token} = getState().auth;

		if (token) {
			headers["Authorization"] = "Token " + token;
		}

		return fetch("/api/auth/logout/", {headers, body: "", method: "POST"})
		.then(res => {
			if (res.status === 204){
				return {status: res.status, data: {}};
			} else if (res.status < 500){
				return res.json().then(data => {
					return {status: res.status, data};
				})
			} else {
				throw res;
			}
		})
		.then(res => {
			if (res.status === 204){
				dispatch({type: 'LOGOUT_SUCCESSFUL'});
				return res.data;
			} else if (res.status === 403 || res.status === 401){
				dispatch({type: "AUTHENTICATION_ERROR", data:res.data});
				throw res.data;
			}
		})
	}
}

export const updateUserSettings = (key, value) => {
	if (key === 'monetary_value' || key === 'amount_paid'){
		value = Math.round(parseInt(value*100,10));
	}
	return (dispatch, getState) => {
		let headers = {"Content-Type" : "application/json"};
		let {token} = getState().auth;

		if (token) {
			headers["Authorization"] = "Token " + token;
		}
		let settings = {[key] : value};
		let body = JSON.stringify(settings);
		return fetch ("/api/auth/update_user/", {headers, body, method: "PUT"})
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
			if (res.status === 200){
				dispatch({type: 'SETTING_CHANGE', user:res.data});
				return res.data;
			} else if (res.status >= 400 && res.status < 500){
				dispatch({type:'AUTHENTICATION_ERROR', data:res.data});
				throw res.data;
			}
		})
	}
}
export const resetPassword = (email) => {
	return dispatch => {
		let headers = {"Content-Type": "application/json"};
		let body = JSON.stringify(email);
		return fetch ("/api/auth/reset_password/", {headers, body, method: "POST"})
		.then(res => {
			if (res.status < 500){
				return res.json().then(data => {
					return {status: res.status, data};
				})
			} else {
				throw res;
			}
		})
		.then(res => {
			if (res.status === 200){
				dispatch({type: "RESET_PASSWORD", email: res.data.email, status: true});
				return res.data
			} else {
				dispatch({type: "RESET_PASSWORD", email: null, status: false})
				throw res;
			}
		})
	}
}
export const confirmReset = (email, key) => {
	return dispatch => {
		let headers = {"Content-Type": "application/json"};
		let body = JSON.stringify({email, key});
		return fetch ("/api/auth/confirm_reset/", {headers, body, method: "POST"})
		.then(res => {
			if (res.status < 500){
				return res.json().then(data => {
					return {status: res.status, data};
				})
			} else {
				throw res;
			}
		})
		.then(res => {
			if (res.status === 200){
				dispatch({type:"RESET_PASSWORD", status: true, email: email, key:key});
				return res.data
			} else {
				dispatch({type: "RESET_PASSWORD", status: false, email: null});
				throw res;
			}
		})
	}
}
export const updatePassword = (email, key, password) => {
	return dispatch => {
		let headers = {"Content-Type": "application/json"};
		let body = JSON.stringify({"email":email, "key":key, "password":password });
		return fetch ("/api/auth/update_password/", {headers, body, method: "POST"})
		.then(res => {
			if (res.status < 500){
				return res.json().then(data => {
					return {status: res.status, data};
				})
			} else {
				throw res;
			}
		})
		.then(res => {
			if (res.status === 200){
				dispatch({type:"UPDATE_PASSWORD", status: true});
				return res.data
			} else {
				dispatch({type: "UPDATE_PASSWORD", status: false, reason:res.data});
				throw res;
			}
		})
	}
}
