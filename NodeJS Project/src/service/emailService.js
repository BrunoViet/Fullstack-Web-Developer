require('dotenv').config()
import nodemailer from 'nodemailer'

let sendSimpleEmail = async (dataSend) => {
    // create reusable transporter object using the default SMTP transport
    let transporter = nodemailer.createTransport({
        host: "smtp.gmail.com",
        port: 587,
        secure: false, // true for 465, false for other ports
        auth: {
            user: process.env.EMAIL_APP, // generated ethereal user
            pass: process.env.EMAIL_APP_PASSWORD, // generated ethereal password
        },
    });

    // send mail with defined transport object
    let info = await transporter.sendMail({
        from: '"TranViet.com" <viettranquocdo311@gmail.com>', // sender address
        to: dataSend.receiverEmail, // list of receivers
        subject: "Thông tin đặt lịch khám bệnh", // Subject line
        html: getBodyHTMLEmail(dataSend),
    });
}

let getBodyHTMLEmail = (dataSend) => {
    let result = ''
    if (dataSend.language === 'en') {
        result = `
        <h2>Dear ${dataSend.patientName}!</h2>
        <p>You received this email because you booked an online medical appointment on TranViet.com</p>
        <h3>Information to schedule an appointment:</h3>
        <h3>Time: ${dataSend.time}</h3>
        <h3>Doctor: ${dataSend.doctorName}</h3>

        <p>If the above information is true, please click on the link below to confirm and complete the procedure to book an appointment.</p>
        <div>
        <a href=${dataSend.redirectLink} target="blank">Click here</a>
        </div>

        <h4>Sincerely thank!</h4>
        `
    }
    if (dataSend.language === 'vi') {
        result = `
        <h2>Xin chào ${dataSend.patientName}!</h2>
        <p>Bạn nhận được email này vì đã đặt lịch khám bệnh online trên TranViet.com</p>
        <h3>Thông tin đặt lịch khám bệnh:</h3>
        <h3>Thời gian: ${dataSend.time}</h3>
        <h3>Bác sĩ: ${dataSend.doctorName}</h3>

        <p>Nếu các thông tin trên là đúng sự thật, vui lòng click vào đường link bên dưới để xác nhận và hoàn tất thủ tục đặt lịch khám bệnh.</p>
        <div>
        <a href=${dataSend.redirectLink} target="blank">Click here</a>
        </div>

        <h4>Xin chân thành cảm ơn</h4>
        `
    }
    return result
}

let getBodyHTMLEmailRemedy = (dataSend) => {
    let result = ''
    if (dataSend.language === 'en') {
        result = `
        <h2>Dear ${dataSend.patientName}!</h2>
        <p>You received this email because you booked an online medical appointment on TranViet.com</p>
        <h3>Information to schedule an appointment:</h3>
        
        <h4>Sincerely thank!</h4>
        `
    }
    if (dataSend.language === 'vi') {
        result = `
        <h2>Xin chào ${dataSend.patientName}!</h2>
        <p>Bạn nhận được email này vì đã đặt lịch khám bệnh online trên TranViet.com</p>
        <h3>Thông tin đơn thuốc/hóa đơn được gửi trong file đính kèm.</h3>
        
        <h4>Xin chân thành cảm ơn</h4>
        `
    }
    return result
}

let sendAttachment = async (dataSend) => {
    return new Promise(async (resolve, reject) => {
        try {



            // create reusable transporter object using the default SMTP transport
            let transporter = nodemailer.createTransport({
                host: "smtp.gmail.com",
                port: 587,
                secure: false, // true for 465, false for other ports
                auth: {
                    user: process.env.EMAIL_APP, // generated ethereal user
                    pass: process.env.EMAIL_APP_PASSWORD, // generated ethereal password
                },
            });

            // send mail with defined transport object
            let info = await transporter.sendMail({
                from: '"TranViet.com" <viettranquocdo311@gmail.com>', // sender address
                to: dataSend.email, // list of receivers
                subject: "Kết quả đặt lịch khám bệnh", // Subject line
                html: getBodyHTMLEmailRemedy(dataSend),
                attachments: [
                    {
                        filename: `remedy-${dataSend.patientId}-${new Date().getTime()}.png`,
                        content: dataSend.imgBase64.split('base64,')[1],
                        encoding: 'base64'
                    },
                ]
            });

            resolve()
        } catch (e) {
            reject(e)
        }
    })
}


module.exports = {
    sendSimpleEmail: sendSimpleEmail,
    sendAttachment: sendAttachment
}