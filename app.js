const gltfPipeline = require("gltf-pipeline");
const fsExtra = require("fs-extra");

async function glbToGltf(folderPath, fileName){
    const pipeline = gltfPipeline.glbToGltf;
    const glb = fsExtra.readFileSync(folderPath+"/"+fileName);
    await pipeline(glb).then(function (results) {
      fsExtra.writeJsonSync(folderPath + "/" + fileName.split(".")[0] + "-converted.gltf", results.gltf);
    });
}

async function seperateGltf(folderPath, fileName){
    const processGltf = gltfPipeline.processGltf;
    const gltf = fsExtra.readJsonSync(folderPath+"/"+fileName);
    const options = {
        separateTextures: true,
    };
    await processGltf(gltf, options).then(function (results) {
        fsExtra.writeJsonSync(folderPath + "/" + fileName.split(".")[0] + "-seperated.gltf", results.gltf);
        // Save separate resources
        const separateResources = results.separateResources;
        for (const relativePath in separateResources) {
            if (separateResources.hasOwnProperty(relativePath)) {
            const resource = separateResources[relativePath];
            fsExtra.writeFileSync(folderPath+"/"+relativePath, resource);
            }
        }
    });
}

function moveGlbs(folderPath, fileName){
    fsExtra.moveSync(folderPath+"/"+fileName, folderPath+"/stock/"+fileName, (err) => {
        if (err) return console.log(err);
        console.log(`File successfully moved!!`);
    });
}

function editFiles(folderPath, fileName){
    fsExtra.unlinkSync(folderPath+"/"+fileName.split(".")[0] + "-converted.gltf");
    fsExtra.renameSync(folderPath+"/"+fileName.split(".")[0]+"-converted-seperated.gltf",folderPath+"/"+fileName.split(".")[0]+".gltf");
}

let folder = process.argv[2];

if(process.argv[2] == undefined || null){
    folder = "./models";
}
let arr = [];

fsExtra.readdirSync(folder).forEach(file => {
    if(file.split(".")[1] == "glb"){
        arr.push(file);
    }
});

console.log(arr)

arr.forEach(async (file) => {
    await glbToGltf(folder,file);
    await seperateGltf(folder,file.split(".")[0] + "-converted.gltf");
    moveGlbs(folder,file);
    editFiles(folder, file)
})