import React from 'react'

class Footer extends React.Component {
    constructor (props) {
        super(props)
        this.copyright = React.createRef()
    }

    componentDidMount() {
        this.copyright.current.innerHTML = `© ${new Date().getFullYear()} DJFlame`
    }

    render() {
        return (
            <footer>
        <div className="footerRow">
          <div className="footerSection">
            <h4>Ready to use DJFlame?</h4>
            <button className="installButton" onclick="location.href='#install'">Install</button>
          </div>
          <div className="footerSection">
            <h4>Follow Us</h4>
            <ol>
              <li><p><a href="https://twitter.com/DJFlameApp">Twitter</a></p></li>
              <li><p><a href="https://reddit.com/u/DJFlameApp">Reddit</a></p></li>
            </ol>
          </div>
          <div className="footerSection">
            <h4>Company</h4>
            <ol>
              <li><p><a href="./about">About Us</a></p></li>
              <li><p><a href="./support">Support</a></p></li>
            </ol>
          </div>
          <div className="footerSection">
            <h4>Information</h4>
            <ol>
              <li><p><a href="mailto:djflamedev@gmail.com">Contact Us</a></p></li>
              <li><p><a href="./privacy">Privacy</a></p></li>
              <li><p><a href="./terms">Terms of Use</a></p></li>
            </ol>
          </div>
        </div>
        <p id="copyright" ref={this.copyright}>© 2021 DJFlame</p>
      </footer>
        )
    }
}

export default Footer