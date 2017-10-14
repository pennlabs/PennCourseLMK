/* 
 * Functions related to phone numbers
 */

// create an email associated with given phone number and carrier
const createTextableEmail = (number, carrier) => {
	// remove all non-digits from number
	let cleanNumber = number.replace(/\D/g, '');
	// find appropriate email extension based on carrier
	let carrierEmail = '';
	switch(carrier) {
		case "Verizon":
			carrierEmail = "@vtext.com";
			break;
		case "AT&T":
			carrierEmail = "@txt.att.net";
			break;
		case "T-Mobile":
			carrierEmail = "@tmomail.net";
			break;
		case "Sprint":
			carrierEmail = "@messaging.sprintpcs.com";
			break;
		case "USCellular":
			carrierEmail = "@email.uscc.net";
			break;
		default:
			throw "Error: carrier not supported";
	}
	return cleanNumber + carrierEmail;
}

module.exports = {
	createTextableEmail: createTextableEmail,
}