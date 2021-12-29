// Initial declarations
const Store = require('electron-store');
const store = new Store({ watch: true });
let accessToken = store.get('access-token'); 
const hideLoader = () => {
    $('#loading').hide()
}
let userId = ""; let procoreData = [] // critical components - container for all user data

// App 
$(() => {
    // Force hide loader if theres an error
    setTimeout(hideLoader, 11 * 1000);

    // Initializes company info, hides loading gif
    $('#drawings-modal').removeAttr("tabindex")
    $.get(`https://api.procore.com/rest/v1.0/companies`, { access_token: accessToken })
        .done(function (data) {
            let bucket = []
            if (data != []) {
                // Populate company selection interface
                data.forEach(item => {
                    if (item.id) {
                        let object = {}
                        object.id = item.id
                        object.text = item.name
                        bucket.push(object)
                    }
                })
        
                $("#select-company").select2({
                    data: bucket
                })
            } 
            else {
                // show error modal
            }
        })
        .fail(function (data) {
            if (data) {
                console.log(`Failure Data: ${data}`)
            }
        })

        // Add Profile Handler
        $('#add-drawings').unbind("click").click(() => {
            exports.resetModal()
            exports.addProfileHandler()
        })

        // Enables lodash observe
        exports.startObserve()

        // Starts miscellaneous observers
        exports.startMisc()
})