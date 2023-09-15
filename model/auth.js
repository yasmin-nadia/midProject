const mongoose = require("mongoose");
const authSchema = new mongoose.Schema({
    id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "users",
    },

    email: {

        type: String,
        required: [true, "email is required"]

    },

    password: {
        type: String,
        required: [true, "password is required"]

    },
    role: {
        type: String,
        default:"user"
    },
    
    blocked: {
        type: Boolean,
        default: false,
    },
    loginAttempts: [
        {
            timestamp: {
                type: Date,
                required: true,
            },
        },
    ]
})
const authModel = mongoose.model("authentications", authSchema);

module.exports = authModel;