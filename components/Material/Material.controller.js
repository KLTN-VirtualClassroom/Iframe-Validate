import mongoose from "mongoose";
import * as MaterialService from "../Material/Material.service.js";
export async function getPersonalMaterial(req, res, next) {
  try {
    const teacherID = req.query.teacherID;
    const payload = await MaterialService.getPersonalMaterial(teacherID);
    //console.log(payload);
    return res.json(payload);
  } catch (error) {
    return res.sendStatus(401);
  }
}

export async function getTopicMaterial(req, res, next) {
  try {
    const payload = await MaterialService.getTopicMaterial();
    //console.log(payload);
    return res.json(payload);
  } catch (error) {
    return res.sendStatus(401);
  }
}

export async function uploadMaterial(req, res, next) {
  try {
    //const teacherID = req.body.teacherID;
    const data = req.files.Myfile;
    console.log(data);
    //const payload = await MaterialService.uploadMaterial(data);
    console.log(payload)
    return res.json(payload);
  } catch (error) {
    return res.sendStatus(401);
  }
}
