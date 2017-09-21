import {createAction} from 'redux-actions';

export const setEnvProp = createAction('SET_ENV_PROP', (sender, data) => data);
