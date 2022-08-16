class Dial {
    constructor (control) {
        this.control = control;
        this.value = 0;
    }

    update (event, controller) {
        if (event.value !== this.value) {
            this.value = event.value;
            controller.emit(this.control, event, this);
        }
    }
}

export default Dial;