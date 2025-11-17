const express = require("express");
const cors = require("cors");

const apiMain = require('./src-main/bridge/api-main');

const app = express();

const startServer = () => {

  app.use(cors());
  app.use(express.json());

  for(var key in apiMain){
    app.post("/api/"+key, (req, res) => {

      const { data } = req.body;
      //const { args } = req.body;
      const method = req.path.split('/')[2]
      let context = {};
      let responded = false;

      context.reject = function(error){
        if (responded) {
          return;
        }
        responded = true;
        let pack = {
          key: method+"Response",
          response: {error:error?error.stack:'Something went wrong.'}
        };
        console.log('API_MAIN_FAIL: '+ method, pack);
        res.status(500).json(pack.response);
      }

      context.resolve = function(response){
        if (responded) {
          return;
        }
        responded = true;
        res.json( response );
      }

      // Catch synchronous errors
      try {
        apiMain[method](data, context);
      } catch(error) {
        console.log('API_MAIN_SYNC_ERROR: '+ method, error);
        context.reject(error);
      }
    });

  }

  // Serve static files from the Vite React build
  // app.use(express.static(path.join(__dirname, "../dist/frontend")));

  /*
  app.get("/api", (req, res) => {
    res.json({ message: "Hello from Express API!" });
  });
  */

  // Catch-all route to serve the React app
  /*
  app.get("*", (req, res) => {
    res.sendFile(path.join(__dirname, "../dist/frontend/index.html"));
  });
  */

  const PORT = 5150;
  app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
  });

};

module.exports = { startServer };
