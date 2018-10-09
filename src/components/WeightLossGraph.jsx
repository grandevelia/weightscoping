import React, { Component } from 'react';
import { iconIndex, carbOrder, carbOptions, weightStringFromKg,interpolateDates, poundsToKg, lossmodeLevel } from './utils';
import DatepickerArea from './DatepickerArea';
import moment from 'moment';

export default class WeightHistoryGraph extends Component{
    constructor(props){
        super(props);
        this.canvas = React.createRef();
        this.scroll = React.createRef();
        this.coordX = React.createRef();
        this.coordY = React.createRef();
        this.hover = React.createRef();

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
        }
    }
    renderGraph(scrollLeft = null){
        let scroll = this.scroll.current;
        let graphPixelsWidth = scroll.clientWidth;

        let canvas = this.canvas.current.getContext('2d');
        let graphPixelsHeight = this.canvas.current.height;
        canvas.clearRect(0, 0, this.canvas.current.width, this.canvas.current.height);
        canvas.beginPath();

        let user = this.props.user;
		
        /*
        *	Percentage height of graph for each level
        *	Total height expressed in terms of graph height
        *	Zero all weights by subtracting minWeight
        *
        *	Each section is 1/numSections of zeroed initialWeight kg
        *	In terms of percentage of graph height, each section is (initial - min) / (numSections * range)
        */

        let numLevels = 8;
        let levelMap = Array( numLevels ).fill().map((x,i) => i);
        let initialWeight = this.props.weights[this.props.startingIndex];
    
        //Divide by numLevels here since there are numSections - 1 = numLevels increments between the sections
        let kgPerSection = (initialWeight - user.ideal_weight_kg)/numLevels;

        let allWeights = this.state.pastWeights.concat(this.props.weights).concat(this.state.futureWeights);
        let allDates = this.state.pastDates.concat(this.props.dates).concat(this.state.futureDates);
        let daysInFrame = Math.ceil(this.state.graphEnd.diff(this.state.graphStart, "days", true));
        let globalMax = 1.02 * Math.max(...allWeights);
        let globalMin = 0.98 * Math.min(user.ideal_weight_kg * 0.95, ...this.props.weights, ...this.state.futureWeights);

        //Extra height if user has weights above starting weight
        let portionAboveStarting = ( (globalMax - globalMin) - (initialWeight - globalMin) ) / ( globalMax - globalMin );

        //Extra height for portion below ideal weight
        let portionBelowIdeal = (user.ideal_weight_kg - globalMin) / (globalMax - globalMin);

        //Height per level section (note there are 2 sections in level 0)
        let portionPerSection = (1 - portionAboveStarting - portionBelowIdeal)/8;

        //Portion of graph taken up by each day
        let sectionPercent = 1/daysInFrame;

        let rectBottom = 0;
        canvas.strokeStyle = "rgb(0, 0, 0)";
        let monthOpacity = ["0.7", "0.4"];
        levelMap.map(y => {
            let yWeight = initialWeight - (y + 1) * kgPerSection;
            let rectHeight;
            if (y === 0){
                yWeight += kgPerSection;     
                rectHeight = (portionAboveStarting + 2 * portionPerSection) * graphPixelsHeight;
            } else if (y !== levelMap[levelMap.length - 1]){
                rectHeight = portionPerSection * graphPixelsHeight;
            } else {
                rectHeight = portionBelowIdeal * graphPixelsHeight;
            }
            allWeights.map((weight, i) => {
                let currLeft = graphPixelsWidth * sectionPercent * i;
                let monthIndex = moment(allDates[i]).month() % 2;
                if (i >= this.state.pastProjecting){
                    canvas.fillStyle = 'rgba(213, 25, 50, ' + monthOpacity[monthIndex] + ')';
                    if (weight < yWeight){
                        canvas.fillStyle = 'rgba(55, 119, 236, ' + monthOpacity[monthIndex] + ')';
                    }
                } else {
                    canvas.fillStyle = 'rgba(170,170,170, ' + monthOpacity[monthIndex] + ')';
                }
                canvas.fillRect(currLeft, rectBottom, graphPixelsWidth * sectionPercent - 1, rectHeight - 1);
                return "";
            })
            rectBottom += rectHeight;
            return "";
        });
        let endIndex = 0;
        let currentFutureWeights = this.props.weights.concat(this.state.futureWeights)
        currentFutureWeights.map((weight, i) => {
            let currLeft = graphPixelsWidth * sectionPercent * (i + this.state.pastProjecting);
            //Line graph
            if (i !== 0 ){
                canvas.moveTo(currLeft + graphPixelsWidth * sectionPercent, graphPixelsHeight * ((globalMax - globalMin) - (weight - globalMin))/(globalMax - globalMin));
                canvas.lineTo(currLeft, graphPixelsHeight * ((globalMax - globalMin) - (currentFutureWeights[i-1] - globalMin))/(globalMax - globalMin));
            } else {
                canvas.moveTo(currLeft + graphPixelsWidth * sectionPercent, graphPixelsHeight * ((globalMax - globalMin) - (weight - globalMin))/(globalMax - globalMin));
                canvas.lineTo(currLeft, graphPixelsHeight * ((globalMax - globalMin) - (weight - globalMin))/(globalMax - globalMin));
            }
            if (this.state.graphEnd.format("YYYY-MM-DD") === allDates[i]){
                endIndex = i;
            }
            return "";
        })
        if (scrollLeft === null){
            //subtract current days in frame - 1 to end index so it appears on the right when setting scrollLeft
            endIndex -= Math.floor(this.state.graphEnd.diff(this.state.graphStart, "days", true)) - 1;
            this.scroll.current.scrollLeft = graphPixelsWidth * sectionPercent * endIndex;
        } else {
            this.scroll.current.scrollLeft = scrollLeft;
        }
        canvas.stroke();

        //If canvas width has changed, mouse coordinates may be too large and extend the size until next mouseover event
        this.coordX.current.style.left = 0;
        this.coordY.current.style.width = 0;
    }
    componentDidMount(){
        this.handleResize();
        window.addEventListener('resize', this.handleResize)
    }
    handleResize = () => {
        this.setState({
            windowHeight: window.innerHeight,
            windowWidth: window.innerWidth,
            graphX: 0
        }, () => {
            this.renderGraph();
        });
    }
    componentWillUnmount() {
        window.removeEventListener('resize', this.handleResize)
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
        } else if (weightClass === "PAST"){
            console.log("lol here boi")
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
            }, () => this.renderGraph(this.canvas.current.getBoundingClientRect().width));
        }
    }
	allowedIcons(level, carbRanks){
		if (level === 0){
			return (
				<div className='allowed-icons'>
					<div className='icon icon-allowed' id='non-incentive-icon'>
						<div className='icon-description'>Non Incentive Food</div>
					</div>
				</div>
			)
		}
		let indexArr = Array( level ).fill().map((x,i) => i);
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
	disallowedIcons(level, carbRanks) {
        let arr = Array( carbOptions.length - level ).fill().map((x,i) => level + i);
        
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
    showGraphLines = (e) => {
        let canvasBox = this.canvas.current.getBoundingClientRect();
        
        //Mouse position relative to scrolled canvas left
        let mouseX = e.clientX - canvasBox.left;

        let allWeights = this.state.pastWeights.concat(this.props.weights).concat(this.state.futureWeights);

        let boundingWidth = allWeights.length;
        let weightIndex = Math.floor(boundingWidth * mouseX/canvasBox.width);

        //When past projecting
        if (weightIndex >= allWeights.length){
            weightIndex = allWeights.length - 1;
        } else if (weightIndex < 0){
            weightIndex = 0;
        }

        let lineX = canvasBox.width * (weightIndex+1) / boundingWidth;

        let currWeight = allWeights[weightIndex];

        let minWeight = 0.98 * Math.min(0.95 * this.props.user.ideal_weight_kg, ...this.props.weights, ...this.state.futureWeights);
        let maxWeight = 1.02 * Math.max(...allWeights);
        let lineY;
        if (weightIndex >= this.state.pastProjecting){
            lineY = Math.max(canvasBox.height * (currWeight - minWeight)/(maxWeight - minWeight), 0);
        } else {
            lineY = canvasBox.height;
        }

        if (weightIndex !== this.state.hoverIndex){
            this.setState({lineX: lineX, lineY: lineY, hoverIndex: weightIndex});
        }
    }
    clickAddWeight = (e) => {
        this.setState({
            showClickAddWeight: true,
            addWeightTop: e.clientY - this.canvas.current.getBoundingClientRect().top,
            addWeightLeft: this.state.lineX,
            addWeightIndex: this.state.hoverIndex
        })
    }
    closeAdder(){
        this.setState({showClickAddWeight: false});
    }
    render(){
        let user = this.props.user;
        let allWeights = this.state.pastWeights.concat(this.props.weights.concat(this.state.futureWeights));
        let allDates = this.state.pastDates.concat(this.props.dates.concat(this.state.futureDates));
        let allIds = Array(this.state.pastProjecting).fill().map(x => {return null}).concat(this.props.ids).concat(Array(this.state.futureProjecting).fill().map(x => {return null}));
        let initialWeight = this.props.weights[this.props.startingIndex];

        let daysInFrame = Math.ceil(this.state.graphEnd.diff(this.state.graphStart, "days", true));

        let canvasWidth = window.innerWidth * 0.975 * 0.975;
        let canvasHeight = window.innerHeight * 0.95 * 0.92 * 0.90;

        let dayRatio = canvasWidth/daysInFrame;

        if (allWeights.length > daysInFrame){
            canvasWidth = dayRatio * (allWeights.length);
        }
        let level = lossmodeLevel(initialWeight, user.ideal_weight_kg, allWeights[this.state.hoverIndex]);
        return (
            <div id='graph-area'>
                <div id='graph-top'>
                    <div id='axis-labels' className='axis-labels'>
                        <div className='axis-label'>Allowed</div>
                        <div className='axis-label'>Not Allowed</div>
                        <div className='axis-label' id='weight-axis-label'>Weight</div>
                    </div>
                    <div id='graph-view-options'>
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
                <div className='graph-middle' id='weight-loss-graph'>
                    {
                        this.state.hoverIndex >= this.state.pastProjecting ? 

                            <div id='graph-hover'>
                                <div id='graph-hover-weight'>{weightStringFromKg(allWeights[this.state.hoverIndex], user.weight_units)}</div>
                                <div id='graph-hover-date'>{allDates[this.state.hoverIndex]}</div>
                                <div id='graph-hover-level'>{"Level " + level}</div>
                                <div id='graph-hover-allowed'>
                                    <div className='graph-hover-allowed-title'>Allowed</div>
                                    <div className='graph-hover-icons'>
                                        {this.allowedIcons(level, user.carb_ranks)}
                                    </div>
                                </div>
                                <div id='graph-hover-allowed'>
                                    <div className='graph-hover-allowed-title'>Not Allowed</div>
                                    <div className='graph-hover-icons'>
                                        {this.disallowedIcons(level, user.carb_ranks)}
                                    </div>
                                </div>

                                {
                                    allIds[this.state.hoverIndex] === null ?
                                        <div id='graph-hover-interpolated'>Estimated Weight</div>
                                    : null
                                }

                            </div>
                        :
                            <div id='graph-hover'>
                                <div id='graph-hover-weight'>Empty Weight</div>
                                <div id='graph-hover-date'>{allDates[this.state.hoverIndex]}</div>
                                <div id='click-hint'>Click the graph to add a weight</div>
                            </div>
                    }
                        
                    <div id='graph-scroller' ref={this.scroll}>
                        <div id='dates-container' style={{width: canvasWidth}}>
                            {
                                allDates.map((date,i) => {
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
                        <canvas id='tab-graph-display' style={{width: canvasWidth}} ref={this.canvas} width={canvasWidth} height={canvasHeight} onMouseMove={(e) => this.showGraphLines(e)} onClick={(e) => this.clickAddWeight(e)}></canvas>
                        <div id='weight-input-container' style={{width: canvasWidth}}>
                            {
                                dayRatio > 85 ?
                                    allWeights.map((weight,i) => {
                                        if (i < this.state.pastProjecting){
                                            return (
                                                <form key={i} className='graph-weight' onSubmit={(e) => this.props.addWeight(this.convertWeight(e.target.value), allDates[i])}>
                                                    <input  className='graph-weight-number' type='number' step="0.01" defaultValue=""/>
                                                    <input type='submit' className='weight-submit' />
                                                </form>
                                            )
                                        } else if (i < this.state.pastProjecting + this.props.weights.length){
                                            let weightString = weightStringFromKg(weight, user.weight_units);
                                            return (
                                                <form key={i} className='graph-weight' onSubmit={
                                                    allIds[i] === null ? 
                                                        (e) => this.submitWeight(e, i, allDates[i]) 
                                                    :
                                                        (e) => this.submitWeight(e, i, allDates[i], allIds[i])
                                                }>
                                                    <input onChange={(e) => this.changeWeight(e, i)} className='graph-weight-number' type='number' step="0.01" defaultValue=
                                                    {
                                                        user.weight_units !== "Kilograms" ? 
                                                            weightString.substring(0, weightString.length - 7)
                                                        :
                                                            weightString.substring(0, weightString.length - 10)
                                                    } />
                                                    <input type='submit' className='weight-submit'/>
                                                </form>
                                            )
                                        } else {
                                            let weightString = weightStringFromKg(weight, user.weight_units);
                                            return (
                                                <div key={i} className='graph-weight future-graph-weight'>
                                                    <input onChange={(e) => this.changeWeight(e, i - this.props.weights.length - this.state.pastProjecting, "FUTURE")} className='graph-weight-number' type='number' step="0.01" value=
                                                    {
                                                        user.weight_units !== "Kilograms" ? 
                                                            weightString.substring(0, weightString.length - 7)
                                                        :
                                                            weightString.substring(0, weightString.length - 10)
                                                    }/>
                                                </div>
                                            )
                                        }
                                    })
                                :
                                    null
                            }
                        </div>
                        <div id='mouse-coordinate-x' style={{left: this.state.lineX, height: this.state.lineY}} ref={this.coordX} onClick={(e) => this.clickAddWeight(e)}></div>
                        <div id='mouse-coordinate-y' style={{width: this.state.lineX, bottom: "calc(" + this.state.lineY + "px + 5%)"}} ref={this.coordY}></div>
                        <div id='click-adder' className={this.state.showClickAddWeight ? "show" : ""} style={{left: this.state.addWeightLeft, top: this.state.addWeightTop - 0.125 * canvasHeight}}>
                            <div id='adder-close' onClick={() => this.closeAdder()}><i className='fa fa-times'></i></div>
                            <div id='click-adder-title'>
                                {
                                    allIds[this.state.addWeightIndex] === null ?
                                        "Add a weight for " + allDates[this.state.addWeightIndex]
                                    :
                                        "Change weight for " + allDates[this.state.addWeightIndex] + " from " + weightStringFromKg(allWeights[this.state.addWeightIndex], user.weight_units) + " to: "
                                }
                            </div>
                            {
                                this.state.addWeightIndex >= this.state.pastProjecting + this.props.weights.length ?

                                    <input onChange={(e) => this.changeWeight(e, this.state.addWeightIndex - (this.state.pastProjecting + this.props.weights.length), "FUTURE")} className='graph-weight-number' type='number' step="0.01"/>

                                : allIds[this.state.addWeightIndex] === null ? 
                                    <form className='graph-weight' onSubmit={(e) => this.submitWeight(e, this.state.addWeightIndex, allDates[this.state.addWeightIndex])}>
                                        <input onChange={(e) => this.changeWeight(e, this.state.addWeightIndex)} className='graph-weight-number' type='number' step="0.01" />
                                        <input type='submit' className='weight-submit'/>
                                    </form>
                                        
                                :
                                    <form className='graph-weight' onSubmit={(e) => this.submitWeight(e, this.state.addWeightIndex, allDates[this.state.addWeightIndex], allIds[this.state.addWeightIndex])}>
                                        <input onChange={(e) => this.changeWeight(e, this.state.addWeightIndex)} className='graph-weight-number' type='number' step="0.01" />
                                        <input type='submit' className='weight-submit'/>
                                    </form>
                            }
                        </div>
                    </div>
                </div>
            </div>
        )
    }
}