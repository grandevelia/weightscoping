export function calcRobinson(heightInches, sex){
	let baseHeight;
	let baseWeight;
	let weightPerInch;
	if (sex === 'male'){
		baseHeight = 5*12;
		baseWeight = 52;
		weightPerInch = 1.9;
	} else {
		baseHeight = 5*12;
		baseWeight = 49;
		weightPerInch = 1.7;
	}
	let diffHeight = heightInches - baseHeight;
	return (weightPerInch * diffHeight + baseWeight);
}
export function calcMiller(heightInches, sex){
	let baseHeight;
	let baseWeight;
	let weightPerInch;
	if (sex === 'male'){
		baseHeight = 5*12;
		baseWeight = 56.2;
		weightPerInch = 1.41;
	} else {
		baseHeight = 5*12;
		baseWeight = 53.1;
		weightPerInch = 1.36;
	}
	let diffHeight = heightInches - baseHeight;
	return (weightPerInch * diffHeight + baseWeight);
}
export function calcDevine(heightInches, sex){
	let baseHeight;
	let baseWeight;
	let weightPerInch;
	if (sex === 'male'){
		baseHeight = 5*12;
		baseWeight = 50;
		weightPerInch = 2.3;
	} else {
		baseHeight = 5*12;
		baseWeight = 45.5;
		weightPerInch = 2.3;
	}
	let diffHeight = heightInches - baseHeight;
	return (weightPerInch * diffHeight + baseWeight);
}
export function calcHamwi(heightInches, sex){
	let baseHeight;
	let baseWeight;
	let weightPerInch;
	if (sex === 'male'){
		baseHeight = 5*12;
		baseWeight = 106;
		weightPerInch = 6;
	} else {
		baseHeight = 5*12;
		baseWeight = 100;
		weightPerInch = 5;
	}
	let diffHeight = heightInches - baseHeight;
	return poundsToKg(weightPerInch * diffHeight + baseWeight);
}
export function averageAlgs(heightInches, sex){
	if (sex === 'other'){
		return (calcRobinson(heightInches, 'female') + calcMiller(heightInches, 'female') + calcDevine(heightInches, 'female') + calcHamwi(heightInches, 'female') + calcRobinson(heightInches, 'male') + calcMiller(heightInches, 'male') + calcDevine(heightInches, 'male') + calcHamwi(heightInches, 'male'))/8;
	}
	return (calcRobinson(heightInches, sex) + calcMiller(heightInches, sex) + calcDevine(heightInches, sex) + calcHamwi(heightInches, sex))/4;
}
export function	poundsToKg(pounds){
	return 0.453592 * pounds;
}
export function	kgToPounds(kg){
	return kg/0.453592;
}
export function	kgToStone(kg){
	return kgToPounds(kg)/14;
}
export function	idealWeightString(weightUnits, heightUnits, sex, primary, secondary){
	let heightInches = calcHeightInches(heightUnits, primary, secondary);
	let weightKg = averageAlgs(heightInches, sex);

 	return weightStringFromKg(weightKg, weightUnits);
}
export function weightStringFromKg(weightKg, targetUnit){

	if (targetUnit === "Pounds"){

 		return Math.round(kgToPounds(weightKg)*10)/10 + " pounds";

 	} else if (targetUnit === "Stones"){
 		let stone = kgToStone(weightKg);
 		let remainder = stone % 1;
 		if (Math.floor(stone) > 0){
 			return Math.floor(stone) + " stone " + Math.round(remainder * 14);
 		} else {
 			return Math.round(remainder * 14) + " pounds";
 		}
 	}
 	return Math.round(weightKg*10)/10 + " Kilograms";
}
export function	calcHeightInches(units, primary, secondary){
	if (units === "Feet / Inches"){
		return 12 * parseInt(primary,10) + parseInt(secondary,10);
	} else{
		return  parseInt(primary,10)/2.54;
	}
}