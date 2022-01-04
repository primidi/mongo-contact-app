const mongoose = require("mongoose");

const Contact = mongoose.model("Contact", {
  name: {
    type: String,
    required: true,
  },
  phonenum: {
    type: String,
    required: true,
  },
  email: {
    type: String,
  },
});

module.exports = Contact;
