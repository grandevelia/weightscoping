import { combineReducers } from 'redux';
import auth from "./auth";
import intro from "./intro";
import weights from "./weights";
import notifications from "./notifications";

const weightScoping = combineReducers({
	auth, intro, weights, notifications,
})

export default weightScoping