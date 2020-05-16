import React, { Component } from 'react';
import { connect } from 'react-redux';
import { auth } from "../actions";
import queryString from 'query-string';
//import { Link } from 'react-router-dom';

import '../css/Login.css';

class ResetPassword extends Component {
    constructor(props) {
        super(props);
        this.state = {
            confirming: true,
            password: ""
        }
    }
    onSubmit = e => {
        e.preventDefault();
        if (this.state.password.length) {
            this.props.updatePassword(this.props.auth.email, this.props.auth.key, this.state.password)
                .then(this.setState({ confirming: false }));
        } else {
            alert("Password is required");
        }
    }
    componentDidMount() {
        let params = queryString.parse(this.props.location.search);
        console.log(params)
        if (params.email && params.key) {
            this.setState({ confirming: true });
            this.props.confirmReset(params.email, params.key);
        }
    }
    render() {
        return (
            <div id='main-area'>
                {
                    this.state.confirming ?
                        this.props.auth.reset ?
                            <form onSubmit={(e) => this.onSubmit(e)} id='reset-input-area'>
                                <div id='new-prompt'>Please enter your new password</div>
                                <div id='input-container'>
                                    <input
                                        type="password"
                                        id="new-password"
                                        placeholder='New Password'
                                        onChange={e => { this.setState({ password: e.target.value }) }}
                                    />
                                    <input
                                        id='update-password-submit'
                                        type="submit"
                                        value="Submit"
                                    />
                                </div>
                            </form>
                            :
                            <div className='reset-failed forgot-container'>
                                Invalid Email and Key
                            </div>
                        : this.props.auth.reset ?
                            <div id='reset-complete' className='reset-okay forgot-container'>
                                <p id='reset-complete-text'>Your password has been updated</p>
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
    }
}

const mapDispatchToProps = dispatch => {
    return {
        updatePassword(email, key, password) {
            return dispatch(auth.updatePassword(email, key, password));
        },
        confirmReset(email, key) {
            return dispatch(auth.confirmReset(email, key));
        }
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(ResetPassword);