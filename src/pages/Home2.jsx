import HeroSection2 from "../components/HeroSection2";
import ImportanceOfVoting from "../components/ImportanceOfVoting";
import WhyElections from "../components/WhyElections";
import WhyVote from "../components/WhyVote";

const Home2 = () => {
  return (
    <div>
      <HeroSection2 />  {/* Background Image + Countdown Timer */}
      <WhyVote />  {/* Why Should You Vote? */}
      <ImportanceOfVoting />  {/* Importance of Voting Section */}
      <WhyElections />  {/* Why Are Elections Conducted Section */}
    </div>
  );
};

export default Home2;
