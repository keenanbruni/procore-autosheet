import { html, render } from 'https://unpkg.com/htm/preact/standalone.module.js'

const GridContainer = (props) => {
    return html`
    
    <h1>Hello ${props.name}!</h1>

    <div class="grid-container">
        <div class="site-header">
            <h3>AutoSheet</h3>
        </div>   
    </div>
    
    `;
}

const AddProfile = () => {
    return html`

    <div class="sync-profile">
        <a href="#" class="fill-div" data-toggle="modal" data-target="#myModal">Add Sync Profile</a>
    </div>
    
    `;
}


render(html`
    <${GridContainer} name="World" />
    <${AddProfile} />
`, document.body);
