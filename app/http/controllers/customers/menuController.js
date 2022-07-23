const Technologies = require('../../../models/technologies')

function MenuController(){
    return {
        async index(req, res) {
            const appareil = await Technologies.find()
            return res.render('customers/menu', {appareils : appareil })
        }
    }
}

module.exports = MenuController