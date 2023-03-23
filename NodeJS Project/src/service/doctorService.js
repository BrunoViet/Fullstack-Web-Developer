
import db from "../models/index"
require('dotenv').config();
import _, { reject } from 'lodash'
import emailService from '../service/emailService'

const MAX_NUMBER_SCHEDULE = process.env.MAX_NUMBER_SCHEDULE
let getTopDoctorHomeService = (limitInput) => {
    return new Promise(async (resolve, reject) => {
        try {
            let users = await db.User.findAll({
                limit: limitInput,
                where: { roleId: 'R2' },
                order: [['createdAt', 'DESC']],
                attributes: {
                    exclude: ['password']
                },
                include: [
                    { model: db.Allcode, as: 'positionData', attributes: ['value_En', 'value_Vi'] },
                    { model: db.Allcode, as: 'genderData', attributes: ['value_En', 'value_Vi'] },

                ],
                raw: true,
                nest: true
            })
            resolve({
                errCode: 0,
                data: users
            })
        } catch (e) {
            reject(e)
        }
    })
}

let getAllDoctorService = () => {
    return new Promise(async (resolve, reject) => {
        try {
            let allDoctors = await db.User.findAll({
                where: { roleId: 'R2' },
                attributes: {
                    exclude: ['password', 'image']
                }
            })
            resolve({
                errCode: 0,
                data: allDoctors
            })
        } catch (e) {
            reject(e)
        }
    })
}

let checkRequiredFields = (data) => {
    let arrFields = ['doctorId', 'contentHTML', 'contentMarkdown', 'action', 'selectedPrice', 'selectedPayment', 'selectedProvince',
        'nameClinic', 'addressClinic', 'note', 'specialtyId']

    let isValid = true;
    let element = ''
    for (let i = 0; i < arrFields.length; i++) {
        if (!data[arrFields[i]]) {
            isValid = false;
            element = arrFields[i]
            break;
        }
    }
    return {
        isValid: isValid,
        element: element
    }
}

let saveDetailDoctor = (data) => {
    return new Promise(async (resolve, reject) => {
        try {

            let checkObj = checkRequiredFields(data)
            if (checkObj.isValid === false) {
                resolve({
                    errCode: 1,
                    errMessage: `Missing parameters: ${checkObj.element}`
                })
            } else {

                //upset to Markdown table
                if (data.action === 'CREAT') {
                    await db.Markdown.create({
                        contentHTML: data.contentHTML,
                        contentMarkdown: data.contentMarkdown,
                        description: data.description,
                        doctorId: data.doctorId
                    })
                } else if (data.action === 'EDIT') {
                    let doctorMarkdown = await db.Markdown.findOne({
                        where: { doctorId: data.doctorId },
                        raw: false
                    })

                    if (doctorMarkdown) {
                        doctorMarkdown.contentHTML = data.contentHTML;
                        doctorMarkdown.contentMarkdown = data.contentMarkdown;
                        doctorMarkdown.description = data.description;
                        await doctorMarkdown.save();
                    }

                }
            }

            //upset to Doctor_info table
            let doctorInfo = await db.Doctor_Info.findOne({
                where: {
                    doctorId: data.doctorId,
                },
                raw: false
            })
            if (doctorInfo) {
                //update
                doctorInfo.doctorId = data.doctorId;
                doctorInfo.priceId = data.selectedPrice;
                doctorInfo.provinceId = data.selectedProvince;
                doctorInfo.paymentId = data.selectedPayment;
                doctorInfo.nameClinic = data.nameClinic;
                doctorInfo.addressClinic = data.addressClinic;
                doctorInfo.note = data.note;
                doctorInfo.specialtyId = data.specialtyId;
                doctorInfo.clinicId = data.clinicId

                await doctorInfo.save();
            } else {
                //create
                await db.Doctor_Info.create({
                    doctorId: data.doctorId,
                    priceId: data.selectedPrice,
                    provinceId: data.selectedProvince,
                    paymentId: data.selectedPayment,
                    nameClinic: data.nameClinic,
                    addressClinic: data.addressClinic,
                    note: data.note,
                    specialtyId: data.specialtyId,
                    clinicId: data.clinicId

                })
            }


            resolve({
                errCode: 0,
                errMessage: 'Save info doctor success!!'
            })

        } catch (e) {
            reject(e)
        }
    })
}

