import db from "../models/index";
import CRUDService from "../service/CRUDService";
let getHomePage = async (req, res) => {
    try {
        let data = await db.User.findAll()
        return res.render('homepage.ejs', {
            data: JSON.stringify(data)
        });
    } catch (e) {
        console.log(e)
    }
}

let getAboutPage = (req, res) => {
    return res.render('test/about.ejs');
}

let getCRUD = (req, res) => {
    return res.render('Crud.ejs');
}
let postCRUD = async (req, res) => {
    let message = await CRUDService.createNewUser(req.body)
    return res.redirect('/get-crud')
}
let displayGetCRUD = async (req, res) => {
    let data = await CRUDService.getAllUser();
    return res.render('displayCRUD.ejs', {
        dataTable: data
    })
}
let getEditCRUD = async (req, res) => {
    let userId = req.params.id;
    if (userId) {
        let userData = await CRUDService.getUserInfoById(userId);
        return res.render("editCRUD.ejs", {
            user: userData
        })
    } else {
        return res.send("Users not found!");
    }
}
let putCRUD = async (req, res) => {
    let data = req.body;
    await CRUDService.updateUserdata(data)
    return res.redirect('/get-crud')
}
let deleteCRUD = async (req, res) => {
    let id = req.params.id;
    if (id) {
        await CRUDService.deleteUserById(id);
        return res.redirect("/get-crud")
    } else {
        return res.send("Failed")
    }

}
module.exports = {
    getHomePage: getHomePage,
    getAboutPage: getAboutPage,
    getCRUD: getCRUD,
    postCRUD: postCRUD,
    displayGetCRUD: displayGetCRUD,
    getEditCRUD: getEditCRUD,
    putCRUD: putCRUD,
    deleteCRUD: deleteCRUD,
}
