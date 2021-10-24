const minimist = require('minimist');
const fs = require('fs');
const path = require('path');
const pdf = require('pdf-lib');
const { get } = require('http');

let args = minimist(process.argv);

let dirPath = args.dir;
let files = getFiles(dirPath);
let subDir = getDirectories(dirPath);

mkdirectories(args.dir,__dirname);     // Function call

function mkdirectories(srcDir,currDir){
    let subDirs = getDirectories(srcDir);
    for(let i=0;i<subDirs.length;i++){
        let eachSdirPath = path.join(currDir,subDirs[i]);
        fs.mkdirSync(eachSdirPath,{recursive:true});
        mkdirectories(path.join(srcDir,subDirs[i]),eachSdirPath);
    }

    let files = getFiles(srcDir);
    let allfiles = [];
    for(let i=0;i<files.length;i++){
        let filePath = path.join(srcDir,files[i]);
        let stats = fs.statSync(filePath);
        let fileSize = Math.round((stats.size/1024)) + " kb";
        let data={
            no: i+1,
            name:files[i].substring(0,40),
            size:fileSize
        }
        allfiles.push(data);
    }
    createPdf(allfiles,currDir,srcDir);
}



// Creates a pdf
async function createPdf(fileData,destPath,dir){
    
    let filePath = path.join(destPath,"files.pdf");
    
    let templateBytes = fs.readFileSync('template.pdf');
    let pdfDoc = await pdf.PDFDocument.load(templateBytes);
    let page = pdfDoc.getPages()[0];

    for(let i=0;i<fileData.length && i<24;i++){
        let no = fileData[i].no+"";
        let name = fileData[i].name;
        let size = fileData[i].size;

        page.drawText(dir, {
            x: 150,
            y: 703,
            size: 13,
        })

        page.drawText(no, {
            x: 100,
            y: 610-(i*22.5),
            size: 14,
            
        }) 
    
        page.drawText(name, {
            x: 145,
            y: 610-(i*22.5),
            size: 14,
            
        }) 

        page.drawText(size, {
            x: 480,
            y: 610-(i*22.5),
            size: 14,
            
        })
    }

    let pdfBytes = await pdfDoc.save();

    fs.writeFileSync(filePath,pdfBytes);
}

// Return Subfolder present in current directory
function getDirectories(dirPath) {
    return fs.readdirSync(dirPath).filter(function (file) {
      return fs.statSync(dirPath+'/'+file).isDirectory();
    });
}

// Returns files present in current directory
function getFiles(dirPath){
    return fs.readdirSync(dirPath).filter(function(file) {
        return fs.lstatSync(path.join(dirPath, file)).isFile();
    });
}


