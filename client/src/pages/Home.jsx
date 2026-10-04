import Navbar from "../components/Navbar";
import Hero from "../components/Hero";
import HowItWorks from "../components/HowItWorks";
import Features from "../components/Features";
import About from "../components/About";
import Contact from "../components/Contact";
import Footer from "../components/Footer";

const Home = () => {
  return (
    <div className="home-page">

      <Navbar />

      <Hero />

      <HowItWorks />

      <Features />

      <About />

      <Contact />

      <Footer />

    </div>
  );
};

export default Home;