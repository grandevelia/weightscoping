import moment from "moment";

export const carbOptions = ["Breads","Pasta/Rice","Potatoes","Dessert","Soft Drinks","Snack Carbs","Cereals","Hard Alcohol","Beer/Wine"];
export const iconIndex = ["breads","pasta","potatoes","dessert","soft-drinks","snack-carbs","cereals","hard-alcohol","soft-alcohol"];
export const carbOrder = [5,0,4,1,6,2,3,7,8];
export const maintenanceCarbOrder = [3,2,4,1,0,5,6,7,8];
export const maintenanceAvgs = [3,5,7,10,14,19];
export const planTitles = ["Classic","Slow Burn", "I Need More Proof"];

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
 			return Math.floor(stone) + " st " + Math.round(remainder * 14);
 		} else {
 			return Math.round(remainder * 14);
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
export const disallowedCarbs = (start, carbRanks) => {
	let disallowed = "";
	for (let i = start; i < carbRanks.length-1; i ++){
		if (i !== carbRanks.length - 2){
			disallowed += carbOptions[ carbRanks[ carbOrder[ i ] ] ] + ", ";
		} else if (start !== carbRanks.length - 2) {
			disallowed += " or " + carbOptions[ carbRanks[ carbOrder[ i ] ] ];
		} else {
			disallowed += carbOptions[ carbRanks[ carbOrder[ i ] ] ];
		}
	}
	return disallowed;
}
export const allowedCarbs = (end, carbRanks) => {
	let allowed = "All non-incentive food";
	if (end !== 0){
		allowed += ", ";
	}
	for (let i = end-1; i >= 0; i --){
		if (i !== 0){
			allowed += carbOptions[ carbRanks[ carbOrder[ i ] ] ] + ", ";
		} else {
			allowed += " and " + carbOptions[ carbRanks[ carbOrder[ i ] ] ];
		}
	}
	return allowed;
}
export const interpolateDates = (weightArr, dateArr, interpolatedIndexes=false) => {
	let indexes;
	if (interpolatedIndexes === false){
		indexes = [];
	}
	for (let i = 0; i < dateArr.length - 1; i ++){
		let currDate = moment(dateArr[i]);
		let dateDiff = moment(dateArr[i+1]).diff(currDate, "days")
		if (dateDiff > 1){
			let currWeight = weightArr[i];
			let nextWeight = weightArr[i+1];
			let weightPerDay = (nextWeight - currWeight)/dateDiff;

			for (let j = 1; j < dateDiff; j ++){
				dateArr.splice(i+j, 0, currDate.add(1, "days").format("YYYY-MM-DD"));
				weightArr.splice(i+j, 0, currWeight + (weightPerDay * j));
				if (interpolatedIndexes === false){
					indexes.push(i + j);	
				} else {
					interpolatedIndexes.splice(i + j, 0, null);
				}
			}
			i += dateDiff - 1; //Minus one because i increments after this loop
		}
	}
	if (interpolatedIndexes === false){
		return {
			weights: weightArr,
			dates: dateArr,
			indexes: indexes
		}
	} else {
		return {
			weights: weightArr,
			dates: dateArr,
			indexes: interpolatedIndexes
		}
	}
}

export const breakthroughIndex = (weights, idealWeight) => {
	/*
	* Returns the index in a weight array that corresponds to a user's most recent
	* breakthrough to entering maintenance mode
	*/
	let currentWeight = weights[weights.length-1];
	let closestIdealBreakthrough = -1;
	if (currentWeight <= 1.02 * idealWeight){
		//Starting from most recent weight, find the most recent time they attained their ideal weight
		//For the first time without having been in maintenance mode first
		
		for (let i = weights.length -1 ; i >= 0; i --){
			if (weights[i] <= 1.02 * idealWeight){
				if (weights[i] <= idealWeight){
					closestIdealBreakthrough = i;
				}
			} else {
				//Went over 1.02 * ideal weight -> days to maintenance reset
				break;
			}
		}
	}
	return closestIdealBreakthrough
}

export const lossmodeLevel = (initialWeight, idealWeight, currentWeight) => {
	let numLevels = 8;
	//	Divide by numLevels here since there are numSections - 1 = numLevels increments between the sections
	let kgPerSection = (initialWeight - idealWeight)/numLevels;

	let level = Math.floor((initialWeight - currentWeight)/kgPerSection);
	if (level >= 1){
		//First level is two increments from initial weight
		level = level - 1;
	} else if (level < 0){
		//If user has increased in weight, they are still level 0
		level = 0;
	}
	if (level > 7){
		//Weight loss levels stop at 7
		level = 7;
	}
	return level;
}

export const calcAverages = (index, arr) => {
	let sumCache = {};
	let returner = [];
	//Each entry in the array
	for (let k = index; k < arr.length; k ++){

		let innerObj = {};
		//Calc average of each length
		for (let i = 0; i < maintenanceAvgs.length; i ++){

			let avgLen = maintenanceAvgs[i];
			//If the number of weights before this index is less than this average length, skip it
			if (k < avgLen){
				break;
			}
			let currSum;
			if (avgLen in sumCache){
				//Get previous sum of this length, remove first item of old window, add last item of new window
				currSum = sumCache[avgLen] - arr[k-avgLen] + arr[k];
				//Push new avg to cache so next iteration can use it in the same way
				sumCache[avgLen] = currSum; 
			} else {
				//First time calculating average of this length
				currSum = 0;
				for (let j = 0; j < avgLen; j ++){
					currSum += arr[k - j];
				}
				//push to cache
				sumCache[avgLen] = currSum;
			}

			//Push each average to an object with its length as key
			innerObj[avgLen] = currSum/avgLen;
		}
		returner.push(innerObj);
	}
	return returner;
}

export const modeReversionDays = (weightAvgs, idealWeight) => {

	let warningDays = 10;
	//If all averages above ideal weight, give a warning
	let averagesAboveIdealToday = 0;
	Object.keys(weightAvgs[weightAvgs.length-1]).map(k => {
		let v = weightAvgs[weightAvgs.length-1][k];
		if (v > idealWeight){
			averagesAboveIdealToday ++;
		}
		return "";
	})

	//Calculate warning content
	if (averagesAboveIdealToday === maintenanceAvgs.length){
		let gracePeriod = 10;
		for (let i = 1; i <= gracePeriod; i ++){
			let averagesAboveIdealCurr = 0;
			Object.keys(weightAvgs[weightAvgs.length-(1+i)]).map(k => {
				let v = weightAvgs[weightAvgs.length-i][k];
				if (v > idealWeight){
					averagesAboveIdealCurr ++;
				}
				return "";
			})
			if (averagesAboveIdealCurr === maintenanceAvgs.length){
				warningDays --;
			} else {
				break;
			}
		}
	}
	return warningDays;
}
export const guessWeightsToNow = (weights, dates, ids=false) => {
	let lastDay = dates[dates.length-1];
	let lastWeight = weights[dates.length-1];
	let dayDiff = moment().diff(moment(lastDay), "days");
	for (let i = 1; i <= dayDiff; i ++){
		dates.push(moment(lastDay).add(1*i, "day").format("YYYY-MM-DD"));
		weights.push(lastWeight);
		if (ids !== false){
			ids.push(null);
		}
	}
	return {
		weights: weights,
		dates: dates,
		indexes: ids
	}
}
export const setupAverages = (weights, dates, startingWeight) => {
	/*
	* Returns object containing a users weights with weights for all missing dates interpolated,
	* and the index into this new weights corresponding to the date of mode switch
	*
	* params weights, dates arrays
	* param startingWeight original index of mode switch
	*/

	/*let currentData = guessWeightsToNow(weights, dates)
	weights = currentData.weights;
	dates = currentData.dates;*/
	//interpolate missing data
	let preStartWeights = weights.slice(0, startingWeight + 1);
	let preStartDates = dates.slice(0, startingWeight + 1);
	let untouchedWeightLen = preStartWeights.length;

	//Interpolate weights before starting weight so the starting weight index is known
	let interpData = interpolateDates(preStartWeights, preStartDates);
	preStartWeights = interpData.weights;
	preStartDates = interpData.dates;

	//Find how many points were interpolated from 0 through starting weight
	let preStartAddedCount = interpData.weights.length - untouchedWeightLen;
	let modStart = startingWeight + preStartAddedCount; //Adjust starting index to account for new data
	
	//interpolate points from startingWeight through end, and join previous result for averaging
	interpData = interpolateDates(weights.slice(startingWeight, weights.length), dates.slice(startingWeight, dates.length));

	//Don't use first element of second array to avoid duplicate join point
	weights = preStartWeights.concat(interpData.weights.slice(1,interpData.weights.length));
	return {weights: weights, startIndex: modStart};
}

export const mStatusCheck = (weights, dates, startingWeight, idealWeight) => {
	/*
		Returns the number of days a user in maintenance mode has until reversion to weight loss mode
		params weights, dates are arrays 
		startingWeight integer corresponding to index of breakthrough date in user's entered weight data
	*/

	let setupData = setupAverages(weights, dates, startingWeight);
	let weightAvgs = calcAverages(setupData.startIndex, setupData.weights);
	return modeReversionDays(weightAvgs, idealWeight);
}