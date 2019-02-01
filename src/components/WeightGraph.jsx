import React, { Component } from 'react';
import { iconPaths, carbOrder, carbOptions, weightStringFromKg, weightFromKg, interpolateDates, poundsToKg, maintenanceAvgs, calcAverages } from './utils';
import FadeInComponent from './FadeInComponent';
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
        this.focusedInput = React.createRef();
        this.sliderBar = React.createRef();
        this.showDatePicker = this.showDatePicker.bind(this);
        this.setDateRange = this.setDateRange.bind(this);
        let projectionData = this.futureProject(7);

        let daysInFrame = 14;

        let inputs = [];
        let pastProjecting = Math.ceil(0.075 * daysInFrame); //Have at least this many filler weights in the past to fill the transparent sidebar
        if (props.weights.length <= daysInFrame/2){
            //Backfill if there isn't enough data to fill the ui
            pastProjecting += daysInFrame/2 - props.weights.length;
        }
        //Filler weights before start
        for (let i = 0; i < pastProjecting; i ++){
            inputs.push(0);
        }
        //All added or interpolated weights
        for (let i = 0; i < props.weights.length; i ++){
            inputs.push(weightFromKg(props.weights[i], props.user.weight_units));
        }
        //future weights initialized to today's weight
        for (let i = 0; i < projectionData.futureProjecting; i ++){
            inputs.push(weightFromKg(props.weights[props.weights.length-1], props.user.weight_units));
        }
        let frameEndIndex = inputs.length - 2;
        this.state = {
            inputs: inputs,
            showDatePicker: false,
            daysInFrame: daysInFrame,
            frameEndIndex: frameEndIndex,
            futureProjecting : projectionData.futureProjecting,
            pastProjecting : pastProjecting,
            sliderLeft: 0,
            lineX: 0,
            lineY: 0,
            windowHeight: 0,
            windowWidth: 0,
            adding: false,
            focusedInput: null,
            graphSide: 0
        }
    }
    renderGraph(){
        let graphPixelsWidth = this.canvas.current.width;
        let canvas = this.canvas.current.getContext('2d');
        let graphPixelsHeight = this.canvas.current.height;
        canvas.clearRect(0, 0, this.canvas.current.width, graphPixelsHeight);
        canvas.beginPath();

        let weights = this.state.inputs;
        
        let daysInFrame = this.state.daysInFrame;
        //+1 because pure subtraction puts "start" off the frame
        let frameStartIndex = this.state.frameEndIndex - daysInFrame + 1;

        let todayIndex = this.state.inputs.length - this.state.futureProjecting - 1;
        if (todayIndex >= frameStartIndex && todayIndex <= this.state.frameEndIndex){
            frameStartIndex ++; //If today is in the frame, select 1 less weight to be in the frame
        }

        let weightsInFrame = weights.slice(frameStartIndex, this.state.frameEndIndex + 1);
        
        let frameMax = 1.02 * Math.max(...weightsInFrame);
        let frameMin = 0.98 * Math.min(...weightsInFrame.filter(x => x > 0));
        
        //Horizontal portion of canvas taken up by each day
        let pxPerDay = graphPixelsWidth/this.state.daysInFrame;
        canvas.strokeStyle = "rgb(0, 0, 0)";
        let monthOpacity = ["0.6", "0.9"];

        let startDate = moment().subtract(this.props.weights.length - 1 + this.state.pastProjecting, "days");

        //Line graph
        let frameStartDate = startDate.add(frameStartIndex, "days");

        if (frameStartIndex > 0){
            canvas.moveTo(0, graphPixelsHeight * ( frameMax - weights[frameStartIndex-1] )/( frameMax - frameMin ));
        } else {
            canvas.moveTo(0, graphPixelsHeight * ( frameMax - weights[frameStartIndex] )/( frameMax - frameMin ));
        }
        canvas.lineTo(pxPerDay, graphPixelsHeight * ( frameMax - weightsInFrame[0] )/( frameMax - frameMin ) );

        weightsInFrame.map((weight, i) => {
            let currDate = frameStartDate.clone().add(i, "days");
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

            let realWeightIndex = i + frameStartIndex;
            //Only draw lines for weights added by user or projected into future
            if (currDate.isAfter(startDate)){
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
        let numWeights = this.state.inputs.length;
        
        //Put today in the center of the screen
        //The first -1 converts place to index, the second is because today takes up 2 spots
        //Math.ceil ensures integer with odd days and frame, and shows more future days
        //Change to floor for less future days instead
        let endIndex = this.state.inputs.length - 1 - this.state.futureProjecting + Math.ceil(this.state.daysInFrame/2) - 1; 

        if (this.state.inputs.length-1 < endIndex){
            endIndex = numWeights - 1;
        }

        //Update slider bar position accordingly
        let barWidth =  this.sliderBar.current.getBoundingClientRect().width;
        let pillWidth = 0.05 * barWidth;
        let sliderLeft = Math.round((barWidth - pillWidth) * endIndex/numWeights);

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
        let numWeights = this.state.inputs.length;
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
        let frameEndIndex = mouseIndex + (this.state.daysInFrame - 1);
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
            end = moment().add(this.state.futureProjecting, "days");
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
        let startDate = moment().subtract(this.props.weights.length, "days");
        if (startDate.isAfter(end)){
            end = startDate;
            alert("You must keep at least 1 added weight in the window");
        }
        let futureProjecting = this.state.futureProjecting;
        let futureWeights = this.state.futureWeights;

        let pastProjecting = this.state.pastProjecting;
        let pastWeights = this.state.pastWeights;

        let daysInFrame = Math.ceil(end.diff(start, "days", true));
        if (end.isAfter(moment())){
            let daysInFuture = Math.ceil(end.diff(moment(), "days", true));
            let data = this.futureProject(daysInFuture);
            if (data === null){
                alert("Invalid Date");
                return;
            }
            futureProjecting = data.futureProjecting;
            data.futureWeights = data.futureWeights.map(x => {
                return weightFromKg(x, this.props.user.weight_units);
            });
            futureWeights = data.futureWeights;
        }

        if (startDate.isAfter(start)){
            //Need to backfill days in order to fill screen
            let nDays = end.diff(start, "days");
            pastProjecting = nDays - (futureProjecting + this.props.weights.length);
            pastWeights = Array(pastProjecting).fill().map(x => {return 0});
        } else {
            pastProjecting = 0;
            pastWeights = [];
        }
        
        let pastAddition = Math.ceil(0.075 * daysInFrame);
        pastProjecting += pastAddition;
        for (let i = 1; i <= pastAddition; i ++){
            pastWeights.unshift(0);
        }

        let inputs = this.state.inputs;
        inputs.splice(-this.state.futureProjecting, this.state.futureProjecting, ...futureWeights);
        inputs.splice(0, this.state.pastProjecting, ...pastWeights);

        this.setState({
            inputs: inputs,
            daysInFrame: daysInFrame,
            showDatePicker: false,
            futureProjecting : futureProjecting,
            pastProjecting: pastProjecting
        }, () => {
            this.handleResize()
        });
    }
    futureProject(daysToProject){
        let weights = this.props.weights;
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
        futureDates.push(moment());
        futureDates.push(moment().add(daysToProject, "days").format("YYYY-MM-DD"));

        futureWeights = [];
        futureWeights.push(weights[weights.length-1]);
        futureWeights.push(weights[weights.length-1]);
        let tempData = interpolateDates(futureWeights, futureDates);

        futureWeights = weights.concat(tempData.weights.slice(1,tempData.weights.length)).slice(weights.length);

        return {
            futureProjecting : daysToProject,
            futureWeights: futureWeights
        };
    }
    changeWeight(e, i){
        e.preventDefault();
        let val = e.target.value;
        let currDate = moment().subtract(this.state.inputs.length - i, "days");
        if (moment().isAfter(currDate) || moment().isSame(currDate)){
            //currDate is between first date and now

            let newInputs = this.state.inputs;
            newInputs[i] = val;
            this.setState({
                inputs: newInputs
            }, () => {
                this.renderGraph();
            });

        } else if (currDate.isAfter(moment())){
            //currDate is in the future

            let newProjection = this.state.futureWeights;
            let targetWeight = this.convertWeight(val);
            let newInputs = this.state.inputs;

            if( !targetWeight ){
                targetWeight = 0;
            }

            let futureIndex = i - this.props.weights.length - this.state.pastProjecting;

            if ( futureIndex > 0 ){
                //Iinterpolate all days before current

                let anchorWeight = this.props.weights[this.props.weights.length-1];
                let interpWeights = [];
                interpWeights.push(anchorWeight);
                interpWeights.push(targetWeight);

                let interpDates = [];
                let now = moment();
                interpDates.push(now);
                interpDates.push(now.clone().add(futureIndex, "days").format("YYYY-MM-DD"));

                let interpSection = interpolateDates(interpWeights, interpDates).weights.slice(1);
                newProjection = interpSection.concat(newProjection.slice(futureIndex));

                for (let j = 0; j < futureIndex + 1; j ++){
                    newInputs[i + j] = newProjection[j];
                }
            } else {
                newProjection[futureIndex] = targetWeight;
                newInputs[i] = val;
            }

            this.setState({
                futureWeights: newProjection,
                inputs: newInputs
            }, () => {
                this.renderGraph();
            });
            
        }
    }
    handleWeightSubmit(e, i){
        e.preventDefault();
        //First -1 converts length to index
        let daysFromNow = this.state.inputs.length - 1 - this.state.futureProjecting - i;
        let currDate = moment().subtract(daysFromNow, "days");
        if (moment().subtract(this.props.weights.length, "days").isAfter(currDate)){
            //currDate is before first user added weight (i.e. it is in pastWeights)
            this.props.addWeight(this.convertWeight(e.target.value), currDate.format("YYYY-MM-DD"));

        } else if (moment().isAfter(currDate) || moment().isSame(currDate)){
            //currDate is between now and first date (inc)
            let newWeight = parseInt(this.state.inputs[i], 10);
            let index = i - this.state.pastProjecting;
            let id = this.props.ids[index];
            this.playSubmissionAnimation(i);
            if (id === null){
                //Weight was interpolated
                this.props.addWeight(this.convertWeight(newWeight), currDate.format("YYYY-MM-DD"))
                .then(() => {
                    this.renderGraph();
                })
            } else {
                //Weight is being changed
                this.props.updateWeight(this.convertWeight(newWeight), id)
                .then(() => {
                    let newInputs = this.state.inputs;
                    newInputs[i] = newWeight;

                    //Find last added weight
                    let diff = 1;
                    for (let j = i - 1 - this.state.pastProjecting; j > -1; j --){
                        if (this.props.ids[j] !== null){
                            break
                        }
                        diff ++;
                    }

                    //If more than one day between added weights, update interpolation
                    let interpWeights = [];
                    if (diff > 1){
                        interpWeights = this.getWeightsBetween(this.state.inputs[i-diff], newWeight, diff);
                    }

                    for (let j = 0; j < interpWeights.length; j ++){
                        newInputs[i - diff + 1 + j] = interpWeights[j]
                    }

                    //Find next added weight
                    diff = 1;
                    for (let j = i + 1 - this.state.pastProjecting; j < this.props.ids.length; j ++){
                        if (this.props.ids[j] !== null){
                            break
                        }
                        diff ++;
                    }
                    if (diff > 1){
                        //Weight changed in the past, but is the most recent change
                        //Fill weights with this value up to today
                        let nextWeight = newWeight
                        if (i + diff < this.state.inputs.length - this.state.futureProjecting){
                            nextWeight = this.state.inputs[i + diff];
                        }
                        interpWeights = this.getWeightsBetween(newWeight, nextWeight, diff);
                    }
                    
                    for (let j = 1; j <= interpWeights.length; j ++){
                        newInputs[i + j] = interpWeights[j-1]
                    }

                    //If changing last added weight, update all future weights
                    if (i + diff < this.state.inputs.length){
                        for (let j = 0; j < this.state.futureProjecting; j ++){
                            newInputs[newInputs.length - 1 - j] = newWeight;
                        }
                    }
                    this.setState({inputs: newInputs}, () => this.renderGraph())
                })
            }
        } else {
            //date is in future
        }
    }
    getWeightsBetween(startWeight, endWeight, diff){
        let newWeights = [];
        if (diff < 2){
            return newWeights;
        }

        let weightDiff = endWeight - startWeight;
        let perDay = weightDiff/diff;
        for (let i = 1; i < diff; i ++){
            newWeights.push(startWeight + i * perDay);
        }
        return newWeights;
    }
    playSubmissionAnimation(i){
        this.setState({adding: i})
    }
    resetSubmissionAnimation = () => {
        this.setState({adding:false})
    }
	convertWeight(weight){
		let weightUnits = this.props.user.weight_units;
		if (weightUnits === "Pounds"){
			return poundsToKg(weight);
		}
		return weight;
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
        let daysInFrame = this.state.daysInFrame;

        //+1 because pure subtraction puts "start" off the frame
        let frameStartIndex = this.state.frameEndIndex - daysInFrame + 1;

        let todayIndex = this.state.inputs.length - this.state.futureProjecting - 1;
        if (todayIndex >= frameStartIndex && todayIndex <= this.state.frameEndIndex){
            frameStartIndex ++; //If today is in the frame, select 1 less weight to be in the frame
        }

        let canvasBox = this.canvas.current.getBoundingClientRect();
        let mouseX = e.clientX - canvasBox.left; //Mouse position relative to scrolled canvas left
        let weights = this.state.inputs;

        let frameIndex = Math.max(Math.min(Math.floor( this.state.daysInFrame * mouseX/canvasBox.width), this.state.daysInFrame-1), 0);
        let mouseIndex = frameIndex + frameStartIndex;
        //frameIndex + 1 pushes the line to the right edge, 
        //this.state.daysInFrame rather than '' - 1 is because # of days in frame is counted, not indexes
        let lineX = canvasBox.width * (frameIndex + 1) / this.state.daysInFrame;

        if (mouseIndex === todayIndex){
            //Cursor is in first half of "Today"
            //push line to the end of today rather than the middle
            lineX = canvasBox.width * (frameIndex + 2) / this.state.daysInFrame;
        } else if (mouseIndex >= todayIndex){
            //Cursor is in second half of "Today"
            //Move the index one back so the correct Y can be found
            mouseIndex --;
        }

        if (frameStartIndex < this.state.pastProjecting){
            //Discount past projected weights, as these will artificially inflate the weight range with 0s
            frameStartIndex = this.state.pastProjecting;
        }

        let weightsInFrame = weights.slice(frameStartIndex, this.state.frameEndIndex + 1);
        let frameMax = 1.02 * Math.max(...weightsInFrame);
        let frameMin = 0.98 * Math.min(...weightsInFrame);

        let lineY;
        if (mouseIndex >= this.state.pastProjecting){
            lineY = canvasBox.height * (1 - (frameMax - weights[mouseIndex]) / (frameMax - frameMin));
        } else {
            lineY = canvasBox.height;
        }
        if (isNaN(lineY)){
            lineY = 0;
        }

        this.setState({
            lineX: lineX-1, 
            lineY: lineY,
        });
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
    onFocus(e, i){
        this.setState({focusedInput: i});
    }
    handleInputClick(i){
        //This is necessary because if the last input in the frame (either side) is focused,
        //  it will not be possible to click off of it
        this.setState({focusedInput: i}, () => {
            this.focusedInput.current.focus();
        })
    }
    handleBlur(){
        let frameStartIndex = this.state.frameEndIndex - this.state.daysInFrame;

        let todayIndex = this.state.inputs.length - this.state.futureProjecting - 1;
        if (todayIndex >= frameStartIndex && todayIndex <= this.state.frameEndIndex){
            frameStartIndex ++; //If today is in the frame, select 1 less weight to be in the frame
        }
        let graphSide = 0;
        if ( this.state.focusedInput - 1 > -1 && this.state.focusedInput === frameStartIndex + 1){
            // Tabbing left

            // If current focus is not the first input, but is the furthest left on the screen,
            // Shift the start date 1 day in the future rather than focusing off
            graphSide = -1

        } else if ( this.state.focusedInput === this.state.frameEndIndex && this.state.focusedInput + 1 < this.state.inputs.length ){
            // Tabbing right
            
            // Currently focused to last input on screen
            // If this is not the last possible input, scroll the graph
            // rather than moving off it
        
            graphSide = 1
        }
        if ( graphSide !== 0 ){
            this.focusedInput.current.focus()
            this.setState({
                graphSide: graphSide
            });
        }
    }
    onKeyUp(e){
        if (e.key === "Tab" && this.state.graphSide !== 0){
            //Tab pressed and focused on last input in frame (left or right)
            let scrollGraphDir = 0;
            let focusInputUpdate = 0;
            if (this.state.graphSide === -1){
                //On the left side
                if (e.shiftKey){
                    //tabbing left
                    scrollGraphDir = -1; //Scroll graph one day back
                    focusInputUpdate = -1; //Shift focused input one day back
                } else {
                    //tabbing right
                    focusInputUpdate = 1;
                }
            } else if (this.state.graphSide === 1){
                //On the right side
                if (!e.shiftKey){
                    //tabbing right
                    scrollGraphDir = 1; //Scroll graph one day forward
                    focusInputUpdate = 1; //Shift focused input one day back
                } else {
                    //tabbing left
                    focusInputUpdate = -1;
                }
            }
            let newEndIndex = this.state.frameEndIndex + scrollGraphDir;
            let startIndex = newEndIndex - this.state.daysInFrame + 1;
            //Update slider bar position
            let todayPercent = startIndex/(this.state.inputs.length-this.state.daysInFrame);
            let barWidth =  this.sliderBar.current.getBoundingClientRect().width;
            let pillWidth = 0.05 * barWidth;
            let sliderLeft = Math.round((barWidth - pillWidth) * todayPercent);

            this.setState({
                graphSide: null,
                frameEndIndex: newEndIndex,
                focusedInput: this.state.focusedInput + focusInputUpdate,
                sliderLeft: sliderLeft
            }, () => {
                this.focusedInput.current.focus();
                this.renderGraph();
            });
        }
    }
    scrollGraph(dir){
        let newEndIndex = this.state.frameEndIndex + dir;
        
        let startIndex = newEndIndex - this.state.daysInFrame + 1;
        if (startIndex < 0 || newEndIndex > this.state.inputs.length - 1){
            return
        }
        //Update slider bar position
        let todayPercent = startIndex/(this.state.inputs.length-this.state.daysInFrame);
        let barWidth =  this.sliderBar.current.getBoundingClientRect().width;
        let pillWidth = 0.05 * barWidth;
        let sliderLeft = Math.round((barWidth - pillWidth) * todayPercent);

        this.setState({
            frameEndIndex: newEndIndex,
            sliderLeft: sliderLeft
        }, () => {
            this.renderGraph();
        });
    }
    render(){
        let user = this.props.user;
        let weights = this.state.inputs;

        //Note that all indexes into ids will need to have this.state.pastProjecting added in order to correspond to the correct input index
        let ids = this.props.ids;

        let daysInFrame = this.state.daysInFrame;
        //+1 because pure subtraction puts "start" off the frame
        let frameStartIndex = this.state.frameEndIndex - daysInFrame + 1;

        let todayIndex = this.state.inputs.length - this.state.futureProjecting - 1;
        if (todayIndex >= frameStartIndex && todayIndex <= this.state.frameEndIndex){
            frameStartIndex ++; //If today is in the frame, select 1 less weight to be in the frame
        }

        let weightsInFrame = weights.slice(frameStartIndex, this.state.frameEndIndex + 1);
        
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

        let canvasWidth = window.innerWidth * 0.975 * 0.975;
        let canvasHeight = window.innerHeight * 0.9 * 0.275;
        let pxPerDay = canvasWidth/daysInFrame;

        return (
            <div id='graph-area' onMouseMove={(e) => this.checkScroll(e)} onTouchEnd={this.scrollRelease} onMouseUp={this.scrollRelease} onMouseLeave={this.scrollRelease} onKeyUp={e => this.onKeyUp(e)}>
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
                    <div className='graph-arrow' id='graph-arrow-left' onClick={() => this.scrollGraph(-1)}><i className='fa fa-angle-left' /></div>
                    <div className='graph-arrow' id='graph-arrow-right' onClick={() => this.scrollGraph(1)}><i className='fa fa-angle-right' /></div>   
                    <div id='graph-scroller' onMouseMove={(e) => this.showGraphLines(e)}>
                        {
                            this.state.adding !== false ? 
                                <FadeInComponent show={this.state.adding} resetSubmissionAnimation={this.resetSubmissionAnimation} style={ {left: (this.state.adding - frameStartIndex)/daysInFrame * 100 + "%"}}/>
                            : null
                        }
                        <div id='dates-container' style={{width: canvasWidth}}>
                            {
                                weightsInFrame.map((weight, i) => {
                                    let date = moment().subtract(this.props.weights.length - 1 - frameStartIndex - i + this.state.pastProjecting, "days").format("YYYY-MM-DD");
                                    let dateInfo = this.dateString(date, pxPerDay, i + frameStartIndex);
                                    return (
                                        <div key={i} style={date === moment().format("YYYY-MM-DD") ? {width: 2*pxPerDay} : {width: pxPerDay} } className={date === moment().format("YYYY-MM-DD") ? 'graph-date level-graph-today' : 'graph-date'}>
                                            {
                                                pxPerDay > 15 ?
                                                    <div className='date-letter-area'>{ dateInfo.dateLetter }</div>
                                                : null
                                            }
                                            <div className='date-number-area'>{ dateInfo.dateString }</div>
                                        </div>
                                    )
                                })
                            }
                        </div>
                        <div id='level-graph-display' style={{width: canvasWidth}}>
                            
                            {
                                user.mode === "0" ?
                                    weightsInFrame.map((weight, i) => {
                                        let date = moment().subtract(this.props.weights.length - 1 - frameStartIndex - i + this.state.pastProjecting, "days");
                                        let onMonth = " on-month";
                                        if (date.month() % 2 === 0){
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
                                        if (date.format("YYYY-MM-DD") === moment().format("YYYY-MM-DD")){
                                            currClassName += " level-graph-today";
                                            currWidth = 2 * pxPerDay;
                                        }
                                        if (i >= this.state.pastProjecting && ids[i - this.state.pastProjecting + frameStartIndex] === null){
                                            currClassName += " interpolated";
                                        }
                                        return (
                                            <div key={i} className={currClassName} style={{width: currWidth, padding: paddingStyle}}>
                                                {
                                                    levelMap.map((levelWeight, j) => {
                                                        let weightOk = this.convertWeight(weight) < levelWeight;
                                                        return (
                                                            <div 
                                                                key={j} 
                                                                className={weightOk ? "level-section weight-ok" + onMonth : "level-section weight-not-ok" + onMonth}>
                                                                {
                                                                    pxPerDay > 30 && date.isAfter(moment().subtract(1, "days"))? 
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
                                        let date = moment().subtract(this.props.weights.length - 1 - frameStartIndex - i + this.state.pastProjecting, "days");
                                        if (date.month() % 2 === 0){
                                            onMonth = "off-month";
                                        }
                                        return (
                                            <div key={i} 
                                                className={date.format("YYYY-MM-DD") === moment().format("YYYY-MM-DD") ? 'level-graph-date level-graph-today' : 'level-graph-date'} 
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
                                    weightsInFrame.map((weight, i) => {
                                        let date = moment().subtract(this.props.weights.length - 1 - frameStartIndex - i + this.state.pastProjecting, "days");
                                        return (
                                            <form
                                                key={i}
                                                className={date.format("YYYY-MM-DD") === moment().format("YYYY-MM-DD") ? 'graph-weight graph-weight-number level-graph-today' : 'graph-weight graph-weight-number'}
                                                style={date.format("YYYY-MM-DD") === moment().format("YYYY-MM-DD") ? {width: 2*pxPerDay} : {width: pxPerDay} }
                                                onSubmit={e => this.handleWeightSubmit(e, i + frameStartIndex)}
                                            >
                                                <input
                                                    ref={i + frameStartIndex === this.state.focusedInput ? this.focusedInput : null}
                                                    onChange={(e) => this.changeWeight(e, i + frameStartIndex)}
                                                    className={date.format("YYYY-MM-DD") === moment().format("YYYY-MM-DD") ? 'graph-weight graph-weight-number level-graph-today' : 'graph-weight graph-weight-number'}
                                                    style={date.format("YYYY-MM-DD") === moment().format("YYYY-MM-DD") ? {width: 2*pxPerDay} : {width: pxPerDay} }
                                                    type='number' 
                                                    step="0.01"
                                                    value={this.state.inputs[i + frameStartIndex]}
                                                    onFocus={(e) => this.onFocus(e, i + frameStartIndex)}
                                                    onBlur={() => this.handleBlur()}
                                                    onClick={() => this.handleInputClick(i + frameStartIndex)}
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