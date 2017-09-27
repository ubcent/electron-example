import {createAction} from 'redux-actions';

export const addHost = createAction('CREATE_HOST', (sender, data) => data);
export const updateHost = createAction('UPDATE_HOST', (sender, data) => data);
