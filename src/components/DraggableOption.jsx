import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { ItemTypes } from './Constants';
import { DragSource } from 'react-dnd';

const optionSource = {
	beginDrag(props) {
		return {
			optionId: props.optionId
		};
	}
};

function collect(connect, monitor) {
	return {
		connectDragSource: connect.dragSource(),
		isDragging: monitor.isDragging()
	}
}

class Option extends Component {
	static propTypes = {
		connectDragSource: PropTypes.func.isRequired,
		isDragging: PropTypes.bool.isRequired
	};

	render(){
		const connectDragSource = this.props.connectDragSource;
		return connectDragSource(
			<div className={this.props.targetClass} key={this.props.option}>{this.props.option}</div>
		)
	}
}

Option.propTypes = {
	connectDragSource: PropTypes.func.isRequired,
	isDragging: PropTypes.bool.isRequired
}

export default DragSource(ItemTypes.OPTION, optionSource, collect)(Option);