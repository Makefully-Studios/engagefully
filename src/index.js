/**
 * @namespace engagefully
 */
/* global window */
import Controller from './Controller';
import ActionMap from './ActionMap';
import actions from './actions';
import devices from './devices';
import { quantizeStick } from './utils/quantizeStick';
import { focusGate } from './utils/focusGate';

window.engagefully = {
    Controller,
    ActionMap,
    actions,
    devices,
    quantizeStick,
    focusGate
};

export {
    Controller,
    ActionMap,
    actions,
    devices,
    quantizeStick,
    focusGate
};
