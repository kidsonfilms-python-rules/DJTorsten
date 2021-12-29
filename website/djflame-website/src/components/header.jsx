import React from 'react'
import favicon from '../assets/favicon.png';

class Header extends React.Component {

    constructor(props) {
        super(props)

        this.navbar = React.createRef(null)
        this.burger = React.createRef(null)
    }

    componentDidMount() {
        //STYLE.JS
    const navbar = this.navbar.current
    let sticky = document.body.offsetTop;
    const navbarScroll = () => {
      if (window.pageYOffset > sticky) {
        navbar.classList.add('sticky')
      } else {
        navbar.classList.remove('sticky');
      }
    };

    window.onscroll = navbarScroll;
    const burger = this.burger.current;

    function navSlide() {
      // const burger = this.burger.current;
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
    }

    render() {
        return (
            <nav className="navbar" ref={this.navbar}>
            <div className="div logo">
              <img src={favicon} height={40} alt="" title={"DJFlame Rick Roll"} />
              <h4>DJFlame</h4>
            </div>
            <ul className="nav-links">
              <li><a href="./">Home</a></li>
              <li><a href="#about">About</a></li>
              <li><a href="#install">Install</a></li>
            </ul>
            <div className="burger" ref={this.burger}>
              <div className="line1" />
              <div className="line2" />
              <div className="line3" />
            </div>
          </nav> 
        )
    }
}

export default Header