import React from 'react'
import { Header, Footer } from '../components'
import largePic from '../assets/pngwing.com.png'
import '../css/style.css'

class PressPage extends React.Component {
    render() {
        return (
            <>
                <meta charSet="UTF-8" />
                <meta httpEquiv="X-UA-Compatible" content="IE=edge" />
                <meta name="viewport" content="width=device-width, initial-scale=1.0" />
                <title>Press | DJFlame</title>
                <link rel="stylesheet" href="./css/style.css" />
                {/* <link rel="stylesheet" href="./css/about.css"> */}
                <link rel="icon" href="./assets/favicon.png" />
                <link
                    rel="stylesheet"
                    href="https://pro.fontawesome.com/releases/v5.15.0/css/all.css"
                />
                <style
                    dangerouslySetInnerHTML={{
                        __html:
                            "\n        .pressMain {\n            min-height: 100vh;\n            /* margin-top: 10vh; */\n            /* padding: 10vh; */\n        }\n\n        .pressBanner {\n            padding: 30px;\n            padding-top: 10vh;\n            background: linear-gradient(0deg, rgba(186, 65, 197, 0.712) -0.18%, rgba(255, 107, 235, 0.712) 97.44%);\n            text-align: center;\n        }\n\n        .pressNavigation {\n            display: flex;\n            justify-content: space-around;\n            flex-direction: row;\n            align-items: center;\n            min-height: 5vh;\n            height: 8vh;\n            background-color: #2c2c2c;\n            /* position: fixed; */\n            width: 100%;\n            z-index: 98;\n            /* top: 0; */\n            /* position: sticky; */\n            transition: background-color 0.25s ease-in-out;\n        }\n\n        .pressNavigation ul {\n            list-style: none;\n            flex-direction: row;\n            display: flex;\n            /* background-color: blueviolet; */\n            width: 100%;\n        }\n\n        .pressNavigation li {\n            margin: 5px;\n            flex: 1;\n            /* background-color: blue; */\n            text-align: center;\n        }\n    "
                    }}
                />
                <Header />
                <div className="pressMain">
                    <div className="pressBanner">
                        <h1>For The Press</h1>
                        <p>
                            Below you will find all you will need for information about us at
                            DJFlame. If you do not find the information you are looking for, please
                            contact our Public Relations Representative. Please do not use any facts
                            from sources other than us as they may be inaccurate.
                        </p>
                    </div>
                    <div className="pressNavigation">
                        <ul>
                            <li>
                                <a>Contact</a>
                            </li>
                            <li>
                                <a>Company Overview</a>
                            </li>
                            <li>
                                <a>Assets</a>
                            </li>
                            <li>
                                <a>Press Releases</a>
                            </li>
                        </ul>
                    </div>
                    <div className="pressContact">
                        <h2>Contact</h2>
                        <p>
                            First off, here is a way to contact us! E-Mail is the prefered way of
                            contact, but any embodiment will work.
                            <br />
                            contact stuff
                            <br />
                            contact stuff
                            <br />
                            contact stuff
                            <br />
                            contact stuff
                            <br />
                            contact stuff
                            <br />
                            <br />
                            Our Official Social Media accounts are{" "}
                            <a href="https://twitter.com/DJFlameApp/">@DJFlameApp (Twitter)</a> and
                            <a href="https://reddit.com/u/DJFlameApp">/u/DJFlameApp (Reddit)</a>
                        </p>
                    </div>
                    <div className="pressCoOverview">
                        <h2>Company Overview</h2>
                    </div>
                </div>
                <Footer />
            </>
        )
    }
}
export default PressPage