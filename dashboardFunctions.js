const { ipcRenderer } = require("electron")

// Handles add profile
exports.addProfileHandler = () => {
    let dataBucket = {
        selectedCompany: "",
        selectedProject: "",
        selectedDrawingArea: "",
        selectedDrawingDiscipline: ""
    }

    // Step 1 - Saves selected company to dataBucket & populates project select
    $('#select-company').unbind("select2:select").on('select2:select', function (e) {
        $('#select-project').html('').select2({ data: [{ id: '', text: '' }] }); $('#select-drawing-area').html('').select2({ data: [{ id: '', text: '' }] }); $('#select-drawing-disciplines').html('').select2({ data: [{ id: '', text: '' }] });
        $('#select-drawing-disciplines').prop("disabled", true); $('#select-drawing-area').prop("disabled", true); $('#select-project').prop("disabled", true); 
        $('#save-close-button').prop("disabled", true); $('#save-close-button').addClass("disabled");
        const data = e.params.data
        dataBucket.selectedCompany = { id: data.id, name: data.text }
        if (dataBucket.selectedCompany) {
            renderProjectList(data, accessToken)
        }
        console.log(dataBucket.selectedCompany)
    })

    const renderProjectList = (company, accessToken) => {
        $("#loading-project-list").css("display", "inline");
        $.get("https://sandbox.procore.com/rest/v1.0/projects", { access_token: accessToken, company_id: company.id })
            .done(function (data) {
                let bucket = []
                if (data) {
                    // Populate project select
                    data.forEach(item => {
                        let object = {}
                        object.id = item.id
                        object.text = item.name
                        bucket.push(object)
                    })
                }
                $('#select-project').html('').select2({ data: [{ id: '', text: '' }] });
                $("#select-project").select2({
                    data: bucket
                })
                $('#select-project').prop("disabled", false)
                $("#loading-project-list").css("display", "none");
            })
            .fail(function (data) {
                if (data) {
                    console.log(`Failure Data: ${data}`)
                }
            })
    }

    // Step 2 - Saves selected project to dataBucket & populates drawing area select
    $('#select-project').unbind("select2:select").on('select2:select', function (e) {
        $('#select-drawing-area').html('').select2({ data: [{ id: '', text: '' }] }); $('#select-drawing-disciplines').html('').select2({ data: [{ id: '', text: '' }] });
        $('#select-drawing-disciplines').prop("disabled", true); $('#select-drawing-area').prop("disabled", true);
        $('#save-close-button').prop("disabled", true); $('#save-close-button').addClass("disabled");
        let data = e.params.data
        dataBucket.selectedProject = { id: data.id, name: data.text }
        console.log(dataBucket.selectedProject)
        if (dataBucket.selectedProject) {
            renderDrawingAreaList(data, accessToken)

        }
    })

    const renderDrawingAreaList = (data, accessToken) => {
        $("#loading-drawing-area-list").css("display", "inline");
        $.get(`https://sandbox.procore.com/rest/v1.1/projects/${data.id}/drawing_areas`, { access_token: accessToken, project_id: data.id })
            .done(function (data) {
                let bucket = []
                if (data) {
                    // Populate select
                    data.forEach(item => {
                        let object = {}
                        object.id = item.id
                        object.text = item.name
                        bucket.push(object)
                    })
                }
                $('#select-drawing-area').html('').select2({ data: [{ id: '', text: '' }] });
                $("#select-drawing-area").select2({
                    data: bucket
                })
                $('#select-drawing-area').prop("disabled", false)
                $("#loading-drawing-area-list").css("display", "none");
            })
            .fail(function (data) {
                if (data) {
                    console.log(`Failure Data: ${data}`)
                }
            })
    }

    // Step 3 - Saves selected drawing area to dataBucket & populates drawing discipline select
    $('#select-drawing-area').unbind("select2:select").on('select2:select', function (e) {
        $('#select-drawing-disciplines').html('').select2({ data: [{ id: '', text: '' }] }); $('#select-drawing-disciplines').prop("disabled", true);
        $('#save-close-button').prop("disabled", true); $('#save-close-button').addClass("disabled");
        let data = e.params.data
        dataBucket.selectedDrawingArea = { id: data.id, name: data.text }
        console.log(dataBucket.selectedDrawingArea)
        if (dataBucket.selectedDrawingArea) {
            renderDrawingDisciplineList(dataBucket.selectedProject.id, accessToken)
        }
    })

    const renderDrawingDisciplineList = (data, accessToken) => {
        $("#loading-drawing-discipline-list").css("display", "inline");
        $.get(`https://sandbox.procore.com/rest/v1.1/projects/${data}/drawing_disciplines`, { access_token: accessToken, project_id: data })
            .done(function (data) {
                let bucket = []
                if (data) {
                    // Populate select
                    data.forEach(item => {
                        let object = {}
                        object.id = item.id
                        object.text = item.name
                        bucket.push(object)
                    })
                }
                $('#select-drawing-disciplines').html('').select2({ data: [{ id: '', text: '' }] });
                $("#select-drawing-disciplines").select2({
                    data: bucket
                })
                $('#select-drawing-disciplines').prop("disabled", false)
                $("#loading-drawing-discipline-list").css("display", "none");
            })
            .fail(function (data) {
                if (data) {
                    console.log(`Failure Data: ${data}`)
                }
            })
    }

    // Step 4 - Saves selected drawing discipline to dataBucket, enables save button
    $('#select-drawing-disciplines').unbind("select2:select").on('select2:select', function (e) {
        let data = e.params.data
        dataBucket.selectedDrawingDiscipline = { id: data.id, name: data.text }
        console.log(dataBucket.selectedDrawingDiscipline)
        $('#save-close-button').prop("disabled", false); $('#save-close-button').removeClass("disabled"); 
    })

    // Step 5 - Commits data upon close
    $('#save-close-button').unbind('click').on('click', () => {
        if (dataBucket.selectedDrawingDiscipline){
            procoreData.push({ _id: uuidv4(), selectedCompany: dataBucket.selectedCompany, selectedProject: dataBucket.selectedProject, selectedDrawingArea: dataBucket.selectedDrawingArea, selectedDrawingDiscipline: dataBucket.selectedDrawingDiscipline })
            store.set('procoreData', procoreData)
        }
    })
}

