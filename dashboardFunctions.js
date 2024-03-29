const { ipcRenderer } = require("electron");
const { data } = require("jquery");
const { update } = require("lodash");

// Handles add profile
exports.addProfileHandler = () => {
    let dataBucket = {
        selectedCompany: "",
        selectedProject: "",
        selectedDrawingArea: "",
        selectedDrawingDiscipline: "",
        id: uuidv4(),
        saveLocation: "",
        drawingData: ""
    }
    $('#modal-heading').text('Add Drawings')

    // Step 1 - Populates company list on "add drawings"
    $("#drawings-modal-body").css('background', "url(assets/img/avatars/loading-buffering.gif) center / 75px no-repeat"); $('#save-location').prop("disabled", true)
    $('#select-company-div').css('opacity', '0'); $('#select-project-div').css('opacity', '0'); $('#select-drawing-area-div').css('opacity', '0'); $('#select-drawing-discipline-div').css('opacity', '0')
    $.get(`https://api.procore.com/rest/v1.0/companies`)
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
                $('#select-company-div').css('opacity', '1'); $('#select-project-div').css('opacity', '1'); $('#select-drawing-area-div').css('opacity', '1'); $('#select-drawing-discipline-div').css('opacity', '1')
                $("#drawings-modal-body").css('background', '')
            }
            else {
                throw Error
            }
        })
        .fail(function (data) {
            if (data) {
                console.log(`Failure Data: ${data}`)
                $('.modal').modal('hide');
                $('#error-modal').modal()
            }
        })

    // Step 2 - Saves selected company to dataBucket & populates project select
    $('#select-company').unbind("select2:select").on('select2:select', function (e) {
        $('#select-project').html('').select2({ data: [{ id: '', text: '' }] }); $('#select-drawing-area').html('').select2({ data: [{ id: '', text: '' }] }); $('#select-drawing-disciplines').html('').select2({ data: [{ id: '', text: '' }] });
        $('#select-drawing-disciplines').prop("disabled", true); $('#select-drawing-area').prop("disabled", true); $('#select-project').prop("disabled", true);
        $('#save-close-button').prop("disabled", true); $('#save-close-button').addClass("disabled");
        const data = e.params.data
        dataBucket.selectedCompany = { id: data.id, name: data.text }
        if (dataBucket.selectedCompany) {
            renderProjectList(data, accessToken)
        }
    })

    const renderProjectList = (company, accessToken) => {
        $("#loading-project-list").css("display", "inline");
        $.get("https://api.procore.com/rest/v1.0/projects", { company_id: company.id })
            .done(function (data) {
                let bucket = []
                if (data) {
                    // Populate project select
                    data.forEach(item => {
                        if (item.id) {
                            let object = {}
                            object.id = item.id
                            object.text = item.name
                            bucket.push(object)
                        }
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
                    $('.modal').modal('hide');
                    $('#error-modal').modal()
                }
            })
    }

    // Step 3 - Saves selected project to dataBucket & populates drawing area select
    $('#select-project').unbind("select2:select").on('select2:select', function (e) {
        $('#select-drawing-area').html('').select2({ data: [{ id: '', text: '' }] }); $('#select-drawing-disciplines').html('').select2({ data: [{ id: '', text: '' }] });
        $('#select-drawing-disciplines').prop("disabled", true); $('#select-drawing-area').prop("disabled", true);
        $('#save-close-button').prop("disabled", true); $('#save-close-button').addClass("disabled");
        let data = e.params.data
        dataBucket.selectedProject = { id: data.id, name: data.text }
        if (dataBucket.selectedProject) {
            renderDrawingAreaList(data, accessToken)

        }
    })

    const renderDrawingAreaList = (data, accessToken) => {
        $("#loading-drawing-area-list").css("display", "inline");
        $.get(`https://api.procore.com/rest/v1.1/projects/${data.id}/drawing_areas`, { project_id: data.id })
            .done(function (data) {
                let bucket = []
                if (data) {
                    // Populate select
                    data.forEach(item => {
                        if (item.id) {
                            let object = {}
                            object.id = item.id
                            object.text = item.name
                            bucket.push(object)
                        }
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
                    $('.modal').modal('hide');
                    $('#error-modal').modal()
                }
            })
    }

    // Step 4 - Saves selected drawing area to dataBucket & populates drawing discipline select
    $('#select-drawing-area').unbind("select2:select").on('select2:select', function (e) {
        $('#select-drawing-disciplines').html('').select2({ data: [{ id: '', text: '' }] }); $('#select-drawing-disciplines').prop("disabled", true);
        $('#save-close-button').prop("disabled", true); $('#save-close-button').addClass("disabled");
        let data = e.params.data
        dataBucket.selectedDrawingArea = { id: data.id, name: data.text }
        if (dataBucket.selectedDrawingArea) {
            renderDrawingDisciplineList(dataBucket.selectedProject.id, accessToken)
        }
    })

    const renderDrawingDisciplineList = (data, accessToken) => {
        $("#loading-drawing-discipline-list").css("display", "inline");           
        $.get(`https://api.procore.com/rest/v1.1/projects/${data}/drawing_disciplines`, { project_id: data })
            .done(function (data) {
                let bucket = []
                if (data) {
                    // Populate select
                    data.forEach(item => {
                        if (item.id) {
                            let object = {}
                            object.id = item.id; object.text = item.name
                            bucket.push(object)
                        }
                    })
                }
                $('#select-drawing-disciplines').html('').select2({ data: [{ id: '', text: '' }] });
                $("#select-drawing-disciplines").select2({
                    data: bucket,
                    dropdownParent: $('#drawings-modal')
                })
                $('#select-drawing-disciplines').prop("disabled", false)
                $("#loading-drawing-discipline-list").css("display", "none");
            })
            .fail(function (data) {
                if (data) {
                    console.log(`Failure Data: ${data}`)
                    $('.modal').modal('hide');
                    $('#error-modal').modal()
                }
            })
    }

    // Step 5 - Saves selected drawing discipline to dataBucket, downloads drawing info for checkUpdate 
    $('#select-drawing-disciplines').unbind("select2:select").on('select2:select', function (e) {
        let data = e.params.data
        dataBucket.selectedDrawingDiscipline = { id: data.id, name: data.text };
        $('#loading-save-location').css('display', 'inline')
        $.get(`https://api.procore.com/rest/v1.1/drawing_areas/${dataBucket.selectedDrawingArea.id}/drawings`, { drawing_area_id: dataBucket.selectedDrawingArea.id, project_id: dataBucket.selectedProject.id })
            .done(function (data) {
                if (data) {
                    const bucket = data.filter(drawing => drawing.discipline === dataBucket.selectedDrawingDiscipline.name)
                    dataBucket.drawingData = bucket
                    $('#loading-save-location').css('display', 'none'); $('#save-location').prop("disabled", false); $('#save-location').removeClass("disabled");
                }
            })
            .fail(function (data) {
                console.log(data)
                $('.modal').modal('hide');
                $('#error-modal').modal()
            })
    })

    // Step 6 - Set download location, enables save button
    $('#save-location').unbind('click').on('click', () => {
        ipcRenderer.send('save-location')

        // Upon received message with save location
        ipcRenderer.on("saved-location", (event, arg) => {
            dataBucket.saveLocation = arg[0]
            $('#save-close-button').prop("disabled", false); $('#save-close-button').removeClass("disabled");
        })
    })

    // Step 7 - Commits data upon close
    $('#save-close-button').unbind('click').on('click', () => {
        if (dataBucket.selectedDrawingDiscipline) {
            procoreData.push({ _id: dataBucket.id, selectedCompany: dataBucket.selectedCompany, selectedProject: dataBucket.selectedProject, selectedDrawingArea: dataBucket.selectedDrawingArea, selectedDrawingDiscipline: dataBucket.selectedDrawingDiscipline, saveLocation: dataBucket.saveLocation, drawingData: dataBucket.drawingData })
        }
    })
}

// Edit existing profile
const editProfile = (selectionId) => {
    // Data imports & function definitions
    const indexOfId = procoreData.findIndex(i => i._id === selectionId)
    const selectedData = procoreData[indexOfId]
    let dataBucket = {}

    // Initial styling
    $('#modal-heading').text("Loading...")
    $("#drawings-modal-body").css('background', "url(assets/img/avatars/loading-buffering.gif) center / 75px no-repeat")
    $('#select-company-div').css('opacity', '0'); $('#select-project-div').css('opacity', '0'); $('#select-drawing-area-div').css('opacity', '0'); $('#select-drawing-discipline-div').css('opacity', '0')
    $('#select-drawing-disciplines').prop("disabled", true); $('#select-drawing-area').prop("disabled", true); $('#select-project').prop("disabled", true); $('#select-company').prop("disabled", true)
    $('#save-close-button').prop("disabled", true); $('#save-close-button').addClass("disabled"); $('#save-location').prop("disabled", true);

    // Trigger population chain
    $.get(`https://api.procore.com/rest/v1.0/companies`)
        .done(function (data) {
            let bucket = []
            if (data) {
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
                $("#select-company").select2("trigger", "select", {
                    data: { id: selectedData.selectedCompany.id }
                });
                $('#select-company').prop("disabled", false)

                // Populates project list based on selected company
                renderProjectList(selectedData.selectedCompany, accessToken)
            }
        })

    // Initial render of prepopulated - renderDisciplines resets styling
    const renderProjectList = (company, accessToken) => {
        $("#loading-project-list").css("display", "inline");
        $.get("https://api.procore.com/rest/v1.0/projects", { company_id: company.id })
            .done(function (data) {
                let bucket = []
                if (data) {
                    // Populate project select
                    data.forEach(item => {
                        if (item.id) {
                            let object = {}
                            object.id = item.id
                            object.text = item.name
                            bucket.push(object)
                        }
                    })
                }
                $('#select-project').html('').select2({ data: [{ id: '', text: '' }] });
                $("#select-project").select2({
                    data: bucket
                })
                $("#select-project").select2("trigger", "select", {
                    data: { id: selectedData.selectedProject.id, name: selectedData.selectedProject.name }
                });
                $('#select-project').prop("disabled", false)
                $("#loading-project-list").css("display", "none");

                renderDrawingArea(selectedData.selectedProject, accessToken)
            })
            .fail(function (data) {
                if (data) {
                    console.log(`Failure Data: ${data}`)
                    $('.modal').modal('hide');
                    $('#error-modal').modal()
                }
            })
    }
    const renderDrawingArea = (data, accessToken) => {
        $("#loading-drawing-area-list").css("display", "inline");
        $.get(`https://api.procore.com/rest/v1.1/projects/${data.id}/drawing_areas`, { project_id: data.id })
            .done(function (data) {
                let bucket = []
                if (data) {
                    // Populate select
                    data.forEach(item => {
                        if (item.id) {
                            let object = {}
                            object.id = item.id
                            object.text = item.name
                            bucket.push(object)
                        }
                    })
                }
                $('#select-drawing-area').html('').select2({ data: [{ id: '', text: '' }] });
                $("#select-drawing-area").select2({
                    data: bucket
                })
                $("#select-drawing-area").select2("trigger", "select", {
                    data: { id: selectedData.selectedDrawingArea.id, name: selectedData.selectedDrawingArea.name }
                });
                $('#select-drawing-area').prop("disabled", false)
                $("#loading-drawing-area-list").css("display", "none");

                renderDisciplines(selectedData.selectedProject.id, accessToken)
            })
            .fail(function (data) {
                if (data) {
                    console.log(`Failure Data: ${data}`)
                    $('.modal').modal('hide');
                    $('#error-modal').modal()
                }
            })
    }
    const renderDisciplines = (data, accessToken) => {
        $("#loading-drawing-discipline-list").css("display", "inline");
        $.get(`https://api.procore.com/rest/v1.1/projects/${data}/drawing_disciplines`, { project_id: data })
            .done(function (data) {
                let bucket = []
                if (data) {
                    // Populate select
                    data.forEach(item => {
                        if (item.id) {
                            let object = {}
                            object.id = item.id
                            object.text = item.name
                            bucket.push(object)
                        }
                    })
                }
                $('#select-drawing-disciplines').html('').select2({ data: [{ id: '', text: '' }] });
                $("#select-drawing-disciplines").select2({
                    data: bucket
                })
                $("#select-drawing-disciplines").select2("trigger", "select", {
                    data: { id: selectedData.selectedDrawingDiscipline.id, name: selectedData.selectedDrawingDiscipline.name }
                });
                $('#select-drawing-disciplines').prop("disabled", false); $("#loading-drawing-discipline-list").css("display", "none"); $('#modal-heading').text('Edit Drawing Profile');
                $('#select-company-div').css('opacity', '1'); $('#select-project-div').css('opacity', '1'); $('#select-drawing-area-div').css('opacity', '1'); $('#select-drawing-discipline-div').css('opacity', '1')
                $("#drawings-modal-body").css('background', '')
            })
            .fail(function (data) {
                if (data) {
                    console.log(`Failure Data: ${data}`)
                    $('.modal').modal('hide');
                    $('#error-modal').modal()
                }
            })
    }

    // Edit handlers
    const editRenderProjectList = (company, accessToken) => {
        $("#loading-project-list").css("display", "inline");
        $.get("https://api.procore.com/rest/v1.0/projects", { company_id: company.id })
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
                    $('.modal').modal('hide');
                    $('#error-modal').modal()
                }
            })
    }
    const editRenderDrawingAreaList = (data, accessToken) => {
        $("#loading-drawing-area-list").css("display", "inline");
        $.get(`https://api.procore.com/rest/v1.1/projects/${data.id}/drawing_areas`, { project_id: data.id })
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
                    $('.modal').modal('hide');
                    $('#error-modal').modal()
                }
            })
    }
    const editRenderDrawingDisciplineList = (data, accessToken) => {
        $("#loading-drawing-discipline-list").css("display", "inline");
        $.get(`https://api.procore.com/rest/v1.1/projects/${data}/drawing_disciplines`, { project_id: data })
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
                    $('.modal').modal('hide');
                    $('#error-modal').modal()
                }
            })
    }

    // Step 1 - Saves edited company to dataBucket & populates project select
    $('#select-company').unbind("select2:select").on('select2:select', function (e) {
        $('#select-project').html('').select2({ data: [{ id: '', text: '' }] }); $('#select-drawing-area').html('').select2({ data: [{ id: '', text: '' }] }); $('#select-drawing-disciplines').html('').select2({ data: [{ id: '', text: '' }] });
        $('#select-drawing-disciplines').prop("disabled", true); $('#select-drawing-area').prop("disabled", true); $('#select-project').prop("disabled", true);
        $('#save-close-button').prop("disabled", true); $('#save-close-button').addClass("disabled"); $('#save-location').prop("disabled", true);
        const data = e.params.data;
        dataBucket.selectedCompany = { id: data.id, name: $('#select-company').select2('data')[0].text }
        if (dataBucket.selectedCompany) {
            editRenderProjectList(data, accessToken)
        }
    })

    // Step 2 - Saves edited project to dataBucket & populates drawing area select
    $('#select-project').unbind("select2:select").on('select2:select', function (e) {
        $('#select-drawing-area').html('').select2({ data: [{ id: '', text: '' }] }); $('#select-drawing-disciplines').html('').select2({ data: [{ id: '', text: '' }] });
        $('#select-drawing-disciplines').prop("disabled", true); $('#select-drawing-area').prop("disabled", true);
        $('#save-close-button').prop("disabled", true); $('#save-close-button').addClass("disabled"); $('#save-location').prop("disabled", true);
        let data = e.params.data
        dataBucket.selectedProject = { id: data.id, name: $('#select-project').select2('data')[0].text }
        if (dataBucket.selectedProject) {
            editRenderDrawingAreaList(data, accessToken)
        }
    })

    // Step 3 - Saves edited drawing area to dataBucket & populates drawing discipline select
    $('#select-drawing-area').unbind("select2:select").on('select2:select', function (e) {
        $('#select-drawing-disciplines').html('').select2({ data: [{ id: '', text: '' }] }); $('#select-drawing-disciplines').prop("disabled", true);
        $('#save-close-button').prop("disabled", true); $('#save-close-button').addClass("disabled"); $('#save-location').prop("disabled", true);
        let data = e.params.data
        dataBucket.selectedDrawingArea = { id: data.id, name: $('#select-drawing-area').select2('data')[0].text }
        if (dataBucket.selectedDrawingArea) {
            editRenderDrawingDisciplineList(selectedData.selectedProject.id, accessToken)
        }
    })

    // Step 4 - Saves edited drawing discipline to dataBucket, downloads updated drawing list, enables save button
    $('#select-drawing-disciplines').unbind("select2:select").on('select2:select', function (e) {
        let data = e.params.data
        dataBucket.selectedDrawingDiscipline = { id: data.id, name: $('#select-drawing-disciplines').select2('data')[0].text }
        $('#loading-save-location').css('display', 'inline'); $('#save-location').prop("disabled", true);
        $.get(`https://api.procore.com/rest/v1.1/drawing_areas/${dataBucket.selectedDrawingArea.id}/drawings`, { drawing_area_id: dataBucket.selectedDrawingArea.id, project_id: dataBucket.selectedProject.id })
            .done(function (data) {
                if (data) {
                    const bucket = data.filter(drawing => drawing.discipline === dataBucket.selectedDrawingDiscipline.name)
                    dataBucket.drawingData = bucket
                    $('#loading-save-location').css('display', 'none'); $('#save-location').prop("disabled", false); $('#save-location').removeClass("disabled"); $('#save-close-button').prop("disabled", false); $('#save-close-button').removeClass("disabled");
                }
            })
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
            procoreData[indexOfId] = { _id: selectionId, selectedCompany: dataBucket.selectedCompany, selectedProject: dataBucket.selectedProject, selectedDrawingArea: dataBucket.selectedDrawingArea, selectedDrawingDiscipline: dataBucket.selectedDrawingDiscipline, saveLocation: dataBucket.saveLocation ? dataBucket.saveLocation : selectedData.saveLocation, drawingData: dataBucket.drawingData }
            $(`#alertImg_${selectionId}`).css('display', 'none')
        }
    })
}

