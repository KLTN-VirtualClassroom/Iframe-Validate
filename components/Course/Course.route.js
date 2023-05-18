import {Router} from 'express';
import * as CourseController from '../Course/Course.controller.js'
// import MaterialSchema from '../model/Material.model.js';

const router = new Router();

router.route('/getCourse').get(CourseController.getCourse);




export default router;
