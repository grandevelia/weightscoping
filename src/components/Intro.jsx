import React, { Component } from 'react';
import AlcoholPage from './AlcoholPage';
import CarbsPage from './CarbsPage';
import UserInfoPage from './UserInfoPage.jsx';
import InitialWeightPage from './InitialWeightPage';
import InitialValuePage from './InitialValuePage';
import PlansPage from './PlansPage';
import InitialCommitPage from './InitialCommitPage';
import SignupPage from './SignupPage';
import NavItem from './SideNav';
import '../css/Intro.css';

export default class Intro extends Component{
	state = {
		alcohol: null,
		carbRanks: [null, null, null, null, null, null, null, null, null],
		sex: null,
		height: null,
		weightUnits: '',
		heightUnits: '',
		idealWeightKg: null,
		initialWeight: null,
		initialValue: null,
		plan: null,
		confirmPayment: false
	}
	updateIntroState(newState){
		if ('alcohol' in newState && newState.alcohol !== null){
			//changing this.state.alcohol requires it to be null, so it always will always be if this is reached
			if (newState.alcohol === true){
				let carbRanks = this.state.carbRanks;
				if (carbRanks.length === 7){
					carbRanks = carbRanks.concat([null, null]);
				}
				this.setState({
					alcohol: true,
					carbRanks: carbRanks
				});
			} else if (newState.alcohol === false){
				let carbRanks = this.state.carbRanks;
				if (carbRanks.length === 9){
					carbRanks.splice(7, 2);
				}
				this.setState({
					alcohol: false,
					carbRanks: carbRanks
				});
			}
		} else {
			this.setState(newState);
		}
	}
	render(){
		return(
			<div id='main-area'>
				<div id='navigation-area'>
					<NavItem fillWith="alcohol" onClick={() => this.updateIntroState({alcohol: null})}  icon={0} active={this.state.alcohol !== null}/>
					<NavItem fillWith="carbs" onClick={() => this.updateIntroState({carbRanks: [null, null, null, null, null, null, null, null, null]})}  icon={1} active={this.state.carbRanks.indexOf(null) < 0}/>
					<NavItem fillWith="info" onClick={() => this.updateIntroState({sex: null})}  icon={2} active={this.state.sex !== null && this.state.height !== null && this.state.weightUnits !== '' && this.state.heightUnits !== ''}/>
					<NavItem fillWith="initialWeight" onClick={() => this.updateIntroState({initialWeight: null})} icon={3} active={this.state.initialWeight !== null}/>
					<NavItem fillWith="initialValue" onClick={() => this.updateIntroState({initialValue: null})}  icon={4} active={this.state.initialValue !== null}/>
					<NavItem fillWith="plan" onClick={() => this.updateIntroState({plan: null})} icon={5} active={this.state.plan !== null}/>
					<NavItem fillWith="commit" onClick={() => this.updateIntroState({commit: null})} icon={6} active={this.state.confirmPayment !== false}/>
					<NavItem fillWith="signup" icon={7} active={false}/>
				</div>
				<div id='intro-wrap'>
					{
						this.state.alcohol === null ?
							<AlcoholPage {...this.state} updateIntroState={(newState) => this.updateIntroState(newState)}/>
						: this.state.carbRanks.indexOf(null) >= 0 ?
							<CarbsPage {...this.state} updateIntroState={(newState) => this.updateIntroState(newState)}/>
						: this.state.sex === null || this.state.heightUnits === '' || this.state.weightUnits === '' || this.state.height === null ?
							<UserInfoPage {...this.state} updateIntroState={(newState) => this.updateIntroState(newState)}/>
						: this.state.initialWeight === null ?
							<InitialWeightPage {...this.state} updateIntroState={(newState) => this.updateIntroState(newState)}/>
						: this.state.initialValue === null ?
							<InitialValuePage {...this.state} updateIntroState={(newState) => this.updateIntroState(newState)}/>
						: this.state.plan === null ?
							<PlansPage {...this.state} updateIntroState={(newState) => this.updateIntroState(newState)}/>
						: this.state.confirmPayment === false ?
							<InitialCommitPage {...this.state} updateIntroState={(newState) => this.updateIntroState(newState)}/>
						:
							<SignupPage {...this.state} updateIntroState={(newState) => this.updateIntroState(newState)}/>
					}
				</div>
			</div>
		)
	}
}
