import React from "react";
import ReactDOM from "react-dom";
// import "./index.css";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import {
  HomePage,
  TermsPage,
  PrivacyPage,
  AboutPage,
  NotFoundPage,
  PressPage,
  DownloadPage
} from "./pages";

ReactDOM.render(
  <Router>
    <Routes>
      <Route exact path="/" element={<HomePage />} />
      <Route exact path="/terms" element={<TermsPage />}/>
      <Route exact path="/privacy" element={<PrivacyPage />}/>
      <Route exact path="/about" element={<AboutPage />}/>
      <Route exact path="/press" element={<PressPage />}/>
      <Route exact path="/download" element={<DownloadPage />}/>
      <Route path='*' exact={true} element={<NotFoundPage />}/>
      {/* <Route path="/about" element={<About />} />
      <Route path="/contact" element={<Contact />} />
      <Route path="/blog" element={<Blog />}>
        <Route path="" element={<Posts />} />
        <Route path=":postSlug" element={<Post />} />
      </Route> */}
    </Routes>
  </Router>,

  document.getElementById("root")
);