import React, { Component } from 'react';
import { iconIndex, carbOrder, carbOptions, weightStringFromKg, interpolateDates, poundsToKg } from './utils';
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
            projectedWeights: null,
            projectedDates: null,
            inputs: inputState
        }
    }
    componentDidMount(){
        this.refs.scroll.scrollLeft = 1000000000000000;
    }
    changeWeight(e, i, projected=false){
        if (!projected){
            let newInputs = this.state.inputs;
            newInputs[i] = e.target.value;
            this.setState({inputs: newInputs});
        } else {
            let newProjection = this.state.projectedWeights;
            let targetWeight = this.convertWeight(parseInt(e.target.value,10));
            if (i > 0){
                //When a user changes a projected weights, all weights before that day are filled
                let anchorWeight = this.props.weights[this.props.weights.length-1];
                let interpWeights = [];
                interpWeights.push(anchorWeight);
                interpWeights.push(targetWeight);

                let interpDates = [];
                let now = moment();
                interpDates.push(now.format("YYYY-MM-DD"));
                interpDates.push(now.add(i+1, "days").format("YYYY-MM-DD"));

                let interpSection = interpolateDates(interpWeights, interpDates).weights.slice(1);
                newProjection = interpSection.concat(newProjection.slice(i+1));
            } else {
                newProjection[i] = targetWeight;
            }
            this.setState({projectedWeights: newProjection});
        }
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
        }
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
        this.setState({
            projecting: 0,
            projectedWeights: null,
            projectedDates: null
        });
    }
	allowedIcons(index, carbRanks){
		if (isNaN(index)){
			return <div className='loading-icons'>Loading...</div>
		}
		if (index === 0){
			return (
				<div className='allowed-icons'>
					<div className='icon icon-allowed' id='non-incentive-icon'>
						<div className='icon-description'>Non Incentive Food</div>
					</div>
				</div>
			)
		}
		let indexArr = Array( index ).fill().map((x,i) => i);
		return (
			<div className='allowed-icons'>
				<div className='icon icon-allowed' id='non-incentive-icon'>
					<div className='icon-description'>Non Incentive Food</div>
				</div>
				{indexArr.map((x, i) => {
					let index = carbRanks[ carbOrder[ i ] ];
					return (
						<div key={i} className='icon icon-allowed' id={iconIndex[index] + "-icon"}>
							<div className='icon-description'>{carbOptions[ index ]}</div>
						</div>
					)
				})}
			</div>
		);
	}
	disallowedIcons(index, carbRanks) {
		if (isNaN(index)){
			return <div className='loading-icons'>Loading...</div>
		}
		let arr = Array( carbOptions.length - index - 1 ).fill().map((x,i) => index + i);
		return (
			<div className='disallowed-icons'>
				{arr.map(i => {
                    //For non-alcohol drinkers, carbRanks.length < than available indices
                    //With alcoholic options as the last two entries in the carbOptions array,
                    //using index only if it is < carbRanks.length avoids out of bounds errors
					if (i < carbRanks.length){
						let index = carbRanks[ carbOrder[ i ] ];
						return (
							<div key={i} className='icon icon-diallowed' id={iconIndex[index] + "-icon"}>
								<div className='icon-cross'></div>
								<div className='icon-description'>{carbOptions[ index ]}</div>
							</div>
						)
					}
					return "";
				})}
			</div>
		);
    }
    render(){
        let user = this.props.user;
        let kgPerSection, numLevels, levelMap;

        let weights = this.props.weights;
        let dates = this.props.dates;
        let ids = this.props.ids;
		
        let initialWeight = weights[this.props.startingIndex];

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
        let projectedWeights = this.state.projectedWeights;
        return (
            <div className='graph-middle' id='weight-loss-graph'>
                <div id='weightloss-tab-y-labels'>
                    {
                        levelMap.map(y => {
                            let yWeight = initialWeight - (y + 1) * kgPerSection;
                            if (y === 0){
                                yWeight += kgPerSection;
                            }
                            return (
                                <div key={y} className={'y-label graph-section graph-section-' + (y+1)}>
                                    <div className='icons-wrap'>
                                        {this.allowedIcons(y, user.carb_ranks)}
                                        {this.disallowedIcons(y, user.carb_ranks)}
                                    </div>
                                    <div className='y-label-weight'>{ weightStringFromKg( yWeight , user['weight_units'] )}</div>
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
                            let weight = this.state.projectedWeights[i];
                            return (
                                <span className='tab-date projected' key={i} style={{ width: 100/weights.length + "%" }}>
                                    <div className='graph-date'>{moment(this.state.projectedDates[i]).format("YYYY-MM-DD")}</div>
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