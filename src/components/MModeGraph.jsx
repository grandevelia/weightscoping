import React, { Component } from 'react';
import { iconIndex, carbOptions, poundsToKg, interpolateDates, maintenanceAvgs, weightStringFromKg, maintenanceCarbOrder, calcAverages } from './utils';
import DatepickerArea from './DatepickerArea';
import moment from 'moment';

export default class WeightHistoryGraph extends Component {
    constructor(props){
        super(props);
        /*
        this.scroll = React.createRef();
        this.graph = React.createRef();

        let numInputs = moment().diff(moment(props.weights[0].date_added), 'days');
        let inputState = {};
        for (let i = 0; i < numInputs; i ++){
            inputState[i] = "";
        }
        this.showDatePicker = this.showDatePicker.bind(this);
        this.setDateRange = this.setDateRange.bind(this);
        let projectionData = this.futureProject(6);
        
        this.state = {
            inputs: inputState,
            showDatePicker: false,
            graphStart: moment().subtract(14, "days"),
            graphEnd: moment(),
            futureProjecting : projectionData.futureProjecting,
            futureWeights: projectionData.futureWeights,
            futureDates: projectionData.futureDates,
            pastProjecting : 0,
            pastWeights: [],
            pastDates: [],
            lineX: 0,
            lineY: 0,
            hoverIndex: 0,
            windowHeight: 0,
            windowWidth: 0,
            showClickAddWeight: false,
            addWeightTop: 0,
            addWeightLeft: 0,
            addWeightIndex: 0
        }*/
    }
    /*
    componentDidMount(){
        this.scroll.current.scrollLeft = 1000000000000000;
    }
    renderGraph(scrollLeft = 0){
        this.scroll.current.scrollLeft = scrollLeft;
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
    showDatePicker(status){
        this.setState({showDatePicker: status});
    }
    setDateRange(start, end){
        let futureProjecting = this.state.futureProjecting;
        let futureWeights = this.state.futureWeights;
        let futuresDates = this.state.futureDates;

        let pastProjecting = this.state.pastProjecting;
        let pastWeights = this.state.pastWeights;
        let pastDates = this.state.pastDates;

        if (end.isAfter(moment())){
            let data = this.futureProject(Math.ceil(end.diff(moment(), "days", true)));
            if (data === null){
                alert("Invalid Date");
                return;
            }
            futureProjecting = data.futureProjecting;
            futureWeights = data.futureWeights;
            futuresDates = data.futureDates;
        }

        let currStart = moment(this.props.dates[0]);
        if (currStart.isAfter(start)){
            pastProjecting = Math.floor(currStart.diff(start, "days", true));
            pastWeights = Array(pastProjecting).fill().map(x => {return 0});
            pastDates = [];
            for (let i = 1; i <= pastProjecting; i ++){
                let newDate = currStart.subtract(1, "days").format("YYYY-MM-DD");
                pastDates.unshift(newDate);
            }
        } else {
            pastProjecting = 0;
            pastWeights = [];
            pastDates = [];
        }

        this.setState({
            graphStart: start,
            graphEnd: end,
            showDatePicker: false,
            futureProjecting : futureProjecting,
            futureWeights: futureWeights,
            futureDates: futuresDates,
            pastProjecting: pastProjecting,
            pastWeights: pastWeights,
            pastDates: pastDates,
            hoverIndex: 0
        }, () => this.renderGraph());
    }
    changeWeight(e, i, weightClass="STANDARD"){
        e.preventDefault();
        if (weightClass === "STANDARD"){
            let newInputs = this.state.inputs;
            newInputs[i] = e.target.value;
            this.setState({inputs: newInputs}, () => this.renderGraph());
        } else if (weightClass === "FUTURE"){
            let newProjection = this.state.futureWeights;
            let targetWeight = this.convertWeight(parseInt(e.target.value,10));
            if(!targetWeight){
                targetWeight = 0;
            }
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
            this.setState({futureWeights: newProjection}, () => this.renderGraph());
        }
    }
	convertWeight(weight){
		let weightUnits = this.props.user.weight_units;
		if (weightUnits === "Pounds"){
			return poundsToKg(weight);
		}
		return weight;
	}
    submitWeight(e, i, date, id=null){
        e.preventDefault();
        if (this.state.inputs[i] === ""){
            return
        }
        let newWeight = parseInt(this.state.inputs[i], 10);
        if (id === null){
            this.props.addWeight(this.convertWeight(newWeight), date)
            .then(() => {
                this.renderGraph(this.scroll.current.scrollLeft);
            })
        } else {
            this.props.updateWeight(this.convertWeight(newWeight), id)
            .then(() => {
                this.renderGraph(this.scroll.current.scrollLeft);
            })
        }
    }
    scaleGraph(n){
        let end = this.state.graphEnd.clone();
        let start = this.state.graphEnd.subtract(n, "days");
        this.setDateRange(start, end);
    }
    futureProject(daysToProject, setState=false){
        let weights = this.props.weights;
        let dates = this.props.dates;
        if (isNaN(daysToProject)){
            return null;
        }
        if (daysToProject > 30){
            daysToProject = 30;
        }
        if (daysToProject < 1){
            daysToProject = 1;
        }
        let futureWeights, futureDates;
        //Get last day, add the same weight state.projecting days later, interpolate between
        futureDates = [];
        futureDates.push(dates[dates.length-1]);
        futureDates.push(moment(futureDates[0]).add(daysToProject, "days").format("YYYY-MM-DD"));

        futureWeights = [];
        futureWeights.push(weights[weights.length-1]);
        futureWeights.push(weights[weights.length-1]);
        let tempData = interpolateDates(futureWeights, futureDates);

        futureWeights = weights.concat(tempData.weights.slice(1,tempData.weights.length));
        futureDates = dates.concat(tempData.dates.slice(1,tempData.dates.length));

        futureWeights = futureWeights.slice(weights.length);
        futureDates = futureDates.slice(dates.length);
        if (!setState){
            return {
                futureProjecting : daysToProject,
                futureWeights: futureWeights,
                futureDates: futureDates
            };
        } else {
            this.setState({
                futureProjecting : daysToProject,
                futureWeights: futureWeights,
                futureDates: futureDates
            }, () => this.renderGraph(this.graph.current.getBoundingClientRect().width));
        }
    }
    clickAddWeight = (e) => {
        this.setState({
            showClickAddWeight: true,
            addWeightTop: e.clientY - this.graph.current.getBoundingClientRect().top,
            addWeightLeft: this.state.lineX,
            addWeightIndex: this.state.hoverIndex
        })
    }
    closeAdder(){
        this.setState({showClickAddWeight: false});
    }
    showGraphLines = (e) => {
        let graphBox = this.graph.current.getBoundingClientRect();
        
        //Mouse position relative to scrolled graph left
        let mouseX = e.clientX - graphBox.left;

        let allWeights = this.state.pastWeights.concat(this.props.weights).concat(this.state.futureWeights);

        let boundingWidth = allWeights.length;
        let weightIndex = Math.floor(boundingWidth * mouseX/graphBox.width);

        //When past projecting
        if (weightIndex >= allWeights.length){
            weightIndex = allWeights.length - 1;
        } else if (weightIndex < 0){
            weightIndex = 0;
        }

        let lineX = graphBox.width * (weightIndex+1) / boundingWidth;

        let currWeight = allWeights[weightIndex];

        let minWeight = 0.98 * Math.min(0.95 * this.props.user.ideal_weight_kg, ...this.props.weights, ...this.state.futureWeights);
        let maxWeight = 1.02 * Math.max(...allWeights);
        let lineY;
        if (weightIndex >= this.state.pastProjecting){
            lineY = Math.max(graphBox.height * (currWeight - minWeight)/(maxWeight - minWeight), 0);
        } else {
            lineY = graphBox.height;
        }

        if (weightIndex !== this.state.hoverIndex){
            this.setState({lineX: lineX, lineY: lineY, hoverIndex: weightIndex});
        }
    }
    clickAddWeight = (e) => {
        this.setState({
            showClickAddWeight: true,
            addWeightTop: e.clientY - this.graph.current.getBoundingClientRect().top,
            addWeightLeft: this.state.lineX,
            addWeightIndex: this.state.hoverIndex
        })
    }*/
    render(){
        /*let user = this.props.user;
        let numLevels = maintenanceAvgs.length;
        let levelMap = Array( numLevels ).fill().map((x,i) => i);
        let weights = this.state.pastWeights.concat(this.props.weights.concat(this.state.futureWeights));
        let dates = this.state.pastDates.concat(this.props.dates.concat(this.state.futureDates));
        let ids = Array(this.state.pastProjecting).fill().map(x => {return null}).concat(this.props.ids).concat(Array(this.state.futureProjecting).fill().map(x => {return null}));

        let daysInFrame = Math.ceil(this.state.graphEnd.diff(this.state.graphStart, "days", true));
        let weightAvgs = calcAverages(0, weights);

        let graphWidth = window.innerWidth * 0.975 * 0.975 * 0.85;
        let graphHeight = window.innerHeight * 0.95 * 0.92 * 0.90;

        let dayRatio = graphWidth/daysInFrame;
        if (weights.length > daysInFrame){
            graphWidth = dayRatio * (weights.length);
        }
        */
        return (
            <div id='graph-area'>
            {/*
                <div id='graph-top'>
                    <div id='graph-view-options'>
                        <div className='view-section'>
                            <div className='axis-label'>Allowed</div>
                            <div className='axis-label' id='weight-axis-label'>Days of Average</div>
                        </div>
                        <div className='view-section'>
                            <div className='view-section-option' onClick={() => this.showDatePicker(true)}>
                                Date Range
                                <div id='calendar-container'>
                                    <i className='fa fa-calendar'></i>
                                </div>
                            </div>
                            {
                                this.state.showDatePicker ? 
                                    <DatepickerArea setDateRange={this.setDateRange} showDatePicker={this.showDatePicker}/>
                                :
                                null
                            }
                        </div>
                        <div className='view-section' id='past-view-section'>
                            <div className='view-section-title'>Past</div>
                            <div className='view-section-option' onClick={() => this.scaleGraph(7)}>7D</div>
                            <div className='view-section-option' onClick={() => this.scaleGraph(30)}>1M</div>
                            <div className='view-section-option' onClick={() => this.scaleGraph(182)}>6M</div>
                            <div className='view-section-option' onClick={() => this.scaleGraph(moment().dayOfYear())}>YTD</div>
                            <div className='view-section-option' onClick={() => this.scaleGraph(365)}>1Y</div>
                            <div className='view-section-option' onClick={() => this.scaleGraph( Math.ceil(moment().diff(this.props.dates[0], "days", true) ) )}>Max</div>
                        </div>
                        <div className='view-section' id='future-view-section'>
                            <div className='view-section-title'>Future</div>
                            <div className='view-section-option' onClick={() => this.futureProject(7, true)}>7D</div>
                            <div className='view-section-option' onClick={() => this.futureProject(30, true)}>1M</div>
                        </div>
                    </div>
                </div>
                <div className='graph-middle'>
                    <div id='tab-y-labels'>
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
                    </div>
                    <div id='m-graph-display' ref={this.scroll}>
                        <div id='dates-container' style={{width: graphWidth}}>
                            {
                                dates.map((date,i) => {
                                    date = moment(date);
                                    return (
                                        <div key={i} className='graph-date'>
                                        {
                                            dayRatio > 60 ?
                                                date.date() === 1 ?
                                                    date.format("MMM")
                                                :
                                                    date.format("D")
                                            : dayRatio > 30 ?
                                                date.date() === 1 ?
                                                    date.format("MMM")
                                                : i % 2 === 0 ?
                                                    date.format("D")
                                                : null
                                            : dayRatio > 15 ?
                                                date.date() === 1 ?
                                                    date.format("MMM")
                                                : date.date() % 7 === 0 ?
                                                    date.format("D")
                                                : null
                                            : dayRatio > 3 ?
                                                date.date() === 1 ?
                                                    date.month() === 0 ?
                                                        date.format("YYYY")
                                                    :
                                                        date.format("MMM")
                                                : null
                                            : dayRatio > 1 ?
                                                date.date() === 1 ?
                                                    date.month() === 0 ?
                                                        date.format("YYYY")
                                                    : date.month() % 3 === 0 ?
                                                        date.format("MMM")
                                                    : null
                                                : null
                                            : null
                                        }
                                        </div>
                                    )
                                })
                            }
                        </div>
                        <div id='graph-container' style={{width: graphWidth}} onMouseMove={(e) => this.showGraphLines(e)} onClick={(e) => this.clickAddWeight(e)} ref={this.graph}>
                        {
                            weightAvgs.map((weight, i) => {
                                let onMonth = "onMonth";
                                if (moment(dates[i]).month() % 2 === 0){
                                    onMonth = "offMonth";
                                }
                                return (
                                    <div className='tab-date' key={i}>
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
                                                    <div key={"inner"+i} className={weightOk === null ? 'avg-section no-data ' + onMonth : weightOk === true ? 'avg-section weight-ok ' + onMonth : 'avg-section weight-not-ok ' + onMonth }> 
                                                            {dayRatio > 15 ? weightString : null}
                                                    </div>
                                                )
                                            })
                                        }
                                    </div>
                                )
                            })
                        }
                        </div>
                        <div id='weight-input-container' style={{width: graphWidth}}>
                            {
                                dayRatio > 85 ?
                                    weights.map((weight,i) => {
                                        let weightString = weightStringFromKg(weight, user.weight_units);
                                        if (user.weight_units === "Pounds"){
                                            weightString = weightString.substring(0, weightString.length - 7);
                                        } else if (user.weight_units === "Kilograms"){
                                            weightString = weightString.substring(0, weightString.length - 10);
                                        }
                                        if (i < this.state.pastProjecting){
                                            return (
                                                <form key={i} className='graph-weight' onSubmit={(e) => this.props.addWeight(this.convertWeight(e.target.value), dates[i])}>
                                                    <input  className='graph-weight-number' type='number' step="0.01" defaultValue=""/>
                                                    <input type='submit' className='weight-submit' />
                                                </form>
                                            )
                                        } else if (i < this.state.pastProjecting + this.props.weights.length){
                                            return (
                                                <form key={i} className='graph-weight' onSubmit={
                                                    ids[i] === null ? 
                                                        (e) => this.submitWeight(e, i, dates[i]) 
                                                    :
                                                        (e) => this.submitWeight(e, i, dates[i], ids[i])
                                                }>
                                                    <input onChange={(e) => this.changeWeight(e, i)} className='graph-weight-number' type='number' step="0.01" defaultValue={weightString} />
                                                    <input type='submit' className='weight-submit'/>
                                                </form>
                                            )
                                        } else {
                                            return (
                                                <div key={i} className='graph-weight future-graph-weight'>
                                                    <input onChange={(e) => this.changeWeight(e, i - this.props.weights.length - this.state.pastProjecting, "FUTURE")} className='graph-weight-number' type='number' step="0.01" value={weightString} />
                                                </div>
                                            )
                                        }
                                    })
                                :
                                    null
                            }
                        </div>
                        <div id='click-adder' className={this.state.showClickAddWeight ? "show" : ""} style={{left: this.state.addWeightLeft, top: this.state.addWeightTop - 0.125 * graphHeight}}>
                            <div id='adder-close' onClick={() => this.closeAdder()}><i className='fa fa-times'></i></div>
                            <div id='click-adder-title'>
                                {
                                    ids[this.state.addWeightIndex] === null ?
                                        "Add a weight for " + dates[this.state.addWeightIndex]
                                    :
                                        "Change weight for " + dates[this.state.addWeightIndex] + " from " + weightStringFromKg(weights[this.state.addWeightIndex], user.weight_units) + " to: "
                                }
                            </div>
                            {
                                this.state.addWeightIndex >= this.state.pastProjecting + this.props.weights.length ?

                                    <input onChange={(e) => this.changeWeight(e, this.state.addWeightIndex - (this.state.pastProjecting + this.props.weights.length), "FUTURE")} className='graph-weight-number' type='number' step="0.01"/>

                                : ids[this.state.addWeightIndex] === null ? 
                                    <form className='graph-weight' onSubmit={(e) => this.submitWeight(e, this.state.addWeightIndex, dates[this.state.addWeightIndex])}>
                                        <input onChange={(e) => this.changeWeight(e, this.state.addWeightIndex)} className='graph-weight-number' type='number' step="0.01" />
                                        <input type='submit' className='weight-submit'/>
                                    </form>
                                        
                                :
                                    <form className='graph-weight' onSubmit={(e) => this.submitWeight(e, this.state.addWeightIndex, dates[this.state.addWeightIndex], ids[this.state.addWeightIndex])}>
                                        <input onChange={(e) => this.changeWeight(e, this.state.addWeightIndex)} className='graph-weight-number' type='number' step="0.01" />
                                        <input type='submit' className='weight-submit'/>
                                    </form>
                            }
                        </div>
                    </div>
                </div>
                        */}
            </div>
        )
    }
}