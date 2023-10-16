const express = require("express");
const sqlite3 = require("sqlite3").verbose();
const cors = require("cors");
const { Database } = require("sqlite3");
const app = express();
const port = 3000;

app.use(cors());
app.use(express.json());

app.post("/getPalettes", (req, res) => {
  let db = new sqlite3.Database("./db/users.db", (err) => {
    if (err) {
      return err;
    }
    console.log("login connected");
  });

  let arr = [];
  let usr = req.body;

  console.log(usr);

  db.all("SELECT * FROM Palettes WHERE user=(?)", [usr["usr"]], (err, rows) => {
    if (err) {
      return err;
    }

    rows.forEach((row) => {
      arr.push([row["colors"], row["name"]]);
    });
    res.send(arr);
  });

  db.close();
});

app.post("/login", (req, res) => {
  let db = new sqlite3.Database("./db/users.db", (err) => {
    if (err) {
      return err;
    }
  });

  db.all(
    "SELECT * FROM Users WHERE Username = (?) AND Password = (?)",
    [req.body["usr"], req.body["pw"]],
    (err, rows) => {
      if (err) {
        return err;
      }

      if (rows.length == 0) {
        res.sendStatus(404);
      } else if (rows.length == 1) {
        res.sendStatus(200);
      }
    }
  );
  db.close();
});

app.post("/postPalettes", (req, res) => {
  let db = new sqlite3.Database("./db/users.db", (err) => {
    if (err) {
      return err;
    }
  });

  let user = req.body["usr"];
  let colors = req.body["colors"];
  let colorsString = "";
  colors.forEach((color) => {
    colorsString += "." + color;
  });
  console.log(colorsString);

  let name = req.body["name"];

  db.run(
    "INSERT INTO Palettes(user, colors, name) VALUES (?,?,?)",
    [user, colorsString, name],
    (err) => {
      if (err) {
        return err;
      }
      console.log("added");
      res.sendStatus(200);
    }
  );
  db.close();
});

app.post("/remove", (req, res) => {
  let db = new sqlite3.Database("./db/users.db", (err) => {
    if (err) {
      return err;
    }
  });

  let usr = req.body["usr"];
  let colors = req.body["colors"];

  console.log(usr, colors);
  db.run(
    "DELETE FROM Palettes WHERE user=(?) and colors=(?)",
    [usr, colors],
    (err) => {
      if (err) {
        console.log(err);
        return err;
      }
      console.log("deleted");
    }
  );
});

app.post("/register", (req, res) => {
  let db = new sqlite3.Database("./db/users.db", (err) => {
    if (err) {
      return err;
    }
  });
  let data = req.body;

  console.log("trying to register");
  console.log(data);
  db.run(
    "INSERT INTO Users(Username,Password) VALUES (?,?)",
    [data["usr"], data["pw"]],
    (err) => {
      if (err) {
        console.log(err);
        res.sendStatus(404);
      } else {
        console.log("finished");
        res.sendStatus(200);
      }
    }
  );
});

app.post("/generate", (req, res) => {
  let arr = [];
  let col = req.body["color"];
  let col2 = "";
  for (let i = 0; i < col.length; i++) {
    if (col[i] != "#") {
      col2 += col[i];
    }
  }
  col2 = col2.toUpperCase();
  fetch(
    "https://www.thecolorapi.com/scheme?hex=" + col2 + "&mode=triad&count=5"
  ).then((response) => {
    response.json().then((data) => {
      data["colors"].forEach((i) => {
        arr.push(i["hex"]);
      });
      console.log(arr);
      res.send(arr);
    });
  });
});

app.listen(port, () => {
  console.log("running on port 3000");
});
