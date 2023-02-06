const express = require('express');
const path = require('path');
const fs = require('fs');
const util = require('util');
const { v4: uuidv4 } = require('uuid');
const readFile = util.promisify(fs.readFile);
const writeFile = util.promisify(fs.writeFile);
const FindNotes = () => {
  return readFile('db/db.json', 'utf-8').then(rawNotes => [].concat(JSON.parse(rawNotes)))
}
const PORT = process.env.PORT || 3001;
//comment
const app = express();
app.use(express.json());
app.use(express.urlencoded({extended:false}));
app.use(express.static('public'));

// GET Route for homepage
app.get('/', (req, res) =>
  res.sendFile(path.join(__dirname, '/public/index.html'))
);

app.get('/notes', (req, res) =>
  res.sendFile(path.join(__dirname, '/public/notes.html'))
);

// API routes 
app.get('/api/notes', (req, res) => {
FindNotes().then(notes => res.json(notes))
.catch(err => res.status(500).json(err))
});
// this saves the notes 
app.post('/api/notes', ({body}, res) => {
  FindNotes().then(oldNotes => {
    const newNotes = [...oldNotes, {title: body.title, text: body.text, id: uuidv4()}]
    writeFile('db/db.json', JSON.stringify(newNotes)).then(() => res.json({msg: 'ok'}))
    .catch(err => res.status(500).json(err))
  })
})
// deletes old notes for the bonus points function
app.delete('/api/notes/:id', (req, res) => {
  FindNotes().then(oldNotes => {
    let newNotes = oldNotes.filter(note => note.id !== req.params.id)
    writeFile('db/db.json', JSON.stringify(newNotes)).then(() => res.json({msg: 'ok'}))
    .catch(err => res.status(500).json(err))
  })
})

app.listen(PORT, () => console.log(`App listening on port ${PORT}`));