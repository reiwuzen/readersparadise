import "./Cards.scss";
import { useReader } from "@/hooks/useReader";
// import { useImport } from "@/hooks/useImport";
export type CardProps = {
  cardName: string;
  cover: string;
};
const Card = ({ cardName, cover }: CardProps) => {
  const {openReader} = useReader();
  return (
    <div className="card" onClick={ () => {
     openReader(cardName);
      console.log("from card open reader")
    }} >
      <img src={`${cover}`} alt={`${cardName}`} />
      <h3>{cardName}</h3>
    </div>
  );
};
export default Card;
