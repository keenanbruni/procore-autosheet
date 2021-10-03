// Initial declarations
const Store = require('electron-store');
const store = new Store({ watch: true, accessPropertiesByDotNotation: false });
let accessToken = store.get('access-token'); let clientId = store.get('client-id'); let clientSecret = store.get('client-secret')
const hideLoader = () => {
    $('#loading').hide()
}
let procoreData = [] // critical component - container for all user data

// Registers custom profile component
// exports.defineProfileComponent()

// App 
$(() => {
    // Force hide loader if theres an error
    setTimeout(hideLoader, 11 * 1000);

    // Initializes company info, hides loading gif
    $('#drawings-modal').removeAttr("tabindex")
    $.get(`https://sandbox.procore.com/rest/v1.0/companies`, { access_token: accessToken })
        .done(function (data) {
            let bucket = []
            if (data) {
                // Populate company selection interface
                data.forEach(item => {
                    let object = {}
                    object.id = item.id
                    object.text = item.name
                    bucket.push(object)
                })

                $("#select-company").select2({
                    data: bucket
                })
            } 
        })

        // Add Profile Handler
        $('#add-drawings').unbind("click").click(() => {
            exports.resetModal()
            exports.addProfileHandler()
        })

        // Enables lodash observe
        exports.startObserve()

        // Populates existing profiles
        store.get('procoreData').forEach(profile => {
            procoreData.push(profile)
        })
})