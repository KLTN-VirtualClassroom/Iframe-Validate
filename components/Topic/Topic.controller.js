import mongoose from "mongoose";
import * as TopicService from "../Topic/Topic.service.js";


export async function getTopicByCourse(req, res, next) {
  try {
    const payload = await TopicService.getTopicByCourse();
    //console.log(payload);
    return res.json(payload);
  } catch (error) {
    return res.sendStatus(401);
  }
}

