const https = require("https");
const querystring = require('querystring');
var request = require("request");

function dispatch(message){
  var cleaned = message.split("\n").map(s => s.trim()).filter(value => Object.keys(value).length !== 0);
  console.log(cleaned);
  switch(cleaned[0].toLowerCase()){
    case "wikipedia":
    case "wiki":
      var data = cleaned[1];
      if(data.length == 0){
        send("Vous devez entrer un article à chercher");
        return;
      }
      wikiExtractor(data, cleaned.slice(2));
      break;
    case "test":
      send(cleaned[1]);
  }
}

function wikiExtractor(query, options){
  console.log(query);
  request("https://fr.wikipedia.org/w/api.php?action=opensearch&limit=25&namespace=0&format=json&search=" + encodeURIComponent(query), function(err, res, body) {
    if(err){
      send("Erreur (Phase 1) : " + err);
    }
    
    var response = JSON.parse(body);
    
    if(response[1].length == 0){
      send("Requête : " + response[0] + "\n\n" + "Aucun résultat trouvée :(");
      return;
    }
    
    if(options[0] == null && response[1].length > 1){
      send("Requête : " + response[0] + "\n\n" + itemize(response[1]));
      return;
    }
    
    if(options[0] == null){
      options[0] = 0;
    }else{
      options[0]--;
    }
    
    var title = response[1][options[0]];
    var url = response[3][options[0]];
    request("https://fr.wikipedia.org/w/api.php?format=json&action=query&redirects&prop=extracts&exintro=&explaintext=&titles=" + encodeURIComponent(title), function(err2, response2, body2) {
      if(err2){
        send("Erreur (Phase 2) : " + err);
      }
      var page = JSON.parse(body2)['query']['pages'];
      send("Titre : " + title + "\n\n" + page[Object.keys(page)[0]]['extract'].replace(/\\n/gi, "%0A") + "\n\n\n" + url);
    });
  });
}

function itemize(array){
  var res = "";
  for(var i = 0;i < array.length; i++){
    res += (i+1) + ". " + array[i] + (i != array.length ? "\n" : "");
  }
  return res;
}

function send(content){
  var msg2send = [];
  
  var currentMsg = "";
  var currentLength = 0;
  for(var i = 0; i < content.length; i++){
    var letterLength = Buffer.byteLength(content[i], 'utf8');
    if(currentLength + letterLength > 999){
      msg2send.push(currentMsg);
      currentMsg = "";
      currentLength = 0;
    }
    currentMsg += content[i];
    currentLength += letterLength;
  }
  msg2send.push(currentMsg);
  
  console.log(msg2send);
  
  var delay = 0;
  msg2send.forEach(function(msg) {
    setTimeout(function(){forceSend(msg)}, delay);
    delay += 2000;
  });
}

function forceSend(content){
  var postData = querystring.stringify({
    'user': process.env.USER_ID,
    'pass': process.env.PASS,
    'msg': content
  });

  https.get('https://smsapi.free-mobile.fr/sendmsg?' + postData, (res) => {
    console.log("Message envoyé : " + postData);
    console.log('Réponse : ', res.statusCode);
  }).on('error', (e) => {
    console.error(e);
  });
}

module.exports = {
  dispatch: dispatch,
  send: send,
  forceSend: forceSend
}