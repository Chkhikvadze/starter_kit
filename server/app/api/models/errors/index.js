// Create a new object, that prototypally inherits from the Error constructor.
// function MyError(message) {
//     this.name = 'MyError';
//     this.message = message || 'Default Message';
//     this.stack = (new Error()).stack;
// }
// MyError.prototype = Object.create(Error.prototype);
// MyError.prototype.constructor = MyError;


module.exports = {
    TrialAdministratorNotFoundError: TrialAdministratorNotFoundError,
    TrialPatientNotFoundError: TrialPatientNotFoundError,
    TrialSubGroupNotFoundError: TrialSubGroupNotFoundError,
    DuplicateFoundError: DuplicateFoundError,
    NotFoundError: NotFoundError
};



function TrialAdministratorNotFoundError(message) {
    this.name = 'TrialAdministratorNotFoundError';
    this.message = message || 'TrialAdministratorNotFoundError';
}

function TrialPatientNotFoundError(message) {
    this.name = 'TrialPatientNotFoundError';
    this.message = message || 'TrialPatientNotFoundError';
}

function TrialSubGroupNotFoundError(message) {
    this.name = 'TrialPatientNotFoundError';
    this.message = message || 'TrialPatientNotFoundError';
}

function DuplicateFoundError(message) {
    this.name = 'TrialPatientNotFoundError';
    this.message = message || 'TrialPatientNotFoundError';
}

function NotFoundError(message) {
    this.name = 'NotFoundError';
    this.message = message || 'NotFoundError';
}