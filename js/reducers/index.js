import {combineReducers} from 'redux';
import settings from './settings';
import search from './search';

export default combineReducers({
  settings,
  search
});