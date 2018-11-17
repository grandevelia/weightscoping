import React, { Component } from 'react';

let icons={"alcohol":"beer","carbs":"birthday-cake","info":"clipboard","initialWeight":"balance-scale","initialValue":"envelope","plan":"check"};
export default class NavItem extends Component {
	render(){
		return (
			<div className={
				this.props.active ? 'nav-item complete'
				: this.props.fillWith === this.props.pageName ? 'nav-item current'
				: 'nav-item incomplete'
			}>
				<i className={"fa fa-" + icons[this.props.fillWith]} />
			</div>
		)
	}
}