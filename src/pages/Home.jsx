import Footer from "../components/Footer";
import HeroSection from "../components/HeroSection";
import ImportanceOfVoting from "../components/ImportanceOfVoting";
import WhyElections from "../components/WhyElections";
import WhyVote from "../components/WhyVote";

const Home = () => {
  return (
    <div>
      <HeroSection />  {/* Background Image + Countdown Timer */}
      <WhyVote />  {/* Why Should You Vote? */}
      <ImportanceOfVoting />  {/* Importance of Voting Section */}
      <WhyElections />  {/* Why Are Elections Conducted Section */}
      <Footer />  {/* Footer with links */}
    </div>
  );
};

export default Home;
