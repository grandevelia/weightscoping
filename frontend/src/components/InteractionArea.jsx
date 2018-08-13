import React, { Component } from 'react';

import { DragDropContext } from 'react-dnd';
import HTML5Backend from 'react-dnd-html5-backend';

import DraggableOption from './DraggableOption';
import DraggableTarget from './DraggableTarget';

class InteractionArea extends Component {

	render(){
		let options = this.props.options;
		let positions = this.props.positions;
		return (

			<div id='interaction-area'>
				<div id='carb-places'>
				{positions.map((position,i) => {
					let selectedElement = null;
					if (position !== null){
						selectedElement = <DraggableOption targetClass="selected-option" optionId={positions[i]} option={options[position]}/>
					}
					return (
						<div className='target-area' key={"wrap-" + i}><span key={"span-" + i}>{(i+1) + ")"}</span>
							<DraggableTarget moveOption={this.props.moveOption} targetClass="target-hover-child" key={i} id={i}>{selectedElement}</DraggableTarget>
						</div>
					)
				})}
				</div>
				<div id='carb-options'>
				{options.map((option, i) => {
					if (positions.indexOf(i) < 0){
						return <DraggableOption targetClass="carb-option" key={option} optionId={i} option={option}/>
					}
					return null;
				})}
				</div>
			</div>
		)
	}
}

export default DragDropContext(HTML5Backend)(InteractionArea);

