// @flow
import { createStore, applyMiddleware } from 'redux';
import thunk from 'redux-thunk';
import { createBrowserHistory } from 'history';
import { routerMiddleware } from 'react-router-redux';
import createIpc, { send } from 'redux-electron-ipc';
import rootReducer from '../reducers';
import * as hostActions from '../actions/host';
import * as envActions from '../actions/env';

const ipc = createIpc({
  'addHost': hostActions.addHost,
  'setEnvProp': envActions.setEnvProp
});

const history = createBrowserHistory();
const router = routerMiddleware(history);
const enhancer = applyMiddleware(thunk, router, ipc);

function configureStore(initialState) {
  const store = createStore(rootReducer, initialState, enhancer);
  setTimeout(() => {store.dispatch(send('ping', 'redux', 'electron', 'ipc'))}, 3000);
  return store;
}

export default { configureStore, history };
