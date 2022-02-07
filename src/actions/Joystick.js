class Joystick {
    constructor (control) {
        this.control = control;
        this.x = 0;
        this.y = 0;
    }

    update (event, controller) {
        let updated = false;

        if ((event.x !== this.x) || (event.y !== this.y)) {
            updated = true;
            this.x = event.x;
            this.y = event.y;
        }

        if (updated) {
            controller.emit(this.control, event, this);
        }
    }
}

export default Joystick;