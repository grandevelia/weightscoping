const initialState = {
	alcohol: null,
	carbRanks: [null, null, null, null, null, null, null, null, null],
	weightUnits: "Pounds",
	heightUnits: "Feet / Inches",
	heightInches: null,
	weightKg: null,
	idealWeightKg: null,
	idealWeightValue: "",
	sex: "male",
	paymentOption: null,
}

export default function intro(state=initialState, action){
	switch (action.type) {
		case 'UPDATE':
			if ('alcohol' in action.update){
				updateCarbRanks(state['carbRanks'], action.update.alcohol);
			}
			return {...state, ...action.update}

		case 'POSITION_CHANGE':

			let optionId = action.optionId;
			let toId = action.toId;
			let positions = state.carbRanks;

			//If this option has already been selected, remove it in order to prevent duplication
			let alreadyPlaced = positions.indexOf(optionId);
			
			if (alreadyPlaced >= 0){
				positions[alreadyPlaced] = null;
			}

			if (positions[toId] === null){
				//Target space currently empty

				positions[toId] = optionId;
			} else {
				//Target space occupied

				//Find nearest open position below target
				let spaceBelow = false;
				for (let i = toId+1; i < positions.length; i ++){
					if (positions[i] === null){
						spaceBelow = i;
						break;
					}
				}
				if (spaceBelow !== false){
					//Space below target
					//Move everything down to nearest open space
					for (let i = spaceBelow; i > toId; i --){
						positions[i] = positions[i-1];
					}

					positions[toId] = optionId;
				} else {
					//No space below target

					let spaceAbove = 0;
					//Find nearest open position above target
					for (let i = toId - 1; i > 0; i --){
						if (positions[i] === null){
							spaceAbove = i;
							break;
						}
					}
					//Move everything up to nearest open space
					for (let i = spaceAbove; i < toId; i ++){
						positions[i] = positions[i+1];
					}

					positions[toId] = optionId;
				}
			}
    		return {...state, carbRanks: positions};
		default:
			return state;
	}
}
function updateCarbRanks(oldRanks, newAlcoholVal){
	if (newAlcoholVal === "false" && oldRanks.length === 9){
		//Alcohol set to false, remove alcohol carb options

		let remaining = 2;
		 //If selected as option, remove Hard Alcohol
		let spliceInd = oldRanks.indexOf(7);
		if (spliceInd >= 0){
			oldRanks.splice(spliceInd,1);
			remaining --;
		}

 		//Beer/Wine
		spliceInd  = oldRanks.indexOf(8);
		if (spliceInd >= 0){
			oldRanks.splice(spliceInd,1);
			remaining --;
		}

		//Ensure option list size is 7
		for (let i = 0; i < remaining; i ++){
			oldRanks.splice(oldRanks.indexOf(null), 1);
		}
	} else if (newAlcoholVal === "true" && oldRanks.length !== 9){
		//Alcohol set to true, was previously set to false
		//Add 2 options
		oldRanks.push.apply(oldRanks, [null, null]);
	}
}