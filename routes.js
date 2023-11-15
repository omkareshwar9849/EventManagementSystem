const express = require('express');
const router = express.Router();
const { ObjectId } = require('mongodb');
const multer = require('multer');
const connectToDatabase = require("./db");

const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

let database;
// Connect to MongoDB
connectToDatabase().then((db) => {
    database = db;
}).catch((err) => {
    console.error('Error connecting to MongoDB:', err);
});

// GET endpoint to test
router.get('/', (req, res) => {
    res.send('Welcome')
})

//Route 1: GET endpoint to get an event by its unique id
router.get('/events/:id', async (req, res) => {
    const eventId = req.params.id;
    const event = await database.collection('events').findOne({ _id: new ObjectId(eventId) });
    res.json(event);
});

//Route 2: GET endpoint to get events by recency with pagination
router.get('/events', async (req, res) => {
    const { type, limit, page } = req.query;

    let query = { type: 'event' };
    if (type === 'latest') {
        query = { type: 'event' };
    }

    const events = await database.collection('events')
        .find(query)
        .sort({ schedule: -1 })
        .skip((page - 1) * limit)
        .limit(parseInt(limit))
        .toArray();

    res.json(events);
});

//Route 3: POST endpoint to create an event
router.post('/events', upload.single('image'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: 'No file uploaded' });
        }

        // Extract other fields from the request body
        const { name, tagline, schedule, description, moderator, category, sub_category, rigor_rank } = req.body;

        const eventCollection = database.collection('events');
        const fileCollection = database.collection('images');

        // Assuming 'uid' is extracted from authentication
        const uid = 18;

        // Insert the file into MongoDB
        const result = await fileCollection.insertOne({
            data: req.file.buffer,
            contentType: req.file.mimetype,
        });

        // Insert event details along with the file reference
        const event = {
            type: 'event',
            uid,
            name,
            tagline,
            schedule,
            description,
            moderator,
            category,
            sub_category,
            rigor_rank,
            attendees: [],
            image: {
                fileId: result.insertedId,
                contentType: req.file.mimetype,
            },
        };

        const eventResult = await eventCollection.insertOne(event);

        res.status(200).json({ id: eventResult.insertedId });
    } catch (error) {
        console.error('Error creating event:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

//Route 4: PUT endpoint to update an event by its id
router.put('/events/:id', async (req, res) => {
    try {
        const eventId = req.params.id;
        const updateFields = req.body;

        const result = await database.collection('events').updateOne(
            { _id: new ObjectId(eventId) },
            { $set: updateFields }
        );

        if (result.matchedCount > 0) {
            res.json({ success: true, message: 'Event updated successfully' });
        } else {
            res.status(404).json({ success: false, message: 'Event not found' });
        }
    } catch (error) {
        console.error('Error updating event:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

//Route 5: DELETE endpoint to delete an event by its id
router.delete('/events/:id', async (req, res) => {
    const eventId = req.params.id;
    const result = await database.collection('events').deleteOne({ _id: new ObjectId(eventId) });
    res.json({ success: result.deletedCount > 0 });
});

module.exports = router;