// Checks for drawing updates
$('#updates-button').unbind('click').on('click', function () {
    $('#updates-spinner').css('display', 'inline'); $('#updates-button').addClass('disabled'); $("#scan-results").text('Scan Complete');
    let count = procoreData.length;

    // Checker functionality
    let updatePromise = new Promise((resolve, reject) => {
        for (const profile of procoreData) {
            $.get(`https://api.procore.com/rest/v1.1/drawing_areas/${profile.selectedDrawingArea.id}/drawings`, { drawing_area_id: profile.selectedDrawingArea.id, project_id: profile.selectedProject.id })
                .done((data) => {
                    if (data) {
                        // Initial declarations
                        const newDrawingData = data.filter(drawing => drawing.discipline === profile.selectedDrawingDiscipline.name)

                        // Conditional Logic
                        if (_.isEqual(profile.drawingData, newDrawingData) === false) {
                            // Update isCurrent profile property
                            const indexOfId = procoreData.findIndex(i => i._id === profile._id)
                            procoreData[indexOfId].isCurrent = false

                            count--
                            if (count == 0) {
                                resolve()
                            }
                        } else {
                            // Update isCurrent profile property
                            const indexOfId = procoreData.findIndex(i => i._id === profile._id)
                            procoreData[indexOfId].isCurrent = true

                            $(`#alertImg_${profile._id}`).css('display', 'none')
                            count--
                            if (count == 0) {
                                resolve()
                            }
                        }
                    }
                })
                .fail((data) => {
                    reject('Unknown error occured.')
                })
        }
    })

    updatePromise.then(
        (success) => {
            $('#updates-spinner').css('display', 'none')
            $("#scan-results").css('display', "inline"); $("#scan-results").fadeOut(5000)
            $('#updates-button').removeClass('disabled'); 
            checkCurrent()
        },
        (error) => {
            $('.modal').modal('hide');
            $('#error-modal').modal()
        }
    )

})

