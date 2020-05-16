const initialState = {
	token: localStorage.getItem("token"),
	isAuthenticated: null,
	isLoading: true,
	confirmationSent: false,
	userConfirmed: false,
	key: null,
	user: null,
	email: null,
	reset: null,
	resetKey: "",
	errors: {},
};

export default function auth(state = initialState, action) {
	switch (action.type) {
		case 'USER_LOADING':
			return { ...state, isLoading: true };

		case 'USER_LOADED':
			return { ...state, isAuthenticated: true, isLoading: false, user: action.user };

		case 'LOGIN_SUCCESSFUL':
			localStorage.setItem("token", action.data.token);
			return { ...state, ...action.data, isAuthenticated: true, isLoading: false, errors: null };

		case 'CONFIRMATION_SUCCESSFUL':
			localStorage.setItem("token", action.data.token);
			return { ...state, ...action.data, isAuthenticated: true, isLoading: false, errors: null };

		case 'CONFIRMATION_FAILED':
			return { ...state, errors: action.data }

		case 'AUTHENTICATION_ERROR':
			if (localStorage.getItem("token") !== null) {
				localStorage.removeItem("token");
			}
			return { ...state }

		case 'LOGIN_FAILED':
			return { ...state, errors: action.data }

		case 'LOGOUT_SUCCESSFUL':
			localStorage.removeItem("token");
			return { ...initialState };

		case 'REGISTRATION_SUCCESSFUL':
			localStorage.setItem("token", action.data.token);
			return { ...state, userConfirmed: false, email: action.data.email, confirmationSent: true, isAuthenticated: true };

		case 'REGISTRATION_ERROR':
			let errorKey = Object.keys(action.data)[0];
			if (errorKey === 'email') {
				action.data['email'] = "That email is already being used"
			}
			return { ...state, errors: action.data, token: null, user: null, isAuthenticated: false, isLoading: false }

		case 'REGISTRATION_FAILED':
			return { ...state, errors: action.data }

		case 'SETTING_CHANGE':
			return { ...state, ...action.user }

		case 'RESET_PASSWORD':
			let key = "";
			if (action.key) {
				key = action.key;
			}
			return { ...state, reset: action.status, email: action.email, key: key }

		case 'CONFIRM_RESET':
			return { ...state, reset: action.status }

		case 'UPDATE_PASSWORD':
			let errors = {};
			if (action.reason) {
				errors = { error: action.reason[0] };
			}
			return { ...state, reset: action.status, errors: errors }

		default:
			return state;
	}
}