export const updateIntroState = (update) => {
	return (dispatch, getState) => {
		dispatch({
			type: 'UPDATE',
			update: update
		});
	}
}
export const moveOption = (optionId, toId) => {
	return (dispatch, getState) => {
		dispatch({
			type: 'POSITION_CHANGE',
			optionId: optionId,
			toId: toId
		});
	}
}