// Deletes list item (don't worry, its being called)
const deleteItem = (e, id) => {
    e.stopPropagation()
    const indexOfId = procoreData.findIndex(i => i._id === id)
    procoreData.splice(indexOfId, 1)

    // Adds message if no drawing profiles exist
    if (store.get(`${userId}.procoreData`).length === 0) {
        const listLinkItem = document.createElement('a'); listLinkItem.classList = "list-group-item list-group-item-action"; listLinkItem.setAttribute("id", 'no-drawings')
        const rowDiv = document.createElement('div'); rowDiv.classList = 'row align-items-center flex-nowrap no-gutters'
        const colDiv = document.createElement('div'); colDiv.classList = 'col text-nowrap mr-2'
        const h6 = document.createElement('h6'); h6.classList = 'mb-0'; h6.innerHTML = `<strong>Click "Add Drawings" to get started!</strong>`
        listLinkItem.appendChild(rowDiv); rowDiv.appendChild(colDiv); colDiv.appendChild(h6);
        $('#drawing-list').append(listLinkItem)
    }
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
        $.get(`https://api.procore.com/rest/v1.1/drawing_areas/${drawingAreaId}/drawings`, { drawing_area_id: drawingAreaId, project_id: projectId })
            .done(function (data) {
                if (data) {
                    const drawingBucket = data.filter(drawing => drawing.discipline === discipline)
                    procoreData[index].drawingData = drawingBucket
                    const numberOfDrawings = drawingBucket.length; let count = 0;

                    const drawingLoop = async () => {
                        for (const drawing of drawingBucket) {
                            count++; let percentage = count / numberOfDrawings * 100;
                            $('#progress-modal').removeAttr("tabindex"); $('#progress-modal').modal();
                            $('#progress-bar').css('width', `${percentage}%`).attr('aria-valuenow', percentage); $('#progress-bar').text(`${Math.round(percentage)}%`)
                            const response = await downloadDrawing(drawing, selectedProfileInfo)
                            if (percentage == 100) {
                                setTimeout(() => { $('#progress-bar').text(`Done!`) }, 1000)
                            }
                        }
                    }
                    drawingLoop()
                }
            })
            .fail(
                function (data) {
                    $('.modal').modal('hide');
                    $('#error-modal').modal()
                }
            )
    }

    // Checks to see if save location is set prior to download 
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
        const drawingTitle = drawing.title.replace(/[/\\?%*:|"<>]/g, '-')
        setTimeout(() => {
            ipcRenderer.send("download", {
                url: drawing.current_revision.pdf_url,
                options: {directory: profile.saveLocation, filename: `${drawing.number} - ${drawingTitle}.pdf`},
                overwrite: true    
            })
        }, 150)

        ipcRenderer.on("download complete", (event, arg) => {
            resolve('download complete')
        });
    })
}

