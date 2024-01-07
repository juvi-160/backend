const express = require('express');
const multer = require('multer');
const mongoose = require('mongoose');
const Resources = require('./models/resourcesModel')

const app = express()

mongoose.connect('mongodb://127.0.0.1:27017/test', {
    useNewUrlParser:true,
    useUnifiedTopology: true,

});

app.use(express.static('public'))
app.use(express.urlencoded({extended:false}));
app.set('view engine', 'ejs'); 



const storage = multer.memoryStorage()

const upload = multer({storage: storage})

app.get('/',(req,res) => {
    res.render('index')
})



app.post('/upload', upload.fields([{ name: 'image', maxCount: 5 }, { name: 'file', maxCount: 1 }]), async (req, res) => {
    try {
        const resource = new Resources({
            title: req.body.title,
            name: req.body.name,
            image: {
                data: req.files['image'][0].buffer,
                contentType: req.files['image'][0].mimetype,
            },
            file: {
                data: req.files['file'][0].buffer,
                contentType: req.files['file'][0].mimetype,
            },
            description: req.body.description,
            category: req.body.category,
        });

        await resource.save();
        console.log(resource)
        res.redirect('/images');
    } catch (error) {
        console.error(error);
        res.status(500).send('Internal Server Error');
    }
});


app.get('/images', async (req,res) => {
    const images = await Resources.find().sort({_id:-1});

    res.render('images', { images: images})
});


app.get('/download/file/:id', async (req, res) => {
    try {
        const resource = await Resources.findById(req.params.id);

        if (!resource) {
            return res.status(404).send('Resource not found');
        }

        if (resource.file && resource.file.data) {
            const buffer = Buffer.from(resource.file.data, 'base64');

            res.set({
                'Content-Type': 'application/pdf',
                'Content-Disposition': `attachment; filename=${resource.name}_file.pdf`,
            });

            res.send(buffer);
        } else {
            res.status(404).send('No file available for download');
        }
    } catch (error) {
        console.error(error);
        res.status(500).send('Internal Server Error');
    }
});




app.post('/delete/:id', async (req, res) => {
    try {
        const deletedResource = await Resources.findByIdAndDelete(req.params.id);

        if (!deletedResource) {
            return res.status(404).send('Resource not found');
        }

        res.redirect('/images');
    } catch (error) {
        console.error(error);
        res.status(500).send('Internal Server Error');
    }
});



app.get('/edit/:id', async (req, res) => {
    try {
        const resource = await Resources.findById(req.params.id);

        if (!resource) {
            return res.status(404).send('Resource not found');
        }

        res.render('edit', { resource });
    } catch (error) {
        console.error(error);
        res.status(500).send('Internal Server Error');
    }
});

app.post('/edit/:id', upload.fields([{ name: 'image', maxCount: 1 }, { name: 'file', maxCount: 1 }]), async (req, res) => {
    try {
        const updatedResource = await Resources.findById(req.params.id);

        if (!updatedResource) {
            return res.status(404).send('Resource not found');
        }

        updatedResource.name = req.body.name;
        updatedResource.description = req.body.description;
        updatedResource.category = req.body.category;

        
        if (req.files['image'] && req.files['image'][0]) {
            updatedResource.image = {
                data: req.files['image'][0].buffer,
                contentType: req.files['image'][0].mimetype,
            };
        }

        
        if (req.files['file'] && req.files['file'][0]) {
            updatedResource.file = {
                data: req.files['file'][0].buffer,
                contentType: req.files['file'][0].mimetype,
            };
        }

        await updatedResource.save();
        res.redirect('/images');
    } catch (error) {
        console.error(error);
        res.status(500).send('Internal Server Error');
    }
});


app.listen(3000,() => {
    console.log("Server is running on port 3000")
})