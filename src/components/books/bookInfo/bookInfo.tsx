import './bookInfo.scss';


const BookInfo = () => {
    return(
        <div className="bookInfo">
            <div>
                <div className="metaData">
                    <img src="" alt="" />
                    <div></div>
                    <button>READ NOW</button>
                    <ul>
                        <li>Authors {}</li>
                        <li>Status {}</li>
                        <li>Bookmarks {}</li>
                        <li>Created {}</li>
                        <li>Update {}</li>
                    </ul>
                </div>
                <div className="bookData">
                    <h3>{}</h3>
                    <ul className='bTags'>
                        
                    </ul>
                    <p>Description</p>
                    <p>{}</p>
                    <div className="bookChapters">
                        <h4>Chapters</h4>
                        <input type="search" name="" id="ChapterSearch" />
                        <div className="chapterInfo">
                            
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
export default  BookInfo