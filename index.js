#!/usr/bin/env node

import { readFileSync, writeFileSync } from "fs";
import dotenv from "universal-dotenv";
import { componentConverter } from "./src/converter.js";
import { fileSelector } from "./src/selector.js";
import path from "path";
import beautify from "js-beautify";
import chalk from "chalk";

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
    const frame = chalk.magenta.bold(animationFrames[currentFrame]);
    process.stdout.write(`\r${frame} ${chalk.bold(message)}`);
    currentFrame = (currentFrame + 1) % animationFrames.length;
  }, 100);

  const stopLoading = (message) => {
    clearInterval(loadingInterval);
    process.stdout.write("\r\x1B[K\x1B[?25h");
    process.stdout.write(chalk.green.bold(`${message}\n`));
  };

  return { stopLoading: stopLoading };
};

async function run() {
  await fileSelector({
    message: "Select the file containing the react compontent:",
  }).then(async (file) => {
    if (!file) return;
    const input = readFileSync(file, "utf-8");
    const extension = path.extname(file);
    const spinner = showLoading("Generating story...");
    const story = await componentConverter(input.replace(/^\s*[\r\n]/gm, "").trim(), process.env.OPENAI_API_KEY).then(
      (story) => {
        story = beautify(story, resetOptions);
        return beautify(story, options);
      }
    );
    writeFileSync(file.replace(extension, `.story${extension}`), story);
    spinner.stopLoading("Story generated!");
  });
}

await run();
