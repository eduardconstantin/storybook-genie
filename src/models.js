import getClient from "./client.js";

const getModels = async () => {
  const models = await getClient().models.list();
  const modelsId = models.data
    .filter((model) => model.id.includes("gpt") && !model.id.includes("gpt-4-vision"))
    .map((el) => el.id);
  return modelsId;
};

export default getModels;
