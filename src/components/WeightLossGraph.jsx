import React, { Component } from 'react';
import { weightStringFromKg, interpolateDates, guessWeightsToNow, calcAverages, poundsToKg} from './utils';
import moment from 'moment';

export default class WeightHistoryGraph extends Component{
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
    changeWeight(e, i){
        let newInputs = this.state.inputs;
        newInputs[i] = e.target.value;
        this.setState({inputs: newInputs});
    }
	convertWeight(weight){
		let weightUnits = this.props.user.weight_units;
		if (weightUnits === "Pounds"){
			return poundsToKg(weight);
		}
		return weight;
	}
    submitWeight(e, i, date, interpolated, id=null){
        e.preventDefault();
        if (this.state.inputs[i] === ""){
            return
        }
        let newWeight = parseInt(this.state.inputs[i], 10);
        if (interpolated === true){
			this.props.addWeight(this.convertWeight(newWeight), date);
        } else if (interpolated === false){
            this.props.updateWeight(this.convertWeight(newWeight), id);
        } else if (interpolated === "PROJECTION"){

        }
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
        let kgPerSection, numLevels, levelMap;

		let weights = []
		let dates = [];
		let ids = [];

		//Split user weight data into arrays for easier manipulation
		Object.keys(this.props.weights).map(key => {
			dates.push(this.props.weights[key]['date_added']);
			weights.push(this.props.weights[key]['weight_kg']);
			ids.push(this.props.weights[key]['id']);
		});
        
        //interpolate missing data
        let preStartWeights = weights.slice(0, user.starting_weight + 1);
        let preStartDates = dates.slice(0, user.starting_weight + 1);

        let interpData = interpolateDates(preStartWeights, preStartDates, ids);
        preStartWeights = interpData.weights;
        preStartDates = interpData.dates;
        ids = interpData.indexes;
        
        //interpolate points from user.starting_weight through end, and join previous result for averaging
        interpData = interpolateDates(weights.slice(user.starting_weight, weights.length), dates.slice(user.starting_weight, dates.length), ids);

        //Don't use first element of second array to avoid duplicate join point
        weights = preStartWeights.concat(interpData.weights.slice(1,interpData.weights.length));
        dates = preStartDates.concat(interpData.dates.slice(1,interpData.dates.length));

        //Ensure weights are present up to current day
        interpData = guessWeightsToNow(weights, dates, ids);
        weights = interpData.weights;
        dates = interpData.dates;
        ids = interpData.indexes;

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

		let initialWeight = weights[user.starting_weight];

		let maxWeight = Math.max(...weights);
		let minWeight;
		if (this.props.zeroIdeal){
			//Ensures weight points stay on the graph
			minWeight = Math.min(...weights, user['ideal_weight_kg']);
		} else {
			minWeight = Math.min(...weights);
		}

        /*
        *	Percentage height of graph for each level
        *	Total height expressed in terms of graph height
        *	Zero all weights by subtracting minWeight
        *
        *	Each section is 1/numSections of zeroed initialWeight kg
        *	In terms of percentage of graph height, each section is (initial - min) / (numSections * range)
        */

        numLevels = 8;
        levelMap = Array( numLevels ).fill().map((x,i) => i);
    
        //Divide by numLevels here since there are numSections - 1 = numLevels increments between the sections
        kgPerSection = (initialWeight - user.ideal_weight_kg)/numLevels;

        return (
            <div className='graph-middle' id='weight-loss-graph'>
                <div id='weightloss-tab-y-labels'>
                    {
                        initialWeight > user.ideal_weight_kg ?
                            levelMap.map(y => {
                                let yWeight = initialWeight - (y + 1) * kgPerSection;
                                if (y === 0){
                                    yWeight += kgPerSection;
                                }
                                return (
                                    <div key={y} className={'y-label graph-section graph-section-' + (y+1)}>
                                        <div className='icons-wrap'>
                                            {this.props.allowedIcons(y, user.carb_ranks)}
                                            {this.props.disallowedIcons(y, user.carb_ranks)}
                                        </div>
                                        <div className='y-label-weight'>{ weightStringFromKg( yWeight , user['weight_units'] )}</div>
                                    </div>
                                )
                            })
                        :
                        levelMap.map(y => {
                            let yWeight = maxWeight - y * (maxWeight - minWeight)/numLevels;
                            let currStyle = {flexBasis: 100/numLevels + "%"};
                            
                            return (
                                <div key={y} className={'y-label graph-section graph-section-' + (y+1)} style={currStyle}>
                                    <div className='y-label-weight' style={{alignItems: "flex-start"}}>{ weightStringFromKg( yWeight , user['weight_units'] )}</div>
                                </div>
                            )
                        })
                    }
                    <div className='y-label tab-graph-section' id='tab-weight-label'>Weight</div>
                </div>
                
                <div id='tab-graph-display' ref='scroll'>
                    {
                        weights.map((weight, i) => {
                            let currInterpolated = false;
                            if (ids[i] === null){
                                currInterpolated = true;
                            }
                            return (
                                <div className={currInterpolated ? 'tab-date interpolated' : 'tab-date'} key={i} style={{ width: 100/weights.length + "%" }}>
                                    <div className='graph-date'>{moment(dates[i]).format("YYYY-MM-DD")}</div>
                                    {
                                        levelMap.map(y => {
                                            let weightOk = null;
                                            let yWeight = initialWeight - (y + 1) * kgPerSection;
                                            if (y === 0){
                                                yWeight += kgPerSection;
                                            }
                                            if (weight < yWeight){
                                                weightOk = true;
                                            } else {
                                                weightOk = false;
                                            }
                                            return (
                                                <div key={"inner-"+ i + "-" + y} className={weightOk === true ? 'avg-section weight-ok' : 'avg-section weight-not-ok'}></div>
                                            )
                                        })
                                    }
                                    <form className='graph-weight' onSubmit={
                                        currInterpolated ? 
                                            (e) => this.submitWeight(e, i, dates[i], currInterpolated) 
                                        :
                                            (e) => this.submitWeight(e, i, dates[i], currInterpolated, ids[i])
                                    }>
                                        <input onChange={(e) => this.changeWeight(e, i)} className='graph-weight-number' type='number' defaultValue=
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
                                    <div className='graph-date'>{moment(projectedDates[i]).format("YYYY-MM-DD")}</div>
                                    {
                                        levelMap.map(y => {
                                            let weightOk = null;
                                            let yWeight = initialWeight - (y + 1) * kgPerSection;
                                            if (y === 0){
                                                yWeight += kgPerSection;
                                            }
                                            if (weight < yWeight){
                                                weightOk = true;
                                            } else {
                                                weightOk = false;
                                            }
                                            return (
                                                <div key={"inner-"+ i + "-" + y} className={weightOk === true ? 'avg-section weight-ok' : 'avg-section weight-not-ok'}></div>
                                            )
                                        })
                                    }

                                    <form className='graph-weight' onSubmit={(e) => this.submitWeight(e, i, dates[i], "PROJECTION")}>
                                        <input onChange={(e) => this.changeWeight(e, i)} className='graph-weight-number' type='number' defaultValue=
                                        {
                                            user.weight_units !== "Kilograms" ? 
                                                weightStringFromKg(projectedWeights[i], user.weight_units).substring(0, weightStringFromKg(projectedWeights[i], user.weight_units).length - 7)
                                            :
                                                weightStringFromKg(projectedWeights[i], user.weight_units).substring(0, weightStringFromKg(projectedWeights[i], user.weight_units).length - 10)
                                        } />
                                        <input type='submit' className='weight-submit'/>
                                    </form>
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
        )
    }
}