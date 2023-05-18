import TopicModel from "../model/Topic.model.js";
import axios from 'axios';

export async function getTopicByCourse(){
    try {
        return await TopicModel.find().lean();
      } catch (error) {
        throw new APIError(500, error.message);
      }
}