// Checks if drawings are current and sets up download
const checkCurrent = () => {
    let count = procoreData.length; let currentCount = 0

    let checkerPromise = new Promise((resolve, reject) => {
        procoreData.forEach(profile => {
            if (profile.isCurrent === false) {
                $(`#alertImg_${profile._id}`).css('display', '')

                currentCount ++
                count--
                if (count == 0) {
                    resolve()
                }
            } else {
                count--
                if (count == 0) {
                    resolve()
                }
            }
        })
    })

    checkerPromise.then(
        (success) => {
            if (currentCount == 0){
                $("#scan-results").text('All drawings up to date!');("#scan-results").css('display', "inline"); $("#scan-results").fadeOut(5000)
            }    
        }
    )

}

// Prepopulates & opens modal upon item click (don't worry, its being called)
const triggerModal = (e, id) => {
    const indexofId = procoreData.findIndex(i => i._id === id)
    $('#drawings-modal').modal();
    editProfile(id)
}

// Resets add profile modal
exports.resetModal = () => {
    $('#select-project').html('').select2({ data: [{ id: '', text: '' }] }); $('#select-drawing-area').html('').select2({ data: [{ id: '', text: '' }] }); $('#select-drawing-disciplines').html('').select2({ data: [{ id: '', text: '' }] });
    $('#select-drawing-disciplines').prop("disabled", true); $('#select-drawing-area').prop("disabled", true); $('#select-project').prop("disabled", true); 
    $('#save-close-button').prop("disabled", true); $('#save-close-button').addClass("disabled");
    $("#select-company").val("1").trigger("change");
}

