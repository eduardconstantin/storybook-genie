#!/usr/bin/env node

import path from "path";
import { glob } from "glob";
import { readFileSync, writeFileSync, existsSync } from "fs";
import dotenv from "universal-dotenv";
import beautify from "js-beautify";
import { componentConverter } from "./src/converter.js";
import { fileSelector } from "./src/selector.js";
import inquirer from "inquirer";
import getModels from "./src/models.js";

const options = {
  indent_size: 2,
  jslint_happy: true,
  end_with_newline: false,
  e4x: true,
};

const resetOptions = {
  e4x: true,
  preserve_newlines: false,
  indent_level: 0,
  indent_size: 0,
};

dotenv.init();

const showLoading = (message) => {
  const animationFrames = ["⠋", "⠉", "⠙", "⠹", "⠸", "⠼", "⠴", "⠦", "⠧", "⠇", "⠏"];
  let currentFrame = 0;

  process.stdout.write("\x1B[?25l");

  const loadingInterval = setInterval(() => {
    const frame = "\x1b[35m\x1b[1m" + animationFrames[currentFrame] + "\x1b[0m";
    process.stdout.write(`\r${frame} \x1b[1m${message}\x1b[0m`);
    currentFrame = (currentFrame + 1) % animationFrames.length;
  }, 100);

  const stopLoading = (message, color) => {
    clearInterval(loadingInterval);
    process.stdout.write("\r\x1B[K\x1B[?25h");
    process.stdout.write(`${color}\x1b[1m${message}\n\x1b[0m`);
  };

  return { stopLoading };
};

async function run() {
  const configPath = path.resolve(process.cwd(), "storybook-genie.config.json");
  let model;
  let basePath;
  let template;

  if (existsSync(configPath)) {
    const data = fs.readFileSync(configPath);
    const config = JSON.parse(data);
    if (config.defaultModel) {
      model = config.defaultModel;
      basePath = config.defaultPath;
    }
  }

  const templateFilePath = glob.sync("storybook-genie.template.*")[0];
  if (templateFilePath) {
    const data = readFileSync(templateFilePath, "utf8");
    template = data.trim();
  }

  if (!model) {
    const answer = await inquirer.prompt([
      {
        type: "list",
        message: "Select the AI model you want to use",
        name: "model",
        choices: await getModels(),
      },
    ]);
    model = answer.model;
  }
  await fileSelector({
    message: "Select the file containing the react compontent:",
    basePath,
  }).then(async (file) => {
    if (!file) return;
    const input = readFileSync(file, "utf-8");
    const extension = path.extname(file);
    const spinner = showLoading("Generating story...");
    try {
      const story = await componentConverter(input.replace(/^\s*[\r\n]/gm, "").trim(), model, template).then(
        (story) => {
          story = beautify(story, resetOptions);
          return beautify(story, options);
        }
      );
      writeFileSync(file.replace(extension, `.story${extension}`), story);
      spinner.stopLoading("Story generated!", "\x1b[32m");
    } catch (error) {
      spinner.stopLoading("Error generating story: " + error.message, "\x1b[91m");
    }
  });
}

await run();
