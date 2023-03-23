import React, { Component } from 'react';
import { connect } from "react-redux";
import './DoctorExtraInfo.scss'
import { LANGUAGES } from '../../../utils';
import { FormattedMessage } from 'react-intl';
import { getExtraInfoById } from '../../../services/userService';
import NumberFormat from 'react-number-format';

class DoctorExtraInfo extends Component {

    constructor(props) {
        super(props)
        this.state = {
            isShowDetail: false,
            extraInfo: {}
        }
    }
    async componentDidMount() {
        if (this.props.doctorIdFrom) {
            let res = await getExtraInfoById(this.props.doctorIdFrom)
            if (res && res.errCode === 0) {
                this.setState({
                    extraInfo: res.data
                })
            }
        }

    }

    async componentDidUpdate(prevProps, prevState, snapshot) {
        if (this.props.language !== prevProps.language) {

        }
        if (this.props.doctorIdFrom !== prevProps.doctorIdFrom) {
            let res = await getExtraInfoById(this.props.doctorIdFrom)
            if (res && res.errCode === 0) {
                this.setState({
                    extraInfo: res.data
                })
            }

        }

    }

    showHideDetail = (status) => {
        this.setState({
            isShowDetail: status
        })
    }

    render() {
        let { language } = this.props
        let { isShowDetail, extraInfo } = this.state

        return (
            <div className='doctor-extra-info-container'>
                <div className='content-up'>
                    <div className='text-address'>
                        < FormattedMessage id="patient.extra-info.text-address" />
                    </div>
                    <div className='name-clinic'>
                        {extraInfo && extraInfo.nameClinic ? extraInfo.nameClinic : ''}
                    </div>
                    <div className='detail-address'>
                        {extraInfo && extraInfo.addressClinic ? extraInfo.addressClinic : ''}
                    </div>
                </div>
                <div className='content-down'>
                    {isShowDetail === false &&
                        <div className='short-info'>
                            < FormattedMessage id="patient.extra-info.price" />
                            {extraInfo && extraInfo.priceIdData && language === LANGUAGES.VI &&
                                <NumberFormat
                                    value={extraInfo.priceIdData.value_Vi}
                                    displayType={'text'}
                                    thousandSeparator={true}
                                    suffix={' VND'}
                                    className='currency'
                                />
                            }

                            {extraInfo && extraInfo.priceIdData && language === LANGUAGES.EN &&

                                <NumberFormat
                                    value={extraInfo.priceIdData.value_En}
                                    displayType={'text'}
                                    thousandSeparator={true}
                                    suffix={' $'}
                                    className='currency'
                                />
                            }
                            <span className='detail' onClick={() => this.showHideDetail(true)}>
                                < FormattedMessage id="patient.extra-info.detail" />
                            </span>
                        </div>
                    }

                    {isShowDetail === true &&
                        <>
                            <div className='title-price'>
                                < FormattedMessage id="patient.extra-info.price" />
                            </div>
                            <div className='detail-info'>
                                <div className='price'>
                                    <span className='left'>
                                        < FormattedMessage id="patient.extra-info.price" />
                                    </span>
                                    <span className='right'>
                                        {extraInfo && extraInfo.priceIdData && language === LANGUAGES.VI &&
                                            <NumberFormat
                                                value={extraInfo.priceIdData.value_Vi}
                                                displayType={'text'}
                                                thousandSeparator={true}
                                                suffix={' VND'}
                                                className='currency'
                                            />
                                        }

                                        {extraInfo && extraInfo.priceIdData && language === LANGUAGES.EN &&

                                            <NumberFormat
                                                value={extraInfo.priceIdData.value_En}
                                                displayType={'text'}
                                                thousandSeparator={true}
                                                suffix={' $'}
                                                className='currency'
                                            />
                                        }

                                    </span>
                                </div>
                                <div className='note'>
                                    {extraInfo && extraInfo.note ? extraInfo.note : ''}
                                </div>
                            </div>
                            <div className='payment'>
                                < FormattedMessage id="patient.extra-info.payment" />
                                -
                                {extraInfo && extraInfo.paymentIdData && language === LANGUAGES.VI
                                    ? extraInfo.paymentIdData.value_Vi : ''}

                                {extraInfo && extraInfo.paymentIdData && language === LANGUAGES.EN
                                    ? extraInfo.paymentIdData.value_En : ''}
                            </div>
                            <div className='hide-price'>
                                <span onClick={() => this.showHideDetail(false)}>
                                    < FormattedMessage id="patient.extra-info.hide-price" />
                                </span>
                            </div>

                        </>
                    }
                </div>
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

export default connect(mapStateToProps, mapDispatchToProps)(DoctorExtraInfo);
