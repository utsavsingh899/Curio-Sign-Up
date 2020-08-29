const express = require("express");
const bodyParser = require("body-parser");
const request = require("request");
const favicon = require("serve-favicon");
const https = require("https");

const app = express();

// heroku http -> https 
// link: https://jaketrent.com/post/https-redirect-node-heroku/
if(process.env.NODE_ENV === 'production') {
  app.use((req, res, next) => {
    if (req.header('x-forwarded-proto') !== 'https')
      res.redirect(`https://${req.header('host')}${req.url}`)
    else
      next()
  })
}

// app.use(favicon(__dirname + "/public/images/curio_square.png"));
app.use(express.static("public"));
app.use(bodyParser.urlencoded({extended: true}));


// *************** GET ***************
app.get("/", function(req, res) {
  res.sendFile(__dirname + "/signup.html");
});



// *************** POST ***************
app.post("/", function(req, res) {
  // res.redirect("https://medium.com/curio");

  const inputName = req.body.inputName;
  const inputEmail = req.body.inputEmail;

  console.log(inputName);
  console.log(inputEmail);

  const data = {
    members: [ {
        email_address: inputEmail,
        status: "subscribed",
        merge_fields: {
          NAME: inputName
        }
      } ]
  };
  const jsonData = JSON.stringify(data);

  const url = "https://us17.api.mailchimp.com/3.0/lists/369506f28c";
  const options = {
    auth: "utsavsingh:31d4f25c560cc452be04ccd18c9ee4ce-us17",
    method: "post"
  };

  const httpsRequest = https.request(url, options, function(response) {



    response.on("data", function(data) {
      const responseData = JSON.parse(data);

      if (responseData.error_count === 0) {
        res.sendFile(__dirname + "/success.html");
      }
      else {
        res.sendFile(__dirname + "/failure.html");
      }
    });
  });

  httpsRequest.write(jsonData);
  httpsRequest.end();

});

app.post("/success", function(req, res) {
  res.redirect("https://medium.com/curio");
});

app.post("/failure", function(req, res) {
  res.sendFile(__dirname + "/signup.html");
})

// *************** Listen ***************

app.listen(process.env.PORT || 3000, function() {
  console.log("Server running on port 3000");
});
