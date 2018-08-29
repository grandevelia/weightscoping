import React, { Component } from 'react';
import { connect } from 'react-redux';
class Plans extends Component {
    render(){
        return(
            <div>
                Plans
            </div>
        )
    }
}

const mapStateToProps = state => {
	return {
		auth: state.auth
	}
}

const mapDispatchToProps = dispatch => {
	return {
	}
}

export default connect(mapStateToProps, mapDispatchToProps)(Plans);