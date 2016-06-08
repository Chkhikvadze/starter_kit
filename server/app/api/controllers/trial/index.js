var TrialController = require('./trialController.v1');
var AdminsController = require('./administratorController.v1');
var GroupController = require('./groupController.v1');
var PatientController = require('./patientController.v1');
var isAuthenticated = require('../../policies/isAuthenticated');


module.exports = {
    '/v1': {
        '/trials': {
            get: [isAuthenticated, TrialController.read],
            post: [isAuthenticated, TrialController.create],
            '/:trial_id': {
                get: [isAuthenticated, TrialController.get],
                post: [isAuthenticated, TrialController.update],
                put: [isAuthenticated, TrialController.update],
                delete: [isAuthenticated, TrialController.remove],
                '/admins': {
                    get: [isAuthenticated, AdminsController.read],
                    '/:admin_id': {
                        post: [isAuthenticated, AdminsController.create],
                        delete: [isAuthenticated, AdminsController.remove]
                    }
                },
                '/patients': {
                    get: [isAuthenticated, PatientController.read],
                    '/:patient_id': {
                        post: [isAuthenticated, PatientController.create],
                        delete: [isAuthenticated, PatientController.remove],
                        '/dosage': {
                            post: [isAuthenticated, GroupController.dosage],
                        }
                    }
                },
                '/groups': {
                    get: [isAuthenticated, GroupController.read],
                    '/:group_label': {
                        get: [isAuthenticated, GroupController.get],
                        post: [isAuthenticated, GroupController.create],
                        delete: [isAuthenticated, GroupController.remove],
                        '/patient': {
                            '/:patient_id': {
                                post: [isAuthenticated, GroupController.add_patient],
                                delete: [isAuthenticated, GroupController.remove_patient]
                            }
                        },
                        '/dosage': {
                            post: [isAuthenticated, GroupController.dosage],
                        }
                    }
                }
            }
        }
    }
};