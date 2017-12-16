/*
 * Functions related to phone numbers
 */

const SMS_GATEWAYS = [
    {"name": "Verizon", "email": "vtext.com"},
    {"name": "ATT", "email": "txt.att.net"},
    {"name": "TMobile", "email": "tmomail.net"},
    {"name": "Sprint", "email": "messaging.sprintpcs.com"},
    {"name": "USCellular", "email": "email.uscc.net"},
    {"name": "BoostMobile", "email": "myboostmobile.com"},
    {"name": "Cricket", "email": "sms.mycricket.com"},
    {"name": "Virgin", "email": "vmobl.com"},
    {"name": "AllTel", "email": "text.wireless.alltel.com"},
    {"name": "nocarrier", "email": "example.com"}
];

var CAR_TO_EMAIL = {};
var EMAIL_TO_CAR = {};

SMS_GATEWAYS.forEach(function(v) {
    CAR_TO_EMAIL[v.name] = v.email;
    EMAIL_TO_CAR[v.email] = v.name;
});

// create an email associated with given phone number and carrier
const createTextableEmail = (number, carrier) => {
    // remove all non-digits from number
    let cleanNumber = number.replace(/\D/g, '');
    // find appropriate email extension based on carrier
    if (carrier in CAR_TO_EMAIL) {
        return cleanNumber + "@" + CAR_TO_EMAIL[carrier];
    }
    throw "Error: Carrier not supported.";
}

// parses the original phone number and carrier from phone associated email
const parsePhoneEmail = (phoneEmail) => {
    // split the number from the carrier
    let split = phoneEmail.split('@');
    let number = split[0];
    // find appropriate carrier based on email
    if (split[1] in EMAIL_TO_CAR) {
        let carrier = EMAIL_TO_CAR[split[1]];
        return [number, carrier];
    }
    throw "Error: Carrier not found.";
}

// checks if a given email is a phone associated email
const isPhoneEmail = (email) => {
    let split = email.split('@');
    let carrier = split[1];
    if (carrier in EMAIL_TO_CAR) {
        return true;
    }
    return false;
}

module.exports = {
    createTextableEmail: createTextableEmail,
    parsePhoneEmail: parsePhoneEmail,
    isPhoneEmail: isPhoneEmail,
}
