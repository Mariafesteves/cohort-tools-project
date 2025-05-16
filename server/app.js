require("dotenv").config();
const express = require("express");
const morgan = require("morgan");
const cookieParser = require("cookie-parser");
const cors = require("cors");
const { errorHandler, notFoundHandler } = require('./middleware/middleware/error');
const bcrypt = require("bcryptjs")
const jwt = require("jsonwebtoken")
const expressjwt = require("express-jwt")


const { isAuthenticated } = require("./middleware/middleware/jwt.middleware");

const PORT = 5005;

const mongoose = require("mongoose");

mongoose
  .connect("mongodb://127.0.0.1:27017/cohort-tools-api") // Corrigido o endereço e a porta
  .then(x => console.log(`Connected to Database: "${x.connections[0].name}"`))
  .catch(err => console.error("Error connecting to MongoDB", err));

// STATIC DATA
// Devs Team - Import the provided files with JSON data of students and cohorts here:
// ...

const Cohort = require("./models/cohortModel");
const Student = require("./models/studentsModel");
const User = require("./models/userModel");


// INITIALIZE EXPRESS APP - https://expressjs.com/en/4x/api.html#express
const app = express();
app.use(cors());


// MIDDLEWARE
// Research Team - Set up CORS middleware here:
// ...
app.use(express.json());
app.use(morgan("dev"));
app.use(express.static("public"));
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());




// ROUTES - https://expressjs.com/en/starter/basic-routing.html
// Devs Team - Start working on the routes here:
// ...
app.get("/docs", (req, res) => {
  res.sendFile(__dirname + "/views/docs.html");
});

app.get('/api/users/:id', isAuthenticated, (req, res, next) => {

  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(projectId)) {
    res.status(400).json({ message: "Specified id is not valid" });
    return;
  }

  User.findById(id)
    .then((userId) => {
      res.json(userId)
    })
    .catch((err) => {
      console.log("Error while updating the project", err);
      res.status(500).json({ message: "Error while updating the project" });
    });
})


app.post('/api/students', (req, res, next) => {
  const newStudent = {
    firstName: req.body.firstName,
    lastName: req.body.lastName,
    email: req.body.email,
    phone: req.body.phone,
    linkedinUrl: req.body.linkedinUrl,
    languages: req.body.languages,
    program: req.body.program,
    background: req.body.background,
    image: req.body.image,
    cohort: req.body.cohort,
    projects: req.body.projects,
  }

  Student.create(newStudent)
    .then((studentFromDB) => {
      res.status(201).json(studentFromDB)
    })
    .catch((error) => {
      console.log("Error while crreating new student", error)
      res.status(500).json({ message: "Server Error" })
      next(error);
    })
})

app.post("/api/cohorts", function (req, res, next) {
  const newCohort = req.body
  Cohort.create(newCohort)
    .then((cohortNew) => {
      res.status(201).json(cohortNew)
    })
    .catch((error) => {
      res.status(500).json({ error: "Error creating cohort" })
      next(error);
    })
})

app.get('/api/students', (req, res, next) => {

  Student.find()
    .populate("cohort")
    .then((studentFromDB) => {
      res.status(200).json(studentFromDB)
    })
    .catch((error) => {
      console.log("Error while crreating new student", error)
      res.status(500).json({ message: "Server Error" })
      next(error);
    })
})

app.get("/api/cohorts", function (req, res, next) {
  Cohort.find()
    .then((cohorts) => {
      res.status(200).json(cohorts)
    })
    .catch((error) => {
      res.status(500).json({ error: "Error getting cohorts" })
      next(error);
    })
})

app.get('/api/students/cohort/:cohortId', (req, res, next) => {
  const { cohortId } = req.params

  Student.find({ cohort: cohortId })
    .populate("cohort")
    .then((studentFromDB) => {
      res.status(200).json(studentFromDB)
    })
    .catch((error) => {
      console.log("Error while crreating new student", error)
      res.status(500).json({ message: "Server Error" });
      next(error);
    })
})


app.get("/api/cohorts/:cohortId", function (req, res, next) {
  const { cohortId } = req.params
  Cohort.findById(cohortId)
    .then((cohort) => {
      res.status(200).json(cohort)
    })
    .catch((error) => {
      res.status(500).json({ error: "Error getting cohort" })
      next(error);
    })
})

app.get('/api/students/:studentId', (req, res, next) => {
  const { studentId } = req.params

  Student.findById(studentId)
    .populate("cohort")
    .then((studentFromDB) => {
      res.status(200).json(studentFromDB)
    })

    .catch((error) => {
      res.status(500).json({ error: "Error getting cohort" })
      next(error);
    })
})

app.put("/api/cohorts/:cohortId", function (req, res, next) {
  const { cohortId } = req.params

  const newDetails = req.body

  Cohort.findByIdAndUpdate(cohortId, newDetails, { new: true })
    .then((cohortUpdated) => {
      res.status(200).json(cohortUpdated)
    })
    .catch((error) => {
      res.status(500).json({ error: "Error updating cohort" })
      next(error);
    })
})

app.put('/api/students/:studentId', (req, res, next) => {
  const { studentId } = req.params

  const newDetails = req.body

  Student.findByIdAndUpdate(studentId, newDetails, { new: true })
    .then((studentFromDB) => {
      res.status(200).json(studentFromDB)
    })
    .catch((error) => {
      res.status(500).json({ error: "Error updating cohort" })
      next(error);
    })
})

app.delete("/api/cohorts/:cohortId", function (req, res, next) {
  const { cohortId } = req.params
  Cohort.findByIdAndDelete(cohortId)
    .then(response => {
      res.status(204).json(response)
    })
    .catch((error) => {
      res.status(500).json({ error: "Error deleting cohort" })
      next(error);
    })
})

app.delete('/api/students/:studentId', (req, res, next) => {
  const { studentId } = req.params

  Student.findByIdAndDelete(studentId)
    .then((studentFromDB) => {
      res.status(204).json(studentFromDB)
    })

    .catch((error) => {
      res.status(500).json({ error: "Error deleting student" })
      next(error);
    })
})

app.use("/auth", require("./routes/auth.routes"));


app.use(notFoundHandler);
app.use(errorHandler);

// START SERVER
app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});
