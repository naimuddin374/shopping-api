const router = require('express').Router()
const { validObjectId, authenticate } = require('../middleware')

const { list, getById, insert, remove, update, getByCatId, getBySubCatId, getBySearch } = require('../controllers/productController')


router.get('/getByCatId/:id', validObjectId, getByCatId)
router.get('/getBySubCatId/:id', validObjectId, getBySubCatId)
router.get('/getBySearch', getBySearch)
router.post('/', insert)
router.get('/', list)
router.get('/:id', validObjectId, getById)
router.put('/:id', validObjectId, update)
router.delete('/:id', validObjectId, remove)

module.exports = router
