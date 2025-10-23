import './cardV2.scss';
import { SearchResult } from '@/store/useDiscoverStore';
import { useDiscover } from '@/hooks/useDiscover';
import { useTabs } from '@/hooks/useTabs';
import { useActiveTab } from '@/hooks/useActiveTab';
export type CardV2Props = {
    i: number;
    Book: SearchResult;
    // onClick: ()=>void;
}

const CardV2 = ({Book, i}: CardV2Props) => {
  const {activeTabId} = useActiveTab();
  const {changeTab} = useTabs();
  const {getSelectedBookInfo} =useDiscover();
    return (
        <div
                key={i}
                className="book-card"
                onClick={()=>{
                  changeTab(activeTabId,Book.title,"book");
                  getSelectedBookInfo(Book.link, Book.source_name)

                }}
              >
                <img
                  src={Book.cover_image ?? ""}
                  alt={Book.title}
                  className="cover"
                />
                <div className="info">
                  <h4 className="title">{Book.title}</h4>
                  <p className="source">{Book.source_name}</p>
                  {Book.desc && (
                    <p className="desc">{Book.desc.slice(0, 80)}...</p>
                  )}
                </div>
              </div>
    )
}
export default CardV2;