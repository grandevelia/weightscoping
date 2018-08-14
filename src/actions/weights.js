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

export const addWeight = weight_kg => {
     return (dispatch, getState) => {
          let headers = {"Content-Type": "application/json"};
          let {token} = getState().auth;

          if (token) {
          headers["Authorization"] = "Token " + token;
          }

          let body = JSON.stringify({weight_kg, });
          console.log(body);
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
               }
          })
     }
}

export const updateWeight = (index, weight_kg) => {
  return (dispatch, getState) => {

    let headers = {"Content-Type": "application/json"};
    let {token} = getState().auth;

    if (token) {
      headers["Authorization"] = "Token " + token;
    }

    let body = JSON.stringify({weight_kg, });
    let weightId = getState().weights[index].id;

    return fetch(`/api/weights/${weightId}/`, {headers, method: "PUT", body})
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
          return dispatch({type: 'UPDATE_WEIGHT', weight: res.data, index});
        } else if (res.status === 401 || res.status === 403) {
          dispatch({type: "AUTHENTICATION_ERROR", data: res.data});
          throw res.data;
        }
      })
  }
}

export const deleteWeight = index => {
  return (dispatch, getState) => {

    let headers = {"Content-Type": "application/json"};
    let {token} = getState().auth;

    if (token) {
      headers["Authorization"] = "Token " + token;
    }

    let weightId = getState().weights[index].id;

    return fetch(`/api/weights/${weightId}/`, {headers, method: "DELETE"})
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
          return dispatch({type: 'DELETE_WEIGHT', index});
        } else if (res.status === 401 || res.status === 403) {
          dispatch({type: "AUTHENTICATION_ERROR", data: res.data});
          throw res.data;
        }
      })
  }
}