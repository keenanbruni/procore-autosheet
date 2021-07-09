const { ipcRenderer } = require("electron")
let selectedNodeList = []
let companyList = {}

// Renders list of companies in the modal
exports.renderCompanyList = (data) => {
    const companyListDiv = document.querySelector("#company-list-group")
    $('#company-list-group').html('')
    document.querySelector("#smartwizard-starter > div.toolbar.toolbar-bottom > button.btn.sw-btn-next").setAttribute('disabled', 'true')

    data.forEach((item) => {
        const listItem = document.createElement('button')
        listItem.className = 'list-group-item list-group-item-action'
        listItem.innerText = item.name
        companyListDiv.appendChild(listItem)
    })
}

// Renders list of projects in the modal
exports.renderProjectList = (company, accessToken) => {
    let projectData = []
    let count = 0
    const projectListDiv = document.querySelector("#project-list-group")
    projectListDiv.childNodes.forEach(node => node.remove())

    $.get("https://sandbox.procore.com/rest/v1.0/projects", { access_token: accessToken, company_id: company.id })
        .done(function (data) {
            projectListDiv.childNodes.forEach(node => node.remove())
            data.forEach((item) => {
                const listItem = document.createElement('button')
                listItem.className = 'list-group-item list-group-item-action';listItem.innerText = item.name; listItem.setAttribute('count', count++)
                projectListDiv.appendChild(listItem)
                projectData.push(item)
                // debugger
            })
        })
        .fail(function (data) {
            if (data){
                console.log(`Failure Data: ${data}`)
                exports.renewAuthLease()
            }
        })
    return projectData
}

// Renders list of drawing areas in the modal
exports.renderDrawingAreas = (projectId, accessToken) => {
    let projectData = []
    const drawingAreaDiv = document.querySelector("#drawing-area-group")

    $('#project-list-group').click(() => { drawingAreaDiv.childNodes.forEach(node => node.remove()) })

    $.get(`https://sandbox.procore.com/rest/v1.1/projects/${projectId}/drawing_areas`, { access_token: accessToken, project_id: projectId })
        .done(function (data) {
            drawingAreaDiv.childNodes.forEach(node => node.remove())
            data.forEach((item) => {
                const listItem = document.createElement('button')
                listItem.className = 'list-group-item list-group-item-action'
                listItem.innerText = item.name
                drawingAreaDiv.appendChild(listItem)
                projectData.push(item)
            })
        })
        .fail(function (data) {
            if (data){
                console.log(`Failure Data: ${data}`)
                exports.renewAuthLease()
            }
        })
    return projectData
}

// Renders list of drawing disciplines in the modal
exports.renderDrawingDisciplines = (projectId, accessToken) => {
    let projectData = []
    const diciplineListDiv = document.querySelector('#drawing-discipline-group')

    $('#drawing-area-group').click(() => {diciplineListDiv.childNodes.forEach(node => { node.remove() }) })

    $.get(`https://sandbox.procore.com/rest/v1.1/projects/${projectId}/drawing_disciplines`, { access_token: accessToken, project_id: projectId })
        .done(function (data) {
            diciplineListDiv.childNodes.forEach(node => node.remove())
            $('drawing-discipline-group').html('')
            data.forEach((item) => {
                const listItem = document.createElement('button')
                listItem.className = 'list-group-item list-group-item-action'
                listItem.innerText = item.name
                diciplineListDiv.appendChild(listItem)
                projectData.push(item)
            })
        })
        .fail(function (data) {
            if (data){
                console.log(`Failure Data: ${data}`)
                exports.renewAuthLease()
            }
        })
    return projectData
}

// Stores list of drawings & download URLS in local storage
const startDownload = (id, accessToken) => {
    const selectedProfileInfo = procoreData.find(x => x._id === id)
    const index = procoreData.findIndex(x => x._id === id)
    const drawingAreaId = selectedProfileInfo.selectedDrawingArea.id
    const projectId = selectedProfileInfo.selectedProject.id
    const discipline = selectedProfileInfo.selectedDrawingDiscipline.name

    $.get(`https://sandbox.procore.com/rest/v1.1/drawing_areas/${drawingAreaId}/drawings`, { drawing_area_id: drawingAreaId, access_token: accessToken, project_id: projectId }) 
        .done(function (data){
            if (data){
                const drawingBucket = data.filter(drawing => drawing.discipline === discipline)
                procoreData[index].drawingData = drawingBucket

                const drawingLoop = async() => {
                    for (const drawing of drawingBucket) {
                        const response = await downloadDrawing(drawing, selectedProfileInfo)
                        console.log(response)
                    }
                }
                drawingLoop()
            }
        })
}

// Downloads drawings
const downloadDrawing = (drawing, profile) => {
    return new Promise((resolve, reject) =>{
        ipcRenderer.send("download", {
            url: drawing.current_revision.pdf_url,
            options: {directory: profile.saveLocation, filename: `${drawing.number} - ${drawing.title}.pdf`}    
        })
      
        ipcRenderer.on("download complete", (event, arg) => {
            resolve('download complete')
        });

    })
}

