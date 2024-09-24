const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const app = express();
const port = 3000;

// Middleware pentru a putea parsa JSON-ul trimis în requesturi
app.use(express.json());

// Deschide baza de date
const db = new sqlite3.Database('nume_prenume.db', (err) => {
    if (err) {
        console.error(err.message);
    } else {
        console.log('Conectat la baza de date SQLite.');
    }
});

// Crearea tabelului (doar dacă nu există)
db.run(`
    CREATE TABLE IF NOT EXISTS persoane (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        nume TEXT NOT NULL,
        prenume TEXT NOT NULL
    )
`);

// CREATE: Adăugarea unei persoane în baza de date
app.post('/persoane', (req, res) => {
    const { nume, prenume } = req.body;
    if (!nume || !prenume) {
        res.status(400).json({ error: "Nume și prenume sunt obligatorii!" });
        return;
    }
    db.run(`INSERT INTO persoane (nume, prenume) VALUES (?, ?)`, [nume, prenume], function(err) {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }
        res.json({
            message: "Persoană adăugată cu succes",
            data: { id: this.lastID, nume, prenume }
        });
    });
});

// READ: Obținerea tuturor persoanelor din baza de date
app.get('/persoane', (req, res) => {
    db.all('SELECT * FROM persoane', [], (err, rows) => {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }
        res.json({
            message: "Succes",
            data: rows
        });
    });
});

// READ: Obținerea unei persoane individuale după ID
app.get('/persoane/:id', (req, res) => {
    const id = req.params.id;
    db.get(`SELECT * FROM persoane WHERE id = ?`, [id], (err, row) => {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }
        if (!row) {
            res.status(404).json({ error: "Persoana nu a fost găsită!" });
            return;
        }
        res.json({
            message: "Succes",
            data: row
        });
    });
});

// UPDATE: Modificarea unei persoane după ID
app.put('/persoane/:id', (req, res) => {
    const { nume, prenume } = req.body;
    const id = req.params.id;
    
    if (!nume || !prenume) {
        res.status(400).json({ error: "Nume și prenume sunt obligatorii!" });
        return;
    }

    db.run(`UPDATE persoane SET nume = ?, prenume = ? WHERE id = ?`, [nume, prenume, id], function(err) {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }
        if (this.changes === 0) {
            res.status(404).json({ error: "Persoana nu a fost găsită!" });
            return;
        }
        res.json({
            message: "Persoană actualizată cu succes",
            data: { id, nume, prenume }
        });
    });
});

// DELETE: Ștergerea unei persoane după ID
app.delete('/persoane/:id', (req, res) => {
    const id = req.params.id;

    db.run(`DELETE FROM persoane WHERE id = ?`, [id], function(err) {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }
        if (this.changes === 0) {
            res.status(404).json({ error: "Persoana nu a fost găsită!" });
            return;
        }
        res.json({
            message: "Persoană ștearsă cu succes"
        });
    });
});

// Pornim serverul
app.listen(port, () => {
    console.log(`Serverul rulează pe http://localhost:${port}`);
});
