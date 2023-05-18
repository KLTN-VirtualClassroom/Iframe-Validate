import CourseModel from "../model/Course.model.js";
import axios from 'axios';

export async function getCourse(){
    try {
        return await CourseModel.find().lean();
      } catch (error) {
        throw new APIError(500, error.message);
      }
}
