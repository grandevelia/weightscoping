import React, { Component } from 'react';
import { interpolateDates, maintenanceAvgs, weightStringFromKg, iconIndex, maintenanceCarbOrder, carbOptions, calcAverages } from './utils';
import moment from 'moment';

export default class WeightHistoryGraph extends Component {
    allowedIcons(index, carbRanks){

		if (isNaN(index)){
			return <div className='loading-icons'>Loading...</div>
        }
        let innerIndex = carbRanks[ maintenanceCarbOrder[ index ] ];
		return (
			<div className='allowed-icons maintenance-icons'>
				<div className='icon icon-allowed' id='non-incentive-icon'>
					<div className='icon-description'>Non Incentive Food</div>
                </div>
                    {
                        //In Maintenance Mode, there are 6 levels
                        //If the user is level 6, a special case is needed to allow everything
                        //since carbRanks is either 7 or 9 items long
                        index !== 5 ? 
                            <div className='icon icon-allowed' id={iconIndex[ innerIndex ] + "-icon"}>
                                <div className='icon-description'>{carbOptions[ innerIndex ]}</div>
                            </div>
                        :
                            Array( carbRanks.length - index).fill().map( (x, j) => j + index).map(j => {
                                innerIndex = carbRanks[ maintenanceCarbOrder[ j ] ];
                                return (
                                    <div key={j} className='icon icon-allowed' id={iconIndex[innerIndex] + "-icon"}>
                                        <div className='icon-description'>{carbOptions[ innerIndex ]}</div>
                                    </div>
                                )
                            })
                    }
			</div>
		);
	}
    render(){
        let user = this.props.user;
        let numLevels = maintenanceAvgs.length;
        let levelMap = Array( numLevels ).fill().map((x,i) => i);

		let interpIndexes = [];

		let weights = []
		let dates = [];
		let ids = [];

		//Split user weight data into arrays for easier manipulation
		Object.keys(this.props.weights).map(key => {
			dates.push(this.props.weights[key]['date_added']);
			weights.push(this.props.weights[key]['weight_kg']);
			ids.push(this.props.weights[key]['id']);
        });
        
        //Find averages of recent weights

        //interpolate missing data
        let preStartWeights = weights.slice(0, user.starting_weight + 1);
        let preStartDates = dates.slice(0, user.starting_weight + 1);
        let untouchedWeightLen = preStartWeights.length;

        let interpData = interpolateDates(preStartWeights, preStartDates);
        preStartWeights = interpData.weights;
        preStartDates = interpData.dates;

        //Find how many points were interpolated from 0 through starting weight
        let preStartAddedCount = interpData.weights.length - untouchedWeightLen;
        let modStart = user.starting_weight + preStartAddedCount; //Adjust starting index to account for new data
        
        //interpolate points from user.starting_weight through end, and join previous result for averaging
        interpData = interpolateDates(weights.slice(user.starting_weight, weights.length), dates.slice(user.starting_weight, dates.length));

        //Don't use first element of second array to avoid duplicate join point
        weights = preStartWeights.concat(interpData.weights.slice(1,interpData.weights.length));
        dates = preStartDates.concat(interpData.dates.slice(1,interpData.dates.length));

        interpIndexes = interpData.indexes; 

        let weightAvgs = calcAverages(modStart, weights);

        //Remove weights before ideal weight breakthrough
        ids = interpIndexes.slice(modStart, interpIndexes.length);
        weights = weights.slice(modStart, weights.length);
        dates = dates.slice(modStart, dates.length);

        //Find x label widths
        let dateRange = moment(dates[dates.length-1]).diff(moment(dates[0]), "days");
        let dateInc = (Math.floor(dateRange/5) + Math.ceil(dateRange/5))/2;
        let xLabels = [];
        for (let i = 0; i < 5; i ++){
            xLabels.push(moment(dates[0]).add(dateInc * i, "days").format("YYYY-MM-DD"));
        }
        return (
            <div id='graph-middle'>
                <div id='graph-middle-top'>
                    <div id='m-y-labels'>
                        {
                            levelMap.map(y => {
                                y = (maintenanceAvgs.length - 1) - y;
                                return (
                                    <div key={y} className={'y-label graph-section'} style={{flexBasis: 100/numLevels + "%"}}>
                                        <div className='icons-wrap'>
                                            {this.allowedIcons(y, user.carb_ranks)}
                                        </div>
                                        <div className='y-label-weight'>{maintenanceAvgs[y] + " Days"}</div>
                                    </div>
                                )
                            })
                        }
                    </div>
                    <div id='m-graph-display'>
                        {
                            weightAvgs.map((weight, i) => {
                                let currInterpolated = false;
                                if (interpIndexes.includes(i)){
                                    currInterpolated = true;
                                }
                                return (
                                    <div className={currInterpolated ? 'm-date interpolated' : 'm-date'} key={i} style={{ width: 100/weights.length + "%" }}>
                                        <div className='m-date-hover'>{dates[i]}</div>
                                        {
                                            levelMap.map(i => {
                                                let currAvg = maintenanceAvgs[maintenanceAvgs.length -1 - i];
                                                let weightOk = null;
                                                if (currAvg in weight){
                                                    if (weight[currAvg] < user.ideal_weight_kg){
                                                        weightOk = true;
                                                    } else {
                                                        weightOk = false;
                                                    }
                                                }
                                                let weightString;
                                                if (!isNaN(weight[currAvg])){
                                                    weightString = weightStringFromKg(weight[currAvg], user.weight_units);
                                                    if (user.weight_units === "Pounds"){
                                                        weightString = weightString.substring(0, weightString.length - 7);
                                                    } else if (user.weight_units === "Kilograms"){
                                                        weightString = weightString.substring(0, weightString.length - 10);
                                                    }
                                                } else {
                                                    weightString = "n/a";
                                                }
                                                return (
                                                    <div key={"inner"+i} className={weightOk === null ? 'avg-section no-data' : weightOk === true ? 'avg-section weight-ok' : 'avg-section weight-not-ok'}> 
                                                            {weightString}
                                                    </div>
                                                )
                                            })
                                        }
                                    </div>
                                )
                            })
                        }
                    </div>
                </div>
                <div id='x-labels'>
                    {
                        xLabels.map((x, k ) => {
                            return <div key={"xlabel"+k} className='x-label'>{ x.substring(5,10)}</div>
                        })
                    }
                </div>
            </div>
        )
    }
}