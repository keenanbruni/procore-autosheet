const { ipcRenderer } = require("electron");
const { data } = require("jquery");

// Handles add profile
exports.addProfileHandler = () => {
    let dataBucket = {
        selectedCompany: "",
        selectedProject: "",
        selectedDrawingArea: "",
        selectedDrawingDiscipline: "",
        id: uuidv4(),
        saveLocation: ""
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
        $.get("https://api.procore.com/rest/v1.0/projects", { access_token: accessToken, company_id: company.id })
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
        $.get(`https://api.procore.com/rest/v1.1/projects/${data.id}/drawing_areas`, { access_token: accessToken, project_id: data.id })
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
        $.get(`https://api.procore.com/rest/v1.1/projects/${data}/drawing_disciplines`, { access_token: accessToken, project_id: data })
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

    // Step 4 - Saves selected drawing discipline to dataBucket
    $('#select-drawing-disciplines').unbind("select2:select").on('select2:select', function (e) {
        let data = e.params.data
        dataBucket.selectedDrawingDiscipline = { id: data.id, name: data.text }
        console.log(dataBucket.selectedDrawingDiscipline)
        $('#save-location').prop("disabled", false); $('#save-location').removeClass("disabled"); 
    })

    // Step 5 - Set download location, enables save button
    $('#save-location').unbind('click').on('click', () => {
        ipcRenderer.send('save-location')
        
        // Upon received message with save location
        ipcRenderer.on("saved-location", (event, arg) => {
            dataBucket.saveLocation = arg[0]
            $('#save-close-button').prop("disabled", false); $('#save-close-button').removeClass("disabled");
        }) 
    })

    // Step 6 - Commits data upon close
    $('#save-close-button').unbind('click').on('click', () => {
        if (dataBucket.selectedDrawingDiscipline){
            procoreData.push({ _id: dataBucket.id, selectedCompany: dataBucket.selectedCompany, selectedProject: dataBucket.selectedProject, selectedDrawingArea: dataBucket.selectedDrawingArea, selectedDrawingDiscipline: dataBucket.selectedDrawingDiscipline, saveLocation: dataBucket.saveLocation })
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
    // Data imports & function definitions
    const indexOfId = procoreData.findIndex(i => i._id === selectionId)
    const selectedData = procoreData[indexOfId]
    let dataBucket = {}

    // Step 1 - Saves edited company to dataBucket & populates project select
    $('#select-company').unbind("select2:select").on('select2:select', function (e) {
        $('#select-project').html('').select2({ data: [{ id: '', text: '' }] }); $('#select-drawing-area').html('').select2({ data: [{ id: '', text: '' }] }); $('#select-drawing-disciplines').html('').select2({ data: [{ id: '', text: '' }] });
        $('#select-drawing-disciplines').prop("disabled", true); $('#select-drawing-area').prop("disabled", true); $('#select-project').prop("disabled", true);
        $('#save-close-button').prop("disabled", true); $('#save-close-button').addClass("disabled"); $('#save-location').prop('disabled', true); $('#save-location').addClass("disabled");
        const data = e.params.data
        dataBucket.selectedCompany = { id: data.id, name: data.text }
        if (dataBucket.selectedCompany) {
            editRenderProjectList(data, accessToken)
        }
        console.log(dataBucket.selectedCompany)
    })

    // Initial render of prepopulated
    const renderProjectList = (company, accessToken) => {
        $("#loading-project-list").css("display", "inline");
        $.get("https://api.procore.com/rest/v1.0/projects", { access_token: accessToken, company_id: company.id })
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
                $("#select-project").select2("trigger", "select", {
                    data: { id: selectedData.selectedProject.id }
                });
                $('#select-project').prop("disabled", false)
                $("#loading-project-list").css("display", "none");

                renderDrawingArea(selectedData.selectedProject, accessToken)
            })
            .fail(function (data) {
                if (data) {
                    console.log(`Failure Data: ${data}`)
                }
            })
    }
    const renderDrawingArea = (data, accessToken) => {
        $("#loading-drawing-area-list").css("display", "inline");
        $.get(`https://api.procore.com/rest/v1.1/projects/${data.id}/drawing_areas`, { access_token: accessToken, project_id: data.id })
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
                $("#select-drawing-area").select2("trigger", "select", {
                    data: { id: selectedData.selectedDrawingArea.id }
                });
                $('#select-drawing-area').prop("disabled", false)
                $("#loading-drawing-area-list").css("display", "none");

                renderDisciplines(selectedData.selectedProject.id, accessToken)
            })
            .fail(function (data) {
                if (data) {
                    console.log(`Failure Data: ${data}`)
                }
            })
    }
    const renderDisciplines = (data, accessToken) => {
        $("#loading-drawing-discipline-list").css("display", "inline");
        $.get(`https://api.procore.com/rest/v1.1/projects/${data}/drawing_disciplines`, { access_token: accessToken, project_id: data })
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
                $("#select-drawing-disciplines").select2("trigger", "select", {
                    data: { id: selectedData.selectedDrawingDiscipline.id }
                });
                $('#select-drawing-disciplines').prop("disabled", false)
                $("#loading-drawing-discipline-list").css("display", "none");
            })
            .fail(function (data) {
                if (data) {
                    console.log(`Failure Data: ${data}`)
                }
            })
    }

    // Edit handlers
    const editRenderProjectList = (company, accessToken) => {
        $("#loading-project-list").css("display", "inline");
        $.get("https://api.procore.com/rest/v1.0/projects", { access_token: accessToken, company_id: company.id })
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
    const editRenderDrawingAreaList = (data, accessToken) => {
        $("#loading-drawing-area-list").css("display", "inline");
        $.get(`https://api.procore.com/rest/v1.1/projects/${data.id}/drawing_areas`, { access_token: accessToken, project_id: data.id })
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
    const editRenderDrawingDisciplineList = (data, accessToken) => {
        $("#loading-drawing-discipline-list").css("display", "inline");
        $.get(`https://api.procore.com/rest/v1.1/projects/${data}/drawing_disciplines`, { access_token: accessToken, project_id: data })
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
                $('#modal-heading').text('Edit Drawing Profile'); $('#modal-body-container').attr("style", "filter: blur(0px);")
            })
            .fail(function (data) {
                if (data) {
                    console.log(`Failure Data: ${data}`)
                }
            })
    }

    // Step 1 - Saves edited company to dataBucket & populates project select
    $('#select-company').unbind("select2:select").on('select2:select', function (e) {
        $('#select-project').html('').select2({ data: [{ id: '', text: '' }] }); $('#select-drawing-area').html('').select2({ data: [{ id: '', text: '' }] }); $('#select-drawing-disciplines').html('').select2({ data: [{ id: '', text: '' }] });
        $('#select-drawing-disciplines').prop("disabled", true); $('#select-drawing-area').prop("disabled", true); $('#select-project').prop("disabled", true);
        $('#save-close-button').prop("disabled", true); $('#save-close-button').addClass("disabled");
        const data = e.params.data
        dataBucket.selectedCompany = { id: data.id, name: data.text }
        if (dataBucket.selectedCompany) {
            editRenderProjectList(data, accessToken)
        }
        console.log(dataBucket.selectedCompany)
    })

    // Step 2 - Saves edited project to dataBucket & populates drawing area select
    $('#select-project').unbind("select2:select").on('select2:select', function (e) {
        $('#select-drawing-area').html('').select2({ data: [{ id: '', text: '' }] }); $('#select-drawing-disciplines').html('').select2({ data: [{ id: '', text: '' }] });
        $('#select-drawing-disciplines').prop("disabled", true); $('#select-drawing-area').prop("disabled", true);
        $('#save-close-button').prop("disabled", true); $('#save-close-button').addClass("disabled");
        let data = e.params.data
        dataBucket.selectedProject = { id: data.id, name: data.text }
        console.log(dataBucket.selectedProject)
        if (dataBucket.selectedProject) {
            editRenderDrawingAreaList(data, accessToken)
        }
    })

    // Step 3 - Saves edited drawing area to dataBucket & populates drawing discipline select
    $('#select-drawing-area').unbind("select2:select").on('select2:select', function (e) {
        $('#select-drawing-disciplines').html('').select2({ data: [{ id: '', text: '' }] }); $('#select-drawing-disciplines').prop("disabled", true);
        $('#save-close-button').prop("disabled", true); $('#save-close-button').addClass("disabled");
        let data = e.params.data
        dataBucket.selectedDrawingArea = { id: data.id, name: data.text }
        console.log(dataBucket.selectedDrawingArea)
        if (dataBucket.selectedDrawingArea) {
            editRenderDrawingDisciplineList(selectedData.selectedProject.id, accessToken)
        }
    })

    // Step 4 - Saves edited drawing discipline to dataBucket, enables save button
    $('#select-drawing-disciplines').unbind("select2:select").on('select2:select', function (e) {
        let data = e.params.data
        dataBucket.selectedDrawingDiscipline = { id: data.id, name: data.text }
        console.log(dataBucket.selectedDrawingDiscipline)
        $('#save-close-button').prop("disabled", false); $('#save-close-button').removeClass("disabled"); $('#save-location').prop("disabled", false); $('#save-location').removeClass("disabled"); 
    })

    // Step 5a (OPTIONAL) Set save location
    $('#save-location').unbind('click').on('click', () => {
        ipcRenderer.send('save-location')
        
        // Upon received message with save location
        ipcRenderer.on("saved-location", (event, arg) => {
            dataBucket.saveLocation = arg[0]
        }) 
    })

    // Step 5b - Commits edited data upon close
    $('#save-close-button').unbind('click').on('click', () => {
        if (dataBucket.selectedDrawingDiscipline) {
            const indexOfId = procoreData.findIndex(i => i._id === selectionId)
            procoreData[indexOfId] = { _id: selectionId, selectedCompany: dataBucket.selectedCompany, selectedProject: dataBucket.selectedProject, selectedDrawingArea: dataBucket.selectedDrawingArea, selectedDrawingDiscipline: dataBucket.selectedDrawingDiscipline, saveLocation: dataBucket.saveLocation }
            store.set('procoreData', procoreData)
        }
    })

    // Initial styling
    $('#modal-heading').text("Loading...")
    $('#modal-body-container').attr("style", "filter: blur(4px);")
    $('#select-drawing-disciplines').prop("disabled", true); $('#select-drawing-area').prop("disabled", true); $('#select-project').prop("disabled", true); $('#select-company').prop("disabled", true)
    $('#save-close-button').prop("disabled", true); $('#save-close-button').addClass("disabled");
    
    // Trigger population chain
    $.get(`https://api.procore.com/rest/v1.0/companies`, { access_token: accessToken })
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

                // const indexOfSelection = bucket.findIndex(i => i.id == selectedData.selectedCompany.id)
                // console.log(`INDEX OF SELECTION: ${indexOfSelection}`)

                $("#select-company").select2({
                    data: bucket
                })
                $("#select-company").select2("trigger", "select", {
                    data: { id: selectedData.selectedCompany.id }
                });
                $('#select-company').prop("disabled", false)

                // Populates project list based on selected company
                renderProjectList(selectedData.selectedCompany,accessToken)
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