// Keeps selected items selected for any given Bootstrap button list
exports.toggleListSelection = (e) => {
    // Clears all existing active items
    e.target.parentNode.childNodes.forEach(item => { item.classList.remove("active") })
    // Highlight new active item
    $(e.target).addClass("active")
    // Return index of active list item
    return (returnActiveListItem(e.target.parentNode))
}

// Returns index of active item (if any)
returnActiveListItem = (listNode) => {
    let companyClassArray = []
    selectedNodeList = listNode.childNodes
    selectedNodeList.forEach(i => companyClassArray.push(i.className))
    var i = companyClassArray.findIndex(v => v.includes("active"));
    return i
}

// Clears node lists in the modal & turns off active selection of company list
exports.clearExistingNodeLists = () => {
    document.querySelector('#company-list-group').childNodes.forEach(node => node.classList.remove("active"))
    $('#project-list-group').contents().each((index, value) => {value.remove()})
    $('#drawing-area-group').contents().each((index, value) => {value.remove()})
    $('#drawing-discipline-group').contents().each((index, value) => {value.remove()})
    $('#project-list-header').css("display", "none"); $('#drawing-discipline-header').css("display", "none")
}

// UUID generator
exports.uuidv4 = () => {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
        var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
    });
}

// Clear all HTML of lists upon modal close
exports.clearModalHtml = () => {
    $('#myModal').on('hidden.bs.modal', function () {
        document.querySelector('#company-list-group').childNodes.forEach(node => node.classList.remove("active"))
        $('#project-list-group').contents().each((index, value) => {value.remove()})
        $('#drawing-area-group').contents().each((index, value) => {value.remove()})
        $('#drawing-discipline-group').contents().each((index, value) => {value.remove()})
        $('#project-list-header').css("display", "none"); $('#drawing-discipline-header').css("display", "none")
    })
}

// Add Profile Handler
exports.addProfileHandler = () => {
    $('#smartwizard-starter').smartWizard("reset");
    exports.clearExistingNodeLists()
    setTimeout(exports.clearExistingNodeLists(), 1000)

    let dataBucket = {
        selectedCompany: "",
        projectListPromise: "",
        selectedProject: "",
        drawingAreaPromise: "",
        selectedDrawingArea: "",
        drawingDisciplinePromise: "",
        selectedDrawingDiscipline: "",
        drawingListPromise: ""
    }
    const asyncRenderProjectList = async () => {
        const response = await exports.renderProjectList(dataBucket.selectedCompany, accessToken)
        return response
    }
    const asyncRenderDrawingList = async () => {
        const response = await exports.renderDrawingAreas(dataBucket.selectedProject.id, accessToken)
        return response
    }
    const asyncRenderDisciplineList = async () => {
        const response = await exports.renderDrawingDisciplines(dataBucket.selectedProject.id, accessToken)
        return response
    }

    // Step 1 - Saves selected company, project to dataBucket
    // Must unbind click event to eliminate bug
    $('#company-list-group').unbind("click").on('click', function (e) {
        const activeIndex = exports.toggleListSelection(e)
        dataBucket.selectedCompany = companyList[activeIndex]
        if (dataBucket.selectedCompany) {
            dataBucket.projectListPromise = asyncRenderProjectList()
            $('#project-list-header').css("display", "block")
        }
        console.log(`SELECTED COMPANY: ${dataBucket.selectedCompany.name}`)
    })

    // Handles project selection 
    $('#project-list-group').unbind("click").on('click', function (e) {
        const activeIndex = exports.toggleListSelection(e)
        dataBucket.projectListPromise.then(data => {
            dataBucket.selectedProject = data[activeIndex]
            console.log(`SELECTED PROJECT: ${dataBucket.selectedProject.name}`)
            if (dataBucket.selectedProject) {
                document.querySelector("#smartwizard-starter > div.toolbar.toolbar-bottom > button.btn.sw-btn-next").removeAttribute("disabled")
                dataBucket.drawingAreaPromise = asyncRenderDrawingList()
            }
        })
    });


    // Step 2 - Drawing Areas & Disciplines + Pushes data to electron-store DB (for now)
    // Handles drawing area selection
    $('#drawing-area-group').unbind("click").on('click', function (e) {
        const activeIndex = exports.toggleListSelection(e)
        dataBucket.drawingAreaPromise.then(data => {
            dataBucket.selectedDrawingArea = data[activeIndex]
            console.log(`SELECTED DRAWING AREA: ${dataBucket.selectedDrawingArea.name}`)
            if (dataBucket.selectedDrawingArea) {
                $('#drawing-discipline-header').css("display", "block")
                dataBucket.drawingDisciplinePromise = asyncRenderDisciplineList()
            }
        })
    })


    // Handles drawing discipline selection
    $('#drawing-discipline-group').unbind("click").on('click', function (e) {
        const activeIndex = exports.toggleListSelection(e)
        dataBucket.drawingDisciplinePromise.then(data => {
            dataBucket.selectedDrawingDiscipline = data[activeIndex]
            console.log(`SELECTED DRAWING DISCIPLINE: ${dataBucket.selectedDrawingDiscipline.name}`)

            // Pushes to procoreData
            procoreData.push({ _id: exports.uuidv4(), selectedCompany: dataBucket.selectedCompany, selectedProject: dataBucket.selectedProject, selectedDrawingArea: dataBucket.selectedDrawingArea, selectedDrawingDiscipline: dataBucket.selectedDrawingDiscipline })
            store.set('procoreData', procoreData)
        })
    })
}

