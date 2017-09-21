import { Map, fromJS } from 'immutable';
import {handleActions} from 'redux-actions';

import * as actions from '../actions/env';

const initialState = new Map({
  ip: null
});

export default handleActions({
  [actions.setEnvProp]: (state, action) => {
    const { name, value } = action.payload;
    return state.set(name, value);
  }
}, initialState);
