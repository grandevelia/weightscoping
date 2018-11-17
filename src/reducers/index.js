import { combineReducers } from 'redux';
import auth from "./auth";
import weights from "./weights";
import notifications from "./notifications";

const weightScoping = combineReducers({
	auth, weights, notifications,
})

export default weightScoping