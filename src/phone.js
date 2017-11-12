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
		case "ATT":
			carrierEmail = "@txt.att.net";
			break;
		case "TMobile":
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

// parses the original phone number and carrier from phone associated email
const parsePhoneEmail = (phoneEmail) => {
  // split the number from the carrier
  let split = phoneEmail.split('@')
  let number = split[0]
  // find appropriate carrier based on email
  let carrier = ''
  switch(split[1]) {
  	case 'vtext.com':
  		carrier = 'Verizon'
  		break
  	case 'txt.att.net':
  		carrier = 'ATT'
  		break
  	case 'tmomail.net':
  		carrier = 'TMobile'
  		break
  	case 'messaging.sprintpcs.com':
  		carrier = 'Sprint'
  		break
  	case 'email.uscc.net':
  		carrier = 'USCellular'
  		break
  	default:
  		throw "Error: carrier not found"
  }
  return [number, carrier]
}

// checks if a given email is a phone associated email
const isPhoneEmail = (email) => {
	let split = email.split('@')
	let carrier = split[1]
	if (carrier === 'vtext.com' || carrier === 'txt.att.net' ||
		carrier === 'tmomail.net' || carrier === 'messaging.sprintpcs.com' ||
		carrier === 'email.uscc.net') {
		return true
	}
	return false
}

module.exports = {
	createTextableEmail: createTextableEmail,
	parsePhoneEmail: parsePhoneEmail,
	isPhoneEmail: isPhoneEmail,
}
