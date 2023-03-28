import MaterialModel from "../model/Material.model.js";

export async function getPersonalMaterial(teacherID){
    try {
        return await MaterialModel.find({teacherID}).lean();
      } catch (error) {
        throw new APIError(500, error.message);
      }
}

export async function getTopicMaterial(){
    try {
        return await MaterialModel.find({teacherID: "TC000"}).lean();
      } catch (error) {
        throw new APIError(500, error.message);
      }
}