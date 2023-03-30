import MaterialModel from "../model/Material.model.js";
import axios from 'axios';

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

export async function uploadMaterial(data){
     axios
      .post("https://bangtrang.click/api/documents", data, {
        headers: {
          'Content-Type': "application/pdf",
          Authorization: "Token token=secret",
        },
      }).then(function (response) {
         //console.log(response)
          return {status: "success"};
      }) .catch(function (error) {
        //console.log()

        return {status: 'upload failed'}
      });
}