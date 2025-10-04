import "./Cards.scss";
import { useReader } from "@/hooks/useReader";
import { useImport } from "@/hooks/useImport";
export type CardProps = {
  cardName: string;
  cover: string;
};
const Card = ({ cardName, cover }: CardProps) => {
  const {openReader} = useReader();
  const {mangas} =useImport();
  return (
    <div className="card" onClick={() => {
      openReader(cardName, mangas);
    }} >
      <img src={`${cover}`} alt={`${cardName}`} />
      <h3>{cardName}</h3>
    </div>
  );
};
export default Card;
