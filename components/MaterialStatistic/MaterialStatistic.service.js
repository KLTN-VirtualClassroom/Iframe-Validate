import MaterialStatisticModel from "../model/MaterialStatistic.model.js";
import axios from "axios";

export async function getMaterialStatistic() {
  try {
    return await MaterialStatisticModel.find({}).lean();
  } catch (error) {
    throw new APIError(500, error.message);
  }
}

export async function addMaterialStatistic(data) {
  try {
    return await MaterialStatisticModel.create(data);
  } catch (error) {
    throw new APIError(500, error.message);
  }
}
