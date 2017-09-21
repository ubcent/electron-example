// @flow
import { combineReducers } from 'redux-immutable';
import { routerReducer as router } from 'react-router-redux';
import host from './host';
import env from './env';

const rootReducer = combineReducers({
  host,
  env,
  router
});

export default rootReducer;
