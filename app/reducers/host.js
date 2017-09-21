import { Map, fromJS } from 'immutable';
import {handleActions} from 'redux-actions';

import * as actions from '../actions/host';

const initialState = new Map();

export default handleActions({
  [actions.addHost]: (state, action) => {
    const { ip, source, type } = action.payload;
    if(state.has(ip) && state.getIn([ip, 'type']) == 'printer') {
      return state;
    } else {
      return state.set(ip, fromJS({ type, source }));
    }
  }
}, initialState);