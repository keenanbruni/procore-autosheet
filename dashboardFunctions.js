const { ipcRenderer } = require("electron")
let selectedNodeList = []
let companyList = {}

// The eventual push:
//procoreData.push({ _id: exports.uuidv4(), selectedCompany: dataBucket.selectedCompany, selectedProject: dataBucket.selectedProject, selectedDrawingArea: dataBucket.selectedDrawingArea, selectedDrawingDiscipline: dataBucket.selectedDrawingDiscipline })
//tore.set('procoreData', procoreData)

exports.addProfileHandler = () => {
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
    
    // Step 1 - Saves selected company to dataBucket
    $('#select-company').on('select2:select', function(e){
        let data = e.params.data
        dataBucket.selectedCompany = data
        if (dataBucket.selectedCompany) {
            exports.renderProjectList(data, accessToken)
        }
        console.log(`ARRG THIS BE THE DATA: ${data.id + " " + data.text}`)
    })

    // Step 2 - Saves selected project to dataBucket
    $('#select-project').on('select2:select', function(e){
        let data = e.params.data
        dataBucket.selectedProject = data
        if (dataBucket.selectedProject) {
            // dataBucket.drawingAreaPromise
            $('#select-drawing-area').prop("disabled", false)
        }
        console.log(`CURRENT DATABUCKET: ${dataBucket}`)
    })


}

// Renders list of projects in the modal
exports.renderProjectList = (company, accessToken) => {
    let projectData = []
    $("#loading-project-list").css("display", "inline");
    $.get("https://sandbox.procore.com/rest/v1.0/projects", { access_token: accessToken, company_id: company.id })
        .done(function (data) {
            let bucket = []
            if (data){
                // Populate project select
                data.forEach(item => {
                    let object = {}
                    object.id = item.id
                    object.text = item.name
                    bucket.push(object)
                })
                projectData.push(data)
            }
            $("#select-project").select2({
                data: bucket
            })
            $('#select-project').prop("disabled", false)
            $("#loading-project-list").css("display", "none");
            console.log(bucket)
        })
        .fail(function (data) {
            if (data){
                console.log(`Failure Data: ${data}`)
            }
        })
    return projectData
}