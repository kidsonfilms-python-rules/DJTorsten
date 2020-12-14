function signin() {
    window.location.replace("createParty.html");
}

var element = document.getElementById("submit");
element.onclick = function(event) {
  console.log(event);
  signin()
}