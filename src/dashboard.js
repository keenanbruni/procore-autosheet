// Initial declarations
const Store = require('electron-store');
const store = new Store({ watch: true });
let accessToken = store.get('access-token')
const hideLoader = () => {
    $('#loading').hide()
}
let procoreData = []

// Registers custom profile component
exports.defineProfileComponent()

// App
$(() => {
    // Force hide loader if theres an error
    setTimeout(hideLoader, 11 * 1000);

    // Initialized smartwizard-starter
    $('#smartwizard-starter').smartWizard();

    // Initializes company info, hides loading gif
    $.get(`https://sandbox.procore.com/rest/v1.0/companies`, { access_token: accessToken })
        .done(function (data) {
            if (data) {
                companyList = data
                // Renders company list in modal
                exports.renderCompanyList(data)
                exports.clearExistingNodeLists()
                hideLoader()
            } else {
                console.log("An error occurred.");
            }
        })

    // Add new sync profile
    $('#add-profile').click(() => {
        exports.addProfileHandler()
    }) 

    // Monitors storage for adds, deletes, and edits, and handles them
    exports.startMonitoring()

    // Clears all HTML from modal upon exit
    exports.clearModalHtml()
})
