class Joystick {
    constructor (control) {
        this.control = control;
        this.x = 0;
        this.y = 0;
    }

    update (event, controller) {
        if ((event.x !== this.x) || (event.y !== this.y)) {
            this.x = event.x;
            this.y = event.y;
            controller.emit(this.control, event, this);
        }
    }
}

export default Joystick;