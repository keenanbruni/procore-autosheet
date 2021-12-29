// Initial declarations
const Store = require('electron-store')
const store = new Store({ watch: true });
let accessToken = store.get('access-token');
let userId = ""; let procoreData = [] // critical components - container for all user data

// App 
$(() => {
    // Initializes company info, hides loading gif
    $('#drawings-modal').removeAttr("tabindex")

    // Initializes app
    $.get(`https://api.procore.com/rest/v1.0/me`, { access_token: accessToken })
        .done(function (response) {
            userId = response.id
            $('#loading').hide()
            $('#user-name').text(response.login)

            // Populate existing profiles
            if (store.get(`${userId}.procoreData`)){
                const indexCount = store.get(`${userId}.procoreData`).length
            }
            if (!store.get(`${userId}.procoreData`) || store.get(`${userId}.procoreData`).length == 0) {
                const listLinkItem = document.createElement('a'); listLinkItem.classList = "list-group-item list-group-item-action"; listLinkItem.setAttribute("id", 'no-drawings')
                const rowDiv = document.createElement('div'); rowDiv.classList = 'row align-items-center flex-nowrap no-gutters' 
                const colDiv = document.createElement('div'); colDiv.classList = 'col text-nowrap mr-2'
                const h6 = document.createElement('h6'); h6.classList = 'mb-0'; h6.innerHTML = `<strong>Click "Add Drawings" to get started!</strong>`
                listLinkItem.appendChild(rowDiv); rowDiv.appendChild(colDiv); colDiv.appendChild(h6);
                $('#drawing-list').append(listLinkItem)
            }
            else {
                $('#no-drawings').remove()
                store.get(`${userId}.procoreData`).forEach(profile => {
                    procoreData.push(profile)
                })
            }

        })
        .fail(function (response) {
            ipcRenderer.send('critical-error')
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