import React from 'react'
import { Header, Footer } from '../components'
import largePic from '../assets/pngwing.com.png'
import '../css/style.css'

class AboutPage extends React.Component {
    render() {
        return (
            <>
                <meta charSet="UTF-8" />
                <meta httpEquiv="X-UA-Compatible" content="IE=edge" />
                <meta name="viewport" content="width=device-width, initial-scale=1.0" />
                <title>About Us | DJFlame</title>
                <link rel="stylesheet" href="./css/style.css" />
                <link rel="stylesheet" href="./css/about.css" />
                <link rel="icon" href="./assets/favicon.png" />
                <link
                    rel="stylesheet"
                    href="https://pro.fontawesome.com/releases/v5.15.0/css/all.css"
                />
                <style
                    dangerouslySetInnerHTML={{
                        __html:
                            "\n        body {\n            text-align: left;\n            justify-content: center;\n        }\n\n        .aboutusMain {\n            min-height: 100vh;\n            /* margin-top: 10vh; */\n            padding: 10vh;\n            /* background: linear-gradient(0deg, rgb(186, 65, 197) -0.18%, rgb(255, 107, 235) 97.44%); */\n            display: grid;\n            grid-template-columns: repeat(2, 1fr);\n            gap: 0 20px;\n        }\n\n        .aboutUsHero {\n            grid-column-start: 1;\n        }\n\n        .aboutUsHero h1 {\n            font-size: 56px;\n        }\n\n        .about {\n            background-color: var(--not-quite-black);\n        }\n    "
                    }}
                />
                <Header />
                <div className="aboutusMain">
                    <div className="aboutUsHero">
                        <h1>About us at DJFlame</h1>
                        <p>
                            DJFlame was founded on the intent of advancing what we know as possible
                            in music industry for the average consumer. Our goal is to give the
                            power of music to consumers without a $4000 price tag.
                        </p>
                    </div>
                    <img src={largePic} alt height={500} />
                </div>
                <div className="about">
                    <h2>Our Story</h2>
                    <p>
                        The year was 2019, it was 10 days before the New Years. Our founder was
                        assigned with DJ'ing during the New Years party but instead wanted to be
                        with his friends at the party, so he made an app to DJ for him. He took 2
                        days to make a simple Python application to play through a YouTube
                        Playlist, and would skip the song after a set or random amount of time. He
                        called it DJTorsten. He got to the party and the app went smoothly. After
                        the party, he heard people were wanting his app for the convience of it
                        and then decided to make a public version. Fast-foward to June 2020, the
                        pandemic was at a peak at the time and out of boredom, he decided to pick
                        up the DJTorsten Project. It took another week to make another prototype,
                        out of Python, and it was great. There were problems such as security
                        issues and the problem of downloading it to people's computers. Again, the
                        project was shelved. Fast foward to August 2020, the school-year just
                        started and so did his current prototype of DJTorsten. Now, he decided to
                        change the name to DJFlame. He started to make it and made the basic
                        application in 2 days. It took him untill April 2021 to finish it and
                        launch a beta, and there we are to the present.
                    </p>
                </div>
                {/* <div class="about" style="background-color: transparent;">
  <h1>Our Staff</h1>
  <div class="staffRow">
      <div class="card">
          <img src="https://www.w3schools.com/howto/img_avatar.png" alt="Avatar" style="width:100%">
          <div class="container">
            <h4><b>Siddharth Ray</b></h4>
            <p>CEO & CTO</p>
          </div>
        </div>
        <div class="card">
          <img src="https://www.w3schools.com/howto/img_avatar.png" alt="Avatar" style="width:100%">
          <div class="container">
            <h4><b>Joydeep Ray</b></h4>
            <p>CFO</p>
          </div>
        </div>
  </div>
    </div> */}
                <Footer />
            </>
        )
    }
}

export default AboutPage