import { addNotification } from './notifications';
import { updateUserSettings } from './auth';
import { weightStringFromKg} from '../components/utils';
import moment from 'moment';

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
				if (res.data.length === 0){
					return dispatch(addWeight(75, moment().subtract(1, "days").format("YYYY-MM-DD")));
				}
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
				let user = getState().auth.user;
				let weights = getState().weights;

				if (weights.length && weights[0] !== null){
					//If the user is in weight loss mode, check for ideal weight breakthrough when new weight is added
					if (user.mode === "0"){

						//If this is the most recent weight (not filling in a gap)
						if (moment(date_added).isAfter(moment(weights[weights.length-1].date_added))){

							//Ensure weights is at least 1 item long
							if (weights.length ){

								//Breakthrough only if the next most recent weight was above ideal weight
								if (weight_kg <= user.ideal_weight_kg && weights[weights.length - 1].weight_kg > user.ideal_weight_kg){
									dispatch(addNotification("Congratulations! You've reached your ideal weight. Once you maintain a weight of " + weightStringFromKg(1.02 * user.ideal_weight_kg, user.weight_units) + " (within 2% of your ideal weight) for 7 days, you will enter Maintenance Mode. Our focus will switch from helping you lose weight to helping you stay where you're at: the perfect weight for you."));
								}
							}
						}
					}

					return dispatch({type: 'ADD_WEIGHT', weight: res.data});
				} else {
					return dispatch(fetchWeights());
				}
			} else if (res.status === 401 || res.status === 403) {
				dispatch({type: "AUTHENTICATION_ERROR", data: res.data});
				throw res.data;
			} else if (res.status === 400){
				let alertString = "";
				Object.keys(res.data).map(key => {
					alertString += res.data[key] + "\n";
					return "";
				});
				alert(alertString);
			}
		})
	}
}

export const updateWeight = (weight_kg, id) => {
	return (dispatch, getState) => {
		let state = getState();
		let user = state.auth.user;
		if (user.mode === "0"){
			let weights = state.weights;
			let updatingStartingWeight = false;
			for (let i = 0; i < weights.length; i ++){
				if (weights[i].id === id && i === user.starting_weight){
					updatingStartingWeight = true;
					break;	
				}
			}
			if (updatingStartingWeight && user.ideal_weight_kg <= weight_kg){
				alert("The weight that is used to determine your levels must be above your ideal weight. Please reset your starting weight before updating this weight.");
				throw new Error("Key Weight Misconfigured");
			}
		}
		let headers = {"Content-Type": "application/json"};
		let {token} = state.auth;

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
		
		let state = getState();
		let startingWeight = state.auth.user.starting_weight;
		if (state.weights[startingWeight].id === id){
			alert("You are trying to delete the weight that is being used to determine your levels. Please reset your starting weight before deleting this weight.");
			throw new Error("Key Weight");
		}

		let oldWeight = false;
		for (let i = 0; i < startingWeight; i ++){

			if (state.weights[i].id === id){
				oldWeight = true;
				break;
			}
		}
		if (oldWeight){
			updateUserSettings("starting_weight", startingWeight-1);
		}

		let headers = {"Content-Type": "application/json"};
		let {token} = state.auth;

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