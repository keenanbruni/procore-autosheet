// Initial declarations
const Store = require('electron-store');
const store = new Store({ watch: true });
let accessToken = store.get('access-token'); let clientId = store.get('client-id'); let clientSecret = store.get('client-secret')
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
        .fail(function (data) {
            if (data){
                console.log(`Failure Data: ${data}`)
                exports.renewAuthLease()
            }
        })
    // Add new sync profile
    $('#add-profile').click(() => {
        exports.addProfileHandler()
    })

    $('#wrong-code').click(() => {
        $.get(`https://sandbox.procore.com/rest/v1.0/companies`, { access_token: 'bajarbles' })
            .done(function (data) {
                if (data) {
                    companyList = data
                    // Renders company list in modal
                    exports.renderCompanyList(data)
                    exports.clearExistingNodeLists()
                }
            })
            .fail(function (data) {
                const asyncRenewLease = async () => {
                    // const response = await 
                    ipcRenderer.send('renew-lease')
                    // reply ends the await?
                }
                asyncRenewLease().then()

                console.log(`FAKE TIME ENGAGED`)
                ipcRenderer.send('renew-lease')
            })
    })

    $('#print-token-info').click(() => {
        $.get('https://login-sandbox.procore.com/oauth/token/info', {access_token: accessToken})
            .done(function(data){
                console.log(data)
            })
    })



    // Monitors storage for adds, deletes, and edits, and handles them
    exports.startMonitoring()

    // Clears all HTML from modal upon exit
    exports.clearModalHtml()
})
