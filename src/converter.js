import OpenAI from "openai";

export async function componentConverter(component, apiKey) {
  const template = `import type { Meta, StoryObj } from '@storybook/react';\n//import component\nconst meta: Meta<//type of component> = {\n title: //title of component,\n component: //component\n};\nexport default meta;\ntype Story = StoryObj<//type of component>;\nconst StoryTemplate: Story = {\n render: (args) => //render component\n};\nexport Primary = {\n ...StoryTemplate,\n args: {\n //add component's props\n}\n}\n`;
  const prompt = `Write a Storybook component from a React component, without any comments added. Here's the input code for the react component:\n{${component}}\nThis is the template I want you to use to create the storybook component, keep the provided format, add component variants if possible:\n{${template}}\n`;

  const openai = new OpenAI({
    apiKey: apiKey,
  });
  
  const response = await openai.completions.create({
    model: "text-davinci-003",
    prompt,
    max_tokens: 1024,
    temperature: 0.7,
    top_p: 1.0,
    n: 1,
    frequency_penalty: 1,
    presence_penalty: 0.5,
  });

  return response.choices[0].text;
}