let getDetailDoctorService = (inputId) => {
    return new Promise(async (resolve, reject) => {
        try {
            if (!inputId) {
                resolve({
                    errCode: 1,
                    errMessage: 'Missing required parameters'
                })
            } else {
                let dataDetail = await db.User.findOne({
                    where: { id: inputId },
                    attributes: {
                        exclude: ['password']
                    },
                    include: [
                        {
                            model: db.Markdown,
                            attributes: ['description', 'contentHTML', 'contentMarkdown']
                        },
                        { model: db.Allcode, as: 'positionData', attributes: ['value_En', 'value_Vi'] },
                        {
                            model: db.Doctor_Info,
                            attributes: {
                                exclude: ['id', 'doctorId']
                            },
                            include: [
                                { model: db.Allcode, as: 'priceIdData', attributes: ['value_En', 'value_Vi'] },
                                { model: db.Allcode, as: 'provinceIdData', attributes: ['value_En', 'value_Vi'] },
                                { model: db.Allcode, as: 'paymentIdData', attributes: ['value_En', 'value_Vi'] },
                            ]
                        },
                    ],
                    raw: false,
                    nest: true,
                })
                if (dataDetail && dataDetail.image) {
                    dataDetail.image = Buffer.from(dataDetail.image, 'base64').toString('binary')
                }
                if (!dataDetail)
                    dataDetail = {}

                resolve({
                    errCode: 0,
                    data: dataDetail
                })
            }
        } catch (e) {
            reject(e)
        }
    })
}

let bulkCreateScheduleService = (data) => {
    return new Promise(async (resolve, reject) => {
        try {
            if (!data.arrSchedule || !data.doctorId || !data.date) {
                resolve({
                    errCode: 1,
                    errMessage: 'Missing required parameters!'
                })
            } else {
                let schedule = data.arrSchedule
                if (schedule && schedule.length > 0) {
                    schedule = schedule.map(item => {
                        item.maxNumber = MAX_NUMBER_SCHEDULE
                        return item;
                    })
                }

                let existing = await db.Schedule.findAll(
                    {
                        where: { doctorId: data.doctorId, date: data.date },
                        attributes: ['timeType', 'date', 'doctorId', 'maxNumber'],
                        raw: true
                    }
                );

                let toCreate = _.differenceWith(schedule, existing, (a, b) => {
                    return a.timeType === b.timeType && +a.date === +b.date;
                })

                if (toCreate && toCreate.length > 0) {
                    await db.Schedule.bulkCreate(toCreate)
                }
                resolve({
                    errCode: 0,
                    errMessage: 'OK'
                })
            }
        } catch (e) {
            reject(e)
        }
    })
}
let getScheduleService = (doctorId, date) => {
    return new Promise(async (resolve, reject) => {
        try {
            if (!doctorId || !date) {
                resolve({
                    errCode: 1,
                    errMessage: 'Missing required parameters'
                })
            } else {
                let dataSchedule = await db.Schedule.findAll({
                    where: {
                        doctorId: doctorId,
                        date: date
                    },
                    include: [
                        { model: db.Allcode, as: 'timeTypeData', attributes: ['value_En', 'value_Vi'] },
                        { model: db.User, as: 'doctorData', attributes: ['firstName', 'lastName'] },

                    ],
                    raw: true,
                    nest: true
                })
                if (!dataSchedule) dataSchedule = []
                resolve({
                    errCode: 0,
                    errMessage: 'OK',
                    data: dataSchedule
                })
            }
        } catch (e) {
            reject(e)
        }
    })
}

let getExtraInfoByIdService = (inputId) => {
    return new Promise(async (resolve, reject) => {
        try {
            if (!inputId) {
                resolve({
                    errCode: 1,
                    errMessage: 'Missing required parameters'
                })
            } else {
                let data = await db.Doctor_Info.findOne({
                    where:
                        { doctorId: inputId },
                    attributes: {
                        exclude: ['id', 'doctorId']
                    },
                    include: [
                        { model: db.Allcode, as: 'priceIdData', attributes: ['value_En', 'value_Vi'] },
                        { model: db.Allcode, as: 'provinceIdData', attributes: ['value_En', 'value_Vi'] },
                        { model: db.Allcode, as: 'paymentIdData', attributes: ['value_En', 'value_Vi'] },
                    ],
                    raw: true,
                    nest: true
                })
                if (!data) data = {}
                resolve({
                    errCode: 0,
                    data: data
                })
            }

        } catch (e) {
            reject(e)
        }
    })
}

