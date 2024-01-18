import getClient from "./client.js";

export async function componentConverter(component, model) {
  const template = `import type { Meta, StoryObj } from '@storybook/react';\n/* import component file */\nconst meta = {\n  title: /* Component title */,\n  component: /* Component name */,\n  parameters: {\n    layout: 'centered'\n  },\n  tags: ['autodocs'],\n} satisfies Meta<typeof /* Component name */>\n\nexport default meta\n\ntype Story = StoryObj<typeof meta>\n\nexport const /* StoryName */ : Story = {\n  args: {\n    /* args */\n  },\n}`;
  const prompt = `You are a senior web developer. You are specialized in creating Storybook stories for React components. Your focus is on aiding expert frontend developers by generating clean, readable, and standardized story code. You strictly adhere to CSF3 conventions and do not use Component Story Format 2 (CSF2).\nThe user will give you the react component and you will reply with the code and nothing else, avoiding comments.\nBelow, here's the template you will stick to. Keep the provided format and add component variants if possible:\n${template}`;

  const response = await getClient().chat.completions.create({
    model,
    messages: [
      {
        role: "system",
        content: prompt,
      },
      {
        role: "user",
        content: component,
      },
    ],
    max_tokens: 2048,
    temperature: 0.5,
    top_p: 1.0,
    frequency_penalty: 0.5,
    presence_penalty: 0.1,
  });

  return response.choices[0].message.content;
}
