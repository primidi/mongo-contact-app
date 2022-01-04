const express = require("express");
const expressLayouts = require("express-ejs-layouts");

const { body, validationResult, check } = require("express-validator");
const methodOverride = require("method-override");

const session = require("express-session");
const cookieParser = require("cookie-parser");
const flash = require("connect-flash");

// Import database connection
require("./utils/db");

// Import contact's schema
const Contact = require("./model/contact");

const app = express();
const port = 3000;

// Method Override Setup
app.use(methodOverride("_method"));

// EJS Setup
app.set("view engine", "ejs");
app.use(expressLayouts);
app.use(express.static("public"));
app.use(express.urlencoded({ extended: true }));

// Flash Message configuration
app.use(cookieParser("secret"));
app.use(
  session({
    cookie: { maxAge: 6000 },
    secret: "secret",
    resave: true,
    saveUninitialized: true,
  })
);
app.use(flash());

// Home Page
app.get("/", (req, res) => {
  res.render("index", {
    layout: "layouts/main-layout",
    name: "Primada",
    title: "Homepage",
  });
});

// About Page
app.get("/about", (req, res) => {
  res.render("about", {
    layout: "layouts/main-layout",
    title: "About Page",
  });
});

// Contact Page
app.get("/contact", async (req, res) => {
  const contacts = await Contact.find();
  res.render("contact", {
    layout: "layouts/main-layout",
    title: "Contact Page",
    contacts,
    msg: req.flash("msg"),
  });
});

// Add's form for new data of contact
app.get("/contact/add", (req, res) => {
  res.render("add-contact", {
    layout: "layouts/main-layout",
    title: "Add Contact Form",
  });
});

// Add data contact processes
app.post(
  "/contact",
  [
    body("name").custom(async (value) => {
      const duplicate = await Contact.findOne({ name: value });
      if (duplicate) {
        throw new Error(`The contact's name of ${value} is being used, please use other name!`);
      }
      return true;
    }),
    check("phonenum", "Phone Number is not valid!").isMobilePhone("id-ID"),
    check("email", "Email is not valid!").isEmail(),
  ],
  (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.render("add-contact", {
        layout: "layouts/main-layout",
        title: "Add Contact Form",
        errors: errors.array(),
      });
    } else {
      Contact.insertMany(req.body, (error, result) => {
        // Send the flash message
        req.flash("msg", "New contact added!");
        res.redirect("/contact");
      });
    }
  }
);

// Delete process of the contact
app.delete("/contact", (req, res) => {
  Contact.deleteOne({ name: req.body.name }).then((result) => {
    // Send the flash message
    req.flash("msg", "Contact's data deleted!");
    res.redirect("/contact");
  });
});

// Update's form for existed data of contact
app.get("/contact/edit/:name", async (req, res) => {
  const contact = await Contact.findOne({ name: req.params.name });
  res.render("edit-contact", {
    layout: "layouts/main-layout",
    title: "Edit Contact Form",
    contact,
  });
});

// Update process of the contact
app.put(
  "/contact",
  [
    body("name").custom(async (value, { req }) => {
      const duplicate = await Contact.findOne({ name: value });
      if (value !== req.body.oldName && duplicate) {
        throw new Error(`The contact's name of ${value} is being used, please use other name!`);
      }
      return true;
    }),
    check("phonenum", "Phone Number is not valid!").isMobilePhone("id-ID"),
    check("email", "Email is not valid!").isEmail(),
  ],
  (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.render("edit-contact", {
        layout: "layouts/main-layout",
        title: "Edit Contact Form",
        errors: errors.array(),
        contact: req.body,
      });
    } else {
      Contact.updateOne(
        { _id: req.body._id },
        {
          $set: {
            name: req.body.name,
            phonenum: req.body.phonenum,
            email: req.body.email,
          },
        }
      ).then((result) => {
        // Send the flash message
        req.flash("msg", "Data contact edited!");
        res.redirect("/contact");
      });
    }
  }
);

// Show detail of the contact
app.get("/contact/:name", async (req, res) => {
  const contact = await Contact.findOne({ name: req.params.name });
  res.render("detail", {
    layout: "layouts/main-layout",
    title: "Contact's Detail Page",
    contact,
  });
});

app.listen(port, () => {
  console.log(`Mongo Contact App is listening at http://localhost:${port}`);
});
