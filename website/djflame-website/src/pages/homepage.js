import '../css/style.css'
import bgHome from '../assets/bgHome.mp4'
import React from "react"
import {Footer, Header} from '../components'

class HomePage extends React.Component {
  constructor(props) {
    super(props);
    this.myRef = React.createRef();

    this.windowsDownloadItem = React.createRef(null)
    this.macosDownloadItem = React.createRef(null)
    this.linuxDownloadItem = React.createRef(null)
    this.androidDownloadItem = React.createRef(null)
    this.iosDownloadItem = React.createRef(null)
    this.installText = React.createRef(null)

    this.state = { downloadItem: "" }
  }

  componentDidMount() {
    var OSName = "Unknown";
    if (window.navigator.userAgent.indexOf("Windows NT 10.0") !== -1) OSName = "Windows";
    if (window.navigator.userAgent.indexOf("Windows NT 6.3") !== -1) OSName = "Windows";
    if (window.navigator.userAgent.indexOf("Windows NT 6.2") !== -1) OSName = "Windows";
    if (window.navigator.userAgent.indexOf("Windows NT 6.1") !== -1) OSName = "Windows";
    if (window.navigator.userAgent.indexOf("Windows NT 6.0") !== -1) OSName = "Windows";
    if (window.navigator.userAgent.indexOf("Windows NT 5.1") !== -1) OSName = "Windows";
    if (window.navigator.userAgent.indexOf("Windows NT 5.0") !== -1) OSName = "Windows";
    if (window.navigator.userAgent.indexOf("Mac") !== -1) OSName = "Mac";
    if (window.navigator.userAgent.indexOf("X11") !== -1) OSName = "UNIX";
    if (window.navigator.userAgent.indexOf("Linux") !== -1) OSName = "Linux";
    if (OSName !== 'Unknown') {
      if (OSName === 'Windows') {
        //this.windowsDownloadItem.current.style.background = 'rgba(223,73,166,1)'
        console.log("win")
        this.setState({ downloadItem: 'win' })
      } else if (OSName === 'Mac') {
        console.log("mac")
        this.setState({ downloadItem: 'mac' })
        //this.macosDownloadItem.current.style.background = 'rgba(223,73,166,1)'
      } else if (OSName === 'Linux') {
        console.log("linux")
        this.setState({ downloadItem: 'linux' })
        //this.linuxDownloadItem.current.style.background = 'rgba(223,73,166,1)'
      }
    }

    if (/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)) {
      this.windowsDownloadItem.current.style.display = 'none';
      this.macosDownloadItem.current.style.display = 'none';
      this.linuxDownloadItem.current.style.display = 'none';
      this.iosDownloadItem.current.style.display = 'flex';
      this.androidDownloadItem.current.style.display = 'flex'
      var userAgent = navigator.userAgent || navigator.vendor || window.opera;

      // Windows Phone must come first because its UA also contains "Android"
      if (/windows phone/i.test(userAgent)) {
        this.androidDownloadItem.current.style.backgroundColor = 'rgba(223,73,166,1)'
      }

      if (/android/i.test(userAgent)) {
        this.androidDownloadItem.current.style.backgroundColor = 'rgba(223,73,166,1)'
      }

      // iOS detection from: http://stackoverflow.com/a/9039885/177710
      if (/iPad|iPhone|iPod/.test(userAgent) && !window.MSStream) {
        this.iosDownloadItem.current.style.backgroundColor = 'rgba(223,73,166,1)'
      }

      // var installText = document.getElementById('installText')
      this.installText.current.innerHTML = 'Install DJFlame Guest App <span class="downloadVersion">v1.0.0</span>'

    }

    this.macosDownloadItem.current.onclick = () => {
      window.location.href = './download.html?os=macos'
    }
    this.windowsDownloadItem.current.onclick = () => {
      window.location.href = './download.html?os=windows'
    }
    this.linuxDownloadItem.current.onclick = () => {
      window.location.href = './download.html?os=linux'
    }