let getProfileDoctorService = (doctorId) => {
    return new Promise(async (resolve, reject) => {
        try {
            if (!doctorId) {
                resolve({
                    errCode: 1,
                    errMessage: 'Missing required parameters'
                })
            } else {
                let dataDetail = await db.User.findOne({
                    where: { id: doctorId },
                    attributes: {
                        exclude: ['password']
                    },
                    include: [
                        {
                            model: db.Markdown,
                            attributes: ['description', 'contentHTML', 'contentMarkdown']
                        },
                        { model: db.Allcode, as: 'positionData', attributes: ['value_En', 'value_Vi'] },
                        {
                            model: db.Doctor_Info,
                            attributes: {
                                exclude: ['id', 'doctorId']
                            },
                            include: [
                                { model: db.Allcode, as: 'priceIdData', attributes: ['value_En', 'value_Vi'] },
                                { model: db.Allcode, as: 'provinceIdData', attributes: ['value_En', 'value_Vi'] },
                                { model: db.Allcode, as: 'paymentIdData', attributes: ['value_En', 'value_Vi'] },
                            ]
                        },
                    ],
                    raw: false,
                    nest: true,
                })
                if (dataDetail && dataDetail.image) {
                    dataDetail.image = Buffer.from(dataDetail.image, 'base64').toString('binary')
                }
                if (!dataDetail)
                    dataDetail = {}

                resolve({
                    errCode: 0,
                    data: dataDetail
                })
            }
        } catch (e) {
            reject(e)
        }
    })
}

let getListPatientForDoctorService = (doctorId, date) => {
    return new Promise(async (resolve, reject) => {
        try {
            if (!doctorId || !date) {
                resolve({
                    errCode: 1,
                    errMessage: 'Missing required parameters'
                })
            } else {
                let data = await db.Booking.findAll({
                    where: {
                        statusId: 'S2',
                        doctorId: doctorId,
                        date: date
                    },
                    include: [
                        {
                            model: db.User,
                            as: 'patientData',
                            attributes: ['email', 'firstName', 'address', 'gender'],
                            include: [
                                { model: db.Allcode, as: 'genderData', attributes: ['value_En', 'value_Vi'] },
                            ]
                        },
                        {
                            model: db.Allcode, as: 'timeTypeDataPatient', attributes: ['value_En', 'value_Vi'],

                        }
                    ],
                    raw: false,
                    nest: true
                })


                resolve({
                    errCode: 0,
                    data
                })
            }
        } catch (e) {
            reject(e)
        }
    })
}

let sendRemedyService = (data) => {
    return new Promise(async (resolve, reject) => {
        try {
            if (!data.email || !data.doctorId || !data.patientId || !data.timeType) {
                resolve({
                    errCode: 1,
                    errMessage: 'Missing required parameters'
                })
            } else {
                //update patient status
                let appointment = await db.Booking.findOne({
                    where: {
                        doctorId: data.doctorId,
                        patientId: data.patientId,
                        timeType: data.timeType,
                        statusId: 'S2'
                    },
                    raw: false
                })

                if (appointment) {
                    appointment.statusId = 'S3'
                    await appointment.save()
                }

                //    send email remedy
                await emailService.sendAttachment(data)
                resolve({
                    errCode: 0,
                    data
                })
            }
        } catch (e) {
            reject(e)
        }
    })
}
module.exports = {
    getTopDoctorHomeService: getTopDoctorHomeService,
    getAllDoctorService: getAllDoctorService,
    saveDetailDoctor: saveDetailDoctor,
    getDetailDoctorService: getDetailDoctorService,
    bulkCreateScheduleService: bulkCreateScheduleService,
    getScheduleService: getScheduleService,
    getExtraInfoByIdService: getExtraInfoByIdService,
    getProfileDoctorService: getProfileDoctorService,
    getListPatientForDoctorService: getListPatientForDoctorService,
    sendRemedyService: sendRemedyService
}