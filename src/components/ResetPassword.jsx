import React, { Component } from 'react';
import '../css/Login.css';
import { Link } from 'react-router-dom';
import { connect } from 'react-redux';
import { auth } from "../actions";
import queryString from 'query-string';

class ResetPassword extends Component {
    constructor(props){
        super(props);
        this.state = {
            confirming: true,
            password: "",
            confirmPassword: ""
        }
    }
    onSubmit = e => {
		e.preventDefault();
		if (this.state.password.length){
			if (this.state.password === this.state.confirmPassword){
                this.props.updatePassword(this.props.auth.email, this.props.auth.key, this.state.password)
                .then(this.setState({confirming: false}));
			} else {
				alert("Password fields don't match");
			}
		} else {
			alert("Password is required");
		}
	}
    componentDidMount(){
        let params = queryString.parse(this.props.location.search);
        if (params.email && params.key){
            this.setState({confirming: true});
            this.props.confirmReset(params.email, params.key);
        }
	}
    render(){
        return (
            <div>
                {this.state.confirming ? 
                    this.props.auth.reset ?
                        <form onSubmit={(e) => this.onSubmit(e)} id='reset-input-area'>
                            <input
                                type="password" 
                                id="password" 
                                placeholder='New Password'
							    onChange={e => {this.setState({password: e.target.value})}} 
                            />
							<input
                                type="password" 
                                id="confirm-password" 
                                placeholder='Confirm Password'
                                onChange={e => {this.setState({confirmPassword: e.target.value})}}
                            />
                            <input
                                id='update-password-submit'
                                type="submit"
                            />
                        </form>
                    :
                    <div className='reset-failed forgot-container'>
                        Invalid Username and Key
                    </div> 
                :
                    this.props.auth.reset ?
                        <div id='reset-complete' className='reset-okay forgot-container'>
                            <p>Your password has been updated</p>
                            <Link to='/Login'>Log In</Link>
                        </div> 
                        :
                        <div className='reset-failed forgot-container'>
                            {this.props.auth.errors.error}
                        </div> 
             }
            </div>
        )
    }
}
const mapStateToProps = state => {
    return {
        auth: state.auth,
        errors: state.auth.errors,
        email: state.intro.email
    }
}

const mapDispatchToProps = dispatch => {
    return {
        updatePassword(email, key, password){
            return dispatch(auth.updatePassword(email, key, password));
        },
        confirmReset(email, key){
            return dispatch(auth.confirmReset(email, key));
        }
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(ResetPassword);