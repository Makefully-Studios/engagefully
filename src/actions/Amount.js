class Amount {
    constructor (control) {
        this.control = control;
        this.value = 0;
    }

    update (event, controller) {
        let updated = false;

        if (event.value !== this.value) {
            updated = true;
            this.value = event.value;
        }

        if (updated) {
            controller.emit(this.control, event, this);
        }
    }
}

export default Amount;