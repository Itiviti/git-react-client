import {createStore} from 'redux';
import rootReducer from '../reducers';

const STORE_NAME = 'APP_STORE';
const initialState = JSON.parse(localStorage.getItem(STORE_NAME) || "{}");

export default function() {
  const store = createStore(rootReducer, initialState);
  store.subscribe(() => {
    localStorage.setItem(STORE_NAME, JSON.stringify(store.getState()));
  });
  return store;
}