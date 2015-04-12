var Parser = function() {

};


Parser.prototype.extractBookProperties = function() {

};


/**
 * Reverses first and last names separated by a comma
 * @param {string} name - 'Stephenson, Neal'
 * @returns {string} 'Neal Stephenson'
 */
Parser.prototype.reverseNames = function(name) {
    var commaIndex = name.indexOf(', ');
    if (commaIndex === -1) {
        return name;
    }
    var firstName = name.substring(commaIndex + 2).trim();
    firstName = firstName.replace(/[,|\(].+$/, '').trim();
    var lastName = name.substring(0, commaIndex).trim();

    // Delete years from Chagall, Marc 1887-1985
    firstName = firstName.replace(/\s\d{4}-\d{4}$/, '');
    // Still living! Brooks, Hugh C. 1922-
    firstName = firstName.replace(/\s\d{4}-$/, '');
    // Delete roles: Malone, Peter 1953-Illustrator
    firstName = firstName.replace(/\s\d{4}-.+$/, '');
    if (firstName.match(/^\d{4}/)) { // solves 'STENDHAL, 1783-1842 CN.'
        return lastName;
    }
    return  firstName.trim() + ' ' + lastName.trim();
};

module.exports = Parser;