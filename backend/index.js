const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const { connectDB } = require('./db');
const Student = require('./models/Student');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const schedule = require('node-schedule');

connectDB();

const app = express();
const PORT = 3000;
const HOST = '0.0.0.0';
const JWT_SECRET = 'super_special_totally_seure_private_key';


app.use(cors());
app.use(express.json());

app.use('/api/login', bodyParser.text({ type: 'text/plain' }));
app.use('/api/authenticate_session', bodyParser.text({ type: 'text/plain' }));
app.use('/api/softLogout', bodyParser.text({ type: 'text/plain' }));

// use for hashing a password to copy to db.
/*
(async () => {
  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash('password123', salt);
  console.log(hashedPassword)
})();
*/


async function verifyToken(token) {
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    // Find the student by decoded token id
    const student = await Student.findOne({ _id: decoded.id });
    if (!student) {
      return null;
    }
    return student;
  } catch (err) {
    return null;
  }
}


async function updateSession(loginId, token, isOnline) {
  await Student.updateOne(
    { loginId },
    { $set: { token, isOnline } }
  );
}


app.post('/api/authenticate_session', async (req, res) => {
  try {
    const { token } = req.body;
    if (!token) {
      return res.status(401).json({ error: 'Token missing' });
    }

    const student = await verifyToken(token);
    if (!student) {
      return res.status(403).json({ error: 'Invalid or expired token' });
    }
    await Student.updateOne(
      { _id: student._id },
      { $set: { isOnline: true } }
    );

    return res.status(200).send('USER AUTHENTICATED. Accessed from server.');
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

app.post('/api/login', async (req, res) => {
  try {
    const { id, password } = req.body;

    const student = await Student.findOne({ loginId: id });
    if (!student) {
      return res.status(404).json({ error: 'Student not found' });
    }

    const passwordMatch = await bcrypt.compare(password, student.password);
    if (!passwordMatch) {
      return res.status(401).json({ error: 'Invalid password' });
    }


    const token = jwt.sign({ id: student._id }, JWT_SECRET, { expiresIn: '2m' });
    
    await updateSession(id, token, true);

    return res.status(200).json({ message: 'Login successful', token });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

app.post('/api/logout', async (req, res) => {
  try {
    const { token } = req.body;

    const student = await verifyToken(token);
    if (!student) {
      return res.status(403).json({ error: 'Invalid or expired token' });
    }

    await Student.updateOne(
      { _id: student._id },
      { $set: { isOnline: false, token: '' } }
    )

    return res.status(200).json({ message: 'Successfully logged out' });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

app.post('/api/softLogout', async (req, res) => {
  try {
    const { event, token } = JSON.parse(req.body);

    if (event && token) {
      const student = await verifyToken(token);
      await Student.updateOne(
        { _id: student._id },
        { $set: { isOnline: false } }
      )
    }

  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Internal server error' });
  }
})





// db cleanup old tokens and logout

function isTokenValid(token) {
  try {
    jwt.verify(token, JWT_SECRET);
    return true;
  } catch (err) {
    return false;
  }
}

// every 15 minutes
//schedule.scheduleJob('*/15 * * * *', async () => {
schedule.scheduleJob('*/1 * * * *', async () => {
  console.log('Running periodic JWT cleanup...');

  try {
    const onlineStudents = await Student.find({ isOnline: true });

    for (const student of onlineStudents) {
      const tokenValid = student.token && isTokenValid(student.token);

      if (!tokenValid) {
        await Student.updateOne(
          { _id: student._id },
          { $set: { isOnline: false, token: '' } }
        );
        console.log(`Expired session cleaned for student: ${student.loginId}`);
      }
    }
  } catch (err) {
    console.error('Error during JWT cleanup:', err);
  }
});





app.listen(PORT, HOST, () => {
  console.log(`Server running at http://${HOST}:${PORT}/`);
});