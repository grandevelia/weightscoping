import React from 'react';
import InfoLink from './InfoLink.jsx';
import moment from "moment";

export const iconPaths = [require('../images/bread.png'), require('../images/pasta.png'), "PotatoIcon", "DessertIcon", require('../images/soft_drink.png'), require('../images/snack_carb.png'), "CerealIcon", require('../images/hard_alcohol.png'), require('../images/soft_alcohol.png')];
export const carbOptions = ["Breads","Pasta/Rice","Potatoes","Dessert","Soft Drinks","Snack Carbs","Cereals","Hard Alcohol","Beer/Wine"];
const carbList =[["Raised", "Flat", "Croissants", "Muffins", "Scones", "Tortillas", "Naan", "Pizza Crust",  "Crackers",  "etc."], ["Rice", "Wheat", "Corn", "Oats", "Separate or part of a dish", "Cold Breakfast Cereals", "Granola", "Oatmeal", "Cous-cous", "etc"], ["Potatoes", "Yams",  "Sweet Potatoes", "Casava", "Separate or part of a dish"], ["Any sugar/sweet treat (no exceptions)"], ["Soda/pop (diet, too)", "Fruit Juice (even if 100% fruit)"], ["Chips/Crisps", "Crackers", "Pretzels", "Popcorn", "etc."], [""], [""], [""]];
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

 		return parseFloat(Math.round(kgToPounds(weightKg)*100)/100).toFixed(2) + " pounds";

 	} else if (targetUnit === "Stones"){
 		let stone = kgToStone(weightKg);
 		let remainder = stone % 1;
 		if (Math.floor(stone) > 0){
 			return Math.floor(stone) + " st " + Math.round(remainder * 14);
 		} else {
 			return Math.round(remainder * 14);
 		}
 	}
 	return parseFloat(Math.round(weightKg*100)/100).toFixed(2) + " Kilograms";
}
export function	calcHeightInches(units, primary, secondary){
	if (units === "Feet / Inches"){
		return 12 * parseInt(primary, 10) + parseInt(secondary, 10);
	} else{
		return  parseInt(primary, 10)/2.54;
	}
}
export const disallowedCarbs = (start, carbRanks) => {
	let disallowed = [];
	for (let i = start; i < carbRanks.length; i ++){
		disallowed.push(<InfoLink key={i} title={carbOptions[ carbRanks[ carbOrder[ i ] ] ]} list={carbList[carbRanks[ carbOrder[ i ] ]]}/>);
	}
	return disallowed;
}
export const allowedCarbs = (end, carbRanks) => {
	let allowed = [<InfoLink key={-1} title={"All non-incentive food"} list={[""]}/>];
	for (let i = end-1; i >= 0; i --){
		allowed.push(<InfoLink key={i} title={carbOptions[ carbRanks[ carbOrder[ i ] ] ]} list={carbList[carbRanks[ carbOrder[ i ] ]]}/>);
	}
	return allowed;
}
export const interpolateDates = (weightArr, dateArr, originalIds=false) => {
	/*
	* If originalIds is false, the indexes of interpolated dates will be returned
	* if it is an array of ids, null will be interpolated in between the original ids
	*/

	let indexes;
	if (originalIds === false){
		indexes = [];
	}
	for (let i = 0; i < dateArr.length - 1; i ++){
		let currDate = dateArr[i];
		let dateDiff = Math.ceil(moment(dateArr[i+1]).diff(moment(currDate), "days", true));
		if (dateDiff > 1){
			let currWeight = weightArr[i];
			let nextWeight = weightArr[i+1];
			let weightPerDay = (nextWeight - currWeight)/dateDiff;

			for (let j = 1; j < dateDiff; j ++){

				let newDate = moment(currDate).add(j, "days");
				dateArr.splice(i+j, 0, newDate.format("YYYY-MM-DD"));
				weightArr.splice(i+j, 0, currWeight + (weightPerDay * j));
				if (originalIds === false){
					indexes.push(i + j);	
				} else {
					originalIds.splice(i + j, 0, null);
				}
			}
			i += dateDiff - 1; //Minus one because i increments after this loop
		}
	}
	if (originalIds === false){
		return {
			weights: weightArr,
			dates: dateArr,
			ids: indexes
		}
	} else {
		return {
			weights: weightArr,
			dates: dateArr,
			ids: originalIds
		}
	}
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
		dates.push(moment(lastDay).add(i, "days").format("YYYY-MM-DD"));
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
