const fs = require("fs");
const path = require("path");

// Change the current working directory to the project root directory
process.chdir(path.join(__dirname, "../../"));

const projectJson = JSON.parse(fs.readFileSync("sfdx-project.json", "utf8"));
const packageDirs = projectJson.packageDirectories;

// Ensure the .images directory exists in the destination
const imagesOutputDir = path.join("docs/packages/.images");
if (!fs.existsSync(imagesOutputDir)) {
  fs.mkdirSync(imagesOutputDir, { recursive: true });
}

packageDirs.forEach((dir) => {
  const readmePath = path.join(dir.path, "README.md");
  const outputPath = path.join("docs/packages", `${dir.package}.md`);

  if (fs.existsSync(readmePath)) {
    fs.copyFileSync(readmePath, outputPath);
    console.log(`Copied ${readmePath} to ${outputPath}`);
  } else {
    console.log(`No README.md found in ${dir.path}`);
  }

  const imagesDir = path.join(dir.path, ".images");
  if (fs.existsSync(imagesDir)) {
    fs.readdirSync(imagesDir).forEach((file) => {
      const sourceFile = path.join(imagesDir, file);
      const destFile = path.join(imagesOutputDir, file);
      if (fs.lstatSync(sourceFile).isFile()) {
        fs.copyFileSync(sourceFile, destFile);
        console.log(`Copied ${sourceFile} to ${destFile}`);
      }
    });
  }
});
