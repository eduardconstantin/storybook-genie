import OpenAI from "openai";

const getClient = () => {
  const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
  });
  return openai;
};

export default getClient;
