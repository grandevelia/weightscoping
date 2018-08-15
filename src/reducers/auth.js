const initialState = {
	token: localStorage.getItem("token"),
	isAuthenticated: null,
	isLoading: true,
	confirmationSent: false,
	userConfirmed: false,
	key: null,
	user: null,
	email: null,
	errors: {},
};

export default function auth(state=initialState, action){
	switch (action.type) {

		case 'USER_LOADING':

			//console.log("user loading", action)
			return {...state, isLoading: true};

		case 'USER_LOADED':

			//console.log("user loaded", action)
			return {...state, isAuthenticated:true, userConfirmed:action.user.is_active, isLoading: false, user:action.user};

		case 'LOGIN_SUCCESSFUL':

			//console.log("login successful", action)
			localStorage.setItem("token", action.data.token);
			return {...state, ...action.data, userConfirmed: true, isAuthenticated: true, isLoading: false, errors:null};

		case 'CONFIRMATION_SUCCESSFUL':
			//console.log("confirmation successful", action)
			localStorage.setItem("token", action.data.token);
			return {...state, ...action.data, userConfirmed: true, isAuthenticated: true, isLoading: false, errors:null};

		case 'CONFIRMATION_FAILED':
			return {...state, errors: action.data}

		case 'AUTHENTICATION_ERROR':
			return {...state, errors: action.data}

		case 'LOGIN_FAILED':
			return {...state, errors: action.data}

		case 'LOGOUT_SUCCESSFUL':
			localStorage.removeItem("token");
			return {...initialState};	

		case 'REGISTRATION_SUCCESSFUL':
			
			//console.log("registration successful", action)
			localStorage.setItem("token", action.data.token);
    		return {...state, userConfirmed: false, email:action.data.email, confirmationSent:true, isAuthenticated: true};

    	case 'REGISTRATION_ERROR':
    		return {...state, errors: action.data, token:null, user:null, isAuthenticated:false, isLoading: false}

		case 'REGISTRATION_FAILED':
			return {...state, errors: action.data}

		case 'SETTING_CHANGE':
			return {...state, ...action.user}

		default:
			return state;
	}
}