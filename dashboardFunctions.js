const { ipcRenderer } = require("electron")
let selectedNodeList = []
let companyList = {}

// The eventual push:
//procoreData.push({ _id: exports.uuidv4(), selectedCompany: dataBucket.selectedCompany, selectedProject: dataBucket.selectedProject, selectedDrawingArea: dataBucket.selectedDrawingArea, selectedDrawingDiscipline: dataBucket.selectedDrawingDiscipline })
//tore.set('procoreData', procoreData)

// Handles add profile
exports.addProfileHandler = () => {
    let dataBucket = {
        selectedCompany: "",
        selectedProject: "",
        selectedDrawingArea: "",
        selectedDrawingDiscipline: ""
    }

    // Step 1 - Saves selected company to dataBucket & populates project select
    $('#select-company').on('select2:select', function (e) {
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
    $('#select-project').on('select2:select', function (e) {
        let data = e.params.data
        dataBucket.selectedProject = { id: data.id, name: data.text }
        console.log(dataBucket.selectedProject)
        if (dataBucket.selectedProject) {
            renderDrawingAreaList(data, accessToken)

        }
    })

    const renderDrawingAreaList = (data, accessToken) => {
        let projectData = []
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
    $('#select-drawing-area').on('select2:select', function (e) {
        let data = e.params.data
        dataBucket.selectedDrawingArea = { id: data.id, name: data.text }
        console.log(dataBucket.selectedDrawingArea)
        if (dataBucket.selectedDrawingArea) {
            renderDrawingDisciplineList(dataBucket.selectedProject.id, accessToken)
        }
    })

    const renderDrawingDisciplineList = (data, accessToken) => {
        let projectData = []
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
    $('#select-drawing-disciplines').on('select2:select', function (e) {
        let data = e.params.data
        dataBucket.selectedDrawingDiscipline = { id: data.id, name: data.text }
        console.log(dataBucket.selectedDrawingDiscipline)
        $('#save-close-button').prop("disabled", false); $('#save-close-button').removeClass("disabled"); 
    })

    // Step 5 - Commits data upon close
    $('#save-close-button').on('click', () => {
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

// UUID generator
const uuidv4 = () => {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
        var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
    });
}

// Monitors storage for adds, deletes, and edits, and handles them
exports.startObserve = () => {
    _.observe(procoreData, 'create', function(new_item, item_index){
        console.log('ProcoreData Observe')
    })
}
