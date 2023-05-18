import {Router} from 'express';
import * as TopicController from '../Topic/Topic.controller.js'
// import MaterialSchema from '../model/Material.model.js';

const router = new Router();

router.route('/getTopicByCourse').get(TopicController.getTopicByCourse);




export default router;
