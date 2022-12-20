class Data {
    constructor (control) {
        this.control = control;
        this.value = null;
    }

    update (event, controller) {
        this.value = event.value;
        controller.emit(this.control, event, this);
    }
}

export default Data;