// Defines profile component
exports.defineProfileComponent = () => {
    // Sync Profile Component
    class ProfileComponent extends HTMLElement {
        // Declare attributes before anything
        static get observedAttributes() {
            return ['data', 'name', 'id']
        }

        constructor() {
            super()
            // Create a shadow root
            this.attachShadow({ mode: 'open' })

            // HTML + Style Imports
            const profileDiv = document.createElement('div'); profileDiv.className = 'sync-profile'; profileDiv.innerHTML = '<link rel="stylesheet" href="./bootstrap.css"> <style> @import "./style.css"; </style>'
            const profileLink = document.createElement('a'); profileLink.setAttribute('id', "add-profile"); profileLink.setAttribute('class', 'fill-div'); profileLink.setAttribute('data-toggle', 'modal'); profileLink.setAttribute('data-target', '#myModal'); profileDiv.appendChild(profileLink)
            const profileHeader = document.createElement('h5'); profileHeader.textContent = this.getAttribute('name'); profileLink.appendChild(profileHeader); profileHeader.className = 'profile-header'
            const deleteLink = document.createElement('a'); deleteLink.innerHTML= '<small>delete</small>'; deleteLink.className = 'delete-link'; deleteLink.setAttribute('href','#')
            const saveLocationLink = document.createElement('a'); saveLocationLink.innerHTML = '<small>save location</small>'; saveLocationLink.setAttribute('href','#'); saveLocationLink.className = 'save-location'
            const syncLink = document.createElement('a'); syncLink.innerHTML = '<small>sync</small>'; syncLink.setAttribute('href','#'); syncLink.className = 'sync-link'
            $(deleteLink).click((e) => {exports.handleDeleteProfile(e, deleteLink.id)})
            $(saveLocationLink).click((e) => {exports.handleSaveLocation(e, deleteLink.id)})
            $(syncLink).click((e) => {startDownload(deleteLink.id, accessToken)})
            profileLink.appendChild(deleteLink); profileLink.appendChild(saveLocationLink); profileLink.appendChild(syncLink)

            // Append HTML to shadow root
            this.shadowRoot.append(profileDiv);
        }

        // Attribute changed lifecycle event
        attributeChangedCallback(name, oldValue, newValue) {
            if (name === 'name') {
                const data = newValue
                this.shadowRoot.querySelector('h5').innerText = data
            }
            if (name === 'id') {
                const data = newValue
                this.shadowRoot.querySelector('.delete-link').setAttribute('id', data)
            }
        }
    }
    // Custom component definition
    customElements.define('simple-component', ProfileComponent)
}

// Delete profile handler
exports.handleDeleteProfile = (e, id) => {
    const indexOfId = procoreData.findIndex(i => i._id === id)
    procoreData.splice(indexOfId, 1)
}

// Set file save location
exports.handleSaveLocation = (e, id) => {
    ipcRenderer.send('save-location')
    const index = procoreData.findIndex(x => x._id === id)

    // Upon received message with save location
    ipcRenderer.on("saved-location", (event, arg) => {
        console.log(arg[0]); // Full file path
        procoreData[index].saveLocation = arg[0]
    })
}

// Monitors storage for adds, deletes, and edits, and handles them
exports.startMonitoring = () => {

    // Monitors procoreData array for new profiles 
    _.observe(procoreData, 'create', function (new_item, item_index) {
        const component = document.createElement('simple-component')
        const companyName = new_item.selectedCompany.name
        const profileId = new_item._id

        component.setAttribute('name', companyName)
        component.setAttribute('id', profileId)
        $('.grid-container').append($(component));
    });

    // Monitors procoreData array for deletes, then removes node and saves to store
    _.observe(procoreData, 'delete', function (old_item, item_index) {
        $('.grid-container').contents().each((index, element) => {
            if (element.id && element.id === old_item._id) {
                $(element).remove()
                store.set('procoreData', procoreData)
            }
        })
        console.log(`ID OF DELETED ITEM: ${old_item._id}`)
    })

    // Monitors procoreData array for updates, then commits to store
    _.observe(procoreData, 'update', function(new_item, old_item, item_index){
        exports.logger(`ahhh shit my boy be updatin procoreData`)
        store.set('procoreData', procoreData)
    })

}

// Renews authorization lease
exports.renewAuthLease = () => {
    // renew access token in electron-store, this may be the only step needed
    ipcRenderer.send('renew-lease')
}

// Logs to terminal
exports.logger = (message) => {
    ipcRenderer.send('logger', message) // prints message
}