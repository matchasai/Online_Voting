import HeroSection2 from "../components/HeroSection2";
import ImportanceOfVoting from "../components/ImportanceOfVoting";
import WhyElections from "../components/WhyElections";
import WhyVote from "../components/WhyVote";

const Home = () => {
  return (
    <div className="bg-gradient-to-br from-blue-50 via-white to-blue-100 min-h-screen flex flex-col">
      {/* Hero Section */}
      <div className="mb-12">
        <HeroSection2 />
      </div>
      {/* Section Divider */}
      <div className="w-full flex justify-center mb-12">
        <div className="h-1 w-32 bg-gradient-to-r from-blue-400 via-blue-600 to-blue-400 rounded-full shadow-lg animate-pulse" />
      </div>
      {/* Why Vote Section */}
      <div className="mb-12">
        <WhyVote />
      </div>
      {/* Section Divider */}
      <div className="w-full flex justify-center mb-12">
        <div className="h-1 w-32 bg-gradient-to-r from-blue-400 via-blue-600 to-blue-400 rounded-full shadow-lg animate-pulse" />
      </div>
      {/* Importance of Voting Section */}
      <div className="mb-12">
        <ImportanceOfVoting />
      </div>
      {/* Section Divider */}
      <div className="w-full flex justify-center mb-12">
        <div className="h-1 w-32 bg-gradient-to-r from-blue-400 via-blue-600 to-blue-400 rounded-full shadow-lg animate-pulse" />
      </div>
      {/* Why Elections Section */}
      <div className="mb-12">
        <WhyElections />
      </div>
    </div>
  );
};

export default Home;
