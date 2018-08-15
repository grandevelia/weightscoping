export const confirmRegistration = (email, activation_key) => {
	return (dispatch, getState) => {
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
				throw res.data;
			}
		})
	}
}

export const login = (email, password) => {
	return (dispatch, getState) => {
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
			} else if (res.status === 403 || res.status === 401){
				dispatch({type: "LOGIN_FAILED", data:res.data});
				throw res.data;
			}
		})
	}
}

export const register = (email, password, alcohol, carb_ranks, weight_units, height_units, height_inches, weight_kg, ideal_weight_kg, monetary_value, sex) => {
	return (dispatch, getState) => {
		let headers = {
			"Content-Type": "application/json"
		};
		monetary_value = Math.round(parseInt(monetary_value*100,10));
		let body = JSON.stringify({email, weight_kg, password, alcohol, carb_ranks, weight_units, height_units, height_inches, ideal_weight_kg, monetary_value, sex});
		//let body = JSON.stringify({"email":"test20@test.com","password":"test","alcohol":false,"carb_ranks":[2,0,3,5,1,4,6],"weight_units":"Pounds","height_units":"Feet / Inches","height_inches":70,"ideal_weight_kg":72.399068,"monetary_value":"200","weight_kg":100,"sex":"male"});
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
				alert("Settings Saved");
				return res.data;
			} else if (res.status >= 400 && res.status < 500){
				dispatch({type:'AUTHENTICATION_ERROR', data:res.data});
				throw res.data;
			}
		})
	}
}