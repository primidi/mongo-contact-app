const mongoose = require("mongoose");
mongoose.connect("mongodb://127.0.0.1:27017/universitydb", {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  useCreateIndex: true,
});

// // Add data to collection
// const contact1 = new Contact({
//   name: "Hyewon",
//   phonenum: "081234567999",
//   email: "hyewon@gmail.com",
// });

// // Save data to collection
// contact1.save().then((result) => console.log(result));
