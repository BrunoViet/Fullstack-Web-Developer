import React, { Component } from 'react';
import { connect } from "react-redux";
import { FormattedMessage } from 'react-intl';
import './ProfileDoctor.scss'
import { getProfileDoctor } from '../../../services/userService'
import { LANGUAGES } from '../../../utils';
import NumberFormat from 'react-number-format';
import _ from 'lodash'
import moment from 'moment';
import localization from 'moment/locale/vi'
import { Link } from 'react-router-dom';

class ProfileDoctor extends Component {

    constructor(props) {
        super(props)
        this.state = {
            dataProfile: {}
        }
    }
    async componentDidMount() {
        let data = await this.getInfoDoctor(this.props.doctorId)
        this.setState({
            dataProfile: data
        })
    }

    async componentDidUpdate(prevProps, prevState, snapshot) {
        if (this.props.language !== prevProps.language) {

        }
        // if(this.props.doctorId!== prevProps.doctorId){

        // }

    }

    getInfoDoctor = async (id) => {
        let result = {}
        if (id) {
            let res = await getProfileDoctor(id)
            if (res && res.errCode === 0) {
                result = res.data
            }
        }
        return result
    }

    capitalizeFirstLetter(string) {
        return string.charAt(0).toUpperCase() + string.slice(1);
    }

    renderTimeBooking = (dataTime) => {
        let { language } = this.props

        if (dataTime && !_.isEmpty(dataTime)) {
            let time = language === LANGUAGES.VI ? dataTime.timeTypeData.value_Vi : dataTime.timeTypeData.value_En

            let date = language === LANGUAGES.VI ?
                moment.unix(+dataTime.date / 1000).format('dddd - DD/MM/YYYY')
                :
                moment.unix(+dataTime.date / 1000).locale('en').format('ddd - MM/DD/YYYY')
            return (

                <>
                    <div>{time} - {this.capitalizeFirstLetter(date)}</div>
                    <div><FormattedMessage id="patient.booking-modal.priceBooking" /></div>
                </>
            )
        }
        return <></>
    }
    render() {
        let { dataProfile } = this.state
        let { language, isShowDescriptionDoctor,
            dataTime, isShowLinkDetail,
            isShowPrice, doctorId } = this.props
        let nameVi = ''
        let nameEn = ''
        if (dataProfile && dataProfile.positionData) {
            nameVi = `${dataProfile.positionData.value_Vi},${dataProfile.firstName} ${dataProfile.lastName}`;
            nameEn = `${dataProfile.positionData.value_En}, ${dataProfile.lastName} ${dataProfile.firstName} `;
        }
        return (
            <div className='profile-doctor-container'>
                <div className='intro-doctor'>
                    <div className='content-left'
                        style={{ backgroundImage: `url(${dataProfile && dataProfile.image ? dataProfile.image : ''})` }}

                    >
                    </div>
                    <div className='content-right'>
                        <div className='up'>
                            {language === LANGUAGES.VI ? nameVi : nameEn}
                        </div>
                        <div className='down'>
                            {isShowDescriptionDoctor === true ?
                                <>
                                    {dataProfile && dataProfile.Markdown && dataProfile.Markdown.description &&
                                        <span>
                                            {dataProfile.Markdown.description
                                            }

                                        </span>
                                    }
                                </>
                                :
                                <>
                                    {this.renderTimeBooking(dataTime)}
                                </>
                            }
                        </div>
                    </div>
                </div>
                {isShowLinkDetail === true &&
                    <div className='view-detail-doctor'
                    >
                        <Link to={`/detail-doctor/${doctorId}`}>Xem thêm</Link>
                    </div>}
                {isShowPrice === true &&
                    <div className='price'>
                        <FormattedMessage id="patient.booking-modal.price" />
                        {dataProfile && dataProfile.Doctor_Info && language === LANGUAGES.VI &&
                            <NumberFormat
                                value={dataProfile.Doctor_Info.priceIdData.value_Vi}
                                displayType={'text'}
                                thousandSeparator={true}
                                suffix={' VND'}
                                className='currency'
                            />
                        }
                        {dataProfile && dataProfile.Doctor_Info && language === LANGUAGES.EN &&

                            <NumberFormat
                                value={dataProfile.Doctor_Info.priceIdData.value_En}
                                displayType={'text'}
                                thousandSeparator={true}
                                suffix={' USD'}
                                className='currency'
                            />

                        }
                    </div>
                }
            </div>

        );
    }
}


const mapStateToProps = state => {
    return {
        language: state.app.language
    };
};

const mapDispatchToProps = dispatch => {
    return {
    };
};

export default connect(mapStateToProps, mapDispatchToProps)(ProfileDoctor);
