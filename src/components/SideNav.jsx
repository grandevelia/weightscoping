import React, { Component } from 'react';

let icons=["beer","birthday-cake","clipboard","balance-scale","envelope","check"];
export default class NavItem extends Component {
	render(){
		return (
			<div className={
				this.props.active ? 'nav-item complete'
				: this.props.current === this.props.pageName ? 'nav-item current'
				: 'nav-item incomplete'
			}>
				{this.props.active ? 
					<Link to={this.props.pageName}>
						<i className={"fa fa-" + icons[this.props.icon]} />
					</Link> : <i className={"fa fa-" + icons[this.props.icon]} />
				}
			</div>
		)
	}
}