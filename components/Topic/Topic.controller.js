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

export async function getTopicById(req, res, next) {
  try {
    console.log(req.body)
    const payload = await TopicService.getTopicById(req.body.topicId);
    //console.log(payload);
    return res.json(payload);
  } catch (error) {
    return res.sendStatus(401);
  }
}

