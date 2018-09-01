import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import '../css/FirstPage.css';

export default class FirstPage extends Component {
	state = {
		registering: false
	}
	render(){
		return (
			<div id='intro-wrap'>
				{this.state.registering ? 
					<span>
						<h2 className='page-intro'>First: Do you drink alcohol?</h2>
						<p> 
							
							<input id='alcohol-yes' type='radio' name='alcohol' value={true} className={this.props.alcohol === "true" ? 'alcohol-selected' : ''} onChange={(e) => this.props.updateIntroState({alcohol: e.target.value})}  />
							<label htmlFor='alcohol-yes'>YES</label>
							<input id='alcohol-no' type='radio' name='alcohol' value={false} className={this.props.alcohol === "false" ? 'alcohol-selected' : ''} onChange={(e) => this.props.updateIntroState({alcohol: e.target.value})} />
							<label htmlFor='alcohol-no'>NO</label>
						</p>
						<p>
							{this.props.alcohol !== null ?
								<Link to='/SecondPage' className='intro-nav'>NEXT: Choose your favorite carbs</Link>
								: null
							}
						</p>
					</span>
				: 
					<span>
						<p className="app-intro">
							You're here to get thin. Let's start.
						</p>
						<p id='login-or-register'>
							<span onClick={() => this.setState({registering:true})} id='first-page-register' className='login-or-register-option'>Register</span>
							<Link to="/Login" id='first-page-login' className='login-or-register-option'>Login</Link>
						</p>
					</span>
				}
		    </div>
		)
	}
}