    this.iosDownloadItem.current.onclick = () => {
      window.location.href = 'https://apps.apple.com/us/app/djflame/id1562605955'
    }
  }

  render() {

    return <div>
      <meta charSet="UTF-8" />
      <meta httpEquiv="X-UA-Compatible" content="IE=edge" />
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <title>DJFlame</title>
      {/* <link rel="icon" href="./assets/favicon.png" />
      <link rel="stylesheet" href="./css/style.css" /> */}
      <link href="https://fonts.googleapis.com/css2?family=Poppins:ital,wght@0,100;0,200;0,300;0,400;0,500;0,600;0,700;0,800;0,900;1,100;1,200;1,300;1,400;1,500;1,600;1,700;1,800;1,900&display=swap" rel="stylesheet" />
      <link rel="preconnect" href="https://fonts.gstatic.com" />
      <link href="https://fonts.googleapis.com/css2?family=Gugi&display=swap" rel="stylesheet" />
      <link rel="stylesheet" href="https://pro.fontawesome.com/releases/v5.15.0/css/all.css" />
      <Header />
      <video autoPlay muted loop id="bgVideo">
        <source src={bgHome} type="video/mp4" />
      </video>
      <section className="homeMain">
        <h1 className="hook">DJ of the Future</h1>
        <p>Using Groundbreaking Technolgy in Artificial Intelligence, we bring a master DJ into your party! <br />
          <b>Scroll down to learn more!</b> <br />
        </p><div className="mouse_scroll">
          <div>
            <span className="m_scroll_arrows unu" />
            <span className="m_scroll_arrows doi" />
            <span className="m_scroll_arrows trei" />
          </div>
        </div>
        <p />
        <h6>Website Design Concept By <span>Avery Rhodes</span></h6>
      </section>
      <section className="about" id="about">
        <h1>About DJFlame</h1>
        <p>DJFlame is an end-to-end solution for controlling the DJ playlist of your party. Now you can forget about
          static playlists and getting manual requests from your guests. DJFlame iPhone and Android app allows guests to
          search and request songs of their choice, both before and during the party, while DJFlame desktop app
          automatically adds the requested songs to the playlist. DJTorsten AI algorithms track guest's engagement for each
          song and select tracks based on guests' mood.</p>
        <p><a href="about.html"><b>About The Developers</b></a></p>
        <iframe width={448} height={252} src="https://www.youtube.com/embed/dQw4w9WgXcQ" frameBorder={0} allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowFullScreen />
      </section>
      <section className="download" id="install">
        <h1 ref={this.installText}>Install DJFlame <span className="downloadVersion">v1.0.0</span></h1>
        <ol>
          <li><p>Click on Your Computer OS</p></li>
          <li><p>Open the Downloaded Installer</p></li>
          <li><p>Follow our <a href="./support/steps/gettingStarted.html">Getting Started Guide</a> and Prosper!</p></li>
        </ol>
        <div className="downloadContainer">
          <div className="downloadCard" ref={this.windowsDownloadItem} style={(this.state.downloadItem == "win" ? { backgroundColor: "rgba(223,73,166,1)" } : {})}>
            <i className="fab fa-windows" />
            <h4>Windows <span className="tooltip" title="Beta Releases have Bugs, More info on Download Page">beta</span></h4>
          </div>
          <div className="downloadCard" ref={this.macosDownloadItem} style={(this.state.downloadItem == "mac" ? { backgroundColor: "rgba(223,73,166,1)" } : {})}>
            <i className="fab fa-apple" />
            <h4>MacOS <span className="tooltip" title="Beta Releases have Bugs, More info on Download Page">beta</span></h4>
          </div>
          <div className="downloadCard" ref={this.linuxDownloadItem} style={(this.state.downloadItem == "linux" ? { backgroundColor: "rgba(223,73,166,1)" } : {})}>
            <i className="fab fa-linux" />
            <h4>Linux <span className="tooltip" title="Beta Releases have Bugs, More info on Download Page">beta</span></h4>
          </div>
          <div className="mobileDownloadCard" ref={this.androidDownloadItem} style={{ display: 'none' }}>
            <i className="fab fa-android" />
            <h4>Android <span>beta</span></h4>
          </div>
          <div className="mobileDownloadCard" ref={this.iosDownloadItem} style={{ display: 'none' }}>
            <i className="fab fa-apple" />
            <h4>iOS <span>beta</span></h4>
          </div>
        </div>
      </section>
      <Footer />
    </div>
  }
}

export default HomePage;
