import mongoose from "mongoose";
import * as MaterialStatisticService from "../MaterialStatistic/MaterialStatistic.service.js";
export async function getMaterialStatistic(req, res, next) {
  try {
    const payload = await MaterialStatisticService.getMaterialStatistic();
    //console.log(payload);
    return res.json(payload);
  } catch (error) {
    return res.sendStatus(401);
  }
}

export async function addMaterialStatistic(req, res, next) {
  try {
    const payload = await MaterialStatisticService.addMaterialStatistic(
      req.body
    );
    return res.json(payload);
  } catch (error) {
    return res.sendStatus(401);
  }
}