// Resets add profile modal
exports.resetModal = () => {
    $('#select-project').html('').select2({ data: [{ id: '', text: '' }] }); $('#select-drawing-area').html('').select2({ data: [{ id: '', text: '' }] }); $('#select-drawing-disciplines').html('').select2({ data: [{ id: '', text: '' }] });
    $('#select-drawing-disciplines').prop("disabled", true); $('#select-drawing-area').prop("disabled", true); $('#select-project').prop("disabled", true); 
    $('#save-close-button').prop("disabled", true); $('#save-close-button').addClass("disabled");
    $("#select-company").val("1").trigger("change");
}

// Edit existing profile
const editProfile = (selectionId) => {
    $('#modal-heading').text("Loading...")
    $('#modal-body-container').attr("style", "filter: blur(4px);")
    $('#select-drawing-disciplines').prop("disabled", true); $('#select-drawing-area').prop("disabled", true); $('#select-project').prop("disabled", true); $('#select-company').prop("disabled", true)
    $('#save-close-button').prop("disabled", true); $('#save-close-button').addClass("disabled");
    
    // Step 1 - Populate company selection
    $.get(`https://sandbox.procore.com/rest/v1.0/companies`, { access_token: accessToken })
        .done(function(data) {
            let bucket = []
            if (data) {
                // Populate company selection interface
                data.forEach(item => {
                    let object = {}
                    object.id = item.id
                    object.text = item.name
                    bucket.push(object)
                })
                const indexOfSelection = data.findIndex(i => i.id === selectionId)
                console.log(`INDEX OF SELECTION: ${indexOfSelection}`)

                $("#select-company").select2({
                    data: bucket
                })
            } 
        })
}

// UUID generator
const uuidv4 = () => {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
        var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
    });
}

// Deletes list item (don't worry, its being called)
const deleteItem = (e, id) => {
    e.stopPropagation()
    const indexOfId = procoreData.findIndex(i => i._id === id)
    procoreData.splice(indexOfId, 1)
}

// Prepopulates & opens modal upon item click
const triggerModal = (e, id) => {
    const indexofId = procoreData.findIndex(i => i._id === id)
    console.log(indexofId)
    console.log(`EVENT: ${e}`)
    $('#drawings-modal').modal();
    editProfile(id)
}

// Monitors storage for adds, deletes, and edits, and handles them
exports.startObserve = () => {
    // Monitors for new adds to procoreData
    _.observe(procoreData, 'create', function(new_item, item_index){
        console.log(new_item)
        const listLinkItem = document.createElement('a'); listLinkItem.classList = "list-group-item list-group-item-action"; listLinkItem.setAttribute("id", new_item._id); listLinkItem.setAttribute("onClick", 'triggerModal(event, this.id)');
        const rowDiv = document.createElement('div'); rowDiv.classList = 'row align-items-center no-gutters' 
        const colDiv = document.createElement('div'); colDiv.classList = 'col mr-2'
        const h6 = document.createElement('h6'); h6.classList = 'mb-0'; h6.innerHTML = `<strong>${new_item.selectedCompany.name}</strong>`
        const spanText = document.createElement('span'); spanText.classList = "text-xs"; spanText.innerText = `${new_item.selectedDrawingDiscipline.name}`
        const colDiv2 = document.createElement('div'); colDiv2.classList = "col-auto"
        const deleteButton = document.createElement('button'); deleteButton.classList = "close"; deleteButton.setAttribute("id", new_item._id); deleteButton.setAttribute("onClick", 'deleteItem(event, this.id)');
        const closeSpan = document.createElement('span'); closeSpan.setAttribute("aria-hidden", "true"); closeSpan.innerText='x'

        listLinkItem.appendChild(rowDiv); rowDiv.appendChild(colDiv); colDiv.appendChild(h6); colDiv.appendChild(spanText); 
        rowDiv.appendChild(colDiv2); colDiv2.appendChild(deleteButton); deleteButton.appendChild(closeSpan)

        $('#drawing-list').append(listLinkItem)
    })

     // Monitors procoreData array for deletes, then removes node and saves to store
     _.observe(procoreData, 'delete', function (old_item, item_index) {
        $('#drawing-list').contents().each((index, element) => {
            if (element.id && element.id === old_item._id) {
                $(element).remove()
                store.set('procoreData', procoreData)
            }
        })
        console.log(`ID OF DELETED ITEM: ${old_item._id}`)
    })
}
