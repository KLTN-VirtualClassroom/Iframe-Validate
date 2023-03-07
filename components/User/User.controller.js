import mongoose from 'mongoose';
import * as UserService from '../User/User.service.js';
export async function getListUser(req,res, next){
    try {
        // const { page, skip, limit } = pagingQuery(req);
        const payload = await UserService.getListUser();
        //console.log(payload)
        return res.json(payload);
      } catch (error) {
        return res.sendStatus(401);
      }
}