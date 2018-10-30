import React, { Component } from 'react';
import { iconIndex, carbOrder, carbOptions, weightStringFromKg,interpolateDates, poundsToKg, lossmodeLevel, maintenanceAvgs, calcAverages } from './utils';
import DatepickerArea from './DatepickerArea';
import moment from 'moment';

let dayLetters = ["N", "M", "T", "W", "R", "F", "S"];
export default class WeightGraph extends Component {
    constructor(props){
        super(props);
        this.canvas = React.createRef();
        this.scroll = React.createRef();
        this.coordX = React.createRef();
        this.coordY = React.createRef();
        this.hover = React.createRef();

        let inputs = [];
        for (let i = 0; i < props.weights.length; i ++){
            inputs.push(parseFloat(weightStringFromKg(props.weights[i], props.user.weight_units)))
        }
        this.showDatePicker = this.showDatePicker.bind(this);
        this.setDateRange = this.setDateRange.bind(this);
        let projectionData = this.futureProject(7);
        
        this.state = {
            inputs: inputs,
            showDatePicker: false,
            daysInFrame: 14,
            frameEndIndex: props.weights.length + projectionData.futureProjecting - 1,
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
        let graphPixelsWidth = scroll.getBoundingClientRect().width;

        let canvas = this.canvas.current.getContext('2d');
        let graphPixelsHeight = this.canvas.current.height;
        canvas.clearRect(0, 0, this.canvas.current.width, graphPixelsHeight);
        canvas.beginPath();

        let weights = this.state.pastWeights.concat(this.props.weights).concat(this.state.futureWeights);
        let dates = this.state.pastDates.concat(this.props.dates).concat(this.state.futureDates);
        
        let weightsInFrame;
        if (this.state.daysInFrame < this.props.weights.length){
            weightsInFrame = weights.slice(this.state.frameEndIndex - this.state.daysInFrame, this.state.frameEndIndex);
        } else {
            weightsInFrame = weights.slice(this.state.pastProjecting);
        }
    
        let frameMax = 1.02 * Math.max(...weightsInFrame);
        let frameMin = 0.98 * Math.min(...weightsInFrame);
        
        //Horizontal portion of canvas taken up by each day
        let dayPercent = 1/this.state.daysInFrame;

        canvas.strokeStyle = "rgb(0, 0, 0)";
        let monthOpacity = ["0.6", "0.9"];
        let compDate = moment(this.props.dates[0]).subtract(1, "days");
        
        //Line graph
        weights.map((weight, i) => {
            let currDate = moment(dates[i]);
            let dayMod = 1;
            let monthIndex = currDate.month() % 2;
            canvas.fillStyle = 'rgba(170,170,170, ' + monthOpacity[monthIndex] + ')';
            let currLeft;
            if (currDate.isAfter(moment())){
                currLeft = graphPixelsWidth * dayPercent * (i + 1);
            } else if (currDate.format("YYYY-MM-DD") === moment().format("YYYY-MM-DD")){
                dayMod = 2;
                canvas.fillStyle = 'rgb(55, 157, 236)';
                currLeft = graphPixelsWidth * dayPercent * i;
            } else {
                currLeft = graphPixelsWidth * dayPercent * i;
            }

            canvas.fillRect(currLeft, 0, dayMod * graphPixelsWidth * dayPercent - 1, graphPixelsHeight);

            //Only draw lines for weights added by user or projected into future
            if (currDate.isAfter(compDate)){
                canvas.moveTo(currLeft + dayMod * graphPixelsWidth * dayPercent, graphPixelsHeight * ( frameMax - weight )/( frameMax - frameMin ));

                if (i !== this.state.pastProjecting ){
                    canvas.lineTo(currLeft, graphPixelsHeight * ( frameMax - weights[i-1] )/( frameMax - frameMin ) );
                } else {
                    canvas.lineTo(currLeft, graphPixelsHeight * ( frameMax - weight )/(frameMax - frameMin));
                }
            }
            return "";
        })
        if (scrollLeft === null){
            let daysInFrame = this.state.daysInFrame;
            let graphWidth =  this.canvas.current.getBoundingClientRect().width;
            console.log(graphWidth)
            let pxPerDay = window.innerWidth * 0.975 * 0.975/daysInFrame;
            let newLeft = (weights.length - 2*this.state.futureProjecting) * pxPerDay;
            scrollLeft = newLeft;
        }
        this.scroll.current.scrollLeft = scrollLeft;
        canvas.stroke();

        //If canvas width has changed, mouse coordinates may be too large and extend the size until next mouseover event
        this.coordX.current.style.left = 0;
        this.coordY.current.style.width = 0;
    }
    componentDidMount(){
        this.handleResize();
        window.addEventListener('resize', this.handleResize);
    }
    handleResize = () => {
        this.setState({
            windowHeight: window.innerHeight,
            windowWidth: window.innerWidth,
            lineX: 0
        }, () => {
            this.renderGraph();
        });
    }
    handleScroll = () => {
        let scroll = this.scroll.current;
        let weights = this.state.pastWeights.concat(this.props.weights).concat(this.state.futureWeights);
        let startIndex = this.state.endIndez - this.state.daysInFrame;
        let newStartIndex = Math.floor(weights.length * scroll.scrollLeft/this.canvas.current.width);
        if (newStartIndex !== startIndex){
            this.setState({
                frameEndIndex: newStartIndex + this.state.daysInFrame
            }, () => {
                this.renderGraph(this.scroll.current.scrollLeft);
            });
        }
    }
    componentWillUnmount() {
        window.removeEventListener('resize', this.handleResize);
    }
    showDatePicker(status){
        this.setState({showDatePicker: status});
    }
    scaleGraph(n){
        let end;
        if (this.state.futureProjecting > 0){
            end = moment(this.state.futureDates[this.state.futureDates.length - 1]);
        } else {
            end = moment();
        }
        let start = end.clone().subtract(n, "days");
        this.setDateRange(start, end);
    }
    setDateRange(start, end){
        if (moment(this.props.dates[0]).isAfter(end)){
            end = moment(this.props.dates[0]);
            alert("You must keep at least 1 added weight in the window");
        }
        let futureProjecting = this.state.futureProjecting;
        let futureWeights = this.state.futureWeights;
        let futuresDates = this.state.futureDates;

        let pastProjecting = this.state.pastProjecting;
        let pastWeights = this.state.pastWeights;
        let pastDates = this.state.pastDates;

        let frameEndIndex = this.state.frameEndIndex;

        let daysInFrame = Math.ceil(end.diff(start, "days", true));
        if (end.isAfter(moment())){
            let daysInFuture = Math.ceil(end.diff(moment(), "days", true));
            let data = this.futureProject(daysInFuture);
            if (data === null){
                alert("Invalid Date");
                return;
            }
            futureProjecting = data.futureProjecting;
            futureWeights = data.futureWeights;
            futuresDates = data.futureDates;
            frameEndIndex = frameEndIndex + daysInFuture - this.state.futureProjecting;
        } else {
            frameEndIndex = this.state.pastProjecting + this.props.dates.length - Math.ceil(moment(this.props.dates[this.props.dates.length - 1]).diff(end, "days", true)) - 1;
        }

        let currStart = moment(this.props.dates[0]);
        if (currStart.isAfter(start)){
            pastProjecting = Math.floor(currStart.diff(start, "days", true));

            frameEndIndex = frameEndIndex + pastProjecting - this.state.pastProjecting;
            pastWeights = Array(pastProjecting).fill().map(x => {return 0});
            pastDates = [];
            for (let i = 1; i <= pastProjecting; i ++){
                let newDate = currStart.clone().subtract(i, "days").format("YYYY-MM-DD");
                pastDates.unshift(newDate);
            }
        } else {
            pastProjecting = 0;
            pastWeights = [];
            pastDates = [];
        }

        let frameWidth = window.innerWidth * 0.975 * 0.975;
        let pxPerDay = frameWidth/daysInFrame;
        
        if (pxPerDay < 30){
            let pastAddition = Math.ceil(0.075 * frameWidth/pxPerDay);
            pastProjecting += pastAddition;
            if (pastDates.length){
                currStart = moment(pastDates[0]);
            } else {
                currStart = moment(this.props.dates[0]);
            }
            for (let i = 1; i <= pastAddition; i ++){
                let newDate = currStart.clone().subtract(i, "days").format("YYYY-MM-DD");
                pastDates.unshift(newDate);
                pastWeights.unshift(0);
            }
        }
        if (daysInFrame > frameEndIndex){
            frameEndIndex = daysInFrame;
        }
        this.setState({
            daysInFrame: daysInFrame,
            frameEndIndex: frameEndIndex,
            showDatePicker: false,
            futureProjecting : futureProjecting,
            futureWeights: futureWeights,
            futureDates: futuresDates,
            pastProjecting: pastProjecting,
            pastWeights: pastWeights,
            pastDates: pastDates,
            hoverIndex: 0,
            addWeightIndex: 0,
            addWeightLeft: 0
        }, () => this.renderGraph());
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
                daysInFrame: this.state.daysInFrame - this.state.futureProjecting + daysToProject,
                futureWeights: futureWeights,
                futureDates: futureDates,
                hoverIndex: 0
            }, () => this.renderGraph());
        }
    }
    changeWeight(e, i, weightClass="STANDARD"){
        e.preventDefault();
        if (weightClass === "STANDARD"){
            let newInputs = this.state.inputs;
            newInputs[i] = e.target.value;
            this.setState({inputs: newInputs}, () => this.renderGraph(this.scroll.current.scrollLeft));
        } else if (weightClass === "FUTURE"){
            let newProjection = this.state.futureWeights;
            let targetWeight = this.convertWeight(e.target.value);
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
                interpDates.push(now);
                interpDates.push(now.clone().add(i+1, "days").format("YYYY-MM-DD"));

                let interpSection = interpolateDates(interpWeights, interpDates).weights.slice(1);
                newProjection = interpSection.concat(newProjection.slice(i+1));
            } else {
                newProjection[i] = targetWeight;
            }
            this.setState({futureWeights: newProjection}, () => this.renderGraph(this.scroll.current.scrollLeft));
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

        let newWeight = this.state.inputs[i];
        if (id === null){
            this.props.addWeight(this.convertWeight(newWeight), date)
            .then(() => {
                this.setState({showClickAddWeight: false}, () => {
                    this.futureProject(this.state.futureProjecting, true);
                    this.renderGraph(this.scroll.current.scrollLeft);
                })
            })
        } else {
            this.props.updateWeight(this.convertWeight(newWeight), id)
            .then(() => {
                this.setState({showClickAddWeight: false}, () => {
                    this.futureProject(this.state.futureProjecting, true);
                    this.renderGraph(this.scroll.current.scrollLeft);
                })
            })
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
    levelIcon(index, carbRanks, allowed){

		if (isNaN(index)){
			return <div className='loading-icons'>Loading...</div>
        }
        let innerIndex = carbRanks[ carbOrder[ index ] ];
        if (allowed){
            return (
                <div className='allowed-icons'>
                    {
                        index !== 6 ? 
                            <div className='icon icon-allowed' id={iconIndex[ innerIndex ] + "-icon"}>
                                <div className='icon-description'>{carbOptions[ innerIndex ]}</div>
                            </div>
                        :
                            Array( carbRanks.length - index).fill().map( (x, j) => j + index).map(j => {
                                innerIndex = carbRanks[ carbOrder[ j ] ];
                                return (
                                    <div key={j} className='icon icon-allowed' id={iconIndex[innerIndex] + "-icon"}>
                                        <div className='icon-description'>{carbOptions[ innerIndex ]}</div>
                                    </div>
                                )
                            })
                    }
                </div>
            );
        } else {
            return (
                <div className='disallowed-icons'>
                    {
                        index !== 6 ? 
                            <div className='icon icon-disallowed' id={iconIndex[ innerIndex ] + "-icon"}>
                                <div className='icon-cross'></div>
                                <div className='icon-description'>{carbOptions[ innerIndex ]}</div>
                            </div>
                        :
                            Array( carbRanks.length - index).fill().map( (x, j) => j + index).map(j => {
                                innerIndex = carbRanks[ carbOrder[ j ] ];
                                return (
                                    <div key={j} className='icon icon-disallowed' id={iconIndex[innerIndex] + "-icon"}>
								        <div className='icon-cross'></div>
                                        <div className='icon-description'>{carbOptions[ innerIndex ]}</div>
                                    </div>
                                )
                            })
                    }
                </div>
            );
        }
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
        
        let weights = this.state.pastWeights.concat(this.props.weights).concat(this.state.futureWeights);
        let dates = this.state.pastDates.concat(this.props.dates).concat(this.state.futureDates);

        let boundingWidth = weights.length + 1;
        let weightIndex = Math.floor(boundingWidth * mouseX/canvasBox.width);
        
        //When past projecting
        if (weightIndex >= weights.length){
            weightIndex = weights.length - 1;
        } else if (weightIndex < 0){
            weightIndex = 0;
        }
        let lineX = canvasBox.width * (weightIndex + 1) / boundingWidth;

        let toComp = moment(dates[weightIndex]);
        let today = moment();
        if (toComp.isAfter(today)){
            weightIndex -- ;
            if (today.format("YYYY-MM-DD") === dates[weightIndex]){
                lineX = canvasBox.width * (weightIndex + 2) / boundingWidth
            }
        } else if (today.format("YYYY-MM-DD") === dates[weightIndex]){
            lineX = canvasBox.width * (weightIndex + 2) / boundingWidth
        }

        let weightsInFrame;
        if (this.state.daysInFrame < this.props.weights.length){
            weightsInFrame = weights.slice(this.state.frameEndIndex - this.state.daysInFrame, this.state.frameEndIndex);
        } else {
            weightsInFrame = weights.slice(this.state.pastProjecting);
        }
        let frameMax = 1.02 * Math.max(...weightsInFrame);
        let frameMin = 0.98 * Math.min(...weightsInFrame);

        let lineY;
        if (weightIndex >= this.state.pastProjecting){
            lineY = canvasBox.height * (1 - (frameMax - weights[weightIndex]) / (frameMax - frameMin));
        } else {
            lineY = canvasBox.height;
        }

        if (weightIndex !== this.state.hoverIndex){
            this.setState({lineX: lineX, lineY: lineY, hoverIndex: weightIndex});
        }
    }
    clickAddWeight = (e) => {
        let addWeightLeft = this.state.lineX;
        if (e.clientX/window.innerWidth > 0.5){
            addWeightLeft -= this.hover.current.getBoundingClientRect().width;
        }
        this.setState({
            showClickAddWeight: true,
            addWeightTop: e.clientY - this.canvas.current.getBoundingClientRect().top,
            addWeightLeft: addWeightLeft,
            addWeightIndex: this.state.hoverIndex
        })
    }
    closeAdder(e){
        e.stopPropagation();
        this.setState({showClickAddWeight: false});
    }
    render(){
        let user = this.props.user;
        
        let weights = this.state.pastWeights.concat(this.props.weights).concat(this.state.futureWeights);
        let dates = this.state.pastDates.concat(this.props.dates).concat(this.state.futureDates);
        let ids = Array(this.state.pastProjecting).fill().map(x => {return null}).concat(this.props.ids).concat(Array(this.state.futureProjecting).fill().map(x => {return null}));

        let initialWeight = this.props.weights[this.props.startingIndex];

        let weightAvgs, numLevels, levelMap;
        if (user.mode === "1"){
            numLevels = maintenanceAvgs.length;
            weightAvgs = calcAverages(0, weights);
            levelMap = Array( numLevels ).fill().map((x,i) => i);
        } else {
            let kgPerSection = (initialWeight - user.ideal_weight_kg)/8;
            levelMap = Array( 8 ).fill().map((x, i) => {
                return i  * kgPerSection + user.ideal_weight_kg;
            });
            levelMap.reverse();
            levelMap.splice(0 , 1);
        }


        let daysInFrame = this.state.daysInFrame;

        let canvasWidth = window.innerWidth * 0.975 * 0.975;
        let canvasHeight = window.innerHeight * 0.95 * 0.92 * 0.3;

        let pxPerDay = canvasWidth/daysInFrame;
        if (weights.length > daysInFrame){
            canvasWidth = pxPerDay * (weights.length + 1); //+1 to account for double width today
        }

        let level = lossmodeLevel(initialWeight, user.ideal_weight_kg, weights[this.state.hoverIndex]);
        let today = moment().format("YYYY-MM-DD");
        return (

            <div id='graph-area'>
                <div id='graph-top'>
                    <div id='axis-labels' className='axis-labels'>
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
                            <div className='view-section-option' onClick={() => this.scaleGraph(14)}>Default</div>
                            <div className='view-section-option' onClick={() => this.scaleGraph(30)}>1M</div>
                            <div className='view-section-option' onClick={() => this.scaleGraph(182)}>6M</div>
                            <div className='view-section-option' onClick={() => this.scaleGraph(moment().dayOfYear())}>YTD</div>
                            <div className='view-section-option' onClick={() => this.scaleGraph(365)}>1Y</div>
                            <div className='view-section-option' onClick={() => this.scaleGraph( Math.ceil(moment().diff(moment(this.props.dates[0]), "days", true) ) )}>Max</div>
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
                                <div id='graph-hover-weight'>{weightStringFromKg(weights[this.state.hoverIndex], user.weight_units)}</div>
                                <div id='graph-hover-date'>{dates[this.state.hoverIndex]}</div>
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
                                    ids[this.state.hoverIndex] === null ?
                                        <div id='graph-hover-interpolated'>Estimated Weight</div>
                                    : null
                                }

                            </div>
                        :
                            <div id='graph-hover'>
                                <div id='graph-hover-weight'>Empty Weight</div>
                                <div id='graph-hover-date'>{dates[this.state.hoverIndex]}</div>
                                <div id='click-hint'>Click the graph to add a weight</div>
                            </div>
                    }
                        
                    <div id='graph-scroller' ref={this.scroll} onScroll={this.handleScroll} onMouseMove={(e) => this.showGraphLines(e)}>
                        <div id='dates-container' style={{width: canvasWidth}} onClick={(e) => this.clickAddWeight(e)}>
                            {
                                dates.map((date,i) => {
                                    let markToday = false;
                                    if (date === today){
                                        markToday = true;
                                    }
                                    date = moment(date)
                                    let dateLetter = date.format('dddd');
                                    let dateString = "";
                                    if (markToday){
                                        if (pxPerDay > 20){
                                            dateString = "Today"
                                        }
                                    } else if (pxPerDay > 60){
                                        if (date.date() === 1){
                                            dateString = date.format("MMM")
                                        } else {
                                            dateString = date.format("D")
                                        }
                                    } else if (pxPerDay > 30){
                                        dateLetter = date.format("ddd");
                                        if (date.date() === 1){
                                            dateString = date.format("MMM");
                                        } else if (i % 2 === 0 ){
                                            dateString = date.format("D");
                                        }
                                    } else if (pxPerDay > 15){
                                        dateLetter = dayLetters[date.format("d")];
                                        if (date.date() === 1){
                                            dateString = date.format("MMM");
                                        } else if (date.date() % 7 === 0){
                                            dateString = date.format("D");
                                        }
                                    } else if (pxPerDay > 3){
                                        if (date.date() === 1){
                                            if (date.month() === 0){
                                                dateString = date.format("YYYY");
                                            } else {
                                                dateString = date.format("MMM");
                                            }
                                        }
                                    } else if (pxPerDay > 1){
                                        if (date.date() === 1){
                                            if (date.month() === 0){
                                                dateString = date.format("YYYY");
                                            } else if (date.month() % 3 === 0){
                                                dateString = date.format("MMM");
                                            }
                                        }
                                    }
                                    return (
                                        <div key={i} className={dates[i] === moment().format("YYYY-MM-DD") ? 'graph-date level-graph-today' : 'graph-date'}>
                                            <div className='date-number-area'>{ dateString }</div>
                                            {
                                                pxPerDay > 15 ?
                                                    <div className='date-letter-area'>{ dateLetter }</div>
                                                : null
                                            }
                                        </div>
                                    )
                                })
                            }
                        </div>
                        <div id='level-graph-display' style={{width: canvasWidth}} onClick={(e) => this.clickAddWeight(e)}>
                            
                            {
                                user.mode === "0" ?
                                    weights.map((weight, i) => {
                                        let onMonth = " on-month";
                                        if (moment(dates[i]).month() % 2 === 0){
                                            onMonth = " off-month";
                                        }
                                        return (
                                            <div key={i} 
                                                className={dates[i] === moment().format("YYYY-MM-DD") ? 'level-graph-date level-graph-today' : 'level-graph-date'} 
                                                style={daysInFrame < 30 ? {padding: "0 2px"} : daysInFrame < 50 ? {padding: "0 1px"} : {padding: "0 0"}}>
                                                {
                                                    levelMap.map((levelWeight, j) => {
                                                        let weightOk = weight < levelWeight;
                                                        return (
                                                            <div key={j} className={weightOk ? "level-section weight-ok" + onMonth : "level-section weight-not-ok" + onMonth}>
                                                                {
                                                                    pxPerDay > 30 ?
                                                                        this.levelIcon(j, user.carb_ranks, weightOk)
                                                                    :null
                                                                }
                                                            </div>
                                                        )
                                                    })
                                                }
                                            </div>
                                        )
                                    })
                                :
                                    weightAvgs.map((weight, i) => {
                                        let onMonth = "on-month";
                                        if (moment(dates[i]).month() % 2 === 0){
                                            onMonth = "off-month";
                                        }
                                        return (
                                            <div key={i} 
                                                className={dates[i] === moment().format("YYYY-MM-DD") ? 'level-graph-date level-graph-today' : 'level-graph-date'} 
                                                style={daysInFrame < 30 ? {padding: "0 2px"} : daysInFrame < 50 ? {padding: "0 1px"} : {padding: "0 0"}}>
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
                                                                    {pxPerDay > 15 ? weightString : null}
                                                            </div>
                                                        )
                                                    })
                                                }
                                            </div>
                                        )
                                    })
                            }
                        </div>
                        <div id='weight-input-container' style={{width: canvasWidth}}>
                            {
                                pxPerDay > 85 ?
                                weights.map((weight,i) => {
                                        let weightString = weightStringFromKg(weight, user.weight_units);
                                        if (user.weight_units === "Pounds"){
                                            weightString = weightString.substring(0, weightString.length - 7);
                                        } else if (user.weight_units === "Kilograms"){
                                            weightString = weightString.substring(0, weightString.length - 10);
                                        }
                                        if (i < this.state.pastProjecting){
                                            return (
                                                <form 
                                                    key={i} 
                                                    className={dates[i] === moment().format("YYYY-MM-DD") ? 'graph-weight level-graph-today' : 'graph-weight'} 
                                                    onSubmit={(e) => this.props.addWeight(this.convertWeight(e.target.value), dates[i])}
                                                >
                                                    <input  className='graph-weight-number' type='number' step="0.01" defaultValue=""/>
                                                    <input type='submit' className='weight-submit' />
                                                </form>
                                            )
                                        } else if (i < this.state.pastProjecting + this.props.weights.length){
                                            return (
                                                <form 
                                                    key={i} 
                                                    className={dates[i] === moment().format("YYYY-MM-DD") ? 'graph-weight level-graph-today' : 'graph-weight'} 
                                                    onSubmit={
                                                        ids[i] === null ? 
                                                            (e) => this.submitWeight(e, i, dates[i]) 
                                                        :
                                                            (e) => this.submitWeight(e, i, dates[i], ids[i])
                                                    }
                                                >
                                                    <input 
                                                        onChange={(e) => this.changeWeight(e, i)} 
                                                        className='graph-weight-number' 
                                                        type='number' 
                                                        step="0.01" 
                                                        defaultValue={weightString} 
                                                    />
                                                    <input type='submit' className='weight-submit'/>
                                                </form>
                                            )
                                        } else {
                                            return (
                                                <div key={i} className={dates[i] === moment().format("YYYY-MM-DD") ? 'graph-weight future-graph-weight level-graph-today' : 'graph-weight future-graph-weight'}>
                                                    <input 
                                                        onChange={(e) => this.changeWeight(e, i - this.props.weights.length - this.state.pastProjecting, "FUTURE")} className='graph-weight-number' 
                                                        type='number' 
                                                        step="0.01" 
                                                        value={parseFloat(weightStringFromKg(this.state.futureWeights[i - this.props.weights.length - this.state.pastProjecting], user.weight_units))}
                                                    />
                                                </div>
                                            )
                                        }
                                    })
                                :
                                    null
                            }
                        </div>
                        <canvas id='line-graph-display' ref={this.canvas} style={{width: canvasWidth}} width={canvasWidth} height={canvasHeight} onClick={(e) => this.clickAddWeight(e)}></canvas>
                        <div id='mouse-coordinate-x' style={{left: this.state.lineX, height: this.state.lineY}} ref={this.coordX} onClick={(e) => this.clickAddWeight(e)}></div>
                        <div id='mouse-coordinate-y' style={{width: this.state.lineX, bottom: this.state.lineY}} ref={this.coordY}></div>
                        
                        <div id='click-adder' 
                            className={this.state.showClickAddWeight ? "show" : ""} 
                            style={{left: this.state.addWeightLeft, top: this.state.addWeightTop + 0.6 * canvasHeight/0.35}}
                            ref={this.hover}
                        >
                            <div id='adder-close' onClick={(e) => this.closeAdder(e)}><i className='fa fa-times'></i></div>
                            <div id='click-adder-title'>
                                {
                                    ids[this.state.addWeightIndex] === null ?
                                        "Add a weight for " + dates[this.state.addWeightIndex]
                                    :
                                        "Change weight for " + dates[this.state.addWeightIndex] + " from " + parseFloat(weightStringFromKg(weights[this.state.addWeightIndex], user.weight_units)) + " to: "
                                }
                            </div>
                            {
                                this.state.addWeightIndex >= this.state.pastProjecting + this.props.weights.length ?

                                    <div>
                                        <input 
                                            value={parseFloat(weightStringFromKg(this.state.futureWeights[this.state.addWeightIndex - (this.state.pastProjecting + this.props.weights.length)], user.weight_units))} 
                                            onChange={(e) => this.changeWeight(e, this.state.addWeightIndex - (this.state.pastProjecting + this.props.weights.length), "FUTURE")} className='graph-weight-number' 
                                            type='number' 
                                            step="0.01"
                                            onKeyPress={e => {
                                                if (e.key === "Enter"){
                                                    this.closeAdder(e);
                                                }
                                            }}
                                        />

                                        {
                                            weights[this.state.addWeightIndex] !== this.props.weights[this.props.weights.length-1] ? 
                                                <button className='clear-weight' value={parseFloat(weightStringFromKg(weights[weights.length-1], user.weight_units))} onClick={(e) => this.changeWeight(e, this.state.addWeightIndex - this.props.weights.length - this.state.pastProjecting, "FUTURE")}>Reset</button>
                                            : 
                                                null
                                        }
                                    </div>
                                : ids[this.state.addWeightIndex] === null ? 
                                    <form 
                                        className='graph-weight' 
                                        onSubmit={(e) => this.submitWeight(e, this.state.addWeightIndex, dates[this.state.addWeightIndex])}
                                    >
                                        <input 
                                            onChange={(e) => this.changeWeight(e, this.state.addWeightIndex)} 
                                            className='graph-weight-number' 
                                            type='number' 
                                            step="0.01"
                                            value={this.state.inputs[this.state.addWeightIndex]}
                                        />
                                        <input type='submit' className='weight-submit'/>
                                    </form>
                                        
                                :
                                    <form 
                                        className='graph-weight' 
                                        onSubmit={(e) => this.submitWeight(e, this.state.addWeightIndex, dates[this.state.addWeightIndex], ids[this.state.addWeightIndex])}
                                    >
                                        <input 
                                            onChange={(e) => this.changeWeight(e, this.state.addWeightIndex)} 
                                            className='graph-weight-number' 
                                            type='number' 
                                            step="0.01" 
                                            value={this.state.inputs[this.state.addWeightIndex]}
                                        />
                                        <input type='submit' className='weight-submit'/>
                                    </form>
                            }
                        </div>
                    </div>
                    {
                        pxPerDay < 30 ?
                            <div id='graph-sidebar' style={{width: Math.ceil(0.075 * window.innerWidth * 0.975 * 0.975/pxPerDay)*pxPerDay}}>
                                {
                                    levelMap.map((levelWeight, j) => {
                                            return (
                                                <div key={j} className="sidebar-section">
                                                    {
                                                        this.levelIcon(j, user.carb_ranks, true)
                                                    }
                                                </div>
                                            )
                                        })
                                    }
                            </div>
                        : null
                    }
                </div>
            </div>
        )
    }
}