/**
 * Reverses first and last names separated by a comma
 * @param {string} name - 'Stephenson, Neal'
 * @returns {string} 'Neal Stephenson'
 */
var reverseNames = function(name) {
    var commaIndex = name.indexOf(', ');
    if (commaIndex === -1) {
        return name;
    }
    var firstName = name.substring(commaIndex + 2).trim();
    firstName = firstName.replace(/[,|\(].+$/, '').trim();
    var lastName = name.substring(0, commaIndex).trim();

    if (firstName.match(/^\d{4}/)) { // solves 'STENDHAL, 1783-1842 CN.'
        return lastName;
    }
    return  firstName + ' ' + lastName;
};

module.exports = {
    reverseNames: reverseNames
};