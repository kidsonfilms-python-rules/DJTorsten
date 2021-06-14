const navbar = document.querySelector('.navbar');
let sticky = document.body.offsetTop;
const navbarScroll = () => {
  if (window.pageYOffset > sticky) {
    navbar.classList.add('sticky')
  } else {
    navbar.classList.remove('sticky');
  }
};

window.onscroll = navbarScroll;

function navSlide() {
    const burger = document.querySelector(".burger");
    const nav = document.querySelector(".nav-links");
    const navLinks = document.querySelectorAll(".nav-links li");
    const navbar = document.querySelector('.navbar')
    console.log('activate slide')
    
    burger.addEventListener("click", () => {
        console.log('burger clicked')
        //Toggle Nav
        nav.classList.toggle("nav-active");
        
        //Animate Links
        navLinks.forEach((link, index) => {
            if (link.style.animation) {
                link.style.animation = ""
            } else {
                link.style.animation = `navLinkFade 0.5s ease forwards ${index / 7 + 0.5}s`;
            }
        });
        //Burger Animation
        burger.classList.toggle("toggle");
        navbar.classList.add('sticky')
    });
    
}

navSlide();

const links = document.getElementsByTagName('a')
var linksarray = []
for(var i=0; i<links.length; i++) {
  linksarray.push(links[i]);
}
linksarray.forEach((a) => {
  a.href = a.href.replace('.html', '')
})

document.getElementById('copyright').innerHTML = `© ${new Date().getFullYear()} DJFlame`