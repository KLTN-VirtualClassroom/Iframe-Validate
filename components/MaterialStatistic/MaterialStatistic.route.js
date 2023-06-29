import {Router} from 'express';
import * as MaterialStatisticController from '../MaterialStatistic/MaterialStatistic.controller.js'
// import MaterialSchema from '../model/Material.model.js';

const router = new Router();

router.route('/getMaterialStatistic').get(MaterialStatisticController.getMaterialStatistic);
router.route('/addMaterialStatistic').post(MaterialStatisticController.addMaterialStatistic);


export default router;
