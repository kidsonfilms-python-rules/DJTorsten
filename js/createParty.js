function createParty() {
    window.location.replace("index.html");
}

var element = document.getElementById("submit");
element.onclick = function(event) {
  console.log(event);
  createParty()
}