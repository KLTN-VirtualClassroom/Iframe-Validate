import UserModel from "../model/User.model.js";

export async function getListUser(){
    try {
        return await UserModel.find();
      } catch (error) {
        throw new APIError(500, error.message);
      }
}