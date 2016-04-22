const initialState = {
  query: {},
  pending: false,
  data: []
};

function search(state = initialState, action) {
  switch (action.type) {
    case "SEARCH_CODES":
      return Object.assign({}, state, {
        time: action.time,
        query: action.query,
        pending: true,
        data: []
      })
    case "RECEIVE_CODES_CHUNK":
      return Object.assign({}, state, {
        data: state.data.concat(action.more)
      })
    case "RECEIVE_CODES_DONE":
      return Object.assign({}, state, {
        pending: false
      })
    default:
      return state;
  }
}

export default function(state = {}, action) {
  switch (action.type) {
    case "SEARCH_CODES":
    case "RECEIVE_CODES_CHUNK":
    case "RECEIVE_CODES_DONE":
      const searchType = action.query.submit;
      return Object.assign({}, state, {
        [searchType]: search(state[searchType], action)
      })
    default:
      return state;
  }
}