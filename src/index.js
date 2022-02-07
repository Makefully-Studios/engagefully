/**
 * @namespace engagefully
 */
/* global window */
import Controller from './Controller';
import actions from './actions';
import devices from './devices';

window.engagefully = {
    Controller,
    actions,
    devices
};

export {
    Controller,
    actions,
    devices
};
