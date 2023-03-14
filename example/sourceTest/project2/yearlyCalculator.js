function calcAge(yearOfBirth) {
    var currentYear = new Date().getFullYear();
    return currentYear - yearOfBirth;
}

exports.calcAge = calcAge;
