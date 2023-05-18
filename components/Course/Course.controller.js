import mongoose from "mongoose";
import * as CourseService from "../Course/Course.service.js";


export async function getCourse(req, res, next) {
  try {
    const payload = await CourseService.getCourse();
    //console.log(payload);
    return res.json(payload);
  } catch (error) {
    return res.sendStatus(401);
  }
}

