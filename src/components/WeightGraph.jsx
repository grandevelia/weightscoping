import React, { Component } from 'react';
import { iconPaths, carbOrder, carbOptions, weightStringFromKg,interpolateDates, poundsToKg, maintenanceAvgs, calcAverages } from './utils';
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
        this.sliderBar = React.createRef();

        let inputs = [];
        for (let i = 0; i < props.weights.length; i ++){
            inputs.push(parseFloat(weightStringFromKg(props.weights[i], props.user.weight_units)))
        }
        this.showDatePicker = this.showDatePicker.bind(this);
        this.setDateRange = this.setDateRange.bind(this);
        let projectionData = this.futureProject(7);

        let currStart = moment(this.props.dates[0]);
        let pastDates = [];
        let pastWeights = [];
        let daysInFrame = 14;

        let pastProjecting = Math.ceil(0.075 * daysInFrame); //Have at least this many filler weights in the past to fill the transparent sidebar
        if (props.weights.length <= daysInFrame/2){
            pastProjecting += daysInFrame/2 - props.weights.length;
            for (let i = 1; i <= pastProjecting; i ++){
                let newDate = currStart.clone().subtract(i, "days").format("YYYY-MM-DD");
                pastDates.unshift(newDate);
                pastWeights.unshift(0);
            }
        }
        let frameEndIndex = props.weights.length + pastProjecting + daysInFrame/2;
        this.state = {
            inputs: inputs,
            showDatePicker: false,
            daysInFrame: daysInFrame,
            frameEndIndex: frameEndIndex,
            futureProjecting : projectionData.futureProjecting,
            futureWeights: projectionData.futureWeights,
            futureDates: projectionData.futureDates,
            pastProjecting : pastProjecting,
            pastWeights: pastWeights,
            pastDates: pastDates,
            sliderLeft: 0,
            lineX: 0,
            lineY: 0,
            hoverIndex: 0,
            windowHeight: 0,
            windowWidth: 0,
            addWeightTop: 0,
            addWeightLeft: 0,
            addWeightIndex: 0
        }
    }
    renderGraph(){
        let graphPixelsWidth = this.canvas.current.width;

        let canvas = this.canvas.current.getContext('2d');
        let graphPixelsHeight = this.canvas.current.height;
        canvas.clearRect(0, 0, this.canvas.current.width, graphPixelsHeight);
        canvas.beginPath();

        let weights = this.state.pastWeights.concat(this.props.weights).concat(this.state.futureWeights);
        let dates = this.state.pastDates.concat(this.props.dates).concat(this.state.futureDates);
        
        let weightsInFrame;
        let frameStartIndex = this.state.frameEndIndex - this.state.daysInFrame;
        if (this.state.daysInFrame < weights.length){
            weightsInFrame = weights.slice(frameStartIndex, this.state.frameEndIndex);
            dates =  dates.slice(frameStartIndex, this.state.frameEndIndex);
        } else {
            //This will either happen if # days from first date to now + future projection exactly equals daysInFrame,
            //Or because past weights have been projected to fill up the gap

            //Days in frame should should at least equal the number of weights (projected before first entered weight, up to now, and future)

            weightsInFrame = weights;
        }
    
        let frameMax = 1.02 * Math.max(...weightsInFrame);
        let frameMin = 0.98 * Math.min(...weightsInFrame.filter(x => x > 0));
        
        //Horizontal portion of canvas taken up by each day
        let pxPerDay = graphPixelsWidth/this.state.daysInFrame;
        canvas.strokeStyle = "rgb(0, 0, 0)";
        let monthOpacity = ["0.6", "0.9"];
        let compDate = moment(this.props.dates[0]).subtract(1, "days");

        //Line graph
        //startingWeightIndex will be one less than the first weight "In the frame" to account for partial scrolls,
        //Or 0 if the index of the first weight in the frame is 0
        let startingWeightIndex = Math.max(this.state.frameEndIndex - this.state.daysInFrame - 1, 0);

        canvas.moveTo(0, graphPixelsHeight * ( frameMax - weights[startingWeightIndex] )/( frameMax - frameMin ));
        canvas.lineTo(pxPerDay, graphPixelsHeight * ( frameMax - weightsInFrame[0] )/( frameMax - frameMin ) );

        weightsInFrame.map((weight, i) => {
            let currDate = moment(dates[i]);
            let dayMod = 1;
            let monthIndex = currDate.month() % 2;
            canvas.fillStyle = 'rgba(170,170,170, ' + monthOpacity[monthIndex] + ')'; //alternate background color by month
            let currLeft;

            if (currDate.isAfter(moment())){
                //currDate is in the future
                currLeft = pxPerDay * (i + 1); //Accounts for double width today

            } else if (currDate.format("YYYY-MM-DD") === moment().format("YYYY-MM-DD")){
                //currDate is today
                dayMod = 2; //today bar gets double width
                canvas.fillStyle = 'rgb(55, 157, 236)'; //and no alpha
                currLeft = pxPerDay * i;

            } else {
                //currDate before today
                currLeft = pxPerDay * i;
            }
            canvas.fillRect(currLeft, 0, dayMod * pxPerDay - 1, graphPixelsHeight);

            let realWeightIndex = i + (this.state.frameEndIndex - this.state.daysInFrame);
            //Only draw lines for weights added by user or projected into future
            if (currDate.isAfter(compDate)){
                canvas.moveTo(currLeft + dayMod * pxPerDay, graphPixelsHeight * ( frameMax - weight )/( frameMax - frameMin ));
                
                if (realWeightIndex !== this.state.pastProjecting ){
                    canvas.lineTo(currLeft, graphPixelsHeight * ( frameMax - weightsInFrame[i-1] )/( frameMax - frameMin ) );
                } else {
                    canvas.lineTo(currLeft, graphPixelsHeight * ( frameMax - weight )/(frameMax - frameMin));
                }
            }
            return "";
        })
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
        let numWeights = this.props.weights.length + this.state.pastProjecting + this.state.futureProjecting;
        let todayNum = numWeights - this.state.futureProjecting;

        //Put today in the middle of the screen, or scroll as for right as possible
        let endWithTodayCenter = todayNum + Math.floor(this.state.daysInFrame/2);
        let endIndex = endWithTodayCenter; //Note this is more a bound than an index

        if (endWithTodayCenter > numWeights){
            //This will happen if daysInFrame/2 is larger than futureProjecting 
            //e.g. if the user has a viewframe larger than 30 (the max number of future days)

            //In this case "bring it back down"
            endIndex = numWeights;
        }

        //Update slider bar position accordingly
//needs to be todayNum - 1 but accurate to pillwidth/barwidth/2
        let todayPercent = todayNum/numWeights;
        let barWidth =  this.sliderBar.current.getBoundingClientRect().width;
        let pillWidth = 0.05 * barWidth;
        let sliderLeft = Math.round((barWidth - pillWidth) * todayPercent);

        //let percentFromLeft = sliderLeft/(barWidth - 2 * halfSliderPill);
        //let mouseIndex = Math.round( ( numWeights - this.state.daysInFrame ) * percentFromLeft );
        this.setState({
            windowHeight: window.innerHeight,
            windowWidth: window.innerWidth,
            frameEndIndex: endIndex,
            sliderLeft: sliderLeft,
            lineX: 0
        }, () => {
            this.renderGraph();
        });
    }
    scrollPress = () => {
        this.setState({scrolling: true})
    }
    scrollRelease = () => {
        if (this.state.scrolling){
            this.setState({scrolling: false})
        }
    }
    checkScroll = (e) => {
        if (this.state.scrolling){
            this.handleScroll(e)
        }
    }
    handleScroll(e){
        let sliderBox = this.sliderBar.current.getBoundingClientRect();
        let numWeights = this.state.pastProjecting + this.props.weights.length + this.state.futureProjecting;
        let halfSliderPill = 0.025 * sliderBox.width;
        let mouseX = e.clientX - sliderBox.left; //relative to slider bar

        if (mouseX < halfSliderPill){
            mouseX = halfSliderPill;
        } else if (mouseX > sliderBox.width - halfSliderPill){
            mouseX = sliderBox.width - halfSliderPill;
        }

        let sliderLeft = mouseX - halfSliderPill;
        /* Set index based on left of slider, update slider so center is at mouse

            Effective range is actually the full width of the slider bar minus
            the width of the slider pill since index is taken
            from the left side of the slider.

            E.g. if the pill is 5% of the bar width, the effective width 
            will be 95% of the full bar

            Also, the frame end index ranges from daysInFrame to numWeights,
            so a mapping from [0, 1] to [daysInFrame, numWeights] is required
        */
        
        //Account for days in frame when calculating percentfromleft
        let percentFromLeft = sliderLeft/(sliderBox.width - 2 * halfSliderPill);
        let mouseIndex = Math.round( ( numWeights - this.state.daysInFrame ) * percentFromLeft );
        let frameEndIndex = mouseIndex + this.state.daysInFrame;

        this.setState({
            frameEndIndex: frameEndIndex,
            sliderLeft: sliderLeft
        }, () => {
            this.renderGraph();
        });
    }
    componentWillUnmount() {
        window.removeEventListener('resize', this.handleResize);
    }
    showDatePicker(status){
        this.setState({showDatePicker: status});
    }
    scaleGraph(n, future=false){
        let start;
        let end;
        if (!future){
            //Scaling graph without changing future projection
            //Use last day of current future projecting as end
            end = moment(this.state.futureDates[this.state.futureDates.length - 1]);
            start = end.clone().subtract(n, "days");
        } else {
            //Scaling graph with new future projection
            end = moment().add(n, "days");

            if (n > this.state.daysInFrame){
                //If projecting more days in future than currently displayed days, change days in frame
                start = moment();
            } else {
                //If projecting less than current days in frame, shrink the projection without changing days in frame
                start = end.clone().subtract(this.state.daysInFrame, "days");
            }
        }
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
        }

        let currStart = moment(this.props.dates[0]);
        if (currStart.isAfter(start)){
            pastProjecting = Math.floor(currStart.diff(start, "days", true));
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
        
        let pastAddition = Math.ceil(0.075 * daysInFrame);
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

        this.setState({
            daysInFrame: daysInFrame,
            showDatePicker: false,
            futureProjecting : futureProjecting,
            futureWeights: futureWeights,
            futureDates: futuresDates,
            pastProjecting: pastProjecting,
            pastWeights: pastWeights,
            pastDates: pastDates,
            hoverIndex: 0,
        }, () => this.handleResize());
    }
    futureProject(daysToProject){
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
        return {
            futureProjecting : daysToProject,
            futureWeights: futureWeights,
            futureDates: futureDates
        };
    }
    changeWeight(e, i){
        e.preventDefault(); 
        let frameStartIndex = this.state.frameEndIndex - this.state.daysInFrame;
        let dates = this.state.pastDates.concat(this.props.dates).concat(this.state.futureDates).slice(frameStartIndex, this.state.frameEndIndex);
        let currDate = moment(dates[i]);

        if (moment().isAfter(currDate) || moment().isSame(currDate)){
            //currDate is between first date and now
            let newInputs = this.state.inputs;
            newInputs[i] = e.target.value;
            this.setState({inputs: newInputs}, () => this.renderGraph());
        } else if (moment(currDate).isAfter(moment())){
            //currDate is in the future
            let newProjection = this.state.futureWeights;
            let targetWeight = this.convertWeight(e.target.value);
            if(!targetWeight){
                targetWeight = 0;
            }
            if (i > this.state.frameEndIndex - this.state.futureProjecting){
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
    submitWeightForm(e, i){
        let frameStartIndex = this.state.frameEndIndex - this.state.daysInFrame;
        let dates = this.state.pastDates.concat(this.props.dates).concat(this.state.futureDates).slice(frameStartIndex, this.state.frameEndIndex);

        if (e.key === 'Enter'){
            e.preventDefault();
            let currDate = moment(dates[i]);
            let id = Array(this.state.pastProjecting).fill().map(x => {return null}).concat(this.props.ids).concat(Array(this.state.futureProjecting).fill().map(x => {return null}))[i];

            if (moment(this.props.dates[0]).isAfter(currDate)){
                //currDate is before first user added weight (i.e. it is in pastWeights)
                this.props.addWeight(this.convertWeight(e.target.value), currDate);

            } else if (moment().isAfter(currDate) || moment().isSame(currDate)){
                //currDate is between now and first date (inc)
                let newWeight = this.state.inputs[i];
                
                if (id === null){
                    //Weight was interpolated
                    this.props.addWeight(this.convertWeight(newWeight), currDate)
                    .then(() => {
                        this.renderGraph();
                    })
                } else {
                    //Weight is being changed
                    this.props.updateWeight(this.convertWeight(newWeight), id)
                    .then(() => {
                        this.renderGraph();
                    })
                }
            } else {
                //date is in future
                console.log("future")
            }
        } else {
            this.changeWeight(e, i)
        }
    }
    levelIcon(index, carbRanks, allowed){

		if (isNaN(index)){
			return <div className='loading-icons'>Loading...</div>
        }
        let innerIndex = carbRanks[ carbOrder[ index ] ];
        if (allowed){
            return (
                <div className='icon-wrap'>
                    {
                        index !== 6 ? 
                            <div className='icon icon-allowed'>
                                <img src={iconPaths[innerIndex]} alt=''/>
                                <div className='icon-description'>{carbOptions[ innerIndex ]}</div>
                            </div>
                        :
                            Array( carbRanks.length - index).fill().map( (x, j) => j + index).map(j => {
                                innerIndex = carbRanks[ carbOrder[ j ] ];
                                return (
                                    <div key={j} className='icon icon-allowed'>
                                        <img src={iconPaths[innerIndex]} alt=''/>
                                        <div className='icon-description'>{carbOptions[ innerIndex ]}</div>
                                    </div>
                                )
                            })
                    }
                </div>
            );
        } else {
            return (
                <div className='icon-wrap disallowed'>
                    {
                        index !== 6 ? 
                            <div className='icon'>
                                <img src={iconPaths[innerIndex]} alt=''/>
                                <div className='icon-cross'></div>
                                <div className='icon-description'>{carbOptions[ innerIndex ]}</div>
                            </div>
                        :
                            Array( carbRanks.length - index).fill().map( (x, j) => j + index).map(j => {
                                innerIndex = carbRanks[ carbOrder[ j ] ];
                                return (
                                    <div key={j} className='icon'>
                                        <img src={iconPaths[innerIndex]} alt=''/>
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
    showGraphLines = (e) => {
        let canvasBox = this.canvas.current.getBoundingClientRect();
        //Mouse position relative to scrolled canvas left
        let mouseX = e.clientX - canvasBox.left;
        
        let weights = this.state.pastWeights.concat(this.props.weights).concat(this.state.futureWeights);
        let dates = this.state.pastDates.concat(this.props.dates).concat(this.state.futureDates);

        let boundingWidth = this.state.daysInFrame;
        let weightIndex = Math.max(Math.min(Math.floor(boundingWidth * mouseX/canvasBox.width), weights.length-1), 0);
        
        //When past projecting
        let lineX = canvasBox.width * (weightIndex + 1) / boundingWidth;

        let realWeightIndex = weightIndex + (this.state.frameEndIndex - this.state.daysInFrame);
        let toComp = moment(dates[realWeightIndex]);
        let today = moment();
        if (toComp.isAfter(today)){
            weightIndex -- ;
            if (today.format("YYYY-MM-DD") === dates[realWeightIndex]){
                lineX = canvasBox.width * (weightIndex + 2) / boundingWidth
            }
        } else if (today.format("YYYY-MM-DD") === dates[realWeightIndex]){
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
        if (realWeightIndex >= this.state.pastProjecting){
            lineY = canvasBox.height * (1 - (frameMax - weights[realWeightIndex]) / (frameMax - frameMin));
        } else {
            lineY = canvasBox.height;
        }
        if (isNaN(lineY)){
            lineY = 0;
        }

        if (weightIndex !== this.state.hoverIndex){
            this.setState({lineX: lineX-1, lineY: lineY, hoverIndex: weightIndex});
        }
    }
    dateString(date, pxPerDay, i){
        let markToday = false;
        if (date === moment().format("YYYY-MM-DD")){
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
        return {
            dateString: dateString,
            dateLetter: dateLetter
        }
    }
    updateSettings(e, key, val){
        e.preventDefault();
        this.props.updateUserSettings(key, val);
    }
    render(){
        let user = this.props.user;
        let weights = this.state.pastWeights.concat(this.props.weights).concat(this.state.futureWeights);
        let dates = this.state.pastDates.concat(this.props.dates).concat(this.state.futureDates);
        let ids = Array(this.state.pastProjecting).fill().map(x => {return null}).concat(this.props.ids).concat(Array(this.state.futureProjecting).fill().map(x => {return null}));

        let weightsInFrame;
        let frameStartIndex = this.state.frameEndIndex - this.state.daysInFrame;
        if (this.state.daysInFrame < weights.length){
            weightsInFrame = weights.slice(frameStartIndex, this.state.frameEndIndex);
            dates = dates.slice(frameStartIndex, this.state.frameEndIndex);
        } else {
            weightsInFrame = weights.slice(this.state.pastProjecting);
        }
        let initialWeight = this.props.weights[this.props.startingIndex];

        let weightAvgs, numLevels, levelMap;
        if (user.mode === "1"){
            numLevels = maintenanceAvgs.length;
            weightAvgs = calcAverages(0, weightsInFrame);
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
        let canvasHeight = window.innerHeight * 0.9 * 0.275;
        let pxPerDay = canvasWidth/daysInFrame;
        return (
            <div id='graph-area' onMouseMove={(e) => this.checkScroll(e)} onTouchEnd={this.scrollRelease} onMouseUp={this.scrollRelease} onMouseLeave={this.scrollRelease}>
                <div id='graph-top'>
                    <div id='graph-mode-section'>
                        {
                            user.mode === "1" ?
                                <div className='mode-switch'>
                                    <div className='mode-indicator'>Mode: Maintenance</div>
                                    <div className='mode-switch-button' onClick={(e) => this.updateSettings(e, "mode", "0")}>Switch to Weight Loss</div>
                                </div>
                            : 
                                <div className='mode-switch'>
                                    <div className='mode-indicator'>Mode: Weight Loss</div>
                                    {
                                        weights[weights.length - 1] <= user.ideal_weight_kg ?
                                            <div className='mode-switch-button' onClick={(e) => this.updateSettings(e, "mode", "1")}>Switch to Maintenance</div>
                                        :
                                             null
                                    }
                                </div>
                        }
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
                            <div className='view-section-option' onClick={() => this.scaleGraph(7, true)}>7D</div>
                            <div className='view-section-option' onClick={() => this.scaleGraph(30, true)}>1M</div>
                        </div>
                    </div>
                </div>
                <div className='horizontal-scroll-area'>
                    <div className='horizontal-scroll-background' onClick={(e) => this.handleScroll(e)} ref={this.sliderBar}>
                        <div 
                            className='horizontal-scroll-bar' 
                            style={{left: this.state.sliderLeft}}
                            ref={this.scroll}
                            onTouchStart={(e) => this.scrollPress(e)} 
                            onTouchEnd={this.scrollRelease} 
                            onMouseDown={this.scrollPress} 
                            onMouseUp={this.scrollRelease}
                            onMouseLeave={this.scrollRelease}
                        />
                    </div>
                </div>
                <div className='graph-middle'>
                    <div id='graph-scroller' onMouseMove={(e) => this.showGraphLines(e)}>
                        <div id='dates-container' style={{width: canvasWidth}}>
                            {
                                dates.map((date, i) => {
                                    let dateInfo = this.dateString(date, pxPerDay, i);
                                    return (
                                        <div key={i} style={dates[i] === moment().format("YYYY-MM-DD") ? {width: 2*pxPerDay} : {width: pxPerDay} } className={dates[i] === moment().format("YYYY-MM-DD") ? 'graph-date level-graph-today' : 'graph-date'}>
                                            <div className='date-number-area'>{ dateInfo.dateString }</div>
                                            {
                                                pxPerDay > 15 ?
                                                    <div className='date-letter-area'>{ dateInfo.dateLetter }</div>
                                                : null
                                            }
                                        </div>
                                    )
                                })
                            }
                        </div>
                        <div id='level-graph-display' style={{width: canvasWidth}}>
                            
                            {
                                user.mode === "0" ?
                                    weightsInFrame.map((weight, i) => {
                                        let onMonth = " on-month";
                                        if (moment(dates[i]).month() % 2 === 0){
                                            onMonth = " off-month";
                                        }
                                        let paddingStyle;
                                        if (daysInFrame < 30){
                                            paddingStyle = "0 2px";
                                        } else if (daysInFrame < 50){
                                            paddingStyle =  "0 1px";
                                        } else {
                                            paddingStyle = "0 0";
                                        }
                                        let currClassName = "level-graph-date";
                                        let currWidth = pxPerDay;
                                        if (dates[i] === moment().format("YYYY-MM-DD")){
                                            currClassName = "level-graph-date level-graph-today";
                                            currWidth = 2 * pxPerDay;
                                        }
                                        return (
                                            <div key={i} className={currClassName} style={{width: currWidth, padding: paddingStyle}}>
                                                {
                                                    levelMap.map((levelWeight, j) => {
                                                        let weightOk = weight < levelWeight;
                                                        return (
                                                            <div key={j} className={weightOk ? "level-section weight-ok" + onMonth : "level-section weight-not-ok" + onMonth}>
                                                                {
                                                                    pxPerDay > 30 && moment(dates[i]).isAfter(moment().subtract(1, "days"))? 
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
                                                                    {pxPerDay > 30 ? weightString : null}
                                                            </div>
                                                        )
                                                    })
                                                }
                                            </div>
                                        )
                                    })
                            }
                            <div id='graph-sidebar' style={{width: Math.ceil(0.075 * window.innerWidth * 0.975 * 0.975/pxPerDay)*pxPerDay}}>
                                {
                                    levelMap.map((levelWeight, j) => {
                                        return (
                                            <div key={j} className="sidebar-section">{ this.levelIcon(j, user.carb_ranks, true) }</div>
                                        )
                                    })
                                }
                            </div>
                        </div>
                        <div id='weight-input-container' style={{width: canvasWidth}}>
                            {
                                pxPerDay > 45 ?
                                    weightsInFrame.map((weight,i) => {
                                        let weightString = weightStringFromKg(weight, user.weight_units);
                                        if (user.weight_units === "Pounds"){
                                            weightString = weightString.substring(0, weightString.length - 7);
                                        } else if (user.weight_units === "Kilograms"){
                                            weightString = weightString.substring(0, weightString.length - 10);
                                        }
                                        
                                        return (
                                            <form 
                                                key={i} 
                                                className={dates[i] === moment().format("YYYY-MM-DD") ? 'graph-weight level-graph-today' : 'graph-weight'} 
                                                style={dates[i] === moment().format("YYYY-MM-DD") ? {width: 2*pxPerDay} : {width: pxPerDay} }
                                                onKeyPress={(e) => this.submitWeightForm(e, i, ids[i])}
                                            >
                                                <input 
                                                    onChange={(e) => this.changeWeight(e, i)} 
                                                    className='graph-weight-number' 
                                                    type='number' 
                                                    step="0.01" 
                                                    defaultValue={weightString} 
                                                />
                                            </form>
                                        )
                                    })
                                :
                                    null
                            }
                        </div>
                        <canvas id='line-graph-display' ref={this.canvas} style={{width: canvasWidth + 'px'}} width={canvasWidth} height={canvasHeight}></canvas>
                        <div id='mouse-coordinate-x' style={{left: this.state.lineX, height: this.state.lineY}} ref={this.coordX}></div>
                        <div id='mouse-coordinate-y' style={{width: this.state.lineX, bottom: this.state.lineY}} ref={this.coordY}></div>
                    </div>
                </div>
            </div>
        )
    }
}

/*this.state.hoverIndex >= this.state.pastProjecting ? 

    <div id='graph-hover'>
        <div id='graph-hover-weight'>{weightStringFromKg(weights[this.state.hoverIndex], user.weight_units)}</div>
        <div id='graph-hover-date'>{dates[this.state.hoverIndex]}</div>
        <div id='graph-hover-level'>{"Level " + level}</div>
        <div id='graph-hover-allowed'>
            <div className='graph-hover-allowed-title'>Allowed</div>
            <div className='graph-hover-icons'>
                //TODO NOTE TO SELF: If this is needed, just iterate through all levels and use existing icon func, no need for two different functions
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
    </div>*/