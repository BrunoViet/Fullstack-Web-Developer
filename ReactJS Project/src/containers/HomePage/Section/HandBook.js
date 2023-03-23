import React, { Component } from 'react';
import { connect } from 'react-redux';
import './HandBook.scss'
import { FormattedMessage } from 'react-intl';
import Slider from 'react-slick';

class HandBook extends Component {

    render() {

        let settings = {
            dots: false,
            infinite: true,
            speed: 700,
            slidesToShow: 2,
            slidesToScroll: 2,

        };

        return (
            <div className='section-handbook'>
                <div className='section-container'>
                    <div className='section-header'>
                        <span className='title-section'>
                            <FormattedMessage id="banner.title5" />
                        </span>
                        <button className='btn-section'>
                            <FormattedMessage id="banner.title6" />
                        </button>
                    </div>
                    <div className='section-body'>
                        <Slider {...settings}>
                            <div className='section-customize'>
                                <div className='hb-image' />
                                <h3>Chia sẻ kinh nghiệm khám tiêu hóa tại Bệnh viện Hưng Việt</h3>
                            </div>
                            <div className='section-customize'>
                                <div className='hb-image2' />
                                <h3>Review chi tiết và lưu ý đi khám tại Trung tâm điều trị Bệnh trĩ Hà Nội - Số 1</h3>
                            </div>
                            <div className='section-customize'>
                                <div className='hb-image3' />
                                <h3>TOP 7 bệnh viện, phòng khám gan tốt, uy tín TPHCM (Phần 2) </h3>
                            </div>
                            <div className='section-customize'>
                                <div className='hb-image4' />
                                <h3>Danh sách 7 Bác sĩ khám gan giỏi TPHCM (Phần 2)</h3>
                            </div>
                        </Slider>
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

export default connect(mapStateToProps, mapDispatchToProps)(HandBook);
