import {Router} from 'express';
import * as UserController from '../User/User.controller.js'
import UserSchema from '../model/User.model.js';

const router = new Router();

router.route('/getList').get(UserController.getListUser);



export default router;
