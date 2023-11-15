const express = require('express');

const app = express();
app.use(express.json());
const port = 3000;

// Available Routes
app.use('/api/v3/app/', require('./routes'))

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
