import TopicModel from "../model/Topic.model.js";
import axios from 'axios';

export async function getTopicByCourse(){
    try {
        return await TopicModel.find().lean();
      } catch (error) {
        throw new APIError(500, error.message);
      }
}

export async function getTopicById(id){
  try {
      return await TopicModel.find({topicId: "fa5114f5-a2a0-4c7f-8db2-e1fdc1154b08"}).lean();
    } catch (error) {
      throw new APIError(500, error.message);
    }
}
