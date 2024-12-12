import { getOpenAIClient, getOllamaClient } from "./client.js";

const getModels = async (apiType = "openai") => {
  if (apiType === "ollama") {
    const models = await getOllamaClient().list();
    const modelsId = models.models.map((model) => model.name);
    return modelsId;
  } else {
    const models = await getOpenAIClient().models.list();
    const modelsId = models.data
      .filter((model) => model.id.includes("gpt") && !model.id.includes("gpt-4-vision"))
      .map((el) => el.id);
    return modelsId;
  }
};

export default getModels;
