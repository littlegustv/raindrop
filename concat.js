var fs = require('fs');

var output = "";

var files = fs.readdirSync('src', []);//, function (err, files) {
for (var i = 0; i < files.length; i++) {
  var file = files[i];
  var data = fs.readFileSync('src/' + file, 'utf8');//, function (err, data) {
  output += data + "\n\n";
}

var now = new Date();
var release_name = "raindrop" + now.toISOString().split('T')[0];
fs.writeFile("releases/" + release_name + ".js", output, function (err) {
  if (err) return console.log(err);
  console.log(release_name + " created.");
});

fs.writeFile("releases/raindrop.js", output, function (err) {
  if (err) return console.log(err);
  console.log("Latest version created.");
});