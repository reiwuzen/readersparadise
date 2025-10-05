import "./Cards.scss";
import { useReader } from "@/hooks/useReader";
import { useTabs } from "@/hooks/useTabs";
// import { useImport } from "@/hooks/useImport";
export type CardProps = {
  cardName: string;
  cover: string;
};
const Card = ({ cardName, cover }: CardProps) => {
  const {activeTabId} = useTabs();
  const {openReader} = useReader();
  return (
    <div className="card" onClick={async () => {
    await openReader(activeTabId, cardName);

    }} >
      <img src={`${cover}`} alt={`${cardName}`} />
      <h3>{cardName}</h3>
    </div>
  );
};
export default Card;
