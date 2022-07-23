const Technologies = require('../../models/technologies')

function homeController(){
    return {
        async index(req, res) {
            const appareil = await Technologies.find()
            return res.render('home', {appareils : appareil })
        }
    }
}

module.exports = homeController