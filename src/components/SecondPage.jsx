import React, { Component } from 'react';

import { Link, Redirect } from 'react-router-dom';
import { connect } from 'react-redux';
import { intro } from "../actions";
import InteractionArea from './InteractionArea';
import '../css/SecondPage.css';

let carbOptions = ["Breads","Pasta/Rice","Potatoes","Dessert","Soft Drinks","Snack Carbs","Cereals","Hard Alcohol","Beer/Wine"];
let optionsLen = 9;

class SecondPage extends Component {
	moveOption(optionId, toId){
		this.props.moveOption(optionId, toId);
	}
	checkAlcoholChange(){
		if (this.props.alcohol === "false" && carbOptions.length === optionsLen){
			carbOptions.splice(optionsLen-2,2);
		} else if (this.props.alcohol === "true" && carbOptions.length !== optionsLen){
			carbOptions.push.apply(carbOptions, ["Hard Alcohol", "Beer/Wine"]);
		}
	}
	render(){
		if (this.props.alcohol === null){
			return <Redirect to="/FirstPage" />
		}
		this.checkAlcoholChange();
		let positions = this.props.carbRanks;
		return (
			<div id='second-wrap'>
				
				<h3 className="page-intro">Rate the following in order of how much you enjoy them</h3>
				<div id='drag-and-drop-hint'>(Drag and drop from most favorite to least)</div>

				<InteractionArea options={carbOptions} positions={positions} moveOption={(optionId, toId) => this.moveOption(optionId, toId)}/>

				{positions.indexOf(null) < 0 ?
					<p>
			        	<Link to='/ThirdPage/' className='intro-nav'>NEXT: Find Your Ideal Weight</Link>
					</p>
					: null
				}
				<p>
					<Link to='/FirstPage' className='intro-nav back'>Back</Link>
				</p>
			</div>
		)
	}
}


const mapStateToProps = state => {
  return {
    positions: state.intro.carbRanks
  }
}

const mapDispatchToProps = dispatch => {
	return {
    	moveOption: (optionId, toId) => {
      		return dispatch(intro.moveOption(optionId, toId))
      	}
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(SecondPage);