// UUID generator
const uuidv4 = () => {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
        var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
    });
}

// Monitors storage for adds, deletes, and edits, and handles them
exports.startObserve = () => {
    // Monitors for new adds to procoreData
    _.observe(procoreData, 'create', function(new_item, item_index){
        const listLinkItem = document.createElement('a'); listLinkItem.classList = "list-group-item list-group-item-action"; listLinkItem.setAttribute("id", new_item._id); listLinkItem.setAttribute("onClick", 'triggerModal(event, this.id)');
        const rowDiv = document.createElement('div'); rowDiv.classList = 'row align-items-center flex-nowrap no-gutters' 
        const colDiv = document.createElement('div'); colDiv.classList = 'col text-nowrap mr-2'
        const h6 = document.createElement('h6'); h6.classList = 'mb-0'; h6.innerHTML = `<strong>${new_item.selectedProject.name}</strong>`
        const spanText = document.createElement('span'); spanText.classList = "text-xs"; spanText.innerText = `${new_item.selectedDrawingArea.name} - ${new_item.selectedDrawingDiscipline.name}`
        const colDiv2 = document.createElement('div'); colDiv2.classList = "col-auto"
        const downloadButton = document.createElement('button'); downloadButton.setAttribute("id", new_item._id); downloadButton.classList = "btn btn-primary"; $(downloadButton).css("background", "url(\"assets/img/avatars/download-2-128.png\") center / 15px no-repeat"); $(downloadButton).css("height", "22px"); $(downloadButton).css("border-style", "none"); downloadButton.setAttribute("onClick", 'downloadDrawings(event, this.id, accessToken)');downloadButton.setAttribute("data-toggle", "tooltip"); downloadButton.setAttribute("title", "Start Download"); 
        const colDiv3 = document.createElement('div'); colDiv3.classList = "col-xl-1 text-right"; $(colDiv3).css("padding-right", "15px")
        const deleteButton = document.createElement('button'); deleteButton.classList = "close"; deleteButton.setAttribute("id", new_item._id); deleteButton.setAttribute("onClick", 'deleteItem(event, this.id)');
        const closeSpan = document.createElement('span'); closeSpan.setAttribute("aria-hidden", "true"); closeSpan.innerText='x'
        const alertImg = document.createElement('img'); alertImg.setAttribute("src", "assets/img/avatars/Alert_.png");alertImg.setAttribute("id", `alertImg_${new_item._id}`); alertImg.setAttribute("style", "height: 15px;padding-right: 15px; display: none;"); alertImg.setAttribute("data-toggle", "tooltip"); alertImg.setAttribute("title", "Drawing set out of date. Click to update."); alertImg.setAttribute("class", "alert-img");  

        listLinkItem.appendChild(rowDiv); rowDiv.appendChild(colDiv); colDiv.appendChild(h6); colDiv.appendChild(spanText); 
        rowDiv.appendChild(colDiv3); colDiv3.appendChild(alertImg); colDiv3.appendChild(downloadButton)
        rowDiv.appendChild(colDiv2); colDiv2.appendChild(deleteButton); deleteButton.appendChild(closeSpan)

        $('#drawing-list').append(listLinkItem); $('#no-drawings').remove()
        if (new_item.isCurrent === false) { $(`#alertImg_${new_item._id}`).css('display', '') }
        store.set(`${userId}.procoreData`, procoreData)
    })

     // Monitors procoreData array for deletes, then removes node and saves to store
     _.observe(procoreData, 'delete', function (old_item, item_index) {
        $('#drawing-list').contents().each((index, element) => {
            if (element.id && element.id === old_item._id) {
                $(element).remove()
                store.set(`${userId}.procoreData`, procoreData)
            }
        })
        console.log(`ID OF DELETED ITEM: ${old_item._id}`)
    })

    // Monitors procoreData array for changes and makes updates
    _.observe(procoreData, 'update', function (new_item, old_item, item_index){
        if (new_item) {
            $('#drawing-list').children().each(function (){
                if ($(this).attr("id") === new_item._id){
                    $(this).find('h6').html(`${new_item.selectedProject.name}`); $(this).find('h6').css("font-weight",`bold`)
                    $(this).find('.text-xs').text(`${new_item.selectedDrawingArea.name} - ${new_item.selectedDrawingDiscipline.name}`)
                }
            })
            store.set(`${userId}.procoreData`, procoreData)
        }
    })
}

