import { exec } from "child_process";
import getClient from "./client.js";

const getModels = async (apiType = "openai") => {
  if (apiType === "openai") {
    const models = await getClient("openai").models.list();
    const modelIds = models.data
      .filter((model) => model.id.includes("gpt"))
      .map((el) => el.id);
    return modelIds;
  } else if (apiType === "ollama") {
    return new Promise((resolve, reject) => {
      exec("ollama list", (error, stdout, stderr) => {
        if (error) {
          reject(`Error: ${stderr}`);
        } else {
          const models = stdout.split("\n").filter((line) => line.includes("gpt"));
          resolve(models);
        }
      });
    });
  }
};

export default getModels;
