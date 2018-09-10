import moment from 'moment';
const initialState = [

];

export default function weights(state=initialState, action){
	let weightList = state.slice();

	switch (action.type) {

		case 'FETCH_WEIGHTS':
			return [...action.weights];

		case 'ADD_WEIGHT': {
			let index = 0; //If date is before all in state, add to beginning
			let newWeight = moment(action.weight.date_added);
			for (let i = weightList.length-1; i >= 0; i --){
				if (newWeight.isAfter(moment(weightList[i].date_added))){
					index = i + 1;
					break;
				}
			}
			weightList.splice(index, 1, action.weight);
			return weightList;
		}

		case 'UPDATE_WEIGHT': {
			let index = -1;
			for (let i = 0; i < weightList.length; i ++){
				if (weightList[i].id === action.id){
					index = i;
					break;
				}
			}
			if (index < 0){
				alert("Undefined Weight");
				return;
			}
		    weightList[index].weight_kg = action.weight_kg;
			return weightList;
		}

		case 'DELETE_WEIGHT':{
			let index = -1;
			for (let i = 0; i < weightList.length; i ++){
				if (weightList[i].id === action.id){
					index = i;
					break;
				}
			}
			if (index < 0){
				alert("Undefined Weight");
				return;
			}
			weightList.splice(index, 1);
			   return weightList;
		}
			
		default:
			return state;
	}
}