// Stores list of drawings & download URLS in local storage (don't worry, its being called)
const downloadDrawings = (e, id, accessToken) => {
    e.stopPropagation()
    const selectedProfileInfo = procoreData.find(x => x._id === id)
    const index = procoreData.findIndex(x => x._id === id)
    const drawingAreaId = selectedProfileInfo.selectedDrawingArea.id
    const projectId = selectedProfileInfo.selectedProject.id
    const discipline = selectedProfileInfo.selectedDrawingDiscipline.name

    const proceedDownload = () => {
        $.get(`https://api.procore.com/rest/v1.1/drawing_areas/${drawingAreaId}/drawings`, { drawing_area_id: drawingAreaId, access_token: accessToken, project_id: projectId })
            .done(function (data) {
                if (data) {
                    const drawingBucket = data.filter(drawing => drawing.discipline === discipline)
                    procoreData[index].drawingData = drawingBucket

                    const drawingLoop = async () => {
                        for (const drawing of drawingBucket) {
                            const response = await downloadDrawing(drawing, selectedProfileInfo)
                            console.log(response)
                        }
                    }
                    drawingLoop()
                }
            })
    }

    // Checks to see if save location is set prior to download (kinda janky, doesn't give the option to set a new save location. Should specify save location in the modal)
    if (selectedProfileInfo.saveLocation){
        proceedDownload()
    } else {
        ipcRenderer.send('save-location')
        const index = procoreData.findIndex(x => x._id === id)

        // Upon received message with save location
        ipcRenderer.on("saved-location", (event, arg) => {
            console.log(arg[0]); // Full file path
            procoreData[index].saveLocation = arg[0]
            proceedDownload()
    })
    }

}

