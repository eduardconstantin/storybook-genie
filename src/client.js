import OpenAI from "openai";
import { exec } from "child_process";

const getClient = (apiType = "openai") => {
  if (apiType === "openai") {
    const openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });
    return openai;
  } else if (apiType === "ollama") {
    return {
      runOllamaModel: (model, prompt) => {
        return new Promise((resolve, reject) => {
          exec(`ollama run ${model} --prompt "${prompt}"`, (error, stdout, stderr) => {
            if (error) {
              reject(`Error: ${stderr}`);
            } else {
              resolve(stdout);
            }
          });
        });
      }
    };
  }
};

export default getClient;
