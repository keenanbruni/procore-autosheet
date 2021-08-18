// Initial declarations
const Store = require('electron-store');
const store = new Store({ watch: true, accessPropertiesByDotNotation: false });
let accessToken = store.get('access-token'); let clientId = store.get('client-id'); let clientSecret = store.get('client-secret')
const hideLoader = () => {
    $('#loading').hide()
}
let procoreData = [] // critical component - container for all user data

// Registers custom profile component
exports.defineProfileComponent()

// App 
$(() => {
    // Force hide loader if theres an error
    setTimeout(hideLoader, 11 * 1000);

    // Initializes company info, hides loading gif
    $.get(`https://sandbox.procore.com/rest/v1.0/companies`, { access_token: accessToken })
        .done(function (data) {
            if (data) {
                // Populate company selection Select2 interface
                const companySelect = $('#company-selector')
            }
        })
})