// Downloads drawings
const downloadDrawing = (drawing, profile) => {
    return new Promise((resolve, reject) =>{
        setTimeout(() => {
            ipcRenderer.send("download", {
                url: drawing.current_revision.pdf_url,
                options: {directory: profile.saveLocation, filename: `${drawing.number} - ${drawing.title}.pdf`}    
            })
        }, 150)

        ipcRenderer.on("download complete", (event, arg) => {
            resolve('download complete')
        });
    })
}

// Prepopulates & opens modal upon item click (don't worry, its being called)
const triggerModal = (e, id) => {
    const indexofId = procoreData.findIndex(i => i._id === id)
    console.log(`Index of ID: ${indexofId}`)
    $('#drawings-modal').modal();
    editProfile(id)
}

// Monitors storage for adds, deletes, and edits, and handles them
exports.startObserve = () => {
    // Monitors for new adds to procoreData
    _.observe(procoreData, 'create', function(new_item, item_index){
        const listLinkItem = document.createElement('a'); listLinkItem.classList = "list-group-item list-group-item-action"; listLinkItem.setAttribute("id", new_item._id); listLinkItem.setAttribute("onClick", 'triggerModal(event, this.id)');
        const rowDiv = document.createElement('div'); rowDiv.classList = 'row align-items-center flex-nowrap no-gutters' 
        const colDiv = document.createElement('div'); colDiv.classList = 'col text-nowrap mr-2'
        const h6 = document.createElement('h6'); h6.classList = 'mb-0'; h6.innerHTML = `<strong>${new_item.selectedProject.name}</strong>`
        const spanText = document.createElement('span'); spanText.classList = "text-xs"; spanText.innerText = `${new_item.selectedDrawingDiscipline.name}`
        const colDiv2 = document.createElement('div'); colDiv2.classList = "col-auto"
        const downloadButton = document.createElement('button'); downloadButton.setAttribute("id", new_item._id); downloadButton.classList = "btn btn-primary"; $(downloadButton).css("background", "url(\"assets/img/avatars/download-2-128.png\") center / 15px no-repeat"); $(downloadButton).css("height", "22px"); $(downloadButton).css("border-style", "none"); downloadButton.setAttribute("onClick", 'downloadDrawings(event, this.id, accessToken)');
        const colDiv3 = document.createElement('div'); colDiv3.classList = "col-xl-1 text-right"; $(colDiv3).css("padding-right", "15px")
        const deleteButton = document.createElement('button'); deleteButton.classList = "close"; deleteButton.setAttribute("id", new_item._id); deleteButton.setAttribute("onClick", 'deleteItem(event, this.id)');
        const closeSpan = document.createElement('span'); closeSpan.setAttribute("aria-hidden", "true"); closeSpan.innerText='x'

        listLinkItem.appendChild(rowDiv); rowDiv.appendChild(colDiv); colDiv.appendChild(h6); colDiv.appendChild(spanText); 
        rowDiv.appendChild(colDiv3); colDiv3.appendChild(downloadButton)
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

    // Monitors procoreData array for changes and makes updates
    _.observe(procoreData, 'update', function (new_item, old_item, item_index){
        $('#drawing-list').children().each(function (){
            if ($(this).attr("id") === new_item._id){
                $(this).find('h6').html(`<stong>${new_item.selectedCompany.name}</strong>`); $(this).find('h6').css("font-weight",`bold`)
                $(this).find('.text-xs').text(`${new_item.selectedDrawingDiscipline.name}`)
            }
        })
    })
}

// Misc event handlers
exports.startMisc = () => {
    $('#logout-button').on('click', () => {
        ipcRenderer.send("logout")
    })
}

// Terminal logger
const logger = (arg) => {
    ipcRenderer.send("logger", arg)
}