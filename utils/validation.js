Date.prototype.isValid = function () {
    // An invalid date object returns NaN for getTime() and NaN is the only
    // object not strictly equal to itself.
    return this.getTime() === this.getTime();
};

const isValidEmail = (value) => {
    const emailPattern = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    if (value && value.length > 0) {
        if (emailPattern.test(value)) {
            return true;
        } else {
            return false;
        }
    } else {
        return false;
    }
}

const isNotEmpty = (value) => {
    if (value && value.trim().length > 0) {
        return true;
    } else {
        return false;
    }
}

const isCharNumOnly = (value) => {
    if (value && value.length > 0) {
        if (/^[a-zA-Z0-9]+$/.test(value)) {
            return true;
        } else {
            return false;
        }
    } else {
        return false;
    }
}

const isNumOnly = (value) => {
    if(!!value) {
        value = value.toString();
        if (value && value.length > 0) {
            if (/^\d+$/.test(value)) {
                return true;
            } else {
                return false;
            }
        } else {
            return false;
        }
    } else {
        return false;
    }
}

const isValidPhoneNumber = (value) => {
    if (value && value.length > 0) {
        if (/^(09|\+639)\d{9}$/.test(value)) {
            return true;
        } else {
            return false;
        }
    } else {
        return false;
    }
} 

const isCharOnly = (value) => {
    if (value && value.length > 0) {
        if (/^[a-zA-Z]+$/.test(value)) {
            return true;
        } else {
            return false;
        }
    } else {
        return false;
    }
}

const isCharAndSpaceOnly = (value) => {
    if (value && value.length > 0) {
        if (/^[a-zA-Z\s]*$/.test(value)) {
            return true;
        } else {
            return false;
        }
    } else {
        return false;
    }
}

const isValidMaxLength = (value) => {
    if (value && value.length <= 12) {
        return true;
    } else {
        return false;
    }
}

const isValidMinLength = (value) => {
    if (value && value.length >= 6) {
        return true;
    } else {
        return false;
    }
}

const isValidDate = (value) => {
    if (value) {
        let d = new Date(value);
        return d.isValid();
    } else {
        return false;
    }
}

module.exports = {
    isValidEmail,
    isNotEmpty,
    isCharNumOnly,
    isNumOnly,
    isValidPhoneNumber,
    isCharOnly,
    isCharAndSpaceOnly,
    isValidMaxLength,
    isValidMinLength,
    isValidDate
}