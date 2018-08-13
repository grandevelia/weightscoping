const initialState = [

];

export default function weights(state=initialState, action){
	let weightList = state.slice();

	switch (action.type) {

		case 'FETCH_WEIGHTS':
			return [...state, ...action.weights];

		case 'ADD_WEIGHT':
			return [...state, action.weight];

		case 'UPDATE_WEIGHT':
		    let weightToUpdate = weightList[action.index]
		    weightToUpdate.text = action.weight.text;
		    weightList.splice(action.index, 1, weightToUpdate);
		    return weightList;

		case 'DELETE_WEIGHT':
			weightList.splice(action.index, 1);
   			return weightList;
			
		default:
			return state;
	}
}