import {Router} from 'express';
import * as MaterialController from '../Material/Material.controller.js'
// import MaterialSchema from '../model/Material.model.js';

const router = new Router();

router.route('/getPersonalMaterial').get(MaterialController.getPersonalMaterial);
router.route('/getTopicMaterial').get(MaterialController.getTopicMaterial);

// router.route('/post').post(MaterialController.getListMaterial);




export default router;
