import './Reader.scss'
// import { useImport } from '@/hooks/useImport'
import { useReader } from '@/hooks/useReader'
const Reader = () => {
    const {currentBook} = useReader();
    return (
        <div className="reader">
            <div className="readerOptions">☰</div>
            <img src={currentBook?.openPage} alt={currentBook?.name} />
        </div>
    )
}
export default Reader