// Misc startup functions
exports.startMisc = () => {
    // Logout
    $('#logout-button').on('click', () => {
        ipcRenderer.send("logout")
    })

    // Clears modal formatting & select2 options upon modal exit, aborts all active AJAX calls
    $('#drawings-modal').on('hidden.bs.modal', function () {
        $('#select-company').html('').select2({ data: [{ id: '', text: '' }] });$('#select-project').html('').select2({ data: [{ id: '', text: '' }] }); $('#select-drawing-area').html('').select2({ data: [{ id: '', text: '' }] }); $('#select-drawing-disciplines').html('').select2({ data: [{ id: '', text: '' }] });
        $("#drawings-modal-body").removeAttr("style"); $("#modal-body-container").removeAttr("style")
        $("#drawings-modal-body").css('background',"url('assets/img/avatars/loading-buffering.gif/') center / 75px no-repeat")
        window.abortAllMyAjaxRequests()
    });

    // Aborts all active AJAX requests when called
    (function($) {
        var xhrPool = [];
        $(document).ajaxSend(function(e, jqXHR, options){
          xhrPool.push(jqXHR);
        });
        $(document).ajaxComplete(function(e, jqXHR, options) {
          xhrPool = $.grep(xhrPool, function(x){return x!=jqXHR});
        });
        // Function
        window.abortAllMyAjaxRequests = function() {
          $.each(xhrPool, function(idx, jqXHR) {
            jqXHR.abort();
          });
        };
      })(jQuery);

    // Enables tooltips
    $("body").tooltip({ selector: '[data-toggle=tooltip]', placement: "left" });

    // jQuery AJAX settings
    $.ajaxSetup({
        contentType: 'application/json',
        headers: {
            'Authorization': `Bearer ${accessToken}`
        }
    });
}

// Terminal logger
const logger = (arg) => {
    ipcRenderer.send("logger", arg)
}