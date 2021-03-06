import React, { Component } from 'react';
import { averageAlgs, idealWeightString, calcHeightInches } from './utils';

export default class UserInfoPage extends Component {
	state={
		sexAbout: false,
		primary: "",
		secondary: "",
	}
	sexAboutToggle(){
		this.setState({
			sexAbout: !this.state.sexAbout,
		})
	}
	enterHeight(e, unit){
		if (e.target.value < 0){
			alert("Height must be positive");
			return;
		}
		if (unit === "PRIMARY"){
			this.setState({
				primary: e.target.value
			})
		} else if (unit === "SECONDARY"){
			if (e.target.value > 11){
				alert("Inches must be less than 12");
			} else {
				this.setState({
					secondary: e.target.value
				})
			}
		}
	}
	enterSex(e){
		this.setState({
			sex: e.target.value
		})
	}
	render(){
		let femaleChecked = "";
		let maleChecked = "";
		let otherChecked = "";
		if (this.props.sex === 'female'){
			femaleChecked = 'checked';
		} else if (this.props.sex === 'other'){
			otherChecked = 'checked';
		} else if (this.props.sex === 'male'){
			maleChecked = 'checked';
		}
		return (
			<div id='user-info-wrap'>
				<h2>Let's Find Your Ideal Weight</h2>
				<form id='user-info-form'>
					<p>
						Measure weight in:
						<select value={this.props.weightUnits} onChange={(e) => this.props.updateIntroState({weightUnits: e.target.value})}>
							<option value=''>Select</option>
							<option>Pounds</option>
							<option>Kilograms</option>
							<option>Stones</option>
						</select>
					</p>
					<p>
						Measure height in:
						<select value={this.props.heightUnits} onChange={(e) => this.props.updateIntroState({heightUnits: e.target.value})}>
							<option value=''>Select</option>
							<option>Feet / Inches</option>
							<option>Centimeters</option>
						</select>
					</p>
					<p id='biological-sex' className='input-block'>
						<span id='sex-title'>Biological Sex:</span>
						<span id='sex-button-area'>
				            <input checked={femaleChecked} onChange={(e) => this.props.updateIntroState({sex: e.target.value})} id='sex-female' type='radio' name='sex' value='female'/>
				            <label htmlFor='sex-female'>Female</label>
							<input checked={maleChecked} onChange={(e) => this.props.updateIntroState({sex: e.target.value})} id='sex-male' type='radio' name='sex' value='male' />
				            <label htmlFor='sex-male'>Male</label>
							<input checked={otherChecked} onChange={(e) => this.props.updateIntroState({sex: e.target.value})} id='sex-other' type='radio' name='sex' value='other' />
				            <label htmlFor='sex-other'>Other</label>
			            </span>
		            </p>
		            <span id='sex-about' onClick={() => this.sexAboutToggle()}>Why do we ask?</span>
		            {
						this.state.sexAbout ? 
							<span id='sex-about-lightbox'>
								<h2>Why Does Biological Sex Matter?</h2>
								<p>The formulas we use to calculate "ideal weight" are based on cys-gendered parameters. If you select "other" your ideal weight will be the average of the male and female formulas for your height. </p>
								<span id='close-sex-about' onClick={() => this.sexAboutToggle()}>Close</span>
							</span> : null
			        }
					<p id='height'>
			            <span id='height-title'>Height:</span>
			            {
							this.props.heightUnits === "Feet / Inches" ?
								<span id='height-buttons'>
									<input type='number' value={this.state.primary} onChange={(e) => this.enterHeight(e, "PRIMARY")} placeholder='Feet'/>
									<input type='number' value={this.state.secondary} onChange={(e) => this.enterHeight(e, "SECONDARY")} placeholder='Inches'/>
								</span> 
							:
								<span id='height-buttons'>
									<input type='number' id='metric' value={this.state.primary} onChange={(e) => this.enterHeight(e, "PRIMARY")} placeholder='Centimeters'/>
								</span> 
				        }	
			        </p>
				</form>
				<div>
				{(this.props.heightUnits === "Feet / Inches" && this.state.primary !== "" && this.state.secondary !== "") || (this.props.heightUnits === "Centimeters" && this.state.primary >= 100 && this.state.primary !== "") ?
			        <div>
			        	<div id='weight-area'>{"Your ideal weight is " + idealWeightString(this.props.weightUnits, this.props.heightUnits, this.props.sex, this.state.primary, this.state.secondary)}</div>
				        <div onClick={
				        	 	() => {
				        	 			let heightInches = calcHeightInches(this.props.heightUnits, this.state.primary, this.state.secondary);
					        	 		this.props.updateIntroState({
							        		height: heightInches,
							        		idealWeightKg: averageAlgs(heightInches, this.props.sex)
							        	});
					        		}
				        	 	}
					        className='intro-nav'>NEXT: Find your incentive layers
					    </div>
					</div> : null
				}
				</div>
				<div onClick={() => {
					let resetRanks = [];
					for (let i = 0; i < this.props.carbRanks.length; i ++){
						resetRanks.push(null);
					}
					this.props.updateIntroState({carbRanks: resetRanks});
				}} className='intro-nav back'>Back</div>
			</div>
		)
	}
}