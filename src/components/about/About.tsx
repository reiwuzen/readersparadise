import './About.scss';
import { openUrl } from '@tauri-apps/plugin-opener';
const About = () => {
    return (
        <div className="about">
            <div className="inAbout">
                <h1>About</h1>
                <a href='#' onClick={async()=>await openUrl("https://github.com/reiwuzen/readersparadise")}>Github Link</a>
                <h3>In Production</h3>
                <ul className="features">
                    <h3>Features</h3>
                    <li>Multi-Tab</li>
                    <li>Import Local</li>
                    <li>Multi-Coverage, Novel, Manga, Manhua, Manhwa</li>
                    <li>Multi-Sourced</li>
                </ul>
                <ul className="list">
                    <h3>Made by</h3>
                    <li>Rei WuZen</li>
                    <li>Om Kumar</li>
                    <li>Ansh Rawat</li>
                </ul>
                
            </div>
        </div>
    )
}
export default About;