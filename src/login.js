// Initial declarations
const Store = require('electron-store');
const store = new Store();
let refreshToken = store.get('refresh-token')

// Set login link href info, extracting from the store
$(() => {
    $('#auth-link').attr('href',`https://login-sandbox.procore.com/oauth/authorize?client_id=9a8c0016b5081cfcee493d0fbb65a4f29609b134e40e18b356d4394b362d17e8&response_type=code&redirect_uri=https://login-sandbox.procore.com`)
    $('#try-refresh').attr('href',`https://login-sandbox.procore.com/oauth/authorize?client_id=9a8c0016b5081cfcee493d0fbb65a4f29609b134e40e18b356d4394b362d17e8&response_type=code&redirect_uri=https://login-sandbox.procore.com&refresh_token=${refreshToken}`)
})

