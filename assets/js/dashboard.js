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
    $.get(`https://sandbox.procore.com/rest/v1.0/companies`, { access_token: accessToken })
        .done(function (data) {
            if (data) {
                let bucket = []
                // Populate company selection Select2 interface
                console.log(data)
                data.forEach(item => {
                    let itemBucket = {}
                    itemBucket.id = item.id
                })
            }
        })

        var data = [
            {
                id: 0,
                text: 'enhancement'
            },
            {
                id: 1,
                text: 'bug'
            },
            {
                id: 2,
                text: 'duplicate'
            },
            {
                id: 3,
                text: 'invalid'
            },
            {
                id: 4,
                text: 'wontfix'
            }
        ];

        $('#select-company').select2({
            data: data
        })

        // $('#select-company').select2({
        //     ajax: {
        //         url: "https://sandbox.procore.com/rest/v1.0/companies",
        //         dataType: 'json',
        //         data: { access_token: accessToken }
        //     },
        //     return {  }
            
        // })
})