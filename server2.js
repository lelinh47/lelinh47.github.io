// Node Get ICE STUN and TURN list
let https = require("https");
let options = {
      host: "global.xirsys.net",
      path: "/_turn/lelinh47.github.io",
      method: "PUT",
      headers: {
          "Authorization": "Basic " + Buffer.from("lelinh47:03451670-5711-11ea-ae83-0242ac110004").toString("base64")          
      }
};
let httpreq = https.request(options, function(httpres) {
      let str = "";
      httpres.on("data", function(data){ str += data; });
      httpres.on("error", function(e){ console.log("error: ",e); });
      httpres.on("end", function(){ 
          console.log("ICE List: ", str);
      });
});
httpreq.on("error", function(e){ console.log("request error: ",e); });
httpreq.end();