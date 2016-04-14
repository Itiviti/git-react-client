const initialState = {
  layout: 'compact',
  forward: false
};

export default function(state = initialState, action) {
  switch (action.type) {
    case "SET_LAYOUT":
      return Object.assign({}, state, {layout:action.layout})
    case "forward":
      // TODO
    default:
      return state;
  }
}