class Pointer {
    constructor (control) {
        this.control = control;
        this.value = 0;
        this.x = 0;
        this.y = 0;
    }

    update (event, controller) {
        let updated = false;

        if ((event.value !== this.value) || (event.x !== this.x) || (event.y !== this.y)) {
            updated = true;
            this.value = event.value;
            this.x = event.x;
            this.y = event.y;
        }

        if (updated) {
            controller.emit(this.control, event, this);
        }
    }
}

export default Pointer;