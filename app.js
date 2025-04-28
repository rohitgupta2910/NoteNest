const { log } = require('console');
const express = require('express');
const fs = require('fs');
const app = express()
app.set('view engine', 'ejs')

app.use(express.urlencoded({ extended: true }))
app.use(express.json())

app.get('/', (req, res) => {
    fs.readdir('./uploads', { withFileTypes: true }, (err, files) => {
        if (err) {
            // Create uploads directory if it doesn't exist
            fs.mkdirSync('./uploads', { recursive: true });
            files = [];
        }
        res.render("index", { files })
    })
})

app.post('/createfolder', (req, res) => {
    const folderName = req.body.name;
    fs.mkdir(`./uploads/${folderName}`, { recursive: true }, (err) => {
        if (err) {
            console.error(err);
            return res.status(500).send("Error creating folder");
        }
        res.redirect('/');
    });
})

app.get('/viewfolder/:name', (req, res) => {
    fs.readdir(`./uploads/${req.params.name}`, { withFileTypes: true }, (err, files) => {
        if (err) {
            console.error(err);
            return res.status(500).send("Error reading folder");
        }
        const path = `./uploads/${req.params.name}`
        res.render("files", { files, path })
    })
})

app.get('/uploads/:folder/createfile', (req, res) => {
    const folderName = req.params.folder
    res.render('createfile', { folderName })
})

app.post('/uploads/:folder/savefile', (req, res) => {
    const filePath = `./uploads/${req.params.folder}/${req.body.title}`;
    fs.writeFile(filePath, req.body.content, (err) => {
        if (err) {
            console.error(err);
            return res.status(500).send("Error saving file");
        }
        res.redirect(`/viewfolder/${req.params.folder}`)
    })
})

app.get('/deletefolder/:name', (req, res) => {
    const folderPath = `./uploads/${req.params.name}`;
    fs.rm(folderPath, { recursive: true }, (err) => {
        if (err) {
            console.error(err);
            return res.status(500).send("Error deleting folder");
        }
        res.redirect('/');
    });
});

app.get('/uploads/:folder/:file/viewfile', (req, res) => {
    fs.readFile(`./uploads/${req.params.folder}/${req.params.file}`, 'utf8', (err, data) => {
        if (err) {
            console.error(err);
            return res.status(500).send("Error reading file");
        }
        const file = {
            title: req.params.file,
            content: data,
            folder: req.params.folder
        }
        res.render('viewfile', { file })
    })
})

app.get('/upload/:folder/:file/edit', (req, res) => {
    fs.readFile(`./uploads/${req.params.folder}/${req.params.file}`, 'utf8', (err, data) => {
        if (err) {
            console.error(err);
            return res.status(500).send("Error reading file");
        }
        const file = {
            title: req.params.file,
            content: data,
            folder: req.params.folder
        }
        res.render('edit', { file })
    })
})

app.post('/uploads/:folder/:file/update', (req, res) => {
    const title = req.body.title;
    const content = req.body.content;
    const oldPath = `./uploads/${req.params.folder}/${req.params.file}`;
    const newPath = `./uploads/${req.params.folder}/${title}`;

    if (title != req.params.file) {
        fs.rename(oldPath, newPath, (err) => {
            if (err) {
                console.error(err);
                return res.status(500).send("Error renaming file");
            }
            writeContent();
        })
    } else {
        writeContent();
    }

    function writeContent() {
        fs.writeFile(newPath, content, (err) => {
            if (err) {
                console.error(err);
                return res.status(500).send("Error updating file");
            }
            res.redirect(`/viewfolder/${req.params.folder}`)
        })
    }
})

app.get('/uploads/:folder/:file/deletefile', (req, res) => {
    fs.unlink(`./uploads/${req.params.folder}/${req.params.file}`, (err) => {
        if (err) {
            console.error(err);
            return res.status(500).send("Error deleting file");
        }
        res.redirect(`/viewfolder/${req.params.folder}`)
    })
})

app.listen("3000")