const { ipcRenderer } = require("electron")
let selectedNodeList = []
let companyList = {}

// Defines profile component
exports.defineProfileComponent = () => {
    // Sync Profile Component
    class ProfileComponent extends HTMLElement {
        // Declare attributes before anything
        static get observedAttributes() {
            return ['data', 'name', 'id']
        }

        constructor () {
            super ()
            // Create a shadow root
            this.attachShadow({ mode: 'open' })

            // HTML Criteria
            const listGroupItem = document.createElement('a'); listGroupItem.className = 'list-group-item list-group-item-action'
            const listGroupItemRow = document.createElement('div'); listGroupItemRow.className = 'row align-items-center no-gutters'; listGroupItem.appendChild(listGroupItemRow)
            const listGroupItemCol = document.createElement('div'); listGroupItemCol.className = 'col xl-11 mr-2'; listGroupItemRow.appendChild(listGroupItemCol)
            const listGroupItemHeader = document.createElement('h6'); listGroupItemHeader.className = 'mb-0'; listGroupItemCol.appendChild(listGroupItemHeader)
            const listGroupItemHeaderContent = document.createElement('strong'); listGroupItemHeader.appendChild(listGroupItemHeaderContent)
            const listGroupItemDescriptor = document.createElement('span'); listGroupItemDescriptor.className = 'text-xs'; listGroupItemDescriptor.innerText = 'Descriptor goes here'; listGroupItemCol.appendChild(listGroupItemDescriptor)

            // Append HTML to Shadow Root
            this.shadowRoot.append(listGroupItem)
        }

        // Attribute changed lifecycle event
        attributeChangedCallback(name, oldValue, newValue) {
            if (name === 'name') {
                const data = newValue
                this.shadowRoot.querySelector('strong').innerText = data
            }
            if (name === 'id') {
                const data = newValue

            }
        }
    }
}