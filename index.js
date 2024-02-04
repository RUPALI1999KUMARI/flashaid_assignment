const express = require("express");
const app = express();
const mongoose = require("mongoose");
const csvtojson = require("csvtojson");
const multer = require("multer");
const upload = multer({ storage: multer.memoryStorage() });



//---------------------------------------------Schema and Model----------------------------------------//

// This is the user schema which define structure for the user and also need to create user model
const userSchema = new mongoose.Schema({
    fullName: {
        type: String,
        trim: true,
    },
    contact: {
        type: String,
        trim: true,
    },
    email: {
        type: String,
        trim: true,
        unique: true,
    },
    dateOfBirth: {
        type: String,
        trim: true,
    },
}, { versionKey: false });

// This is the user model which helps to perform all db operation
const UserModel = new mongoose.model("csvUser", userSchema);



//---------------------------------------------Middleware and Handler Functions----------------------------------------//

// This is a helper method to check if there is any invalid header exist in csv table
// If there is nay invalid field exist in table it will store that as warning
const csvFieldValidator = (warnings, csvHeaders) => {
    const validFields = { FullName: true, Contact: true, Email: true, DateOfBirth: true }
    const warn = { status: true, invalidFields: [] }
    for (let j = 0; j < csvHeaders.length; j++) {
        if (!validFields[csvHeaders[j]]) {
            warn.status = false
            warn.invalidFields.push(csvHeaders[j])
            warn.message = "Fields are not valid"
        }
    }
    if (!warn.status) {
        warnings.push(warn)
    }
}

/**
This is middleware method is responsible to read csv convert that csv in readable form or json object
and save that info in req object so that next function can take that validated to save data in database
This method also perform missing field validation , if any field is missing this will throw error
 */
const userValidatorAndFormatter = async (req, res, next) => {
    try {
        const users = [];
        const warnings = []
        const error = { status: true }

        if (!req.file || req?.file?.mimetype !== "text/csv") {
            error.status = false,
                error.message = "Please provide valid csv file"
            return res.status(400).send(error);
        }

        const fileBuffer = req.file.buffer.toString();
        const userjson = await csvtojson().fromString(fileBuffer);

        csvFieldValidator(warnings, Object.keys(userjson[0]))

        for (let i = 0; i < userjson.length; i++) {
            const user = {};
            const { FullName, Contact, Email, DateOfBirth } = userjson[i]
            if (!FullName || !Contact || !Email || !DateOfBirth) {
                error.status = false
                error.message = "All fields are mandatory"
                error.index = i
                error.user = userjson[i]
                break;
            } else {
                user.fullName = FullName;
                user.contact = Contact;
                user.email = Email;
                user.dateOfBirth = DateOfBirth;
                users.push(user);
            }
        }
        if (!error.status) {
            return res.status(400).send(error);
        } else {
            req.users = users;
            req.warnings = warnings
            next();
        }
    } catch (error) {
        res.status(500).send({ status: false, error: error.message });
    }
};


// This is the main method which will take formatted and validate from req object and store in database
const updloadUsers = async (req, res) => {
    try {
        const users = req.users;
        const uploadusers = await UserModel.insertMany(users);
        return res.status(201).send({
            message: "Users are imported successfully",
            status: true,
            data: uploadusers,
            warnings: req.warnings
        });
    } catch (error) {
        if (error.code == 11000) {
            // Here we are taking care if there is any user with duplicate email then throw valid error
            let usr = error?.writeErrors[0]?.err?.op
            res.status(400).send({ message: "User with duplicate email", status: false, duplicateUser: usr });
        } else {
            res.status(500).send({ status: false, message: error.message });
        }
    }
};

// This is the method responsible to get all users from database
const getAllUsers = async (req, res) => {
    try {
        const uploadusers = await UserModel.find({});
        return res.status(200).send({
            message: "User List",
            data: uploadusers,
        });
    } catch (error) {
        res.status(500).send({
            message: error.message,
            status: false
        });
    }
};

// This is the method responsible to delete all users from database
const deleteAllUsers = async (req, res) => {
    try {
        await UserModel.deleteMany({});
        return res.status(200).send({
            message: "All users have been deleted successfully",
            status: true,
        });
    } catch (error) {
        res.status(500).send({
            message: error.message,
            status: false
        });
    }
};



//---------------------------------------------Route or Api Endpoint----------------------------------------//


// This is route or api end point to import all user from user.csv to mongodb
app.post("/uploadusers", upload.single("file"), userValidatorAndFormatter, updloadUsers);

// This is route or api end point to get all uploaded user from database
app.get("/users", getAllUsers);

// This is route or api end point to delete all user from database
app.delete("/users", deleteAllUsers);



//-----------------------------------Mongodb connection and Port Configuration----------------------------------------//


mongoose.connect("mongodb+srv://rupalikumari:rupali1234@cluster0.8qeleal.mongodb.net/usercsv").then(() => {
    console.log("You have connected with your mongoDB")
}).catch((err) => console.log("There is some problem in mongoose connection", { error: err }));

app.listen(process.env.PORT || 3000, () => {
    console.log("Your server running on port " + (process.env.PORT || 3000));
});