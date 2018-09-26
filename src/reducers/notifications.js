const initialState = [

];

export default function notifications(state=initialState, action){
	let notificationList = state.slice();

	switch (action.type) {

		case 'FETCH_NOTIFICATIONS':
			return [...action.notifications];

		case 'ADD_NOTIFICATION': {
			notificationList.unshift(action.notification);
			return notificationList;
		}

		case 'UPDATE_NOTIFICATION': {
			let index = -1;
			for (let i = 0; i < notificationList.length; i ++){
				if (notificationList[i].id === action.id){
					index = i;
					break;
				}
			}
			if (index < 0){
				alert("Undefined notification");
				return;
			}
		    notificationList[index].read = true;
			return notificationList;
		}
			
		default:
			return state;
	}
}