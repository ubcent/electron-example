import { createStore, applyMiddleware, compose } from 'redux';
import thunk from 'redux-thunk';
import { createHashHistory } from 'history';
import { routerMiddleware, routerActions } from 'react-router-redux';
import { createLogger } from 'redux-logger';
import rootReducer from '../reducers';
import * as hostActions from '../actions/host';
import * as envActions from '../actions/env';
//import type { counterStateType } from '../reducers/counter';

import createIpc, { send } from 'redux-electron-ipc';

const history = createHashHistory();

const configureStore = (initialState) => {
  // Redux Configuration
  const middleware = [];
  const enhancers = [];

  const ipc = createIpc({
    'addHost': hostActions.addHost,
    'setEnvProp': envActions.setEnvProp
  });
  middleware.push(ipc);

  // Thunk Middleware
  middleware.push(thunk);

  // Logging Middleware
  const logger = createLogger({
    level: 'info',
    collapsed: true
  });
  middleware.push(logger);

  // Router Middleware
  const router = routerMiddleware(history);
  middleware.push(router);

  // Redux DevTools Configuration
  const actionCreators = {
    ...hostActions,
    ...routerActions,
  };
  // If Redux DevTools Extension is installed use it, otherwise use Redux compose
  /* eslint-disable no-underscore-dangle */
  const composeEnhancers = window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__
    ? window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__({
      // Options: http://zalmoxisus.github.io/redux-devtools-extension/API/Arguments.html
      actionCreators,
    })
    : compose;
  /* eslint-enable no-underscore-dangle */

  // Apply Middleware & Compose Enhancers
  enhancers.push(applyMiddleware(...middleware));
  const enhancer = composeEnhancers(...enhancers);

  // Create Store
  const store = createStore(rootReducer, initialState, enhancer);

  if (module.hot) {
    module.hot.accept('../reducers', () =>
      store.replaceReducer(require('../reducers')) // eslint-disable-line global-require
    );
  }
  setTimeout(() => {store.dispatch(send('ping', 'redux', 'electron', 'ipc'))}, 3000);
  return store;
};

export default { configureStore, history };
