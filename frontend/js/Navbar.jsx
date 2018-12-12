class Navbar extends React.Component{
    constructor(props){
        super(props);
        this.state={language:"en","name":"Monitor der Siedlungs- und Freiraumentwicklung (IÖR-Monitor)",
                    flag:(<i className="gb uk flag"/>)};
        // preserve the initial state in a new object
        this.baseState = this.state;
        this.changeLanguage = this.changeLanguage.bind(this);
    }
    changeLanguage(){
        language_manager.setLanguage(this.state.language);
        language_manager.setElements();
         if(this.state.language==="en"){
            this.setState({language:"de",name:"Monitor of Settlement and Open Space Development",flag:(<i className="de flag"/>)});
        }else{
            this.setState(this.baseState);
        }

    }

    render(){
        return(
            <div className="navbar-default navbar">
                <div className="navbar-primary">
                    <nav className="navbar navbar-static-top" role="navigation">
                        <div className="navbar-header">
                            <button type="button" className="navbar-toggle" data-toggle="collapse"
                                    data-target="#navbar-collapse-8">
                                <span className="icon-bar"/>
                            </button>
                            <a className="navbar-brand" href="https://www.ioer.de" target="_blank"/>
                        </div>
                        <div>
                            <a href="http://www.ioer-monitor.de"><p className="navbar-text">{this.state.name}</p></a>
                        </div>
                        <div className="collapse navbar-collapse" id="navbar-collapse-8">
                            <ul className="nav navbar-nav">
                                <li><a id="webtour"
                                       title="unternehmen Sie eine Tour durch die Funktionalitäten des IÖR-Monitors">IÖR-Monitor
                                    Tour</a></li>
                                <li><a id="feedback_a">Feedback</a></li>
                                <li><a id="language" data-value="en" onClick={this.changeLanguage}>{this.state.flag}</a></li>
                            </ul>
                        </div>
                    </nav>
                </div>
            </div>
        );
    }
}
ReactDOM.render(
    <Navbar />,
    document.getElementById('navbar')
);