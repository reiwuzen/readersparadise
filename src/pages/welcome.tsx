import "../styles/welcome.scss";
type WelcomeProps = {
  onNext: () => void;
};
const Welcome = ({ onNext }: WelcomeProps) => {
  return (
    <div className="welcomeBox">
      <h3>Welcome</h3>
      <h4>You've come to a Paradise</h4>
      <div className="buttonBorder">
        <button onClick={onNext}>Let's Begin</button>
      </div>
    </div>
  );
};
export default Welcome;
export { type WelcomeProps };
