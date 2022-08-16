class Button {
    constructor (control) {
        this.control = control;
        this.value = 0;
    }

    update (event, controller) {
        if (event.value !== this.value) {
            this.value = event.value;
            if (this.value === 1) {
                controller.emit(`${this.control}:pressed`, event, this);
            }
            if (this.value === 0) {
                controller.emit(`${this.control}:released`, event, this);
            }
            controller.emit(this.control, event, this);
        }
    }

    poll () {
        return this.value;
    }

    toJSON () {
        return {
            control: this.control,
            type: 'Button',
            value: this.value
        };
    }
}

export default Button;