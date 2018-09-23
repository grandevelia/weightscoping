import React, { Component } from 'react';
import { poundsToKg, interpolateDates, maintenanceAvgs, weightStringFromKg, iconIndex, maintenanceCarbOrder, carbOptions, calcAverages, guessWeightsToNow } from './utils';
import moment from 'moment';

export default class WeightHistoryGraph extends Component {
    constructor(props){
        super(props);
        let numInputs = moment().diff(moment(props.weights[0].date_added), 'days');
        let inputState = {};
        for (let i = 0; i < numInputs; i ++){
            inputState[i] = "";
        }
        this.state = {
            projecting: 0,
            inputs: inputState
        }
    }
    componentDidMount(){
        this.refs.scroll.scrollLeft = 1000000000000000;
    }
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
    changeWeight(e, i){
        let newInputs = this.state.inputs;
        newInputs[i] = e.target.value;
        this.setState({inputs: newInputs});
    }
    submitWeight(e, i, date, interpolated, id=null){
        e.preventDefault();
        if (this.state.inputs[i] === ""){
            return
        }
        let newWeight = parseInt(this.state.input[i], 10);
        if (interpolated){
			this.props.addWeight(this.convertWeight(newWeight), date);
        } else {
            this.props.updateWeight(this.convertWeight(newWeight), id);
        }
    }
	convertWeight(weight){
		let weightUnits = this.props.auth.user.weight_units;
		if (weightUnits === "Pounds"){
			return poundsToKg(weight);
		}
		return weight;
	}
    project(){
        let daysToProject = parseInt(prompt("How many days would you like to project? (1-30)"), 10);
        if (isNaN(daysToProject)){
            return;
        }
        if (daysToProject > 30){
            daysToProject = 30;
        }
        if (daysToProject < 1){
            return;
        }
        this.setState({projecting : daysToProject}, () => {
            this.refs.scroll.scrollLeft = 1000000000000000;
        });
    }
    hideProjection(){
        this.setState({projecting: 0});
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

        let interpData = interpolateDates(preStartWeights, preStartDates, ids);
        preStartWeights = interpData.weights;
        preStartDates = interpData.dates;
        ids = interpData.indexes;

        //Find how many points were interpolated from 0 through starting weight
        let preStartAddedCount = interpData.weights.length - untouchedWeightLen;
        let modStart = user.starting_weight + preStartAddedCount; //Adjust starting index to account for new data
        
        //interpolate points from user.starting_weight through end, and join previous result for averaging
        interpData = interpolateDates(weights.slice(user.starting_weight, weights.length), dates.slice(user.starting_weight, dates.length), ids);

        //Don't use first element of second array to avoid duplicate join point
        weights = preStartWeights.concat(interpData.weights.slice(1,interpData.weights.length));
        dates = preStartDates.concat(interpData.dates.slice(1,interpData.dates.length));

        interpIndexes = interpData.indexes;

        //Ensure weights are present up to current day
        interpData = guessWeightsToNow(weights, dates, ids);
        weights = interpData.weights;
        dates = interpData.dates;
        ids = interpData.indexes;


        let weightAvgs = calcAverages(modStart, weights);

        //Find x label widths
        let dateRange = moment(dates[dates.length-1]).diff(moment(dates[0]), "days");
        let dateInc = (Math.floor(dateRange/5) + Math.ceil(dateRange/5))/2;
        let xLabels = [];
        for (let i = 0; i < 5; i ++){
            xLabels.push(moment(dates[0]).add(dateInc * i, "days").format("YYYY-MM-DD"));
        }


        let projectedAverages, projectedWeights, projectedDates;
        if (this.state.projecting > 0){
            //Get last day, add the same weight state.projecting days later, interpolate between, get averages
            projectedDates = [];
            projectedDates.push(dates[dates.length-1]);
            projectedDates.push(moment(projectedDates[0]).add(this.state.projecting, "days").format("YYYY-MM-DD"));
            projectedWeights = [];
            projectedWeights.push(weights[weights.length-1]);
            projectedWeights.push(weights[weights.length-1]);
            let tempData = interpolateDates(projectedWeights, projectedDates);

            projectedWeights = weights.concat(tempData.weights.slice(1,tempData.weights.length));
            projectedDates = dates.concat(tempData.dates.slice(1,tempData.dates.length));

            projectedAverages = calcAverages(weights.length, projectedWeights);

            projectedWeights = projectedWeights.slice(weights.length);
            projectedDates = projectedDates.slice(dates.length);
        }

        //Remove weights before ideal weight breakthrough
        ids = interpIndexes.slice(modStart, interpIndexes.length);
        weights = weights.slice(modStart, weights.length);
        dates = dates.slice(modStart, dates.length);
        return (
            <div id='graph-middle'>
                <div id='graph-middle-m'>
                    <div id='m-y-labels'>
                        <div className='y-label m-graph-section' id='m-date-label'>Date</div>
                        {
                            levelMap.map(y => {
                                y = (maintenanceAvgs.length - 1) - y;
                                return (
                                    <div key={y} className='y-label m-graph-section'>
                                        <div className='icons-wrap'>
                                            {this.allowedIcons(y, user.carb_ranks)}
                                        </div>
                                        <div className='y-label-weight'>{maintenanceAvgs[y] + " Days"}</div>
                                    </div>
                                )
                            })
                        }
                        <div className='y-label m-graph-section' id='m-weight-label'>Weight</div>
                    </div>
                    <div id='m-graph-display' ref='scroll'>
                        {
                            weightAvgs.map((weight, i) => {
                                let currInterpolated = false;
                                if (interpIndexes.includes(i)){
                                    currInterpolated = true;
                                }
                                return (
                                    <div className={currInterpolated ? 'm-date interpolated' : 'm-date'} key={i} style={{ width: 100/weights.length + "%" }}>
                                        <div className='graph-date'>{moment(dates[i]).format("MM-DD-YYYY")}</div>
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

                                        <form className='graph-weight' onSubmit={
                                            currInterpolated ? 
                                                (e) => this.submitWeight(e, i, dates[i], currInterpolated) 
                                            :
                                                (e) => this.submitWeight(e, i, dates[i], currInterpolated, ids[i])
                                        }>
                                            <input id={'input-number-' + i} onChange={(e) => this.changeWeight(e, i)} className='graph-weight-number' type='number' defaultValue=
                                            {
                                                user.weight_units === "Pounds" ? 
                                                    weightStringFromKg(weights[i], user.weight_units).substring(0, weightStringFromKg(weights[i], user.weight_units).length - 7)
                                                : user.weight_units === "Kilograms" ?
                                                    weightStringFromKg(weights[i], user.weight_units).substring(0, weightStringFromKg(weights[i], user.weight_units).length - 10)
                                                : null
                                            } />
                                            <input type='submit' className='weight-submit'/>
                                        </form>
                                    </div>
                                )
                            })
                        }
                        {
                            Array(this.state.projecting).fill().map((x, i) => i).map((x,i) => {
                                let weight = projectedAverages[i];
                                return (
                                    <span className='m-date projected' key={i} style={{ width: 100/weights.length + "%" }}>
                                        <div className='graph-date'>{moment(projectedDates[i]).format("MM-DD-YYYY")}</div>
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

                                        <div className='graph-weight'>
                                            <input type='number' defaultValue=
                                            {
                                                user.weight_units === "Pounds" ? 
                                                    weightStringFromKg(projectedWeights[i], user.weight_units).substring(0, weightStringFromKg(projectedWeights[i], user.weight_units).length - 7)
                                                : user.weight_units === "Kilograms" ?
                                                    weightStringFromKg(projectedWeights[i], user.weight_units).substring(0, weightStringFromKg(projectedWeights[i], user.weight_units).length - 10)
                                                : null
                                            } />
                                        </div>
                                    </span>
                                )
                            })
                        }
                        {
                            this.state.projecting === 0 ?
                                <div id='project-button' onClick={() => this.project()}>Project</div>
                            :
                                <div id='project-button' onClick={() => this.hideProjection()}>Hide</div>
                        }
                    </div>
                </div>
            </div>
        )
    }
}