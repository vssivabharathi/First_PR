const express = require("express");
const fs = require("fs");
const path = require("path");
const cheerio = require("cheerio");
const chokidar = require("chokidar");

const app = express();
const port = process.env.PORT || 3000;
const directoryPath = "./contributions/";


function updateReadme() {
  fs.readdir(directoryPath, (err, files) => {
    if (err) {
      console.error("Error reading directory:", err);
      return;
    }

    const tableRows = files
      .filter((file) => file.endsWith(".html"))
      .map((file) => {
        const fileName = path.parse(file).name;
        const filePath = path.join(directoryPath, file);
        try {
          const fileContent = fs.readFileSync(filePath, "utf8");
          const $ = cheerio.load(fileContent);

          const imgSrc = $("img").attr("src");
          const name = $(".name1").text();
          const message = $(".message1").text();

          return `
<tr>
  <td align="center"><img src="${imgSrc}" width="200px" height="100px" alt=""/><br /><sub><b>${name}</b></sub><br /></td>
  <td align="center"><i>${message}</i></td>
</tr>`;
        } catch (err) {
          console.error(`Error reading file ${file}:`, err);
          return `| Error reading file |  |`;
        }
      });

    const tableContent = `
<table align="center" >
  <tr>
    <th>Contributor</th>
    <th>Contribution</th>
  </tr>
  ${tableRows.join("\n")}
</table>`;

    const readmeContent = `
# Contributions

${tableContent}
`;

    const readmeFilePath = path.join(directoryPath, "readme.md");
    fs.writeFileSync(readmeFilePath, readmeContent);
  });
}


const watcher = chokidar.watch(directoryPath, {
  ignored: /(^|[\/\\])\../, 
  persistent: true,
});


watcher.on("add", () => {
  updateReadme();
});

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, directoryPath, "readme.md"));
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
  
  updateReadme();
});
