import React, { Component } from 'react';
import { withRouter } from 'react-router'
import { connect } from 'react-redux';
import { intro } from "../actions";
import Layout from './Layout';
import { Route } from 'react-router-dom';
import FirstPage from './FirstPage';
import SecondPage from './SecondPage';
import ThirdPage from './ThirdPage.jsx';
import FourthPage from './FourthPage';
import PaymentPrompt from './PaymentPrompt';
import FifthPage from './FifthPage';
import SixthPage from './SixthPage';
import SignupOption from './SignupOption';
import Login from './Login';
import RegistrationConfirmation from './RegistrationConfirmation';
import CompleteRegistration from './CompleteRegistration';
import ForgotPassword from './ForgotPassword';
import ResetPassword from './ResetPassword';

class Intro extends Component {
	updateIntroState(update){
		this.props.updateIntroState(update);
	}
	render(){
		return(
			<Layout email={this.props.auth.email} pageName={this.props.location.pathname} intro={this.props.intro}>
				<Route exact path={this.props.match.path} render={() => 
					<FirstPage {...this.props.intro} updateIntroState={(key,value) => this.updateIntroState(key,value)}/>} 
				/>
				<Route path='/SecondPage' render={() => 
					<SecondPage {...this.props.intro} updateIntroState={(key,value) => this.updateIntroState(key,value)}/>} 
				/>
				<Route path='/ThirdPage' render={() => 
					<ThirdPage {...this.props.intro} updateIntroState={(key,value) => this.updateIntroState(key,value)}/>} 
				/>
				<Route path='/FourthPage' render={() => 
					<FourthPage {...this.props.intro} updateIntroState={(key,value) => this.updateIntroState(key,value)}/>} 
				/>
				<Route path='/PaymentPrompt' render={() => 
					<PaymentPrompt {...this.props.intro} updateIntroState={(key,value) => this.updateIntroState(key,value)}/>} 
				/>
				<Route path='/FifthPage' render={() => 
					<FifthPage {...this.props.intro} updateIntroState={(key,value) => this.updateIntroState(key,value)}/>} 
				/> 
				<Route path='/SixthPage' render={() => 
					<SixthPage {...this.props.intro} updateIntroState={(key,value) => this.updateIntroState(key,value)}/>} 
				/>
				<Route path='/SignupOption' render={() => 
					<SignupOption {...this.props.intro} updateIntroState={(key,value) => this.updateIntroState(key,value)}/>} 
				/>
				<Route path="/RegistrationConfirmation" component={ RegistrationConfirmation } />
				<Route path="/CompleteRegistration" component={ CompleteRegistration } />
				<Route path='/Login' component={ Login } />
                <Route path="/ForgotPassword" component={ ForgotPassword } />
                <Route path="/ResetPassword" component={ ResetPassword } />
			</Layout>
		);
	}
}
const mapStateToProps = state => {
	return {
		intro: state.intro
	}
}

const mapDispatchToProps = dispatch => {
	return {
		updateIntroState: (update) => {
			return dispatch(intro.updateIntroState(update))
		}
	}
}

export default withRouter(connect(mapStateToProps, mapDispatchToProps)(Intro));
