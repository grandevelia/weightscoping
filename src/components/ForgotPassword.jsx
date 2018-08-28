import React, { Component } from 'react';
import '../css/Login.css';
import { connect } from 'react-redux';
import { auth } from "../actions";

class ForgotPassword extends Component {
    constructor(props){
        super(props);
        this.state = {
            email: props.email || ""
        }
    }
    submitReset = (e) => {
        e.preventDefault();
        if (this.state.email.length){
            this.props.resetPassword(this.state.email);
        } else {
            alert("Email is required.");
            return false;
        }
    }
    render(){
        return (
            <div>
            {this.props.auth.reset === null ?
                <form id='forgot-input-area' className='forgot-container' onSubmit={(e) => this.submitReset(e)}>
                    <input
                        type='text' 
                        id='forgot-pass-email' 
                        placeholder='Enter Your Email'
                        onChange={e => this.setState({email: e.target.value})}
                    />
                    <input
                        type='submit'
                        id='forgot-pass-submit'
                    />
                </form> 
            : this.props.auth.reset === true ?
                <div className='reset-okay forgot-container'>
                    A reset link was sent to {this.props.email}. Click the link it contains to reset your password.
                </div> 
            :
                <div className='reset-failed forgot-container'>
                    Your password could not be reset.
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
        email: state.auth.email
	}
}

const mapDispatchToProps = dispatch => {
	return {
		resetPassword: (email) => {
			return dispatch(auth.resetPassword(email));
        }
	}
}

export default connect(mapStateToProps, mapDispatchToProps)(ForgotPassword);