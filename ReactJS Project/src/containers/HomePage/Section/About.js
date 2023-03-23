import React, { Component } from 'react';
import { connect } from 'react-redux';
import { FormattedMessage } from 'react-intl';
import './About.scss'
class About extends Component {

    render() {

        return (
            <div className='section-about'>
                <div className='section-about-header'>
                    <FormattedMessage id="about.about-us" /> TranViet.com
                </div>
                <div className='section-about-content'>
                    <div className='content-left'>
                        <iframe width="50%" height="auto"
                            src="https://www.youtube.com/embed/H_sbmUJKlTE"
                            title="Mười điểm 10 😂|  Ông Yanbi"
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                            allowFullScreen></iframe>
                    </div>
                    <div className='content-right'>
                        <FormattedMessage id="about.description" />
                    </div>
                </div>
            </div>
        );
    }

}

const mapStateToProps = state => {
    return {
        isLoggedIn: state.user.isLoggedIn,
        language: state.app.language,
    };
};

const mapDispatchToProps = dispatch => {
    return {
    };
};

export default connect(mapStateToProps, mapDispatchToProps)(About);
