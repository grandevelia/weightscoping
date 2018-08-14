import { combineReducers } from 'redux';
import auth from "./auth";
import intro from "./intro";
import weights from "./weights";

const weightScoping = combineReducers({
	auth, intro, weights,
})

export default weightScoping