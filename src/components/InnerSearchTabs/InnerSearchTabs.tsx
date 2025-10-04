
import './InnerSearchTabs.scss'
import { TabProps } from '@/pages/home/tabManager/components/tab/tab';


export type InnerSearchTabsProps = {
  tab: TabProps;
  type?: 'open' | 'recent';
};
const InnerSearchTabs = ({ tab, type }: InnerSearchTabsProps) => {
  const openTab =(
    <div className={`innerSearchTabs  ${tab.isActive ? 'yesActive' : 'notActive'}`} id='openTab' onClick={tab.onClick}>
      {tab.name}
    <button onClick={
            (e) => {
            e.stopPropagation(); // prevent switching tab when closing
            tab.onClose!();
          }}>×</button>
    </div>
  );
  const recentTab = (
    <div className={`innerSearchTabs `} id='recentTab' onClick={tab.onClick}>
      {tab.name}
    <button onClick={
            (e) => {
            e.stopPropagation(); // prevent switching tab when closing
            tab.onClose!();
          }}>×</button>
    </div>
  );
  
  return (type === 'recent')? recentTab: openTab;
}
export default InnerSearchTabs;