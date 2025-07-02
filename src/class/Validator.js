class Validator {
    constructor() {
        // Initialize the utility with any necessary configuration or state
    }

    static Validate = (type, inputValue) => {
        if (inputValue === undefined || inputValue === null) {
            return false;
        }
        else {

            const value = inputValue?.trim();

            if (type == 'email') {
                let reg = /^[a-zA-Z0-9._%+-]+(\.[a-zA-Z0-9._%+-]+)?(\+[a-zA-Z0-9]+)?@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
                // let reg = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w\w+)+$/;
                if (reg.test(value) === false) {
                    return false;
                }
                else {
                    return true;
                }
            }

            if (type == 'phone') {
                let reg = /^\d+$/;
                if (reg.test(value) === false) {
                    return false;
                }
                else {
                    return true;
                }
            }
        }
    }

}

export default Validator;
