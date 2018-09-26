import React, { Component } from 'react';
import { iconIndex, carbOptions, poundsToKg, interpolateDates, maintenanceAvgs, weightStringFromKg, maintenanceCarbOrder, calcAverages } from './utils';
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
            projectedWeights: null,
            projectedDates: null,
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
        let newWeight = parseInt(this.state.inputs[i], 10);
        if (interpolated){
			this.props.addWeight(this.convertWeight(newWeight), date);
        } else {
            this.props.updateWeight(this.convertWeight(newWeight), id);
        }
    }
	convertWeight(weight){
		let weightUnits = this.props.user.weight_units;
		if (weightUnits === "Pounds"){
			return poundsToKg(weight);
		}
		return weight;
	}
    project(weights, dates){
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
        let projectedWeights, projectedDates;
        //Get last day, add the same weight state.projecting days later, interpolate between
        projectedDates = [];
        projectedDates.push(dates[dates.length-1]);
        projectedDates.push(moment(projectedDates[0]).add(daysToProject, "days").format("YYYY-MM-DD"));

        projectedWeights = [];
        projectedWeights.push(weights[weights.length-1]);
        projectedWeights.push(weights[weights.length-1]);
        let tempData = interpolateDates(projectedWeights, projectedDates);

        projectedWeights = weights.concat(tempData.weights.slice(1,tempData.weights.length));
        projectedDates = dates.concat(tempData.dates.slice(1,tempData.dates.length));

        projectedWeights = projectedWeights.slice(weights.length);
        projectedDates = projectedDates.slice(dates.length);
        
        this.setState({
            projecting : daysToProject,
            projectedWeights: projectedWeights,
            projectedDates: projectedDates
        }, () => {
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
        let weights = this.props.weights;
        let dates = this.props.dates;
        let ids = this.props.ids;
        let startingIndex = this.props.startingIndex;

        let weightAvgs = calcAverages(startingIndex, weights);

        let projectedAverages, projectedWeights;
        if (this.state.projecting > 0){
            projectedWeights = this.state.projectedWeights;
            projectedAverages = calcAverages(weights.length, weights.concat(projectedWeights));
        }

        //Remove weights before ideal weight breakthrough
        ids = ids.slice(startingIndex, ids.length);
        weights = weights.slice(startingIndex, weights.length);
        dates = dates.slice(startingIndex, dates.length);

        return (
            <div className='graph-middle'>
                <div id='tab-y-labels'>
                    <div className='y-label tab-graph-section' id='tab-date-label'>Date</div>
                    {
                        levelMap.map(y => {
                            y = (maintenanceAvgs.length - 1) - y;
                            return (
                                <div key={y} className='y-label tab-graph-section'>
                                    <div className='icons-wrap'>
                                        {this.allowedIcons(y, user.carb_ranks)}
                                    </div>
                                    <div className='y-label-weight'>{maintenanceAvgs[y] + " Days"}</div>
                                </div>
                            )
                        })
                    }
                    <div className='y-label tab-graph-section' id='tab-weight-label'>Weight</div>
                </div>
                <div id='tab-graph-display' ref='scroll'>
                    {
                        weightAvgs.map((weight, i) => {
                            let currInterpolated = false;
                            if (ids[i] === null){
                                currInterpolated = true;
                            }
                            return (
                                <div className={currInterpolated ? 'tab-date interpolated' : 'tab-date'} key={i} style={{ width: 100/weights.length + "%" }}>
                                    <div className='graph-date'>{moment(dates[i]).format("YYYY-MM-DD")}</div>
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
                                            user.weight_units !== "Kilograms" ? 
                                                weightStringFromKg(weights[i], user.weight_units).substring(0, weightStringFromKg(weights[i], user.weight_units).length - 7)
                                            :
                                                weightStringFromKg(weights[i], user.weight_units).substring(0, weightStringFromKg(weights[i], user.weight_units).length - 10)
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
                                <span className='tab-date projected' key={i} style={{ width: 100/weights.length + "%" }}>
                                    <div className='graph-date'>{this.state.projectedDates[i]}</div>
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
                                        <input onChange={(e) => this.changeWeight(e, i, true)} className='graph-weight-number' type='number' value=
                                        {
                                            user.weight_units !== "Kilograms" ? 
                                                weightStringFromKg(projectedWeights[i], user.weight_units).substring(0, weightStringFromKg(projectedWeights[i], user.weight_units).length - 7)
                                            :
                                                weightStringFromKg(projectedWeights[i], user.weight_units).substring(0, weightStringFromKg(projectedWeights[i], user.weight_units).length - 10)
                                        }/>
                                    </div>
                                </span>
                            )
                        })
                    }
                    {
                        this.state.projecting === 0 ?
                            <div id='project-button' onClick={() => this.project(weights, dates)}>Project</div>
                        :
                            <div id='project-button' onClick={() => this.hideProjection()}>Hide</div>
                    }
                </div>
            </div>
        )
    }
}