const { ipcRenderer } = require("electron")
let selectedNodeList = []
let companyList = {}

// The eventual push:
//procoreData.push({ _id: exports.uuidv4(), selectedCompany: dataBucket.selectedCompany, selectedProject: dataBucket.selectedProject, selectedDrawingArea: dataBucket.selectedDrawingArea, selectedDrawingDiscipline: dataBucket.selectedDrawingDiscipline })
//tore.set('procoreData', procoreData)