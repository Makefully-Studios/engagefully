class Drop {
    constructor (control) {
        this.control = control;
        this.value = '';
        this.x = 0;
        this.y = 0;
    }

    update (event, controller) {
        if ((event.value !== this.value) || (event.x !== this.x) || (event.y !== this.y)) {
            this.value = event.value;
            this.x = event.x;
            this.y = event.y;
            controller.emit(this.control, event, this);
        }
    }
}

export default Drop;