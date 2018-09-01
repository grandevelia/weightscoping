import React, { Component } from 'react';
import {Link} from 'react-router-dom';
import '../css/ThirdPage.css';
import {averageAlgs, idealWeightString, calcHeightInches} from './utils';

export default class ThirdPage extends Component {
	state={
		sexAbout: false
	}
	sexAboutToggle(){
		this.setState({
			sexAbout: !this.state.sexAbout,
		})
	}
	enterHeight(e, unit){
		if (unit === "FEET"){
			this.setState({
				heightFeet: e.target.value
			})
		} else if (unit === "INCHES"){
			this.setState({
				heightInches: e.target.value
			})
		} else if (unit === "CM"){
			this.setState({
				heightCm: e.target.value
			})
		}
	}
	enterSex(e){
		this.setState({
			sex: e.target.value
		})
	}
	setWeight(){
		let heightInches = calcHeightInches(this.state);
		this.setState({idealWeight: averageAlgs((parseInt(heightInches,10) * 12 + parseInt(heightInches,10)), this.state.sex)});
	}
	render(){
		let sexChecked = "checked";
		let femaleChecked = "";
		let maleChecked = "";
		let otherChecked = "";
		if (this.props.sex === 'female'){
			femaleChecked = sexChecked;
		} else if (this.props.sex === 'male'){
			maleChecked = sexChecked;
		} else if (this.props.sex === 'other'){
			otherChecked = sexChecked;
		}
		return (
			<div id='third-wrap'>
				<h1>Let's Find Your Ideal Weight</h1>
				<form>
					<p>
						Measure weight in:
						<select onChange={(e) => this.props.updateIntroState("weightUnits", e.target.value)}>
							<option>Pounds</option>
							<option>Kilograms</option>
							<option>Stones</option>
						</select>
					</p>
					<p>
						Measure height in:
						<select onChange={(e) => this.props.updateIntroState("heightUnits", e.target.value)}>
							<option>Feet / Inches</option>
							<option>Centimeters</option>
						</select>
					</p>
					<p id='biological-sex' className='input-block'>
						<span id='sex-title'>Biological Sex:</span>
						<span id='sex-button-area'>
				            <input checked={femaleChecked} onChange={(e) => this.props.updateIntroState("sex", e.target.value)} id='sex-female' type='radio' name='sex' value='female'/>
				            <label htmlFor='sex-female'>Female</label>
							<input checked={maleChecked} onChange={(e) => this.props.updateIntroState("sex", e.target.value)} id='sex-male' type='radio' name='sex' value='male' />
				            <label htmlFor='sex-male'>Male</label>
							<input checked={otherChecked} onChange={(e) => this.props.updateIntroState("sex", e.target.value)} id='sex-other' type='radio' name='sex' value='other' />
				            <label htmlFor='sex-other'>Other</label>
			            </span>
		            </p>
		            <span id='sex-about' onClick={() => this.sexAboutToggle()}>
		            	Why do we ask?
		            </span>
		            {this.state.sexAbout? 
			            <span id='sex-about-lightbox'>
			            	<h2>Why Does Biological Sex Matter?</h2>
			            	The formulas we use to calculate "ideal weight" are based on cys-gendered parameters. If you select "other" your ideal weight will be the average of the male and female outputs for your height. 
			            	<span id='close-sex-about' onClick={() => this.sexAboutToggle()}>Close</span>
			            </span> : null
			        }
					<p id='height'>
			            <span id='height-title'>Height:</span>
			            {this.state.heightUnits === "Feet / Inches"?
				            <span id='height-buttons'>
					            <input type='number' onChange={(e) => this.enterHeight(e, "FEET")} placeholder='Feet'/>
					            <input type='number' onChange={(e) => this.enterHeight(e, "INCHES")} placeholder='Inches' min='0'/>
				            </span> :
				            <span id='height-buttons'>
					            <input type='number' id='metric' onChange={(e) => this.enterHeight(e, "CM")} placeholder='Centimeters'/>
				            </span> 
				        }	
			        </p>
				</form>
				<div>
				{(this.state.heightUnits === "Feet / Inches" && this.state.heightFeet !== 0 && this.state.heightInches !== 0) || (this.state.heightUnits === "Centimeters" && this.state.heightCm !== 0) ?
			        <div>
			        	<div id='weight-area'>{"Your ideal weight is " + idealWeightString(this.state)}</div>
				        <Link to='/PaymentPrompt'
				        	onClick={
				        	 	() => {
				        	 			let heightInches = calcHeightInches(this.state);
					        	 		this.props.updateIntroState("THIRD",{
							        		weightUnits: this.state.weightUnits, 
							        		heightUnits: this.state.heightUnits, 
							        		heightInches: heightInches, 
							        		sex: this.state.sex, 
							        		idealWeightKg: averageAlgs(heightInches, this.state.sex)
							        	});
					        		}
				        	 	}
					        className='intro-nav'>NEXT: Find your incentive layers
					    </Link>
					</div> : null
				}
				</div>
				<Link to='/SecondPage' className='intro-nav back'>Back</Link>
			</div>
			//Find algorithm for finding ideal weight, average 4 formulas on ideal weight calculator from calculators.net
		)
	}
}